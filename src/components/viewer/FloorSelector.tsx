import React from 'react';
import { useViewerContext } from '../../context/ViewerContext';
import { usePropertyContext } from '../../context/PropertyContext';
import { Building2 } from 'lucide-react';

export const FloorSelector: React.FC = () => {
  const { activeProperty } = usePropertyContext();
  const { currentFloorId, jumpToFloor } = useViewerContext();

  if (!activeProperty || activeProperty.floors.length <= 1) {
    return null;
  }

  return (
    <div className="absolute top-20 right-5 z-20 flex flex-col items-end gap-1.5 font-mono text-xs select-none">
      <div className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] tracking-widest text-[#9eacb8] uppercase glass-hud-submerged rounded">
        <Building2 className="w-3 h-3 text-[#d4af37]" />
        <span>Floor Plate</span>
      </div>

      <div className="glass-hud p-1 rounded-lg flex flex-col gap-1 border border-[#d4af37]/20 shadow-xl">
        {activeProperty.floors.map((fl) => {
          const isActive = currentFloorId === fl.id;
          return (
            <button
              key={fl.id}
              onClick={() => jumpToFloor(fl.id)}
              className={`px-3 py-2 rounded text-left transition-all duration-200 flex items-center justify-between gap-3 ${
                isActive
                  ? 'bg-[#d4af37] text-[#0c0e11] font-semibold shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                  : 'text-[#9eacb8] hover:text-[#f5f6f8] hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-bold">{fl.level < 10 ? `0${fl.level}` : fl.level}</span>
                <span className="text-[11px] font-sans font-normal tracking-tight">
                  {fl.label}
                </span>
              </div>
              <span className="text-[10px] opacity-75">{fl.rooms.length} R</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
