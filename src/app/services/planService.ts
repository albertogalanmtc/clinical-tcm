import { supabase } from '../lib/supabase';

// Plan interface
export interface Plan {
  id: string;
  name: string;
  code: 'free' | 'practitioner' | 'advanced';
  description: string;
  status: 'active' | 'hidden';
  stripePriceId: string; // Deprecated: use stripePriceIdMonthly instead
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
  monthlyPrice?: number; // Price in dollars per month
  yearlyPrice?: number; // Price in dollars per year
  isPopular: boolean;
  badgeIconSvg?: string; // SVG content for badge icon (optional)
  features: {
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
    // Dashboard cards visibility
    dashboardNews: boolean;
    dashboardCommunity: boolean;
  };
  herbDetailPermissions?: {
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
  };
  formulaDetailPermissions?: {
    properties: boolean;
    clinicalUse: {
      actions: boolean;
      indications: boolean;
      modifications: boolean;
    };
    safety: {
      contraindications: boolean;
      cautions: boolean;
    };
    research: {
      pharmacologicalEffects: boolean;
      biologicalMechanisms: boolean;
      clinicalStudies: boolean;
    };
    foundIn: boolean;
    referencesNotes: {
      references: boolean;
      notes: boolean;
    };
  };
  limits: {
    monthlyFormulas: number | null; // null = unlimited
    maxPrescriptions?: number;
  };
  offer?: {
    enabled: boolean;
    originalPrice: number;
    discountedPrice: number;
    label?: string;
    expirationNote?: string;
  };
  membershipDisplay?: {
    customFeatures?: string[]; // Custom features list for SelectMembership page
  };
  lastUpdated: string;
  safetyEngineMode?: 'disabled' | 'basic' | 'advanced';
}

// Default plans configuration
const defaultPlans: Plan[] = [
  {
    id: '1',
    name: 'Free',
    code: 'free',
    description: 'Basic access to TCM resources',
    status: 'active',
    stripePriceId: '',
    stripePriceIdMonthly: '',
    stripePriceIdYearly: '',
    monthlyPrice: 0,
    yearlyPrice: 0,
    isPopular: false,
    features: {
      herbLibraryAccess: 'sample',
      formulaLibraryAccess: 'sample',
      builder: false,
      prescriptionLibrary: false,
      statistics: false,
      herbPropertyFilters: false,
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
      dashboardNews: true,
      dashboardCommunity: true,
    },
    limits: {
      monthlyFormulas: 0,
    },
    safetyEngineMode: 'disabled',
    lastUpdated: '2025-01-15',
  },
  {
    id: '2',
    name: 'Practitioner',
    code: 'practitioner',
    description: 'Full access for individual practitioners',
    status: 'active',
    stripePriceId: 'price_1234567890', // Deprecated
    stripePriceIdMonthly: 'price_practitioner_monthly',
    stripePriceIdYearly: 'price_practitioner_yearly',
    monthlyPrice: 9,
    yearlyPrice: 90,
    isPopular: true,
    features: {
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
      customContent: false,
      dashboardNews: true,
      dashboardCommunity: true,
    },
    limits: {
      monthlyFormulas: 100,
    },
    offer: {
      enabled: true,
      originalPrice: 19,
      discountedPrice: 9,
      label: 'Launch Offer',
      expirationNote: 'Limited time offer',
    },
    safetyEngineMode: 'basic',
    lastUpdated: '2025-01-20',
  },
  {
    id: '3',
    name: 'Advanced',
    code: 'advanced',
    description: 'Advanced features for professionals',
    status: 'active',
    stripePriceId: 'price_0987654321', // Deprecated
    stripePriceIdMonthly: 'price_advanced_monthly',
    stripePriceIdYearly: 'price_advanced_yearly',
    monthlyPrice: 19,
    yearlyPrice: 190,
    isPopular: false,
    features: {
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
      customContent: false,
      dashboardNews: true,
      dashboardCommunity: true,
    },
    limits: {
      monthlyFormulas: null, // unlimited
    },
    offer: {
      enabled: true,
      originalPrice: 29,
      discountedPrice: 19,
      label: 'Launch Offer',
      expirationNote: 'Limited time offer',
    },
    safetyEngineMode: 'advanced',
    lastUpdated: '2025-01-18',
  },
];

const STORAGE_KEY = 'tcm_plans_config';

// Helper function to convert Supabase plan to Plan interface
function convertSupabasePlanToPlan(dbPlan: any): Plan {
  return {
    id: dbPlan.id,
    name: dbPlan.name,
    code: dbPlan.code,
    description: dbPlan.description || '',
    status: dbPlan.status || 'active',
    stripePriceId: dbPlan.stripe_price_id || '',
    stripePriceIdMonthly: dbPlan.stripe_price_id_monthly,
    stripePriceIdYearly: dbPlan.stripe_price_id_yearly,
    monthlyPrice: dbPlan.monthly_price ? parseFloat(dbPlan.monthly_price) : 0,
    yearlyPrice: dbPlan.yearly_price ? parseFloat(dbPlan.yearly_price) : 0,
    isPopular: dbPlan.is_popular || false,
    badgeIconSvg: dbPlan.badge_icon_svg,
    features: dbPlan.features || {},
    herbDetailPermissions: dbPlan.herb_detail_permissions,
    formulaDetailPermissions: dbPlan.formula_detail_permissions,
    limits: dbPlan.limits || { monthlyFormulas: 0 },
    offer: dbPlan.offer,
    membershipDisplay: dbPlan.membership_display,
    safetyEngineMode: dbPlan.safety_engine_mode || 'disabled',
    lastUpdated: dbPlan.last_updated || new Date().toISOString(),
  };
}

// Helper function to convert Plan to Supabase format
function convertPlanToSupabase(plan: Plan): any {
  return {
    id: plan.id,
    code: plan.code,
    name: plan.name,
    description: plan.description,
    status: plan.status,
    stripe_price_id: plan.stripePriceId,
    stripe_price_id_monthly: plan.stripePriceIdMonthly,
    stripe_price_id_yearly: plan.stripePriceIdYearly,
    monthly_price: plan.monthlyPrice,
    yearly_price: plan.yearlyPrice,
    is_popular: plan.isPopular,
    badge_icon_svg: plan.badgeIconSvg,
    features: plan.features,
    herb_detail_permissions: plan.herbDetailPermissions,
    formula_detail_permissions: plan.formulaDetailPermissions,
    limits: plan.limits,
    offer: plan.offer,
    membership_display: plan.membershipDisplay,
    safety_engine_mode: plan.safetyEngineMode,
    last_updated: plan.lastUpdated,
  };
}

// Plan Service
export const planService = {
  // Get all plans (from Supabase, localStorage fallback, or default)
  async getPlans(): Promise<Plan[]> {
    try {
      console.log('📦 Plans - Loading from Supabase...');

      // Try loading from Supabase first
      const { data, error } = await supabase
        .from('admin_plans')
        .select('*')
        .order('id', { ascending: true });

      if (error) {
        console.error('❌ Plans - Supabase error:', error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log('✅ Plans - Loaded from Supabase:', data.length, 'plans');
        const plans = data.map(convertSupabasePlanToPlan);

        // Also save to localStorage for offline access
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));

        return plans;
      }

      console.log('⚠️ Plans - No plans in Supabase, trying localStorage...');
    } catch (error) {
      console.error('❌ Plans - Error loading from Supabase:', error);
      // Continue to localStorage fallback
    }

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        console.log('📦 Plans - Loaded from localStorage');
        const plans = JSON.parse(stored);
        // Migrate old plans to add missing fields
        const migratedPlans = plans.map((plan: Plan) => {
          // Handle migration of referencesNotes from boolean to object
          let referencesNotesValue;
          if (plan.herbDetailPermissions?.referencesNotes) {
            if (typeof plan.herbDetailPermissions.referencesNotes === 'boolean') {
              // Migrate from old boolean format to new object format
              const boolValue = plan.herbDetailPermissions.referencesNotes;
              referencesNotesValue = {
                references: boolValue,
                notes: boolValue,
              };
            } else {
              // Already in new format
              referencesNotesValue = plan.herbDetailPermissions.referencesNotes;
            }
          } else {
            // Default value
            referencesNotesValue = {
              references: plan.code !== 'free',
              notes: plan.code !== 'free',
            };
          }

          return {
            ...plan,
            features: {
              ...plan.features,
              // Add missing fields with defaults based on plan code
              pharmacologicalEffectsFilter: plan.features.pharmacologicalEffectsFilter ?? (plan.code === 'free' ? false : true),
              biologicalMechanismsFilter: plan.features.biologicalMechanismsFilter ?? (plan.code === 'free' ? false : true),
              bioactiveCompoundsFilter: plan.features.bioactiveCompoundsFilter ?? (plan.code === 'free' ? false : true),
              // Migrate old patientSafetyProfile to new subsections
              generalConditions: plan.features.generalConditions ?? (plan.features as any).patientSafetyProfile ?? (plan.code === 'free' ? false : true),
              medications: plan.features.medications ?? (plan.features as any).patientSafetyProfile ?? (plan.code === 'free' ? false : true),
              allergies: plan.features.allergies ?? (plan.features as any).patientSafetyProfile ?? (plan.code === 'free' ? false : true),
              tcmRiskPatterns: plan.features.tcmRiskPatterns ?? (plan.features as any).patientSafetyProfile ?? (plan.code === 'free' ? false : true),
            },
            // Add safety engine mode if missing
            safetyEngineMode: plan.safetyEngineMode ??
              (plan.code === 'free' ? 'disabled' : plan.code === 'practitioner' ? 'basic' : 'advanced'),
            // Add default herb detail permissions if missing
            herbDetailPermissions: plan.herbDetailPermissions ? {
              ...plan.herbDetailPermissions,
              properties: plan.herbDetailPermissions.properties ?? true,
              clinicalUse: plan.herbDetailPermissions.clinicalUse ?? {
                actions: true,
                indications: true,
                duiYao: plan.code !== 'free',
                clinicalApplications: true,
              },
              safety: plan.herbDetailPermissions.safety ?? {
                contraindications: true,
                cautions: true,
                drugInteractions: plan.code !== 'free',
                herbInteractions: plan.code !== 'free',
                allergens: plan.code !== 'free',
                antagonisms: plan.code !== 'free',
                incompatibilities: plan.code !== 'free',
              },
              research: plan.herbDetailPermissions.research ?? {
                pharmacologicalEffects: plan.code !== 'free',
                biologicalMechanisms: plan.code !== 'free',
                clinicalStudies: plan.code !== 'free',
              },
              foundIn: plan.herbDetailPermissions.foundIn ?? (plan.code !== 'free'),
              referencesNotes: referencesNotesValue,
            } : {
              properties: true,
              clinicalUse: {
                actions: true,
                indications: true,
                duiYao: plan.code !== 'free',
                clinicalApplications: true,
              },
              safety: {
                contraindications: true,
                cautions: true,
                drugInteractions: plan.code !== 'free',
                herbInteractions: plan.code !== 'free',
                allergens: plan.code !== 'free',
                antagonisms: plan.code !== 'free',
                incompatibilities: plan.code !== 'free',
              },
              research: {
                pharmacologicalEffects: plan.code !== 'free',
                biologicalMechanisms: plan.code !== 'free',
                clinicalStudies: plan.code !== 'free',
              },
              foundIn: plan.code !== 'free',
              referencesNotes: referencesNotesValue,
            }
          };
        });
        // Only save if there were actual changes (check if migration added any fields)
        const hasChanges = migratedPlans.some((plan, index) => {
          const original = plans[index];
          return JSON.stringify(plan) !== JSON.stringify(original);
        });
        if (hasChanges) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedPlans));
          // Don't dispatch event here to avoid infinite loops
        }
        return migratedPlans;
      }
    } catch (error) {
      console.error('❌ Plans - Error loading from localStorage:', error);
    }

    console.log('📦 Plans - Using defaults');
    return defaultPlans;
  },

  // Save plans to Supabase and localStorage
  async savePlans(plans: Plan[]): Promise<boolean> {
    console.log('💾 Plans - Saving to Supabase...');

    try {
      // Save to Supabase (upsert each plan)
      for (const plan of plans) {
        const supabasePlan = convertPlanToSupabase(plan);

        const { error } = await supabase
          .from('admin_plans')
          .upsert(supabasePlan, {
            onConflict: 'code'
          });

        if (error) {
          console.error('❌ Plans - Error saving to Supabase:', error);
          throw error;
        }
      }

      console.log('✅ Plans - Saved to Supabase successfully');

      // Also save to localStorage for offline access
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));

      // Dispatch custom event to notify components that plans have been updated
      window.dispatchEvent(new Event('plansUpdated'));

      return true;
    } catch (error) {
      console.error('❌ Plans - Error saving to Supabase:', error);

      // Fallback: save to localStorage only
      console.log('⚠️ Plans - Saving to localStorage only (fallback)');
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
        window.dispatchEvent(new Event('plansUpdated'));
        return false;
      } catch (localError) {
        console.error('❌ Plans - Error saving to localStorage:', localError);
        return false;
      }
    }
  },

  // Get a specific plan by code
  async getPlanByCode(code: 'free' | 'practitioner' | 'advanced'): Promise<Plan | undefined> {
    const plans = await this.getPlans();
    return plans.find(p => p.code === code);
  },

  // Get plan name by code (for display purposes)
  async getPlanName(code: 'free' | 'practitioner' | 'advanced'): Promise<string> {
    const plan = await this.getPlanByCode(code);
    return plan?.name || code.charAt(0).toUpperCase() + code.slice(1);
  },

  // Check if a plan has a specific feature
  async hasFeature(planCode: 'free' | 'practitioner' | 'advanced', featureName: keyof Plan['features']): Promise<boolean> {
    const plan = await this.getPlanByCode(planCode);
    if (!plan) return false;

    const featureValue = plan.features[featureName];

    // Handle string values (e.g., 'none', 'sample', 'full')
    if (typeof featureValue === 'string') {
      return featureValue !== 'none';
    }

    // Handle boolean values
    return Boolean(featureValue);
  },

  // Get library access level
  async getLibraryAccess(planCode: 'free' | 'practitioner' | 'advanced', libraryType: 'herb' | 'formula'): Promise<'none' | 'sample' | 'full'> {
    const plan = await this.getPlanByCode(planCode);
    if (!plan) return 'none';

    if (libraryType === 'herb') {
      return plan.features.herbLibraryAccess;
    } else {
      return plan.features.formulaLibraryAccess;
    }
  },

  // Get monthly formula limit
  async getMonthlyLimit(planCode: 'free' | 'practitioner' | 'advanced'): Promise<number | null> {
    const plan = await this.getPlanByCode(planCode);
    return plan?.limits.monthlyFormulas ?? 0;
  },

  // Reset to default plans
  async resetToDefaults(): Promise<boolean> {
    return this.savePlans(defaultPlans);
  },

  // Get invoices (mock data for now, will be replaced with Stripe API)
  getInvoices() {
    // TODO: Replace with actual Stripe API call
    return [
      {
        id: 'INV-2026-003',
        date: 'Feb 12, 2026',
        description: 'Practitioner Plan - Monthly',
        amount: 9,
        status: 'paid' as const,
        invoiceUrl: '#', // Will be Stripe invoice URL
      },
      {
        id: 'INV-2026-002',
        date: 'Jan 12, 2026',
        description: 'Practitioner Plan - Monthly',
        amount: 9,
        status: 'paid' as const,
        invoiceUrl: '#',
      },
      {
        id: 'INV-2026-001',
        date: 'Dec 12, 2025',
        description: 'Practitioner Plan - Monthly',
        amount: 9,
        status: 'paid' as const,
        invoiceUrl: '#',
      },
    ];
  },

  // Check herb detail permission
  async canViewHerbSection(planCode: 'free' | 'practitioner' | 'advanced', section: keyof NonNullable<Plan['herbDetailPermissions']>): Promise<boolean> {
    const plan = await this.getPlanByCode(planCode);
    if (!plan || !plan.herbDetailPermissions) return true; // Default to true if no permissions defined

    const permission = plan.herbDetailPermissions[section];
    if (typeof permission === 'boolean') {
      return permission;
    }
    return true; // For nested objects, return true (subsections will be checked individually)
  },

  // Check herb detail subsection permission
  async canViewHerbSubsection(
    planCode: 'free' | 'practitioner' | 'advanced',
    section: 'clinicalUse' | 'safety' | 'research',
    subsection: string
  ): Promise<boolean> {
    const plan = await this.getPlanByCode(planCode);
    if (!plan || !plan.herbDetailPermissions) return true;

    const sectionPerms = plan.herbDetailPermissions[section];
    if (typeof sectionPerms === 'object' && subsection in sectionPerms) {
      return (sectionPerms as any)[subsection] !== false;
    }
    return true;
  }
};