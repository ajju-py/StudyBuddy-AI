import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  BookOpen,
  FileQuestion,
  Layers,
  Calendar,
  BarChart3,
  Settings,
  GraduationCap,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { PROJECT_METADATA } from '../../constants/metadata';
import { HealthInfo } from '../../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  healthInfo: HealthInfo | null;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  healthInfo,
  mobileOpen,
  setMobileOpen,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'assistant', label: 'AI Tutor', icon: MessageSquare },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'summarizer', label: 'Summaries', icon: BookOpen },
    { id: 'quiz', label: 'Quizzes', icon: FileQuestion },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'planner', label: 'Study Planner', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-[#18181B]/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 surface-sidebar flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top: Branding */}
        <div className="p-5 border-b border-[#E5E2D9] space-y-3">
          <div
            onClick={() => handleNavClick('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#C25E34] text-white flex items-center justify-center font-bold text-sm shadow-xs group-hover:bg-[#A54C26] transition-colors">
              SB
            </div>
            <div>
              <div className="font-serif-title font-bold text-base text-[#18181B] leading-none">
                StudyBuddy
              </div>
              <div className="text-[10px] font-mono text-[#8C877D] tracking-wider uppercase mt-0.5">
                AI Assistant • v{PROJECT_METADATA.version}
              </div>
            </div>
          </div>

          {/* Model Status Pill */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-[#FDFCFB] border border-[#E5E2D9] text-[11px]">
            <span className="text-[#57534E] font-medium flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  healthInfo?.groq_configured ? 'bg-[#2D5A43]' : 'bg-[#C25E34]'
                }`}
              />
              <span className="font-mono text-[10px] uppercase">
                {healthInfo?.groq_configured ? 'Groq Active' : 'Demo Mode'}
              </span>
            </span>
            <span className="font-mono text-[10px] text-[#8C877D]">
              LLaMA 3.3
            </span>
          </div>
        </div>

        {/* Middle: Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[#8C877D] px-3 py-1 font-semibold">
            Study Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[#FFFFFF] text-[#C25E34] font-semibold border border-[#E5E2D9] shadow-xs'
                    : 'text-[#57534E] hover:text-[#18181B] hover:bg-[#EAE7DF]'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-[#C25E34]' : 'text-[#8C877D]'
                  }`}
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom: Settings, Project Info & Credits */}
        <div className="p-3 border-t border-[#E5E2D9] space-y-1 bg-[#EFECE5]">
          <button
            onClick={() => handleNavClick('landing')}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'landing'
                ? 'bg-[#FFFFFF] text-[#18181B] font-semibold border border-[#E5E2D9]'
                : 'text-[#57534E] hover:text-[#18181B] hover:bg-[#E6E2D8]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C25E34]" />
              <span>Product Story</span>
            </span>
            <ExternalLink className="w-3 h-3 text-[#8C877D]" />
          </button>

          <button
            onClick={() => handleNavClick('about')}
            className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'about'
                ? 'bg-[#FFFFFF] text-[#C25E34] font-semibold border border-[#E5E2D9]'
                : 'text-[#57534E] hover:text-[#18181B] hover:bg-[#E6E2D8]'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-[#8C877D]" />
            <span>Settings & Credits</span>
          </button>

          {/* Academic Attribution Tag */}
          <div className="pt-2 px-3 pb-1 text-[10px] text-[#8C877D] border-t border-[#E5E2D9] mt-2">
            <div className="font-medium text-[#57534E]">Ajay Tandale & Sakshi Thombre</div>
            <div>MIT Chhatrapati Sambhajinagar</div>
            <div className="font-mono text-[9px] mt-0.5">Academic Mini Project 2026–27</div>
          </div>
        </div>
      </aside>
    </>
  );
};
