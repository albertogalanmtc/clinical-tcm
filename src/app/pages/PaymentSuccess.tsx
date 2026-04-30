import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Leaf, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getPlatformSettings } from '@/app/data/platformSettings';

type PaymentStatus = 'verifying' | 'success' | 'error';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<PaymentStatus>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const [branding, setBranding] = useState(() => getPlatformSettings().branding);

  // Default logo URL
  const DEFAULT_LOGO_URL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%230d9488"/%3E%3Ctext x="50" y="65" font-size="32" fill="white" text-anchor="middle" font-family="Arial"%3ECT%3C/text%3E%3C/svg%3E';

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');

      if (!sessionId) {
        setStatus('error');
        setErrorMessage('No payment session found.');
        return;
      }

      try {
        // Wait 2 seconds to allow Stripe webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get the plan from URL params or localStorage
        const urlParams = new URLSearchParams(window.location.search);
        const planFromUrl = urlParams.get('plan');

        // If plan is in URL, save it
        if (planFromUrl) {
          localStorage.setItem('userPlanType', planFromUrl);
        }

        // Set user role to 'user' if not already admin
        const currentRole = localStorage.getItem('userRole');
        if (currentRole !== 'admin') {
          localStorage.setItem('userRole', 'user');
        }

        // Dispatch events to update UserContext
        window.dispatchEvent(new Event('user-login'));
        window.dispatchEvent(new Event('storage'));

        setStatus('success');

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (error: any) {
        console.error('Error processing payment:', error);
        setStatus('error');
        setErrorMessage(error.message || 'There was an error processing your payment. Please contact support.');
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  // Update branding when settings change
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt="Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_LOGO_URL;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-teal-600 rounded-2xl flex items-center justify-center">
                  <Leaf className="w-10 h-10 text-white" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {status === 'verifying' && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Loader2 className="w-16 h-16 text-teal-600 animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Payment
              </h1>
              <p className="text-gray-600">
                Please wait while we confirm your subscription...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h1>
              <p className="text-gray-600 mb-4">
                Your subscription has been activated. Redirecting to dashboard...
              </p>
              <div className="flex justify-center">
                <div className="w-8 h-8">
                  <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <XCircle className="w-16 h-16 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Payment Verification Failed
              </h1>
              <p className="text-gray-600 mb-6">
                {errorMessage}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate('/select-membership')}
                  className="w-full bg-teal-600 text-white py-3 rounded-lg font-medium hover:bg-teal-700 transition-colors"
                >
                  Back to Plans
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-white text-gray-700 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
