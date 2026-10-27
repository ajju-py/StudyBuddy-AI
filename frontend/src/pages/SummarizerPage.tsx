import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  FileText,
  HelpCircle,
  Bookmark,
  CheckCircle2,
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
    api.listDocuments()
      .then((res) => {
        setDocuments(res.documents);
        if (res.documents.length > 0) {
          setSelectedDocId(res.documents[0].id);
        }
      })
      .catch((err) => console.error(err));
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
    <div className="space-y-8 animate-fade-in">
      {/* 1. EDITORIAL HEADER */}
      <div className="surface-card p-6 sm:p-8 rounded-xl border border-[#E5E2D9] space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#F3F1EC] border border-[#E5E2D9] text-[11px] font-mono text-[#57534E]">
          <BookOpen className="w-3.5 h-3.5 text-[#C25E34]" />
          <span className="uppercase tracking-wider">Academic Synthesis Engine</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#18181B] tracking-tight">
          Knowledge Summarizer & Concept Extractor
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E] max-w-2xl leading-relaxed">
          Distill complex chapters, syllabus modules, or research papers into structured academic summaries,
          formal definitions, high-yield revision bullet points, and anticipated examination questions.
        </p>
      </div>

      {/* 2. SUMMARY CONTROLS & SOURCE SELECTION */}
      <div className="surface-card p-6 sm:p-8 rounded-xl border border-[#E5E2D9] space-y-6">
        <form onSubmit={handleSummarize} className="space-y-6">
          {/* Source Selector: Document vs. Text */}
          <div className="flex gap-2 border-b border-[#E5E2D9] pb-4">
            <button
              type="button"
              onClick={() => setSourceType('document')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                sourceType === 'document'
                  ? 'bg-[#18181B] text-[#FAF9F5] shadow-xs'
                  : 'bg-[#FAF9F5] text-[#57534E] hover:text-[#18181B] border border-[#E5E2D9]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ingested Document</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceType('text')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                sourceType === 'text'
                  ? 'bg-[#18181B] text-[#FAF9F5] shadow-xs'
                  : 'bg-[#FAF9F5] text-[#57534E] hover:text-[#18181B] border border-[#E5E2D9]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Direct Text Excerpt</span>
            </button>
          </div>

          {sourceType === 'document' ? (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#18181B]">
                Select Source Document:
              </label>
              {documents.length === 0 ? (
                <div className="p-4 rounded-lg bg-[#FAF9F5] border border-[#E5E2D9] text-xs text-[#8C877D]">
                  No study materials found. Please upload a PDF or notes file in the "Documents" tab first.
                </div>
              ) : (
                <select
                  value={selectedDocId || ''}
                  onChange={(e) => setSelectedDocId(Number(e.target.value))}
                  className="w-full bg-[#FAF9F5] border border-[#E5E2D9] rounded-lg px-3.5 py-2 text-xs text-[#18181B] focus:outline-none focus:border-[#C25E34]"
                >
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.original_name} ({d.file_type.toUpperCase()}, {d.page_count} pages)
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#18181B]">
                Paste Chapter Excerpt or Notes:
              </label>
              <textarea
                rows={5}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Paste paragraph or notes to extract knowledge..."
                className="w-full bg-[#FAF9F5] border border-[#E5E2D9] rounded-lg p-3 text-xs text-[#18181B] placeholder-[#8C877D] focus:outline-none focus:border-[#C25E34] font-ui"
              />
            </div>
          )}

          {/* Depth Options */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#18181B]">
              Summary Depth & Format:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'short', name: 'Executive Recap', desc: '1–2 concise paragraphs' },
                { id: 'medium', name: 'Balanced Overview', desc: 'Comprehensive section analysis' },
                { id: 'detailed', name: 'Technical Analysis', desc: 'In-depth conceptual breakdown' },
                { id: 'revision_notes', name: 'Exam Cheat-sheet', desc: 'High-yield bullet points' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setSummaryType(opt.id)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    summaryType === opt.id
                      ? 'bg-[#FFFFFF] border-[#C25E34] text-[#18181B] shadow-xs'
                      : 'bg-[#FAF9F5] border-[#E5E2D9] text-[#57534E] hover:text-[#18181B]'
                  }`}
                >
                  <div className="font-semibold text-xs text-[#18181B]">{opt.name}</div>
                  <div className="text-[11px] text-[#8C877D] mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || (sourceType === 'document' && !selectedDocId)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg btn-terracotta disabled:opacity-40 text-xs font-semibold shadow-xs flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Synthesizing Knowledge...' : 'Generate Academic Summary'}</span>
          </button>
        </form>
      </div>

      {/* 3. SYNTHESIZED RESULTS (EDITORIAL READING CANVAS) */}
      {summaryResult && (
        <div className="space-y-6">
          {/* Main Reading Card */}
          <div className="surface-card p-6 sm:p-8 rounded-xl border border-[#E5E2D9] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#C25E34] font-semibold">
                  {summaryResult.summary_type.replace('_', ' ').toUpperCase()} SYNTHESIS
                </span>
                <h3 className="text-lg font-serif-title font-bold text-[#18181B]">
                  {summaryResult.source_title}
                </h3>
              </div>
              <button
                onClick={copySummary}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#FAF9F5] hover:bg-[#F3F1EC] text-[#57534E] hover:text-[#18181B] text-xs transition-colors border border-[#E5E2D9]"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#2D5A43]" />
                    <span className="text-[#2D5A43]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#8C877D]" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="text-[#18181B] text-sm leading-relaxed whitespace-pre-wrap font-ui">
              {summaryResult.summary}
            </div>
          </div>

          {/* Key Concepts Grid */}
          {summaryResult.key_concepts.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#C25E34]" />
                <h3 className="font-serif-title font-bold text-sm text-[#18181B]">
                  Extracted Key Concepts
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {summaryResult.key_concepts.map((kc, i) => (
                  <div
                    key={i}
                    className="surface-card p-4 rounded-xl border border-[#E5E2D9] space-y-2 text-xs"
                  >
                    <div className="font-serif-title font-bold text-[#18181B] text-sm">
                      {kc.concept}
                    </div>
                    <p className="text-[#57534E] leading-relaxed font-ui">{kc.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Definitions Dictionary */}
          {summaryResult.definitions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#18181B]" />
                <h3 className="font-serif-title font-bold text-sm text-[#18181B]">
                  Formal Academic Definitions
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {summaryResult.definitions.map((def, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] space-y-1.5 text-xs"
                  >
                    <div className="font-mono font-bold text-[#C25E34] text-[11px]">
                      {def.term}
                    </div>
                    <p className="text-[#57534E] leading-relaxed font-ui">{def.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Revision Notes & Potential Exam Questions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* High Yield Revision Notes */}
            {summaryResult.revision_notes.length > 0 && (
              <div className="surface-card p-6 rounded-xl border border-[#E5E2D9] space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E5E2D9]">
                  <Zap className="w-4 h-4 text-[#2D5A43]" />
                  <h3 className="font-serif-title font-bold text-sm text-[#18181B]">
                    High-Yield Revision Notes
                  </h3>
                </div>
                <ul className="space-y-2.5 text-xs text-[#57534E]">
                  {summaryResult.revision_notes.map((note, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A43] shrink-0 mt-0.5" />
                      <span className="font-ui leading-relaxed">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Anticipated Exam Questions */}
            {summaryResult.potential_questions.length > 0 && (
              <div className="surface-card p-6 rounded-xl border border-[#E5E2D9] space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#E5E2D9]">
                  <HelpCircle className="w-4 h-4 text-[#C25E34]" />
                  <h3 className="font-serif-title font-bold text-sm text-[#18181B]">
                    Anticipated Exam Questions
                  </h3>
                </div>
                <ul className="space-y-2.5 text-xs text-[#57534E]">
                  {summaryResult.potential_questions.map((q, i) => (
                    <li
                      key={i}
                      className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E5E2D9] flex items-start gap-2.5"
                    >
                      <span className="font-mono text-[#C25E34] font-bold text-[11px] shrink-0">
                        Q{i + 1}:
                      </span>
                      <span className="font-ui text-[#18181B] leading-relaxed">{q}</span>
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

export default SummarizerPage;
