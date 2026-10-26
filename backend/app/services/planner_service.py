"""
StudyBuddy AI - Intelligent Study Planner Service
Synthesizes personalized preparation schedules, balancing subject priorities,
difficulty tiers, revision blocks, and practice checkpoints leading to target exams.
"""

import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session

from app.config import settings
from app.services.groq_service import groq_service
from app.database.models import StudyPlanModel, ActivityLogModel
from app.models.schemas import (
    StudyPlanGenerateRequest,
    StudyPlanResponse,
    StudySessionBlock,
    StudySubjectInput,
    StudyBlockToggleRequest,
)

logger = logging.getLogger("studybuddy.planner")


class PlannerService:
    def generate_plan(self, db: Session, req: StudyPlanGenerateRequest) -> StudyPlanResponse:
        """
        Validates target exam date, computes available days, and creates an optimized schedule.
        """
        try:
            target_dt = datetime.strptime(req.exam_date, "%Y-%m-%d").date()
        except ValueError:
            raise ValueError("Invalid date format. Expected YYYY-MM-DD.")

        today = datetime.utcnow().date()
        days_until_exam = (target_dt - today).days

        if days_until_exam <= 0:
            raise ValueError("Target examination date must be at least 1 day in the future.")

        # Limit schedule projection to min(days_until_exam, 14) for practical actionable planning
        planning_days = min(days_until_exam, 14)

        schedule_blocks: List[StudySessionBlock] = []

        if settings.is_groq_configured():
            subjects_desc = ", ".join(
                [f"{s.name} (Priority: {s.priority}, Difficulty: {s.difficulty})" for s in req.subjects]
            )
            prompt = (
                f"You are an academic coach. Build a high-efficiency study timetable for the upcoming '{req.target_exam}' exam.\n"
                f"Days remaining: {days_until_exam} days (Generate a detailed {planning_days}-day initial roadmap).\n"
                f"Daily study budget: {req.available_hours_per_day} hours/day.\n"
                f"Subjects to cover: {subjects_desc}.\n\n"
                "Balance deep focus sessions (45-60 min), active recall revision sessions, practice quizzes, and 10-15 min breaks.\n"
                "Return ONLY a valid JSON array of session blocks with this schema:\n"
                "[\n"
                "  {\n"
                "    \"id\": \"block-1-1\",\n"
                "    \"day_number\": 1,\n"
                "    \"date_label\": \"Day 1\",\n"
                "    \"subject\": \"Subject Name\",\n"
                "    \"topic\": \"Specific subtopic or chapter to master\",\n"
                "    \"duration_minutes\": 50,\n"
                "    \"activity_type\": \"learning\" (or \"revision\", \"practice_quiz\", \"break\"),\n"
                "    \"completed\": false\n"
                "  }\n"
                "]\n"
                "Ensure output is strictly raw JSON array with no markdown backticks."
            )

            try:
                response = groq_service.create_chat_completion(
                    messages=[
                        {"role": "system", "content": "You are a study timetable planner. Return strictly raw JSON arrays."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.3,
                    max_tokens=3000,
                )
                raw_json = response.choices[0].message.content.strip()

                if raw_json.startswith("```json"):
                    raw_json = raw_json[7:]
                elif raw_json.startswith("```"):
                    raw_json = raw_json[3:]
                if raw_json.endswith("```"):
                    raw_json = raw_json[:-3]
                raw_json = raw_json.strip()

                parsed = json.loads(raw_json)
                if isinstance(parsed, list):
                    for idx, item in enumerate(parsed):
                        if not item.get("id"):
                            item["id"] = f"block-{item.get('day_number', 1)}-{idx + 1}"
                        item["completed"] = False
                        schedule_blocks.append(StudySessionBlock(**item))

            except Exception as e:
                logger.error("Error generating study plan with Groq: %s", str(e))
                schedule_blocks = self._build_deterministic_schedule(req, planning_days, today)
        else:
            schedule_blocks = self._build_deterministic_schedule(req, planning_days, today)

        # Store study plan
        plan_record = StudyPlanModel(
            title=f"Preparation Roadmap: {req.target_exam}",
            target_exam=req.target_exam,
            exam_date=req.exam_date,
            available_hours_per_day=req.available_hours_per_day,
            subjects_json=[s.model_dump() for s in req.subjects],
            schedule_json=[b.model_dump() for b in schedule_blocks],
        )
        db.add(plan_record)
        db.commit()
        db.refresh(plan_record)

        activity = ActivityLogModel(
            activity_type="plan",
            title=f"Generated Study Plan: {req.target_exam}",
            description=f"Scheduled {len(schedule_blocks)} sessions across {planning_days} days.",
            details_json={"plan_id": plan_record.id, "days": planning_days},
        )
        db.add(activity)
        db.commit()

        return StudyPlanResponse(
            id=plan_record.id,
            title=plan_record.title,
            target_exam=plan_record.target_exam,
            exam_date=plan_record.exam_date,
            available_hours_per_day=plan_record.available_hours_per_day,
            subjects=req.subjects,
            schedule=schedule_blocks,
            completion_percentage=0.0,
            created_at=plan_record.created_at,
        )

    def toggle_block(self, db: Session, req: StudyBlockToggleRequest) -> StudyPlanResponse:
        """Toggles the completion status of an individual session block in the plan."""
        plan = db.query(StudyPlanModel).filter(StudyPlanModel.id == req.plan_id).first()
        if not plan:
            raise ValueError(f"Study plan {req.plan_id} not found.")

        blocks = plan.schedule_json
        found = False
        completed_count = 0

        for b in blocks:
            if b.get("id") == req.block_id:
                b["completed"] = req.completed
                found = True
            if b.get("completed"):
                completed_count += 1

        if not found:
            raise ValueError(f"Block ID {req.block_id} not found in plan {req.plan_id}")

        plan.schedule_json = blocks
        db.commit()

        completion_pct = round((completed_count / len(blocks)) * 100.0, 1) if blocks else 0.0

        subjects = [StudySubjectInput(**s) for s in plan.subjects_json]
        schedule_blocks = [StudySessionBlock(**b) for b in blocks]

        return StudyPlanResponse(
            id=plan.id,
            title=plan.title,
            target_exam=plan.target_exam,
            exam_date=plan.exam_date,
            available_hours_per_day=plan.available_hours_per_day,
            subjects=subjects,
            schedule=schedule_blocks,
            completion_percentage=completion_pct,
            created_at=plan.created_at,
        )

    def _build_deterministic_schedule(
        self,
        req: StudyPlanGenerateRequest,
        days: int,
        start_date: datetime.date
    ) -> List[StudySessionBlock]:
        """Constructs an algorithmic, pedagogically sound schedule."""
        blocks = []
        subject_list = req.subjects

        # Sort subjects: High priority first, Hard difficulty first
        priority_weight = {"High": 3, "Medium": 2, "Low": 1}
        difficulty_weight = {"Hard": 3, "Medium": 2, "Easy": 1}
        sorted_subjects = sorted(
            subject_list,
            key=lambda s: (priority_weight.get(s.priority, 2) * 2 + difficulty_weight.get(s.difficulty, 2)),
            reverse=True,
        )

        for day in range(1, days + 1):
            day_date = start_date + timedelta(days=day - 1)
            date_label = day_date.strftime("%a, %b %d")

            subj = sorted_subjects[(day - 1) % len(sorted_subjects)]

            # Morning / Session 1: Deep focus
            blocks.append(
                StudySessionBlock(
                    id=f"b-{day}-1",
                    day_number=day,
                    date_label=date_label,
                    subject=subj.name,
                    topic=f"Core Concepts & Architecture ({subj.difficulty})",
                    duration_minutes=50,
                    activity_type="learning",
                    completed=False,
                )
            )

            # Mid session break
            blocks.append(
                StudySessionBlock(
                    id=f"b-{day}-2",
                    day_number=day,
                    date_label=date_label,
                    subject="Rest Interval",
                    topic="Hydration & Cognitive Recovery",
                    duration_minutes=15,
                    activity_type="break",
                    completed=False,
                )
            )

            # Session 2: Alternates between active revision and practice quiz
            act_type = "practice_quiz" if day % 2 == 0 else "revision"
            act_topic = f"Practice Examination & Problem Solving" if act_type == "practice_quiz" else f"Active Recall & Flashcard Drill"
            blocks.append(
                StudySessionBlock(
                    id=f"b-{day}-3",
                    day_number=day,
                    date_label=date_label,
                    subject=subj.name,
                    topic=act_topic,
                    duration_minutes=45,
                    activity_type=act_type,
                    completed=False,
                )
            )

        return blocks


planner_service = PlannerService()
