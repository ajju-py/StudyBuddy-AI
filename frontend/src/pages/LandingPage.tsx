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
  BookOpen,
  Compass,
  Zap,
} from 'lucide-react';
import { KnowledgeSphereScene } from '../components/3d/KnowledgeSphereScene';
import { PROJECT_METADATA } from '../constants/metadata';

interface LandingPageProps {
  onStartLearning: () => void;
  onExploreAssistant: () => void;
  onNavigateTab: (tab: string) => void;
  onSelectConcept?: (concept: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartLearning,
  onExploreAssistant,
  onNavigateTab,
  onSelectConcept,
}) => {
  return (
    <div className="space-y-20 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
      {/* 1. HERO SECTION: EDITORIAL TYPOGRAPHY & CS KNOWLEDGE GRAPH */}
      <section className="pt-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left: Product Identity & Clear Narrative */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#F3F1EC] border border-[#E5E2D9] text-[11px] font-mono text-[#57534E]">
              <Sparkles className="w-3.5 h-3.5 text-[#C25E34]" />
              <span className="uppercase tracking-wider">
                Academic Mini Project • {PROJECT_METADATA.academicYear}
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif-title font-bold text-[#18181B] leading-[1.15] tracking-tight">
                An art-directed study companion for rigorous engineering curricula.
              </h1>
              <p className="text-sm sm:text-base text-[#57534E] leading-relaxed max-w-xl font-ui">
                StudyBuddy AI pairs an autonomous Groq-powered reasoning tutor with local document grounding, 
                exact textbook page citations, deterministic examination grading, and spaced flashcards.
              </p>
            </div>

            {/* Entry Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={onStartLearning}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg btn-terracotta text-xs font-semibold shadow-xs"
              >
                <span>Launch Study Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={onExploreAssistant}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg btn-secondary text-xs font-medium text-[#18181B]"
              >
                <Brain className="w-4 h-4 text-[#8C877D]" />
                <span>Inquire With AI Tutor</span>
              </button>
            </div>

            {/* Architectural Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E5E2D9] text-xs">
              <div className="space-y-0.5">
                <div className="font-mono font-bold text-[#18181B]">8 Native Tools</div>
                <div className="text-[11px] text-[#8C877D]">Autonomous tool calling</div>
              </div>
              <div className="space-y-0.5">
                <div className="font-mono font-bold text-[#18181B]">Page Grounding</div>
                <div className="text-[11px] text-[#8C877D]">PyMuPDF passage retrieval</div>
              </div>
              <div className="space-y-0.5">
                <div className="font-mono font-bold text-[#18181B]">Deterministic</div>
                <div className="text-[11px] text-[#8C877D]">Objective exam grading</div>
              </div>
            </div>
          </div>

          {/* Right: Meaningful 3D Computer Science Curriculum Graph */}
          <div className="lg:col-span-6 flex flex-col items-center">
            <div className="w-full aspect-[4/3] rounded-xl surface-card border border-[#E5E2D9] overflow-hidden shadow-xs relative">
              <KnowledgeSphereScene onSelectConcept={onSelectConcept} />
            </div>
            <p className="text-[11px] text-[#8C877D] font-mono mt-2 text-center">
              Interactive 3D Curriculum Graph • Drag to rotate, scroll to zoom, click node to inspect
            </p>
          </div>
        </div>
      </section>

      {/* 2. REALISTIC STUDY WORKSPACE PREVIEW */}
      <section className="space-y-4">
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#C25E34] font-semibold">
            Product Surface
          </span>
          <h2 className="text-xl sm:text-2xl font-serif-title font-bold text-[#18181B]">
            Engineered Around The Actual Study Desk
          </h2>
          <p className="text-xs text-[#57534E]">
            No gimmicks or floating neon spheres. Just a focused, high-contrast academic interface.
          </p>
        </div>

        {/* Realistic Workspace Mockup Frame */}
        <div className="surface-card rounded-xl border border-[#E5E2D9] shadow-xs overflow-hidden">
          {/* Top Window Bar */}
          <div className="bg-[#FAF9F5] px-4 py-2.5 border-b border-[#E5E2D9] flex items-center justify-between text-xs font-mono text-[#8C877D]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5E2D9]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5E2D9]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5E2D9]" />
              <span className="ml-2 text-[11px] text-[#57534E]">StudyBuddy Workspace • Overview</span>
            </div>
            <span className="text-[10px] uppercase font-semibold text-[#2D5A43]">
              Groq LLaMA 3.3 Connected
            </span>
          </div>

          {/* Inner Interface Preview */}
          <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 bg-[#F9F8F6]">
            {/* Sidebar Preview Column */}
            <div className="hidden md:block md:col-span-3 surface-sidebar p-3 rounded-lg border border-[#E5E2D9] space-y-2 text-xs">
              <div className="text-[10px] font-mono uppercase text-[#8C877D] px-2 font-semibold">
                Modules
              </div>
              <div className="p-2 rounded bg-[#FFFFFF] font-semibold text-[#C25E34] border border-[#E5E2D9] flex items-center gap-2">
                <Compass className="w-3.5 h-3.5" />
                <span>Overview</span>
              </div>
              <div className="p-2 rounded text-[#57534E] flex items-center gap-2">
                <Brain className="w-3.5 h-3.5" />
                <span>AI Tutor</span>
              </div>
              <div className="p-2 rounded text-[#57534E] flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                <span>Documents</span>
              </div>
              <div className="p-2 rounded text-[#57534E] flex items-center gap-2">
                <FileQuestion className="w-3.5 h-3.5" />
                <span>Quizzes</span>
              </div>
            </div>

            {/* Central Content Preview Column */}
            <div className="md:col-span-9 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="surface-card p-3 rounded-lg border border-[#E5E2D9] space-y-1">
                  <div className="text-[10px] font-mono text-[#8C877D] uppercase">Average Score</div>
                  <div className="text-xl font-mono font-bold text-[#2D5A43]">84%</div>
                </div>
                <div className="surface-card p-3 rounded-lg border border-[#E5E2D9] space-y-1">
                  <div className="text-[10px] font-mono text-[#8C877D] uppercase">Questions Solved</div>
                  <div className="text-xl font-mono font-bold text-[#18181B]">42</div>
                </div>
                <div className="surface-card p-3 rounded-lg border border-[#E5E2D9] space-y-1">
                  <div className="text-[10px] font-mono text-[#8C877D] uppercase">Flashcards</div>
                  <div className="text-xl font-mono font-bold text-[#C25E34]">28 Mastered</div>
                </div>
              </div>

              {/* Sample AI Citation Card */}
              <div className="surface-card p-4 rounded-lg border border-[#E5E2D9] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#18181B] font-semibold">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-[#C25E34]" />
                    <span>Operating Systems Concepts (10th Ed.)</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#C25E34]">p. 214</span>
                </div>
                <p className="text-[#57534E] text-[11px] italic font-serif leading-relaxed">
                  "Demand paging allows a process to execute even if only a fraction of its total address space is resident in physical memory..."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUR CORE CAPABILITIES */}
      <section className="space-y-6">
        <div className="text-center space-y-1.5 max-w-xl mx-auto">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#C25E34] font-semibold">
            Capability Matrix
          </span>
          <h2 className="text-xl sm:text-2xl font-serif-title font-bold text-[#18181B]">
            Engineered For Authentic Exam Readiness
          </h2>
          <p className="text-xs text-[#57534E]">
            A unified suite of tools designed to transform syllabus documents into long-term recall.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1 */}
          <div
            onClick={() => onNavigateTab('assistant')}
            className="surface-card p-5 rounded-xl border border-[#E5E2D9] hover:border-[#C25E34] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#FAF9F5] border border-[#E5E2D9] flex items-center justify-center text-[#C25E34] group-hover:bg-[#C25E34] group-hover:text-white transition-colors">
                <Brain className="w-4 h-4" />
              </div>
              <h3 className="font-serif-title font-bold text-sm text-[#18181B]">
                Adaptive AI Tutor
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed font-ui">
                Eight strict agent tools and 5 pedagogical modes from Socratic inquiry to technical proof.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E2D9] text-[11px] font-medium text-[#C25E34] flex items-center gap-1">
              <span>Open Assistant</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => onNavigateTab('documents')}
            className="surface-card p-5 rounded-xl border border-[#E5E2D9] hover:border-[#C25E34] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#FAF9F5] border border-[#E5E2D9] flex items-center justify-center text-[#18181B] group-hover:bg-[#18181B] group-hover:text-white transition-colors">
                <FileText className="w-4 h-4" />
              </div>
              <h3 className="font-serif-title font-bold text-sm text-[#18181B]">
                Document Ingestion & RAG
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed font-ui">
                PyMuPDF extracts selectable text, chunks semantic segments, and attaches page citations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E2D9] text-[11px] font-medium text-[#18181B] flex items-center gap-1">
              <span>Inspect Archive</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => onNavigateTab('quiz')}
            className="surface-card p-5 rounded-xl border border-[#E5E2D9] hover:border-[#C25E34] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#FAF9F5] border border-[#E5E2D9] flex items-center justify-center text-[#2D5A43] group-hover:bg-[#2D5A43] group-hover:text-white transition-colors">
                <FileQuestion className="w-4 h-4" />
              </div>
              <h3 className="font-serif-title font-bold text-sm text-[#18181B]">
                Examination Hall
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed font-ui">
                Deterministic server-side grading, detailed diagnostic feedback, and historical attempt ledgers.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E2D9] text-[11px] font-medium text-[#2D5A43] flex items-center gap-1">
              <span>Take Assessment</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4 */}
          <div
            onClick={() => onNavigateTab('flashcards')}
            className="surface-card p-5 rounded-xl border border-[#E5E2D9] hover:border-[#C25E34] transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-lg bg-[#FAF9F5] border border-[#E5E2D9] flex items-center justify-center text-[#C25E34] group-hover:bg-[#C25E34] group-hover:text-white transition-colors">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="font-serif-title font-bold text-sm text-[#18181B]">
                Tactile Spaced Recall
              </h3>
              <p className="text-xs text-[#57534E] leading-relaxed font-ui">
                Smooth 3D flip interaction, memory hint reveal, and difficulty tagging for targeted review.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#E5E2D9] text-[11px] font-medium text-[#C25E34] flex items-center gap-1">
              <span>Drill Flashcards</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. STUDENT CREDITS & ACADEMIC ATTRIBUTION */}
      <section className="surface-card p-6 sm:p-8 rounded-xl border border-[#E5E2D9] space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5E2D9] pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#F3F1EC] border border-[#E5E2D9] text-[11px] font-mono text-[#57534E]">
              <GraduationCap className="w-3.5 h-3.5 text-[#C25E34]" />
              <span className="uppercase">Academic Project Credits</span>
            </div>
            <h3 className="text-lg font-serif-title font-bold text-[#18181B]">
              Student Engineering Team
            </h3>
          </div>
          <div className="text-xs font-mono text-[#8C877D]">
            Academic Year: {PROJECT_METADATA.academicYear}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROJECT_METADATA.authors.map((author) => (
            <div
              key={author.name}
              className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] flex items-start gap-3.5"
            >
              <div className="w-8 h-8 rounded-lg bg-[#C25E34] flex items-center justify-center text-white shrink-0 font-serif-title font-bold text-xs shadow-xs">
                {author.name[0]}
              </div>
              <div className="space-y-0.5 min-w-0">
                <div className="text-sm font-serif-title font-bold text-[#18181B] truncate">
                  {author.name}
                </div>
                <div className="text-xs text-[#C25E34] font-medium font-ui">{author.role}</div>
                <div className="text-[11px] text-[#57534E] font-ui">{author.qualification}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-lg bg-[#FAF9F5] border border-[#E5E2D9] flex items-center gap-2.5 text-xs text-[#57534E]">
          <Building2 className="w-4 h-4 text-[#C25E34] shrink-0" />
          <div className="font-ui">
            <span className="font-semibold text-[#18181B]">{PROJECT_METADATA.institution.name}</span>,{' '}
            {PROJECT_METADATA.institution.department}, {PROJECT_METADATA.institution.city}, India
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
