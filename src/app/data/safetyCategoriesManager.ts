import { safetyCategoriesService } from '../services/safetyCategoriesService';

export interface SafetyCategory {
  id: string;
  displayName: string;
  group: 'conditions' | 'medications' | 'allergies' | 'tcm_risk_patterns';
  active: boolean;
  createdAt: Date;
  relatedTerms?: string[]; // Optional array of related terms for more specific matching
}

const STORAGE_KEY = 'tcm_safety_categories';

// Get all active safety categories (sync version - uses localStorage cache)
export function getActiveSafetyCategories(): SafetyCategory[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      // Initialize with defaults if not found
      initializeDefaultCategories();
      return getActiveSafetyCategories();
    }

    const parsed = JSON.parse(stored);
    return parsed
      .map((c: any) => ({
        ...c,
        createdAt: new Date(c.createdAt)
      }))
      .filter((c: SafetyCategory) => c.active);
  } catch (error) {
    console.error('Error loading safety categories:', error);
    return [];
  }
}

// Get all safety categories from Supabase (async version)
export async function getActiveSafetyCategoriesAsync(): Promise<SafetyCategory[]> {
  const categories = await safetyCategoriesService.loadFromSupabase();
  return categories.filter(c => c.active);
}

// Get categories by group
export function getCategoriesByGroup(group: SafetyCategory['group']): SafetyCategory[] {
  return getActiveSafetyCategories().filter(c => c.group === group);
}

// Initialize default categories (now uses service)
export function initializeDefaultCategories() {
  // Initialize async in background
  safetyCategoriesService.initializeDefaults();

  // Also set defaults in localStorage immediately for sync access
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

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCategories));
  } catch (error) {
    console.error('Error initializing default categories:', error);
  }
}

// Create dynamic patient safety profile structure
export function createEmptySafetyProfile(): Record<string, boolean> {
  const categories = getActiveSafetyCategories();
  const profile: Record<string, boolean> = {};

  categories.forEach(category => {
    // Use displayName as key (replacing spaces with underscores and lowercasing)
    const key = category.displayName.toLowerCase().replace(/\s+/g, '_');
    profile[key] = false;
  });

  return profile;
}

// Get category key from display name
export function getCategoryKey(displayName: string): string {
  return displayName.toLowerCase().replace(/\s+/g, '_');
}

// Get display name from category key
export function getDisplayName(key: string): string {
  const categories = getActiveSafetyCategories();
  const categoryKey = key.toLowerCase().replace(/\s+/g, '_');
  const found = categories.find(c => getCategoryKey(c.displayName) === categoryKey);
  return found ? found.displayName : key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Save categories (now saves to Supabase)
export async function saveSafetyCategories(categories: SafetyCategory[]): Promise<boolean> {
  return await safetyCategoriesService.saveToSupabase(categories);
}
