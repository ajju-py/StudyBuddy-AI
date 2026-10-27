import React from 'react';
import { Network, ArrowRight } from 'lucide-react';

interface FallbackSceneProps {
  reason?: string;
  onSelectConcept?: (conceptName: string) => void;
}

const CONCEPTS = [
  { name: 'Data Structures', category: 'Foundations', connections: ['Algorithms', 'Database Systems'] },
  { name: 'Algorithms', category: 'Core Theory', connections: ['Machine Learning', 'Compiler Design'] },
  { name: 'Computer Architecture', category: 'Systems', connections: ['Operating Systems'] },
  { name: 'Operating Systems', category: 'Systems', connections: ['Distributed Systems', 'Computer Networks'] },
  { name: 'Computer Networks', category: 'Infrastructure', connections: ['Distributed Systems'] },
  { name: 'Database Systems', category: 'Data & Storage', connections: ['Distributed Systems'] },
  { name: 'Distributed Systems', category: 'Advanced Systems', connections: [] },
  { name: 'Machine Learning', category: 'AI & Analytics', connections: [] },
];

export const FallbackScene: React.FC<FallbackSceneProps> = ({ reason, onSelectConcept }) => {
  return (
    <div className="surface-card rounded-xl p-6 border border-[#E5E2D9] space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E2D9]">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-[#C25E34]" />
          <h3 className="font-semibold text-sm text-[#18181B] font-serif-title">
            Curriculum Knowledge Graph
          </h3>
        </div>
        {reason && (
          <span className="text-[11px] font-mono text-[#8C877D] bg-[#F5F3ED] px-2 py-0.5 rounded">
            {reason}
          </span>
        )}
      </div>

      <p className="text-xs text-[#57534E] leading-relaxed">
        Conceptual prerequisite network mapping core computer science subjects. Select any topic to inspect its relationships or launch an active study session.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
        {CONCEPTS.map((concept) => (
          <div
            key={concept.name}
            onClick={() => onSelectConcept?.(concept.name)}
            className="p-3.5 rounded-lg border border-[#E5E2D9] bg-[#FDFCFB] hover:border-[#C25E34]/50 hover:bg-[#FBF2ED] transition-all cursor-pointer group space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-[#8C877D] tracking-wider">
                {concept.category}
              </span>
              <ArrowRight className="w-3 h-3 text-[#C25E34] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-xs font-semibold text-[#18181B] group-hover:text-[#C25E34] transition-colors">
              {concept.name}
            </div>
            {concept.connections.length > 0 && (
              <div className="text-[11px] text-[#57534E]">
                Feeds into: <span className="font-medium text-[#18181B]">{concept.connections.join(', ')}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
