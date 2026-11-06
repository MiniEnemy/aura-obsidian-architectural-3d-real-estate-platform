import React from 'react';
import { setTutorialDismissed } from '../../utils/storage';
import { MousePointer, Compass, Footprints, Layers, Ruler, Glasses, Check } from 'lucide-react';

interface TutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDismiss = () => {
    setTutorialDismissed();
    onClose();
  };

  const guides = [
    {
      icon: <MousePointer className="w-5 h-5 text-[#d4af37]" />,
      title: 'Orbit & Look Around',
      text: 'Click and drag to rotate the camera in 360 degrees. Scroll wheel to zoom in and out smoothly.'
    },
    {
      icon: <Footprints className="w-5 h-5 text-[#d4af37]" />,
      title: 'First-Person Walkthrough',
      text: 'Switch to FPP mode. Use W, A, S, D or the arrow keys to walk, and drag the view to look around. On phones, drag to look and hold the direction pad to move. Walk up the stairs or use the floor selector to change levels.'
    },
    {
      icon: <Layers className="w-5 h-5 text-[#d4af37]" />,
      title: 'Direct Room Navigation',
      text: 'Open the Room Directory or click 3D room tags to immediately teleport into living spaces, suites, or balconies.'
    },
    {
      icon: <Ruler className="w-5 h-5 text-[#d4af37]" />,
      title: 'Laser Measurement',
      text: 'Activate the measurement tool and click any two architectural surfaces to measure exact distance in meters.'
    },
    {
      icon: <Glasses className="w-5 h-5 text-[#d4af37]" />,
      title: 'Immersive VR / AR',
      text: 'Launch WebXR to step inside the architecture in full-scale VR headsets or project a holographic villa model in AR.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-xl glass-modal rounded-xl border border-[#d4af37]/40 p-6 shadow-2xl flex flex-col gap-5">
        <div className="border-b border-white/10 pb-4">
          <span className="text-[10px] text-[#d4af37] tracking-widest uppercase font-semibold">
            Spatial Navigation Field Manual
          </span>
          <h2 className="font-display text-2xl text-[#f5f6f8] mt-1">
            How to Explore the Property
          </h2>
          <p className="text-xs text-[#9eacb8] font-sans mt-1">
            Experience architectural spaces interactively before your physical site visit.
          </p>
        </div>

        <div className="space-y-3.5 max-h-[50vh] overflow-y-auto pr-1">
          {guides.map((g, i) => (
            <div
              key={i}
              className="flex items-start gap-3.5 p-3 rounded-lg bg-[#14171d]/80 border border-white/5"
            >
              <div className="p-2 rounded bg-black/40 shrink-0">{g.icon}</div>
              <div>
                <h4 className="font-sans font-semibold text-sm text-[#f5f6f8]">{g.title}</h4>
                <p className="text-xs font-sans text-[#9eacb8] mt-0.5 leading-relaxed">
                  {g.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleDismiss}
            className="py-2.5 px-6 rounded-lg bg-[#d4af37] text-[#0c0e11] font-semibold flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:bg-[#e5c358] transition-all text-xs uppercase tracking-wider"
          >
            <Check className="w-4 h-4" />
            <span>Begin Spatial Walkthrough</span>
          </button>
        </div>
      </div>
    </div>
  );
};
