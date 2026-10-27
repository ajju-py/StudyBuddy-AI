import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  FileText,
  FileQuestion,
  Layers,
  Calendar,
  Sparkles,
  ArrowRight,
  Award,
  CheckCircle,
  Clock,
  BookOpen,
  Compass,
} from 'lucide-react';
import { api } from '../services/api';
import { ProgressAnalytics, DocumentInfo } from '../types';

interface DashboardPageProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigateTab }) => {
  const [analytics, setAnalytics] = useState<ProgressAnalytics | null>(null);
  const [recentDocs, setRecentDocs] = useState<DocumentInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [analyticsData, docsData] = await Promise.all([
          api.getAnalytics(),
          api.listDocuments(),
        ]);
        setAnalytics(analyticsData);
        setRecentDocs(docsData.documents.slice(0, 4));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. EDITORIAL WELCOME BANNER */}
      <div className="surface-card p-6 sm:p-8 rounded-xl border border-[#E5E2D9] relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#F3F1EC] border border-[#E5E2D9] text-[11px] font-mono text-[#57534E]">
              <Sparkles className="w-3.5 h-3.5 text-[#C25E34]" />
              <span className="uppercase tracking-wider">Academic Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#18181B] tracking-tight">
              Study Workspace Overview
            </h1>
            <p className="text-xs sm:text-sm text-[#57534E] leading-relaxed">
              Track authentic examination readiness, test recall against ingested engineering textbooks, 
              generate deterministic quizzes, and review spaced flashcard decks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => onNavigateTab('assistant')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg btn-terracotta text-xs font-semibold shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask AI Tutor</span>
            </button>
            <button
              onClick={() => onNavigateTab('documents')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg btn-secondary text-xs font-medium text-[#18181B]"
            >
              <FileText className="w-4 h-4 text-[#8C877D]" />
              <span>Upload Notes</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. ACADEMIC LEDGER: KEY STUDY METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Metric 1 */}
        <div className="surface-card p-4 rounded-xl border border-[#E5E2D9] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#8C877D]">
            <span>Questions</span>
            <CheckCircle className="w-3.5 h-3.5 text-[#2D5A43]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#18181B]">
            {isLoading ? '—' : analytics?.total_questions_answered ?? 0}
          </div>
          <p className="text-[11px] text-[#8C877D]">Answered in sessions</p>
        </div>

        {/* Metric 2 */}
        <div className="surface-card p-4 rounded-xl border border-[#E5E2D9] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#8C877D]">
            <span>Quizzes</span>
            <FileQuestion className="w-3.5 h-3.5 text-[#C25E34]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#18181B]">
            {isLoading ? '—' : analytics?.total_quizzes_completed ?? 0}
          </div>
          <p className="text-[11px] text-[#8C877D]">Tests completed</p>
        </div>

        {/* Metric 3 */}
        <div className="surface-card p-4 rounded-xl border border-[#E5E2D9] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#8C877D]">
            <span>Average</span>
            <Award className="w-3.5 h-3.5 text-[#2D5A43]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#2D5A43]">
            {isLoading ? '—' : `${analytics?.actual_average_quiz_score ?? 0}%`}
          </div>
          <p className="text-[11px] text-[#8C877D]">Historical exam score</p>
        </div>

        {/* Metric 4 */}
        <div className="surface-card p-4 rounded-xl border border-[#E5E2D9] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#8C877D]">
            <span>Flashcards</span>
            <Layers className="w-3.5 h-3.5 text-[#C25E34]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#18181B]">
            {isLoading ? '—' : analytics?.total_flashcards_reviewed ?? 0}
          </div>
          <p className="text-[11px] text-[#8C877D]">
            {analytics?.known_flashcards_count ?? 0} cards mastered
          </p>
        </div>

        {/* Metric 5 */}
        <div className="surface-card p-4 rounded-xl border border-[#E5E2D9] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#8C877D]">
            <span>Documents</span>
            <BookOpen className="w-3.5 h-3.5 text-[#18181B]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#18181B]">
            {isLoading ? '—' : analytics?.total_documents_uploaded ?? 0}
          </div>
          <p className="text-[11px] text-[#8C877D]">PDFs indexed in RAG</p>
        </div>

        {/* Metric 6 */}
        <div className="surface-card p-4 rounded-xl border border-[#E5E2D9] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#8C877D]">
            <span>Schedule</span>
            <Calendar className="w-3.5 h-3.5 text-[#C25E34]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[#18181B]">
            {isLoading ? '—' : `${analytics?.study_plan_completion_rate ?? 0}%`}
          </div>
          <p className="text-[11px] text-[#8C877D]">Plan milestones done</p>
        </div>
      </div>

      {/* 3. CORE STUDY WORKSPACES */}
      <div className="space-y-3">
        <div className="flex items-baseline justify-between border-b border-[#E5E2D9] pb-2">
          <h2 className="text-base font-serif-title font-bold text-[#18181B]">
            Study Modules
          </h2>
          <span className="text-[11px] font-mono text-[#8C877D]">
            Select a specialized workspace
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigateTab('assistant')}
            className="surface-card p-5 rounded-xl border border-[#E5E2D9] hover:border-[#C25E34] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#FAF9F5] border border-[#E5E2D9] flex items-center justify-center text-[#C25E34] group-hover:bg-[#C25E34] group-hover:text-white transition-colors">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-title font-bold text-sm text-[#18181B]">
                  Adaptive AI Tutor
                </h3>
                <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
                  Engage in Socratic dialogue, step-by-step mathematical proofs, or concise exam summaries.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E2D9] flex items-center justify-between text-[11px] font-medium text-[#C25E34]">
              <span>Open conversation</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('documents')}
            className="surface-card p-5 rounded-xl border border-[#E5E2D9] hover:border-[#C25E34] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#FAF9F5] border border-[#E5E2D9] flex items-center justify-center text-[#18181B] group-hover:bg-[#18181B] group-hover:text-white transition-colors">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-title font-bold text-sm text-[#18181B]">
                  Document Archive
                </h3>
                <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
                  Upload syllabus PDFs and lecture slides for exact text chunking and page-grounded retrieval.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E2D9] flex items-center justify-between text-[11px] font-medium text-[#18181B]">
              <span>Manage documents</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('quiz')}
            className="surface-card p-5 rounded-xl border border-[#E5E2D9] hover:border-[#C25E34] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#FAF9F5] border border-[#E5E2D9] flex items-center justify-center text-[#2D5A43] group-hover:bg-[#2D5A43] group-hover:text-white transition-colors">
                <FileQuestion className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-title font-bold text-sm text-[#18181B]">
                  Examination Hall
                </h3>
                <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
                  Generate multiple-choice or short-answer exams with instant deterministic scoring and rationales.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E2D9] flex items-center justify-between text-[11px] font-medium text-[#2D5A43]">
              <span>Take assessment</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('planner')}
            className="surface-card p-5 rounded-xl border border-[#E5E2D9] hover:border-[#C25E34] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#FAF9F5] border border-[#E5E2D9] flex items-center justify-center text-[#C25E34] group-hover:bg-[#C25E34] group-hover:text-white transition-colors">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif-title font-bold text-sm text-[#18181B]">
                  Study Timetable
                </h3>
                <p className="text-xs text-[#57534E] mt-1 leading-relaxed">
                  Organize daily revision slots leading up to university test dates with priority flags.
                </p>
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E2D9] flex items-center justify-between text-[11px] font-medium text-[#C25E34]">
              <span>View schedule</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* 4. RECENT STUDY MATERIALS & LOGGED SESSIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Ingested Documents Shelf */}
        <div className="surface-card p-6 rounded-xl border border-[#E5E2D9] space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[#C25E34]" />
              <h3 className="font-serif-title font-bold text-sm text-[#18181B]">
                Active Study Materials
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('documents')}
              className="text-xs text-[#C25E34] hover:text-[#A54C26] flex items-center gap-1 font-medium"
            >
              <span>View Library</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {recentDocs.length === 0 ? (
            <div className="py-12 text-center space-y-3 rounded-lg border border-dashed border-[#E5E2D9] bg-[#FAF9F5]">
              <FileText className="w-8 h-8 text-[#8C877D] mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#18181B]">No documents uploaded yet</p>
                <p className="text-[11px] text-[#8C877D] max-w-xs mx-auto">
                  Add syllabus PDFs, lecture slides, or textbook chapters to enable grounded AI citations.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('documents')}
                className="px-3 py-1.5 rounded-md btn-terracotta text-xs font-semibold"
              >
                Upload First Document
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E5E2D9] flex items-center justify-between text-xs hover:border-[#8C877D] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-[#EAE7DF] text-[#57534E]">
                      {doc.file_type.toUpperCase()}
                    </span>
                    <div className="truncate">
                      <div className="font-semibold text-[#18181B] truncate">
                        {doc.original_name}
                      </div>
                      <div className="text-[11px] font-mono text-[#8C877D]">
                        {doc.page_count} pages • {doc.chunk_count} passages • {(doc.file_size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateTab('assistant')}
                    className="px-2.5 py-1 rounded bg-[#FFFFFF] border border-[#E5E2D9] hover:border-[#C25E34] text-[#18181B] hover:text-[#C25E34] text-[11px] font-medium transition-colors shrink-0 ml-2"
                  >
                    Query
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Verified Learning Session Log */}
        <div className="surface-card p-6 rounded-xl border border-[#E5E2D9] space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2D5A43]" />
              <h3 className="font-serif-title font-bold text-sm text-[#18181B]">
                Recorded Study Activity
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs text-[#2D5A43] hover:underline flex items-center gap-1 font-medium"
            >
              <span>Full History</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {!analytics || analytics.recent_activities.length === 0 ? (
            <div className="py-12 text-center space-y-3 rounded-lg border border-dashed border-[#E5E2D9] bg-[#FAF9F5]">
              <Compass className="w-8 h-8 text-[#8C877D] mx-auto" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-[#18181B]">No sessions logged yet</p>
                <p className="text-[11px] text-[#8C877D] max-w-xs mx-auto">
                  Ask the AI assistant a question or complete a practice quiz to record your academic milestones.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('assistant')}
                className="px-3 py-1.5 rounded-md btn-secondary text-xs font-medium text-[#18181B]"
              >
                Start Learning Session
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {analytics.recent_activities.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E5E2D9] flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 min-w-0 pr-3">
                    <div className="font-medium text-[#18181B] truncate">{act.title}</div>
                    {act.description && (
                      <div className="text-[11px] text-[#57534E] truncate">
                        {act.description}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#EAE7DF] text-[#57534E] shrink-0">
                    {act.activity_type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
