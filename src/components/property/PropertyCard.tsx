import React from 'react';
import { Property } from '../../types/property';
import { usePropertyContext } from '../../context/PropertyContext';
import { formatPrice, formatArea } from '../../utils/formatters';
import {
  Heart,
  Eye,
  Glasses,
  Sparkles,
  Bed,
  Bath,
  Maximize2,
  MapPin,
  ArrowRight,
  GitCompare
} from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  onEnter3D: (property: Property) => void;
  onViewDetails: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onEnter3D,
  onViewDetails
}) => {
  const {
    favorites,
    toggleFav,
    compareList,
    toggleComp,
    currentCurrency
  } = usePropertyContext();

  const isFav = favorites.includes(property.id);
  const isCompared = compareList.includes(property.id);

  return (
    <div className="group relative glass-panel rounded-xl border border-white/10 hover:border-[#d4af37]/50 transition-all duration-300 overflow-hidden flex flex-col shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:-translate-y-1">
      {/* Top Media Viewport */}
      <div className="relative h-64 w-full overflow-hidden bg-[#0c0e11]">
        <img
          src={property.images.hero}
          alt={property.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
          loading="lazy"
        />

        {/* Top Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111317] via-transparent to-black/40" />

        {/* Top Badges (3D, VR, AR) */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5 z-10 font-mono text-[10px]">
          {property.has3D && (
            <span className="px-2 py-0.5 rounded bg-[#111317]/90 text-[#d4af37] border border-[#d4af37]/40 flex items-center gap-1 backdrop-blur-md font-semibold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse" />
              3D Walkthrough
            </span>
          )}
          {property.hasVR && (
            <span className="px-2 py-0.5 rounded bg-[#181c22]/80 text-[#b4c9dd] border border-white/10 flex items-center gap-1 backdrop-blur-md">
              <Glasses className="w-3 h-3" />
              VR
            </span>
          )}
          {property.hasAR && (
            <span className="px-2 py-0.5 rounded bg-[#181c22]/80 text-[#e8c9a6] border border-white/10 flex items-center gap-1 backdrop-blur-md">
              <Sparkles className="w-3 h-3" />
              AR
            </span>
          )}
        </div>

        {/* Favorite & Compare Quick Actions */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleComp(property.id);
            }}
            title="Add to Comparison"
            className={`p-2 rounded-lg backdrop-blur-md transition-all ${
              isCompared
                ? 'bg-[#d4af37] text-[#0c0e11]'
                : 'bg-[#111317]/80 text-[#9eacb8] hover:text-[#f5f6f8] border border-white/10'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFav(property.id);
            }}
            title="Save to Favorites"
            className={`p-2 rounded-lg backdrop-blur-md transition-all ${
              isFav
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-[#111317]/80 text-[#9eacb8] hover:text-rose-400 border border-white/10'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Price Tag pinned to bottom of media */}
        <div className="absolute bottom-3 left-4 z-10">
          <div className="text-[10px] font-mono text-[#9eacb8] uppercase tracking-wider">
            OFFERING PRICE
          </div>
          <div className="font-display text-2xl text-[#f2ca50] font-light tracking-tight">
            {formatPrice(property.price, currentCurrency)}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between gap-4 font-mono">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#9eacb8] mb-1">
            <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
            <span className="truncate">
              {property.location.neighborhood}, {property.location.city}
            </span>
          </div>

          <h3
            onClick={() => onViewDetails(property)}
            className="font-display text-lg text-[#f5f6f8] font-normal tracking-wide hover:text-[#d4af37] transition-colors cursor-pointer line-clamp-1"
          >
            {property.name}
          </h3>

          <p className="text-xs font-sans text-[#9eacb8] mt-1.5 line-clamp-2 leading-relaxed">
            {property.tagline}
          </p>
        </div>

        {/* Metric Dimensions Strip */}
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-white/5 text-xs">
          <div className="flex items-center gap-1.5 text-[#e2e2e6]">
            <Bed className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>{property.bedrooms} Beds</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#e2e2e6]">
            <Bath className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>{property.bathrooms} Baths</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#e2e2e6]">
            <Maximize2 className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>{property.totalAreaSqm} m²</span>
          </div>
        </div>

        {/* Interactive CTA Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onEnter3D(property)}
            className="flex-1 py-2.5 px-3 rounded-lg bg-[#d4af37] text-[#0c0e11] font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:bg-[#e5c358] transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>See Inside (3D)</span>
          </button>

          <button
            onClick={() => onViewDetails(property)}
            className="py-2.5 px-3 rounded-lg bg-[#181c22] border border-white/10 text-[#f5f6f8] hover:bg-[#222730] hover:text-[#d4af37] transition-colors text-xs"
            title="View Full Architecture Dossier"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
