import React from 'react';
import { GraduationCap, Building2, Calendar, ShieldCheck } from 'lucide-react';
import { PROJECT_METADATA } from '../../constants/metadata';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#E5E2D9] bg-[#F3F1EC] text-[#57534E] text-xs py-8 mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-[#E5E2D9]">
          {/* Col 1: Project Identity */}
          <div className="space-y-1.5">
            <div className="font-serif-title font-bold text-sm text-[#18181B]">
              {PROJECT_METADATA.fullTitle}
            </div>
            <p className="text-xs text-[#57534E] leading-relaxed">
              {PROJECT_METADATA.tagline}
            </p>
            <div className="text-[11px] font-mono text-[#8C877D] pt-1">
              {PROJECT_METADATA.category} • {PROJECT_METADATA.academicYear}
            </div>
          </div>

          {/* Col 2: Developers */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#18181B] uppercase tracking-wider font-mono">
              <GraduationCap className="w-3.5 h-3.5 text-[#C25E34]" />
              <span>Developed By</span>
            </div>
            {PROJECT_METADATA.authors.map((a) => (
              <div key={a.name} className="text-xs">
                <span className="font-semibold text-[#18181B]">{a.name}</span>
                <span className="text-[#8C877D]"> — {a.role}</span>
                <div className="text-[11px] text-[#57534E]">{a.qualification}</div>
              </div>
            ))}
          </div>

          {/* Col 3: Academic Institution */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#18181B] uppercase tracking-wider font-mono">
              <Building2 className="w-3.5 h-3.5 text-[#1E3A5F]" />
              <span>Institution</span>
            </div>
            <div className="text-xs text-[#18181B] font-medium">
              {PROJECT_METADATA.institution.name}
            </div>
            <div className="text-[11px] text-[#57534E]">
              {PROJECT_METADATA.institution.department}
            </div>
            <div className="text-[11px] text-[#8C877D]">
              {PROJECT_METADATA.institution.city}, {PROJECT_METADATA.institution.state}, {PROJECT_METADATA.institution.country}
            </div>
          </div>
        </div>

        {/* Bottom Attribution */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-[#8C877D]">
          <div>
            Built with Groq LPU™ Inference, PyMuPDF, FastAPI, and React.
          </div>
          <div>
            Academic Year {PROJECT_METADATA.academicYear} • Maharashtra Institute of Technology
          </div>
        </div>
      </div>
    </footer>
  );
};
