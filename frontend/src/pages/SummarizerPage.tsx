import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  FileText,
  HelpCircle,
  Bookmark,
  CheckCircle,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { api } from '../services/api';
import { DocumentInfo, SummaryData } from '../types';

export const SummarizerPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [sourceType, setSourceType] = useState<'document' | 'text'>('document');
  const [selectedDocId, setSelectedDocId] = useState<number | undefined>(undefined);
  const [customText, setCustomText] = useState('');
  const [summaryType, setSummaryType] = useState<string>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [summaryResult, setSummaryResult] = useState<SummaryData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.listDocuments().then((res) => {
      setDocuments(res.documents);
      if (res.documents.length > 0) {
        setSelectedDocId(res.documents[0].id);
      }
    }).catch((err) => console.error(err));
  }, []);

  const handleSummarize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceType === 'document' && !selectedDocId) {
      alert('Please select or upload a document first.');
      return;
    }
    if (sourceType === 'text' && !customText.trim()) {
      alert('Please enter or paste text to summarize.');
      return;
    }

    setIsLoading(true);
    try {
      const resp = await api.generateSummary({
        document_id: sourceType === 'document' ? selectedDocId : undefined,
        text: sourceType === 'text' ? customText : undefined,
        summary_type: summaryType,
      });
      setSummaryResult(resp);
    } catch (err: any) {
      alert(`Summarization failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copySummary = () => {
    if (!summaryResult) return;
    navigator.clipboard.writeText(summaryResult.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* 1. HEADER */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-2.5">
          <BookOpen className="w-7 h-7 text-cyan-400" />
          <span>AI Summarizer & Knowledge Extractor</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
          Extract core academic concepts, formal definitions, revision notes, and anticipated examination questions from your study materials.
        </p>
      </div>

      {/* 2. CONFIGURATION FORM */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <form onSubmit={handleSummarize} className="space-y-6">
          {/* Source Selector: Document vs. Text */}
          <div className="flex gap-4 border-b border-white/10 pb-4">
            <button
              type="button"
              onClick={() => setSourceType('document')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                sourceType === 'document'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Uploaded Document</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceType('text')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                sourceType === 'text'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Paste Custom Text</span>
            </button>
          </div>

          {sourceType === 'document' ? (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Choose Document to Summarize:
              </label>
              {documents.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-400">
                  No documents found. Please upload a PDF or Word document in the "Documents" tab first.
                </div>
              ) : (
                <select
                  value={selectedDocId || ''}
                  onChange={(e) => setSelectedDocId(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.original_name} ({d.file_type}, {d.page_count} pages)
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Paste Chapter Content or Notes:
              </label>
              <textarea
                rows={5}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Paste paragraph or notes to extract knowledge..."
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          {/* Depth Options */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Summary Mode & Depth:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'short', name: 'Executive Recap', desc: '1-2 brief paragraphs' },
                { id: 'medium', name: 'Balanced Overview', desc: 'Comprehensive 3-4 paragraphs' },
                { id: 'detailed', name: 'Technical Analysis', desc: 'Exhaustive section breakdown' },
                { id: 'revision_notes', name: 'Exam Cheat-sheet', desc: 'High-yield bullet points' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSummaryType(opt.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    summaryType === opt.id
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-300 shadow-sm shadow-cyan-500/20'
                      : 'bg-slate-900/60 border-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-semibold text-xs text-white">{opt.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || (sourceType === 'document' && !selectedDocId)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs shadow-md shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Extracting & Synthesizing...' : 'Generate AI Summary'}</span>
          </button>
        </form>
      </div>

      {/* 3. SYNTHESIZED RESULTS */}
      {summaryResult && (
        <div className="space-y-8 animate-fadeIn">
          {/* Main Summary Card */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                  {summaryResult.summary_type.replace('_', ' ').toUpperCase()} SUMMARY
                </span>
                <h3 className="text-lg font-bold text-white font-['Outfit']">
                  {summaryResult.source_title}
                </h3>
              </div>
              <button
                onClick={copySummary}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs transition-colors border border-white/5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
              {summaryResult.summary}
            </div>
          </div>

          {/* Key Concepts Grid */}
          {summaryResult.key_concepts.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-violet-400" />
                <span>Extracted Key Concepts</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {summaryResult.key_concepts.map((kc, i) => (
                  <div
                    key={i}
                    className="glass-card p-5 rounded-2xl border border-white/5 space-y-2 text-xs"
                  >
                    <div className="font-bold text-cyan-300 text-sm">{kc.concept}</div>
                    <p className="text-slate-300 leading-relaxed">{kc.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Definitions Dictionary */}
          {summaryResult.definitions.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-400" />
                <span>Formal Academic Definitions</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {summaryResult.definitions.map((def, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-slate-900/70 border border-white/5 space-y-1.5 text-xs"
                  >
                    <div className="font-mono font-semibold text-violet-300">{def.term}</div>
                    <p className="text-slate-400 leading-relaxed">{def.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revision Notes & Potential Exam Questions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* High Yield Revision Notes */}
            {summaryResult.revision_notes.length > 0 && (
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit'] flex items-center gap-2 text-amber-400">
                  <Zap className="w-4 h-4" />
                  <span>High-Yield Revision Bullet Points</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {summaryResult.revision_notes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Anticipated Exam Questions */}
            {summaryResult.potential_questions.length > 0 && (
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-['Outfit'] flex items-center gap-2 text-emerald-400">
                  <HelpCircle className="w-4 h-4" />
                  <span>Anticipated Exam Questions</span>
                </h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {summaryResult.potential_questions.map((q, i) => (
                    <li key={i} className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-white/5">
                      <span className="font-mono text-emerald-400 font-bold shrink-0">Q{i + 1}:</span>
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
