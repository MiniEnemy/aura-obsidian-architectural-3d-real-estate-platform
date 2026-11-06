import React, { useState } from 'react';
import { useViewerContext } from '../../context/ViewerContext';
import { usePropertyContext } from '../../context/PropertyContext';
import { Compass, ChevronUp, ChevronDown, MapPin } from 'lucide-react';

interface MiniMapHUDProps {
  cameraCoords?: { x: number; z: number; rotation: number };
}

export const MiniMapHUD: React.FC<MiniMapHUDProps> = ({ cameraCoords }) => {
  const { activeProperty } = usePropertyContext();
  const { currentFloorId, currentRoomId, jumpToRoom, isExterior } = useViewerContext();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isExterior) return null;

  const currentFloor =
    activeProperty.floors.find((f) => f.id === currentFloorId) ||
    activeProperty.floors[0];

  const currentRoom = currentFloor.rooms.find((r) => r.id === currentRoomId);

  return (
    <div className="absolute top-20 left-5 z-20 font-mono text-xs select-none">
      <div className="glass-panel p-3 rounded-lg border border-[#d4af37]/25 shadow-2xl flex flex-col gap-2 w-56">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <div className="flex items-center gap-1.5 text-[11px] text-[#d4af37] tracking-wider uppercase">
            <Compass className="w-3.5 h-3.5" />
            <span>Mini Radar</span>
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-[#9eacb8] hover:text-[#f5f6f8]"
          >
            {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {!isCollapsed && (
          <>
            {/* Current Room Readout */}
            <div className="flex items-center gap-2 py-1">
              <MapPin className="w-3.5 h-3.5 text-[#d4af37] shrink-0" />
              <div className="overflow-hidden">
                <div className="text-[10px] text-[#9eacb8] uppercase tracking-wider">
                  {currentFloor.label}
                </div>
                <div className="text-xs font-semibold text-[#f5f6f8] truncate">
                  {currentRoom ? currentRoom.name : 'Interior Foyer'}
                </div>
              </div>
            </div>

            {/* Radar Mini Schematic */}
            <div className="relative w-full h-24 bg-[#0a0c0e] rounded border border-white/10 p-2 overflow-hidden flex items-center justify-center">
              {/* Grid Lines */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(to right, #99907c 1px, transparent 1px), linear-gradient(to bottom, #99907c 1px, transparent 1px)',
                  backgroundSize: '16px 16px'
                }}
              />

              {/* Room Teleport Dots */}
              {currentFloor.rooms.map((rm) => {
                const isSelected = rm.id === currentRoomId;
                const leftPct = Math.min(90, Math.max(10, 50 + rm.cameraPosition.x * 3.4));
                const topPct = Math.min(90, Math.max(10, 50 - rm.cameraPosition.z * 3.0));

                return (
                  <button
                    key={rm.id}
                    onClick={() => jumpToRoom(rm.id)}
                    title={`${rm.name} (${rm.areaSqm}m²)`}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all rounded-full ${
                      isSelected
                        ? 'w-3 h-3 bg-[#d4af37] ring-4 ring-[#d4af37]/30 z-20'
                        : 'w-2 h-2 bg-[#9eacb8] hover:bg-[#d4af37] hover:scale-125 z-10'
                    }`}
                    style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                  />
                );
              })}

              {/* Live Camera Position */}
              {cameraCoords && (
                <div
                  className="absolute w-2.5 h-2.5 bg-[#f2ca50] rounded-full z-30 shadow-[0_0_8px_#f2ca50]"
                  style={{
                    left: `${Math.min(90, Math.max(10, 50 + cameraCoords.x * 3.4))}%`,
                    top: `${Math.min(90, Math.max(10, 50 - cameraCoords.z * 3.0))}%`
                  }}
                />
              )}
            </div>

            {/* Telemetry info */}
            <div className="flex items-center justify-between text-[9px] text-[#9eacb8] pt-1">
              <span>ELEV: {currentFloor.elevation}m</span>
              <span>
                {cameraCoords ? `AZ: ${Math.round((cameraCoords.rotation * 180) / Math.PI)}°` : 'AZ: 0°'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
