import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Sparkles,
  CheckCircle2,
  Clock,
  Plus,
  Trash2,
  BookOpen,
  Coffee,
  RotateCcw,
  Award,
} from 'lucide-react';
import { api } from '../services/api';
import { StudyPlanData, StudySubject } from '../types';

export const PlannerPage: React.FC = () => {
  const [activePlan, setActivePlan] = useState<StudyPlanData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [targetExam, setTargetExam] = useState('University Semester Examination');
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [hoursPerDay, setHoursPerDay] = useState(3.0);
  const [subjects, setSubjects] = useState<StudySubject[]>([
    { name: 'Computer Networks', priority: 'High', difficulty: 'Hard' },
    { name: 'Compiler Design', priority: 'High', difficulty: 'Medium' },
    { name: 'Software Engineering', priority: 'Medium', difficulty: 'Easy' },
  ]);

  // Temporary new subject input
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjPriority, setNewSubjPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newSubjDifficulty, setNewSubjDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  useEffect(() => {
    api.getActiveStudyPlan().then(setActivePlan).catch(() => {});
  }, []);

  const handleAddSubject = () => {
    if (!newSubjName.trim()) return;
    setSubjects((prev) => [
      ...prev,
      { name: newSubjName.trim(), priority: newSubjPriority, difficulty: newSubjDifficulty },
    ]);
    setNewSubjName('');
  };

  const handleRemoveSubject = (idx: number) => {
    setSubjects((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetExam.trim() || subjects.length === 0 || isLoading) return;

    setIsLoading(true);
    try {
      const plan = await api.generateStudyPlan({
        target_exam: targetExam,
        exam_date: examDate,
        available_hours_per_day: hoursPerDay,
        subjects,
      });
      setActivePlan(plan);
    } catch (err: any) {
      alert(`Failed to create study plan: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBlock = async (blockId: string, currentStatus: boolean) => {
    if (!activePlan) return;
    try {
      const updated = await api.toggleStudyBlock(activePlan.id, blockId, !currentStatus);
      setActivePlan(updated);
    } catch (err: any) {
      console.error(err);
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'learning':
        return (
          <span className="px-2 py-0.5 rounded bg-[#FAF9F5] text-[#18181B] border border-[#E5E2D9] text-[10px] font-mono font-semibold">
            Deep Focus
          </span>
        );
      case 'revision':
        return (
          <span className="px-2 py-0.5 rounded bg-[#FAF9F5] text-[#C25E34] border border-[#C25E34]/30 text-[10px] font-mono font-semibold">
            Active Recall
          </span>
        );
      case 'practice_quiz':
        return (
          <span className="px-2 py-0.5 rounded bg-[#FAF9F5] text-[#2D5A43] border border-[#2D5A43]/30 text-[10px] font-mono font-semibold">
            Practice Test
          </span>
        );
      case 'break':
        return (
          <span className="px-2 py-0.5 rounded bg-[#EAE7DF] text-[#57534E] text-[10px] font-mono">
            Rest Interval
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* 1. EDITORIAL HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E2D9] pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#F3F1EC] border border-[#E5E2D9] text-[11px] font-mono text-[#57534E]">
            <Calendar className="w-3.5 h-3.5 text-[#C25E34]" />
            <span className="uppercase tracking-wider">Exam Readiness Timetable</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#18181B] tracking-tight">
            Study Timetable & Roadmap
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E]">
            Algorithmically structured revision slots balancing topic difficulty, spaced recall, and mock exams.
          </p>
        </div>

        {activePlan && (
          <div className="flex items-center gap-3 surface-card px-4 py-2.5 rounded-xl border border-[#E5E2D9]">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-[#8C877D]">Progress</div>
              <div className="text-base font-bold font-mono text-[#18181B]">
                {Math.round(activePlan.completion_percentage)}% Completed
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#FAF9F5] border border-[#E5E2D9] flex items-center justify-center font-bold font-mono text-xs text-[#C25E34]">
              {Math.round(activePlan.completion_percentage)}%
            </div>
          </div>
        )}
      </div>

      {/* 2. TIMETABLE GENERATOR FORM */}
      <div className="surface-card p-6 sm:p-8 rounded-xl border border-[#E5E2D9] space-y-6">
        <form onSubmit={handleGeneratePlan} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-semibold text-[#18181B]">
                Examination or Milestone Title:
              </label>
              <input
                type="text"
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                placeholder="e.g., End Semester Examination, GATE CSE 2027..."
                className="w-full bg-[#FAF9F5] border border-[#E5E2D9] rounded-lg px-3.5 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#C25E34]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#18181B]">
                Examination Date:
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-[#FAF9F5] border border-[#E5E2D9] rounded-lg px-3.5 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#C25E34]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#18181B]">
              Daily Available Study Budget: <span className="font-mono text-[#C25E34]">{hoursPerDay} hours/day</span>
            </label>
            <input
              type="range"
              min={1}
              max={8}
              step={0.5}
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              className="w-full accent-[#C25E34]"
            />
          </div>

          {/* Subjects List & Adder */}
          <div className="space-y-3 pt-1">
            <label className="block text-xs font-semibold text-[#18181B]">
              Syllabus Modules & Priorities:
            </label>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FAF9F5] border border-[#E5E2D9] text-xs text-[#18181B]"
                >
                  <span className="font-semibold">{s.name}</span>
                  <span className="text-[10px] text-[#C25E34] font-mono">
                    ({s.priority} • {s.difficulty})
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(idx)}
                    className="text-[#8C877D] hover:text-[#C25E34]"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Inline subject addition */}
            <div className="flex flex-wrap gap-2 pt-1">
              <input
                type="text"
                value={newSubjName}
                onChange={(e) => setNewSubjName(e.target.value)}
                placeholder="Module name..."
                className="bg-[#FAF9F5] border border-[#E5E2D9] rounded-lg px-3 py-1.5 text-xs text-[#18181B] focus:outline-none focus:border-[#C25E34]"
              />
              <select
                value={newSubjPriority}
                onChange={(e) => setNewSubjPriority(e.target.value as any)}
                className="bg-[#FAF9F5] border border-[#E5E2D9] rounded-lg px-2.5 py-1.5 text-xs text-[#18181B]"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
              <select
                value={newSubjDifficulty}
                onChange={(e) => setNewSubjDifficulty(e.target.value as any)}
                className="bg-[#FAF9F5] border border-[#E5E2D9] rounded-lg px-2.5 py-1.5 text-xs text-[#18181B]"
              >
                <option value="Hard">Hard Difficulty</option>
                <option value="Medium">Medium Difficulty</option>
                <option value="Easy">Easy Difficulty</option>
              </select>
              <button
                type="button"
                onClick={handleAddSubject}
                className="px-3 py-1.5 rounded-lg btn-secondary text-xs font-semibold flex items-center gap-1 text-[#18181B]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Module</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || subjects.length === 0}
            className="px-5 py-2.5 rounded-lg btn-terracotta disabled:opacity-40 text-xs font-semibold shadow-xs flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Synthesizing Roadmap...' : 'Construct Study Schedule'}</span>
          </button>
        </form>
      </div>

      {/* 3. ACTIVE SCHEDULE VIEW */}
      {activePlan && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C25E34] font-semibold">
                ACTIVE TIMETABLE • EXAM TARGET: {activePlan.exam_date}
              </span>
              <h2 className="text-base font-serif-title font-bold text-[#18181B]">
                {activePlan.title}
              </h2>
            </div>
          </div>

          <div className="space-y-2.5">
            {activePlan.schedule.map((block) => (
              <div
                key={block.id}
                onClick={() => handleToggleBlock(block.id, block.completed)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  block.completed
                    ? 'bg-[#FAF9F5] border-[#E5E2D9] opacity-60'
                    : 'surface-card border-[#E5E2D9] hover:border-[#C25E34]'
                }`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                      block.completed
                        ? 'bg-[#2D5A43] border-[#2D5A43] text-white'
                        : 'border-[#8C877D] bg-[#FFFFFF]'
                    }`}
                  >
                    {block.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-[#8C877D]">
                        {block.date_label}
                      </span>
                      {getActivityBadge(block.activity_type)}
                    </div>
                    <div
                      className={`text-xs sm:text-sm font-semibold truncate ${
                        block.completed ? 'line-through text-[#8C877D]' : 'text-[#18181B]'
                      }`}
                    >
                      {block.subject}: {block.topic}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[#8C877D] text-xs font-mono shrink-0">
                  <Clock className="w-3.5 h-3.5 text-[#C25E34]" />
                  <span>{block.duration_minutes}m</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlannerPage;
