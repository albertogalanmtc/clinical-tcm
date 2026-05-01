import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Leaf, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getPlatformSettings } from '@/app/data/platformSettings';
import { supabase } from '@/app/lib/supabase';
import type { PlanType } from '@/app/data/usersManager';

type PaymentStatus = 'verifying' | 'success' | 'error';

const normalizePlanType = (value: string | null): PlanType | null => {
  if (value === 'free' || value === 'practitioner' || value === 'advanced') {
    return value;
  }

  if (value === 'pro') return 'practitioner';
  if (value === 'clinic') return 'advanced';

  return null;
};

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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
      const planFromUrl = normalizePlanType(searchParams.get('plan'));
      const billingPeriod = searchParams.get('billing') || 'monthly';

      if (!sessionId) {
        setStatus('error');
        setErrorMessage('No payment session found.');
        return;
      }

      try {
        // Give Stripe webhook time to update the user row, then poll for the updated plan.
        await wait(1500);

        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id;
        const userEmail = session?.user?.email || '';

        let resolvedPlan: PlanType = planFromUrl || 'free';
        let latestProfile: { plan_type?: string; subscription_status?: string; email?: string } | null = null;

        if (userId) {
          for (let attempt = 0; attempt < 4; attempt += 1) {
            const { data: userProfile, error: profileError } = await supabase
              .from('users')
              .select('plan_type, subscription_status, email')
              .eq('id', userId)
              .single();

            if (!profileError && userProfile) {
              latestProfile = userProfile;
              const dbPlan = normalizePlanType(userProfile.plan_type);

              if (dbPlan) {
                resolvedPlan = dbPlan;
                if (dbPlan !== 'free' || userProfile.subscription_status === 'active') {
                  break;
                }
              }
            }

            await wait(1500);
          }

          if (resolvedPlan === 'free' && planFromUrl && planFromUrl !== 'free') {
            resolvedPlan = planFromUrl;
          }

          const { error: upsertError } = await supabase
            .from('users')
            .upsert({
              id: userId,
              email: userEmail || latestProfile?.email || '',
              plan_type: resolvedPlan,
              subscription_status: resolvedPlan === 'free' ? 'inactive' : 'active',
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'id',
            });

          if (upsertError) {
            console.error('Error syncing plan after payment:', upsertError);
          }
        } else if (planFromUrl) {
          resolvedPlan = planFromUrl;
        }

        localStorage.setItem('userPlanType', resolvedPlan);
        localStorage.removeItem('pendingPlanType');
        localStorage.removeItem('pendingBillingPeriod');

        const currentRole = localStorage.getItem('userRole');
        if (currentRole !== 'admin') {
          localStorage.setItem('userRole', 'user');
        }

        const storedProfileRaw = localStorage.getItem('userProfile');
        if (storedProfileRaw) {
          try {
            const storedProfile = JSON.parse(storedProfileRaw);
            localStorage.setItem('userProfile', JSON.stringify({
              ...storedProfile,
              planType: resolvedPlan,
              plan_type: resolvedPlan,
            }));
          } catch {
            // Ignore localStorage parse errors and continue.
          }
        }

        // Dispatch events to update UserContext
        window.dispatchEvent(new Event('user-login'));
        window.dispatchEvent(new Event('storage'));

        setStatus('success');

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          navigate('/app');
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
