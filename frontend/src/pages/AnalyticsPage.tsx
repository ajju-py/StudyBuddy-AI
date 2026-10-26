import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import { ProgressAnalytics } from '../types';

export const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<ProgressAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-cyan-400" />
            <span>Learning Progress Analytics</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Authentic, verified metrics recorded from your actual study sessions, exams, and flashcards. Zero fabricated data.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 text-xs font-semibold flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. AUTHENTIC KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Average Exam Score */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Average Quiz Score</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-['Outfit']">
            {isLoading ? '...' : `${analytics?.actual_average_quiz_score ?? 0}%`}
          </div>
          <p className="text-[11px] text-slate-400">
            Across {analytics?.total_quizzes_completed ?? 0} completed examinations
          </p>
        </div>

        {/* Metric 2: Questions Answered */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Questions Solved</span>
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-['Outfit']">
            {isLoading ? '...' : analytics?.total_questions_answered ?? 0}
          </div>
          <p className="text-[11px] text-slate-400">Validated examination questions</p>
        </div>

        {/* Metric 3: Flashcards Mastered */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Flashcards Mastered</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-['Outfit']">
            {isLoading ? '...' : analytics?.known_flashcards_count ?? 0}
          </div>
          <p className="text-[11px] text-slate-400">
            {analytics?.revision_flashcards_count ?? 0} currently marked for revision
          </p>
        </div>

        {/* Metric 4: Study Plan Completion */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Plan Completion</span>
            <Calendar className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-3xl font-extrabold text-pink-400 font-['Outfit']">
            {isLoading ? '...' : `${analytics?.study_plan_completion_rate ?? 0}%`}
          </div>
          <p className="text-[11px] text-slate-400">Active timetable completion rate</p>
        </div>
      </div>

      {/* 3. EXAMINATION SCORE TRENDS CHART */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
            PERFORMANCE VISUALIZATION
          </span>
          <h2 className="text-lg font-bold text-white font-['Outfit']">
            Recent Examination Score Distribution
          </h2>
          <p className="text-xs text-slate-400">
            Chart displays verified percentages achieved on recent practice tests.
          </p>
        </div>

        {!analytics || analytics.recent_quiz_scores.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs space-y-2">
            <Award className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No test attempts recorded yet. Take an exam to generate your score trend!</p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="flex items-end gap-3 h-48 border-b border-white/10 pb-2 px-2 overflow-x-auto">
              {analytics.recent_quiz_scores.map((score, i) => {
                const heightPct = Math.max(score.percentage, 10);
                const isPass = score.percentage >= 60;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group min-w-[50px]">
                    <span className="text-[10px] font-mono text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      {score.percentage}%
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-lg transition-all ${
                        isPass
                          ? 'bg-gradient-to-t from-emerald-600 to-teal-400 group-hover:brightness-125'
                          : 'bg-gradient-to-t from-rose-600 to-amber-500 group-hover:brightness-125'
                      }`}
                    />
                    <span className="text-[9px] font-mono text-slate-500 truncate max-w-[55px]">
                      {score.date.split(',')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                <span>Passed (&gt;= 60%)</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500 inline-block" />
                <span>Needs Review (&lt; 60%)</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4. ACTIVITY TIMELINE */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
          <Clock className="w-4 h-4 text-violet-400" />
          <span>Persistent Learning Activity Stream</span>
        </h3>

        {!analytics || analytics.recent_activities.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No activity records found.
          </div>
        ) : (
          <div className="divide-y divide-white/5 text-xs">
            {analytics.recent_activities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-200">{act.title}</div>
                  {act.description && (
                    <div className="text-[11px] text-slate-400">{act.description}</div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-cyan-400 uppercase">
                    {act.activity_type}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-1">
                    {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
