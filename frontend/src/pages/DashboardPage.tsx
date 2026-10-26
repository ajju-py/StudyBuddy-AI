import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  FileText,
  FileQuestion,
  Layers,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  CheckCircle,
  Clock,
  BookOpen,
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
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 1. WELCOME & GREETING BANNER */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl glass-panel-glow border border-cyan-500/30">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-xs font-mono text-cyan-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Intelligent Study Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
              Welcome to StudyBuddy AI
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
              Track your authentic exam readiness, test your recall, query ingested textbooks, and master complex engineering concepts.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigateTab('assistant')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/25 transition-all hover:scale-[1.02]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask Assistant</span>
            </button>
            <button
              onClick={() => onNavigateTab('documents')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-200 font-medium text-xs transition-all hover:border-cyan-500/30"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Upload Material</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. REAL METRIC TILES */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Metric 1: Questions Answered */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Questions</span>
            <CheckCircle className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-['Outfit']">
            {isLoading ? '...' : analytics?.total_questions_answered ?? 0}
          </div>
          <p className="text-[11px] text-slate-400">Exam questions answered</p>
        </div>

        {/* Metric 2: Quizzes Completed */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Quizzes</span>
            <FileQuestion className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-white font-['Outfit']">
            {isLoading ? '...' : analytics?.total_quizzes_completed ?? 0}
          </div>
          <p className="text-[11px] text-slate-400">Examinations finished</p>
        </div>

        {/* Metric 3: Actual Average Score */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Avg Score</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-['Outfit']">
            {isLoading ? '...' : `${analytics?.actual_average_quiz_score ?? 0}%`}
          </div>
          <p className="text-[11px] text-slate-400">Actual test average</p>
        </div>

        {/* Metric 4: Flashcards Reviewed */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Flashcards</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white font-['Outfit']">
            {isLoading ? '...' : analytics?.total_flashcards_reviewed ?? 0}
          </div>
          <p className="text-[11px] text-slate-400">
            {analytics?.known_flashcards_count ?? 0} mastered
          </p>
        </div>

        {/* Metric 5: Documents Ingested */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Documents</span>
            <BookOpen className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold text-white font-['Outfit']">
            {isLoading ? '...' : analytics?.total_documents_uploaded ?? 0}
          </div>
          <p className="text-[11px] text-slate-400">PDFs / notes ingested</p>
        </div>

        {/* Metric 6: Study Plan Completion */}
        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Plan Progress</span>
            <Calendar className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-bold text-white font-['Outfit']">
            {isLoading ? '...' : `${analytics?.study_plan_completion_rate ?? 0}%`}
          </div>
          <p className="text-[11px] text-slate-400">Timetable completed</p>
        </div>
      </div>

      {/* 3. QUICK ACTIONS GRID */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white font-['Outfit']">Quick Study Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => onNavigateTab('assistant')}
            className="glass-card p-5 rounded-2xl cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Ask Study Assistant</h3>
              <p className="text-xs text-slate-400 mt-1">
                Query concepts in Explain Simply, Exam Prep, or Socratic mode.
              </p>
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('documents')}
            className="glass-card p-5 rounded-2xl cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Upload & Search Docs</h3>
              <p className="text-xs text-slate-400 mt-1">
                Ingest PDF or Word notes for grounded citations and passage retrieval.
              </p>
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('quiz')}
            className="glass-card p-5 rounded-2xl cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <FileQuestion className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Practice Examinations</h3>
              <p className="text-xs text-slate-400 mt-1">
                Generate and submit quizzes with automatic deterministic grading.
              </p>
            </div>
          </div>

          <div
            onClick={() => onNavigateTab('planner')}
            className="glass-card p-5 rounded-2xl cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Exam Study Timetable</h3>
              <p className="text-xs text-slate-400 mt-1">
                Construct personalized daily revision and practice test schedules.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY & INGESTED DOCUMENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Ingested Documents */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit'] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Recent Study Materials</span>
            </h3>
            <button
              onClick={() => onNavigateTab('documents')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentDocs.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No study materials uploaded yet.</p>
              <button
                onClick={() => onNavigateTab('documents')}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-medium"
              >
                Upload First File
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400 font-mono font-bold text-[10px]">
                      {doc.file_type}
                    </div>
                    <div>
                      <div className="font-medium text-white truncate max-w-[220px]">
                        {doc.original_name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {doc.page_count} pages • {doc.chunk_count} chunks • {(doc.file_size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateTab('assistant')}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px]"
                  >
                    Ask
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real Activity Stream */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit'] flex items-center gap-2">
              <Clock className="w-4 h-4 text-violet-400" />
              <span>Recorded Learning Sessions</span>
            </h3>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium"
            >
              <span>Full Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {!analytics || analytics.recent_activities.length === 0 ? (
            <div className="py-10 text-center space-y-3">
              <Clock className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">No activity recorded yet. Start by asking a question or taking a quiz!</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {analytics.recent_activities.slice(0, 5).map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-200">{act.title}</div>
                    {act.description && (
                      <div className="text-[11px] text-slate-400 truncate max-w-[280px]">
                        {act.description}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-950">
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
