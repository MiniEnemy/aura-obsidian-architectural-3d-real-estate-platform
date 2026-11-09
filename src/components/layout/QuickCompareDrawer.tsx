import React from 'react';
import { usePropertyContext } from '../../context/PropertyContext';
import { formatPrice } from '../../utils/formatters';
import { GitCompare, X, ArrowRight } from 'lucide-react';

interface QuickCompareDrawerProps {
  onGoToComparePage: () => void;
}

export const QuickCompareDrawer: React.FC<QuickCompareDrawerProps> = ({ onGoToComparePage }) => {
  const {
    compareList,
    toggleComp,
    properties,
    isCompareDrawerOpen,
    setIsCompareDrawerOpen,
    currentCurrency
  } = usePropertyContext();

  if (!isCompareDrawerOpen || compareList.length === 0) return null;

  const comparedProperties = properties.filter((p) => compareList.includes(p.id));

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-4 animate-fade-in font-mono text-xs select-none pointer-events-none">
      <div className="max-w-4xl mx-auto glass-modal rounded-xl border border-[#d4af37]/40 p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[#f5f6f8] font-semibold">
              Comparing {comparedProperties.length} Residence{comparedProperties.length > 1 ? 's' : ''}
            </div>
            <div className="text-[10px] text-[#9eacb8]">
              Side-by-side architectural specifications & floorplate analysis
            </div>
          </div>
        </div>

        {/* Selected Property Thumbnails */}
        <div className="flex items-center gap-3 overflow-x-auto py-1">
          {comparedProperties.map((prop) => (
            <div
              key={prop.id}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-[#14171d] border border-white/10 shrink-0"
            >
              <img
                src={prop.images.hero}
                alt={prop.name}
                loading="lazy"
                decoding="async"
                className="w-10 h-10 rounded object-cover"
              />
              <div className="truncate max-w-[120px]">
                <div className="text-[11px] text-[#f5f6f8] font-medium truncate">{prop.name}</div>
                <div className="text-[10px] text-[#d4af37]">
                  {formatPrice(prop.price, currentCurrency)}
                </div>
              </div>
              <button
                onClick={() => toggleComp(prop.id)}
                className="p-1 text-[#9eacb8] hover:text-rose-400"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCompareDrawerOpen(false)}
            className="px-3 py-2 rounded-lg text-[#9eacb8] hover:text-[#f5f6f8]"
          >
            Dismiss
          </button>

          <button
            onClick={onGoToComparePage}
            className="px-4 py-2 rounded-lg bg-[#d4af37] text-[#0c0e11] font-semibold tracking-wider uppercase text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:bg-[#e5c358] transition-all"
          >
            <span>Compare Matrix</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
