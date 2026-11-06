import React, { useState } from 'react';
import { Property } from '../../types/property';
import { usePropertyContext } from '../../context/PropertyContext';
import { formatPrice, formatArea, formatCoordinates } from '../../utils/formatters';
import { MortgageCalculator } from '../property/MortgageCalculator';
import { NeighborhoodMap } from '../property/NeighborhoodMap';
import {
  Eye,
  Heart,
  Share2,
  GitCompare,
  Calendar,
  Mail,
  Phone,
  Bed,
  Bath,
  Maximize2,
  MapPin,
  CheckCircle2,
  Shield,
  Layers,
  Sparkles,
  Glasses,
  Play,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

interface PropertyDetailPageProps {
  property: Property;
  onEnter3D: (property: Property, roomId?: string) => void;
  onBack: () => void;
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  property,
  onEnter3D,
  onBack
}) => {
  const {
    favorites,
    toggleFav,
    compareList,
    toggleComp,
    setIsScheduleModalOpen,
    setIsContactModalOpen,
    setIsShareModalOpen,
    setModalTargetProperty,
    currentCurrency
  } = usePropertyContext();

  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const allImages = [
    property.images.hero,
    ...property.images.exterior,
    ...property.images.interior
  ];

  const isFav = favorites.includes(property.id);
  const isCompared = compareList.includes(property.id);

  const handleOpenSchedule = () => {
    setModalTargetProperty(property);
    setIsScheduleModalOpen(true);
  };

  const handleOpenContact = () => {
    setModalTargetProperty(property);
    setIsContactModalOpen(true);
  };

  const handleOpenShare = () => {
    setModalTargetProperty(property);
    setIsShareModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-12 font-mono">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between text-xs text-[#9eacb8] border-b border-white/5 pb-3">
        <button
          onClick={onBack}
          className="hover:text-[#d4af37] transition-colors flex items-center gap-1.5"
        >
          ← Return to Residences
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => toggleComp(property.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition-all ${
              isCompared
                ? 'bg-[#d4af37] text-[#0c0e11] font-semibold border-[#d4af37]'
                : 'bg-[#181c22] text-[#9eacb8] hover:text-[#f5f6f8] border-white/10'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>{isCompared ? 'Comparing' : 'Compare'}</span>
          </button>

          <button
            onClick={() => toggleFav(property.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition-all ${
              isFav
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-[#181c22] text-[#9eacb8] hover:text-rose-400 border-white/10'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current text-rose-400' : ''}`} />
            <span>{isFav ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleOpenShare}
            className="p-1.5 rounded bg-[#181c22] text-[#9eacb8] hover:text-[#f5f6f8] border border-white/10"
            title="Share Property"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Header & Signature CTA */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#d4af37] tracking-widest uppercase mb-1.5">
            <MapPin className="w-4 h-4 text-[#d4af37]" />
            <span>
              {property.location.neighborhood}, {property.location.city}, {property.location.country}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl text-[#f5f6f8] font-normal tracking-tight">
            {property.name}
          </h1>

          <p className="font-sans text-base text-[#9eacb8] mt-2 max-w-3xl leading-relaxed">
            {property.tagline}
          </p>
        </div>

        {/* Price & SEE INSIDE Signature CTA Button */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
          <div>
            <div className="text-[10px] text-[#9eacb8] uppercase tracking-wider text-right">
              ACQUISITION PRICING
            </div>
            <div className="font-display text-3xl sm:text-4xl text-[#f2ca50] font-light">
              {formatPrice(property.price, currentCurrency)}
            </div>
          </div>

          <button
            onClick={() => onEnter3D(property)}
            className="w-full sm:w-auto py-3.5 px-8 rounded-lg bg-[#d4af37] text-[#0c0e11] font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(212,175,55,0.45)] hover:bg-[#e5c358] transition-all hover:scale-105 active:scale-95"
          >
            <Eye className="w-5 h-5" />
            <span>SEE INSIDE (ENTER 3D)</span>
          </button>
        </div>
      </div>

      {/* Hero Media Gallery with 3D Banner Overlay */}
      <div className="relative rounded-2xl overflow-hidden border border-[#d4af37]/30 shadow-2xl bg-[#0c0e11]">
        {/* Main Display Image */}
        <div className="relative h-[480px] sm:h-[580px] w-full">
          <img
            src={allImages[activeGalleryIndex]}
            alt={property.name}
            className="w-full h-full object-cover transition-opacity duration-500"
          />

          {/* Floating 'Launch 3D Walkthrough' Center-Right Badge */}
          <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
            <button
              onClick={() => onEnter3D(property)}
              className="py-3 px-5 rounded-lg glass-modal border border-[#d4af37] text-[#f5f6f8] text-xs font-semibold tracking-wider uppercase flex items-center gap-2 hover:bg-[#d4af37] hover:text-[#0c0e11] transition-all shadow-2xl"
            >
              <Sparkles className="w-4 h-4 text-[#d4af37]" />
              <span>Launch 3D Spatial Walkthrough</span>
            </button>
          </div>

          {/* Floating Badges */}
          <div className="absolute top-6 left-6 z-20 flex flex-wrap gap-2 text-xs">
            <span className="px-3 py-1 rounded glass-panel text-[#d4af37] border border-[#d4af37]/40 font-semibold tracking-wider uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
              Real 1:1 Interactive 3D Model
            </span>
            <span className="px-3 py-1 rounded glass-panel text-[#f5f6f8] border border-white/10 flex items-center gap-1.5">
              <Glasses className="w-3.5 h-3.5" /> WebXR Ready
            </span>
          </div>
        </div>

        {/* Gallery Thumbnails Strip */}
        <div className="p-3 bg-[#111317] border-t border-white/5 flex gap-2.5 overflow-x-auto">
          {allImages.slice(0, 8).map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveGalleryIndex(i)}
              className={`relative h-16 w-24 rounded-lg overflow-hidden shrink-0 border transition-all ${
                activeGalleryIndex === i
                  ? 'border-[#d4af37] ring-2 ring-[#d4af37]/40 scale-105'
                  : 'border-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Key Architectural Specifications Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 p-5 rounded-xl glass-panel border border-white/10 text-xs">
        <div>
          <div className="text-[10px] text-[#9eacb8] uppercase">TOTAL FLOORPLATE</div>
          <div className="text-[#f5f6f8] font-bold text-sm mt-0.5">
            {formatArea(property.totalAreaSqm)}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-[#9eacb8] uppercase">SUITES & BATHS</div>
          <div className="text-[#f5f6f8] font-bold text-sm mt-0.5">
            {property.bedrooms} Bed • {property.bathrooms} Bath
          </div>
        </div>
        <div>
          <div className="text-[10px] text-[#9eacb8] uppercase">COMPLETION</div>
          <div className="text-[#f5f6f8] font-bold text-sm mt-0.5">{property.yearBuilt} Modernist</div>
        </div>
        <div>
          <div className="text-[10px] text-[#9eacb8] uppercase">ARCHITECT</div>
          <div className="text-[#d4af37] font-bold text-sm mt-0.5 truncate">
            {property.architect || 'Atelier Obsidian'}
          </div>
        </div>
        <div>
          <div className="text-[10px] text-[#9eacb8] uppercase">ENERGY EFFICIENCY</div>
          <div className="text-emerald-400 font-bold text-sm mt-0.5">Rating {property.energyRating}</div>
        </div>
        <div>
          <div className="text-[10px] text-[#9eacb8] uppercase">VOLUMETRIC LEVELS</div>
          <div className="text-[#f5f6f8] font-bold text-sm mt-0.5">
            {property.floors.length} Architectural Floors
          </div>
        </div>
      </div>

      {/* Main Content Layout (2 Columns: Dossier Left, Agent/Booking Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Cols: Architectural Narrative & Room Breakdown */}
        <div className="lg:col-span-2 space-y-10">
          {/* Architectural Description */}
          <div className="space-y-4">
            <h3 className="font-display text-2xl text-[#f5f6f8] tracking-wide">
              Architectural Monograph & Concept
            </h3>
            <p className="font-sans text-sm text-[#e2e2e6] leading-relaxed font-light">
              {property.description}
            </p>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {property.highlights.map((h, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-[#14171d] border border-white/5 space-y-1.5"
              >
                <div className="flex items-center gap-2 text-[#d4af37]">
                  <Sparkles className="w-4 h-4" />
                  <span className="font-display text-sm text-[#f5f6f8]">{h.title}</span>
                </div>
                <p className="font-sans text-xs text-[#9eacb8] leading-relaxed">
                  {h.description}
                </p>
              </div>
            ))}
          </div>

          {/* ROOM BREAKDOWN & DIRECT 3D TELEPORT BUTTONS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <h3 className="font-display text-2xl text-[#f5f6f8]">
                  Volumetric Room Directory
                </h3>
                <p className="font-sans text-xs text-[#9eacb8] mt-0.5">
                  Click any room below to launch directly into that coordinate inside the 3D engine.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {property.floors.map((floor) => (
                <div key={floor.id} className="space-y-2">
                  <div className="px-3 py-1.5 rounded bg-white/5 text-[11px] text-[#d4af37] uppercase tracking-wider flex items-center justify-between">
                    <span>{floor.label}</span>
                    <span>Elevation: {floor.elevation}m</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {floor.rooms.map((room) => (
                      <div
                        key={room.id}
                        className="p-4 rounded-lg bg-[#14171d] border border-white/5 flex flex-col justify-between gap-3 group hover:border-[#d4af37]/40 transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs">
                            <h4 className="font-display text-base text-[#f5f6f8] group-hover:text-[#d4af37] transition-colors">
                              {room.name}
                            </h4>
                            <span className="text-[#d4af37] font-semibold">{room.areaSqm} m²</span>
                          </div>
                          <p className="font-sans text-xs text-[#9eacb8] mt-1 line-clamp-2">
                            {room.description}
                          </p>
                        </div>

                        <button
                          onClick={() => onEnter3D(property, room.id)}
                          className="w-full py-2 px-3 rounded bg-[#181c22] border border-white/10 text-xs text-[#d4af37] hover:bg-[#d4af37] hover:text-[#0c0e11] font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Jump to 3D {room.name}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mortgage Calculator Component */}
          <MortgageCalculator initialPrice={property.price} currency={property.currency} />

          {/* Neighborhood Proximity Map */}
          <NeighborhoodMap property={property} />
        </div>

        {/* Right 1 Col: Managing Partner & Actions */}
        <div className="space-y-6">
          {/* Agent Card */}
          <div className="glass-panel rounded-xl border border-[#d4af37]/30 p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-4">
              <img
                src={property.agent.avatarUrl}
                alt={property.agent.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#d4af37]/60"
              />
              <div>
                <h4 className="font-display text-lg text-[#f5f6f8]">{property.agent.name}</h4>
                <div className="text-xs text-[#d4af37] font-sans">{property.agent.title}</div>
                <div className="text-[10px] text-[#9eacb8] mt-0.5">
                  {property.agent.company} • {property.agent.experienceYears} yrs exp
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#12151a] rounded-lg border border-white/5 space-y-1.5 text-xs text-[#9eacb8]">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="text-[#f5f6f8]">{property.agent.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>{property.agent.email}</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleOpenSchedule}
                className="w-full py-3 px-4 rounded-lg bg-[#d4af37] text-[#0c0e11] font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:bg-[#e5c358] transition-all"
              >
                <Calendar className="w-4 h-4" />
                <span>Schedule Private Visit</span>
              </button>

              <button
                onClick={handleOpenContact}
                className="w-full py-3 px-4 rounded-lg bg-[#181c22] border border-white/10 text-[#f5f6f8] hover:bg-[#222730] hover:text-[#d4af37] text-xs tracking-wider uppercase flex items-center justify-center gap-2 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span>Inquire with Partner</span>
              </button>
            </div>
          </div>

          {/* Spatial Certifications */}
          <div className="glass-panel rounded-xl border border-white/10 p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-[#d4af37] uppercase font-semibold">
              <Shield className="w-4 h-4" />
              <span>Certified Spatial Guarantee</span>
            </div>
            <p className="font-sans text-[11px] text-[#9eacb8] leading-relaxed">
              All room square meters, ceiling heights, and door clearances have been laser-scanned
              and mathematically verified for real-estate conveyance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
