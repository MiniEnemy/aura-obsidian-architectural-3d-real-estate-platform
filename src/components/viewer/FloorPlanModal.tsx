import React from 'react';
import { useViewerContext } from '../../context/ViewerContext';
import { usePropertyContext } from '../../context/PropertyContext';
import { X, MapPin, Maximize2, Compass, Layers } from 'lucide-react';

export const FloorPlanModal: React.FC = () => {
  const { activeProperty } = usePropertyContext();
  const {
    activeTool,
    setActiveTool,
    currentFloorId,
    setCurrentFloorId,
    currentRoomId,
    jumpToRoom
  } = useViewerContext();

  if (activeTool !== 'floorplan') return null;

  const currentFloor =
    activeProperty.floors.find((f) => f.id === currentFloorId) ||
    activeProperty.floors[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl glass-modal rounded-xl border border-[#d4af37]/30 p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#d4af37] tracking-widest uppercase mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Two-Way Interactive Blueprint</span>
            </div>
            <h2 className="font-display text-2xl text-[#f5f6f8]">
              {activeProperty.name} — Floor Plan
            </h2>
          </div>

          <button
            onClick={() => setActiveTool('none')}
            className="p-2 rounded-lg text-[#9eacb8] hover:text-[#f5f6f8] hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Floor Level Tabs */}
        <div className="flex items-center gap-2 mt-4 pb-2 border-b border-white/5">
          {activeProperty.floors.map((fl) => {
            const isSelected = fl.id === currentFloor.id;
            return (
              <button
                key={fl.id}
                onClick={() => setCurrentFloorId(fl.id)}
                className={`px-4 py-2 rounded-lg text-xs font-mono tracking-wider transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#d4af37] text-[#0c0e11] font-bold shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                    : 'bg-[#181c22] text-[#9eacb8] hover:text-[#f5f6f8] border border-white/5'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{fl.label}</span>
              </button>
            );
          })}
        </div>

        {/* Blueprint Diagram & Room Grid */}
        <div className="flex-1 overflow-y-auto py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Blueprint SVG Layout Canvas */}
          <div className="lg:col-span-2 relative min-h-[340px] bg-[#0c0e11] rounded-lg border border-[#d4af37]/20 p-4 flex flex-col justify-between overflow-hidden">
            {/* Architectural Grid Watermark */}
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle, #99907c 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />

            {/* Room Boxes Layout for the active floor */}
            <div className="relative z-10 w-full h-full min-h-[300px] grid grid-cols-2 sm:grid-cols-3 gap-3 p-2">
              {currentFloor.rooms.map((room) => {
                const isActive = currentRoomId === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => {
                      jumpToRoom(room.id);
                      setActiveTool('none');
                    }}
                    className={`relative p-3 rounded-lg border transition-all duration-200 text-left flex flex-col justify-between group ${
                      isActive
                        ? 'bg-[#d4af37]/15 border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.25)] ring-1 ring-[#d4af37]'
                        : 'bg-[#14171d]/90 border-white/10 hover:border-[#d4af37]/50 hover:bg-[#1a1e26]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono tracking-widest text-[#9eacb8] uppercase">
                          {room.dimensions}
                        </span>
                        {isActive && (
                          <span className="flex items-center gap-1 text-[10px] font-mono text-[#d4af37] font-semibold">
                            <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
                            HERE
                          </span>
                        )}
                      </div>
                      <h4
                        className={`font-display text-sm ${
                          isActive
                            ? 'text-[#f2ca50] font-semibold'
                            : 'text-[#e2e2e6] group-hover:text-[#f5f6f8]'
                        }`}
                      >
                        {room.name}
                      </h4>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs font-mono">
                      <span className="text-[#d4af37]">{room.areaSqm} m²</span>
                      <span className="text-[10px] text-[#9eacb8] group-hover:text-[#d4af37] transition-colors flex items-center gap-1">
                        Teleport →
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Blueprint Legend */}
            <div className="relative z-10 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[#9eacb8]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
                Click room to smoothly teleport 3D camera
              </span>
              <span>SCALE: 1:100 ARCHITECTURAL</span>
            </div>
          </div>

          {/* Room Details Sidebar */}
          <div className="flex flex-col gap-4 bg-[#14171d]/80 rounded-lg border border-white/5 p-4 overflow-y-auto max-h-[420px]">
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#d4af37]">
              Floor Specifications
            </h3>

            <div className="space-y-3">
              {currentFloor.rooms.map((room) => {
                const isActive = currentRoomId === room.id;
                return (
                  <div
                    key={room.id}
                    onClick={() => {
                      jumpToRoom(room.id);
                      setActiveTool('none');
                    }}
                    className={`p-3 rounded border cursor-pointer transition-all ${
                      isActive
                        ? 'border-[#d4af37] bg-[#d4af37]/10'
                        : 'border-white/5 hover:border-white/20 bg-[#181c22]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="font-display text-sm text-[#f5f6f8]">{room.name}</h5>
                      <span className="text-xs font-mono text-[#d4af37]">{room.areaSqm} m²</span>
                    </div>
                    <p className="text-xs text-[#9eacb8] line-clamp-2 leading-relaxed">
                      {room.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {room.features.slice(0, 2).map((feat, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/5 text-[#d0c5af]"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
