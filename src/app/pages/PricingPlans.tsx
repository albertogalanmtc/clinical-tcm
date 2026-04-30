import { Check, X, Crown, Sparkles, Building2 } from 'lucide-react';
import { useUser } from '../contexts/UserContext';

export default function PricingPlans() {
  const { planType } = useUser();

  const plans = [
    {
      id: 'free',
      name: 'Free',
      icon: Sparkles,
      iconColor: 'text-gray-500',
      price: '$0',
      period: 'forever',
      description: 'Essential tools to get started with TCM practice',
      features: [
        { name: 'TCM Property Filters', included: true, description: 'Categories, natures, flavors, channels' },
        { name: 'Clinical Use Filters', included: false, description: 'Search beneficial herbs for indications' },
        { name: 'Patient Safety Profile', included: false, description: 'Safety alerts for conditions & medications' },
        { name: 'Advanced Filters', included: false, description: 'Pharmacological & biological effects' },
        { name: 'Unlimited Prescriptions', included: true },
        { name: 'Herb Library Access', included: true },
        { name: 'Formula Library Access', included: true },
      ],
      bgColor: 'bg-white',
      borderColor: 'border-gray-200',
      buttonStyle: 'bg-gray-600 hover:bg-gray-700 text-white',
      current: planType === 'free' || !planType
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Crown,
      iconColor: 'text-blue-600',
      price: '$29',
      period: 'per month',
      description: 'Advanced clinical tools for professional practitioners',
      popular: true,
      features: [
        { name: 'TCM Property Filters', included: true, description: 'Categories, natures, flavors, channels' },
        { name: 'Clinical Use Filters', included: true, description: 'Search beneficial herbs for indications' },
        { name: 'Patient Safety Profile', included: true, description: 'Safety alerts for conditions & medications' },
        { name: 'Advanced Filters', included: false, description: 'Pharmacological & biological effects' },
        { name: 'Unlimited Prescriptions', included: true },
        { name: 'Herb Library Access', included: true },
        { name: 'Formula Library Access', included: true },
        { name: 'Priority Support', included: true },
      ],
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      buttonStyle: 'bg-blue-600 hover:bg-blue-700 text-white',
      current: planType === 'pro'
    },
    {
      id: 'clinic',
      name: 'Clinic',
      icon: Building2,
      iconColor: 'text-purple-600',
      price: '$99',
      period: 'per month',
      description: 'Complete solution for clinics and research',
      features: [
        { name: 'TCM Property Filters', included: true, description: 'Categories, natures, flavors, channels' },
        { name: 'Clinical Use Filters', included: true, description: 'Search beneficial herbs for indications' },
        { name: 'Patient Safety Profile', included: true, description: 'Safety alerts for conditions & medications' },
        { name: 'Advanced Filters', included: true, description: 'Pharmacological & biological effects' },
        { name: 'Unlimited Prescriptions', included: true },
        { name: 'Herb Library Access', included: true },
        { name: 'Formula Library Access', included: true },
        { name: 'Priority Support', included: true },
        { name: 'Multi-user Access', included: true },
        { name: 'API Access', included: true },
      ],
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-300',
      buttonStyle: 'bg-purple-600 hover:bg-purple-700 text-white',
      current: planType === 'clinic'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your Traditional Chinese Medicine practice
          </p>
        </div>

        {/* Plans Grid */}
        <div className="flex flex-wrap justify-center gap-8 lg:gap-6">
          {plans.map((plan) => {
            const Icon = plan.icon;
            
            return (
              <div
                key={plan.id}
                className={`relative w-full lg:w-80 ${plan.bgColor} ${plan.borderColor} border-2 rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl ${
                  plan.popular ? 'lg:scale-105 lg:z-10' : ''
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1 text-xs font-semibold rounded-bl-lg">
                    MOST POPULAR
                  </div>
                )}

                {/* Current Plan Badge */}
                {plan.current && (
                  <div className="absolute top-0 left-0 bg-teal-600 text-white px-4 py-1 text-xs font-semibold rounded-br-lg">
                    CURRENT PLAN
                  </div>
                )}

                <div className="p-8">
                  {/* Icon and Name */}
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className={`w-8 h-8 ${plan.iconColor}`} />
                    <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600 ml-2">/ {plan.period}</span>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 min-h-[3rem]">
                    {plan.description}
                  </p>

                  {/* CTA Button */}
                  <button
                    disabled={plan.current}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors mb-8 ${
                      plan.current
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : plan.buttonStyle
                    }`}
                  >
                    {plan.current ? 'Current Plan' : `Choose ${plan.name}`}
                  </button>

                  {/* Features List */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      What's included
                    </h3>
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {feature.included ? (
                              <Check className="w-5 h-5 text-teal-600" />
                            ) : (
                              <X className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span
                              className={`text-sm ${
                                feature.included ? 'text-gray-900' : 'text-gray-400 line-through'
                              }`}
                            >
                              {feature.name}
                            </span>
                            {feature.description && feature.included && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                {feature.description}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-gray-600">
            Need help choosing? Contact us at{' '}
            <a href="mailto:support@tcmapp.com" className="text-teal-600 hover:text-teal-700 font-medium">
              support@tcmapp.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
