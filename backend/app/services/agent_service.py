"""
StudyBuddy AI - Autonomous Learning Agent Service
Coordinates multi-turn reasoning, tool calling, grounding in uploaded documents,
and adaptive pedagogical study modes using the Groq Python SDK.
"""

import json
import uuid
import logging
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from sqlalchemy.orm import Session

from app.config import settings
from app.services.groq_service import groq_service, GroqConfigError
from app.services.document_service import document_service
from app.tools.agent_tools import AGENT_TOOL_DEFINITIONS, ToolExecutionEngine
from app.database.models import (
    ChatSessionModel,
    ChatMessageModel,
    ActivityLogModel,
)
from app.models.schemas import (
    ChatMessageResponse,
    ToolInvocationRecord,
    CitationItem,
)

logger = logging.getLogger("studybuddy.agent")

STUDY_MODE_PROMPTS = {
    "explain_simply": (
        "You are StudyBuddy AI in 'Explain Simply' mode. Your goal is to make complex ideas intuitively obvious. "
        "Use everyday real-world analogies, straightforward visual descriptions, and clear language without gratuitous jargon. "
        "Keep explanations engaging and approachable."
    ),
    "exam_prep": (
        "You are StudyBuddy AI in 'Exam Preparation' mode. Focus relentlessly on high-yield exam material, key scoring phrases, "
        "common pitfalls students make, likely exam questions, and structured bullet points designed for maximum marks."
    ),
    "deep_dive": (
        "You are StudyBuddy AI in 'Technical Deep Dive' mode. Provide rigorous, comprehensive technical depth. "
        "Include architectural trade-offs, formal terminology, underlying theory, algorithmic complexity, and edge cases."
    ),
    "socratic_tutor": (
        "You are StudyBuddy AI in 'Socratic Tutor' mode. Rather than immediately dumping the complete answer, guide the student "
        "step-by-step through inquiry, asking thought-provoking follow-up questions and giving hints to foster true independent understanding."
    ),
    "quick_revision": (
        "You are StudyBuddy AI in 'Quick Revision' mode. Be concise, punchy, and structured. "
        "Provide bullet points, summary tables, key definitions, and essential formulas perfect for last-minute cramming."
    ),
}


class AgentService:
    def get_or_create_session(self, db: Session, session_id: Optional[str] = None, study_mode: str = "explain_simply") -> ChatSessionModel:
        if session_id:
            session = db.query(ChatSessionModel).filter(ChatSessionModel.id == session_id).first()
            if session:
                return session

        new_id = session_id or uuid.uuid4().hex[:16]
        session = ChatSessionModel(
            id=new_id,
            title="Study Session",
            study_mode=study_mode,
        )
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    def run_agent_loop(
        self,
        db: Session,
        user_message: str,
        session_id: Optional[str] = None,
        study_mode: str = "explain_simply",
        use_agent_tools: bool = True,
        document_id: Optional[int] = None,
    ) -> ChatMessageResponse:
        """
        Executes the agent loop:
        1. Loads history & formats prompt.
        2. Proactively searches uploaded documents if relevant.
        3. Calls Groq with tools.
        4. Executes tools up to MAX_ITERATIONS.
        5. Saves user and assistant messages with citations and tool call history.
        """
        session = self.get_or_create_session(db, session_id, study_mode)
        session.study_mode = study_mode

        # Check if Groq is configured
        if not settings.is_groq_configured():
            mock_warning = (
                "⚠️ **Groq API Key Not Configured**\n\n"
                "StudyBuddy AI is currently running in local demonstration mode because no valid `GROQ_API_KEY` was detected in the environment.\n\n"
                "To enable live AI inference and tool calling:\n"
                "1. Create a free API key at [console.groq.com](https://console.groq.com)\n"
                "2. Add your key to `.env` or set the environment variable: `GROQ_API_KEY=gsk_...`\n"
                "3. Restart the backend service.\n\n"
                f"**Your question was:** *\"{user_message}\"*\n\n"
                "Once your key is connected, StudyBuddy AI will provide full multi-modal responses, passage retrieval, and dynamic learning tools!"
            )
            # Save message to session
            msg_user = ChatMessageModel(
                session_id=session.id,
                role="user",
                content=user_message,
                study_mode=study_mode,
            )
            msg_ai = ChatMessageModel(
                session_id=session.id,
                role="assistant",
                content=mock_warning,
                study_mode=study_mode,
            )
            db.add(msg_user)
            db.add(msg_ai)
            db.commit()

            return ChatMessageResponse(
                session_id=session.id,
                response=mock_warning,
                study_mode=study_mode,
                tool_invocations=[],
                citations=[],
                created_at=datetime.utcnow(),
            )

        # Assemble conversation history
        history_msgs = (
            db.query(ChatMessageModel)
            .filter(ChatMessageModel.session_id == session.id)
            .order_by(ChatMessageModel.created_at)
            .all()
        )

        mode_prompt = STUDY_MODE_PROMPTS.get(study_mode, STUDY_MODE_PROMPTS["explain_simply"])
        system_prompt = (
            f"{mode_prompt}\n\n"
            "You are equipped with specialized study tools (search_study_documents, summarize_document, generate_quiz, etc.). "
            "When the user asks questions regarding study materials, search for relevant passages using `search_study_documents` to ground your response. "
            "When citing information, mention the document name and page number if available. Always be encouraging, insightful, and pedagogical."
        )

        messages: List[Dict[str, Any]] = [
            {"role": "system", "content": system_prompt}
        ]

        # Append past 6 messages for context
        for m in history_msgs[-6:]:
            messages.append({"role": m.role, "content": m.content})

        # Append current user prompt
        messages.append({"role": "user", "content": user_message})

        tool_records: List[ToolInvocationRecord] = []
        accumulated_citations: List[CitationItem] = []

        # If specific document_id is provided, automatically fetch top passages
        if document_id is not None:
            prelim_citations = document_service.retrieve_relevant_passages(
                db=db,
                query=user_message,
                top_k=3,
                document_id=document_id,
            )
            if prelim_citations:
                accumulated_citations.extend(prelim_citations)
                context_snippet = "\n---\n".join(
                    [f"[{c.document_name} - Page {c.page_number}]: {c.snippet}" for c in prelim_citations]
                )
                messages.append({
                    "role": "system",
                    "content": f"Relevant passages retrieved from target document:\n{context_snippet}"
                })

        # Multi-turn tool calling loop
        tools_to_pass = AGENT_TOOL_DEFINITIONS if use_agent_tools else None
        current_iteration = 0
        final_text = ""

        while current_iteration < settings.max_agent_tool_iterations:
            current_iteration += 1

            try:
                response = groq_service.create_chat_completion(
                    messages=messages,
                    tools=tools_to_pass,
                    tool_choice="auto" if use_agent_tools else None,
                )
            except GroqConfigError as gce:
                final_text = f"⚠️ Configuration Error: {str(gce)}"
                break
            except Exception as e:
                logger.error("Error during Groq completion call: %s", str(e))
                final_text = f"⚠️ Error communicating with Groq AI: {str(e)}"
                break

            response_message = response.choices[0].message
            tool_calls = getattr(response_message, "tool_calls", None)

            if not tool_calls:
                # No more tools called, model returned final text
                final_text = response_message.content or ""
                break

            # Process tool calls
            # Add assistant message with tool calls to conversation
            messages.append({
                "role": "assistant",
                "content": response_message.content or "",
                "tool_calls": [
                    {
                        "id": tc.id,
                        "type": "function",
                        "function": {
                            "name": tc.function.name,
                            "arguments": tc.function.arguments,
                        }
                    }
                    for tc in tool_calls
                ]
            })

            for tc in tool_calls:
                func_name = tc.function.name
                func_args = tc.function.arguments

                logger.info("Agent invoked tool '%s' with args: %s", func_name, func_args)
                tool_output = ToolExecutionEngine.execute_tool(
                    tool_name=func_name,
                    arguments_json=func_args,
                    db=db,
                )

                # Record for frontend visualization
                parsed_args = {}
                try:
                    parsed_args = json.loads(func_args)
                except Exception:
                    pass

                tool_records.append(
                    ToolInvocationRecord(
                        tool_name=func_name,
                        arguments=parsed_args,
                        result=tool_output,
                        status=tool_output.get("status", "success"),
                    )
                )

                # If tool was search_study_documents, record citations
                if func_name == "search_study_documents" and "results" in tool_output:
                    for res in tool_output["results"]:
                        citation = CitationItem(**res)
                        if not any(c.chunk_index == citation.chunk_index and c.document_id == citation.document_id for c in accumulated_citations):
                            accumulated_citations.append(citation)

                # Append tool response message
                messages.append({
                    "role": "tool",
                    "tool_call_id": tc.id,
                    "name": func_name,
                    "content": json.dumps(tool_output),
                })

        # Save user message and assistant message to database
        user_record = ChatMessageModel(
            session_id=session.id,
            role="user",
            content=user_message,
            study_mode=study_mode,
        )
        assistant_record = ChatMessageModel(
            session_id=session.id,
            role="assistant",
            content=final_text,
            study_mode=study_mode,
            tool_calls_json=[tr.model_dump() for tr in tool_records],
            citations_json=[c.model_dump() for c in accumulated_citations],
        )

        # Log activity
        activity = ActivityLogModel(
            activity_type="chat",
            title=f"Question in '{study_mode.replace('_', ' ').title()}' mode",
            description=user_message[:100],
            details_json={"session_id": session.id, "tools_used": len(tool_records)},
        )

        # Update session title if first message
        if len(history_msgs) == 0:
            session.title = user_message[:40] + ("..." if len(user_message) > 40 else "")

        db.add(user_record)
        db.add(assistant_record)
        db.add(activity)
        db.commit()

        return ChatMessageResponse(
            session_id=session.id,
            response=final_text,
            study_mode=study_mode,
            tool_invocations=tool_records,
            citations=accumulated_citations,
            created_at=datetime.utcnow(),
        )


agent_service = AgentService()
