import React from 'react';
import { AlertCircle, ArrowRight, Key } from 'lucide-react';

interface ApiKeyBannerProps {
  isConfigured: boolean;
  onNavigateToSetup: () => void;
}

export const ApiKeyBanner: React.FC<ApiKeyBannerProps> = ({ isConfigured, onNavigateToSetup }) => {
  if (isConfigured) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-amber-500/15 border-b border-amber-500/30 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-amber-200">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="font-semibold text-amber-300">Local Demonstration Mode:</strong> Groq API key is not configured. Live AI generation and tool calling require a valid Groq key.
          </span>
        </div>
        <button
          onClick={onNavigateToSetup}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-medium transition-colors"
        >
          <Key className="w-3.5 h-3.5" />
          <span>Setup API Key</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
