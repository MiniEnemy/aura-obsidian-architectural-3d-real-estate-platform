import React from 'react';
import { usePropertyContext } from '../../context/PropertyContext';
import { PropertyCard } from '../property/PropertyCard';
import { PropertyFilterBar } from '../property/PropertyFilterBar';
import { Property } from '../../types/property';
import { Compass, RotateCcw } from 'lucide-react';

interface PropertiesPageProps {
  onEnter3D: (property: Property) => void;
  onViewDetails: (property: Property) => void;
}

export const PropertiesPage: React.FC<PropertiesPageProps> = ({
  onEnter3D,
  onViewDetails
}) => {
  const { filteredProperties, resetFilters } = usePropertyContext();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#d4af37] tracking-widest uppercase mb-1">
          <Compass className="w-3.5 h-3.5" />
          <span>Curated Architectural Portfolio</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl text-[#f5f6f8] font-normal tracking-tight">
          Explore Spatial Residences
        </h1>
        <p className="font-sans text-sm text-[#9eacb8] mt-2 max-w-2xl">
          Every listed property features full 3D interactive walkthroughs, verified floor plates,
          room-by-room teleportation, and WebXR spatial readiness.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <PropertyFilterBar />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs font-mono text-[#9eacb8] pt-2 border-b border-white/5 pb-2">
        <span>
          SHOWING {filteredProperties.length} ARCHITECTURAL RESIDENCE
          {filteredProperties.length !== 1 ? 'S' : ''}
        </span>
        <span>VERIFIED VOLUMETRIC DATA</span>
      </div>

      {/* Grid or Empty State */}
      {filteredProperties.length > 0 ? (
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
      ) : (
        <div className="py-20 text-center glass-panel rounded-xl border border-white/10 flex flex-col items-center gap-4">
          <Compass className="w-12 h-12 text-[#d4af37]/40" />
          <h3 className="font-display text-xl text-[#f5f6f8]">
            No Residences Match Current Parameters
          </h3>
          <p className="text-xs font-sans text-[#9eacb8] max-w-md">
            Try expanding your price range, clearing specific amenities, or searching for other
            cities such as Los Angeles, Cannes, or New York.
          </p>
          <button
            onClick={resetFilters}
            className="mt-2 py-2 px-5 rounded-lg bg-[#d4af37] text-[#0c0e11] font-mono text-xs font-semibold uppercase flex items-center gap-2 hover:bg-[#e5c358] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};
