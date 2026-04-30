import { useState, useEffect } from 'react';
import { X, Settings, Shield, Cookie } from 'lucide-react';
import { hasGivenConsent, acceptAllCookies, rejectAllCookies, saveConsent, type CookieConsent } from '../services/cookieConsentService';
import * as Dialog from '@radix-ui/react-dialog';

export function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookieConsent>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    const checkConsent = async () => {
      const hasConsent = await hasGivenConsent();
      setShowBanner(!hasConsent);
    };
    checkConsent();
  }, []);

  const handleAcceptAll = async () => {
    await acceptAllCookies();
    setShowBanner(false);
  };

  const handleRejectAll = async () => {
    await rejectAllCookies();
    setShowBanner(false);
  };

  const handleSavePreferences = async () => {
    await saveConsent(preferences);
    setShowSettings(false);
    setShowBanner(false);
  };

  const togglePreference = (key: keyof CookieConsent) => {
    if (key === 'necessary') return; // Can't disable necessary cookies
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-[100] animate-slide-up">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Text */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Cookie className="w-5 h-5 text-teal-600 flex-shrink-0" />
                <h3 className="text-base font-semibold text-gray-900">We value your privacy</h3>
              </div>
              <p className="text-sm text-gray-600">
                We use cookies to enhance your experience, analyze site traffic, and provide personalized content.
                By clicking "Accept All", you consent to our use of cookies.{' '}
                <button
                  onClick={() => setShowSettings(true)}
                  className="text-teal-600 hover:text-teal-700 underline font-medium"
                >
                  Customize preferences
                </button>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleRejectAll}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Customize
              </button>
              <button
                onClick={handleAcceptAll}
                className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Cookie Settings Modal */}
      <Dialog.Root open={showSettings} onOpenChange={setShowSettings}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[110]" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:max-w-2xl w-full sm:max-h-[90vh] overflow-hidden z-[120] flex flex-col">
            <Dialog.Description className="sr-only">
              Cookie preferences settings
            </Dialog.Description>

            {/* Header */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-teal-600" />
                <Dialog.Title className="text-xl font-semibold text-gray-900">
                  Cookie Preferences
                </Dialog.Title>
              </div>
              <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center">
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-sm text-gray-600 mb-6">
                We use different types of cookies to optimize your experience on our platform.
                You can choose which categories to accept below.
              </p>

              <div className="space-y-4">
                {/* Necessary Cookies */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">Necessary Cookies</h4>
                        <span className="px-2 py-0.5 bg-gray-600 text-white text-xs font-medium rounded">
                          Always Active
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Essential for the website to function properly. These cookies enable core functionality
                        like security, authentication, and account management.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <div className="w-11 h-6 bg-gray-400 rounded-full cursor-not-allowed opacity-50">
                        <div className="w-4 h-4 bg-white rounded-full transform translate-x-6 translate-y-1"></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Functional Cookies */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">Functional Cookies</h4>
                      <p className="text-sm text-gray-600">
                        Enable enhanced functionality and personalization, such as remembering your preferences,
                        language settings, and display options.
                      </p>
                    </div>
                    <button
                      onClick={() => togglePreference('functional')}
                      className={`flex-shrink-0 w-11 h-6 rounded-full transition-colors flex items-center ${
                        preferences.functional ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        preferences.functional ? 'translate-x-6' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">Analytics Cookies</h4>
                      <p className="text-sm text-gray-600">
                        Help us understand how visitors interact with our platform by collecting and reporting
                        information anonymously. This helps us improve the user experience.
                      </p>
                    </div>
                    <button
                      onClick={() => togglePreference('analytics')}
                      className={`flex-shrink-0 w-11 h-6 rounded-full transition-colors flex items-center ${
                        preferences.analytics ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        preferences.analytics ? 'translate-x-6' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">Marketing Cookies</h4>
                      <p className="text-sm text-gray-600">
                        Used to track visitors across websites to display relevant and engaging advertisements.
                        May be set by third-party providers whose services we use.
                      </p>
                    </div>
                    <button
                      onClick={() => togglePreference('marketing')}
                      className={`flex-shrink-0 w-11 h-6 rounded-full transition-colors flex items-center ${
                        preferences.marketing ? 'bg-teal-600' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                        preferences.marketing ? 'translate-x-6' : 'translate-x-1'
                      }`}></div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg bg-white hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
