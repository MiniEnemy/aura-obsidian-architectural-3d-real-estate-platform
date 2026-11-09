import React from 'react';
import { usePropertyContext } from '../../context/PropertyContext';
import { Property } from '../../types/property';
import { formatPrice } from '../../utils/formatters';
import {
  GitCompare,
  Eye,
  X,
  Check,
  Minus,
  Sparkles,
  ArrowRight,
  Maximize2,
  Bed,
  Bath
} from 'lucide-react';

interface ComparePageProps {
  onEnter3D: (property: Property) => void;
  onViewDetails: (property: Property) => void;
  onExploreProperties: () => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({
  onEnter3D,
  onViewDetails,
  onExploreProperties
}) => {
  const { compareList, toggleComp, properties, currentCurrency } = usePropertyContext();

  const comparedProperties = properties.filter((p) => compareList.includes(p.id));

  if (comparedProperties.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center font-mono text-xs flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#181c22] border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37]">
          <GitCompare className="w-8 h-8" />
        </div>
        <h2 className="font-display text-3xl text-[#f5f6f8]">
          No Properties Selected for Comparison
        </h2>
        <p className="font-sans text-sm text-[#9eacb8] max-w-md">
          Browse our architectural collection and click the comparison icon on any property card to
          generate a side-by-side volumetric and financial matrix.
        </p>
        <button
          onClick={onExploreProperties}
          className="mt-2 py-3 px-6 rounded-lg bg-[#d4af37] text-[#0c0e11] font-semibold tracking-wider uppercase shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:bg-[#e5c358] transition-all"
        >
          Explore Architectural Collection
        </button>
      </div>
    );
  }

  const comparisonRows = [
    { label: 'Acquisition Price', getValue: (p: Property) => formatPrice(p.price, currentCurrency) },
    { label: 'Interior Living Area', getValue: (p: Property) => `${p.totalAreaSqm} m² (${Math.round(p.totalAreaSqm * 10.76)} sq ft)` },
    { label: 'Price per Square Meter', getValue: (p: Property) => formatPrice(Math.round(p.price / p.totalAreaSqm), currentCurrency) + '/m²' },
    { label: 'Bedrooms', getValue: (p: Property) => `${p.bedrooms} Suites` },
    { label: 'Bathrooms', getValue: (p: Property) => `${p.bathrooms} Bathrooms` },
    { label: 'Architectural Floors', getValue: (p: Property) => `${p.floors.length} Levels` },
    { label: 'Year Completed', getValue: (p: Property) => p.yearBuilt },
    { label: 'Architect / Atelier', getValue: (p: Property) => p.architect || 'Atelier Obsidian' },
    { label: 'Energy Rating', getValue: (p: Property) => `Class ${p.energyRating}` },
    { label: 'Infinity Reflection Pool', isBoolean: true, getValue: (p: Property) => p.features.some((f) => f.toLowerCase().includes('pool')) },
    { label: 'Private Courtyard / Garden', isBoolean: true, getValue: (p: Property) => p.features.some((f) => f.toLowerCase().includes('garden') || f.toLowerCase().includes('courtyard')) },
    { label: 'Cantilevered Balcony / Loggia', isBoolean: true, getValue: (p: Property) => p.features.some((f) => f.toLowerCase().includes('balcony') || f.toLowerCase().includes('terrace')) },
    { label: 'Real-Time 3D Walkthrough', isBoolean: true, getValue: (p: Property) => p.has3D },
    { label: 'WebXR Headset VR Support', isBoolean: true, getValue: (p: Property) => p.hasVR },
    { label: 'Tabletop Holographic AR', isBoolean: true, getValue: (p: Property) => p.hasAR }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-mono text-xs flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2 text-xs text-[#d4af37] tracking-widest uppercase mb-1">
          <GitCompare className="w-3.5 h-3.5" />
          <span>Volumetric & Commercial Comparison Matrix</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl text-[#f5f6f8] font-normal tracking-tight">
          Compare Residences
        </h1>
        <p className="font-sans text-sm text-[#9eacb8] mt-1">
          Side-by-side analysis across square meters, architectural amenities, and spatial features.
        </p>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto glass-panel rounded-xl border border-white/10 shadow-2xl">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-white/10">
              <th className="p-4 text-left text-[11px] text-[#9eacb8] uppercase tracking-wider w-64 bg-[#0c0e11]/50">
                Architectural Metrics
              </th>
              {comparedProperties.map((p) => (
                <th key={p.id} className="p-4 text-left min-w-[260px] bg-[#12151a]">
                  <div className="relative group">
                    <img
                      src={p.images.hero}
                      alt={p.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-36 rounded-lg object-cover mb-3 border border-white/10"
                    />
                    <button
                      onClick={() => toggleComp(p.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 text-[#9eacb8] hover:text-rose-400"
                      title="Remove from comparison"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h3 className="font-display text-base text-[#f5f6f8]">{p.name}</h3>
                  <div className="text-[11px] text-[#d4af37] font-semibold mt-0.5">
                    {formatPrice(p.price, currentCurrency)}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => onEnter3D(p)}
                      className="flex-1 py-2 px-3 rounded bg-[#d4af37] text-[#0c0e11] font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-1.5 hover:bg-[#e5c358] transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Enter 3D</span>
                    </button>
                    <button
                      onClick={() => onViewDetails(p)}
                      className="py-2 px-2.5 rounded bg-[#181c22] border border-white/10 text-[#f5f6f8] hover:text-[#d4af37]"
                      title="View Details"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {comparisonRows.map((row, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                <td className="p-4 text-[#9eacb8] font-medium bg-[#0c0e11]/40 border-r border-white/5">
                  {row.label}
                </td>
                {comparedProperties.map((p) => {
                  const val = row.getValue(p);
                  return (
                    <td key={p.id} className="p-4 text-[#f5f6f8] border-r border-white/5 last:border-0">
                      {row.isBoolean ? (
                        val ? (
                          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                            <Check className="w-4 h-4" /> Included
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[#5c6673]">
                            <Minus className="w-4 h-4" /> None
                          </span>
                        )
                      ) : (
                        <span>{val}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
