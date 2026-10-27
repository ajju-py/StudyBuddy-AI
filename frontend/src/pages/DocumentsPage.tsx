import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Layers,
  FileCheck,
  RefreshCw,
  BookOpen,
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
      setUploadSuccess(
        `Successfully ingested "${uploaded.original_name}" (${uploaded.page_count} pages, ${uploaded.chunk_count} semantic passages indexed).`
      );
      await fetchDocuments();
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (docId: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from the document archive?`))
      return;
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
    <div className="space-y-8 animate-fade-in">
      {/* 1. EDITORIAL HEADER */}
      <div className="surface-card p-6 sm:p-8 rounded-xl border border-[#E5E2D9] space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#F3F1EC] border border-[#E5E2D9] text-[11px] font-mono text-[#57534E]">
          <BookOpen className="w-3.5 h-3.5 text-[#C25E34]" />
          <span className="uppercase tracking-wider">Document Ingestion & RAG</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#18181B] tracking-tight">
          Document Archive & Retrieval
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E] max-w-2xl leading-relaxed">
          Upload course textbooks, lecture slides, or revision notes. The PyMuPDF pipeline extracts selectable text, 
          generates semantic chunks with overlap, and enables verified page citations.
        </p>
      </div>

      {/* 2. RESTRAINED UPLOAD INTERFACE */}
      <div className="surface-card p-6 sm:p-8 rounded-xl border border-[#E5E2D9] space-y-4">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#D4CFBF] hover:border-[#C25E34] rounded-xl p-8 text-center transition-colors bg-[#FAF9F5]">
          <div className="w-12 h-12 rounded-full bg-[#F3F1EC] border border-[#E5E2D9] flex items-center justify-center mb-3 text-[#C25E34]">
            <Upload className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-serif-title font-bold text-[#18181B]">
            Ingest Study Materials
          </h3>
          <p className="text-xs text-[#57534E] max-w-md mt-1 mb-4 leading-relaxed">
            Upload PDF textbooks, DOCX lecture notes, or TXT/Markdown study guides up to 15 MB.
          </p>

          <label className="relative inline-flex items-center gap-2 px-4 py-2 rounded-lg btn-terracotta text-xs font-semibold shadow-xs cursor-pointer">
            <span>{isUploading ? 'Ingesting & Indexing...' : 'Select File from Disk'}</span>
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
          <div className="p-3 rounded-lg bg-[#EAF3EE] border border-[#2D5A43]/20 text-[#2D5A43] text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-ui font-medium">{uploadSuccess}</span>
          </div>
        )}

        {uploadError && (
          <div className="p-3 rounded-lg bg-[#FDF2F2] border border-[#C25E34]/30 text-[#C25E34] text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-ui font-medium">{uploadError}</span>
          </div>
        )}
      </div>

      {/* 3. PROFESSIONAL DOCUMENT ARCHIVE TABLE */}
      <div className="surface-card p-6 rounded-xl border border-[#E5E2D9] space-y-4">
        <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#18181B]" />
            <h2 className="font-serif-title font-bold text-sm text-[#18181B]">
              Ingested Document Library ({documents.length})
            </h2>
          </div>
          <button
            onClick={fetchDocuments}
            className="p-1.5 rounded-md bg-[#FAF9F5] hover:bg-[#EAE7DF] text-[#57534E] hover:text-[#18181B] border border-[#E5E2D9] transition-colors"
            title="Refresh library"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {documents.length === 0 ? (
          <div className="py-12 text-center text-[#8C877D] text-xs space-y-2 border border-dashed border-[#E5E2D9] rounded-lg bg-[#FAF9F5]">
            <FileText className="w-8 h-8 text-[#8C877D] mx-auto" />
            <p className="font-ui">No documents indexed yet. Upload a syllabus or lecture note to begin.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F5] text-[#57534E] font-mono uppercase text-[10px] border-b border-[#E5E2D9]">
                <tr>
                  <th className="p-3 font-semibold">Document Title</th>
                  <th className="p-3 font-semibold">Type</th>
                  <th className="p-3 font-semibold">Pages</th>
                  <th className="p-3 font-semibold">Indexed Passages</th>
                  <th className="p-3 font-semibold">Size</th>
                  <th className="p-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E2D9]">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="p-3 font-medium text-[#18181B] flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-[#C25E34]" />
                      <span className="truncate max-w-[280px] font-ui">{doc.original_name}</span>
                    </td>
                    <td className="p-3 font-mono text-[#57534E] uppercase text-[11px]">
                      {doc.file_type}
                    </td>
                    <td className="p-3 font-mono text-[#18181B]">{doc.page_count}</td>
                    <td className="p-3 font-mono text-[#18181B]">{doc.chunk_count}</td>
                    <td className="p-3 font-mono text-[#8C877D]">
                      {(doc.file_size / 1024).toFixed(1)} KB
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDelete(doc.id, doc.original_name)}
                        className="p-1.5 rounded text-[#8C877D] hover:text-[#C25E34] hover:bg-[#FAF9F5] transition-colors"
                        title="Delete from archive"
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
      <div className="surface-card p-6 rounded-xl border border-[#E5E2D9] space-y-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#C25E34]" />
            <h2 className="font-serif-title font-bold text-sm text-[#18181B]">
              Passage Retrieval Inspector
            </h2>
          </div>
          <p className="text-xs text-[#57534E] leading-relaxed">
            Verify semantic and keyword retrieval against your documents directly. 
            Inspect retrieved passages, page numbers, and relevance rankings.
          </p>
        </div>

        <form onSubmit={handleSearchPassages} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Inquire concept or query (e.g., 'lexical analysis', 'backpropagation', 'virtual memory')..."
            className="flex-1 bg-[#FAF9F5] border border-[#E5E2D9] rounded-lg px-3.5 py-2 text-xs text-[#18181B] placeholder-[#8C877D] focus:outline-none focus:border-[#C25E34]"
          />
          <button
            type="submit"
            disabled={!searchQuery.trim() || isSearching}
            className="px-4 py-2 rounded-lg btn-terracotta disabled:opacity-40 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <span>{isSearching ? 'Retrieving...' : 'Query Passages'}</span>
            <Search className="w-3.5 h-3.5" />
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-[11px] font-mono uppercase tracking-wider text-[#8C877D]">
              Retrieved Passages ({searchResults.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.map((result, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-lg bg-[#FAF9F5] border border-[#E5E2D9] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between text-[#18181B]">
                    <span className="font-semibold truncate max-w-[200px]">
                      {result.document_name}
                    </span>
                    <span className="text-[#C25E34] font-mono text-[11px]">
                      Page {result.page_number} • Score {result.relevance_score}
                    </span>
                  </div>
                  <p className="text-[#57534E] text-[11px] leading-relaxed italic font-serif bg-[#FFFFFF] p-3 rounded border border-[#E5E2D9]">
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

export default DocumentsPage;
