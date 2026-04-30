import { useUser } from '../contexts/UserContext';
import type { PlanFeatures } from '../data/usersManager';

/**
 * Hook to check plan features and restrictions
 * @returns Object with helper functions to check feature access
 */
export function usePlanFeatures() {
  const { planFeatures, planType, isAdmin } = useUser();

  // Helper function to check if a feature is enabled
  const hasFeature = (featureName: keyof PlanFeatures): boolean => {
    // Admins have access to everything
    if (isAdmin) return true;
    
    const featureValue = planFeatures[featureName];
    
    // Handle string values (e.g., 'none', 'sample', 'full')
    if (typeof featureValue === 'string') {
      return featureValue !== 'none';
    }
    
    // Handle boolean values
    return Boolean(featureValue);
  };

  // Check library access level
  const getLibraryAccess = (libraryType: 'herb' | 'formula'): 'none' | 'sample' | 'full' => {
    if (isAdmin) return 'full';
    
    if (libraryType === 'herb') {
      return planFeatures.herbLibraryAccess;
    } else {
      return planFeatures.formulaLibraryAccess;
    }
  };

  // Check if user has full library access
  const hasFullLibraryAccess = (libraryType: 'herb' | 'formula'): boolean => {
    return getLibraryAccess(libraryType) === 'full';
  };

  // Check if user has at least sample access
  const hasSampleLibraryAccess = (libraryType: 'herb' | 'formula'): boolean => {
    const access = getLibraryAccess(libraryType);
    return access === 'sample' || access === 'full';
  };

  // Get safety engine mode
  const getSafetyEngineMode = (): 'disabled' | 'basic' | 'advanced' => {
    if (isAdmin) return 'advanced';
    return planFeatures.safetyEngineMode;
  };

  // Check if safety engine is enabled at all
  const hasSafetyEngine = (): boolean => {
    return getSafetyEngineMode() !== 'disabled';
  };

  // Get monthly prescription limit
  const getMonthlyLimit = (): number | null => {
    if (isAdmin) return null; // Unlimited for admins
    return planFeatures.monthlyFormulas;
  };

  // Check if user has unlimited prescriptions
  const hasUnlimitedPrescriptions = (): boolean => {
    return getMonthlyLimit() === null;
  };

  return {
    // Core feature checks
    hasFeature,
    
    // Library access
    getLibraryAccess,
    hasFullLibraryAccess,
    hasSampleLibraryAccess,
    
    // Safety engine
    getSafetyEngineMode,
    hasSafetyEngine,
    
    // Limits
    getMonthlyLimit,
    hasUnlimitedPrescriptions,
    
    // Direct access to plan data
    planFeatures,
    planType,
    isAdmin,
  };
}
