import { useUser } from '../contexts/UserContext';
import type { HerbDetailPermissions, FormulaDetailPermissions } from '../data/usersManager';

/**
 * Hook to check herb detail permissions for current user
 */
export function useHerbDetailPermissions() {
  const { planFeatures, isAdmin } = useUser();

  // Admin has all permissions
  if (isAdmin) {
    return {
      properties: true,
      clinicalUse: {
        actions: true,
        indications: true,
        duiYao: true,
        clinicalApplications: true,
      },
      safety: {
        contraindications: true,
        cautions: true,
        drugInteractions: true,
        herbInteractions: true,
        allergens: true,
        antagonisms: true,
        incompatibilities: true,
      },
      research: {
        pharmacologicalEffects: true,
        biologicalMechanisms: true,
        bioactiveCompounds: true,
        clinicalStudies: true,
      },
      foundIn: true,
      referencesNotes: {
        references: true,
        notes: true,
      },
    } as HerbDetailPermissions;
  }

  return planFeatures.herbDetailPermissions;
}

/**
 * Hook to check formula detail permissions for current user
 */
export function useFormulaDetailPermissions() {
  const { planFeatures, isAdmin } = useUser();

  // Admin has all permissions
  if (isAdmin) {
    return {
      composition: true,
      clinicalUse: {
        tcmActions: true,
        clinicalManifestations: true,
        clinicalApplications: true,
      },
      modifications: true,
      safety: {
        contraindications: true,
        cautions: true,
        drugInteractions: true,
        herbInteractions: true,
        allergens: true,
        toxicology: true,
      },
      research: {
        pharmacologicalEffects: true,
        biologicalMechanisms: true,
        bioactiveCompounds: true,
        clinicalStudies: true,
      },
      referencesNotes: {
        references: true,
        notes: true,
      },
    } as FormulaDetailPermissions;
  }

  return planFeatures.formulaDetailPermissions;
}
