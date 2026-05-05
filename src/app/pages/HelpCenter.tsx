import { HelpCircle, Mail, ExternalLink, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPlatformSettings } from '../data/platformSettings';
import type { FAQ } from '../data/platformSettings';
import { useLanguage } from '../contexts/LanguageContext';

export default function HelpCenter() {
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const [settings, setSettings] = useState(() => getPlatformSettings());
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  useEffect(() => {
    // Refresh settings when component mounts
    setSettings(getPlatformSettings());
  }, []);

  const { helpSupport } = settings;
  const defaultHelpCenterText = 'Welcome to Clinical TCM Help Center. Find answers to common questions and learn how to use the platform effectively.';
  const helpCenterText = isSpanish && helpSupport.helpCenterText === defaultHelpCenterText
    ? 'Bienvenido al Centro de ayuda de Clinical TCM. Encuentra respuestas a preguntas frecuentes y aprende a usar la plataforma de forma eficaz.'
    : helpSupport.helpCenterText;

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/account-hub"
          className="h-10 w-10 sm:w-11 sm:h-11 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
          title={isSpanish ? 'Volver a la cuenta' : 'Back to Account'}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{isSpanish ? 'Centro de ayuda' : 'Help Center'}</h1>
        <p className="text-gray-600">
          {helpCenterText}
        </p>
      </div>

      {/* Contact Information Card */}
      <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{isSpanish ? '¿Necesitas más ayuda?' : 'Need Additional Help?'}</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-teal-600" />
            <div>
              <p className="text-sm text-gray-600">{isSpanish ? 'Contacta con soporte:' : 'Contact support:'}</p>
              <a 
                href={`mailto:${helpSupport.supportEmail}`}
                className="text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                {helpSupport.supportEmail}
              </a>
            </div>
          </div>

          {helpSupport.documentationUrl && (
            <div className="flex items-center gap-3">
              <ExternalLink className="w-5 h-5 text-teal-600" />
              <div>
                <p className="text-sm text-gray-600">{isSpanish ? 'Documentación:' : 'Documentation:'}</p>
                <a 
                  href={helpSupport.documentationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                  {isSpanish ? 'Ver la documentación completa' : 'View full documentation'}
                </a>
              </div>
            </div>
          )}

          {helpSupport.contactUrl && (
            <div className="flex items-center gap-3">
              <ExternalLink className="w-5 h-5 text-teal-600" />
              <div>
                <p className="text-sm text-gray-600">{isSpanish ? 'Formulario de contacto:' : 'Contact form:'}</p>
                <a 
                  href={helpSupport.contactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-teal-600 hover:text-teal-700"
                >
                  {isSpanish ? 'Enviar una solicitud' : 'Submit a request'}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FAQs Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {isSpanish ? 'Preguntas frecuentes' : 'Frequently Asked Questions'}
        </h2>

        {helpSupport.faqs.length > 0 ? (
          <div className="space-y-3">
            {helpSupport.faqs
              .sort((a, b) => a.order - b.order)
              .map((faq: FAQ) => (
                <div 
                  key={faq.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900 pr-4">
                      {faq.question}
                    </span>
                    {expandedFAQ === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  
                  {expandedFAQ === faq.id && (
                    <div className="px-4 pb-4 text-sm text-gray-600 border-t border-gray-200 pt-4">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>{isSpanish ? 'No hay preguntas frecuentes disponibles en este momento.' : 'No FAQs available at this time.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
