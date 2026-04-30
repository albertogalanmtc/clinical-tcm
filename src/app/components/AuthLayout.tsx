import { ReactNode, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import { getPlatformSettings } from '../data/platformSettings';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const [branding, setBranding] = useState(() => getPlatformSettings().branding);
  const [companyInfo, setCompanyInfo] = useState(() => getPlatformSettings().companyInfo);

  // Update branding and company info when storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const settings = getPlatformSettings();
      setBranding(settings.branding);
      setCompanyInfo(settings.companyInfo);
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
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            {branding.logoUrl ? (
              <img 
                src={branding.logoUrl} 
                alt="Logo" 
                className="h-16 object-contain"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_LOGO_URL;
                }}
              />
            ) : (
              <div className="w-16 h-16 bg-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Leaf className="w-10 h-10 text-white" />
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-gray-600">
              {subtitle}
            </p>
          )}
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {children}
        </div>

        {/* Professional Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            {companyInfo.platformTagline || 'Professional healthcare platform for licensed TCM practitioners'}
          </p>
        </div>
      </div>
    </div>
  );
}
