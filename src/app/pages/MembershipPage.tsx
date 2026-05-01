import { CreditCard, Check, ArrowUpRight, Download, CheckCircle } from 'lucide-react';
import { useUser } from '../contexts/UserContext';
import { useState, useEffect } from 'react';
import { planService, Plan } from '../services/planService';
import { createStripeCheckout, getStripePriceId } from '@/lib/stripe';
import { toast } from 'sonner';

// Transform Plan from service format to display format
interface DisplayPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  popular?: boolean;
  offer?: {
    enabled: boolean;
    originalPrice: number;
    discountedPrice: number;
    label?: string;
    expirationNote?: string;
  };
  features: string[];
}

// Invoice type
interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
}

function transformPlanToDisplay(plan: Plan): DisplayPlan {
  // Build feature list based on plan configuration
  const features: string[] = [];
  
  // Access level features
  if (plan.features.herbLibraryAccess === 'full') {
    features.push('Full access to herb library');
  } else if (plan.features.herbLibraryAccess === 'sample') {
    features.push('Sample access to herb library');
  }
  
  if (plan.features.formulaLibraryAccess === 'full') {
    features.push('Full access to formula library');
  } else if (plan.features.formulaLibraryAccess === 'sample') {
    features.push('Sample access to formula library');
  }
  
  // Builder and prescription features
  if (plan.features.builder) {
    features.push('Prescription builder');
  }
  
  if (plan.features.prescriptionLibrary) {
    features.push('Prescription library');
  }
  
  // Filters and advanced features
  if (plan.features.herbPropertyFilters) {
    features.push('Herb property filters');
  }
  
  if (plan.features.formulaPropertyFilters) {
    features.push('Formula property filters');
  }
  
  if (plan.features.clinicalUseFilters) {
    features.push('Clinical use filters');
  }
  
  if (plan.features.patientSafetyProfile) {
    features.push('Patient safety profiles');
  }
  
  if (plan.features.pharmacologicalEffectsFilter || plan.features.biologicalMechanismsFilter) {
    features.push('Advanced search filters');
  }
  
  if (plan.features.statistics) {
    features.push('Usage analytics');
  }
  
  if (plan.features.customContent) {
    features.push('Custom content');
  }
  
  // Limits
  if (plan.limits.monthlyFormulas === null) {
    features.push('Unlimited prescriptions');
  } else if (plan.limits.monthlyFormulas > 0) {
    features.push(`Up to ${plan.limits.monthlyFormulas} prescriptions/month`);
  }
  
  // Calculate price display
  const hasActiveOffer = plan.offer?.enabled;
  const displayPrice = hasActiveOffer ? plan.offer!.discountedPrice : plan.offer?.originalPrice || 0;
  const priceString = plan.code === 'free' ? '$0' : `$${displayPrice}`;
  const period = plan.code === 'free' ? 'forever' : 'per month';
  
  return {
    id: plan.code,
    name: plan.name,
    price: priceString,
    period: period,
    popular: plan.isPopular,
    offer: plan.offer,
    features: features
  };
}

export default function MembershipPage() {
  const { planType } = useUser();
  const [plans, setPlans] = useState<DisplayPlan[]>([]);
  const [originalPlans, setOriginalPlans] = useState<Plan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // Load plans from service
  useEffect(() => {
    const loadPlans = async () => {
      const loadedPlans = await planService.getPlans();
      setOriginalPlans(loadedPlans); // Save original plans
      const displayPlans = loadedPlans
        .filter(p => p.status === 'active')
        .map(transformPlanToDisplay);
      setPlans(displayPlans);
    };

    // Load initially
    loadPlans();

    // Listen for updates
    window.addEventListener('plansUpdated', loadPlans);
    window.addEventListener('storage', loadPlans);

    return () => {
      window.removeEventListener('plansUpdated', loadPlans);
      window.removeEventListener('storage', loadPlans);
    };
  }, []);

  // Load invoices from service
  useEffect(() => {
    const loadedInvoices = planService.getInvoices();
    setInvoices(loadedInvoices);
  }, []);

  // Use actual user plan
  const currentPlan = planType;
  const renewalDate = 'Mar 12, 2026';

  const handleManageBilling = () => {
    // TODO: Redirect to Stripe Customer Portal
    console.log('Opening Stripe billing portal...');
    // For future implementation:
    // window.location.href = stripePortalUrl;
  };

  const handleUpgrade = async (planId: string) => {
    setLoadingPlanId(planId);

    try {
      // Get user session from Supabase
      const { supabase } = await import('@/app/lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        toast.error('You must be logged in to upgrade');
        setLoadingPlanId(null);
        return;
      }

      // planId is actually the plan code: 'free', 'practitioner', 'advanced'
      if (planId === 'free') {
        toast.error('You are already on the free plan');
        setLoadingPlanId(null);
        return;
      }

      const selectedPlanData = originalPlans.find(plan => plan.code === planId);
      const normalizedPlan = planId as 'practitioner' | 'advanced';
      const priceId = getStripePriceId(normalizedPlan, billingPeriod, selectedPlanData);
      const successUrl = `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${normalizedPlan}&billing=${billingPeriod}`;
      const cancelUrl = `${window.location.origin}/account/membership`;

      // Call createStripeCheckout with the plan type
      await createStripeCheckout({
        planType: normalizedPlan,
        userId: session.user.id,
        userEmail: session.user.email || '',
        priceId,
        billingPeriod,
        successUrl,
        cancelUrl,
      });

      // The function will redirect to Stripe, so we don't need to reset loading
    } catch (error: any) {
      console.error('Error processing upgrade:', error);
      toast.error(error.message || 'There was an error processing your upgrade. Please try again.');
      setLoadingPlanId(null);
    }
  };

  const handleDowngrade = async (planId: string) => {
    const confirmed = window.confirm(
      'Are you sure you want to downgrade your plan? You will lose access to some features at the end of your current billing period.'
    );

    if (!confirmed) return;

    setLoadingPlanId(planId);

    try {
      // Get the plan data (planId is actually the plan code: 'free', 'practitioner', 'advanced')
      const allPlans = await planService.getPlans();
      const selectedPlan = allPlans.find(p => p.code === planId);

      if (!selectedPlan) {
        throw new Error('Plan not found');
      }

      // TODO: Replace with your actual API endpoint for downgrades
      const API_ENDPOINT = '/api/update-subscription';

      // For development: Show alert that backend is not ready
      alert(
        'Stripe backend not yet configured.\n\n' +
        `You would be downgrading to: ${selectedPlan.name}\n\n` +
        'This would normally update your Stripe subscription.\n' +
        'See STRIPE_INTEGRATION.md for backend setup instructions.'
      );
      setLoadingPlanId(null);
      return;

      // Uncomment when backend is ready:
      /*
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPlanCode: selectedPlan.code,
          currentPlan: planType,
          isDowngrade: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }

      // Update local plan
      localStorage.setItem('userPlanType', selectedPlan.code);
      window.dispatchEvent(new Event('user-login'));

      alert('Your plan will be downgraded at the end of your current billing period.');
      setLoadingPlanId(null);
      */
    } catch (error) {
      console.error('Error processing downgrade:', error);
      alert('There was an error processing your downgrade. Please try again.');
      setLoadingPlanId(null);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Membership & Billing</h1>
        <p className="text-gray-600">Manage your subscription and billing</p>
      </div>

      {/* Current Plan Card */}
      <div className="max-w-2xl mb-8">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Current Plan</h2>
            
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="inline-flex items-center gap-2 mb-3">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    currentPlan === 'free' ? 'bg-gray-100 text-gray-700' :
                    currentPlan === 'practitioner' ? 'bg-purple-100 text-purple-700' :
                    'bg-teal-100 text-teal-800'
                  }`}>
                    {plans.find(p => p.id === currentPlan)?.name}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Next renewal: <span className="font-medium text-gray-900">{renewalDate}</span>
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {plans.find(p => p.id === currentPlan)?.price}
                </div>
                <div className="text-xs text-gray-500">
                  {plans.find(p => p.id === currentPlan)?.period}
                </div>
              </div>
            </div>

            {/* Manage Billing Button */}
            <button
              onClick={handleManageBilling}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Manage billing
            </button>
            <p className="text-xs text-gray-500 mt-3">
              Manage your payment method, view invoices, and update billing information securely through Stripe.
            </p>
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Invoice History</h2>
        
        {invoices.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full table-fixed">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-[20%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="w-[30%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="w-[15%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="w-[12%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="w-[12%] px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="w-[11%] px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {invoice.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {invoice.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {invoice.date}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        ${invoice.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                          invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {invoice.status === 'paid' && <CheckCircle className="w-3 h-3" />}
                          {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {invoice.invoiceUrl && (
                          <button
                            onClick={() => window.open(invoice.invoiceUrl, '_blank')}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            PDF
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900 mb-1">{invoice.id}</div>
                      <div className="text-xs text-gray-500 mb-2">{invoice.description}</div>
                      <div className="text-xs text-gray-600">{invoice.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900 mb-2">
                        ${invoice.amount.toFixed(2)}
                      </div>
                      <span className={`chip-compact inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-700' :
                        invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {invoice.status === 'paid' && <CheckCircle className="w-3 h-3" />}
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  {invoice.invoiceUrl && (
                    <button
                      onClick={() => window.open(invoice.invoiceUrl, '_blank')}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download PDF
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-sm text-gray-500">No invoices yet</p>
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Available Plans</h2>

          {/* Billing Period Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all relative ${
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

        <div className="flex flex-wrap justify-center gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlan;
            const canUpgrade = (currentPlan === 'free' && plan.id !== 'free') ||
                              (currentPlan === 'practitioner' && plan.id === 'advanced');
            const canDowngrade = (currentPlan === 'advanced' && plan.id !== 'advanced') ||
                                (currentPlan === 'practitioner' && plan.id === 'free');

            // Get original plan data for pricing
            const originalPlan = originalPlans.find(p => p.code === plan.id);
            const displayPrice = plan.id === 'free'
              ? '$0'
              : billingPeriod === 'monthly'
                ? (plan.offer?.enabled ? `$${plan.offer.discountedPrice}` : `$${originalPlan?.monthlyPrice}`)
                : `$${originalPlan?.yearlyPrice}`;
            const displayPeriod = plan.id === 'free'
              ? 'forever'
              : billingPeriod === 'monthly'
                ? 'month'
                : 'year';
            const yearlySavings = originalPlan && originalPlan.monthlyPrice && originalPlan.yearlyPrice
              ? (originalPlan.monthlyPrice * 12) - originalPlan.yearlyPrice
              : 0;

            return (
              <div
                key={plan.id}
                className={`relative w-full md:w-80 bg-white rounded-lg border-2 transition-all ${
                  isCurrent
                    ? 'border-teal-500 shadow-lg'
                    : plan.popular
                    ? 'border-teal-200'
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && !isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-teal-600 text-white text-xs font-semibold">
                      Popular
                    </span>
                  </div>
                )}

                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-teal-600 text-white text-xs font-semibold">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                  
                  {/* Pricing with Launch Offer Support */}
                  <div className="mb-6">
                    {plan.id !== 'free' && plan.offer?.enabled && billingPeriod === 'monthly' ? (
                      <>
                        {/* Offer Badge */}
                        {plan.offer.label && (
                          <div className="mb-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-teal-50 text-teal-700 text-xs font-medium border border-teal-200">
                              {plan.offer.label}
                            </span>
                          </div>
                        )}
                        {/* Original Price (crossed out) */}
                        <div className="mb-1">
                          <span className="text-lg text-gray-400 line-through">
                            ${plan.offer.originalPrice}
                          </span>
                        </div>
                        {/* Discounted Price */}
                        <div>
                          <span className="text-3xl font-bold text-gray-900">
                            ${plan.offer.discountedPrice}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">/ {displayPeriod}</span>
                        </div>
                        {/* Expiration Note */}
                        {plan.offer.expirationNote && (
                          <p className="text-xs text-gray-500 mt-1">{plan.offer.expirationNote}</p>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Regular Pricing */}
                        <div>
                          <span className="text-3xl font-bold text-gray-900">{displayPrice}</span>
                          <span className="text-sm text-gray-500 ml-1">/ {displayPeriod}</span>
                        </div>
                        {/* Yearly Savings */}
                        {billingPeriod === 'yearly' && yearlySavings > 0 && (
                          <div className="mt-1 text-sm text-teal-600 font-medium">
                            Save ${yearlySavings}/year
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full px-4 py-2.5 bg-gray-100 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed"
                    >
                      Current plan
                    </button>
                  ) : canUpgrade ? (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={loadingPlanId === plan.id}
                      className="w-full px-4 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingPlanId === plan.id ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <span>Upgrade to {plan.name}</span>
                          <ArrowUpRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  ) : canDowngrade ? (
                    <button
                      onClick={() => handleDowngrade(plan.id)}
                      disabled={loadingPlanId === plan.id}
                      className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                    >
                      {loadingPlanId === plan.id ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <span>Switch to {plan.name}</span>
                      )}
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing Information */}
      <div className="max-w-2xl">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Billing Information</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• All billing is processed securely through Stripe</li>
            <li>• You can cancel or change your plan at any time</li>
            <li>• Downgrades take effect at the end of your current billing period</li>
            <li>• Upgrades are applied immediately with prorated charges</li>
          </ul>
        </div>
      </div>
    </>
  );
}
