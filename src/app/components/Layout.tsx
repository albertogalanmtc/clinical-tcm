import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navigation } from './Navigation';
import { FloatingNotes } from './FloatingNotes';
import { GlobalSettingsModal } from './GlobalSettingsModal';
import { Toaster } from 'sonner';
import { useGlobalSettings } from '../hooks/useGlobalSettings';

export default function Layout() {
  const [isNotesVisible, setIsNotesVisible] = useState(false);
  const [isGlobalSettingsOpen, setIsGlobalSettingsOpen] = useState(false);
  const [globalSettingsTab, setGlobalSettingsTab] = useState<'herbs' | 'formulas' | 'prescriptions' | 'builder'>('herbs');
  const { globalSettings, updateGlobalSettings } = useGlobalSettings();
  const location = useLocation();

  // Check if we're in Account or Admin Panel routes (mobile only)
  const isInAccountOrAdmin = location.pathname.startsWith('/account') || location.pathname.startsWith('/admin');

  // Load notes visibility state from localStorage on mount
  useEffect(() => {
    const savedVisibility = localStorage.getItem('tcm_notes_visible');
    if (savedVisibility !== null) {
      setIsNotesVisible(savedVisibility === 'true');
    }
  }, []);

  // Save notes visibility state
  useEffect(() => {
    localStorage.setItem('tcm_notes_visible', isNotesVisible.toString());
  }, [isNotesVisible]);

  const toggleNotes = () => {
    console.log('📝 toggleNotes called - current state:', isNotesVisible);
    setIsNotesVisible(!isNotesVisible);
    console.log('📝 toggleNotes - new state will be:', !isNotesVisible);
  };

  const openGlobalSettings = (tab: 'herbs' | 'formulas' | 'prescriptions' | 'builder' = 'herbs') => {
    setGlobalSettingsTab(tab);
    setIsGlobalSettingsOpen(true);
  };

  return (
    <div className="h-screen overflow-hidden bg-gray-50 flex flex-col">
      {/* Hide Navigation on mobile when in Account or Admin Panel routes */}
      <div className={isInAccountOrAdmin ? 'hidden lg:block' : ''}>
        <Navigation
          onToggleNotes={toggleNotes}
          isNotesVisible={isNotesVisible}
          onOpenGlobalSettings={() => openGlobalSettings()}
        />
      </div>
      <main className="flex-1 min-h-0 overflow-auto">
        <Outlet context={{ openGlobalSettings }} />
      </main>
      <FloatingNotes isVisible={isNotesVisible} onClose={() => setIsNotesVisible(false)} />
      <GlobalSettingsModal
        isOpen={isGlobalSettingsOpen}
        onClose={() => setIsGlobalSettingsOpen(false)}
        settings={globalSettings}
        onUpdateSettings={updateGlobalSettings}
        defaultTab={globalSettingsTab}
      />
      <Toaster position="top-center" className="sm:!top-right" />
    </div>
  );
}