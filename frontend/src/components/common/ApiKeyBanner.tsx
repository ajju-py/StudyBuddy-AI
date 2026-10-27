import React from 'react';
import { AlertCircle, ArrowRight, Key } from 'lucide-react';

interface ApiKeyBannerProps {
  isConfigured: boolean;
  onNavigateToSetup: () => void;
}

export const ApiKeyBanner: React.FC<ApiKeyBannerProps> = ({ isConfigured, onNavigateToSetup }) => {
  if (isConfigured) return null;

  return (
    <div className="bg-[#FAF3E8] border-b border-[#E5E2D9] px-4 py-2">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#9A5B18]">
          <AlertCircle className="w-4 h-4 text-[#9A5B18] shrink-0" />
          <span>
            <strong className="font-semibold text-[#18181B]">Local Demonstration Mode:</strong> Groq API key is not yet set in environment. Responses will operate with fallback templates.
          </span>
        </div>
        <button
          onClick={onNavigateToSetup}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#FFFFFF] hover:bg-[#F5ECD7] text-[#9A5B18] border border-[#9A5B18]/30 font-medium transition-colors shadow-xs"
        >
          <Key className="w-3.5 h-3.5" />
          <span>Configure API Key</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default ApiKeyBanner;
