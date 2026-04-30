/**
 * Centralized Type Definitions
 * 
 * All TypeScript interfaces and types used across the application.
 * These types will remain the same when migrating to Supabase.
 */

// ============================================================================
// USER & AUTHENTICATION TYPES
// ============================================================================

export type UserRole = 'user' | 'admin';
export type PlanType = 'free' | 'pro' | 'clinic';

export interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  title?: string;
  country: string;
  onboardingCompleted: boolean;
  avatarColor?: string;
  avatarImage?: string | null;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  planType: PlanType;
  profile: UserProfile;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthSession {
  user: User;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

// ============================================================================
// HERB TYPES
// ============================================================================

export interface SubPattern {
  name: string;
  combination?: string[];
  formula_example?: string;
}

export interface HerbActionBranch {
  pattern: string;
  sub_patterns?: SubPattern[];
  combination?: string[];
  formula_example?: string;
}

export interface HerbAction {
  title: string;
  branches: HerbActionBranch[];
}

export interface ClinicalApplication {
  condition: string;
  pattern: string | null;
}

export interface DuiYao {
  pair: string[];
  functions: string[];
  notes: string;
}

export interface BioactivCompound {
  chemical_class: string;
  compounds: string[];
}

export interface BiologicalMechanism {
  system: string;
  target_action: string | string[];
}

export interface DetoxificationAgent {
  toxin_group: string;
  agents: string[];
}

export interface Herb {
  herb_id: string;
  pinyin_name: string;
  hanzi_name?: string;
  pharmaceutical_name?: string;
  english_name?: string;
  category?: string;
  subcategory?: string;
  nature?: string;
  flavor?: string[];
  channels?: string[];
  banned_countries?: string[];
  actions?: (string | HerbAction)[];
  indications?: string[];
  dui_yao?: DuiYao[];
  clinical_applications?: ClinicalApplication[];
  cautions?: string[];
  contraindications?: string[];
  dose?: string;
  toxicology?: string[];
  pregnancy_warning?: {
    icon: boolean;
    details: string[];
  };
  antagonisms?: string[];
  incompatibilities?: string[];
  pharmacological_effects?: string[];
  biological_mechanisms?: BiologicalMechanism[];
  bioactive_compounds?: string[] | BioactivCompound[];
  detoxification?: DetoxificationAgent[];
  clinical_studies_and_research?: string[];
  herb_drug_interactions?: string[];
  herb_herb_interactions?: string[];
  allergens?: string[];
  notes?: string[];
  references?: string[];
  // Metadata
  isSystemItem?: boolean;
  createdBy?: {
    userId: string;
    userName: string;
    userEmail: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// FORMULA TYPES
// ============================================================================

export interface FormulaComposition {
  herb_pinyin: string;
  pharmaceutical_name: string;
  dosage: string;
  role?: string;
  function_in_formula?: string;
}

export interface FormulaModification {
  pattern: string;
  add: string[];
  remove: string[];
}

export interface Formula {
  formula_id: string;
  pinyin_name: string;
  hanzi_name?: string;
  translated_name?: string;
  alternative_names?: string[];
  category?: string;
  subcategory?: string;
  source?: string;
  thermal_action?: string;
  composition?: FormulaComposition[];
  dosage?: string[];
  preparation?: string[];
  administration?: string[];
  tcm_actions?: string[];
  clinical_manifestations?: string[];
  clinical_applications?: ClinicalApplication[];
  modifications?: FormulaModification[];
  pharmacological_effects?: string[];
  biological_mechanisms?: BiologicalMechanism[];
  clinical_studies_and_research?: string[];
  drug_interactions?: string[];
  herb_interactions?: string[];
  allergens?: string[];
  cautions?: string[];
  contraindications?: string[];
  toxicology?: string[];
  notes?: string[];
  reference?: string[];
  // Metadata
  isSystemItem?: boolean;
  createdBy?: {
    userId: string;
    userName: string;
    userEmail: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// PRESCRIPTION TYPES
// ============================================================================

export interface PrescriptionComponent {
  type: 'herb' | 'formula';
  name: string;
  dosage: string;
  subComponents?: { name: string; dosage: string }[];
}

export interface PatientSafetyProfile {
  // General conditions
  pregnancy?: boolean;
  breastfeeding?: boolean;
  insomnia?: boolean;
  epilepsy?: boolean;
  bleeding_disorders?: boolean;
  liver_disease?: boolean;
  kidney_disease?: boolean;
  // Medications
  anticoagulants?: boolean;
  antihypertensives?: boolean;
  hypoglycemics?: boolean;
  immunosuppressants?: boolean;
  antidepressants?: boolean;
  antiplatelets?: boolean;
  beta_blockers?: boolean;
  diuretics?: boolean;
  corticosteroids?: boolean;
  sedatives?: boolean;
  // Allergies
  shellfish?: boolean;
  gluten?: boolean;
  nuts?: boolean;
  dairy?: boolean;
  soy?: boolean;
  asteraceae?: boolean;
  apiaceae?: boolean;
}

export interface Prescription {
  id: string;
  name: string;
  components: PrescriptionComponent[];
  comments: string;
  alertMode?: 'all' | 'filtered';
  patientSafetyProfile?: PatientSafetyProfile;
  safetyFilters?: any;
  createdAt: Date | string;
  createdBy?: {
    userId: string;
    userName: string;
    userEmail: string;
  };
}

// ============================================================================
// PLAN & SUBSCRIPTION TYPES
// ============================================================================

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
}

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

export interface FormulaDetailPermissions {
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
}

export interface Plan {
  id: string;
  name: string;
  code: PlanType;
  description: string;
  status: 'active' | 'hidden';
  stripePriceId: string;
  stripePriceIdMonthly?: string;
  stripePriceIdYearly?: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  isPopular: boolean;
  badgeIconSvg?: string;
  features: PlanFeatures;
  herbDetailPermissions?: HerbDetailPermissions;
  formulaDetailPermissions?: FormulaDetailPermissions;
  limits: {
    monthlyFormulas: number | null;
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
    customFeatures?: string[];
  };
  lastUpdated: string;
  safetyEngineMode?: 'disabled' | 'basic' | 'advanced';
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  userId: string;
  subscriptionId?: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
  stripeInvoiceId?: string;
  createdAt: string;
}

// ============================================================================
// PLATFORM SETTINGS TYPES
// ============================================================================

export interface PlatformSettings {
  branding: {
    platformName: string;
    logo?: string;
    favicon?: string;
    primaryColor?: string;
  };
  features: {
    allowUserRegistration: boolean;
    requireEmailVerification: boolean;
    enablePublicCatalog: boolean;
  };
  email: {
    fromName: string;
    fromEmail: string;
    smtpConfigured: boolean;
  };
  analytics: {
    enabled: boolean;
    googleAnalyticsId?: string;
  };
  legal: {
    privacyPolicyUrl?: string;
    termsOfServiceUrl?: string;
  };
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  category?: string[];
  subcategory?: string[];
  nature?: string[];
  flavor?: string[];
  channels?: string[];
  search?: string;
  [key: string]: any;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  status: LoadingState;
}

export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt'>>;
