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
  Lock,
} from 'lucide-react';
import { PROJECT_METADATA } from '../constants/metadata';
import { HealthInfo } from '../types';

interface AboutSettingsPageProps {
  healthInfo: HealthInfo | null;
}

export const AboutSettingsPage: React.FC<AboutSettingsPageProps> = ({ healthInfo }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      {/* 1. HEADER */}
      <div className="space-y-2 border-b border-white/10 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-2.5">
          <Info className="w-7 h-7 text-cyan-400" />
          <span>Project Identity, Academic Credits & Configuration</span>
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
          Academic Mini Project documentation, verified student developer credits, model connection status, and security architecture.
        </p>
      </div>

      {/* 2. VERIFIED STUDENT CREDITS & INSTITUTION */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
          <GraduationCap className="w-4 h-4" />
          <span>Academic Project Developers</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PROJECT_METADATA.authors.map((author) => (
            <div
              key={author.name}
              className="p-5 rounded-2xl bg-slate-900/80 border border-white/5 space-y-2"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-white font-bold text-base">
                  {author.name[0]}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{author.name}</h3>
                  <p className="text-xs text-cyan-400 font-medium">{author.role}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 pt-1">
                {author.qualification}
              </p>
            </div>
          ))}
        </div>

        <div className="p-5 rounded-2xl bg-slate-950/60 border border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Building2 className="w-4 h-4 text-violet-400" />
            <span>Institution & Department</span>
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <div className="font-semibold text-white">{PROJECT_METADATA.institution.name}</div>
            <div>{PROJECT_METADATA.institution.department}</div>
            <div className="text-slate-400">
              {PROJECT_METADATA.institution.city}, {PROJECT_METADATA.institution.state}, {PROJECT_METADATA.institution.country}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono pt-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>Academic Year: {PROJECT_METADATA.academicYear}</span>
          </div>
        </div>
      </div>

      {/* 3. GROQ MODEL STATUS & CONFIGURATION */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-cyan-400">
            <Cpu className="w-4 h-4" />
            <span>AI Model & Inference Configuration</span>
          </div>
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-mono uppercase ${
              healthInfo?.groq_configured
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {healthInfo?.groq_configured ? 'Groq Connected' : 'Demonstration Mode'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400">Active Groq Model</span>
            <div className="font-mono font-semibold text-white">
              {healthInfo?.active_model || 'llama-3.3-70b-versatile'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <span className="text-slate-400">API Key Status</span>
            <div className="font-mono font-semibold text-slate-200 flex items-center gap-2">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>{healthInfo?.masked_key || 'Not Configured'}</span>
            </div>
          </div>
        </div>

        {/* Setup Guide for Key */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-500/20 space-y-2 text-xs text-slate-300">
          <h4 className="font-semibold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>How to Configure Groq API Key</span>
          </h4>
          <p className="text-slate-400 leading-relaxed">
            1. Obtain a free API key at{' '}
            <a
              href="https://console.groq.com/keys"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:underline inline-flex items-center gap-0.5"
            >
              console.groq.com/keys <ExternalLink className="w-3 h-3" />
            </a>
            .<br />
            2. Copy <code>.env.example</code> to <code>.env</code> in the project directory.<br />
            3. Set <code>GROQ_API_KEY=gsk_...</code> and restart the backend.<br />
            4. The backend securely reads the key and keeps it off all client JavaScript.
          </p>
        </div>
      </div>

      {/* 4. PERSISTENCE & DEPLOYMENT ARCHITECTURE */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-violet-400">
          <Database className="w-4 h-4" />
          <span>Storage & Deployment Architecture</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
            <h4 className="font-semibold text-white">Local Development</h4>
            <p className="text-slate-400 leading-relaxed">
              Uses lightweight SQLite with SQLAlchemy ORM. All chat sessions, chunks, quiz scores, and flashcard mastery records persist locally in <code>backend/data/studybuddy.db</code>.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
            <h4 className="font-semibold text-white">Production Vercel Deployment</h4>
            <p className="text-slate-400 leading-relaxed">
              React + Vite frontend hosts on Vercel with zero runtime friction. FastAPI backend connects via <code>VITE_API_BASE_URL</code> to a hosted Python container with managed PostgreSQL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
