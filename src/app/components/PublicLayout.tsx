import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { getPlatformSettings } from '../data/platformSettings';
import { useEffect, useState } from 'react';

interface PublicLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
}

export default function PublicLayout({ children, showBackButton = false }: PublicLayoutProps) {
  const [branding, setBranding] = useState(() => getPlatformSettings().branding);
  const currentYear = new Date().getFullYear();

  // Update branding when storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const settings = getPlatformSettings();
      setBranding(settings.branding);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('platformSettingsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('platformSettingsUpdated', handleStorageChange);
    };
  }, []);

  const DEFAULT_LOGO_URL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%230d9488"/%3E%3Ctext x="50" y="65" font-size="32" fill="white" text-anchor="middle" font-family="Arial"%3ECT%3C/text%3E%3C/svg%3E';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt="Logo"
                className="h-8 object-contain"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_LOGO_URL;
                }}
              />
            ) : (
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="text-xl font-bold text-gray-900">
              {branding.platformName}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/create-account"
              className="text-sm px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} {branding.platformName}. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <Link to="/legal" className="hover:text-gray-900 transition-colors">
                Legal
              </Link>
              <Link to="/legal/terms" className="hover:text-gray-900 transition-colors">
                Terms
              </Link>
              <Link to="/legal/privacy" className="hover:text-gray-900 transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
