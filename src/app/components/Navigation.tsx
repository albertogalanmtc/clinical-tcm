import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { Leaf, Pill, FileText, Beaker, StickyNote, LogOut, ShieldCheck, HelpCircle, Settings, User, Eye } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { cn } from "@/lib/utils";
import { Avatar } from './Avatar';
import { PlanBadge } from './PlanBadge';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useState, useRef, useEffect } from 'react';
import { getPlatformSettings } from '@/app/data/platformSettings';
import { checkUnsavedChanges } from '@/app/hooks/useUnsavedChanges';

interface NavigationProps {
  onToggleNotes: () => void;
  isNotesVisible: boolean;
  onOpenGlobalSettings?: (tab?: 'herbs' | 'formulas' | 'prescriptions' | 'builder') => void;
}

// Helper to get icon component from string name
const getIconComponent = (iconName: string) => {
  const LucideIconsAny = LucideIcons as any;
  return LucideIconsAny[iconName] || HelpCircle;
};

export function Navigation({ onToggleNotes, isNotesVisible, onOpenGlobalSettings }: NavigationProps) {
  const { name, avatarColor, avatarImage, isAdmin, title, firstName, lastName, planType } = useUser();
  const { t } = useLanguage();

  console.log('🎯 Navigation render - isAdmin:', isAdmin, 'planType:', planType);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're in Account or Admin Panel routes (to hide mobile footer nav)
  const isInAccountOrAdmin = location.pathname.startsWith('/account') || location.pathname.startsWith('/admin');

  // Get branding and design settings
  const [branding, setBranding] = useState(() => getPlatformSettings().branding);
  const [designSettings, setDesignSettings] = useState(() => getPlatformSettings().designSettings);

  // Helper function to determine which tab to open based on current route
  const getTabFromRoute = (): 'herbs' | 'formulas' | 'prescriptions' | 'builder' => {
    const path = location.pathname;
    if (path.startsWith('/herbs')) return 'herbs';
    if (path.startsWith('/formulas')) return 'formulas';
    if (path.startsWith('/prescriptions')) return 'prescriptions';
    if (path.startsWith('/builder')) return 'builder';
    return 'herbs'; // default fallback
  };
  
  // Update settings when storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const settings = getPlatformSettings();
      console.log('Branding updated:', settings.branding);
      setBranding(settings.branding);
      setDesignSettings(settings.designSettings);
    };

    window.addEventListener('storage', handleStorageChange);
    // Also listen for custom event for same-tab updates
    window.addEventListener('platformSettingsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('platformSettingsUpdated', handleStorageChange);
    };
  }, []);

  // Build navItems dynamically from design settings
  const navItems = [
    { to: '/herbs', label: t('nav.herbs'), icon: getIconComponent(designSettings.navigationIcons.herbs), customSvg: designSettings.customSvgs?.herbs },
    { to: '/formulas', label: t('nav.formulas'), icon: getIconComponent(designSettings.navigationIcons.formulas), customSvg: designSettings.customSvgs?.formulas },
    { to: '/prescriptions', label: t('nav.prescriptions'), icon: getIconComponent(designSettings.navigationIcons.prescriptions), customSvg: designSettings.customSvgs?.prescriptions },
    { to: '/builder', label: t('nav.builder'), icon: getIconComponent(designSettings.navigationIcons.builder), customSvg: designSettings.customSvgs?.builder },
  ];

  // Default logo URL
  const DEFAULT_LOGO_URL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%230d9488"/%3E%3Ctext x="50" y="65" font-size="32" fill="white" text-anchor="middle" font-family="Arial"%3ECT%3C/text%3E%3C/svg%3E';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = async () => {
    // Check for unsaved changes
    if (checkUnsavedChanges()) {
      const confirmLogout = window.confirm(
        'You have unsaved changes in your prescription. Do you want to discard them and log out?'
      );
      if (!confirmLogout) {
        return; // User cancelled logout
      }
      // User confirmed, clear the draft
      localStorage.removeItem('builder-prescription-draft');
    }

    // Sign out from Supabase
    const { supabase } = await import('../lib/supabase');
    await supabase.auth.signOut();

    // Clear user session data
    localStorage.removeItem('userRole');
    localStorage.removeItem('onboardingCompleted');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userPlanType');
    localStorage.removeItem('supabaseSession');
    localStorage.removeItem('supabaseUser');

    setIsDropdownOpen(false);
    setShowLogoutModal(false);
    // Navigate to login page
    navigate('/login');
  };

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    setShowLogoutModal(true);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link to="/app" className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0">
              {branding.logoUrl ? (
                <img 
                  src={branding.logoUrl} 
                  alt="Logo" 
                  className="w-10 h-10 sm:w-8 sm:h-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_LOGO_URL;
                  }}
                />
              ) : (
                <div className="w-10 h-10 sm:w-8 sm:h-8 bg-brand-primary rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 sm:w-5 sm:h-5 text-white" />
                </div>
              )}
              {branding.showAppName && (
                <span className="font-semibold text-base sm:text-lg text-gray-900 inline truncate">
                  {branding.appName}
                </span>
              )}
            </Link>
          </div>
          
          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden sm:flex gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide flex-1 justify-center mx-2 sm:mx-4">
            {navItems.map(({ to, label, icon: Icon, customSvg }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap',
                    isActive
                      ? 'bg-teal-50 text-teal-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
              >
                {customSvg ? (
                  <div 
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" 
                    dangerouslySetInnerHTML={{ __html: customSvg }}
                  />
                ) : (
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                )}
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={() => {
                console.log('🔘 Notes button clicked!');
                onToggleNotes();
              }}
              className={cn(
                'flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap',
                isNotesVisible
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
              title="Toggle Notes"
            >
              <StickyNote className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav.notes')}</span>
            </button>

            {onOpenGlobalSettings && (
              <button
                onClick={() => onOpenGlobalSettings(getTabFromRoute())}
                className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors whitespace-nowrap"
                title={t('menus.displaySettings')}
              >
                <Eye className="w-[18px] h-[18px]" />
              </button>
            )}

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-center sm:justify-start gap-2 hover:opacity-80 transition-opacity"
                title={t('menus.account')}
              >
                <Avatar name={name} size="sm" color={avatarColor} image={avatarImage} />
                <span className="hidden sm:inline text-sm font-medium text-gray-700">
                  {title && `${title} `}{firstName} {lastName}
                </span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden z-50">
                  {/* User Plan Badge - Only show for non-admin users */}
                  {!isAdmin && (
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">{t('menus.currentPlan')}</p>
                      <PlanBadge />
                    </div>
                  )}
                  
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate('/account');
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                      <User className="w-4 h-4" />
                      {t('menus.account')}
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setIsDropdownOpen(false);
                          navigate('/admin');
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                        <ShieldCheck className="w-4 h-4" />
                        {t('menus.adminPanel')}
                      </button>
                    )}
                  </div>
                  <div className="border-t border-gray-200">
                    <button
                      onClick={handleLogoutClick}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('menus.logOut')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Footer Navigation - hide when in Account or Admin Panel */}
      {!isInAccountOrAdmin && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map(({ to, label, icon: Icon, customSvg }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors min-w-[60px]',
                    isActive
                      ? 'text-teal-700'
                      : 'text-gray-600'
                  )
                }
              >
                {customSvg ? (
                  <div
                    className="w-5 h-5 flex-shrink-0"
                    dangerouslySetInnerHTML={{ __html: customSvg }}
                  />
                ) : (
                  <Icon className="w-5 h-5 flex-shrink-0" />
                )}
                <span className="text-[10px] font-medium">{label}</span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={() => setShowLogoutModal(false)}>
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
            aria-describedby="logout-modal-description"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="logout-modal-title" className="text-lg font-semibold text-gray-900 mb-2">Cerrar sesión</h3>
            <p id="logout-modal-description" className="text-gray-600 mb-6">¿Estás seguro de que quieres cerrar sesión?</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
