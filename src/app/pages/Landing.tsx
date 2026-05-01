import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, Users, BookOpen, Leaf, Heart, ArrowRight, Database, FlaskConical, FileText, ShieldCheck, Search } from 'lucide-react';
import { getPlatformSettings } from '@/app/data/platformSettings';
import { planService, type Plan } from '@/app/services/planService';

interface LandingPlanCard {
  id: string;
  name: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  monthlyOffer?: {
    originalPrice?: number;
    discountedPrice?: number;
    label?: string;
    expirationNote?: string;
  };
  yearlyOffer?: {
    originalPrice?: number;
    discountedPrice?: number;
    label?: string;
    expirationNote?: string;
  };
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  badge?: string;
  action: (billingPeriod: 'monthly' | 'yearly') => void;
}

export default function Landing() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<LandingPlanCard[]>([]);
  const [isPlansLoading, setIsPlansLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [branding, setBranding] = useState(() => getPlatformSettings().branding);

  const features = [
    {
      icon: <Database className="w-6 h-6" />,
      title: 'Comprehensive Herb Database',
      description: 'Access detailed information on hundreds of Chinese herbs with advanced filtering by properties, categories, and clinical applications.'
    },
    {
      icon: <FlaskConical className="w-6 h-6" />,
      title: 'Formula Builder',
      description: 'Create and manage custom TCM formulas with intelligent suggestions and traditional formula templates.'
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Prescription Management',
      description: 'Generate professional prescriptions for patients with dosage calculations and safety checks.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: 'Patient Safety Profiles',
      description: 'Check for contraindications based on patient conditions, medications, and allergies to ensure safe treatments.'
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: 'Clinical Applications',
      description: 'Search herbs and formulas by therapeutic indications and clinical use cases.'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Community & Knowledge Sharing',
      description: 'Connect with other practitioners, share experiences, and learn from the TCM community.'
    }
  ];

  const buildPlanFeatures = (plan: Plan): string[] => {
    const features: string[] = [];

    if (plan.features.herbLibraryAccess === 'full') {
      features.push('Full herb library access');
    } else if (plan.features.herbLibraryAccess === 'sample') {
      features.push('Sample herb library access');
    }

    if (plan.features.formulaLibraryAccess === 'full') {
      features.push('Full formula library access');
    } else if (plan.features.formulaLibraryAccess === 'sample') {
      features.push('Sample formula library access');
    }

    if (plan.features.builder) features.push('Prescription builder');
    if (plan.features.prescriptionLibrary) features.push('Prescription library');
    if (plan.features.statistics) features.push('Usage analytics');
    if (plan.features.herbPropertyFilters || plan.features.formulaPropertyFilters || plan.features.clinicalUseFilters) {
      features.push('Advanced filtering tools');
    }
    if (plan.features.generalConditions || plan.features.medications || plan.features.allergies || plan.features.tcmRiskPatterns) {
      features.push('Patient safety profiles');
    }
    if (plan.features.pharmacologicalEffectsFilter || plan.features.biologicalMechanismsFilter || plan.features.bioactiveCompoundsFilter) {
      features.push('Advanced clinical insights');
    }
    if (plan.limits.monthlyFormulas === null) {
      features.push('Unlimited monthly formulas');
    } else if (plan.limits.monthlyFormulas > 0) {
      features.push(`Up to ${plan.limits.monthlyFormulas} monthly formulas`);
    }

    return features;
  };

  const toLandingPlan = (plan: Plan): LandingPlanCard => {
    const hasMonthlyOffer = Boolean(plan.offer?.enabled);
    const hasYearlyOffer = Boolean(plan.offer?.yearlyEnabled);

    return {
      id: plan.code,
      name: plan.name,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      monthlyOffer: hasMonthlyOffer
        ? {
            originalPrice: plan.offer?.originalPrice,
            discountedPrice: plan.offer?.discountedPrice,
            label: plan.offer?.label,
            expirationNote: plan.offer?.expirationNote,
          }
        : undefined,
      yearlyOffer: hasYearlyOffer
        ? {
            originalPrice: plan.offer?.yearlyOriginalPrice,
            discountedPrice: plan.offer?.yearlyDiscountedPrice,
            label: plan.offer?.yearlyLabel || plan.offer?.label,
            expirationNote: plan.offer?.yearlyExpirationNote || plan.offer?.expirationNote,
          }
        : undefined,
      description: plan.description,
      features: plan.membershipDisplay?.customFeatures?.length ? plan.membershipDisplay.customFeatures : buildPlanFeatures(plan),
      cta: plan.code === 'free' ? 'Get Started Free' : `Start ${plan.name}`,
      popular: plan.isPopular,
      action: (selectedBillingPeriod) => {
        if (plan.code === 'free') {
          navigate('/create-account');
          return;
        }

        navigate(`/select-membership?plan=${plan.code}&billing=${selectedBillingPeriod}`);
      },
    };
  };

  useEffect(() => {
    let cancelled = false;

    const loadPlans = async () => {
      setIsPlansLoading(true);

      try {
        const loadedPlans = await planService.getPlans();
        if (cancelled) return;

        const activePlans = ['free', 'practitioner', 'advanced']
          .map(code => loadedPlans.find(plan => plan.code === code && plan.status === 'active'))
          .filter(Boolean) as Plan[];

        setPlans(activePlans.map(toLandingPlan));
      } catch (error) {
        console.error('Error loading landing plans:', error);
        if (!cancelled) setPlans([]);
      } finally {
        if (!cancelled) setIsPlansLoading(false);
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

  useEffect(() => {
    const handleBrandingUpdate = () => {
      setBranding(getPlatformSettings().branding);
    };

    window.addEventListener('storage', handleBrandingUpdate);
    window.addEventListener('platformSettingsUpdated', handleBrandingUpdate);

    return () => {
      window.removeEventListener('storage', handleBrandingUpdate);
      window.removeEventListener('platformSettingsUpdated', handleBrandingUpdate);
    };
  }, []);

  const DEFAULT_LOGO_URL = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%230d9488"/%3E%3Ctext x="50" y="65" font-size="32" fill="white" text-anchor="middle" font-family="Arial"%3ECT%3C/text%3E%3C/svg%3E';

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              {branding.logoUrl ? (
                <img
                  src={branding.logoUrl}
                  alt="Logo"
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = DEFAULT_LOGO_URL;
                  }}
                />
              ) : (
                <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
              )}
              {branding.showAppName && (
                <span className="text-xl font-bold text-gray-900">{branding.appName}</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors font-medium"
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/create-account')}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[calc(100svh-4rem)] px-4 sm:px-6 lg:px-8 pt-24 pb-14 flex items-center overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-teal-50/70 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto w-full text-center relative">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Traditional Chinese Medicine
            <span className="block text-teal-600 mt-2">Made Modern</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10 sm:mb-12">
            Your comprehensive platform for TCM clinical practice. Access extensive herb libraries, 
            formula databases, and build prescriptions with built-in safety protocols.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/create-account')}
              className="px-8 py-4 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold text-lg flex items-center gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                const pricingSection = document.getElementById('pricing');
                pricingSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-teal-600 hover:text-teal-600 transition-colors font-semibold text-lg"
              >
                View Pricing
              </button>
          </div>
          <div className="mt-10 sm:mt-14 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-sm text-gray-500 shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
              Scroll to explore features and pricing
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Clinical Practice
            </h2>
            <p className="text-xl text-gray-600">
              Professional tools designed specifically for TCM practitioners
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl border border-gray-200 hover:border-teal-600 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600">
            Select the perfect plan for your practice
          </p>
        </div>

          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center bg-white rounded-lg border-2 border-gray-200 p-1 shadow-sm">
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

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {isPlansLoading && plans.length === 0 ? (
              [0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl border-2 border-gray-200 p-8 flex flex-col animate-pulse"
                >
                  <div className="h-6 w-24 bg-gray-100 rounded mb-4" />
                  <div className="h-4 w-48 bg-gray-100 rounded mb-6" />
                  <div className="h-12 w-32 bg-gray-100 rounded mb-6" />
                  <div className="space-y-4 mb-8 flex-1">
                    <div className="h-4 w-full bg-gray-100 rounded" />
                    <div className="h-4 w-5/6 bg-gray-100 rounded" />
                    <div className="h-4 w-4/6 bg-gray-100 rounded" />
                  </div>
                  <div className="h-12 w-full bg-gray-100 rounded-lg" />
                </div>
              ))
            ) : plans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white rounded-2xl border-2 p-8 flex flex-col ${
                  plan.popular
                    ? 'border-teal-600 shadow-xl scale-105'
                    : 'border-gray-200'
                }`}
              >
                {(() => {
                  const currentOffer = billingPeriod === 'yearly' ? plan.yearlyOffer : plan.monthlyOffer;
                  return currentOffer?.label && !plan.popular ? (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      {currentOffer.label}
                    </div>
                  ) : null;
                })()}

                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {plan.description}
                  </p>
                  {plan.id === 'free' ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-gray-900">Free</span>
                      <span className="text-gray-600">forever</span>
                    </div>
                  ) : billingPeriod === 'monthly' ? (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-gray-900">
                          ${plan.monthlyOffer?.discountedPrice ?? plan.monthlyPrice ?? 0}
                        </span>
                        {plan.monthlyOffer?.originalPrice ? (
                          <span className="text-lg text-gray-400 line-through">
                            ${plan.monthlyOffer.originalPrice}
                          </span>
                        ) : null}
                        <span className="text-gray-600">/month</span>
                      </div>
                      {plan.monthlyOffer?.label && (
                        <p className="text-sm text-orange-600 font-medium mt-2">
                          🎉 {plan.monthlyOffer.label}
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-gray-900">
                          ${plan.yearlyOffer?.discountedPrice ?? plan.yearlyPrice ?? 0}
                        </span>
                        {plan.yearlyOffer?.originalPrice ? (
                          <span className="text-lg text-gray-400 line-through">
                            ${plan.yearlyOffer.originalPrice}
                          </span>
                        ) : null}
                        <span className="text-gray-600">/year</span>
                      </div>
                      {plan.yearlyOffer?.originalPrice && plan.yearlyOffer?.discountedPrice ? (
                        <p className="text-sm text-teal-600 font-medium mt-2">
                          Save ${plan.yearlyOffer.originalPrice - plan.yearlyOffer.discountedPrice}/year
                        </p>
                      ) : plan.monthlyPrice && plan.yearlyPrice ? (
                        <p className="text-sm text-teal-600 font-medium mt-2">
                          Save ${(plan.monthlyPrice * 12) - plan.yearlyPrice}/year
                        </p>
                      ) : null}
                      {plan.yearlyOffer?.label && (
                        <p className="text-sm text-orange-600 font-medium mt-2">
                          🎉 {plan.yearlyOffer.label}
                        </p>
                      )}
                    </>
                  )}
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => plan.action(billingPeriod)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-teal-600 text-white hover:bg-teal-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-600 to-teal-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-xl text-teal-100 mb-10">
            Join thousands of TCM practitioners using Clinical TCM for better patient care
          </p>
          <button
            onClick={() => navigate('/create-account')}
            className="px-8 py-4 bg-white text-teal-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg inline-flex items-center gap-2"
          >
            Get Started Today
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="w-6 h-6 text-teal-500" />
                <span className="text-white font-bold">Clinical TCM</span>
              </div>
              <p className="text-sm">
                Professional tools for Traditional Chinese Medicine practitioners.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => navigate('/create-account')} className="hover:text-white transition-colors">
                    Features
                  </button>
                </li>
                <li>
                  <button onClick={() => {
                    const pricingSection = document.getElementById('pricing');
                    pricingSection?.scrollIntoView({ behavior: 'smooth' });
                  }} className="hover:text-white transition-colors">
                    Pricing
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => navigate('/legal/about')} className="hover:text-white transition-colors">
                    About
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/legal/privacy')} className="hover:text-white transition-colors">
                    Privacy
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/legal/terms')} className="hover:text-white transition-colors">
                    Terms
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Get Started</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => navigate('/login')} className="hover:text-white transition-colors">
                    Log In
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate('/create-account')} className="hover:text-white transition-colors">
                    Sign Up
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 Clinical TCM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
