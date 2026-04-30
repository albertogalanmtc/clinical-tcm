import { ReactNode } from 'react';
import { useUser } from '../contexts/UserContext';
import { UpgradePlanModal } from './UpgradePlanModal';
import { useState } from 'react';

interface FeatureGateProps {
  children: ReactNode;
  feature: keyof import('../data/usersManager').PlanFeatures;
  fallback?: ReactNode;
  showUpgradeModal?: boolean;
}

/**
 * FeatureGate - Blocks features based on user's plan configuration
 *
 * This component checks the actual plan features configured in Admin Panel,
 * NOT hardcoded plan names.
 *
 * Usage:
 * <FeatureGate feature="builder">
 *   <Builder />
 * </FeatureGate>
 *
 * The admin can change which plans have which features without touching code.
 */
export function FeatureGate({
  children,
  feature,
  fallback = null,
  showUpgradeModal = true
}: FeatureGateProps) {
  const { planFeatures, planType, isAdmin } = useUser();
  const [showModal, setShowModal] = useState(false);

  // Admin bypasses all restrictions
  if (isAdmin) {
    return <>{children}</>;
  }

  // Check if user's plan has this feature
  const hasFeature = planFeatures[feature];

  // Special handling for library access features
  if (feature === 'herbLibraryAccess' || feature === 'formulaLibraryAccess') {
    const hasAccess = hasFeature !== 'none';
    if (hasAccess) {
      return <>{children}</>;
    }
  } else {
    // Boolean features
    if (hasFeature === true) {
      return <>{children}</>;
    }
  }

  // User doesn't have access
  if (fallback) {
    return <>{fallback}</>;
  }

  // Show upgrade prompt
  if (showUpgradeModal) {
    return (
      <>
        <div
          onClick={() => setShowModal(true)}
          className="cursor-pointer opacity-50 hover:opacity-75 transition-opacity relative"
        >
          {children}
          <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-[1px] flex items-center justify-center">
            <div className="bg-white px-4 py-2 rounded-lg shadow-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-900">
                Upgrade to unlock this feature
              </p>
            </div>
          </div>
        </div>

        {showModal && (
          <UpgradePlanModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            currentPlan={planType || 'free'}
            suggestedPlan="practitioner" // Default suggestion
            autoSelect={false}
          />
        )}
      </>
    );
  }

  return null;
}

/**
 * Hook to check if user has a specific feature
 */
export function useHasFeature(feature: keyof import('../data/usersManager').PlanFeatures): boolean {
  const { planFeatures, isAdmin } = useUser();

  if (isAdmin) return true;

  const featureValue = planFeatures[feature];

  // Library access features
  if (feature === 'herbLibraryAccess' || feature === 'formulaLibraryAccess') {
    return featureValue !== 'none';
  }

  // Boolean features
  return featureValue === true;
}

/**
 * Component to show message when feature is not available
 */
export function FeatureLockedMessage({ featureName }: { featureName: string }) {
  const { planType } = useUser();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="max-w-2xl mx-auto mt-12 p-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-teal-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {featureName} is a Premium Feature
          </h3>
          <p className="text-gray-600 mb-6">
            Upgrade your plan to unlock {featureName} and other advanced features.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
          >
            View Plans
          </button>
        </div>
      </div>

      {showModal && (
        <UpgradePlanModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          currentPlan={planType || 'free'}
          autoSelect={false}
        />
      )}
    </>
  );
}
