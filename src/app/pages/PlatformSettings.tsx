import { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  FileText,
  HelpCircle,
  Building,
  Palette,
  Shield,
  Save,
  Check,
  Eye,
  EyeOff,
  Upload,
  RotateCcw,
  X,
  KeyRound
} from 'lucide-react';
import {
  getPlatformSettings,
  updateLegalDocument,
  publishLegalDocument,
  draftLegalDocument,
  updateHelpSupport,
  addFAQ,
  updateFAQ,
  deleteFAQ,
  updateCompanyInfo,
  updateBranding,
  updateCompliance,
  type LegalDocument,
  type FAQ as FAQType
} from '../data/platformSettings';
import { AuthenticationSection } from '../components/AuthenticationSettings';
import { Link } from 'react-router-dom';

type TabType = 'legal' | 'help' | 'company' | 'branding' | 'authentication' | 'compliance';

export default function PlatformSettings() {
  const [activeTab, setActiveTab] = useState<TabType>('legal');
  const [settings, setSettings] = useState(() => getPlatformSettings());
  const [saveStatus, setSaveStatus] = useState<{ [key: string]: boolean }>({});

  // Store handlers for each section
  const [sectionSaveHandlers, setSectionSaveHandlers] = useState<{ [key: string]: () => void }>({});

  const refreshSettings = () => {
    setSettings(getPlatformSettings());
  };

  const showSaveConfirmation = (section: string) => {
    setSaveStatus(prev => ({ ...prev, [section]: true }));
    setTimeout(() => {
      setSaveStatus(prev => ({ ...prev, [section]: false }));
    }, 2000);
  };
  
  const handleSaveCurrentTab = () => {
    const handler = sectionSaveHandlers[activeTab];
    if (handler) {
      handler();
      showSaveConfirmation(activeTab);
    }
  };

  const tabs = [
    { id: 'legal' as TabType, label: 'Legal & Policies', icon: FileText },
    { id: 'help' as TabType, label: 'Help & Support', icon: HelpCircle },
    { id: 'company' as TabType, label: 'Company Info', icon: Building },
    { id: 'branding' as TabType, label: 'Branding', icon: Palette },
    { id: 'authentication' as TabType, label: 'Authentication', icon: KeyRound },
    { id: 'compliance' as TabType, label: 'Compliance', icon: Shield }
  ];

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Settings</h1>
        <p className="hidden sm:block text-gray-600">
          Manage institutional configuration, legal content, and platform branding
        </p>
      </div>

      {/* Save Button Section */}
      <div className="mb-8">
        <button
          onClick={handleSaveCurrentTab}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
        >
          {saveStatus[activeTab] ? (
            <>
              <Check className="w-4 h-4" />
              <span>Saved</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Section Toggle */}
        <nav className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`min-w-[110px] sm:flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

        {/* Tab Content */}
        {activeTab === 'legal' && (
          <LegalPoliciesSection 
            documents={settings.legalDocuments} 
            onRefresh={refreshSettings}
            onSave={() => showSaveConfirmation('legal')}
            saved={saveStatus.legal}
            onRegisterSaveHandler={(handler) => setSectionSaveHandlers(prev => ({ ...prev, legal: handler }))}
          />
        )}
        {activeTab === 'help' && (
          <HelpSupportSection 
            helpSupport={settings.helpSupport}
            onRefresh={refreshSettings}
            onSave={() => showSaveConfirmation('help')}
            saved={saveStatus.help}
            onRegisterSaveHandler={(handler) => setSectionSaveHandlers(prev => ({ ...prev, help: handler }))}
          />
        )}
        {activeTab === 'company' && (
          <CompanyInfoSection 
            companyInfo={settings.companyInfo}
            onRefresh={refreshSettings}
            onSave={() => showSaveConfirmation('company')}
            saved={saveStatus.company}
            onRegisterSaveHandler={(handler) => setSectionSaveHandlers(prev => ({ ...prev, company: handler }))}
          />
        )}
        {activeTab === 'branding' && (
          <BrandingSection 
            branding={settings.branding}
            onRefresh={refreshSettings}
            onSave={() => showSaveConfirmation('branding')}
            saved={saveStatus.branding}
            onRegisterSaveHandler={(handler) => setSectionSaveHandlers(prev => ({ ...prev, branding: handler }))}
          />
        )}
        {activeTab === 'authentication' && (
          <AuthenticationSection 
            authentication={settings.authentication}
            onRefresh={refreshSettings}
            onSave={() => showSaveConfirmation('authentication')}
            saved={saveStatus.authentication}
            onRegisterSaveHandler={(handler) => setSectionSaveHandlers(prev => ({ ...prev, authentication: handler }))}
          />
        )}
        {activeTab === 'compliance' && (
          <ComplianceSection
            compliance={settings.compliance}
            onRefresh={refreshSettings}
            onSave={() => showSaveConfirmation('compliance')}
            saved={saveStatus.compliance}
            onRegisterSaveHandler={(handler) => setSectionSaveHandlers(prev => ({ ...prev, compliance: handler }))}
          />
        )}
      </div>

      {/* Info Footer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> All content configured here is automatically reflected in the User Layer.
          Users cannot edit this information—only administrators have full control over visibility and versioning.
        </p>
      </div>
    </>
  );
}

// Legal & Policies Section
function LegalPoliciesSection({ 
  documents, 
  onRefresh, 
  onSave, 
  saved,
  onRegisterSaveHandler
}: { 
  documents: LegalDocument[]; 
  onRefresh: () => void;
  onSave: () => void;
  saved?: boolean;
  onRegisterSaveHandler: (handler: () => void) => void;
}) {
  const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(null);
  const [editedContent, setEditedContent] = useState('');
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  // Default descriptions map (same as in Legal.tsx)
  const defaultDescriptions: Record<string, string> = {
    terms: 'Terms and conditions for using our Traditional Chinese Medicine platform',
    privacy: 'How we collect, use, and protect your personal information',
    cookies: 'Information about cookies and tracking technologies we use',
    refund: 'Our policy regarding refunds, cancellations, and billing disputes',
    disclaimer: 'Important information about the clinical use of this platform and professional responsibility'
  };

  const handleSelectDocument = (doc: LegalDocument) => {
    setSelectedDoc(doc);
    setEditedContent(doc.content);
    setEditedTitle(doc.title);
    // Show the current description or the default one
    setEditedDescription(doc.description || defaultDescriptions[doc.type] || '');
  };

  const handleSave = () => {
    if (selectedDoc) {
      updateLegalDocument(selectedDoc.id, {
        title: editedTitle,
        description: editedDescription,
        content: editedContent
      });
      onRefresh();
      onSave();
    }
  };

  const handlePublish = () => {
    if (selectedDoc) {
      publishLegalDocument(selectedDoc.id);
      onRefresh();
      const updated = documents.find(d => d.id === selectedDoc.id);
      if (updated) setSelectedDoc(updated);
    }
  };

  const handleDraft = () => {
    if (selectedDoc) {
      draftLegalDocument(selectedDoc.id);
      onRefresh();
      const updated = documents.find(d => d.id === selectedDoc.id);
      if (updated) setSelectedDoc(updated);
    }
  };

  // Register the save handler
  useEffect(() => {
    onRegisterSaveHandler(handleSave);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Legal Documents & Policies</h2>
      <p className="text-sm text-gray-600 mb-6">
        Manage legal texts visible in the footer and login screens. Published documents are live to users.
      </p>

      <div className="space-y-6">
        {/* Document List */}
        <div className="flex flex-col sm:flex-row gap-3">
          {documents.map((doc) => (
            <button
              key={doc.id}
              onClick={() => handleSelectDocument(doc)}
              className={`flex-1 text-left p-3 sm:p-4 rounded-lg border-2 transition-all ${
                selectedDoc?.id === doc.id
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <h3 className="font-medium text-gray-900 text-sm sm:text-base mb-2">{doc.title}</h3>
              <div className="mb-2">
                <span className={`px-2 py-0.5 rounded whitespace-nowrap text-xs ${
                  doc.status === 'published'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {doc.status}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Updated {new Date(doc.lastUpdated).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>

        {/* Document Editor */}
        <div>
          {selectedDoc ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Title
                </label>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Brief description shown on Legal page card..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={16}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none font-mono text-sm"
                  placeholder="Enter document content..."
                />
              </div>

              <div className="flex items-center justify-between pt-4 pb-6 border-t border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedDoc.status === 'published'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {selectedDoc.status}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {selectedDoc.status === 'draft' ? (
                    <button
                      onClick={handlePublish}
                      className="px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                    >
                      Publish
                    </button>
                  ) : (
                    <button
                      onClick={handleDraft}
                      className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Unpublish
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Select a document to edit</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Help & Support Section
function HelpSupportSection({ 
  helpSupport, 
  onRefresh, 
  onSave, 
  saved,
  onRegisterSaveHandler
}: { 
  helpSupport: any;
  onRefresh: () => void;
  onSave: () => void;
  saved?: boolean;
  onRegisterSaveHandler: (handler: () => void) => void;
}) {
  const [helpText, setHelpText] = useState(helpSupport.helpCenterText);
  const [supportEmail, setSupportEmail] = useState(helpSupport.supportEmail);
  const [docsUrl, setDocsUrl] = useState(helpSupport.documentationUrl || '');
  const [contactUrl, setContactUrl] = useState(helpSupport.contactUrl || '');
  const [editingFAQ, setEditingFAQ] = useState<FAQType | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const handleSave = () => {
    updateHelpSupport({
      helpCenterText: helpText,
      supportEmail,
      documentationUrl: docsUrl,
      contactUrl
    });
    onRefresh();
    onSave();
  };

  const handleAddFAQ = () => {
    if (newQuestion && newAnswer) {
      addFAQ(newQuestion, newAnswer);
      setNewQuestion('');
      setNewAnswer('');
      onRefresh();
    }
  };

  const handleUpdateFAQ = () => {
    if (editingFAQ && newQuestion && newAnswer) {
      updateFAQ(editingFAQ.id, newQuestion, newAnswer);
      setEditingFAQ(null);
      setNewQuestion('');
      setNewAnswer('');
      onRefresh();
    }
  };

  const handleEditFAQ = (faq: FAQType) => {
    setEditingFAQ(faq);
    setNewQuestion(faq.question);
    setNewAnswer(faq.answer);
  };

  const handleDeleteFAQ = (faqId: string) => {
    if (confirm('Delete this FAQ?')) {
      deleteFAQ(faqId);
      onRefresh();
    }
  };

  // Register the save handler
  useEffect(() => {
    onRegisterSaveHandler(handleSave);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Help & Support Configuration</h2>
        <p className="text-sm text-gray-600 mb-6">
          Manage help center content and support contact information visible to users.
        </p>
      </div>

      {/* Help Center Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Help Center Main Text
        </label>
        <textarea
          value={helpText}
          onChange={(e) => setHelpText(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Support Email
          </label>
          <input
            type="email"
            value={supportEmail}
            onChange={(e) => setSupportEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Documentation URL
          </label>
          <input
            type="url"
            value={docsUrl}
            onChange={(e) => setDocsUrl(e.target.value)}
            placeholder="https://"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Contact URL
        </label>
        <input
          type="url"
          value={contactUrl}
          onChange={(e) => setContactUrl(e.target.value)}
          placeholder="https://"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      {/* FAQs */}
      <div>
        <h3 className="text-md font-semibold text-gray-900 mb-3">Frequently Asked Questions</h3>
        <div className="space-y-3 mb-4">
          {helpSupport.faqs.map((faq: FAQType) => (
            <div key={faq.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{faq.question}</h4>
                  <p className="text-sm text-gray-600">{faq.answer}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEditFAQ(faq)}
                    className="text-sm text-teal-600 hover:text-teal-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteFAQ(faq.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit FAQ Form */}
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            {editingFAQ ? 'Edit FAQ' : 'Add New FAQ'}
          </h4>
          <div className="space-y-3">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Question"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Answer"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={editingFAQ ? handleUpdateFAQ : handleAddFAQ}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                {editingFAQ ? 'Update FAQ' : 'Add FAQ'}
              </button>
              {editingFAQ && (
                <button
                  onClick={() => {
                    setEditingFAQ(null);
                    setNewQuestion('');
                    setNewAnswer('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Company Info Section
function CompanyInfoSection({ 
  companyInfo, 
  onRefresh, 
  onSave, 
  saved,
  onRegisterSaveHandler
}: { 
  companyInfo: any;
  onRefresh: () => void;
  onSave: () => void;
  saved?: boolean;
  onRegisterSaveHandler: (handler: () => void) => void;
}) {
  const [appName, setAppName] = useState(companyInfo.appName);
  const [legalName, setLegalName] = useState(companyInfo.legalCompanyName);
  const [copyright, setCopyright] = useState(companyInfo.copyrightText);
  const [tagline, setTagline] = useState(companyInfo.platformTagline || 'Professional healthcare platform for licensed TCM practitioners');
  const [country, setCountry] = useState(companyInfo.country || '');
  const [website, setWebsite] = useState(companyInfo.websiteUrl || '');

  // Update local state when companyInfo prop changes
  useEffect(() => {
    setAppName(companyInfo.appName);
    setLegalName(companyInfo.legalCompanyName);
    setCopyright(companyInfo.copyrightText);
    setTagline(companyInfo.platformTagline || 'Professional healthcare platform for licensed TCM practitioners');
    setCountry(companyInfo.country || '');
    setWebsite(companyInfo.websiteUrl || '');
  }, [companyInfo]);

  const handleSave = () => {
    updateCompanyInfo({
      appName,
      legalCompanyName: legalName,
      copyrightText: copyright,
      platformTagline: tagline,
      country,
      websiteUrl: website
    });
    onRefresh();
    onSave();
  };

  // Register the save handler - update when any value changes
  useEffect(() => {
    onRegisterSaveHandler(handleSave);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appName, legalName, copyright, tagline, country, website]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h2>
        <p className="text-sm text-gray-600 mb-6">
          Configure institutional information displayed in the footer, authentication pages, and app metadata.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Application Name
          </label>
          <input
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Legal Company Name
          </label>
          <input
            type="text"
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Footer Copyright Text
        </label>
        <input
          type="text"
          value={copyright}
          onChange={(e) => setCopyright(e.target.value)}
          placeholder="© 2026 Clinical TCM. All rights reserved."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Platform Tagline
        </label>
        <input
          type="text"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="Professional healthcare platform for licensed TCM practitioners"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Subtitle displayed on login and authentication pages
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country / Jurisdiction (optional)
          </label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="e.g., United States"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Website URL (optional)
          </label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>
    </div>
  );
}

// Branding Section
function BrandingSection({ 
  branding, 
  onRefresh, 
  onSave, 
  saved,
  onRegisterSaveHandler
}: { 
  branding: any;
  onRefresh: () => void;
  onSave: () => void;
  saved?: boolean;
  onRegisterSaveHandler: (handler: () => void) => void;
}) {
  const [logoUrl, setLogoUrl] = useState(branding.logoUrl || '');
  const [appName, setAppName] = useState(branding.appName || 'Clinical TCM');
  const [showAppName, setShowAppName] = useState(branding.showAppName ?? true);

  // Update local state when branding prop changes
  useEffect(() => {
    setLogoUrl(branding.logoUrl || '');
    setAppName(branding.appName || 'Clinical TCM');
    setShowAppName(branding.showAppName ?? true);
  }, [branding]);

  // Default logo URL (the one currently used in the app)
  const DEFAULT_LOGO_URL = 'data:image/svg+xml,%3Csvg xmlns=\\\"http://www.w3.org/2000/svg\\\" viewBox=\\\"0 0 100 100\\\"%3E%3Ccircle cx=\\\"50\\\" cy=\\\"50\\\" r=\\\"45\\\" fill=\\\"%230d9488\\\"/%3E%3Ctext x=\\\"50\\\" y=\\\"65\\\" font-size=\\\"32\\\" fill=\\\"white\\\" text-anchor=\\\"middle\\\" font-family=\\\"Arial\\\"%3ECT%3C/text%3E%3C/svg%3E';

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    console.log('Saving branding:', {
      logoUrl,
      appName,
      showAppName
    });
    updateBranding({
      logoUrl,
      appName,
      showAppName
    });

    // Force refresh to update Navigation immediately
    window.dispatchEvent(new Event('platformSettingsUpdated'));

    onRefresh();
    onSave();
  };

  const handleRestoreDefaultLogo = () => {
    setLogoUrl('');
  };

  // Register the save handler - update when values change
  useEffect(() => {
    onRegisterSaveHandler(handleSave);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logoUrl, appName, showAppName]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Branding Configuration</h2>
        <p className="text-sm text-gray-600 mb-6">
          Customize your app's visual identity including logo, name, and colors.
        </p>
      </div>

      {/* Logo Section */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-md font-semibold text-gray-900 mb-4">Application Logo</h3>
        
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Logo Preview */}
          <div className="flex-shrink-0 w-full sm:w-auto flex flex-col items-center sm:items-start">
            <div className="w-32 h-32 border-2 border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
              <img
                src={logoUrl || DEFAULT_LOGO_URL}
                alt="App Logo"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_LOGO_URL;
                }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">Logo Preview</p>
          </div>

          {/* Logo Controls */}
          <div className="flex-1 w-full space-y-4">
            <div className="flex gap-2">
              <button
                onClick={handleRestoreDefaultLogo}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                Restore Default Logo
              </button>
              {logoUrl && (
                <button
                  onClick={() => setLogoUrl('')}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 text-sm"
                >
                  <X className="w-4 h-4" />
                  Clear Custom Logo
                </button>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Logo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload a logo image (PNG, SVG, or JPG recommended, max 2MB)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* App Name Section */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-md font-semibold text-gray-900 mb-4">Application Name</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              App Name
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="Clinical TCM"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              This name appears next to the logo in the header
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <h4 className="font-medium text-gray-900 text-sm">Show Application Name</h4>
              <p className="text-xs text-gray-600">Display the app name next to the logo</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={showAppName}
                onChange={(e) => setShowAppName(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// Authentication Section is now imported from AuthenticationSettings.tsx

// Compliance Section
function ComplianceSection({ 
  compliance, 
  onRefresh, 
  onSave, 
  saved,
  onRegisterSaveHandler
}: { 
  compliance: any;
  onRefresh: () => void;
  onSave: () => void;
  saved?: boolean;
  onRegisterSaveHandler: (handler: () => void) => void;
}) {
  const [medical, setMedical] = useState(compliance.medicalDisclaimer);
  const [professional, setProfessional] = useState(compliance.professionalUseNotice);
  const [diagnostic, setDiagnostic] = useState(compliance.nonDiagnosticDisclaimer);
  const [enabled, setEnabled] = useState(compliance.enabled);

  const handleSave = () => {
    updateCompliance({
      medicalDisclaimer: medical,
      professionalUseNotice: professional,
      nonDiagnosticDisclaimer: diagnostic,
      enabled
    });
    onRefresh();
    onSave();
  };

  // Register the save handler
  useEffect(() => {
    onRegisterSaveHandler(handleSave);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Compliance & Disclaimers</h2>
        <p className="text-sm text-gray-600 mb-6">
          Professional use notices and legal disclaimers displayed throughout the platform.
        </p>
      </div>

      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div>
          <h3 className="font-medium text-gray-900">Enable Disclaimers</h3>
          <p className="text-sm text-gray-600">Show compliance notices to users</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Medical Disclaimer
        </label>
        <textarea
          value={medical}
          onChange={(e) => setMedical(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Professional Use Notice
        </label>
        <textarea
          value={professional}
          onChange={(e) => setProfessional(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Non-Diagnostic Disclaimer
        </label>
        <textarea
          value={diagnostic}
          onChange={(e) => setDiagnostic(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />
      </div>
    </div>
  );
}
