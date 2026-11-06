import React from 'react';
import { usePropertyContext } from '../../context/PropertyContext';
import { PropertyCard } from '../property/PropertyCard';
import { PropertyFilterBar } from '../property/PropertyFilterBar';
import { NeighborhoodMap } from '../property/NeighborhoodMap';
import { Property } from '../../types/property';
import { formatPrice } from '../../utils/formatters';
import {
  Eye,
  Compass,
  Footprints,
  Layers,
  Ruler,
  Glasses,
  Sparkles,
  ArrowRight,
  Shield,
  Building,
  CheckCircle,
  Play
} from 'lucide-react';

interface HomePageProps {
  onEnter3D: (property: Property) => void;
  onViewDetails: (property: Property) => void;
  onExploreAll: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onEnter3D,
  onViewDetails,
  onExploreAll
}) => {
  const { filteredProperties, properties, currentCurrency } = usePropertyContext();
  const flagship = properties[0];

  return (
    <div className="w-full flex flex-col gap-24 pb-20 overflow-x-hidden">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-8 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Architectural Canvas Layer */}
        <div className="absolute inset-0 z-0">
          <img
            src={flagship.images.hero}
            alt={flagship.name}
            className="w-full h-full object-cover object-center filter brightness-[0.38] contrast-125 scale-105 animate-pulse-slow"
          />
          {/* Obsidian Gradient Mask */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#111317] via-[#111317]/60 to-[#111317]/80" />
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #99907c 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center flex flex-col items-center gap-6">
          {/* Super-title Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-[#d4af37]/40 text-xs font-mono text-[#d4af37] tracking-widest uppercase shadow-[0_0_20px_rgba(212,175,55,0.2)] animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
            <span>Next-Generation Spatial Real Estate</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-light text-[#f5f6f8] tracking-tight leading-[1.08] max-w-4xl">
            Step Inside Architecture.{' '}
            <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-[#f2ca50] via-[#e8c9a6] to-[#d4af37]">
              Before You Visit.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="font-sans text-base sm:text-lg text-[#9eacb8] max-w-2xl font-light leading-relaxed">
            The world’s premier 3D architectural discovery platform. Inspect exterior facades,
            walk through interior corridors in 1:1 scale, test daylight at sunset, measure dimensions,
            and launch immersive VR.
          </p>

          {/* Signature Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 font-mono text-xs">
            <button
              onClick={() => onEnter3D(flagship)}
              className="w-full sm:w-auto py-3.5 px-8 rounded-lg bg-[#d4af37] text-[#0c0e11] font-semibold tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:bg-[#e5c358] transition-all hover:scale-105"
            >
              <Eye className="w-4 h-4" />
              <span>Explore Flagship Pavilion in 3D</span>
            </button>

            <button
              onClick={() => onViewDetails(flagship)}
              className="w-full sm:w-auto py-3.5 px-6 rounded-lg glass-panel text-[#f5f6f8] hover:text-[#d4af37] border border-white/10 hover:border-[#d4af37]/40 transition-all flex items-center justify-center gap-2"
            >
              <span>View Architectural Dossier</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Telemetry Strip */}
          <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-6 font-mono text-xs text-[#9eacb8]">
            <div>
              <div className="text-[10px] uppercase text-[#5c6673]">FLAGSHIP RESIDENCE</div>
              <div className="text-[#f5f6f8] font-bold mt-0.5">{flagship.name}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-[#5c6673]">VALUATION</div>
              <div className="text-[#d4af37] font-bold mt-0.5">
                {formatPrice(flagship.price, currentCurrency)}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-[#5c6673]">FLOORPLATE</div>
              <div className="text-[#f5f6f8] font-bold mt-0.5">{flagship.totalAreaSqm} m² Living</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-[#5c6673]">SPATIAL ENGINE</div>
              <div className="text-emerald-400 font-bold mt-0.5">1:1 WebGL & WebXR</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. REAL-TIME SEARCH & FILTER BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full -mt-16 relative z-20">
        <PropertyFilterBar />
      </section>

      {/* 3. FEATURED CURATED PROPERTIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#d4af37] tracking-widest uppercase mb-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Architectural Collection</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-[#f5f6f8] font-normal tracking-tight">
              Featured 3D Residences
            </h2>
          </div>

          <button
            onClick={onExploreAll}
            className="font-mono text-xs text-[#d4af37] hover:text-[#e5c358] flex items-center gap-1.5 transition-colors"
          >
            <span>View All Properties ({properties.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              onEnter3D={onEnter3D}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      </section>

      {/* 4. WHY SPATIAL REAL ESTATE (THE INTERACTIVE VALUE PROPOSITION) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="glass-panel rounded-2xl border border-[#d4af37]/30 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl mb-12">
            <span className="text-xs font-mono text-[#d4af37] tracking-widest uppercase font-semibold">
              Spatial Visualization Paradigm
            </span>
            <h2 className="font-display text-3xl sm:text-5xl text-[#f5f6f8] font-light mt-2 tracking-tight">
              Why 3D Spatial Real Estate Changes Everything
            </h2>
            <p className="font-sans text-sm sm:text-base text-[#9eacb8] mt-3 leading-relaxed">
              Traditional photographs flatten space, conceal awkward ceiling geometries, and distort room
              proportions. AURA gives buyers and architects absolute spatial truth.
            </p>
          </div>

          {/* Interactive Feature Quadrants */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
            <div className="p-5 rounded-xl bg-[#12151a]/90 border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center border border-[#d4af37]/30">
                <Footprints className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base text-[#f5f6f8]">
                First-Person 1:1 Scale
              </h3>
              <p className="font-sans text-xs text-[#9eacb8] leading-relaxed">
                Walk through rooms at natural 1.7m human eye level using keyboard or mobile touch.
                Understand true ceiling heights and room transitions.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#12151a]/90 border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center border border-[#d4af37]/30">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base text-[#f5f6f8]">
                Two-Way Connected Blueprints
              </h3>
              <p className="font-sans text-xs text-[#9eacb8] leading-relaxed">
                Click any room on the 2D architectural blueprint to fly directly there in 3D.
                Never lose spatial orientation inside complex multi-level residences.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#12151a]/90 border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center border border-[#d4af37]/30">
                <Ruler className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base text-[#f5f6f8]">
                Euclidean Laser Measurement
              </h3>
              <p className="font-sans text-xs text-[#9eacb8] leading-relaxed">
                Click any two architectural surfaces to measure exact distances in meters. Verify
                whether your custom art collection or grand piano will fit.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#12151a]/90 border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center border border-[#d4af37]/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base text-[#f5f6f8]">
                Solar & Lighting Simulation
              </h3>
              <p className="font-sans text-xs text-[#9eacb8] leading-relaxed">
                Simulate dawn, midday glare, sunset golden hour, and midnight architectural lighting.
                Inspect real shadows cast by overhangs.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#12151a]/90 border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center border border-[#d4af37]/30">
                <Glasses className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base text-[#f5f6f8]">
                WebXR Headset & AR Projection
              </h3>
              <p className="font-sans text-xs text-[#9eacb8] leading-relaxed">
                Put on a Meta Quest or Apple Vision Pro to physically walk across balconies, or project
                a holographic table model into your office.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#12151a]/90 border border-white/5 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[#d4af37]/15 text-[#d4af37] flex items-center justify-center border border-[#d4af37]/30">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="font-display text-base text-[#f5f6f8]">
                Bare Shell vs. Furnished
              </h3>
              <p className="font-sans text-xs text-[#9eacb8] leading-relaxed">
                Toggle furniture in real-time to inspect raw structural volume, wall lengths, and
                architectural finishes without interior staging distractions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GEOGRAPHIC LOCATION EXPLORER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <NeighborhoodMap property={flagship} />
      </section>

      {/* 6. IMMERSIVE BOTTOM CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        <div className="glass-panel rounded-2xl border border-[#d4af37]/40 p-12 sm:p-16 flex flex-col items-center gap-6 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-[#d4af37]/20 border border-[#d4af37] flex items-center justify-center text-[#d4af37]">
            <Compass className="w-7 h-7" />
          </div>

          <h2 className="font-display text-3xl sm:text-5xl text-[#f5f6f8] font-light max-w-2xl tracking-tight">
            Ready to Walk Through Your Next Residence?
          </h2>

          <p className="font-sans text-sm sm:text-base text-[#9eacb8] max-w-xl font-light leading-relaxed">
            Begin the spatial journey today. Rotate, enter, measure, and experience elite architecture
            with zero travel friction.
          </p>

          <button
            onClick={() => onEnter3D(flagship)}
            className="py-4 px-9 rounded-lg bg-[#d4af37] text-[#0c0e11] font-semibold text-xs tracking-wider uppercase flex items-center gap-2 shadow-[0_0_25px_rgba(212,175,55,0.4)] hover:bg-[#e5c358] transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Flagship 3D Experience</span>
          </button>
        </div>
      </section>
    </div>
  );
};
