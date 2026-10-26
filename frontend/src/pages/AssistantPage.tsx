import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  GraduationCap,
  Binary,
  Brain,
  Zap,
  Terminal,
  Copy,
  Check,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { ChatMessage, CitationItem, DocumentInfo, ToolInvocationRecord } from '../types';
import { PROJECT_METADATA } from '../constants/metadata';

export const AssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [studyMode, setStudyMode] = useState<string>('explain_simply');
  const [sessionId, setSessionId] = useState<string | undefined>(undefined);
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedToolIndex, setExpandedToolIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    // Load documents list for optional targeting
    api.listDocuments().then((res) => {
      setDocuments(res.documents);
    }).catch((err) => console.error(err));

    // Initial greeting
    setMessages([
      {
        role: 'assistant',
        content:
          "Hello! I'm **StudyBuddy AI**, your autonomous academic study assistant.\n\n" +
          "Choose a study mode above to shape my explanations, or upload your course materials to ground my responses with exact page citations.\n\n" +
          "What concept would you like to master today?",
        study_mode: 'explain_simply',
      },
    ]);
  }, []);

  const handleSendMessage = async (customPrompt?: string) => {
    const promptToSend = customPrompt || inputMessage;
    if (!promptToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: promptToSend,
      study_mode: studyMode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const resp = await api.sendChatMessage({
        message: promptToSend,
        study_mode: studyMode,
        session_id: sessionId,
        document_id: selectedDocId,
        use_agent_tools: true,
      });

      setSessionId(resp.session_id);

      const aiMsg: ChatMessage = {
        role: 'assistant',
        content: resp.response,
        study_mode: resp.study_mode,
        tool_invocations: resp.tool_invocations,
        citations: resp.citations,
        created_at: resp.created_at,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        role: 'assistant',
        content: `⚠️ **Error communicating with StudyBuddy AI:** ${err.message || 'Unknown network error.'}`,
        study_mode: studyMode,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSession = () => {
    setSessionId(undefined);
    setMessages([
      {
        role: 'assistant',
        content:
          "New session started! What topic or problem set shall we tackle?",
        study_mode: studyMode,
      },
    ]);
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const samplePrompts = [
    "Explain how Virtual Memory & Paging works with a real-world analogy",
    "What are the most common exam questions on Dijkstra's Shortest Path Algorithm?",
    "Give me a technical deep-dive into Raft consensus leader election",
    "Quiz me on the differences between TCP and UDP",
  ];

  const getModeIcon = (modeId: string) => {
    switch (modeId) {
      case 'explain_simply': return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
      case 'exam_prep': return <GraduationCap className="w-3.5 h-3.5 text-sky-400" />;
      case 'deep_dive': return <Binary className="w-3.5 h-3.5 text-violet-400" />;
      case 'socratic_tutor': return <Brain className="w-3.5 h-3.5 text-pink-400" />;
      case 'quick_revision': return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col h-[calc(100vh-140px)] min-h-[600px]">
      {/* 1. TOP CONTROLS & STUDY MODE SELECTOR */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 mb-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">Study Mode:</span>
            <div className="flex flex-wrap gap-1.5">
              {PROJECT_METADATA.studyModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setStudyMode(mode.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    studyMode === mode.id
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-white/5'
                  }`}
                  title={mode.description}
                >
                  {getModeIcon(mode.id)}
                  <span>{mode.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Target Document Selector */}
            {documents.length > 0 && (
              <select
                value={selectedDocId || ''}
                onChange={(e) => setSelectedDocId(e.target.value ? Number(e.target.value) : undefined)}
                className="text-xs bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1 text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Uploaded Documents</option>
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    📄 {d.original_name.slice(0, 24)}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleNewSession}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-white/5 transition-colors"
              title="Start New Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. CHAT MESSAGES SCROLLER */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 mb-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
            >
              <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 px-1">
                {isUser ? (
                  <span>You</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <Sparkles className="w-3 h-3" />
                    <span>StudyBuddy AI ({msg.study_mode.replace('_', ' ')})</span>
                  </span>
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-4 sm:p-5 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-md'
                    : 'glass-panel border border-white/10 text-slate-200 rounded-tl-none space-y-3'
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {/* Agent Tool Invocations Inspector */}
                {msg.tool_invocations && msg.tool_invocations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400">
                      <span className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Autonomous Agent Tool Activity ({msg.tool_invocations.length})</span>
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {msg.tool_invocations.map((tool, tIdx) => {
                        const isExpanded = expandedToolIndex === tIdx;
                        return (
                          <div
                            key={tIdx}
                            className="rounded-lg bg-slate-950/80 border border-cyan-500/20 text-xs font-mono overflow-hidden"
                          >
                            <button
                              onClick={() => setExpandedToolIndex(isExpanded ? null : tIdx)}
                              className="w-full px-3 py-1.5 flex items-center justify-between text-left text-slate-300 hover:text-cyan-300"
                            >
                              <span className="text-cyan-400 font-semibold">{tool.tool_name}()</span>
                              {isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </button>
                            {isExpanded && (
                              <div className="p-3 bg-slate-950 border-t border-white/5 space-y-2 text-[11px] text-slate-400">
                                <div>
                                  <span className="text-slate-500">Arguments: </span>
                                  <pre className="text-slate-300 overflow-x-auto mt-1 p-2 bg-slate-900 rounded">
                                    {JSON.stringify(tool.arguments, null, 2)}
                                  </pre>
                                </div>
                                <div>
                                  <span className="text-slate-500">Execution Output: </span>
                                  <pre className="text-slate-300 overflow-x-auto mt-1 p-2 bg-slate-900 rounded">
                                    {JSON.stringify(tool.result, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Grounded Citations Badge */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                    <div className="text-[11px] font-mono text-violet-400 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Verified Sources & Citations:</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.citations.map((c, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-2.5 rounded-lg bg-slate-950/70 border border-violet-500/20 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between font-medium text-slate-200">
                            <span className="truncate max-w-[180px]">{c.document_name}</span>
                            <span className="text-cyan-400 text-[10px] font-mono">Page {c.page_number}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                            "{c.snippet}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Bottom Actions */}
                {!isUser && (
                  <div className="flex items-center justify-end gap-2 pt-1 text-slate-400">
                    <button
                      onClick={() => copyToClipboard(msg.content, index)}
                      className="inline-flex items-center gap-1 text-[11px] hover:text-white transition-colors"
                      title="Copy response"
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2 text-slate-400 text-xs font-mono">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 flex items-center justify-center animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="glass-panel p-3 rounded-xl border border-white/10 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-2 text-slate-300">StudyBuddy agent reasoning & inspecting tools...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. PROMPT SUGGESTIONS (if few messages) */}
      {messages.length <= 2 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(prompt)}
              className="text-xs px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 hover:border-cyan-500/40 transition-colors text-left"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* 4. INPUT BAR */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="glass-panel p-2 rounded-2xl border border-white/10 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={`Ask anything in ${studyMode.replace('_', ' ')} mode...`}
          disabled={isLoading}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-white font-medium text-xs shadow-md transition-all flex items-center gap-1.5"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
