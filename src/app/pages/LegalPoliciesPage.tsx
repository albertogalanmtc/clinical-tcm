import { FileText, Shield, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPlatformSettings } from '../data/platformSettings';
import type { LegalDocument } from '../data/platformSettings';
import { LegalDocumentModal } from '../components/LegalDocumentModal';

export default function LegalPoliciesPage() {
  const [settings, setSettings] = useState(() => getPlatformSettings());
  const [selectedDocument, setSelectedDocument] = useState<LegalDocument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setSettings(getPlatformSettings());
  }, []);

  // Map documents from platform settings and filter only published ones
  const documentsFromSettings = settings.legalDocuments
    .filter(doc => doc.status === 'published')
    .map(doc => {
      const descriptionMap: Record<string, string> = {
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
        status: doc.status,
        lastUpdated: doc.lastUpdated,
        document: doc
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
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Legal & Policies</h1>
        <p className="text-gray-600">
          Important legal information and policies for using our platform
        </p>
      </div>

      <div className="space-y-6">
        {/* Legal Documents */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Legal Documents</h2>
                <p className="text-sm text-gray-500">View our terms, policies, and agreements</p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {documentsFromSettings.length > 0 ? (
              documentsFromSettings.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => handleDocumentClick(doc.id)}
                  disabled={doc.status !== 'published'}
                  className={`group w-full text-left px-6 py-4 transition-colors ${
                    doc.status === 'published'
                      ? 'hover:bg-gray-50 cursor-pointer'
                      : 'opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">
                          {doc.title}
                        </h3>
                        {doc.status === 'draft' && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                            Draft
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-1">
                        {doc.description}
                      </p>
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
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors flex-shrink-0" />
                  </div>
                </button>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                <p>No legal documents available at this time.</p>
              </div>
            )}
          </div>
        </div>

        {/* Information Box */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Important Information</h2>
                <p className="text-sm text-gray-500">What you need to know</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="text-sm text-gray-600 space-y-2">
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
        </div>
      </div>

      {/* Legal Document Modal */}
      <LegalDocumentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        document={selectedDocument}
      />
    </>
  );
}
