import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Award,
  Layers,
  Calendar,
  CheckCircle2,
  Clock,
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
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* 1. EDITORIAL HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E2D9] pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#F3F1EC] border border-[#E5E2D9] text-[11px] font-mono text-[#57534E]">
            <BarChart3 className="w-3.5 h-3.5 text-[#C25E34]" />
            <span className="uppercase tracking-wider">Verified Empirical Metrics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#18181B] tracking-tight">
            Academic Performance Ledger
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E]">
            Empirical metrics calculated exclusively from your logged examination papers, flashcard drills, and study sessions.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="px-3.5 py-1.5 rounded-lg btn-secondary text-xs font-semibold flex items-center gap-1.5 text-[#18181B]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. AUTHENTIC KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="surface-card p-5 rounded-xl border border-[#E5E2D9] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#8C877D]">
            <span>Average Quiz Score</span>
            <Award className="w-3.5 h-3.5 text-[#2D5A43]" />
          </div>
          <div className="text-3xl font-bold font-mono text-[#2D5A43]">
            {isLoading ? '—' : `${analytics?.actual_average_quiz_score ?? 0}%`}
          </div>
          <p className="text-[11px] text-[#8C877D]">
            Across {analytics?.total_quizzes_completed ?? 0} finished assessments
          </p>
        </div>

        {/* Metric 2 */}
        <div className="surface-card p-5 rounded-xl border border-[#E5E2D9] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#8C877D]">
            <span>Questions Solved</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-[#18181B]" />
          </div>
          <div className="text-3xl font-bold font-mono text-[#18181B]">
            {isLoading ? '—' : analytics?.total_questions_answered ?? 0}
          </div>
          <p className="text-[11px] text-[#8C877D]">Graded examination items</p>
        </div>

        {/* Metric 3 */}
        <div className="surface-card p-5 rounded-xl border border-[#E5E2D9] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#8C877D]">
            <span>Flashcards Mastered</span>
            <Layers className="w-3.5 h-3.5 text-[#C25E34]" />
          </div>
          <div className="text-3xl font-bold font-mono text-[#C25E34]">
            {isLoading ? '—' : analytics?.known_flashcards_count ?? 0}
          </div>
          <p className="text-[11px] text-[#8C877D]">
            {analytics?.revision_flashcards_count ?? 0} flagged for review
          </p>
        </div>

        {/* Metric 4 */}
        <div className="surface-card p-5 rounded-xl border border-[#E5E2D9] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#8C877D]">
            <span>Timetable Milestones</span>
            <Calendar className="w-3.5 h-3.5 text-[#18181B]" />
          </div>
          <div className="text-3xl font-bold font-mono text-[#18181B]">
            {isLoading ? '—' : `${analytics?.study_plan_completion_rate ?? 0}%`}
          </div>
          <p className="text-[11px] text-[#8C877D]">Active timetable progress</p>
        </div>
      </div>

      {/* 3. EXAMINATION SCORE TRENDS CHART */}
      <div className="surface-card p-6 sm:p-8 rounded-xl border border-[#E5E2D9] space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#C25E34] font-semibold">
            PERFORMANCE DISTRIBUTION
          </span>
          <h2 className="text-base font-serif-title font-bold text-[#18181B]">
            Recent Examination Score History
          </h2>
          <p className="text-xs text-[#57534E]">
            Empirical percentage scores achieved across your recent test submissions.
          </p>
        </div>

        {!analytics || analytics.recent_quiz_scores.length === 0 ? (
          <div className="py-16 text-center text-[#8C877D] text-xs space-y-2 border border-dashed border-[#E5E2D9] rounded-lg bg-[#FAF9F5]">
            <Award className="w-8 h-8 text-[#8C877D] mx-auto" />
            <p>No test attempts recorded yet. Complete an examination in the "Quizzes" module to populate.</p>
          </div>
        ) : (
          <div className="space-y-4 pt-2">
            <div className="flex items-end gap-3 h-48 border-b border-[#E5E2D9] pb-2 px-2 overflow-x-auto bg-[#FAF9F5] rounded-t-lg pt-4">
              {analytics.recent_quiz_scores.map((score, i) => {
                const heightPct = Math.max(score.percentage, 8);
                const isPass = score.percentage >= 60;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group min-w-[50px]">
                    <span className="text-[10px] font-mono text-[#18181B] opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                      {score.percentage}%
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-md transition-colors ${
                        isPass
                          ? 'bg-[#2D5A43] group-hover:bg-[#1E3F2F]'
                          : 'bg-[#C25E34] group-hover:bg-[#A54C26]'
                      }`}
                    />
                    <span className="text-[9px] font-mono text-[#8C877D] truncate max-w-[55px]">
                      {score.date.split(',')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#57534E] pt-1">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#2D5A43] inline-block" />
                <span>Benchmark Achieved (≥ 60%)</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-xs bg-[#C25E34] inline-block" />
                <span>Review Recommended (&lt; 60%)</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4. ACTIVITY TIMELINE */}
      <div className="surface-card p-6 sm:p-8 rounded-xl border border-[#E5E2D9] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E5E2D9] pb-3">
          <Clock className="w-4 h-4 text-[#18181B]" />
          <h3 className="font-serif-title font-bold text-sm text-[#18181B]">
            Verified Learning Activity Log
          </h3>
        </div>

        {!analytics || analytics.recent_activities.length === 0 ? (
          <div className="py-12 text-center text-[#8C877D] text-xs">
            No session records found.
          </div>
        ) : (
          <div className="divide-y divide-[#E5E2D9] text-xs">
            {analytics.recent_activities.map((act) => (
              <div key={act.id} className="py-3 flex items-center justify-between gap-4">
                <div className="space-y-0.5 min-w-0 pr-4">
                  <div className="font-semibold text-[#18181B] truncate">{act.title}</div>
                  {act.description && (
                    <div className="text-[11px] text-[#57534E] truncate font-ui">{act.description}</div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FAF9F5] border border-[#E5E2D9] text-[#57534E] uppercase font-semibold">
                    {act.activity_type}
                  </span>
                  <div className="text-[10px] text-[#8C877D] font-mono mt-1">
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

export default AnalyticsPage;
