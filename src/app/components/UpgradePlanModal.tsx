import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Check, Sparkles, ArrowRight } from 'lucide-react';
import { planService, type Plan } from '../services/planService';
import { useUser } from '../contexts/UserContext';
import { createStripeCheckout } from '@/lib/stripe';
import { supabase } from '@/app/lib/supabase';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: 'free' | 'practitioner' | 'advanced' | 'pro' | 'clinic'; // Support both old and new codes
  suggestedPlan?: 'practitioner' | 'advanced' | 'pro' | 'clinic';
  autoSelect?: boolean; // Whether to auto-select the suggested plan
}

export function UpgradePlanModal({ isOpen, onClose, currentPlan, suggestedPlan, autoSelect = true }: UpgradePlanModalProps) {
  const { planType } = useUser();
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'practitioner' | 'advanced' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [allPlans, setAllPlans] = useState<Plan[]>([]);

  // Map old plan codes to new ones for backward compatibility
  const normalizePlanCode = (code?: string): 'free' | 'practitioner' | 'advanced' => {
    if (code === 'pro') return 'practitioner';
    if (code === 'clinic') return 'advanced';
    return (code as 'free' | 'practitioner' | 'advanced') || 'free';
  };

  const activePlan = normalizePlanCode(currentPlan || planType || 'free');

  // Update selected plan when modal opens or autoSelect changes
  useEffect(() => {
    if (isOpen) {
      setSelectedPlan(autoSelect && suggestedPlan ? normalizePlanCode(suggestedPlan) : null);
    }
  }, [isOpen, autoSelect, suggestedPlan]);

  // Update plans when they change
  useEffect(() => {
    let cancelled = false;

    const loadPlans = async () => {
      try {
        const loadedPlans = await planService.getPlans();
        if (!cancelled) {
          setAllPlans(loadedPlans.filter(plan => plan.status === 'active'));
        }
      } catch (error) {
        console.error('Error loading upgrade plans:', error);
        if (!cancelled) {
          setAllPlans([]);
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

  // Get current plan data
  const currentPlanData = allPlans.find(plan => plan.code === activePlan);

  // Filter plans to show only upgrades (plans higher than current)
  const planHierarchy: Record<'free' | 'practitioner' | 'advanced', number> = {
    free: 0,
    practitioner: 1,
    advanced: 2,
  };

  const availablePlans = allPlans.filter(plan => {
    const planCode = plan.code as 'free' | 'practitioner' | 'advanced';
    const activeCode = activePlan as 'free' | 'practitioner' | 'advanced';
    return planHierarchy[planCode] > planHierarchy[activeCode];
  });

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    if (!selectedPlan) return;

    setIsLoading(true);

    try {
      const selectedPlanData = allPlans.find(p => p.code === selectedPlan);

      if (!selectedPlanData) {
        throw new Error('Plan not found');
      }

      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        throw new Error('User not authenticated');
      }

      // Call createStripeCheckout (same function used in MembershipPage)
      await createStripeCheckout(
        selectedPlan as 'practitioner' | 'advanced',
        session.user.id,
        session.user.email || ''
      );

      // The function will redirect to Stripe, so we don't reset loading
    } catch (error) {
      console.error('Error processing upgrade:', error);
      alert('There was an error processing your upgrade. Please try again.');
      setIsLoading(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upgrade Your Plan</h2>
            <p className="text-sm text-gray-600 mt-1">
              Choose a plan to unlock more features
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {availablePlans.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                You're on the highest plan!
              </h3>
              <p className="text-gray-600">
                You already have access to all available features.
              </p>
            </div>
          ) : (
            <>
              {/* Billing Period Toggle */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setBillingPeriod('monthly')}
                    className={`px-6 py-2 rounded-md font-medium text-sm transition-all ${
                      billingPeriod === 'monthly'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingPeriod('yearly')}
                    className={`px-6 py-2 rounded-md font-medium text-sm transition-all relative ${
                      billingPeriod === 'yearly'
                        ? 'bg-white text-gray-900 shadow-sm'
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

              {/* Plans Grid - Current + Available Upgrades */}
              <div className={`grid grid-cols-1 ${availablePlans.length + 1 === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6 mb-6 items-start`}>
                {/* Current Plan */}
                {currentPlanData && (
                  <div className="relative bg-gray-50 rounded-xl border-2 border-gray-300 p-6 text-left opacity-75">
                    {/* Current Plan Badge */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <div className="inline-flex items-center gap-1 px-3 py-1 bg-gray-600 text-white text-xs font-semibold rounded-full shadow-lg">
                        Current Plan
                      </div>
                    </div>

                    {/* Plan Name */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2 mt-2">
                      {currentPlanData.name}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4">
                      {currentPlanData.description}
                    </p>

                    {/* Price */}
                    <div className="mb-6">
                      {currentPlanData.code === 'free' ? (
                        <div className="text-3xl font-bold text-gray-900">Free</div>
                      ) : billingPeriod === 'monthly' ? (
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-gray-900">
                              ${currentPlanData.offer?.enabled ? currentPlanData.offer.discountedPrice : currentPlanData.monthlyPrice}
                            </span>
                            {currentPlanData.offer?.enabled && (
                              <span className="text-lg text-gray-400 line-through">
                                ${currentPlanData.offer.originalPrice}
                              </span>
                            )}
                            <span className="text-sm text-gray-600">/month</span>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-gray-900">
                              ${currentPlanData.yearlyPrice}
                            </span>
                            <span className="text-sm text-gray-600">/year</span>
                          </div>
                          {currentPlanData.monthlyPrice && currentPlanData.yearlyPrice && (
                            <div className="mt-1 text-sm text-gray-600 font-medium">
                              Save ${(currentPlanData.monthlyPrice * 12) - currentPlanData.yearlyPrice}/year
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Key Features */}
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Key Features
                      </div>

                      {currentPlanData.membershipDisplay?.customFeatures && currentPlanData.membershipDisplay.customFeatures.length > 0 ? (
                        // Custom Features
                        currentPlanData.membershipDisplay.customFeatures.map((feature, index) => (
                          feature.trim() && (
                            <div key={index} className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">{feature}</span>
                            </div>
                          )
                        ))
                      ) : (
                        // Default Features - Show ALL enabled features
                        <>
                          {/* Library Access */}
                          {currentPlanData.features.herbLibraryAccess !== 'none' && (
                            <div className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">
                                {currentPlanData.features.herbLibraryAccess === 'full' ? 'Full' : 'Sample'} Herb Library
                              </span>
                            </div>
                          )}
                          {currentPlanData.features.formulaLibraryAccess !== 'none' && (
                            <div className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">
                                {currentPlanData.features.formulaLibraryAccess === 'full' ? 'Full' : 'Sample'} Formula Library
                              </span>
                            </div>
                          )}

                          {/* Builder & Library */}
                          {currentPlanData.features.builder && (
                            <div className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">
                                Prescription Builder
                              </span>
                            </div>
                          )}
                          {currentPlanData.features.prescriptionLibrary && (
                            <div className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">
                                Save & manage prescriptions
                              </span>
                            </div>
                          )}

                          {/* Monthly Limit */}
                          <div className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">
                              {currentPlanData.limits.monthlyFormulas === null
                                ? 'Unlimited'
                                : currentPlanData.limits.monthlyFormulas === 0
                                ? 'View only'
                                : `Up to ${currentPlanData.limits.monthlyFormulas}`} prescriptions/month
                            </span>
                          </div>

                          {/* Property Filters */}
                          {currentPlanData.features.herbPropertyFilters && (
                            <div className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">
                                Herb property filters
                              </span>
                            </div>
                          )}
                          {currentPlanData.features.formulaPropertyFilters && (
                            <div className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">
                                Formula property filters
                              </span>
                            </div>
                          )}
                          {currentPlanData.features.clinicalUseFilters && (
                            <div className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">
                                Clinical use filters
                              </span>
                            </div>
                          )}

                          {/* Advanced Filters */}
                          {(currentPlanData.features.pharmacologicalEffectsFilter ||
                            currentPlanData.features.biologicalMechanismsFilter ||
                            currentPlanData.features.bioactiveCompoundsFilter) && (
                            <div className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">
                                Advanced search filters
                              </span>
                            </div>
                          )}

                          {/* Safety Profile */}
                          {(currentPlanData.features.generalConditions ||
                            currentPlanData.features.medications ||
                            currentPlanData.features.allergies ||
                            currentPlanData.features.tcmRiskPatterns) && (
                            <div className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">
                                Safety profiles
                              </span>
                            </div>
                          )}

                          {/* Analytics */}
                          {currentPlanData.features.statistics && (
                            <div className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">
                                Usage analytics
                              </span>
                            </div>
                          )}

                          {/* Custom Content */}
                          {currentPlanData.features.customContent && (
                            <div className="flex items-start gap-2">
                              <Check className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                              <span className="text-sm text-gray-700">
                                Add custom herbs & formulas
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Available Upgrade Plans */}
                {availablePlans.map(plan => {
                  const isSelected = selectedPlan === plan.code;
                  const hasOffer = plan.offer?.enabled;

                  return (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.code)}
                      className={`relative bg-white rounded-xl border-2 transition-all p-6 text-left ${
                        isSelected
                          ? 'border-teal-600 shadow-lg shadow-teal-100'
                          : 'border-gray-200 hover:border-teal-300 hover:shadow-md'
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
                      <div className="mb-6">
                        {billingPeriod === 'monthly' ? (
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
                      </div>

                      {/* Key Features */}
                      <div className="space-y-2">
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                          Key Features
                        </div>

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
                            {plan.features.herbLibraryAccess !== 'none' && (
                              <div className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-700">
                                  {plan.features.herbLibraryAccess === 'full' ? 'Full' : 'Sample'} Herb Library
                                </span>
                              </div>
                            )}
                            {plan.features.formulaLibraryAccess !== 'none' && (
                              <div className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-700">
                                  {plan.features.formulaLibraryAccess === 'full' ? 'Full' : 'Sample'} Formula Library
                                </span>
                              </div>
                            )}

                            {/* Builder & Library */}
                            {plan.features.builder && (
                              <div className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-700">
                                  Prescription Builder
                                </span>
                              </div>
                            )}
                            {plan.features.prescriptionLibrary && (
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
                                {plan.limits.monthlyFormulas === null
                                  ? 'Unlimited'
                                  : `Up to ${plan.limits.monthlyFormulas}`} prescriptions/month
                              </span>
                            </div>

                            {/* Property Filters */}
                            {plan.features.herbPropertyFilters && (
                              <div className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-700">
                                  Herb property filters
                                </span>
                              </div>
                            )}
                            {plan.features.formulaPropertyFilters && (
                              <div className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-700">
                                  Formula property filters
                                </span>
                              </div>
                            )}
                            {plan.features.clinicalUseFilters && (
                              <div className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-700">
                                  Clinical use filters
                                </span>
                              </div>
                            )}

                            {/* Advanced Filters */}
                            {(plan.features.pharmacologicalEffectsFilter ||
                              plan.features.biologicalMechanismsFilter ||
                              plan.features.bioactiveCompoundsFilter) && (
                              <div className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-700">
                                  Advanced search filters
                                </span>
                              </div>
                            )}

                            {/* Safety Profile */}
                            {(plan.features.generalConditions ||
                              plan.features.medications ||
                              plan.features.allergies ||
                              plan.features.tcmRiskPatterns) && (
                              <div className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-700">
                                  Safety profiles
                                </span>
                              </div>
                            )}

                            {/* Analytics */}
                            {plan.features.statistics && (
                              <div className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-700">
                                  Usage analytics
                                </span>
                              </div>
                            )}

                            {/* Custom Content */}
                            {plan.features.customContent && (
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
                })}
              </div>

              {/* Upgrade Button */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
                <button
                  onClick={handleUpgrade}
                  disabled={!selectedPlan || isLoading}
                  className="w-full bg-teal-600 text-white py-3.5 rounded-lg font-medium hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-teal-600/20 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Upgrade Now</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                {!selectedPlan && (
                  <p className="text-xs text-gray-500 text-center mt-3">
                    Please select a plan to continue
                  </p>
                )}

                {selectedPlan && (
                  <p className="text-xs text-gray-500 text-center mt-3">
                    You'll be redirected to secure payment
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
