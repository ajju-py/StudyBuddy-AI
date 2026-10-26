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
        return <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono">Deep Focus</span>;
      case 'revision':
        return <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[10px] font-mono">Active Recall</span>;
      case 'practice_quiz':
        return <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono">Practice Exam</span>;
      case 'break':
        return <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono">Break</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-pink-400" />
            <span>Intelligent Exam Study Planner</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Algorithmic schedule balancing priority, difficulty, revision cycles, and mock quizzes.
          </p>
        </div>

        {activePlan && (
          <div className="flex items-center gap-4 glass-panel px-4 py-2 rounded-2xl border border-white/10">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-slate-400">Timetable Completion</div>
              <div className="text-lg font-bold text-cyan-400 font-['Outfit']">
                {activePlan.completion_percentage}%
              </div>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 flex items-center justify-center font-bold text-xs text-cyan-300">
              {Math.round(activePlan.completion_percentage)}%
            </div>
          </div>
        )}
      </div>

      {/* 2. TIMETABLE GENERATOR FORM */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <form onSubmit={handleGeneratePlan} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300">
                Examination or Goal Name:
              </label>
              <input
                type="text"
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                placeholder="e.g. End Semester Exams, GATE CSE 2027..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Target Examination Date:
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Daily Available Study Budget: {hoursPerDay} hours/day
            </label>
            <input
              type="range"
              min={1}
              max={8}
              step={0.5}
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(Number(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          {/* Subjects List & Adder */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-semibold text-slate-300">
              Target Subjects & Priority:
            </label>
            <div className="flex flex-wrap gap-2">
              {subjects.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs text-slate-200"
                >
                  <span className="font-semibold">{s.name}</span>
                  <span className="text-[10px] text-cyan-400 font-mono">({s.priority} / {s.difficulty})</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(idx)}
                    className="text-slate-500 hover:text-rose-400"
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
                placeholder="New subject name..."
                className="bg-slate-900 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              />
              <select
                value={newSubjPriority}
                onChange={(e) => setNewSubjPriority(e.target.value as any)}
                className="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-300"
              >
                <option value="High">High Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="Low">Low Priority</option>
              </select>
              <select
                value={newSubjDifficulty}
                onChange={(e) => setNewSubjDifficulty(e.target.value as any)}
                className="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-300"
              >
                <option value="Hard">Hard Difficulty</option>
                <option value="Medium">Medium Difficulty</option>
                <option value="Easy">Easy Difficulty</option>
              </select>
              <button
                type="button"
                onClick={handleAddSubject}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || subjects.length === 0}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-violet-600 hover:from-pink-400 hover:to-violet-500 text-white font-semibold text-xs shadow-md shadow-pink-500/25 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Synthesizing Roadmap...' : 'Generate Optimized Study Plan'}</span>
          </button>
        </form>
      </div>

      {/* 3. ACTIVE SCHEDULE VIEW */}
      {activePlan && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                ACTIVE TIMETABLE • EXAM ON {activePlan.exam_date}
              </span>
              <h2 className="text-xl font-bold text-white font-['Outfit']">
                {activePlan.title}
              </h2>
            </div>
          </div>

          <div className="space-y-3">
            {activePlan.schedule.map((block) => (
              <div
                key={block.id}
                onClick={() => handleToggleBlock(block.id, block.completed)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  block.completed
                    ? 'bg-slate-900/40 border-white/5 opacity-60'
                    : 'glass-card border-white/10 hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                      block.completed
                        ? 'bg-cyan-500 border-cyan-500 text-white'
                        : 'border-slate-500 bg-slate-900'
                    }`}
                  >
                    {block.completed && <CheckCircle2 className="w-4 h-4" />}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-400">
                        {block.date_label}
                      </span>
                      {getActivityBadge(block.activity_type)}
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        block.completed ? 'line-through text-slate-400' : 'text-white'
                      }`}
                    >
                      {block.subject}: {block.topic}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono shrink-0">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
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
