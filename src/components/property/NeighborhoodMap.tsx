import React, { useState } from 'react';
import { Property } from '../../types/property';
import { formatCoordinates } from '../../utils/formatters';
import { MapPin, Navigation, School, Utensils, TreePine, HeartPulse, Plane } from 'lucide-react';

interface NeighborhoodMapProps {
  property: Property;
}

export const NeighborhoodMap: React.FC<NeighborhoodMapProps> = ({ property }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Landmarks' },
    { id: 'dining', label: 'Fine Dining' },
    { id: 'education', label: 'Private Academies' },
    { id: 'transit', label: 'Aviation & Transit' },
    { id: 'nature', label: 'Parks & Reserves' }
  ];

  const filteredPlaces = property.nearbyPlaces.filter(
    (p) => selectedCategory === 'all' || p.category === selectedCategory
  );

  const getIcon = (cat: string) => {
    switch (cat) {
      case 'dining':
        return <Utensils className="w-3.5 h-3.5 text-[#d4af37]" />;
      case 'education':
        return <School className="w-3.5 h-3.5 text-[#b4c9dd]" />;
      case 'nature':
        return <TreePine className="w-3.5 h-3.5 text-emerald-400" />;
      case 'transit':
        return <Plane className="w-3.5 h-3.5 text-[#e8c9a6]" />;
      default:
        return <Navigation className="w-3.5 h-3.5 text-[#d4af37]" />;
    }
  };

  return (
    <div className="glass-panel rounded-xl border border-[#d4af37]/25 p-6 shadow-xl font-mono text-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-[#d4af37] tracking-widest uppercase font-semibold">
            <MapPin className="w-4 h-4 text-[#d4af37]" />
            <span>Geographic Placement & Proximity Matrix</span>
          </div>
          <p className="text-xs font-sans text-[#9eacb8] mt-0.5">
            {property.location.address}, {property.location.neighborhood}, {property.location.city}
          </p>
        </div>

        <div className="px-3 py-1.5 rounded bg-[#12151a] border border-white/10 text-[11px] text-[#d4af37]">
          {formatCoordinates(property.location.coordinates)}
        </div>
      </div>

      {/* Simulated Architectural Dark Map */}
      <div className="relative h-64 w-full bg-[#090b0e] rounded-lg border border-white/10 overflow-hidden mb-5 flex items-center justify-center">
        {/* Subtle Map Vector Lines Simulation */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle, #99907c 1.5px, transparent 1.5px), linear-gradient(35deg, rgba(212,175,55,0.08) 1px, transparent 1px)',
            backgroundSize: '36px 36px, 120px 120px'
          }}
        />

        {/* Contour Rings */}
        <div className="absolute w-72 h-72 rounded-full border border-[#d4af37]/15 animate-ping opacity-30" />
        <div className="absolute w-44 h-44 rounded-full border border-[#d4af37]/25" />

        {/* Central Residence Marker */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="p-2.5 rounded-full bg-[#d4af37] text-[#0c0e11] shadow-[0_0_25px_rgba(212,175,55,0.8)] ring-4 ring-[#d4af37]/30 animate-bounce">
            <MapPin className="w-5 h-5 fill-current" />
          </div>
          <div className="mt-2 px-3 py-1 bg-[#181c22]/90 backdrop-blur-md rounded border border-[#d4af37]/40 text-xs text-[#f5f6f8] font-display font-medium">
            {property.name}
          </div>
        </div>

        {/* Nearby Landmark Satellite Pins */}
        <div className="absolute top-12 left-16 px-2.5 py-1 bg-[#12151a]/85 backdrop-blur rounded border border-white/10 text-[10px] text-[#9eacb8] flex items-center gap-1.5">
          <TreePine className="w-3 h-3 text-emerald-400" />
          <span>Nature Corridor</span>
        </div>
        <div className="absolute bottom-10 right-20 px-2.5 py-1 bg-[#12151a]/85 backdrop-blur rounded border border-white/10 text-[10px] text-[#9eacb8] flex items-center gap-1.5">
          <Plane className="w-3 h-3 text-[#d4af37]" />
          <span>Executive Helipad</span>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-3 py-1.5 rounded text-[11px] transition-all ${
              selectedCategory === c.id
                ? 'bg-[#d4af37] text-[#0c0e11] font-semibold'
                : 'bg-[#181c22] text-[#9eacb8] hover:text-[#f5f6f8] border border-white/5'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Proximity Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredPlaces.map((place, i) => (
          <div
            key={i}
            className="p-3 rounded-lg bg-[#14171d] border border-white/5 flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="p-1.5 rounded bg-black/40 shrink-0">
                {getIcon(place.category)}
              </div>
              <div className="truncate">
                <div className="text-xs text-[#f5f6f8] font-sans truncate">{place.name}</div>
                <div className="text-[10px] text-[#9eacb8] uppercase">{place.category}</div>
              </div>
            </div>

            <div className="text-right shrink-0 ml-2">
              <div className="text-xs text-[#d4af37] font-semibold">{place.distance}</div>
              <div className="text-[10px] text-[#9eacb8]">{place.walkTime}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
