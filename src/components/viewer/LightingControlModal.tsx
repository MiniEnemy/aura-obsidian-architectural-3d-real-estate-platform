import React from 'react';
import { useViewerContext } from '../../context/ViewerContext';
import { LightingMode } from '../../types/property';
import { Sunrise, Sun, Sunset, Moon, X, Sparkles } from 'lucide-react';

export const LightingControlModal: React.FC = () => {
  const { activeTool, setActiveTool, lightingMode, setLightingMode } = useViewerContext();

  if (activeTool !== 'lighting') return null;

  const modes: {
    id: LightingMode;
    label: string;
    sub: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      id: 'morning',
      label: 'Dawn Horizon',
      sub: 'Low-angle golden sunrise & soft atmospheric mist',
      icon: <Sunrise className="w-5 h-5 text-[#ffcb8a]" />,
      color: 'border-[#ffcb8a]/40 bg-[#ffcb8a]/10'
    },
    {
      id: 'daytime',
      label: 'Architectural Noon',
      sub: 'High crisp sunlight, sharp directional shadows',
      icon: <Sun className="w-5 h-5 text-[#fffaed]" />,
      color: 'border-[#fff8e7]/40 bg-[#fff8e7]/10'
    },
    {
      id: 'evening',
      label: 'Champagne Sunset',
      sub: 'Dramatic amber dusk & warm interior chandelier glow',
      icon: <Sunset className="w-5 h-5 text-[#ff8533]" />,
      color: 'border-[#ff8533]/40 bg-[#ff8533]/10'
    },
    {
      id: 'night',
      label: 'Obsidian Twilight',
      sub: 'Deep moonlight, starfield & underwater pool illumination',
      icon: <Moon className="w-5 h-5 text-[#759ac2]" />,
      color: 'border-[#759ac2]/40 bg-[#759ac2]/10'
    }
  ];

  return (
    <div className="absolute top-20 right-5 z-40 w-84 glass-hud-modal rounded-xl border border-[#d4af37]/30 p-4 shadow-2xl font-mono text-xs animate-fade-in">
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-[#d4af37] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Atmospheric Solar Simulation</span>
        </div>
        <button
          onClick={() => setActiveTool('none')}
          className="p-1 rounded text-[#9eacb8] hover:text-[#f5f6f8]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="py-3 space-y-2">
        {modes.map((m) => {
          const isActive = lightingMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setLightingMode(m.id)}
              className={`w-full p-3 rounded-lg border text-left transition-all duration-200 flex items-start gap-3 ${
                isActive
                  ? 'border-[#d4af37] bg-[#d4af37]/15 ring-1 ring-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                  : 'border-white/5 hover:border-white/20 bg-[#181c22]/70 text-[#9eacb8]'
              }`}
            >
              <div className="p-2 rounded bg-black/40 mt-0.5">{m.icon}</div>
              <div>
                <div
                  className={`font-sans font-semibold text-sm ${
                    isActive ? 'text-[#f5f6f8]' : 'text-[#e2e2e6]'
                  }`}
                >
                  {m.label}
                </div>
                <div className="text-[11px] text-[#9eacb8] mt-0.5 leading-snug">
                  {m.sub}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
