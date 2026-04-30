import { ReactNode } from 'react';
import { useUser } from '../contexts/UserContext';
import { UpgradePlanModal } from './UpgradePlanModal';
import { useState } from 'react';

interface PlanGateProps {
  children: ReactNode;
  requiredPlan: 'free' | 'pro' | 'practitioner' | 'clinic' | 'advanced';
  fallback?: ReactNode;
  showUpgradeModal?: boolean;
}

/**
 * PlanGate - Blocks content based on user's plan
 *
 * Plan hierarchy:
 * free (1) < pro/practitioner (2) < clinic/advanced (3) < admin (999)
 *
 * Usage:
 * <PlanGate requiredPlan="pro">
 *   <PremiumFeature />
 * </PlanGate>
 */
export function PlanGate({
  children,
  requiredPlan,
  fallback = null,
  showUpgradeModal = true
}: PlanGateProps) {
  const { planType, isAdmin } = useUser();
  const [showModal, setShowModal] = useState(false);

  // Admin bypasses all restrictions
  if (isAdmin) {
    return <>{children}</>;
  }

  // Plan hierarchy
  const planHierarchy: Record<string, number> = {
    free: 1,
    pro: 2,
    practitioner: 2,
    clinic: 3,
    advanced: 3,
    admin: 999,
  };

  const userLevel = planHierarchy[planType || 'free'] || 0;
  const requiredLevel = planHierarchy[requiredPlan] || 0;

  const hasAccess = userLevel >= requiredLevel;

  if (hasAccess) {
    return <>{children}</>;
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
                Upgrade to {requiredPlan === 'pro' || requiredPlan === 'practitioner' ? 'Pro' : 'Clinic'} to unlock
              </p>
            </div>
          </div>
        </div>

        {showModal && (
          <UpgradePlanModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            currentPlan={planType || 'free'}
            suggestedPlan={requiredPlan as any}
            autoSelect={true}
          />
        )}
      </>
    );
  }

  return null;
}

/**
 * Hook to check if user has plan access
 */
export function useHasPlanAccess(requiredPlan: 'free' | 'pro' | 'practitioner' | 'clinic' | 'advanced'): boolean {
  const { planType, isAdmin } = useUser();

  if (isAdmin) return true;

  const planHierarchy: Record<string, number> = {
    free: 1,
    pro: 2,
    practitioner: 2,
    clinic: 3,
    advanced: 3,
    admin: 999,
  };

  const userLevel = planHierarchy[planType || 'free'] || 0;
  const requiredLevel = planHierarchy[requiredPlan] || 0;

  return userLevel >= requiredLevel;
}
