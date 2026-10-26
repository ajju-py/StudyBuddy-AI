import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  Search,
  CheckCircle,
  AlertCircle,
  Clock,
  Layers,
  FileCheck,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { DocumentInfo, CitationItem } from '../types';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Passage retrieval playground
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CitationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const resp = await api.listDocuments();
      setDocuments(resp.documents);
    } catch (err: any) {
      console.error('Failed to load documents:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(null);

    try {
      const uploaded = await api.uploadDocument(file);
      setUploadSuccess(`Successfully ingested "${uploaded.original_name}" (${uploaded.page_count} pages, ${uploaded.chunk_count} semantic chunks).`);
      await fetchDocuments();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDelete = async (docId: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.deleteDocument(docId);
      await fetchDocuments();
      setSearchResults((prev) => prev.filter((r) => r.document_id !== docId));
    } catch (err: any) {
      alert(`Failed to delete document: ${err.message}`);
    }
  };

  const handleSearchPassages = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isSearching) return;

    setIsSearching(true);
    try {
      const res = await api.searchPassages(searchQuery, 4);
      setSearchResults(res.results);
    } catch (err: any) {
      alert(`Search failed: ${err.message}`);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* 1. HEADER */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-2.5">
          <FileText className="w-7 h-7 text-cyan-400" />
          <span>Study Document Ingestion & Retrieval</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
          Upload PDF textbooks, Word lecture notes, or Markdown summaries. The engine extracts selectable text, chunks semantic segments with overlap, and generates exact page citations.
        </p>
      </div>

      {/* 2. UPLOAD BOX */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-4">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/60 rounded-2xl p-8 text-center transition-colors bg-slate-900/40">
          <Upload className="w-10 h-10 text-cyan-400 mb-3 animate-bounce" />
          <h3 className="text-sm font-semibold text-white">Upload Syllabus Material</h3>
          <p className="text-xs text-slate-400 max-w-md mt-1 mb-4">
            Supports PDF, DOCX, TXT, and Markdown files up to 15 MB.
          </p>

          <label className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-xs shadow-md shadow-cyan-500/25 cursor-pointer transition-all">
            <span>{isUploading ? 'Ingesting & Chunking...' : 'Select File from Computer'}</span>
            <input
              type="file"
              accept=".pdf,.docx,.txt,.md"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="sr-only"
            />
          </label>
        </div>

        {uploadSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {uploadError && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>

      {/* 3. DOCUMENT LIST */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span>Ingested Documents ({documents.length})</span>
          </h2>
          <button
            onClick={fetchDocuments}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5"
            title="Refresh list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs space-y-2">
            <FileText className="w-8 h-8 text-slate-600 mx-auto" />
            <p>No study materials uploaded yet. Upload a PDF or Word document above to test!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] border-b border-white/5">
                <tr>
                  <th className="p-3">Document Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Pages</th>
                  <th className="p-3">Chunks</th>
                  <th className="p-3">Size</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 font-medium text-white flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-cyan-400" />
                      <span className="truncate max-w-[260px]">{doc.original_name}</span>
                    </td>
                    <td className="p-3 font-mono text-cyan-400">{doc.file_type}</td>
                    <td className="p-3 text-slate-300">{doc.page_count}</td>
                    <td className="p-3 text-slate-300">{doc.chunk_count}</td>
                    <td className="p-3 text-slate-400">{(doc.file_size / 1024).toFixed(1)} KB</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDelete(doc.id, doc.original_name)}
                        className="p-1.5 rounded text-rose-400 hover:bg-rose-500/20 transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. PASSAGE RETRIEVAL PLAYGROUND */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
            <Search className="w-4 h-4 text-violet-400" />
            <span>Passage Retrieval Playground</span>
          </h2>
          <p className="text-xs text-slate-400">
            Test the BM25-inspired passage search directly. Enter any concept to see retrieved passages and relevance scores.
          </p>
        </div>

        <form onSubmit={handleSearchPassages} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search concept or question (e.g., 'lexical analysis', 'backpropagation', 'virtual memory')..."
            className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={!searchQuery.trim() || isSearching}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-xs flex items-center gap-1.5"
          >
            <span>{isSearching ? 'Searching...' : 'Retrieve Passages'}</span>
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Retrieved Passages ({searchResults.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.map((result, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950/80 border border-violet-500/20 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="font-semibold text-white truncate max-w-[200px]">
                      {result.document_name}
                    </span>
                    <span className="text-cyan-400 font-mono text-[11px]">
                      Page {result.page_number} • Score {result.relevance_score}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed italic bg-slate-900/60 p-2.5 rounded-lg border border-white/5">
                    "{result.snippet}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
