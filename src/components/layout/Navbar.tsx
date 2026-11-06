import React from 'react';
import { usePropertyContext } from '../../context/PropertyContext';
import { Compass, Heart, GitCompare, Calendar, Box, Eye, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentView: 'home' | 'properties' | 'detail' | 'viewer' | 'saved' | 'compare';
  onNavigate: (view: 'home' | 'properties' | 'detail' | 'viewer' | 'saved' | 'compare') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate }) => {
  const {
    favorites,
    compareList,
    setIsScheduleModalOpen,
    currentCurrency,
    setCurrentCurrency
  } = usePropertyContext();

  return (
    <header className="sticky top-0 z-40 w-full glass-submerged border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#181c22] to-[#0c0e11] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shadow-[0_0_18px_rgba(212,175,55,0.25)] group-hover:border-[#d4af37] transition-all">
            <Box className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display text-2xl font-light tracking-wider text-[#f5f6f8] group-hover:text-[#d4af37] transition-colors">
                AURA
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono tracking-widest text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/30 uppercase">
                SPATIAL
              </span>
            </div>
            <p className="font-mono text-[9px] tracking-widest text-[#9eacb8] uppercase">
              Obsidian Architectural Platform
            </p>
          </div>
        </div>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1 font-mono text-xs">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3.5 py-2 rounded-lg transition-all ${
              currentView === 'home'
                ? 'text-[#d4af37] bg-[#d4af37]/10 font-medium'
                : 'text-[#9eacb8] hover:text-[#f5f6f8] hover:bg-white/5'
            }`}
          >
            Discover
          </button>

          <button
            onClick={() => onNavigate('properties')}
            className={`px-3.5 py-2 rounded-lg transition-all ${
              currentView === 'properties'
                ? 'text-[#d4af37] bg-[#d4af37]/10 font-medium'
                : 'text-[#9eacb8] hover:text-[#f5f6f8] hover:bg-white/5'
            }`}
          >
            Residences
          </button>

          <button
            onClick={() => onNavigate('viewer')}
            className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
              currentView === 'viewer'
                ? 'text-[#0c0e11] bg-[#d4af37] font-semibold shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                : 'text-[#d4af37] bg-[#181c22] border border-[#d4af37]/30 hover:bg-[#d4af37]/15'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Enter 3D Viewer</span>
          </button>
        </nav>

        {/* Right Tools */}
        <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs">
          {/* Currency Switcher */}
          <div className="hidden sm:flex items-center bg-[#14171d] rounded-lg p-0.5 border border-white/5 text-[10px]">
            {(['USD', 'EUR', 'GBP'] as const).map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrentCurrency(curr)}
                className={`px-2 py-1 rounded transition-all ${
                  currentCurrency === curr
                    ? 'bg-[#d4af37] text-[#0c0e11] font-bold'
                    : 'text-[#9eacb8] hover:text-[#f5f6f8]'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Compare Button */}
          <button
            onClick={() => onNavigate('compare')}
            className={`p-2.5 rounded-lg border transition-all relative ${
              currentView === 'compare' || compareList.length > 0
                ? 'border-[#d4af37]/40 text-[#d4af37] bg-[#181c22]'
                : 'border-white/5 text-[#9eacb8] hover:text-[#f5f6f8]'
            }`}
            title="Compare Properties"
          >
            <GitCompare className="w-4 h-4" />
            {compareList.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#d4af37] text-[#0c0e11] font-bold text-[9px] flex items-center justify-center">
                {compareList.length}
              </span>
            )}
          </button>

          {/* Saved Favorites */}
          <button
            onClick={() => onNavigate('saved')}
            className={`p-2.5 rounded-lg border transition-all relative ${
              currentView === 'saved'
                ? 'border-rose-500/40 text-rose-400 bg-rose-500/10'
                : 'border-white/5 text-[#9eacb8] hover:text-rose-400'
            }`}
            title="Saved Residences"
          >
            <Heart className={`w-4 h-4 ${favorites.length > 0 ? 'fill-current text-rose-400' : ''}`} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>

          {/* Schedule Visit Modal Trigger */}
          <button
            onClick={() => setIsScheduleModalOpen(true)}
            className="hidden lg:flex items-center gap-1.5 py-2 px-3.5 rounded-lg bg-[#d4af37] text-[#0c0e11] font-semibold text-xs tracking-wider uppercase hover:bg-[#e5c358] transition-all shadow-[0_0_15px_rgba(212,175,55,0.25)]"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Visit</span>
          </button>
        </div>
      </div>
    </header>
  );
};
