import React from 'react';
import { useViewerContext } from '../../context/ViewerContext';
import { X, Sparkles, Check, ToggleLeft, ToggleRight, Info } from 'lucide-react';

export const ObjectInspectorModal: React.FC = () => {
  const {
    selectedObject,
    setSelectedObject,
    doorsOpenState,
    toggleDoor,
    lightsOnState,
    toggleLight,
    curtainsOpenState,
    toggleCurtain
  } = useViewerContext();

  if (!selectedObject) return null;

  const isDoor = selectedObject.type === 'door';
  const isLight = selectedObject.type === 'light';
  const isCurtain = selectedObject.type === 'window';

  const doorState = doorsOpenState[selectedObject.id] || false;
  const lightState = lightsOnState[selectedObject.id] !== false;
  const curtainState = curtainsOpenState[selectedObject.id] !== false;

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-6 z-40 w-96 glass-hud-modal rounded-xl border border-[#d4af37]/40 p-5 shadow-2xl font-mono text-xs animate-fade-in">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-[#d4af37] tracking-widest uppercase font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Architectural Element Dossier</span>
        </div>
        <button
          onClick={() => setSelectedObject(null)}
          className="p-1 rounded text-[#9eacb8] hover:text-[#f5f6f8]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="py-4 space-y-3">
        <div>
          <span className="text-[10px] text-[#9eacb8] tracking-widest uppercase">
            SPECIFICATION / {selectedObject.type}
          </span>
          <h3 className="font-display text-lg text-[#f5f6f8] mt-0.5">
            {selectedObject.name}
          </h3>
        </div>

        <p className="text-xs font-sans text-[#e2e2e6] leading-relaxed">
          {selectedObject.description}
        </p>

        {/* Detailed specifications if available */}
        {selectedObject.details && (
          <div className="bg-[#12151a]/90 rounded-lg p-3 border border-white/5 space-y-2">
            {selectedObject.details.designer && (
              <div className="flex justify-between">
                <span className="text-[#9eacb8]">DESIGNER / ATELIER:</span>
                <span className="text-[#f5f6f8] font-semibold">
                  {selectedObject.details.designer}
                </span>
              </div>
            )}
            {selectedObject.details.material && (
              <div className="flex justify-between">
                <span className="text-[#9eacb8]">MATERIALITY:</span>
                <span className="text-[#d4af37]">{selectedObject.details.material}</span>
              </div>
            )}
            {selectedObject.details.spec && (
              <div className="flex justify-between">
                <span className="text-[#9eacb8]">TECH SPEC:</span>
                <span className="text-[#e2e2e6]">{selectedObject.details.spec}</span>
              </div>
            )}
          </div>
        )}

        {/* Interactive Action Controls */}
        <div className="pt-2">
          {isDoor && (
            <button
              onClick={() => toggleDoor(selectedObject.id)}
              className="w-full py-2.5 px-4 rounded-lg bg-[#d4af37] text-[#0c0e11] font-semibold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:bg-[#e5c358] transition-all"
            >
              {doorState ? (
                <>
                  <ToggleRight className="w-4 h-4" />
                  <span>Swing Door Closed</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  <span>Swing Door Open</span>
                </>
              )}
            </button>
          )}

          {isLight && (
            <button
              onClick={() => toggleLight(selectedObject.id)}
              className="w-full py-2.5 px-4 rounded-lg bg-[#d4af37] text-[#0c0e11] font-semibold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:bg-[#e5c358] transition-all"
            >
              {lightState ? (
                <>
                  <ToggleRight className="w-4 h-4" />
                  <span>Turn Off Lighting Fixture</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  <span>Illuminate Chandelier</span>
                </>
              )}
            </button>
          )}

          {isCurtain && (
            <button
              onClick={() => toggleCurtain(selectedObject.id)}
              className="w-full py-2.5 px-4 rounded-lg bg-[#d4af37] text-[#0c0e11] font-semibold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:bg-[#e5c358] transition-all"
            >
              {curtainState ? (
                <>
                  <ToggleRight className="w-4 h-4" />
                  <span>Close Balcony Sliders</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4" />
                  <span>Open Balcony Sliders</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
