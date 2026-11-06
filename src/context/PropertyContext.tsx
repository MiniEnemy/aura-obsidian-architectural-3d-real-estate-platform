import React, { createContext, useContext, useState, useEffect } from 'react';
import { Property, ScheduledVisit } from '../types/property';
import { PROPERTIES } from '../data/propertiesData';
import {
  getFavorites,
  toggleFavorite as storageToggleFavorite,
  getCompareList,
  toggleCompare as storageToggleCompare,
  getScheduledVisits,
  saveScheduledVisit as storageSaveVisit
} from '../utils/storage';

interface PropertyFilters {
  query: string;
  propertyType: string;
  minPrice: number;
  maxPrice: number;
  minBedrooms: number;
  hasPool: boolean;
  hasGarden: boolean;
  hasBalcony: boolean;
  has3D: boolean;
  hasVR: boolean;
  hasAR: boolean;
}

type SortOption = 'recommended' | 'price-asc' | 'price-desc' | 'area-desc' | 'newest';

interface PropertyContextType {
  properties: Property[];
  filteredProperties: Property[];
  activeProperty: Property;
  setActivePropertyById: (id: string) => void;
  filters: PropertyFilters;
  setFilters: React.Dispatch<React.SetStateAction<PropertyFilters>>;
  resetFilters: () => void;
  sortOption: SortOption;
  setSortOption: (opt: SortOption) => void;
  favorites: string[];
  toggleFav: (id: string) => void;
  compareList: string[];
  toggleComp: (id: string) => void;
  scheduledVisits: ScheduledVisit[];
  addScheduledVisit: (visit: ScheduledVisit) => void;
  // Modal states
  isScheduleModalOpen: boolean;
  setIsScheduleModalOpen: (open: boolean) => void;
  isContactModalOpen: boolean;
  setIsContactModalOpen: (open: boolean) => void;
  isShareModalOpen: boolean;
  setIsShareModalOpen: (open: boolean) => void;
  isCompareDrawerOpen: boolean;
  setIsCompareDrawerOpen: (open: boolean) => void;
  modalTargetProperty: Property | null;
  setModalTargetProperty: (prop: Property | null) => void;
  currentCurrency: 'USD' | 'EUR' | 'GBP';
  setCurrentCurrency: (c: 'USD' | 'EUR' | 'GBP') => void;
}

const defaultFilters: PropertyFilters = {
  query: '',
  propertyType: 'all',
  minPrice: 0,
  maxPrice: 30000000,
  minBedrooms: 0,
  hasPool: false,
  hasGarden: false,
  hasBalcony: false,
  has3D: false,
  hasVR: false,
  hasAR: false
};

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties] = useState<Property[]>(PROPERTIES);
  const [activePropertyId, setActivePropertyId] = useState<string>('prop-obsidian-flagship');
  const [filters, setFilters] = useState<PropertyFilters>(defaultFilters);
  const [sortOption, setSortOption] = useState<SortOption>('recommended');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [scheduledVisits, setScheduledVisits] = useState<ScheduledVisit[]>([]);
  const [currentCurrency, setCurrentCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');

  // Modals
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCompareDrawerOpen, setIsCompareDrawerOpen] = useState(false);
  const [modalTargetProperty, setModalTargetProperty] = useState<Property | null>(null);

  useEffect(() => {
    setFavorites(getFavorites());
    setCompareList(getCompareList());
    setScheduledVisits(getScheduledVisits());
  }, []);

  const activeProperty =
    properties.find((p) => p.id === activePropertyId) || properties[0];

  const setActivePropertyById = (id: string) => {
    const found = properties.find((p) => p.id === id);
    if (found) {
      setActivePropertyId(id);
    }
  };

  const toggleFav = (id: string) => {
    const updated = storageToggleFavorite(id);
    setFavorites(updated);
  };

  const toggleComp = (id: string) => {
    const updated = storageToggleCompare(id);
    setCompareList(updated);
    if (updated.length > 0) {
      setIsCompareDrawerOpen(true);
    }
  };

  const addScheduledVisit = (visit: ScheduledVisit) => {
    const updated = storageSaveVisit(visit);
    setScheduledVisits(updated);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  // Filter calculation
  const filteredProperties = properties
    .filter((prop) => {
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const matchesName = prop.name.toLowerCase().includes(q);
        const matchesCity = prop.location.city.toLowerCase().includes(q);
        const matchesNeighborhood = prop.location.neighborhood.toLowerCase().includes(q);
        const matchesCountry = prop.location.country.toLowerCase().includes(q);
        if (!matchesName && !matchesCity && !matchesNeighborhood && !matchesCountry) {
          return false;
        }
      }
      if (filters.propertyType !== 'all' && prop.propertyType !== filters.propertyType) {
        return false;
      }
      if (prop.price < filters.minPrice || prop.price > filters.maxPrice) {
        return false;
      }
      if (filters.minBedrooms > 0 && prop.bedrooms < filters.minBedrooms) {
        return false;
      }
      if (filters.hasPool && !prop.features.some((f) => f.toLowerCase().includes('pool'))) {
        return false;
      }
      if (filters.hasGarden && !prop.features.some((f) => f.toLowerCase().includes('garden') || f.toLowerCase().includes('courtyard'))) {
        return false;
      }
      if (filters.hasBalcony && !prop.features.some((f) => f.toLowerCase().includes('balcony') || f.toLowerCase().includes('terrace'))) {
        return false;
      }
      if (filters.has3D && !prop.has3D) return false;
      if (filters.hasVR && !prop.hasVR) return false;
      if (filters.hasAR && !prop.hasAR) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'area-desc':
          return b.totalAreaSqm - a.totalAreaSqm;
        case 'newest':
          return b.yearBuilt - a.yearBuilt;
        case 'recommended':
        default:
          return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.viewCount - a.viewCount;
      }
    });

  return (
    <PropertyContext.Provider
      value={{
        properties,
        filteredProperties,
        activeProperty,
        setActivePropertyById,
        filters,
        setFilters,
        resetFilters,
        sortOption,
        setSortOption,
        favorites,
        toggleFav,
        compareList,
        toggleComp,
        scheduledVisits,
        addScheduledVisit,
        isScheduleModalOpen,
        setIsScheduleModalOpen,
        isContactModalOpen,
        setIsContactModalOpen,
        isShareModalOpen,
        setIsShareModalOpen,
        isCompareDrawerOpen,
        setIsCompareDrawerOpen,
        modalTargetProperty,
        setModalTargetProperty,
        currentCurrency,
        setCurrentCurrency
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
};

export const usePropertyContext = () => {
  const ctx = useContext(PropertyContext);
  if (!ctx) throw new Error('usePropertyContext must be used within PropertyProvider');
  return ctx;
};
