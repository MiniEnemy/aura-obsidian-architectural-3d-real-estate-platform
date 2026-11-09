import React from 'react';
import { useViewerContext } from '../../context/ViewerContext';
import { usePropertyContext } from '../../context/PropertyContext';
import { X, Layers, ChevronRight, Check } from 'lucide-react';

export const RoomSelectorDrawer: React.FC = () => {
  const { activeProperty } = usePropertyContext();
  const { activeTool, setActiveTool, currentRoomId, jumpToRoom } = useViewerContext();

  if (activeTool !== 'rooms') return null;

  return (
    <div className="absolute top-20 right-5 z-40 w-80 max-h-[75vh] glass-hud-modal rounded-xl border border-[#d4af37]/30 p-4 shadow-2xl flex flex-col overflow-hidden animate-fade-in font-mono text-xs">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-[#d4af37] tracking-wider uppercase">
          <Layers className="w-3.5 h-3.5" />
          <span>Spatial Room Directory</span>
        </div>
        <button
          onClick={() => setActiveTool('none')}
          className="p-1 rounded text-[#9eacb8] hover:text-[#f5f6f8] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Floors and Rooms List */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4 pr-1">
        {activeProperty.floors.map((floor) => (
          <div key={floor.id} className="space-y-1.5">
            <div className="px-2 py-1 text-[10px] tracking-widest text-[#9eacb8] uppercase bg-white/5 rounded flex items-center justify-between">
              <span>{floor.label}</span>
              <span>{floor.rooms.length} Rooms</span>
            </div>

            <div className="space-y-1">
              {floor.rooms.map((room) => {
                const isCurrent = currentRoomId === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => {
                      jumpToRoom(room.id);
                      setActiveTool('none');
                    }}
                    className={`w-full px-3 py-2.5 rounded text-left transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-[#d4af37] text-[#0c0e11] font-semibold shadow-[0_0_12px_rgba(212,175,55,0.3)]'
                        : 'bg-[#181c22]/80 text-[#e2e2e6] hover:bg-[#222730] hover:text-[#d4af37] border border-white/5'
                    }`}
                  >
                    <div>
                      <div className="font-sans text-xs font-medium">{room.name}</div>
                      <div
                        className={`text-[10px] ${
                          isCurrent ? 'text-[#0c0e11]/80' : 'text-[#9eacb8]'
                        }`}
                      >
                        {room.areaSqm} m² • {room.dimensions}
                      </div>
                    </div>

                    {isCurrent ? (
                      <Check className="w-4 h-4 text-[#0c0e11]" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
