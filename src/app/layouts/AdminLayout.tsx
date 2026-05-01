import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Database, Users, DollarSign, Filter, Type, BarChart3, Layout, Settings, X, Menu, LogOut, LayoutDashboard, ChevronLeft, MessageCircle } from 'lucide-react';
import { checkUnsavedChanges } from '@/app/hooks/useUnsavedChanges';

const adminMenuItems = [
  {
    path: '/admin/dashboard',
    label: 'Admin Dashboard',
    icon: LayoutDashboard,
  },
  {
    path: '/admin/content',
    label: 'Content',
    icon: Database,
  },
  {
    path: '/admin/users',
    label: 'Users',
    icon: Users,
  },
  {
    path: '/admin/community',
    label: 'Community',
    icon: MessageCircle,
  },
  {
    path: '/admin/plan-management',
    label: 'Plan Management',
    icon: DollarSign,
  },
  {
    path: '/admin/advanced-filters',
    label: 'Safety Categories',
    icon: Filter,
  },
  {
    path: '/admin/design-settings',
    label: 'Design Settings',
    icon: Type,
  },
  {
    path: '/admin/usage-analytics',
    label: 'Usage Analytics',
    icon: BarChart3,
  },
  {
    path: '/admin/dashboard-content',
    label: 'Dashboard Content',
    icon: Layout,
  },
  {
    path: '/admin/settings',
    label: 'Platform Settings',
    icon: Settings,
  },
];

export default function AdminLayout() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on the Admin index page or a subpage
  const isAdminIndex = location.pathname === '/admin' || location.pathname === '/admin/';
  const isOnSubPage = !isAdminIndex;

  // Get current page title based on route
  const getCurrentPageTitle = () => {
    const currentItem = adminMenuItems.find(item => item.path === location.pathname);
    return currentItem?.label || 'Admin Panel';
  };

  const handleLogout = () => {
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

    // Clear user session data
    localStorage.removeItem('userRole');
    localStorage.removeItem('onboardingCompleted');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('userPlanType');

    setIsMobileSidebarOpen(false);
    setShowLogoutModal(false);
    // Navigate to login page
    navigate('/login');
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleMobileBack = () => {
    if (!isOnSubPage) {
      // If on Admin index, go back to main app
      navigate('/app');
      return;
    }

    // Count path segments after /admin
    const pathAfterAdmin = location.pathname.replace(/^\/admin\/?/, '');
    const segments = pathAfterAdmin.split('/').filter(s => s.length > 0);

    // If we're on a deeply nested page (2+ segments), go back in history
    // Examples: /admin/stats/total-users, /admin/users/123/formulas
    if (segments.length >= 2) {
      navigate(-1);
    } else {
      // If we're on a first-level page, go back to Admin index
      // Examples: /admin/users, /admin/content
      navigate('/admin');
    }
  };

  // Listen for modal open/close events to hide footer
  useEffect(() => {
    const handleModalOpen = () => setIsModalOpen(true);
    const handleModalClose = () => setIsModalOpen(false);

    window.addEventListener('modal-opened', handleModalOpen);
    window.addEventListener('modal-closed', handleModalClose);

    return () => {
      window.removeEventListener('modal-opened', handleModalOpen);
      window.removeEventListener('modal-closed', handleModalClose);
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Mobile-only Header - replaces Navigation on mobile */}
      <div className="lg:hidden bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-[50]">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            onClick={handleMobileBack}
            className="flex items-center justify-center w-8 h-8 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold text-gray-900">
            {isAdminIndex ? 'Admin Panel' : getCurrentPageTitle()}
          </h1>
          <div className="w-8" /> {/* Spacer for centering */}
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0 overflow-hidden lg:overflow-auto p-0 lg:p-6 lg:pb-6 gap-0 lg:gap-4 bg-white lg:bg-transparent">
        {/* Desktop Hamburger Button - only show on desktop when sidebar is collapsible */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="hidden lg:hidden fixed top-20 left-4 z-40 w-10 h-10 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center text-gray-700 shadow-sm"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Overlay - not needed in new mobile design */}
        {isMobileSidebarOpen && (
          <div
            className="hidden lg:block fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        <div className="flex gap-4 lg:gap-6 flex-1 min-h-0 items-start">
          {/* Sidebar - On mobile: show as full page on index, hide on subpages */}
          <aside
            className={`
              ${isOnSubPage ? 'hidden lg:flex' : 'flex'}
              fixed lg:static top-14 lg:top-0 left-0 w-full lg:w-72 bg-white lg:rounded-lg lg:border border-gray-200 z-[45] lg:flex-shrink-0
              transition-transform duration-300 ease-in-out
              ${isMobileSidebarOpen ? 'translate-x-0' : 'lg:translate-x-0'}
              flex-col
              h-[calc(100vh-3.5rem-68px)] lg:h-[calc(100vh-7rem)]
            `}
          >
            {/* Desktop Header */}
            <div className="hidden lg:block px-6 pt-6 pb-4">
              <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
            </div>

            {/* Mobile Header - hidden since we have the new mobile header */}
            <div className="hidden lg:hidden flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex-1 overflow-y-auto overscroll-none lg:overscroll-auto px-4 pt-4 lg:py-2">
              <div className="space-y-1 -mt-1 lg:mt-0">
                {adminMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={() => setIsMobileSidebarOpen(false)}
                    >
                      {({ isActive }) => (
                        <div className={`flex items-center gap-3 px-0 pr-4 py-3 lg:px-4 lg:rounded-lg text-sm font-medium transition-colors -mx-4 lg:mx-0 pl-4 ${
                          isActive
                            ? 'bg-teal-50 text-teal-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}>
                          <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : 'text-gray-400'}`} />
                          <span className="flex-1">{item.label}</span>
                          <ChevronLeft className="w-4 h-4 text-gray-400 rotate-180 lg:hidden" />
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </nav>

            {/* Log Out Button at Bottom - Desktop inline, Mobile fixed */}
            <div className="hidden lg:block px-2 py-2 lg:p-4 border-t border-gray-200">
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-3 px-3 py-2 lg:px-4 lg:py-3 lg:rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors w-full rounded-lg min-h-[54px] lg:min-h-0"
              >
                <LogOut className="w-5 h-5 text-gray-400" />
                <span>Log out</span>
              </button>
            </div>
          </aside>

          {/* Mobile Fixed Footer - Log Out Button (only on index without modal) */}
          {!isModalOpen && isAdminIndex && (
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[50]">
              <div className="flex items-center justify-start px-2 py-3.5">
                <button
                  onClick={handleLogoutClick}
                  className="flex items-center gap-3 px-0 pr-0 pl-4 py-2.5 lg:px-4 lg:rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium -mx-2 lg:mx-0 w-full"
                >
                  <LogOut className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          )}
          {/* Gray Footer (only on subpages with modal) */}
          {isModalOpen && isOnSubPage && (
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-gray-100 z-[50] h-[68px]"></div>
          )}

          {/* Content Area - On mobile: show only on subpages, hide on index */}
          <main className={`
            ${isAdminIndex ? 'hidden lg:flex' : 'flex'}
            flex-1 min-w-0 bg-white lg:rounded-lg lg:border border-gray-200 lg:max-h-[calc(100vh-7rem)] flex-col overflow-hidden
            fixed lg:static top-14 left-0 right-0 ${isAdminIndex || isModalOpen ? 'bottom-[68px]' : 'bottom-0'} lg:h-auto z-[40]
          `}>
            <div className="flex-1 overflow-y-auto overscroll-contain lg:overscroll-auto px-4 py-4 lg:p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

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
    </div>
  );
}
