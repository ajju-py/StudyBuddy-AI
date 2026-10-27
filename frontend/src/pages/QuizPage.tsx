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

      if (result.passed) {
        try {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {}
      }

      api.getQuizHistory().then(setHistoryRecords).catch(console.error);
    } catch (err: any) {
      alert(`Grading failed: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. HEADER & SEGMENTED WORKSPACE TABS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E2D9] pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#F3F1EC] border border-[#E5E2D9] text-[11px] font-mono text-[#57534E]">
            <FileQuestion className="w-3.5 h-3.5 text-[#2D5A43]" />
            <span className="uppercase tracking-wider">Evaluation Diagnostic</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#18181B] tracking-tight">
            Practice Examination Hall
          </h1>
          <p className="text-xs sm:text-sm text-[#57534E]">
            Server-side deterministic scoring with full pedagogical rationales and historical record keeping.
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-[#FAF9F5] border border-[#E5E2D9] text-xs">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'generate'
                ? 'bg-[#18181B] text-[#FAF9F5] shadow-xs'
                : 'text-[#57534E] hover:text-[#18181B]'
            }`}
          >
            Create Exam
          </button>
          {activeQuiz && (
            <button
              onClick={() => setActiveTab('take')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'take'
                  ? 'bg-[#18181B] text-[#FAF9F5] shadow-xs'
                  : 'text-[#57534E] hover:text-[#18181B]'
              }`}
            >
              Active Paper
            </button>
          )}
          {attemptResult && (
            <button
              onClick={() => setActiveTab('results')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'results'
                  ? 'bg-[#18181B] text-[#FAF9F5] shadow-xs'
                  : 'text-[#57534E] hover:text-[#18181B]'
              }`}
            >
              Diagnostic Report
            </button>
          )}
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-[#18181B] text-[#FAF9F5] shadow-xs'
                : 'text-[#57534E] hover:text-[#18181B]'
            }`}
          >
            History ({historyRecords.length})
          </button>
        </div>
      </div>

      {/* 2. TAB CONTENT */}

      {/* TAB A: GENERATE QUIZ */}
      {activeTab === 'generate' && (
        <div className="surface-card p-6 sm:p-8 rounded-xl border border-[#E5E2D9] space-y-6">
          <form onSubmit={handleGenerateQuiz} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#18181B]">
                Examination Subject or Syllabus Topic:
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Computer Architecture, Deadlocks, SQL Indexing, Graph Traversal..."
                className="w-full bg-[#FAF9F5] border border-[#E5E2D9] rounded-lg px-3.5 py-2.5 text-xs text-[#18181B] placeholder-[#8C877D] focus:outline-none focus:border-[#C25E34] font-ui"
              />
            </div>

            {/* Optional Document Source */}
            {documents.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#18181B]">
                  Ground Questions in Ingested Document (Optional):
                </label>
                <select
                  value={selectedDocId || ''}
                  onChange={(e) =>
                    setSelectedDocId(e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full bg-[#FAF9F5] border border-[#E5E2D9] rounded-lg px-3.5 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#C25E34]"
                >
                  <option value="">General Knowledge / No Document Constraint</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      📄 {d.original_name} ({d.file_type.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Difficulty Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#18181B]">
                  Target Rigor:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficulty(diff)}
                      className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                        difficulty === diff
                          ? 'bg-[#18181B] text-[#FAF9F5] border-[#18181B] shadow-xs'
                          : 'bg-[#FAF9F5] text-[#57534E] border-[#E5E2D9] hover:text-[#18181B]'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Count Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#18181B]">
                  Number of Questions: <span className="font-mono text-[#C25E34]">{questionCount}</span>
                </label>
                <input
                  type="range"
                  min={2}
                  max={10}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full accent-[#C25E34]"
                />
                <div className="flex justify-between text-[10px] text-[#8C877D] font-mono">
                  <span>2 Questions</span>
                  <span>5 Questions</span>
                  <span>10 Questions</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating || !topic.trim()}
              className="px-5 py-2.5 rounded-lg btn-terracotta disabled:opacity-40 text-xs font-semibold shadow-xs flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Synthesizing Examination...' : 'Generate Practice Exam'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB B: ACTIVE EXAM TAKER (FOCUSED EXAMINATION CANVAS) */}
      {activeTab === 'take' && activeQuiz && (
        <div className="space-y-6">
          <div className="surface-card p-5 rounded-xl border border-[#E5E2D9] flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#C25E34] font-semibold">
                ACTIVE EXAMINATION • {activeQuiz.difficulty.toUpperCase()}
              </span>
              <h2 className="text-base font-serif-title font-bold text-[#18181B]">
                {activeQuiz.title}
              </h2>
            </div>
            <div className="text-right text-xs text-[#57534E] font-mono">
              Progress: <strong className="text-[#18181B]">{Object.keys(userAnswers).length}</strong> / {activeQuiz.questions.length} answered
            </div>
          </div>

          <div className="space-y-6">
            {activeQuiz.questions.map((q, idx) => (
              <div
                key={q.id}
                className="surface-card p-6 rounded-xl border border-[#E5E2D9] space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded bg-[#F3F1EC] text-[#18181B] font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-[#E5E2D9]">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-semibold text-[#18181B] leading-relaxed font-ui">
                      {q.question}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#8C877D] px-2 py-0.5 rounded bg-[#FAF9F5] border border-[#E5E2D9] shrink-0">
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
                      className="w-full bg-[#FAF9F5] border border-[#E5E2D9] rounded-lg px-3.5 py-2 text-xs text-[#18181B] placeholder-[#8C877D] focus:outline-none focus:border-[#C25E34]"
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
                          className={`p-3.5 rounded-lg border text-left text-xs font-medium transition-colors flex items-center gap-3 ${
                            isSelected
                              ? 'bg-[#FAF9F5] border-[#C25E34] text-[#18181B] shadow-xs'
                              : 'bg-[#FFFFFF] border-[#E5E2D9] text-[#57534E] hover:border-[#8C877D] hover:text-[#18181B]'
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-[#C25E34] bg-[#C25E34]'
                                : 'border-[#8C877D]'
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="leading-normal">{opt}</span>
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
              className="px-6 py-3 rounded-lg btn-terracotta disabled:opacity-40 text-xs font-semibold shadow-xs flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              <span>{isSubmitting ? 'Grading Answers...' : 'Submit Paper & Finalize Score'}</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB C: DETAILED DIAGNOSTIC GRADE REPORT */}
      {activeTab === 'results' && attemptResult && (
        <div className="space-y-6">
          {/* Result Banner */}
          <div
            className={`p-6 sm:p-8 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-6 ${
              attemptResult.passed
                ? 'bg-[#EAF3EE] border-[#2D5A43]/20'
                : 'bg-[#FDF2F2] border-[#C25E34]/30'
            }`}
          >
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#57534E]">
                OFFICIAL GRADE REPORT
              </span>
              <h2 className="text-xl sm:text-2xl font-serif-title font-bold text-[#18181B]">
                {attemptResult.quiz_title}
              </h2>
              <p className="text-xs text-[#57534E]">
                {attemptResult.passed
                  ? 'Benchmark Achieved: The score satisfies academic passing standards (>= 60%).'
                  : 'Diagnostic Review: Review pedagogical feedback below and retake for mastery.'}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-center">
                <div
                  className={`text-4xl font-mono font-bold ${
                    attemptResult.passed ? 'text-[#2D5A43]' : 'text-[#C25E34]'
                  }`}
                >
                  {attemptResult.percentage}%
                </div>
                <div className="text-xs text-[#57534E] font-mono">
                  {attemptResult.score} / {attemptResult.max_score} Points
                </div>
              </div>

              <button
                onClick={() => setActiveTab('generate')}
                className="px-4 py-2 rounded-lg btn-secondary text-xs font-medium text-[#18181B]"
              >
                New Assessment
              </button>
            </div>
          </div>

          {/* Breakdown per Question */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[#8C877D] font-semibold">
              Question Diagnostic Analysis
            </h3>
            {attemptResult.feedback.map((f, i) => (
              <div
                key={f.question_id}
                className="surface-card p-5 rounded-xl border border-[#E5E2D9] space-y-3 text-xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 font-semibold text-[#18181B]">
                    {f.is_correct ? (
                      <CheckCircle2 className="w-4 h-4 text-[#2D5A43] shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#C25E34] shrink-0 mt-0.5" />
                    )}
                    <span className="font-ui leading-relaxed">
                      Q{i + 1}: {f.question}
                    </span>
                  </div>
                  <span className="font-mono text-[#8C877D] shrink-0">
                    {f.points_awarded} pts
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[11px]">
                  <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E5E2D9] space-y-1">
                    <span className="text-[#8C877D] font-mono uppercase text-[10px]">
                      Your Answer:
                    </span>
                    <div
                      className={`font-semibold ${
                        f.is_correct ? 'text-[#2D5A43]' : 'text-[#C25E34]'
                      }`}
                    >
                      {f.user_answer}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E5E2D9] space-y-1">
                    <span className="text-[#8C877D] font-mono uppercase text-[10px]">
                      Correct Answer:
                    </span>
                    <div className="text-[#18181B] font-semibold">{f.correct_answer}</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#FAF9F5] text-[#57534E] text-[11px] leading-relaxed border border-[#E5E2D9] font-ui">
                  <strong className="text-[#18181B] font-semibold">Pedagogical Explanation: </strong>
                  {f.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB D: ATTEMPTS HISTORY */}
      {activeTab === 'history' && (
        <div className="surface-card p-6 rounded-xl border border-[#E5E2D9] space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E5E2D9] pb-3">
            <History className="w-4 h-4 text-[#18181B]" />
            <h2 className="font-serif-title font-bold text-sm text-[#18181B]">
              Recorded Examination History
            </h2>
          </div>

          {historyRecords.length === 0 ? (
            <div className="py-12 text-center text-[#8C877D] text-xs">
              No examination attempts logged yet. Complete a quiz to archive results.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F5] text-[#57534E] font-mono uppercase text-[10px] border-b border-[#E5E2D9]">
                  <tr>
                    <th className="p-3 font-semibold">Subject Title</th>
                    <th className="p-3 font-semibold">Rigor</th>
                    <th className="p-3 font-semibold">Points</th>
                    <th className="p-3 font-semibold">Percentage</th>
                    <th className="p-3 font-semibold">Outcome</th>
                    <th className="p-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E2D9]">
                  {historyRecords.map((rec) => {
                    const passed = rec.percentage >= 60;
                    return (
                      <tr key={rec.attempt_id} className="hover:bg-[#FAF9F5] transition-colors">
                        <td className="p-3 font-medium text-[#18181B] font-ui">{rec.quiz_title}</td>
                        <td className="p-3 font-mono text-[#57534E]">{rec.difficulty}</td>
                        <td className="p-3 font-mono text-[#18181B]">
                          {rec.score} / {rec.max_score}
                        </td>
                        <td className="p-3 font-mono font-bold text-[#18181B]">{rec.percentage}%</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                              passed
                                ? 'bg-[#EAF3EE] text-[#2D5A43]'
                                : 'bg-[#FDF2F2] text-[#C25E34]'
                            }`}
                          >
                            {passed ? 'Passed' : 'Needs Review'}
                          </span>
                        </td>
                        <td className="p-3 text-[#8C877D] text-[11px] font-mono">
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

export default QuizPage;
