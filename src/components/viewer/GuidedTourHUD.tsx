import React from 'react';
import { useViewerContext } from '../../context/ViewerContext';
import { usePropertyContext } from '../../context/PropertyContext';
import { Play, Pause, SkipForward, SkipBack, X, Sparkles, Compass } from 'lucide-react';

export const GuidedTourHUD: React.FC = () => {
  const { activeProperty } = usePropertyContext();
  const {
    isTourPlaying,
    currentTourStopIndex,
    pauseTour,
    resumeTour,
    nextTourStop,
    prevTourStop,
    exitTour
  } = useViewerContext();

  const stops = activeProperty.guidedTour;
  if (!stops || stops.length === 0 || !isTourPlaying) return null;

  const currentStop = stops[currentTourStopIndex] || stops[0];

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4 animate-fade-in font-mono select-none">
      <div className="glass-modal rounded-xl border border-[#d4af37]/40 p-4 shadow-2xl flex flex-col gap-3">
        {/* Top bar with stop index */}
        <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
          <div className="flex items-center gap-2 text-[#d4af37] tracking-wider uppercase font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#d4af37] animate-pulse" />
            <span>Cinematic Guided Archival Walkthrough</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#9eacb8]">
              STOP {currentTourStopIndex + 1} OF {stops.length}
            </span>
            <button
              onClick={exitTour}
              className="p-1 rounded text-[#9eacb8] hover:text-[#f5f6f8] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Stop Content */}
        <div>
          <h3 className="font-display text-lg text-[#f5f6f8] font-normal tracking-wide">
            {currentStop.title}
          </h3>
          <p className="text-xs font-sans text-[#9eacb8] mt-1 leading-relaxed">
            {currentStop.narration}
          </p>
        </div>

        {/* Tour Navigation Controls */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={prevTourStop}
              className="p-2 rounded-lg bg-[#181c22] text-[#9eacb8] hover:text-[#f5f6f8] hover:bg-[#222730] border border-white/10 transition-colors"
              title="Previous Stop"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                // Toggle pause / resume
                if (isTourPlaying) pauseTour();
                else resumeTour();
              }}
              className="px-4 py-2 rounded-lg bg-[#d4af37] text-[#0c0e11] font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:bg-[#e5c358] transition-all text-xs"
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause Walk</span>
            </button>

            <button
              onClick={nextTourStop}
              className="p-2 rounded-lg bg-[#181c22] text-[#9eacb8] hover:text-[#f5f6f8] hover:bg-[#222730] border border-white/10 transition-colors"
              title="Next Stop"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {stops.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentTourStopIndex ? 'w-6 bg-[#d4af37]' : 'w-1.5 bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
