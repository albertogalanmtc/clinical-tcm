// User and Plan Management System
import { planService } from '../services/planService';
import { getPlanFeatures as getSupabasePlanFeatures } from '../services/plansService';

export type PlanType = 'free' | 'practitioner' | 'advanced';

// Herb Detail Permissions (granular control)
export interface HerbDetailPermissions {
  properties: boolean;
  clinicalUse: {
    actions: boolean;
    indications: boolean;
    duiYao: boolean;
    clinicalApplications: boolean;
  };
  safety: {
    contraindications: boolean;
    cautions: boolean;
    drugInteractions: boolean;
    herbInteractions: boolean;
    allergens: boolean;
    antagonisms: boolean;
    incompatibilities: boolean;
  };
  research: {
    pharmacologicalEffects: boolean;
    biologicalMechanisms: boolean;
    bioactiveCompounds: boolean;
    clinicalStudies: boolean;
  };
  foundIn: boolean;
  referencesNotes: {
    references: boolean;
    notes: boolean;
  };
}

// Formula Detail Permissions (granular control)
export interface FormulaDetailPermissions {
  composition: boolean;
  clinicalUse: {
    tcmActions: boolean;
    clinicalManifestations: boolean;
    clinicalApplications: boolean;
  };
  modifications: boolean;
  safety: {
    contraindications: boolean;
    cautions: boolean;
    drugInteractions: boolean;
    herbInteractions: boolean;
    allergens: boolean;
    toxicology: boolean;
  };
  research: {
    pharmacologicalEffects: boolean;
    biologicalMechanisms: boolean;
    bioactiveCompounds: boolean;
    clinicalStudies: boolean;
  };
  referencesNotes: {
    references: boolean;
    notes: boolean;
  };
}

export interface PlanFeatures {
  herbLibraryAccess: 'none' | 'sample' | 'full';
  formulaLibraryAccess: 'none' | 'sample' | 'full';
  builder: boolean;
  prescriptionLibrary: boolean;
  statistics: boolean;
  herbPropertyFilters: boolean;
  formulaPropertyFilters: boolean;
  clinicalUseFilters: boolean;
  generalConditions: boolean;
  medications: boolean;
  allergies: boolean;
  tcmRiskPatterns: boolean;
  pharmacologicalEffectsFilter: boolean;
  biologicalMechanismsFilter: boolean;
  bioactiveCompoundsFilter: boolean;
  customContent: boolean;
  safetyEngineMode: 'disabled' | 'basic' | 'advanced';
  monthlyFormulas: number | null;
  // Detail permissions
  herbDetailPermissions: HerbDetailPermissions;
  formulaDetailPermissions: FormulaDetailPermissions;
}

export interface UserPlan {
  id: string;
  name: string;
  type: PlanType;
  features: PlanFeatures;
}

export interface User {
  email: string;
  password: string;
  role: 'user' | 'admin';
  planType: PlanType;
  profile: {
    email: string;
    firstName: string;
    lastName: string;
    country: string;
    onboardingCompleted: boolean;
  };
}

// Default herb detail permissions (all enabled)
const DEFAULT_HERB_PERMISSIONS: HerbDetailPermissions = {
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
};

// Default formula detail permissions (all enabled)
const DEFAULT_FORMULA_PERMISSIONS: FormulaDetailPermissions = {
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
};

// Default plan configurations
export const DEFAULT_PLANS: Record<PlanType, PlanFeatures> = {
  free: {
    herbLibraryAccess: 'sample',
    formulaLibraryAccess: 'sample',
    builder: false,
    prescriptionLibrary: false,
    statistics: false,
    herbPropertyFilters: true,
    formulaPropertyFilters: false,
    clinicalUseFilters: false,
    generalConditions: false,
    medications: false,
    allergies: false,
    tcmRiskPatterns: false,
    pharmacologicalEffectsFilter: false,
    biologicalMechanismsFilter: false,
    bioactiveCompoundsFilter: false,
    customContent: false,
    safetyEngineMode: 'disabled',
    monthlyFormulas: 5,
    herbDetailPermissions: DEFAULT_HERB_PERMISSIONS,
    formulaDetailPermissions: DEFAULT_FORMULA_PERMISSIONS,
  },
  practitioner: {
    herbLibraryAccess: 'full',
    formulaLibraryAccess: 'full',
    builder: true,
    prescriptionLibrary: true,
    statistics: true,
    herbPropertyFilters: true,
    formulaPropertyFilters: true,
    clinicalUseFilters: true,
    generalConditions: true,
    medications: true,
    allergies: true,
    tcmRiskPatterns: true,
    pharmacologicalEffectsFilter: true,
    biologicalMechanismsFilter: true,
    bioactiveCompoundsFilter: false,
    customContent: false,
    safetyEngineMode: 'basic',
    monthlyFormulas: 20,
    herbDetailPermissions: DEFAULT_HERB_PERMISSIONS,
    formulaDetailPermissions: DEFAULT_FORMULA_PERMISSIONS,
  },
  advanced: {
    herbLibraryAccess: 'full',
    formulaLibraryAccess: 'full',
    builder: true,
    prescriptionLibrary: true,
    statistics: true,
    herbPropertyFilters: true,
    formulaPropertyFilters: true,
    clinicalUseFilters: true,
    generalConditions: true,
    medications: true,
    allergies: true,
    tcmRiskPatterns: true,
    pharmacologicalEffectsFilter: true,
    biologicalMechanismsFilter: true,
    bioactiveCompoundsFilter: true,
    customContent: true,
    safetyEngineMode: 'advanced',
    monthlyFormulas: 50,
    herbDetailPermissions: DEFAULT_HERB_PERMISSIONS,
    formulaDetailPermissions: DEFAULT_FORMULA_PERMISSIONS,
  },
};

// Demo users with different plans
export const DEMO_USERS: Record<string, User> = {
  'free@tcm.com': {
    email: 'free@tcm.com',
    password: '1234',
    role: 'user',
    planType: 'free',
    profile: {
      email: 'free@tcm.com',
      firstName: 'Free',
      lastName: 'User',
      country: 'US',
      onboardingCompleted: true,
    },
  },
  'practitioner@tcm.com': {
    email: 'practitioner@tcm.com',
    password: '1234',
    role: 'user',
    planType: 'practitioner',
    profile: {
      email: 'practitioner@tcm.com',
      firstName: 'Practitioner',
      lastName: 'User',
      country: 'US',
      onboardingCompleted: true,
    },
  },
  'advanced@tcm.com': {
    email: 'advanced@tcm.com',
    password: '1234',
    role: 'user',
    planType: 'advanced',
    profile: {
      email: 'advanced@tcm.com',
      firstName: 'Advanced',
      lastName: 'User',
      country: 'US',
      onboardingCompleted: true,
    },
  },
  'admin@tcm.com': {
    email: 'admin@tcm.com',
    password: '1234',
    role: 'admin',
    planType: 'advanced', // Admin has full access
    profile: {
      email: 'admin@tcm.com',
      firstName: 'Alberto',
      lastName: 'Galán',
      country: 'US',
      onboardingCompleted: true,
    },
  },
  'user@tcm.com': {
    email: 'user@tcm.com',
    password: '1234',
    role: 'user',
    planType: 'practitioner', // Legacy user gets Practitioner
    profile: {
      email: 'user@tcm.com',
      firstName: 'John',
      lastName: 'Chen',
      country: 'US',
      onboardingCompleted: true,
    },
  },
};

// Get current user's plan from localStorage
export function getCurrentUserPlan(): PlanType | null {
  if (typeof window === 'undefined') return null;

  const planType = localStorage.getItem('userPlanType');
  if (planType && (planType === 'free' || planType === 'practitioner' || planType === 'advanced')) {
    return planType as PlanType;
  }

  // Backward compatibility: migrate old plan types
  if (planType === 'pro') {
    localStorage.setItem('userPlanType', 'practitioner');
    return 'practitioner';
  }
  if (planType === 'clinic') {
    localStorage.setItem('userPlanType', 'advanced');
    return 'advanced';
  }

  return null;
}

// Get plan features from Supabase (async version - preferred)
export async function getPlanFeaturesAsync(planType: PlanType): Promise<PlanFeatures> {
  try {
    // Try Supabase first (centralized configuration)
    const supabaseFeatures = await getSupabasePlanFeatures(planType);
    if (supabaseFeatures) {
      return supabaseFeatures;
    }
  } catch (error) {
    console.error('Error loading plan features from Supabase:', error);
  }

  // Fallback to planService (localStorage)
  try {
    const plan = planService.getPlanByCode(planType);
    if (plan) {
      return {
        ...plan.features,
        safetyEngineMode: plan.safetyEngineMode,
        monthlyFormulas: plan.limits.monthlyFormulas,
      };
    }
  } catch (error) {
    console.error('Error loading plan features from planService:', error);
  }

  // Final fallback to hardcoded defaults
  return DEFAULT_PLANS[planType];
}

// Get plan features (sync version - uses default plans as fallback)
export function getPlanFeatures(planType: PlanType): PlanFeatures {
  // Return default plan features immediately (sync)
  return DEFAULT_PLANS[planType];
}

// Get current user's features based on their plan
export function getCurrentUserFeatures(): PlanFeatures {
  const planType = getCurrentUserPlan();

  if (!planType) {
    // Default to free plan features if no plan is set
    return DEFAULT_PLANS.free;
  }

  return getPlanFeatures(planType);
}

// Check if a specific feature is enabled for current user
export function isFeatureEnabled(feature: keyof PlanFeatures): boolean {
  const features = getCurrentUserFeatures();
  return features[feature];
}

// Store user plan in localStorage (called during login)
export function setUserPlan(planType: PlanType): void {
  localStorage.setItem('userPlanType', planType);
}

// Get user by email (for login)
export function getUserByEmail(email: string): User | null {
  const normalizedEmail = email.toLowerCase();
  return DEMO_USERS[normalizedEmail] || null;
}

// Get user role from localStorage
export function getUserRole(): 'user' | 'admin' | null {
  if (typeof window === 'undefined') return null;
  
  const role = localStorage.getItem('userRole');
  if (role === 'user' || role === 'admin') {
    return role;
  }
  
  return null;
}

// Get user profile from localStorage
export function getUserProfile(): User['profile'] | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const profileData = localStorage.getItem('userProfile');
    if (profileData) {
      return JSON.parse(profileData);
    }
  } catch (error) {
    console.error('Error parsing user profile:', error);
  }
  
  return null;
}

// Get all users (DEMO_USERS + registered users from localStorage)
export function getAllUsers(): User[] {
  const demoUsers = Object.values(DEMO_USERS);
  
  // Get custom registered users from localStorage if they exist
  try {
    const registeredUsers = localStorage.getItem('registeredUsers');
    if (registeredUsers) {
      const parsed = JSON.parse(registeredUsers);
      return [...demoUsers, ...parsed];
    }
  } catch (error) {
    console.error('Error loading registered users:', error);
  }
  
  return demoUsers;
}

// Get user statistics for admin panel
export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  freeUsers: number;
  practitionerUsers: number;
  advancedUsers: number;
  adminUsers: number;
}

export function getUserStatistics(): UserStatistics {
  const users = getAllUsers();

  return {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.role === 'user').length,
    freeUsers: users.filter(u => u.planType === 'free').length,
    practitionerUsers: users.filter(u => u.planType === 'practitioner').length,
    advancedUsers: users.filter(u => u.planType === 'advanced' && u.role === 'user').length,
    adminUsers: users.filter(u => u.role === 'admin').length,
  };
}