import { FileText, Shield, RefreshCw, AlertTriangle, ChevronRight, ArrowLeft, Cookie, Settings as SettingsIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getPlatformSettings } from '../data/platformSettings';
import type { LegalDocument } from '../data/platformSettings';
import { LegalDocumentModal } from '../components/LegalDocumentModal';
import { CookiePreferencesModal } from '../components/CookiePreferencesModal';

interface LegalCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  status?: 'published' | 'draft';
  lastUpdated?: string;
}

export default function Legal() {
  const location = useLocation();
  const [settings, setSettings] = useState(() => getPlatformSettings());
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);

  useEffect(() => {
    setSettings(getPlatformSettings());
  }, []);

  // Open modal if redirected from direct URL
  useEffect(() => {
    const state = location.state as { openDocument?: string } | null;
    if (state?.openDocument) {
      const doc = settings.legalDocuments.find(d => d.type === state.openDocument);
      if (doc && doc.status === 'published') {
        setSelectedDocument(doc);
        setIsModalOpen(true);
      }
      // Clear the state after opening modal
      window.history.replaceState({}, document.title);
    }
  }, [location.state, settings.legalDocuments]);

  // Map documents from platform settings and filter only published ones
  const documentsFromSettings = settings.legalDocuments
    .filter(doc => doc.status === 'published') // Only show published documents
    .map(doc => {
      const iconMap = {
        terms: <FileText className="w-6 h-6 text-teal-600" />,
        privacy: <Shield className="w-6 h-6 text-teal-600" />,
        cookies: <RefreshCw className="w-6 h-6 text-teal-600" />,
        refund: <RefreshCw className="w-6 h-6 text-teal-600" />,
        disclaimer: <AlertTriangle className="w-6 h-6 text-teal-600" />
      };

      const descriptionMap = {
        terms: 'Terms and conditions for using our Traditional Chinese Medicine platform',
        privacy: 'How we collect, use, and protect your personal information',
        cookies: 'Information about cookies and tracking technologies we use',
        refund: 'Our policy regarding refunds, cancellations, and billing disputes',
        disclaimer: 'Important information about the clinical use of this platform and professional responsibility'
      };

      return {
        id: doc.type,
        title: doc.title,
        description: doc.description || descriptionMap[doc.type] || '',
        icon: iconMap[doc.type],
        path: `/legal/${doc.type}`,
        status: doc.status,
        lastUpdated: doc.lastUpdated
      };
    });

  const handleDocumentClick = (docId: string) => {
    const doc = settings.legalDocuments.find(d => d.type === docId);
    if (doc && doc.status === 'published') {
      setSelectedDocument(doc);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8 pb-20 sm:pb-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/account-hub"
            className="h-10 w-10 sm:w-11 sm:h-11 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
            title="Back to Account"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Legal & Policies</h1>
          <p className="text-gray-600">
            Important legal information and policies for using our platform
          </p>
        </div>

        {/* Cookie Preferences Card */}
        <div className="mb-6">
          <button
            onClick={() => setIsCookieModalOpen(true)}
            className="group w-full bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg border border-teal-200 hover:border-teal-300 transition-all hover:shadow-sm p-6 text-left"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1 flex items-center gap-2">
                    Cookie Preferences
                    <SettingsIcon className="w-4 h-4 text-teal-600" />
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Manage your cookie consent preferences. Control which types of cookies we can use to improve your experience.
                  </p>
                  <p className="text-xs text-teal-700 font-medium">
                    Click to customize your preferences
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-teal-600 group-hover:translate-x-1 transition-transform flex-shrink-0 ml-2" />
            </div>
          </button>
        </div>

      {/* Legal Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {documentsFromSettings.map((doc) => (
          <button
            key={doc.id}
            onClick={() => handleDocumentClick(doc.id)}
            disabled={doc.status !== 'published'}
            className={`group relative bg-white rounded-lg border transition-all hover:shadow-sm text-left w-full ${
              doc.status === 'published'
                ? 'border-gray-200 hover:border-gray-300 cursor-pointer'
                : 'border-gray-200 opacity-60 cursor-not-allowed'
            }`}
          >
            <div className="p-6">
              {/* Icon, Title and Arrow */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-gray-900">
                      {doc.title}
                    </h3>
                    {doc.status === 'draft' && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {doc.description}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 transition-colors flex-shrink-0 ml-2" />
              </div>

              {/* Last Updated */}
              {doc.lastUpdated && doc.status === 'published' && (
                <p className="text-xs text-gray-500">
                  Last updated: {new Date(doc.lastUpdated).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              )}
            </div>

            {/* Draft Overlay */}
            {doc.status === 'draft' && (
              <div className="absolute inset-0 bg-gray-50/50 rounded-lg pointer-events-none" />
            )}
          </button>
        ))}
      </div>

      {/* Information Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">Important Information</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            • These documents govern your use of our Traditional Chinese Medicine platform
          </p>
          <p>
            • By using our services, you agree to comply with these terms and policies
          </p>
          <p>
            • We may update these documents from time to time. Check the "Last updated" date for changes
          </p>
          <p>
            • For questions about our legal policies, please contact our support team
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 mb-3">
          Have questions about our policies?
        </p>
        <Link
          to="/settings"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
        >
          Contact Support
        </Link>
      </div>
      </div>

      {/* Legal Document Modal */}
      <LegalDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        document={selectedDocument}
      />

      {/* Cookie Preferences Modal */}
      <CookiePreferencesModal
        isOpen={isCookieModalOpen}
        onClose={() => setIsCookieModalOpen(false)}
      />
    </>
  );
}