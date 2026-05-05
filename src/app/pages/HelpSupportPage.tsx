import { Mail, ExternalLink, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getPlatformSettings } from '../data/platformSettings';
import type { FAQ } from '../data/platformSettings';
import { useLanguage } from '../contexts/LanguageContext';

export default function HelpSupportPage() {
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
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isSpanish ? 'Ayuda y soporte' : 'Help & Support'}
        </h1>
        <p className="text-gray-600">
          {helpCenterText}
        </p>
      </div>

      <div className="space-y-6">
        {/* Contact Information Card */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {isSpanish ? 'Contactar con soporte' : 'Contact Support'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isSpanish ? 'Ponte en contacto con nuestro equipo' : 'Get in touch with our team'}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">
            <div className="flex items-start gap-3">
              
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {isSpanish ? 'Soporte por email' : 'Email Support'}
                </p>
                <a 
                  href={`mailto:${helpSupport.supportEmail}`}
                  className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
                >
                  {helpSupport.supportEmail}
                </a>
              </div>
            </div>

            {helpSupport.documentationUrl && (
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
              <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {isSpanish ? 'Documentación' : 'Documentation'}
                  </p>
                  <a 
                    href={helpSupport.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
                  >
                    {isSpanish ? 'Ver la documentación completa' : 'View full documentation'}
                  </a>
                </div>
              </div>
            )}

            {helpSupport.contactUrl && (
              <div className="flex items-start gap-3">
                <ExternalLink className="w-5 h-5 text-teal-600 mt-0.5 flex-shrink-0" />
              <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {isSpanish ? 'Formulario de contacto' : 'Contact Form'}
                  </p>
                  <a 
                    href={helpSupport.contactUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-teal-600 hover:text-teal-700 hover:underline"
                  >
                    {isSpanish ? 'Enviar una solicitud' : 'Submit a request'}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FAQs Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {isSpanish ? 'Preguntas frecuentes' : 'Frequently Asked Questions'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isSpanish ? 'Encuentra respuestas a preguntas frecuentes' : 'Find answers to common questions'}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-5">
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
      </div>
    </>
  );
}
