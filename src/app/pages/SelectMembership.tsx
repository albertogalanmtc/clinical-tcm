import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Leaf, Check, ArrowRight, ArrowLeft, Sparkles, Info } from 'lucide-react';
import { planService, type Plan } from '../services/planService';
import type { PlanType } from '@/app/data/usersManager';
import { getPlatformSettings } from '@/app/data/platformSettings';
import { createStripeCheckout, getStripePriceId } from '@/lib/stripe';
import { supabase } from '@/app/lib/supabase';

export default function SelectMembership() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPlanFromUrl = searchParams.get('plan') as PlanType | null;
  const billingFromUrl = searchParams.get('billing') === 'yearly' ? 'yearly' : 'monthly';
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(() => {
    if (selectedPlanFromUrl === 'free' || selectedPlanFromUrl === 'practitioner' || selectedPlanFromUrl === 'advanced') {
      return selectedPlanFromUrl;
    }

    // Pre-select recommended plan based on onboarding survey answer
    try {
      const raw = localStorage.getItem('onboardingSurvey');
      if (!raw) return null;
      const survey = JSON.parse(raw) as { primaryGoal?: string };
      if (survey.primaryGoal === 'research') return 'advanced';
      if (
        survey.primaryGoal === 'study' ||
        survey.primaryGoal === 'quick_reference' ||
        survey.primaryGoal === 'prescriptions'
      ) {
        return 'practitioner';
      }
    } catch {
      // ignore
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPlansLoading, setIsPlansLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>(billingFromUrl);
  const [branding, setBranding] = useState(() => getPlatformSettings().branding);
  const [plans, setPlans] = useState<Plan[]>([]);

  // Default logo URL
  const DEFAULT_LOGO_URL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%230d9488"/%3E%3Ctext x="50" y="65" font-size="32" fill="white" text-anchor="middle" font-family="Arial"%3ECT%3C/text%3E%3C/svg%3E';

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

  // Update plans when they change
  useEffect(() => {
    let cancelled = false;

    const loadPlans = async () => {
      setIsPlansLoading(true);
      try {
        const loadedPlans = await planService.getPlans();
        if (!cancelled) {
          setPlans(loadedPlans.filter(plan => plan.status === 'active'));
        }
      } catch (error) {
        console.error('Error loading membership plans:', error);
        if (!cancelled) {
          setPlans([]);
        }
      } finally {
        if (!cancelled) {
          setIsPlansLoading(false);
        }
      }
    };

    loadPlans();

    window.addEventListener('plansUpdated', loadPlans);
    window.addEventListener('storage', loadPlans);

    return () => {
      cancelled = true;
      window.removeEventListener('plansUpdated', loadPlans);
      window.removeEventListener('storage', loadPlans);
    };
  }, []);

  const handleContinue = async () => {
    if (!selectedPlan) return;

    setIsLoading(true);

    try {
      // If Free plan, save directly and continue
      if (selectedPlan === 'free') {
        const { data: { session } } = await supabase.auth.getSession();
        const userEmail = session?.user?.email || JSON.parse(localStorage.getItem('userProfile') || '{}')?.email || '';

        if (session?.user) {
          const { error: updateError } = await supabase
            .from('users')
            .upsert({
              id: session.user.id,
              email: userEmail,
              plan_type: 'free',
              subscription_status: 'inactive',
              updated_at: new Date().toISOString(),
            }, {
              onConflict: 'id',
            });

          if (updateError) {
            console.error('Error saving free plan to Supabase:', updateError);
          }
        }

        // Save selected plan and set user role to 'user' (not admin) - only if not already admin
        localStorage.setItem('userPlanType', selectedPlan);
        localStorage.removeItem('pendingPlanType');
        localStorage.removeItem('pendingBillingPeriod');
        const currentRole = localStorage.getItem('userRole');
        if (currentRole !== 'admin') {
          localStorage.setItem('userRole', 'user');
        }

        // Dispatch event to update UserContext
        window.dispatchEvent(new Event('user-login'));

        // Navigate to app
        navigate('/app');
      } else {
        // For paid plans, redirect to Stripe
        const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');

        if (!userProfile.email) {
          throw new Error('User email not found. Please complete registration first.');
        }

        // Try to get Supabase session, or use localStorage data
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || userProfile.id || 'temp-' + Date.now();
        const userEmail = session?.user?.email || userProfile.email;
        const selectedPlanData = plans.find(plan => plan.code === selectedPlan);
        const priceId = selectedPlanData
          ? getStripePriceId(
              selectedPlan,
              billingPeriod,
              selectedPlanData
            )
          : undefined;

        localStorage.setItem('pendingPlanType', selectedPlan);
        localStorage.setItem('pendingBillingPeriod', billingPeriod);

        const successUrl = `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${selectedPlan}&billing=${billingPeriod}`;
        const cancelUrl = `${window.location.origin}/select-membership`;

        // Call createStripeCheckout with the normalized plan code expected by Stripe
        await createStripeCheckout({
          planType: selectedPlan,
          userId,
          userEmail,
          priceId,
          billingPeriod,
          successUrl,
          cancelUrl,
        });

        // The function will redirect to Stripe, so we don't reset loading
      }
    } catch (error: any) {
      console.error('Error processing plan selection:', error);

      // Show user-friendly error message
      const errorMessage = error.message || 'There was an error processing your request. Please try again.';
      alert(errorMessage);

      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Plan
          </h1>
          <p className="text-sm text-gray-600">
            Select the plan that best fits your practice
          </p>
        </div>

        {/* Billing Period Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center bg-white rounded-lg border-2 border-gray-200 p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-6 py-2.5 rounded-md font-medium text-sm transition-all relative ${
                billingPeriod === 'yearly'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {isPlansLoading ? (
            <div className="w-full text-center py-12 text-gray-600">
              Loading plans...
            </div>
          ) : plans.length === 0 ? (
            <div className="w-full text-center py-12 text-gray-600">
              No plans are available right now. Please try again in a moment.
            </div>
          ) : (
            plans.map(plan => {
            const isSelected = selectedPlan === plan.code;
            const hasOffer = plan.offer?.enabled;
            const features = plan.features ?? {};
            const limits = plan.limits ?? { monthlyFormulas: 0 };

            return (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.code)}
                className={`relative w-full md:w-80 bg-white rounded-2xl shadow-xl border-2 transition-all p-6 text-left flex flex-col ${
                  isSelected
                    ? 'border-teal-600 shadow-teal-100'
                    : 'border-gray-100 hover:border-teal-200 hover:shadow-teal-50'
                }`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-teal-600 to-teal-500 text-white text-xs font-semibold rounded-full shadow-lg">
                      <Sparkles className="w-3 h-3" />
                      Most Popular
                    </div>
                  </div>
                )}

                {/* Selected Check */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 bg-teal-600 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}

                {/* Plan Name */}
                <h3 className="text-xl font-bold text-gray-900 mb-2 mt-2">
                  {plan.name}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4">
                  {plan.description}
                </p>

                {/* Price */}
                <div className="mb-6 min-h-[72px] flex flex-col justify-start">
                  {plan.code === 'free' ? (
                    <div className="text-3xl font-bold text-gray-900">Free</div>
                  ) : (
                    <>
                      {billingPeriod === 'monthly' ? (
                        // Monthly pricing
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-gray-900">
                              ${hasOffer ? plan.offer!.discountedPrice : plan.monthlyPrice}
                            </span>
                            {hasOffer && (
                              <span className="text-lg text-gray-400 line-through">
                                ${plan.offer!.originalPrice}
                              </span>
                            )}
                            <span className="text-sm text-gray-600">/month</span>
                          </div>
                          {hasOffer && plan.offer!.label && (
                            <div className="mt-1">
                              <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded">
                                {plan.offer!.label}
                              </span>
                            </div>
                          )}
                        </div>
                      ) : (
                        // Yearly pricing
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-gray-900">
                              ${plan.yearlyPrice}
                            </span>
                            <span className="text-sm text-gray-600">/year</span>
                          </div>
                          {plan.monthlyPrice && plan.yearlyPrice && (
                            <div className="mt-1 text-sm text-teal-600 font-medium">
                              Save ${(plan.monthlyPrice * 12) - plan.yearlyPrice}/year
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Key Features */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    Key Features
                  </div>

                  {/* Show custom features if defined, otherwise show default features */}
                  {plan.membershipDisplay?.customFeatures && plan.membershipDisplay.customFeatures.length > 0 ? (
                    // Custom Features
                    plan.membershipDisplay.customFeatures.map((feature, index) => (
                      feature.trim() && (
                        <div key={index} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      )
                    ))
                  ) : (
                    // Default Features - Show ALL enabled features
                    <>
                      {/* Library Access */}
                      {features.herbLibraryAccess !== 'none' && (
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            {features.herbLibraryAccess === 'full' ? 'Full' : 'Sample'} Herb Library
                          </span>
                        </div>
                      )}
                      {features.formulaLibraryAccess !== 'none' && (
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            {features.formulaLibraryAccess === 'full' ? 'Full' : 'Sample'} Formula Library
                          </span>
                        </div>
                      )}

                      {/* Builder & Library */}
                      {features.builder && (
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            Prescription Builder
                          </span>
                        </div>
                      )}
                      {features.prescriptionLibrary && (
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            Save & manage prescriptions
                          </span>
                        </div>
                      )}

                      {/* Monthly Limit */}
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">
                          {limits.monthlyFormulas === null
                            ? 'Unlimited'
                            : `Up to ${limits.monthlyFormulas}`} prescriptions/month
                        </span>
                      </div>

                      {/* Property Filters */}
                      {features.herbPropertyFilters && (
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            Herb property filters
                          </span>
                        </div>
                      )}
                      {features.formulaPropertyFilters && (
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            Formula property filters
                          </span>
                        </div>
                      )}
                      {features.clinicalUseFilters && (
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            Clinical use filters
                          </span>
                        </div>
                      )}

                      {/* Advanced Filters */}
                      {(features.pharmacologicalEffectsFilter ||
                        features.biologicalMechanismsFilter ||
                        features.bioactiveCompoundsFilter) && (
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            Advanced search filters
                          </span>
                        </div>
                      )}

                      {/* Safety Profile */}
                      {(features.generalConditions ||
                        features.medications ||
                        features.allergies ||
                        features.tcmRiskPatterns) && (
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            Safety profiles
                          </span>
                        </div>
                      )}

                      {/* Analytics */}
                      {features.statistics && (
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            Usage analytics
                          </span>
                        </div>
                      )}

                      {/* Custom Content */}
                      {features.customContent && (
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700">
                            Add custom herbs & formulas
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </button>
            );
            })
          )}
        </div>

        {/* Free plan notice */}
        {selectedPlan === 'free' && (
          <div className="mb-4 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-medium mb-0.5">Heads up — the Free plan is for exploration only</p>
              <p className="text-amber-800">
                You'll see a sample of one category of herbs and one category of formulas so you can get a feel for the app. The Prescription Builder and saving prescriptions aren't available on Free. You can upgrade anytime.
              </p>
            </div>
          </div>
        )}

        {/* Continue Button */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate('/onboarding-survey?step=3')}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-2.5 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          <button
            onClick={handleContinue}
            disabled={!selectedPlan || isLoading}
            className="bg-teal-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 078-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Setting up...</span>
              </>
            ) : (
              <>
                <span>{selectedPlan === 'free' ? 'Continue to App' : 'Continue to Payment'}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          </div>

          {!selectedPlan && (
            <p className="text-xs text-gray-500 text-center mt-3">
              Please select a plan to continue
            </p>
          )}

          {selectedPlan && (
            <p className="text-xs text-gray-500 text-center mt-3">
              You can change your plan anytime from your account settings
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
