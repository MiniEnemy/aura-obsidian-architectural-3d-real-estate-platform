import React from 'react';
import { usePropertyContext } from '../../context/PropertyContext';
import { PropertyCard } from '../property/PropertyCard';
import { Property } from '../../types/property';
import { Heart, Compass, ArrowRight } from 'lucide-react';

interface SavedPropertiesPageProps {
  onEnter3D: (property: Property) => void;
  onViewDetails: (property: Property) => void;
  onExploreProperties: () => void;
}

export const SavedPropertiesPage: React.FC<SavedPropertiesPageProps> = ({
  onEnter3D,
  onViewDetails,
  onExploreProperties
}) => {
  const { favorites, properties } = usePropertyContext();

  const savedList = properties.filter((p) => favorites.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-mono text-xs flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2 text-xs text-rose-400 tracking-widest uppercase mb-1">
          <Heart className="w-3.5 h-3.5 fill-current" />
          <span>Curated Private Archive</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl text-[#f5f6f8] font-normal tracking-tight">
          Saved Residences ({savedList.length})
        </h1>
        <p className="font-sans text-sm text-[#9eacb8] mt-1">
          Residences saved to your local session for expedited 3D walkthroughs and partner bookings.
        </p>
      </div>

      {savedList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {savedList.map((prop) => (
            <PropertyCard
              key={prop.id}
              property={prop}
              onEnter3D={onEnter3D}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center glass-panel rounded-xl border border-white/10 flex flex-col items-center gap-4">
          <Heart className="w-12 h-12 text-[#9eacb8]/30" />
          <h3 className="font-display text-xl text-[#f5f6f8]">
            No Saved Residences in Your Archive
          </h3>
          <p className="text-xs font-sans text-[#9eacb8] max-w-md">
            Click the heart icon on any residence card to save it for immediate reference and spatial
            walkthrough comparison.
          </p>
          <button
            onClick={onExploreProperties}
            className="mt-2 py-3 px-6 rounded-lg bg-[#d4af37] text-[#0c0e11] font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:bg-[#e5c358] transition-all"
          >
            Explore Architectural Collection
          </button>
        </div>
      )}
    </div>
  );
};
