import React from 'react';
import { Menu, Sparkles, Key, CheckCircle2 } from 'lucide-react';
import { HealthInfo } from '../../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  healthInfo: HealthInfo | null;
  onToggleMobileMenu: () => void;
}

const SECTION_TITLES: Record<string, { title: string; subtitle: string }> = {
  landing: { title: 'StudyBuddy AI', subtitle: 'Product Story & Curriculum Architecture' },
  dashboard: { title: 'Workspace Overview', subtitle: 'Study metrics and active roadmaps' },
  assistant: { title: 'AI Study Assistant', subtitle: 'Adaptive pedagogical inquiry & tool calling' },
  documents: { title: 'Document Archive', subtitle: 'Ingestion, text extraction & page passage retrieval' },
  summarizer: { title: 'Knowledge Summarizer', subtitle: 'Multi-tier notes, definitions & exam questions' },
  quiz: { title: 'Examination Hall', subtitle: 'Deterministic test taking & scoring diagnostic' },
  flashcards: { title: 'Tactile Flashcards', subtitle: '3D spaced recall & targeted difficulty drill' },
  planner: { title: 'Study Timetable', subtitle: 'Prioritized exam preparation schedule' },
  analytics: { title: 'Performance Analytics', subtitle: 'Verified persistent study metrics' },
  about: { title: 'Settings & Identity', subtitle: 'Academic documentation, model health & credits' },
};

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  healthInfo,
  onToggleMobileMenu,
}) => {
  const currentSection = SECTION_TITLES[activeTab] || SECTION_TITLES.dashboard;

  return (
    <header className="sticky top-0 z-30 w-full h-14 bg-[#F9F8F6]/90 backdrop-blur-md border-b border-[#E5E2D9] px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Section Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-1.5 rounded-md hover:bg-[#EAE7DF] text-[#57534E]"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-baseline gap-2">
          <h1 className="text-base font-bold text-[#18181B] font-serif-title leading-tight">
            {currentSection.title}
          </h1>
          <span className="hidden sm:inline-block text-[11px] text-[#8C877D] font-ui">
            / {currentSection.subtitle}
          </span>
        </div>
      </div>

      {/* Right: Status & Quick Actions */}
      <div className="flex items-center gap-3">
        {healthInfo?.groq_configured ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#EAF3EE] text-[#2D5A43] border border-[#2D5A43]/20 text-[11px] font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2D5A43]" />
            <span>Groq Connected</span>
          </div>
        ) : (
          <button
            onClick={() => setActiveTab('about')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FAF3E8] text-[#9A5B18] border border-[#9A5B18]/30 text-[11px] font-mono hover:bg-[#F5ECD7] transition-colors"
          >
            <Key className="w-3 h-3 text-[#9A5B18]" />
            <span>Configure Groq Key</span>
          </button>
        )}

        {activeTab === 'landing' ? (
          <button
            onClick={() => setActiveTab('dashboard')}
            className="px-3 py-1 rounded-md btn-terracotta text-xs font-semibold shadow-xs"
          >
            Enter Workspace
          </button>
        ) : (
          <button
            onClick={() => setActiveTab('landing')}
            className="px-3 py-1 rounded-md btn-secondary text-xs font-medium text-[#57534E]"
          >
            Product Story
          </button>
        )}
      </div>
    </header>
  );
};
