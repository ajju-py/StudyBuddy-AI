import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  FileQuestion,
  Sparkles,
  CheckCircle2,
  XCircle,
  Award,
  Clock,
  RotateCcw,
  ArrowRight,
  HelpCircle,
  History,
  BookOpen,
} from 'lucide-react';
import { api } from '../services/api';
import {
  QuizData,
  QuizAttemptResult,
  QuizHistoryRecord,
  DocumentInfo,
} from '../types';

export const QuizPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'generate' | 'take' | 'results' | 'history'>('generate');

  // Generator form
  const [topic, setTopic] = useState('Operating Systems');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Results & History
  const [attemptResult, setAttemptResult] = useState<QuizAttemptResult | null>(null);
  const [historyRecords, setHistoryRecords] = useState<QuizHistoryRecord[]>([]);

  useEffect(() => {
    api.listDocuments().then((res) => setDocuments(res.documents)).catch(console.error);
    api.getQuizHistory().then((h) => setHistoryRecords(h)).catch(console.error);
  }, []);

  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const quiz = await api.generateQuiz({
        topic,
        difficulty,
        question_count: questionCount,
        document_id: selectedDocId,
      });
      setActiveQuiz(quiz);
      setUserAnswers({});
      setActiveTab('take');
    } catch (err: any) {
      alert(`Failed to generate quiz: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (questionId: number, option: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [String(questionId)]: option,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz || isSubmitting) return;

    const unanswered = activeQuiz.questions.filter((q) => !userAnswers[String(q.id)]);
    if (unanswered.length > 0) {
      if (!window.confirm(`You have ${unanswered.length} unanswered questions. Submit anyway?`)) {
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const result = await api.submitQuiz(activeQuiz.id, userAnswers);
      setAttemptResult(result);
      setActiveTab('results');

      // Trigger celebratory confetti if passed
      if (result.passed) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      }

      // Refresh history
      api.getQuizHistory().then(setHistoryRecords).catch(console.error);
    } catch (err: any) {
      alert(`Grading failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* 1. HEADER & NAVIGATION TABS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-2.5">
            <FileQuestion className="w-7 h-7 text-emerald-400" />
            <span>Practice Examination Hall</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Deterministic server-side grading with explanatory feedback and real test history.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-white/10 text-xs">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'generate'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Quiz
          </button>
          {activeQuiz && (
            <button
              onClick={() => setActiveTab('take')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'take'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Active Exam
            </button>
          )}
          {attemptResult && (
            <button
              onClick={() => setActiveTab('results')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'results'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Grade Report
            </button>
          )}
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Past Attempts ({historyRecords.length})
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT */}

      {/* TAB A: GENERATE QUIZ */}
      {activeTab === 'generate' && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
          <form onSubmit={handleGenerateQuiz} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Examination Topic or Chapter:
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Computer Architecture, Deadlocks, SQL Indexing..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Optional Document Source */}
            {documents.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Ground Quiz in Uploaded Document (Optional):
                </label>
                <select
                  value={selectedDocId || ''}
                  onChange={(e) => setSelectedDocId(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="">General Knowledge / No Document Constraint</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      📄 {d.original_name} ({d.file_type})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Difficulty Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Target Difficulty:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                        difficulty === diff
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                          : 'bg-slate-900 text-slate-400 border-white/5 hover:text-white'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Count Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Number of Questions: {questionCount}
                </label>
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full accent-cyan-500"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>2 Questions</span>
                  <span>5 Questions</span>
                  <span>10 Questions</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-500/25 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Synthesizing Examination...' : 'Generate Practice Quiz'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB B: ACTIVE EXAM TAKER */}
      {activeTab === 'take' && activeQuiz && (
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                ACTIVE PRACTICE EXAM • {activeQuiz.difficulty.toUpperCase()}
              </span>
              <h2 className="text-base font-bold text-white font-['Outfit']">
                {activeQuiz.title}
              </h2>
            </div>
            <div className="text-right text-xs text-slate-400 font-mono">
              Answered: {Object.keys(userAnswers).length} / {activeQuiz.questions.length}
            </div>
          </div>

          <div className="space-y-6">
            {activeQuiz.questions.map((q, idx) => (
              <div
                key={q.id}
                className="glass-card p-6 rounded-2xl border border-white/10 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-white leading-relaxed">
                      {q.question}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 shrink-0">
                    {q.points} pt
                  </span>
                </div>

                {/* Options */}
                {q.question_type === 'short_answer' ? (
                  <div className="pt-2">
                    <input
                      type="text"
                      value={userAnswers[String(q.id)] || ''}
                      onChange={(e) => handleSelectOption(q.id, e.target.value)}
                      placeholder="Type your concise answer here..."
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = userAnswers[String(q.id)] === opt;
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => handleSelectOption(q.id, opt)}
                          className={`p-3.5 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-3 ${
                            isSelected
                              ? 'bg-cyan-500/20 border-cyan-500 text-white shadow-md shadow-cyan-500/20'
                              : 'bg-slate-900/70 border-white/5 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-cyan-400 bg-cyan-500' : 'border-slate-500'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/30 transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>{isSubmitting ? 'Grading Answers...' : 'Submit Examination & Calculate Score'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB C: DETAILED GRADE REPORT */}
      {activeTab === 'results' && attemptResult && (
        <div className="space-y-8 animate-fadeIn">
          {/* Result Banner */}
          <div
            className={`p-6 sm:p-8 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-6 ${
              attemptResult.passed
                ? 'bg-emerald-950/40 border-emerald-500/40'
                : 'bg-rose-950/40 border-rose-500/40'
            }`}
          >
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                OFFICIAL GRADE REPORT
              </span>
              <h2 className="text-2xl font-bold text-white font-['Outfit']">
                {attemptResult.quiz_title}
              </h2>
              <p className="text-xs text-slate-300">
                {attemptResult.passed
                  ? '🎉 Congratulations! You satisfied the passing benchmark (>= 60%).'
                  : 'Needs Review. Practice difficult questions and retake when ready.'}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div
                  className={`text-4xl font-extrabold font-['Outfit'] ${
                    attemptResult.passed ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {attemptResult.percentage}%
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {attemptResult.score} / {attemptResult.max_score} Points
                </div>
              </div>

              <button
                onClick={() => setActiveTab('generate')}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-semibold"
              >
                Take Another
              </button>
            </div>
          </div>

          {/* Breakdown per Question */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit']">
              Question-by-Question Diagnostic Feedback
            </h3>
            {attemptResult.feedback.map((f, i) => (
              <div
                key={f.question_id}
                className={`p-5 rounded-2xl border space-y-3 text-xs ${
                  f.is_correct
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-rose-950/20 border-rose-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 font-semibold text-white">
                    {f.is_correct ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>
                      Q{i + 1}: {f.question}
                    </span>
                  </div>
                  <span className="font-mono text-slate-400 shrink-0">
                    {f.points_awarded} pts
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[11px]">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 space-y-0.5">
                    <span className="text-slate-400 font-medium">Your Selected Answer:</span>
                    <div className={f.is_correct ? 'text-emerald-300 font-semibold' : 'text-rose-300 font-semibold'}>
                      {f.user_answer}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 space-y-0.5">
                    <span className="text-slate-400 font-medium">Verified Correct Answer:</span>
                    <div className="text-cyan-300 font-semibold">{f.correct_answer}</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/90 text-slate-300 text-[11px] leading-relaxed border border-white/5">
                  <strong className="text-cyan-400 font-medium">Explanation: </strong>
                  {f.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB D: ATTEMPTS HISTORY */}
      {activeTab === 'history' && (
        <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
          <h2 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <span>Recorded Examination History</span>
          </h2>

          {historyRecords.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No examination attempts recorded yet. Create and complete your first quiz!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] border-b border-white/5">
                  <tr>
                    <th className="p-3">Examination Title</th>
                    <th className="p-3">Difficulty</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Percentage</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {historyRecords.map((rec) => {
                    const passed = rec.percentage >= 60;
                    return (
                      <tr key={rec.attempt_id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-medium text-white">{rec.quiz_title}</td>
                        <td className="p-3 font-mono text-slate-400">{rec.difficulty}</td>
                        <td className="p-3 font-mono text-slate-300">
                          {rec.score} / {rec.max_score}
                        </td>
                        <td className="p-3 font-mono font-bold text-white">{rec.percentage}%</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                              passed
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {passed ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 text-[11px]">
                          {new Date(rec.completed_at).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
