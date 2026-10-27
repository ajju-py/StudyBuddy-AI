import React from 'react';
import {
  Info,
  GraduationCap,
  Building2,
  Calendar,
  ShieldCheck,
  Cpu,
  Key,
  Database,
  ExternalLink,
} from 'lucide-react';
import { PROJECT_METADATA } from '../constants/metadata';
import { HealthInfo } from '../types';

interface AboutSettingsPageProps {
  healthInfo: HealthInfo | null;
}

export const AboutSettingsPage: React.FC<AboutSettingsPageProps> = ({ healthInfo }) => {
  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* 1. EDITORIAL HEADER */}
      <div className="surface-card p-6 sm:p-8 rounded-xl border border-[#E5E2D9] space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#F3F1EC] border border-[#E5E2D9] text-[11px] font-mono text-[#57534E]">
          <Info className="w-3.5 h-3.5 text-[#C25E34]" />
          <span className="uppercase tracking-wider">Academic Documentation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif-title font-bold text-[#18181B] tracking-tight">
          System Identity & Configuration
        </h1>
        <p className="text-xs sm:text-sm text-[#57534E] max-w-2xl leading-relaxed">
          Mini-project documentation, verified student developer credits, Groq LLaMA 3.3 connectivity status, and data persistence architecture.
        </p>
      </div>

      {/* 2. VERIFIED STUDENT DEVELOPER CREDITS & INSTITUTION */}
      <div className="surface-card p-6 sm:p-8 rounded-xl border border-[#E5E2D9] space-y-6">
        <div className="flex items-center gap-2 border-b border-[#E5E2D9] pb-3">
          <GraduationCap className="w-4 h-4 text-[#C25E34]" />
          <h2 className="font-serif-title font-bold text-sm text-[#18181B]">
            Academic Project Developers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROJECT_METADATA.authors.map((author) => (
            <div
              key={author.name}
              className="p-5 rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] space-y-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#C25E34] flex items-center justify-center text-white font-serif-title font-bold text-sm shadow-xs">
                  {author.name[0]}
                </div>
                <div>
                  <h3 className="text-sm font-serif-title font-bold text-[#18181B]">{author.name}</h3>
                  <p className="text-xs text-[#C25E34] font-medium">{author.role}</p>
                </div>
              </div>
              <p className="text-xs text-[#57534E] pt-1 font-ui">
                {author.qualification}
              </p>
            </div>
          ))}
        </div>

        {/* Institution Details */}
        <div className="p-5 rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#18181B]">
            <Building2 className="w-4 h-4 text-[#C25E34]" />
            <span>Institution & Department</span>
          </div>
          <div className="text-xs text-[#57534E] space-y-1 font-ui">
            <div className="font-semibold text-[#18181B]">{PROJECT_METADATA.institution.name}</div>
            <div>{PROJECT_METADATA.institution.department}</div>
            <div className="text-[#8C877D]">
              {PROJECT_METADATA.institution.city}, {PROJECT_METADATA.institution.state}, {PROJECT_METADATA.institution.country}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#C25E34] font-mono pt-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Academic Year: {PROJECT_METADATA.academicYear}</span>
          </div>
        </div>
      </div>

      {/* 3. GROQ MODEL STATUS & CONFIGURATION */}
      <div className="surface-card p-6 sm:p-8 rounded-xl border border-[#E5E2D9] space-y-6">
        <div className="flex items-center justify-between border-b border-[#E5E2D9] pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#18181B]" />
            <h2 className="font-serif-title font-bold text-sm text-[#18181B]">
              Inference & Model Status
            </h2>
          </div>
          <span
            className={`px-2.5 py-0.5 rounded text-[11px] font-mono uppercase font-semibold ${
              healthInfo?.groq_configured
                ? 'bg-[#EAF3EE] text-[#2D5A43] border border-[#2D5A43]/20'
                : 'bg-[#FAF3E8] text-[#9A5B18] border border-[#9A5B18]/30'
            }`}
          >
            {healthInfo?.groq_configured ? 'Groq Active' : 'Demo Mode'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] space-y-1">
            <span className="text-[#8C877D] font-mono uppercase text-[10px]">Active Language Model</span>
            <div className="font-mono font-semibold text-[#18181B]">
              {healthInfo?.active_model || 'llama-3.3-70b-versatile'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] space-y-1">
            <span className="text-[#8C877D] font-mono uppercase text-[10px]">API Key Status</span>
            <div className="font-mono font-semibold text-[#18181B] flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-[#C25E34]" />
              <span>{healthInfo?.masked_key || 'Configured via .env'}</span>
            </div>
          </div>
        </div>

        {/* Setup Guide */}
        <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] space-y-2 text-xs text-[#57534E]">
          <h4 className="font-semibold text-[#18181B] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#2D5A43]" />
            <span>Secure Configuration Architecture</span>
          </h4>
          <p className="leading-relaxed font-ui">
            1. Free Groq API keys are generated at{' '}
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="text-[#C25E34] hover:underline inline-flex items-center gap-0.5 font-medium"
            >
              console.groq.com/keys <ExternalLink className="w-3 h-3" />
            </a>
            .<br />
            2. Configure <code>GROQ_API_KEY=gsk_...</code> in the root <code>.env</code> file.<br />
            3. Keys are accessed solely on the server side by FastAPI; no client JavaScript ever receives or transmits raw credentials.
          </p>
        </div>
      </div>

      {/* 4. PERSISTENCE ARCHITECTURE */}
      <div className="surface-card p-6 sm:p-8 rounded-xl border border-[#E5E2D9] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#E5E2D9] pb-3">
          <Database className="w-4 h-4 text-[#18181B]" />
          <h2 className="font-serif-title font-bold text-sm text-[#18181B]">
            Data Storage & Persistence Architecture
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] space-y-2">
            <h4 className="font-semibold text-[#18181B]">Local Persistence</h4>
            <p className="text-[#57534E] leading-relaxed font-ui">
              Lightweight SQLite engine managed by SQLAlchemy ORM. All chat histories, semantic passage chunks, quiz scores, and flashcard mastery flags persist in <code>backend/data/studybuddy.db</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E2D9] space-y-2">
            <h4 className="font-semibold text-[#18181B]">Cloud / Production Ready</h4>
            <p className="text-[#57534E] leading-relaxed font-ui">
              Easily swappable with managed PostgreSQL by configuring <code>DATABASE_URL</code> in <code>backend/.env</code>. The Vite frontend communicates via secure REST endpoints with CORS control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSettingsPage;
