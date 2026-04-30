import { supabase } from '../lib/supabase';

export interface SafetyCategoryDB {
  id: string;
  category_id: string;
  display_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SafetyCategory {
  id: string;
  displayName: string;
  group: 'conditions' | 'medications' | 'allergies' | 'tcm_risk_patterns';
  active: boolean;
  createdAt: Date;
  relatedTerms?: string[];
}

const STORAGE_KEY = 'tcm_safety_categories';

// Helper: Convert DB format to app format
function convertFromDB(dbCategory: SafetyCategoryDB): SafetyCategory {
  // Infer group from category_id or display_name
  let group: SafetyCategory['group'] = 'conditions';
  const categoryId = dbCategory.category_id.toLowerCase();

  if (categoryId.includes('medication') || categoryId.includes('anticoagulant') || categoryId.includes('antihypertensive')) {
    group = 'medications';
  } else if (categoryId.includes('allerg') || categoryId.includes('shellfish') || categoryId.includes('gluten')) {
    group = 'allergies';
  } else if (categoryId.includes('tcm') || categoryId.includes('pattern')) {
    group = 'tcm_risk_patterns';
  }

  return {
    id: dbCategory.id,
    displayName: dbCategory.display_name,
    group,
    active: dbCategory.is_active,
    createdAt: new Date(dbCategory.created_at),
  };
}

// Helper: Convert app format to DB format
function convertToDB(category: SafetyCategory): Partial<SafetyCategoryDB> {
  const categoryId = category.displayName.toLowerCase().replace(/\s+/g, '_');

  return {
    category_id: categoryId,
    display_name: category.displayName,
    is_active: category.active,
  };
}

export const safetyCategoriesService = {
  // Load from Supabase
  async loadFromSupabase(): Promise<SafetyCategory[]> {
    console.log('📋 Safety Categories - Loading from Supabase...');

    try {
      const { data, error } = await supabase
        .from('admin_safety_categories')
        .select('*')
        .order('display_name', { ascending: true });

      if (error) {
        console.error('❌ Safety Categories - Supabase error:', error);
        throw error;
      }

      if (data && data.length > 0) {
        console.log('✅ Safety Categories - Loaded from Supabase:', data.length, 'categories');
        const categories = data.map(convertFromDB);

        // Save to localStorage for offline access
        localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));

        return categories;
      }

      console.log('⚠️ Safety Categories - No categories in Supabase');
      return [];
    } catch (error) {
      console.error('❌ Safety Categories - Error loading from Supabase:', error);

      // Fallback to localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        console.log('📦 Safety Categories - Loaded from localStorage');
        return JSON.parse(stored).map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt)
        }));
      }

      return [];
    }
  },

  // Save to Supabase
  async saveToSupabase(categories: SafetyCategory[]): Promise<boolean> {
    console.log('💾 Safety Categories - Saving to Supabase...');

    try {
      // Delete all existing categories
      const { error: deleteError } = await supabase
        .from('admin_safety_categories')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (deleteError) {
        console.error('❌ Safety Categories - Error deleting old categories:', deleteError);
      }

      // Insert all categories
      const dbCategories = categories.map(convertToDB);

      const { error: insertError } = await supabase
        .from('admin_safety_categories')
        .insert(dbCategories);

      if (insertError) {
        console.error('❌ Safety Categories - Error inserting categories:', insertError);
        throw insertError;
      }

      console.log('✅ Safety Categories - Saved to Supabase successfully');

      // Also save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));

      return true;
    } catch (error) {
      console.error('❌ Safety Categories - Error saving to Supabase:', error);

      // Fallback: save to localStorage only
      localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
      return false;
    }
  },

  // Initialize default categories
  async initializeDefaults(): Promise<void> {
    console.log('📋 Safety Categories - Initializing defaults...');

    const defaultCategories: SafetyCategory[] = [
      // General Conditions
      { id: '1', displayName: 'Pregnancy', group: 'conditions', active: true, createdAt: new Date() },
      { id: '2', displayName: 'Breastfeeding', group: 'conditions', active: true, createdAt: new Date() },
      { id: '3', displayName: 'Insomnia', group: 'conditions', active: true, createdAt: new Date() },
      { id: '4', displayName: 'Epilepsy', group: 'conditions', active: true, createdAt: new Date() },
      { id: '5', displayName: 'Bleeding Disorders', group: 'conditions', active: true, createdAt: new Date() },
      { id: '6', displayName: 'Liver Disease', group: 'conditions', active: true, createdAt: new Date() },
      { id: '7', displayName: 'Kidney Disease', group: 'conditions', active: true, createdAt: new Date() },

      // Medications
      { id: '8', displayName: 'Anticoagulants', group: 'medications', active: true, createdAt: new Date() },
      { id: '9', displayName: 'Antihypertensives', group: 'medications', active: true, createdAt: new Date() },
      { id: '10', displayName: 'Hypoglycemics', group: 'medications', active: true, createdAt: new Date() },
      { id: '11', displayName: 'Immunosuppressants', group: 'medications', active: true, createdAt: new Date() },
      { id: '12', displayName: 'Antidepressants', group: 'medications', active: true, createdAt: new Date() },
      { id: '13', displayName: 'Antiplatelets', group: 'medications', active: true, createdAt: new Date() },
      { id: '14', displayName: 'Beta Blockers', group: 'medications', active: true, createdAt: new Date() },
      { id: '15', displayName: 'Diuretics', group: 'medications', active: true, createdAt: new Date() },
      { id: '16', displayName: 'Corticosteroids', group: 'medications', active: true, createdAt: new Date() },
      { id: '17', displayName: 'Sedatives', group: 'medications', active: true, createdAt: new Date() },

      // Allergies
      { id: '18', displayName: 'Shellfish', group: 'allergies', active: true, createdAt: new Date() },
      { id: '19', displayName: 'Gluten', group: 'allergies', active: true, createdAt: new Date() },
      { id: '20', displayName: 'Nuts', group: 'allergies', active: true, createdAt: new Date() },
      { id: '21', displayName: 'Dairy', group: 'allergies', active: true, createdAt: new Date() },
      { id: '22', displayName: 'Soy', group: 'allergies', active: true, createdAt: new Date() },
      { id: '23', displayName: 'Asteraceae Family', group: 'allergies', active: true, createdAt: new Date() },
      { id: '24', displayName: 'Apiaceae Family', group: 'allergies', active: true, createdAt: new Date() },
    ];

    await this.saveToSupabase(defaultCategories);
  },
};
