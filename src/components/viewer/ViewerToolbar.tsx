import React from 'react';
import { useViewerContext } from '../../context/ViewerContext';
import { usePropertyContext } from '../../context/PropertyContext';
import {
  Compass,
  Footprints,
  User,
  Home,
  Layers,
  Map as MapIcon,
  Ruler,
  SunMedium,
  Sofa,
  Play,
  Glasses,
  Maximize,
  Minimize,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Eye,
  Camera
} from 'lucide-react';

interface ViewerToolbarProps {
  onOpenTutorial: () => void;
  onOpenVR: () => void;
  onOpenAR: () => void;
}

export const ViewerToolbar: React.FC<ViewerToolbarProps> = ({
  onOpenTutorial,
  onOpenVR,
  onOpenAR
}) => {
  const { activeProperty } = usePropertyContext();
  const {
    cameraMode,
    setCameraMode,
    isExterior,
    resetToExterior,
    enterHome,
    isFurnished,
    toggleFurnished,
    activeTool,
    setActiveTool,
    lightingMode,
    isMeasuringActive,
    setIsMeasuringActive,
    clearMeasurements,
    isTourPlaying,
    startTour,
    exitTour,
    isFullscreen,
    toggleFullscreen,
    is360Mode,
    setIs360Mode
  } = useViewerContext();

  return (
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 max-w-[96vw] overflow-x-auto p-1.5 glass-panel rounded-lg flex items-center gap-1.5 shadow-2xl border border-[#d4af37]/25 text-xs font-mono">
      {/* 1. Camera Mode Group */}
      <div className="flex items-center bg-[#12151a]/90 p-1 rounded border border-white/5">
        <button
          onClick={() => setCameraMode('orbit')}
          title="Orbit Camera Mode"
          className={`px-2.5 py-1.5 rounded flex items-center gap-1.5 transition-all ${
            cameraMode === 'orbit'
              ? 'bg-[#d4af37] text-[#0c0e11] font-semibold shadow'
              : 'text-[#9eacb8] hover:text-[#f5f6f8] hover:bg-white/5'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Orbit</span>
        </button>

        <button
          onClick={() => {
            setCameraMode('first-person');
            if (isExterior) enterHome();
          }}
          title="First-Person Walkthrough (WASD / Arrows / Touch)"
          className={`px-2.5 py-1.5 rounded flex items-center gap-1.5 transition-all ${
            cameraMode === 'first-person'
              ? 'bg-[#d4af37] text-[#0c0e11] font-semibold shadow'
              : 'text-[#9eacb8] hover:text-[#f5f6f8] hover:bg-white/5'
          }`}
        >
          <Footprints className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">FPP Walk</span>
        </button>

        <button
          onClick={() => {
            setCameraMode('third-person');
            if (isExterior) enterHome();
          }}
          title="Third-Person Perspective"
          className={`px-2.5 py-1.5 rounded flex items-center gap-1.5 transition-all ${
            cameraMode === 'third-person'
              ? 'bg-[#d4af37] text-[#0c0e11] font-semibold shadow'
              : 'text-[#9eacb8] hover:text-[#f5f6f8] hover:bg-white/5'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Avatar</span>
        </button>
      </div>

      <div className="w-[1px] h-6 bg-white/10" />

      {/* 2. Enter Home / Exterior Toggle */}
      {isExterior ? (
        <button
          onClick={enterHome}
          className="px-3 py-1.5 rounded bg-[#d4af37] text-[#0c0e11] font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(212,175,55,0.35)] hover:bg-[#e5c358] transition-all"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Enter Home</span>
        </button>
      ) : (
        <button
          onClick={resetToExterior}
          className="px-3 py-1.5 rounded bg-[#181c22] text-[#9eacb8] hover:text-[#f5f6f8] border border-white/10 flex items-center gap-1.5 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Exterior</span>
        </button>
      )}

      {/* 3. Rooms Drawer Trigger */}
      <button
        onClick={() => setActiveTool(activeTool === 'rooms' ? 'none' : 'rooms')}
        className={`px-2.5 py-1.5 rounded flex items-center gap-1.5 border transition-all ${
          activeTool === 'rooms'
            ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]'
            : 'bg-[#181c22]/90 border-white/5 text-[#9eacb8] hover:text-[#f5f6f8]'
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Rooms</span>
      </button>

      {/* 4. Floor Plan Modal Trigger */}
      <button
        onClick={() => setActiveTool(activeTool === 'floorplan' ? 'none' : 'floorplan')}
        className={`px-2.5 py-1.5 rounded flex items-center gap-1.5 border transition-all ${
          activeTool === 'floorplan'
            ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]'
            : 'bg-[#181c22]/90 border-white/5 text-[#9eacb8] hover:text-[#f5f6f8]'
        }`}
      >
        <MapIcon className="w-3.5 h-3.5" />
        <span className="hidden md:inline">Floor Plan</span>
      </button>

      {/* 5. Measurement Mode */}
      <button
        onClick={() => {
          const next = !isMeasuringActive;
          setIsMeasuringActive(next);
          if (!next) clearMeasurements();
        }}
        title="Laser Measurement Tool"
        className={`px-2.5 py-1.5 rounded flex items-center gap-1.5 border transition-all ${
          isMeasuringActive
            ? 'bg-[#d4af37] text-[#0c0e11] font-semibold border-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.4)]'
            : 'bg-[#181c22]/90 border-white/5 text-[#9eacb8] hover:text-[#f5f6f8]'
        }`}
      >
        <Ruler className="w-3.5 h-3.5" />
        <span className="hidden lg:inline">Measure</span>
      </button>

      {/* 6. Lighting Mode Trigger */}
      <button
        onClick={() => setActiveTool(activeTool === 'lighting' ? 'none' : 'lighting')}
        className={`px-2.5 py-1.5 rounded flex items-center gap-1.5 border transition-all ${
          activeTool === 'lighting'
            ? 'bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]'
            : 'bg-[#181c22]/90 border-white/5 text-[#9eacb8] hover:text-[#f5f6f8]'
        }`}
      >
        <SunMedium className="w-3.5 h-3.5" />
        <span className="capitalize hidden xl:inline">{lightingMode}</span>
      </button>

      {/* 7. Furnished / Unfurnished */}
      <button
        onClick={toggleFurnished}
        title="Toggle Furnished / Architectural Shell"
        className={`px-2.5 py-1.5 rounded flex items-center gap-1.5 border transition-all ${
          isFurnished
            ? 'bg-[#181c22]/90 border-[#d4af37]/30 text-[#d4af37]'
            : 'bg-[#181c22]/90 border-white/5 text-[#9eacb8] opacity-60'
        }`}
      >
        <Sofa className="w-3.5 h-3.5" />
        <span className="hidden xl:inline">{isFurnished ? 'Furnished' : 'Bare Shell'}</span>
      </button>

      {/* 8. Guided Tour Trigger */}
      <button
        onClick={() => {
          if (isTourPlaying) {
            exitTour();
          } else {
            startTour();
            setActiveTool('tour');
          }
        }}
        className={`px-2.5 py-1.5 rounded flex items-center gap-1.5 border transition-all ${
          isTourPlaying
            ? 'bg-[#d4af37] text-[#0c0e11] font-semibold border-[#d4af37]'
            : 'bg-[#181c22]/90 border-white/5 text-[#9eacb8] hover:text-[#f5f6f8]'
        }`}
      >
        <Play className="w-3.5 h-3.5 fill-current" />
        <span className="hidden md:inline">Tour</span>
      </button>

      <div className="w-[1px] h-6 bg-white/10" />

      {/* 9. VR & AR Actions */}
      <button
        onClick={onOpenVR}
        title="Immersive WebXR VR Mode"
        className="px-2.5 py-1.5 rounded bg-[#181c22]/90 border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/20 flex items-center gap-1.5 transition-all"
      >
        <Glasses className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">VR</span>
      </button>

      <button
        onClick={onOpenAR}
        title="Augmented Reality Placement"
        className="px-2.5 py-1.5 rounded bg-[#181c22]/90 border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/20 flex items-center gap-1.5 transition-all"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">AR</span>
      </button>

      {/* 10. 360 View Mode */}
      <button
        onClick={() => setIs360Mode(!is360Mode)}
        title="Toggle 360 Panorama View"
        className={`px-2.5 py-1.5 rounded flex items-center gap-1.5 border transition-all ${
          is360Mode
            ? 'bg-[#d4af37] text-[#0c0e11] font-semibold border-[#d4af37]'
            : 'bg-[#181c22]/90 border-white/5 text-[#9eacb8] hover:text-[#f5f6f8]'
        }`}
      >
        <Camera className="w-3.5 h-3.5" />
        <span className="hidden lg:inline">360°</span>
      </button>

      {/* 11. Fullscreen */}
      <button
        onClick={toggleFullscreen}
        title="Toggle Fullscreen"
        className="p-1.5 rounded text-[#9eacb8] hover:text-[#f5f6f8] hover:bg-white/5 transition-all"
      >
        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
      </button>

      {/* 12. Help / Tutorial */}
      <button
        onClick={onOpenTutorial}
        title="Controls & Instructions"
        className="p-1.5 rounded text-[#9eacb8] hover:text-[#d4af37] hover:bg-white/5 transition-all"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
    </div>
  );
};
