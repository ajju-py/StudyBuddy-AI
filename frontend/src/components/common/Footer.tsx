import React from 'react';
import { Sparkles, GraduationCap, Building2, Calendar, ShieldCheck, Heart } from 'lucide-react';
import { PROJECT_METADATA } from '../../constants/metadata';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-[#060911] text-slate-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 pb-8 border-b border-white/5">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-white font-['Outfit']">
                StudyBuddy<span className="text-cyan-400">.AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              {PROJECT_METADATA.fullTitle} — {PROJECT_METADATA.tagline}
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Academic Mini Project • {PROJECT_METADATA.academicYear}</span>
            </div>
          </div>

          {/* Student Credits Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>Developed By</span>
            </div>
            <div className="space-y-2">
              {PROJECT_METADATA.authors.map((author) => (
                <div key={author.name} className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5">
                  <div className="text-xs font-semibold text-slate-200">{author.name}</div>
                  <div className="text-[11px] text-cyan-400/90">{author.role}</div>
                  <div className="text-[10px] text-slate-400">{author.qualification}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Institution Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-violet-400" />
              <span>Institution</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900/60 border border-white/5 space-y-1.5 text-xs">
              <div className="font-medium text-slate-200">
                {PROJECT_METADATA.institution.name}
              </div>
              <div className="text-slate-400 text-[11px]">
                {PROJECT_METADATA.institution.department}
              </div>
              <div className="text-slate-400 text-[11px]">
                {PROJECT_METADATA.institution.city}, {PROJECT_METADATA.institution.state}, {PROJECT_METADATA.institution.country}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-cyan-400 pt-1">
                <Calendar className="w-3 h-3" />
                <span>Academic Year: {PROJECT_METADATA.academicYear}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} StudyBuddy AI. Developed for academic excellence.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Powered by Groq LPU™ Inference & PyMuPDF</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
