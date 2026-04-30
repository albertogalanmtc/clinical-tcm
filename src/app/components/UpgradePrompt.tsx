import { useState } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { UpgradePlanModal } from './UpgradePlanModal';
import { useUser } from '../contexts/UserContext';

interface UpgradePromptProps {
  feature: string;
  description?: string;
  requiredPlan?: 'practitioner' | 'advanced' | 'pro' | 'clinic'; // Support both old and new codes
  inline?: boolean;
}

export function UpgradePrompt({
  feature,
  description,
  requiredPlan = 'practitioner', // Changed from 'pro' to 'practitioner'
  inline = false
}: UpgradePromptProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [autoSelectPlan, setAutoSelectPlan] = useState(true);
  const { planType } = useUser();

  // Map old plan codes to new display names
  const getPlanDisplayName = (plan: string): string => {
    if (plan === 'pro' || plan === 'practitioner') return 'Practitioner';
    if (plan === 'clinic' || plan === 'advanced') return 'Advanced';
    return plan;
  };

  const handleUpgradeClick = () => {
    setAutoSelectPlan(true);
    setIsModalOpen(true);
  };

  const handleViewAllPlansClick = () => {
    setAutoSelectPlan(false);
    setIsModalOpen(true);
  };

  if (inline) {
    // Compact inline version for buttons/small areas
    return (
      <>
        <div className="inline-flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-sm">
          <Lock className="w-4 h-4 text-amber-600" />
          <span className="text-amber-900">
            <span className="font-medium">{getPlanDisplayName(requiredPlan)}</span> plan required
          </span>
          <button
            onClick={handleUpgradeClick}
            className="text-teal-600 hover:text-teal-700 font-medium inline-flex items-center gap-1"
          >
            Upgrade
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <UpgradePlanModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentPlan={planType || 'free'}
          suggestedPlan={requiredPlan}
          autoSelect={autoSelectPlan}
        />
      </>
    );
  }

  // Full block version for pages/sections
  return (
    <>
      <div className="bg-gradient-to-br from-teal-50 to-blue-50 border-2 border-teal-200 rounded-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-teal-600" />
          </div>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {feature} {getPlanDisplayName(requiredPlan)} Feature
        </h3>

        {description && (
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {description}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={handleUpgradeClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors"
          >
            Upgrade to {getPlanDisplayName(requiredPlan)}
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleViewAllPlansClick}
            className="text-sm text-teal-600 hover:text-teal-700 font-medium"
          >
            View all plans
          </button>
        </div>
      </div>
      <UpgradePlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentPlan={planType || 'free'}
        suggestedPlan={requiredPlan}
        autoSelect={autoSelectPlan}
      />
    </>
  );
}

// Overlay version for modals/blocking access
export function UpgradeOverlay({
  feature,
  description,
  requiredPlan = 'practitioner'
}: Omit<UpgradePromptProps, 'inline'>) {
  return (
    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
      <UpgradePrompt
        feature={feature}
        description={description}
        requiredPlan={requiredPlan}
      />
    </div>
  );
}
