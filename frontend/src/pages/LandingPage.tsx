import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Brain,
  FileText,
  FileQuestion,
  Layers,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Building2,
  Terminal,
} from 'lucide-react';
import { KnowledgeSphereScene } from '../components/3d/KnowledgeSphereScene';
import { PROJECT_METADATA } from '../constants/metadata';

interface LandingPageProps {
  onStartLearning: () => void;
  onExploreAssistant: () => void;
  onNavigateTab: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartLearning,
  onExploreAssistant,
  onNavigateTab,
}) => {
  return (
    <div className="space-y-24 py-6">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Value Prop */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Academic Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-sm shadow-cyan-500/10">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Agent Development — Academic Mini Project {PROJECT_METADATA.academicYear}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white font-['Outfit'] leading-tight">
                Learn Smarter. <br />
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
                  Understand Deeper.
                </span> <br />
                Prepare Better.
              </h1>

              {/* Tagline & Subtext */}
              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed">
                StudyBuddy AI combines autonomous Groq-powered AI agent tool calling, deep document retrieval, grounded citations, and adaptive study modes to accelerate academic mastery.
              </p>

              {/* Primary Call to Actions */}
              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={onStartLearning}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold shadow-lg shadow-cyan-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Launch Study Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onExploreAssistant}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-200 font-medium transition-all hover:border-cyan-500/40"
                >
                  <Brain className="w-4 h-4 text-cyan-400" />
                  <span>Ask AI Assistant</span>
                </button>
              </div>

              {/* Mini Highlights */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10 text-slate-400 text-xs">
                <div className="space-y-1">
                  <div className="font-semibold text-slate-200">8 Controlled Tools</div>
                  <div>Agentic tool-calling</div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-slate-200">Grounded Citations</div>
                  <div>PDF & DOCX page retrieval</div>
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-slate-200">Exam Grading</div>
                  <div>Deterministic scoring</div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive 3D Knowledge Sphere */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              <div className="w-full max-w-[500px] aspect-square rounded-3xl glass-panel-glow p-2 relative overflow-hidden">
                <KnowledgeSphereScene />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE CAPABILITIES (4 PILLARS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <div className="text-xs font-mono uppercase tracking-wider text-cyan-400">Core Architecture</div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-['Outfit']">
            Engineered for Serious Academic Success
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm">
            Not just a generic chatbot. StudyBuddy AI implements deterministic tools, verified document grounding, and pedagogical study modes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: AI Agent */}
          <div
            onClick={() => onNavigateTab('assistant')}
            className="glass-card p-6 rounded-2xl cursor-pointer group space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">Autonomous Study Agent</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Equipped with 8 strict tools including passage search, quiz formulation, and concept dissection across 5 study modes.
            </p>
            <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
              <span>Try Assistant</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Document Ingestion */}
          <div
            onClick={() => onNavigateTab('documents')}
            className="glass-card p-6 rounded-2xl cursor-pointer group space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">Document Ingestion & QA</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ingests PDF (PyMuPDF), DOCX, TXT, and Markdown files. Chunks with overlap and retrieves passages with exact page citations.
            </p>
            <div className="text-xs font-semibold text-violet-400 flex items-center gap-1">
              <span>Manage Documents</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Quiz Examination */}
          <div
            onClick={() => onNavigateTab('quiz')}
            className="glass-card p-6 rounded-2xl cursor-pointer group space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <FileQuestion className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">Practice Examination Hall</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multiple-choice, true/false, and short-answer exams. Evaluated with deterministic server-side grading and rationales.
            </p>
            <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <span>Take a Quiz</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Spaced Flashcards */}
          <div
            onClick={() => onNavigateTab('flashcards')}
            className="glass-card p-6 rounded-2xl cursor-pointer group space-y-4"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">Interactive Flashcards</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              3D flip animation, memory hints, and spaced repetition tracking. Isolate difficult cards for focused pre-exam revision.
            </p>
            <div className="text-xs font-semibold text-amber-400 flex items-center gap-1">
              <span>Drill Flashcards</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS WORKFLOW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/10 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
              How StudyBuddy AI Works
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              A 4-step autonomous pipeline from syllabus material to exam confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="text-2xl font-extrabold text-cyan-400 font-mono">01</div>
              <h4 className="font-semibold text-white text-sm">Upload Study Material</h4>
              <p className="text-xs text-slate-400">
                Upload course lecture notes, textbooks, or research papers in PDF, Word, or Markdown format.
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="text-2xl font-extrabold text-sky-400 font-mono">02</div>
              <h4 className="font-semibold text-white text-sm">Ask & Retrieve</h4>
              <p className="text-xs text-slate-400">
                Select your preferred study mode. The AI agent searches semantic passages and provides grounded citations.
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="text-2xl font-extrabold text-violet-400 font-mono">03</div>
              <h4 className="font-semibold text-white text-sm">Test Your Knowledge</h4>
              <p className="text-xs text-slate-400">
                Generate tailored exams and interactive flashcard decks with automatic server-side scoring.
              </p>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-slate-900/60 border border-white/5">
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">04</div>
              <h4 className="font-semibold text-white text-sm">Track Real Progress</h4>
              <p className="text-xs text-slate-400">
                Track your real test averages, mastered flashcards, and timetable completion with authentic analytics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. STUDENT CREDITS & ACADEMIC BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900/90 via-[#0a101f] to-slate-900/90 border border-cyan-500/20 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-500/30 text-xs font-mono text-cyan-300">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Academic Mini Project Credits</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
                Student Engineering Team
              </h3>
            </div>
            <div className="text-right text-xs text-slate-400">
              <span className="font-semibold text-slate-200">Academic Year:</span> {PROJECT_METADATA.academicYear}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROJECT_METADATA.authors.map((author) => (
              <div
                key={author.name}
                className="p-5 rounded-2xl bg-slate-950/60 border border-white/5 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-white shrink-0 font-bold">
                  {author.name[0]}
                </div>
                <div className="space-y-1">
                  <div className="text-base font-bold text-white">{author.name}</div>
                  <div className="text-xs text-cyan-400 font-medium">{author.role}</div>
                  <div className="text-xs text-slate-400">{author.qualification}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-950/40 border border-white/5 flex items-center gap-3 text-xs text-slate-400">
            <Building2 className="w-5 h-5 text-violet-400 shrink-0" />
            <div>
              <span className="text-slate-200 font-medium">{PROJECT_METADATA.institution.name}</span>,{' '}
              {PROJECT_METADATA.institution.city}, {PROJECT_METADATA.institution.state}, {PROJECT_METADATA.institution.country}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
