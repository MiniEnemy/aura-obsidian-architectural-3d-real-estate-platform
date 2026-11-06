import React from 'react';
import { Box, Shield, Compass, Sparkles, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#0c0e11] border-t border-white/5 py-16 px-4 sm:px-6 lg:px-8 font-mono text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/5">
        {/* Brand statement */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#181c22] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <Box className="w-4 h-4" />
            </div>
            <span className="font-display text-xl text-[#f5f6f8] tracking-wider">AURA</span>
          </div>

          <p className="font-sans text-xs text-[#9eacb8] max-w-md leading-relaxed">
            The global benchmark for spatial real estate discovery. Exploring architectural form,
            interior daylight, spatial scale, and materials interactively through real-time WebGL and
            WebXR technologies.
          </p>

          <div className="text-[11px] text-[#5c6673]">
            Curated architectural monographs & certified volumetric measurements.
          </div>
        </div>

        {/* Spatial Features */}
        <div className="space-y-3">
          <div className="text-[#d4af37] tracking-widest uppercase font-semibold">
            Spatial Engine
          </div>
          <ul className="space-y-2 text-[#9eacb8]">
            <li>First-Person 1:1 Scale Walkthrough</li>
            <li>Two-Way Interactive Floor Plans</li>
            <li>Euclidean Laser Distance Telemetry</li>
            <li>Daylight & Solar Simulation</li>
            <li>WebXR VR / AR Holographic Projection</li>
          </ul>
        </div>

        {/* Advisory */}
        <div className="space-y-3">
          <div className="text-[#d4af37] tracking-widest uppercase font-semibold">
            Private Client Desk
          </div>
          <ul className="space-y-2 text-[#9eacb8]">
            <li>Bel Air & Beverly Hills Advisory</li>
            <li>Cap d’Antibes & French Riviera Office</li>
            <li>Manhattan Ultra-Prime Penthouse Spire</li>
            <li>Confidential Client Acquisitions</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[#5c6673] text-[11px]">
        <div>
          © {new Date().getFullYear()} AURA Spatial Real Estate Platform. All architectural models &
          renderings protected by international intellectual property treaties.
        </div>
        <div className="flex items-center gap-4">
          <span>Obsidian Architectural Luxury v4.2</span>
          <span>•</span>
          <span>WebXR Standard Compliant</span>
        </div>
      </div>
    </footer>
  );
};
