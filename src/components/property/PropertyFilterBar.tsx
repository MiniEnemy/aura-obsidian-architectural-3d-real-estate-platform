import React, { useState } from 'react';
import { usePropertyContext } from '../../context/PropertyContext';
import { Search, SlidersHorizontal, RotateCcw, Check } from 'lucide-react';

export const PropertyFilterBar: React.FC = () => {
  const { filters, setFilters, resetFilters, sortOption, setSortOption } = usePropertyContext();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <div className="w-full glass-panel rounded-xl border border-[#d4af37]/25 p-4 shadow-xl font-mono text-xs">
      {/* Primary Row: Search Bar & Type & Sort */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#d4af37]" />
          <input
            type="text"
            placeholder="Search by residence name, city (Los Angeles, Cannes, NY), neighborhood..."
            value={filters.query}
            onChange={(e) => setFilters((prev) => ({ ...prev, query: e.target.value }))}
            className="w-full bg-[#0a0c0e] border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-[#f5f6f8] text-xs focus:border-[#d4af37] outline-none placeholder-[#5c6673]"
          />
        </div>

        {/* Property Type Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={filters.propertyType}
            onChange={(e) => setFilters((prev) => ({ ...prev, propertyType: e.target.value }))}
            className="bg-[#0a0c0e] border border-white/10 rounded-lg px-3 py-2.5 text-[#f5f6f8] text-xs focus:border-[#d4af37] outline-none"
          >
            <option value="all">All Architectural Types</option>
            <option value="family-house">Modern Pavilion / House</option>
            <option value="villa">Mediterranean Villa</option>
            <option value="penthouse">Urban Duplex Penthouse</option>
          </select>

          {/* Sort Option */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as any)}
            className="bg-[#0a0c0e] border border-white/10 rounded-lg px-3 py-2.5 text-[#f5f6f8] text-xs focus:border-[#d4af37] outline-none"
          >
            <option value="recommended">Curated Recommended</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="area-desc">Floorplate: Largest Area</option>
            <option value="newest">Year Completed (Newest)</option>
          </select>

          {/* Toggle Advanced Filters Button */}
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={`px-3 py-2.5 rounded-lg border flex items-center gap-1.5 transition-all ${
              isAdvancedOpen
                ? 'bg-[#d4af37] text-[#0c0e11] font-semibold border-[#d4af37]'
                : 'bg-[#181c22] text-[#9eacb8] hover:text-[#f5f6f8] border-white/10'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filters</span>
          </button>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            title="Reset Filters"
            className="p-2.5 rounded-lg bg-[#181c22] text-[#9eacb8] hover:text-[#f5f6f8] border border-white/10 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Advanced Filters Expandable Drawer */}
      {isAdvancedOpen && (
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          {/* Price Range Slider */}
          <div>
            <div className="flex justify-between mb-1 text-[11px] text-[#9eacb8]">
              <span>MAX PRICE</span>
              <span className="text-[#f5f6f8] font-bold">
                ${(filters.maxPrice / 1000000).toFixed(1)}M
              </span>
            </div>
            <input
              type="range"
              min={5000000}
              max={25000000}
              step={1000000}
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, maxPrice: Number(e.target.value) }))
              }
              className="w-full accent-[#d4af37] h-1.5 bg-[#0a0c0e] rounded cursor-pointer"
            />
          </div>

          {/* Bedrooms Filter */}
          <div>
            <div className="mb-1 text-[11px] text-[#9eacb8]">MIN BEDROOMS</div>
            <div className="flex gap-1.5">
              {[0, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => setFilters((prev) => ({ ...prev, minBedrooms: num }))}
                  className={`flex-1 py-1.5 rounded border text-center transition-all ${
                    filters.minBedrooms === num
                      ? 'bg-[#d4af37] text-[#0c0e11] font-semibold border-[#d4af37]'
                      : 'bg-[#14171d] text-[#9eacb8] border-white/5 hover:border-white/20'
                  }`}
                >
                  {num === 0 ? 'Any' : `${num}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Spatial & Feature Amenities */}
          <div>
            <div className="mb-1 text-[11px] text-[#9eacb8]">SPECIALIZED AMENITIES</div>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'hasPool', label: 'Infinity Pool' },
                { key: 'hasGarden', label: 'Zen Garden' },
                { key: 'hasBalcony', label: 'Sky Balcony' },
                { key: 'has3D', label: '3D Walkthrough' },
                { key: 'hasVR', label: 'WebXR VR' },
                { key: 'hasAR', label: 'AR Ready' }
              ].map((item) => {
                const active = (filters as any)[item.key];
                return (
                  <button
                    key={item.key}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        [item.key]: !active
                      }))
                    }
                    className={`px-2.5 py-1 rounded text-[10px] tracking-wider uppercase border transition-all flex items-center gap-1 ${
                      active
                        ? 'border-[#d4af37] bg-[#d4af37]/20 text-[#f2ca50] font-semibold'
                        : 'border-white/5 bg-[#14171d] text-[#9eacb8] hover:border-white/20'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 text-[#d4af37]" />}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
