import { FileText, Shield, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPlatformSettings } from '../data/platformSettings';
import type { LegalDocument } from '../data/platformSettings';
import { LegalDocumentModal } from '../components/LegalDocumentModal';
import { useLanguage } from '../contexts/LanguageContext';

export default function LegalPoliciesPage() {
  const { language } = useLanguage();
  const isSpanish = language === 'es';
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
        terms: isSpanish
          ? 'Términos y condiciones para usar nuestra plataforma de Medicina Tradicional China'
          : 'Terms and conditions for using our Traditional Chinese Medicine platform',
        privacy: isSpanish
          ? 'Cómo recopilamos, usamos y protegemos tu información personal'
          : 'How we collect, use, and protect your personal information',
        cookies: isSpanish
          ? 'Información sobre las cookies y tecnologías de seguimiento que utilizamos'
          : 'Information about cookies and tracking technologies we use',
        refund: isSpanish
          ? 'Nuestra política sobre reembolsos, cancelaciones y disputas de facturación'
          : 'Our policy regarding refunds, cancellations, and billing disputes',
        disclaimer: isSpanish
          ? 'Información importante sobre el uso clínico de esta plataforma y la responsabilidad profesional'
          : 'Important information about the clinical use of this platform and professional responsibility'
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{isSpanish ? 'Legal y políticas' : 'Legal & Policies'}</h1>
        <p className="text-gray-600">
          {isSpanish
            ? 'Información legal importante y políticas para usar nuestra plataforma'
            : 'Important legal information and policies for using our platform'}
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
                <h2 className="text-lg font-semibold text-gray-900">{isSpanish ? 'Documentos legales' : 'Legal Documents'}</h2>
                <p className="text-sm text-gray-500">{isSpanish ? 'Consulta nuestros términos, políticas y acuerdos' : 'View our terms, policies, and agreements'}</p>
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
                            {isSpanish ? 'Borrador' : 'Draft'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-1">
                        {doc.description}
                      </p>
                      {doc.lastUpdated && doc.status === 'published' && (
                        <p className="text-xs text-gray-500">
                          {isSpanish ? 'Última actualización' : 'Last updated'}: {new Date(doc.lastUpdated).toLocaleDateString(isSpanish ? 'es-ES' : 'en-US', {
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
                <p>{isSpanish ? 'No hay documentos legales disponibles en este momento.' : 'No legal documents available at this time.'}</p>
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
                <h2 className="text-lg font-semibold text-gray-900">{isSpanish ? 'Información importante' : 'Important Information'}</h2>
                <p className="text-sm text-gray-500">{isSpanish ? 'Lo que necesitas saber' : 'What you need to know'}</p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                • {isSpanish
                  ? 'Estos documentos regulan tu uso de nuestra plataforma de Medicina Tradicional China'
                  : 'These documents govern your use of our Traditional Chinese Medicine platform'}
              </p>
              <p>
                • {isSpanish
                  ? 'Al usar nuestros servicios, aceptas cumplir estos términos y políticas'
                  : 'By using our services, you agree to comply with these terms and policies'}
              </p>
              <p>
                • {isSpanish
                  ? 'Podemos actualizar estos documentos de vez en cuando. Revisa la fecha de “Última actualización” para ver cambios'
                  : 'We may update these documents from time to time. Check the "Last updated" date for changes'}
              </p>
              <p>
                • {isSpanish
                  ? 'Si tienes preguntas sobre nuestras políticas legales, contacta con nuestro equipo de soporte'
                  : 'For questions about our legal policies, please contact our support team'}
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
