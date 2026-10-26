import React from 'react';
import { Sparkles, Brain, Cpu, BookOpen } from 'lucide-react';

interface FallbackSceneProps {
  reason?: string;
}

export const FallbackScene: React.FC<FallbackSceneProps> = ({ reason }) => {
  return (
    <div className="relative w-full h-[360px] md:h-[480px] flex items-center justify-center overflow-hidden rounded-2xl glass-panel border border-cyan-500/20">
      {/* Ambient Radial Glow */}
      <div className="absolute inset-0 bg-radial from-cyan-500/10 via-violet-500/5 to-transparent blur-2xl" />

      {/* Decorative Constellation Rings */}
      <div className="relative w-72 h-72 rounded-full border border-cyan-500/30 animate-pulse flex items-center justify-center">
        <div className="w-56 h-56 rounded-full border border-violet-500/30 animate-[spin_12s_linear_infinite] flex items-center justify-center">
          <div className="w-40 h-40 rounded-full border border-cyan-400/40 animate-[spin_8s_linear_infinite_reverse] flex items-center justify-center">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-cyan-600 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Brain className="w-12 h-12 text-white animate-pulse" />
            </div>
          </div>
        </div>

        {/* Orbiting Concept Nodes */}
        <div className="absolute top-2 left-10 p-2.5 rounded-full bg-slate-900 border border-cyan-500/40 text-cyan-400 shadow-md">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="absolute bottom-4 right-10 p-2.5 rounded-full bg-slate-900 border border-violet-500/40 text-violet-400 shadow-md">
          <Cpu className="w-4 h-4" />
        </div>
        <div className="absolute top-1/2 -left-3 p-2.5 rounded-full bg-slate-900 border border-cyan-400/40 text-cyan-300 shadow-md">
          <BookOpen className="w-4 h-4" />
        </div>
      </div>

      {/* Accessible caption */}
      <div className="absolute bottom-4 text-center px-4">
        <p className="text-xs font-medium text-slate-400">
          Knowledge Network Visualization {reason ? `(${reason})` : ''}
        </p>
      </div>
    </div>
  );
};
