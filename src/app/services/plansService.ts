import { supabase } from '../lib/supabase';
import type { PlanFeatures, PlanType } from '../data/usersManager';

export interface Plan {
  id: string;
  plan_type: PlanType;
  name: string;
  description?: string;
  features: PlanFeatures;
  monthly_price?: number;
  yearly_price?: number;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Get all active plans from Supabase
 */
export async function getActivePlans(): Promise<Plan[]> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching plans:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all plans (for admin)
 */
export async function getAllPlans(): Promise<Plan[]> {
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching all plans:', error);
    return [];
  }

  return data || [];
}

/**
 * Get features for a specific plan type
 */
export async function getPlanFeatures(planType: PlanType): Promise<PlanFeatures> {
  // Default features (fallback)
  const defaultFeatures: PlanFeatures = {
    herbLibraryAccess: 'none',
    formulaLibraryAccess: 'none',
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
    safetyEngineMode: 'disabled',
    monthlyFormulas: null,
  };

  try {
    const { data, error } = await supabase
      .from('plans')
      .select('features')
      .eq('plan_type', planType)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error(`Error fetching features for plan ${planType}:`, error);
      return defaultFeatures;
    }

    return data?.features || defaultFeatures;
  } catch (err) {
    console.error(`Exception fetching features for plan ${planType}:`, err);
    return defaultFeatures;
  }
}

/**
 * Update plan features (Admin only)
 */
export async function updatePlanFeatures(
  planType: PlanType,
  features: PlanFeatures
): Promise<boolean> {
  const { error } = await supabase
    .from('plans')
    .update({ features })
    .eq('plan_type', planType);

  if (error) {
    console.error(`Error updating plan ${planType}:`, error);
    return false;
  }

  return true;
}

/**
 * Update entire plan (Admin only)
 */
export async function updatePlan(
  planType: PlanType,
  updates: Partial<Omit<Plan, 'id' | 'plan_type' | 'created_at' | 'updated_at'>>
): Promise<boolean> {
  const { error } = await supabase
    .from('plans')
    .update(updates)
    .eq('plan_type', planType);

  if (error) {
    console.error(`Error updating plan ${planType}:`, error);
    return false;
  }

  return true;
}

/**
 * Create new plan (Admin only)
 */
export async function createPlan(plan: Omit<Plan, 'id' | 'created_at' | 'updated_at'>): Promise<Plan | null> {
  const { data, error } = await supabase
    .from('plans')
    .insert([plan])
    .select()
    .single();

  if (error) {
    console.error('Error creating plan:', error);
    return null;
  }

  return data;
}
