import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Sparkles, Users, BookOpen, Leaf, Heart, ArrowRight, Database, FlaskConical, FileText, ShieldCheck, Search } from 'lucide-react';
import { planService, type Plan } from '@/app/services/planService';

interface LandingPlanCard {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  badge?: string;
  action: () => void;
}

export default function Landing() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<LandingPlanCard[]>([]);
  const [isPlansLoading, setIsPlansLoading] = useState(true);

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
    const hasOffer = Boolean(plan.offer?.enabled);
    const displayPrice = plan.code === 'free'
      ? '$0'
      : `$${hasOffer ? plan.offer!.discountedPrice : plan.monthlyPrice || plan.yearlyPrice || 0}`;

    return {
      id: plan.code,
      name: plan.name,
      price: displayPrice,
      originalPrice: hasOffer && plan.offer?.originalPrice ? `$${plan.offer.originalPrice}` : undefined,
      period: plan.code === 'free' ? 'forever' : 'per month',
      description: plan.description,
      features: plan.membershipDisplay?.customFeatures?.length ? plan.membershipDisplay.customFeatures : buildPlanFeatures(plan),
      cta: plan.code === 'free' ? 'Get Started Free' : `Start ${plan.name}`,
      popular: plan.isPopular,
      badge: hasOffer ? (plan.offer?.label || 'Limited time offer') : undefined,
      action: () => plan.code === 'free' ? navigate('/create-account') : navigate('/select-membership'),
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
          .map(code => loadedPlans.find(plan => plan.code === code))
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Leaf className="w-8 h-8 text-teal-600" />
              <span className="text-xl font-bold text-gray-900">Clinical TCM</span>
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
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-teal-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                {plan.badge && !plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    {plan.badge}
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    {plan.originalPrice && (
                      <span className="text-lg text-gray-400 line-through">
                        {plan.originalPrice}
                      </span>
                    )}
                    <span className="text-gray-600">/{plan.period}</span>
                  </div>
                  {plan.badge && (
                    <p className="text-sm text-orange-600 font-medium mt-2">
                      🎉 Limited time offer
                    </p>
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
                  onClick={plan.action}
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
