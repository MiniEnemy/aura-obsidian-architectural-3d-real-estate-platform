import React, { Suspense, useState, useEffect } from 'react';
import { PropertyProvider, usePropertyContext } from './context/PropertyContext';
import { ViewerProvider, useViewerContext } from './context/ViewerContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { QuickCompareDrawer } from './components/layout/QuickCompareDrawer';
import { HomePage } from './components/pages/HomePage';
import { PropertiesPage } from './components/pages/PropertiesPage';
import { PropertyDetailPage } from './components/pages/PropertyDetailPage';
import { ComparePage } from './components/pages/ComparePage';
import { SavedPropertiesPage } from './components/pages/SavedPropertiesPage';
import { ScheduleVisitModal } from './components/property/ScheduleVisitModal';
import { ContactAgentModal } from './components/property/ContactAgentModal';
import { ShareModal } from './components/property/ShareModal';
import { Property } from './types/property';

// The 3D engine (Three.js) is only needed for the immersive viewer, so it is
// split into its own chunk and loaded on demand.
const ViewerPage = React.lazy(() =>
  import('./components/pages/ViewerPage').then((m) => ({ default: m.ViewerPage }))
);

const ViewerLoadingFallback: React.FC = () => (
  <div
    className="min-h-screen bg-[#111317] flex flex-col items-center justify-center gap-4"
    role="status"
    aria-live="polite"
  >
    <div className="w-10 h-10 border-2 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin" />
    <span className="font-mono text-xs tracking-widest uppercase text-[#9eacb8]">
      Loading spatial engine…
    </span>
  </div>
);

type ViewMode = 'home' | 'properties' | 'detail' | 'viewer' | 'saved' | 'compare';

const MainAppContent: React.FC = () => {
  const { activeProperty, setActivePropertyById, properties } = usePropertyContext();
  const { jumpToRoom, resetToExterior } = useViewerContext();

  const [currentView, setCurrentView] = useState<ViewMode>('home');

  // Handle URL hash routing on initial mount or popstate
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('property/')) {
        const slug = hash.replace('property/', '');
        const match = properties.find((p) => p.slug === slug || p.id === slug);
        if (match) {
          setActivePropertyById(match.id);
          setCurrentView('detail');
        } else {
          setCurrentView('properties');
        }
      } else if (hash === 'viewer') {
        setCurrentView('viewer');
      } else if (hash === 'properties') {
        setCurrentView('properties');
      } else if (hash === 'compare') {
        setCurrentView('compare');
      } else if (hash === 'saved') {
        setCurrentView('saved');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleEnter3D = (prop: Property, roomId?: string) => {
    setActivePropertyById(prop.id);
    setCurrentView('viewer');
    window.location.hash = 'viewer';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (roomId) {
      setTimeout(() => {
        jumpToRoom(roomId);
      }, 400);
    } else {
      setTimeout(() => {
        resetToExterior();
      }, 100);
    }
  };

  const handleViewDetails = (prop: Property) => {
    setActivePropertyById(prop.id);
    setCurrentView('detail');
    window.location.hash = `property/${prop.slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (view: ViewMode) => {
    setCurrentView(view);
    if (view === 'home') window.location.hash = '';
    else if (view === 'properties') window.location.hash = 'properties';
    else if (view === 'viewer') window.location.hash = 'viewer';
    else if (view === 'compare') window.location.hash = 'compare';
    else if (view === 'saved') window.location.hash = 'saved';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#111317] text-[#e2e2e6] flex flex-col justify-between selection:bg-[#d4af37]/30 selection:text-[#f2ca50]">
      {/* Navigation Bar */}
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {/* Main View Router */}
      <main className="flex-1 w-full">
        {currentView === 'home' && (
          <HomePage
            onEnter3D={handleEnter3D}
            onViewDetails={handleViewDetails}
            onExploreAll={() => handleNavigate('properties')}
          />
        )}

        {currentView === 'properties' && (
          <PropertiesPage
            onEnter3D={handleEnter3D}
            onViewDetails={handleViewDetails}
          />
        )}

        {currentView === 'detail' && (
          <PropertyDetailPage
            property={activeProperty}
            onEnter3D={handleEnter3D}
            onBack={() => handleNavigate('properties')}
          />
        )}

        {currentView === 'viewer' && (
          <Suspense fallback={<ViewerLoadingFallback />}>
            <ViewerPage onBackToProperty={() => handleNavigate('detail')} />
          </Suspense>
        )}

        {currentView === 'compare' && (
          <ComparePage
            onEnter3D={handleEnter3D}
            onViewDetails={handleViewDetails}
            onExploreProperties={() => handleNavigate('properties')}
          />
        )}

        {currentView === 'saved' && (
          <SavedPropertiesPage
            onEnter3D={handleEnter3D}
            onViewDetails={handleViewDetails}
            onExploreProperties={() => handleNavigate('properties')}
          />
        )}
      </main>

      {/* Footer (shown on all pages except full-screen 3D viewer) */}
      {currentView !== 'viewer' && <Footer />}

      {/* Global Modals & Drawers */}
      <ScheduleVisitModal />
      <ContactAgentModal />
      <ShareModal />
      <QuickCompareDrawer onGoToComparePage={() => handleNavigate('compare')} />
    </div>
  );
};

export default function App() {
  return (
    <PropertyProvider>
      <ViewerProvider>
        <MainAppContent />
      </ViewerProvider>
    </PropertyProvider>
  );
}
