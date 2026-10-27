import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  GraduationCap,
  Binary,
  Brain,
  Zap,
  Terminal,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { ChatMessage, DocumentInfo } from '../types';
import { PROJECT_METADATA } from '../constants/metadata';

interface AssistantPageProps {
  initialQuery?: string;
  onClearInitialQuery?: () => void;
}

export const AssistantPage: React.FC<AssistantPageProps> = ({
  initialQuery,
  onClearInitialQuery,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [studyMode, setStudyMode] = useState<string>('explain_simply');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedToolIndex, setExpandedToolIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    // Load documents list for optional targeting
    api.listDocuments()
      .then((res) => {
        setDocuments(res.documents);
      })
      .catch((err) => console.error(err));

    // Initial greeting
    setMessages([
      {
        role: 'assistant',
        content:
          "Welcome to **StudyBuddy AI**. I am your adaptive academic tutor backed by Groq LLaMA 3.3.\n\n" +
          "Choose a pedagogical study mode below to steer my reasoning, or attach an ingested textbook to ground responses with verifiable page citations.\n\n" +
          "What concept, algorithm, or syllabus topic would you like to explore today?",
        study_mode: 'explain_simply',
      },
    ]);
  }, []);

  // Handle initialQuery if passed from 3D concept map or landing page
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      handleSendMessage(initialQuery);
      if (onClearInitialQuery) {
        onClearInitialQuery();
      }
    }
  }, [initialQuery]);

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputMessage;
    if (!promptToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: promptToSend,
      study_mode: studyMode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const resp = await api.sendChatMessage({
        message: promptToSend,
        study_mode: studyMode,
        session_id: sessionId,
        document_id: selectedDocId,
        use_agent_tools: true,
      });

      setSessionId(resp.session_id);

      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: resp.response,
        study_mode: resp.study_mode,
        tool_invocations: resp.tool_invocations,
        citations: resp.citations,
        created_at: resp.created_at,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `⚠️ **Error communicating with StudyBuddy AI:** ${
          err.message || 'Unknown network error. Ensure backend is running.'
        }`,
        study_mode: studyMode,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSession = () => {
    setSessionId(undefined);
    setMessages([
      {
        role: 'assistant',
        content:
          "New conversation thread initialized. What topic, theorem, or question shall we study?",
        study_mode: studyMode,
      },
    ]);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const samplePrompts = [
    "Explain how Virtual Memory and Demand Paging function with a physical analogy",
    "What are common university exam questions on Dijkstra's Shortest Path Algorithm?",
    "Give me an architectural breakdown of Raft consensus leader election",
    "Test my understanding of TCP flow control vs congestion control",
  ];

  const getModeIcon = (modeId: string) => {
    switch (modeId) {
      case 'explain_simply':
        return <Sparkles className="w-3.5 h-3.5" />;
      case 'exam_prep':
        return <GraduationCap className="w-3.5 h-3.5" />;
      case 'deep_dive':
        return <Binary className="w-3.5 h-3.5" />;
      case 'socratic_tutor':
        return <Brain className="w-3.5 h-3.5" />;
      case 'quick_revision':
        return <Zap className="w-3.5 h-3.5" />;
      default:
        return <Sparkles className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[640px] max-w-5xl mx-auto space-y-3">
      {/* 1. PEDAGOGICAL TOOLBAR */}
      <div className="surface-card p-3 sm:p-4 rounded-xl border border-[#E5E2D9] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C877D] shrink-0 font-semibold">
            Pedagogy:
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {PROJECT_METADATA.studyModes.map((mode) => {
              const isSelected = studyMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setStudyMode(mode.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    isSelected
                      ? 'bg-[#18181B] text-[#FAF9F5] shadow-xs'
                      : 'bg-[#FAF9F5] text-[#57534E] hover:text-[#18181B] border border-[#E5E2D9]'
                  }`}
                  title={mode.description}
                >
                  {getModeIcon(mode.id)}
                  <span>{mode.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Target Document Selector */}
          {documents.length > 0 && (
            <select
              value={selectedDocId || ''}
              onChange={(e) =>
                setSelectedDocId(e.target.value ? Number(e.target.value) : undefined)
              }
              className="text-xs bg-[#FAF9F5] border border-[#E5E2D9] rounded-md px-2.5 py-1 text-[#18181B] focus:outline-none focus:border-[#C25E34]"
            >
              <option value="">All Ingested Documents</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  📄 {d.original_name.slice(0, 24)}
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handleNewSession}
            className="p-1.5 rounded-md bg-[#FAF9F5] hover:bg-[#EAE7DF] text-[#57534E] hover:text-[#18181B] border border-[#E5E2D9] transition-colors"
            title="Reset Conversation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. CONVERSATIONAL STREAM */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 sm:pr-2">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div className="flex items-center gap-2 text-[11px] font-mono text-[#8C877D] px-1">
                {isUser ? (
                  <span>Student</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[#C25E34] font-medium">
                    <Sparkles className="w-3 h-3" />
                    <span>StudyBuddy AI • {msg.study_mode.replace('_', ' ')}</span>
                  </span>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[90%] sm:max-w-[82%] rounded-xl p-4 sm:p-5 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#18181B] text-[#FAF9F5] rounded-tr-none shadow-xs'
                    : 'surface-card border border-[#E5E2D9] text-[#18181B] rounded-tl-none space-y-3'
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-wrap font-ui">{msg.content}</div>

                {/* Inspectable Agent Tool Invocations */}
                {msg.tool_invocations && msg.tool_invocations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#E5E2D9] space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#57534E]">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <Terminal className="w-3.5 h-3.5 text-[#C25E34]" />
                        <span>Autonomous Tool Operations ({msg.tool_invocations.length})</span>
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {msg.tool_invocations.map((tool, tIdx) => {
                        const isExpanded = expandedToolIndex === tIdx;
                        return (
                          <div
                            key={tIdx}
                            className="rounded-lg bg-[#FAF9F5] border border-[#E5E2D9] text-xs font-mono overflow-hidden"
                          >
                            <button
                              onClick={() =>
                                setExpandedToolIndex(isExpanded ? null : tIdx)
                              }
                              className="w-full px-3 py-1.5 flex items-center justify-between text-left text-[#18181B] hover:bg-[#F3F1EC]"
                            >
                              <span className="text-[#C25E34] font-bold">
                                {tool.tool_name}()
                              </span>
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-[#8C877D]" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-[#8C877D]" />
                              )}
                            </button>
                            {isExpanded && (
                              <div className="p-3 bg-[#FAF9F5] border-t border-[#E5E2D9] space-y-2 text-[11px] text-[#57534E]">
                                <div>
                                  <span className="font-semibold text-[#18181B]">Arguments:</span>
                                  <pre className="text-[#18181B] overflow-x-auto mt-1 p-2 bg-[#F3F1EC] rounded border border-[#E5E2D9]">
                                    {JSON.stringify(tool.arguments, null, 2)}
                                  </pre>
                                </div>
                                <div>
                                  <span className="font-semibold text-[#18181B]">Execution Result:</span>
                                  <pre className="text-[#18181B] overflow-x-auto mt-1 p-2 bg-[#F3F1EC] rounded border border-[#E5E2D9]">
                                    {JSON.stringify(tool.result, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Grounded Footnote Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#E5E2D9] space-y-2">
                    <div className="text-[11px] font-mono text-[#57534E] flex items-center gap-1.5 font-semibold">
                      <BookOpen className="w-3.5 h-3.5 text-[#C25E34]" />
                      <span>Verified Textbook Passages:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.citations.map((c, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E5E2D9] text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between font-semibold text-[#18181B]">
                            <span className="truncate max-w-[180px]">
                              {c.document_name}
                            </span>
                            <span className="text-[#C25E34] text-[10px] font-mono">
                              p. {c.page_number}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#57534E] line-clamp-2 italic font-serif">
                            "{c.snippet}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Footer Actions */}
                {!isUser && (
                  <div className="flex items-center justify-end gap-2 pt-1 text-[#8C877D]">
                    <button
                      onClick={() => copyToClipboard(msg.content, index)}
                      className="inline-flex items-center gap-1 text-[11px] hover:text-[#18181B] transition-colors"
                      title="Copy response"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-3 h-3 text-[#2D5A43]" />
                          <span className="text-[#2D5A43]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2 text-xs font-mono text-[#57534E]">
            <div className="w-6 h-6 rounded-md bg-[#FAF9F5] border border-[#E5E2D9] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[#C25E34]" />
            </div>
            <div className="surface-card p-3 rounded-lg border border-[#E5E2D9] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#C25E34] animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-[#C25E34] animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-[#C25E34] animate-bounce [animation-delay:0.4s]" />
              <span className="ml-2 text-[#57534E]">
                Autonomous agent reasoning with Groq LLaMA 3.3...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. PROMPT RECOMMENDATIONS */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-2 shrink-0">
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs px-3 py-1.5 rounded-md bg-[#FAF9F5] hover:bg-[#F3F1EC] text-[#57534E] hover:text-[#18181B] border border-[#E5E2D9] transition-colors text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* 4. CLEAN INPUT COMPOSER */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="surface-card p-2 rounded-xl border border-[#E5E2D9] flex items-center gap-2 shrink-0 focus-within:border-[#C25E34] transition-colors shadow-xs"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Inquire in ${studyMode.replace('_', ' ')} mode...`}
          disabled={isLoading}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-[#18181B] placeholder-[#8C877D] focus:outline-none font-ui"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="px-4 py-2 rounded-lg btn-terracotta disabled:opacity-40 text-xs font-semibold shadow-xs flex items-center gap-1.5"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};

export default AssistantPage;
