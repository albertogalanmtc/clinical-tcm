import { ReactNode } from 'react';
import { useUser } from '../contexts/UserContext';
import { Lock } from 'lucide-react';
import type { PlanFeatures } from '../data/usersManager';

interface FeatureGuardProps {
  feature: keyof PlanFeatures;
  children: ReactNode;
  showUpgradeMessage?: boolean;
  fallback?: ReactNode;
}

/**
 * FeatureGuard - Wrapper component that shows/hides content based on user's plan features
 * 
 * @param feature - The feature key to check (tcmPropertyFilters, clinicalUseFilters, etc.)
 * @param children - Content to show if feature is enabled
 * @param showUpgradeMessage - Show upgrade message instead of hiding (default: false)
 * @param fallback - Custom fallback content when feature is disabled
 */
export function FeatureGuard({
  feature,
  children,
  showUpgradeMessage = false,
  fallback
}: FeatureGuardProps) {
  const { planFeatures, planType, isAdmin } = useUser();

  // Admin always has access
  if (isAdmin) {
    return <>{children}</>;
  }

  const featureValue = planFeatures[feature];

  // Check if feature is enabled based on type
  let isEnabled = false;

  // Library access features ('none' | 'sample' | 'full')
  if (feature === 'herbLibraryAccess' || feature === 'formulaLibraryAccess') {
    isEnabled = featureValue !== 'none';
  } else {
    // Boolean features
    isEnabled = featureValue === true;
  }

  // If feature is enabled, show content
  if (isEnabled) {
    return <>{children}</>;
  }
  
  // If feature is disabled and we want to show upgrade message
  if (showUpgradeMessage) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Lock className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              {getFeatureName(feature)} - Upgrade Required
            </h3>
            <p className="text-xs text-gray-600">
              This feature is not available in your current plan ({planType?.toUpperCase() || 'FREE'}).
              Upgrade to access this functionality.
            </p>
          </div>
        </div>
      </div>
    );
  }
  
  // If custom fallback provided
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Otherwise, hide completely
  return null;
}

function getFeatureName(feature: keyof PlanFeatures): string {
  const names: Partial<Record<keyof PlanFeatures, string>> = {
    herbLibraryAccess: 'Full Herb Library',
    formulaLibraryAccess: 'Full Formula Library',
    builder: 'Prescription Builder',
    prescriptionLibrary: 'Prescription Library',
    herbPropertyFilters: 'Herb Property Filters',
    formulaPropertyFilters: 'Formula Property Filters',
    clinicalUseFilters: 'Clinical Use Filters',
    pharmacologicalEffectsFilter: 'Pharmacological Effects Filter',
    biologicalMechanismsFilter: 'Biological Mechanisms Filter',
    bioactiveCompoundsFilter: 'Bioactive Compounds Filter',
    generalConditions: 'General Health Conditions',
    medications: 'Medications Check',
    allergies: 'Allergies Check',
    tcmRiskPatterns: 'TCM Risk Patterns',
    statistics: 'Usage Statistics',
    customContent: 'Custom Content',
  };
  return names[feature] || feature.toString();
}
