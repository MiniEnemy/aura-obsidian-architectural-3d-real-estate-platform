import React, { useState, useEffect } from 'react';
import { useViewerContext } from '../../context/ViewerContext';
import { usePropertyContext } from '../../context/PropertyContext';
import { ThreeDViewer } from '../viewer/ThreeDViewer';
import { ViewerToolbar } from '../viewer/ViewerToolbar';
import { FloorSelector } from '../viewer/FloorSelector';
import { FloorPlanModal } from '../viewer/FloorPlanModal';
import { MiniMapHUD } from '../viewer/MiniMapHUD';
import { RoomSelectorDrawer } from '../viewer/RoomSelectorDrawer';
import { LightingControlModal } from '../viewer/LightingControlModal';
import { GuidedTourHUD } from '../viewer/GuidedTourHUD';
import { ObjectInspectorModal } from '../viewer/ObjectInspectorModal';
import { TutorialModal } from '../viewer/TutorialModal';
import { VRModal } from '../viewer/VRModal';
import { ARModal } from '../viewer/ARModal';
import { Panorama360View } from '../viewer/Panorama360View';
import { isTutorialDismissed } from '../../utils/storage';
import {
  ArrowLeft,
  Sliders,
  Sparkles,
  Tag,
  Glasses,
  Calendar,
  Maximize2
} from 'lucide-react';

interface ViewerPageProps {
  onBackToProperty: () => void;
}

export const ViewerPage: React.FC<ViewerPageProps> = ({ onBackToProperty }) => {
  const { activeProperty } = usePropertyContext();
  const {
    currentFloorId,
    currentRoomId,
    isExterior,
    quality,
    setQuality,
    showRoomLabels,
    setShowRoomLabels
  } = useViewerContext();

  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [isVROpen, setIsVROpen] = useState(false);
  const [isAROpen, setIsAROpen] = useState(false);
  const [cameraCoords, setCameraCoords] = useState<{ x: number; z: number; rotation: number }>({
    x: 0,
    z: 0,
    rotation: 0
  });

  // Open tutorial on first visit if not yet dismissed
  useEffect(() => {
    if (!isTutorialDismissed()) {
      setIsTutorialOpen(true);
    }
  }, []);

  const currentFloor =
    activeProperty.floors.find((f) => f.id === currentFloorId) ||
    activeProperty.floors[0];

  const currentRoom = currentFloor.rooms.find((r) => r.id === currentRoomId);

  return (
    <div className="relative w-screen h-[calc(100vh-80px)] overflow-hidden bg-[#0c0e11] select-none font-mono">
      {/* 1. Main 3D WebGL Canvas */}
      <ThreeDViewer
        onCameraMove={(x, z, rotation) => {
          setCameraCoords({ x, z, rotation });
        }}
      />

      {/* 2. Top Navigation & Spatial Telemetry Header */}
      <div className="absolute top-5 left-5 right-5 z-30 flex items-center justify-between pointer-events-none">
        {/* Back Button & Residence Title */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={onBackToProperty}
            className="p-2.5 rounded-lg glass-hud text-[#9eacb8] hover:text-[#d4af37] border border-[#d4af37]/30 transition-all flex items-center gap-2 text-xs shadow-xl"
            title="Exit 3D Viewport to Property Dossier"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit 3D</span>
          </button>

          <div className="glass-hud px-3.5 py-2 rounded-lg border border-white/10 shadow-xl flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
            <div>
              <div className="text-xs text-[#f5f6f8] font-semibold">{activeProperty.name}</div>
              {/* Dynamic Location / Room Breadcrumb */}
              <div className="text-[10px] text-[#9eacb8] flex items-center gap-1.5 uppercase tracking-wider">
                {isExterior ? (
                  <span className="text-[#d4af37]">Exterior Facade & Grounds</span>
                ) : (
                  <>
                    <span>{currentFloor.label}</span>
                    <span>→</span>
                    <span className="text-[#d4af37]">
                      {currentRoom ? currentRoom.name : 'Central Volume'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Tools: Quality Selector & Room Labels */}
        <div className="flex items-center gap-2 pointer-events-auto text-xs">
          {/* Room Labels Toggle */}
          <button
            onClick={() => setShowRoomLabels(!showRoomLabels)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg glass-hud border transition-all ${
              showRoomLabels
                ? 'border-[#d4af37]/40 text-[#d4af37]'
                : 'border-white/10 text-[#9eacb8] opacity-60'
            }`}
            title="Toggle Spatial Room Labels"
          >
            <Tag className="w-3.5 h-3.5" />
            <span className="text-[11px]">Tags</span>
          </button>

          {/* Quality Mode Switcher */}
          <div className="glass-hud p-0.5 rounded-lg border border-white/10 flex items-center text-[10px]">
            {(['high', 'medium', 'low'] as const).map((q) => (
              <button
                key={q}
                onClick={() => setQuality(q)}
                className={`px-2.5 py-1.5 rounded uppercase font-semibold transition-all ${
                  quality === q
                    ? 'bg-[#d4af37] text-[#0c0e11]'
                    : 'text-[#9eacb8] hover:text-[#f5f6f8]'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Floating Floor Plate Selector (Top-Right) */}
      <FloorSelector />

      {/* 4. Radar MiniMap HUD (Top-Left) */}
      <MiniMapHUD cameraCoords={cameraCoords} />

      {/* 5. Bottom Interactive Toolbar HUD */}
      <ViewerToolbar
        onOpenTutorial={() => setIsTutorialOpen(true)}
        onOpenVR={() => setIsVROpen(true)}
        onOpenAR={() => setIsAROpen(true)}
      />

      {/* 6. Modals & Overlay Drawers */}
      <FloorPlanModal />
      <RoomSelectorDrawer />
      <LightingControlModal />
      <GuidedTourHUD />
      <ObjectInspectorModal />
      <Panorama360View />

      {/* 7. Tutorial, VR, and AR Modals */}
      <TutorialModal isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />
      <VRModal isOpen={isVROpen} onClose={() => setIsVROpen(false)} />
      <ARModal isOpen={isAROpen} onClose={() => setIsAROpen(false)} />
    </div>
  );
};
