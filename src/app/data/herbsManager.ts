import { Herb, herbsData } from './herbs';
import { supabase } from '../lib/supabase';

const CUSTOM_HERBS_KEY = 'tcm_custom_herbs';
const SYSTEM_HERBS_OVERRIDES_KEY = 'tcm_system_herbs_overrides';

// Known preparation prefixes in Traditional Chinese Medicine
const PREPARATION_PREFIXES = [
  'zhi',      // prepared/processed (炙)
  'chao',     // dry-fried (炒)
  'cu',       // vinegar-prepared (醋)
  'jiu',      // wine-prepared (酒)
  'mi',       // honey-prepared (蜜)
  'yan',      // salt-prepared (盐)
  'sheng',    // raw/unprepared (生)
  'shu',      // cooked (熟)
  'wei',      // calcined (煅)
  'dan',      // bland (淡)
];

/**
 * Normalizes herb names by removing preparation prefixes
 * Example: "Zhi Gan Cao" -> "Gan Cao"
 */
export function normalizeHerbName(name: string): string {
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();
  
  for (const prefix of PREPARATION_PREFIXES) {
    if (lower.startsWith(prefix + ' ')) {
      return trimmed.substring(prefix.length + 1).trim();
    }
  }
  
  return trimmed;
}

/**
 * Finds an herb by pinyin name, automatically normalizing preparation prefixes
 * Example: findHerbByName("Zhi Gan Cao") will find "Gan Cao"
 */
export function findHerbByName(name: string): Herb | undefined {
  const allHerbs = getAllHerbs();
  const normalizedSearch = normalizeHerbName(name).toLowerCase();
  
  // First try exact match
  let herb = allHerbs.find(h => h.pinyin_name.toLowerCase() === name.toLowerCase());
  
  // If not found, try normalized match
  if (!herb) {
    herb = allHerbs.find(h => h.pinyin_name.toLowerCase() === normalizedSearch);
  }
  
  return herb;
}

export function getCustomHerbs(): Herb[] {
  const stored = localStorage.getItem(CUSTOM_HERBS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function getSystemHerbsOverrides(): Record<string, Herb> {
  const stored = localStorage.getItem(SYSTEM_HERBS_OVERRIDES_KEY);
  return stored ? JSON.parse(stored) : {};
}

export function getAllHerbs(): Herb[] {
  const customHerbs = getCustomHerbs();
  const overrides = getSystemHerbsOverrides();
  
  // Apply overrides to system herbs
  const systemHerbs = herbsData.map(herb => 
    overrides[herb.herb_id] || herb
  );
  
  // Combine and deduplicate by herb_id
  // Custom herbs and overrides take precedence over system herbs
  const allHerbs = [...systemHerbs, ...customHerbs];
  const deduped = new Map<string, Herb>();
  
  // First add system herbs
  systemHerbs.forEach(herb => {
    deduped.set(herb.herb_id, herb);
  });
  
  // Then add custom herbs, which will override any system herbs with same ID
  customHerbs.forEach(herb => {
    deduped.set(herb.herb_id, herb);
  });
  
  return Array.from(deduped.values());
}

export async function addHerb(herb: Herb): Promise<void> {
  console.log('🌿 addHerb called with:', herb.pinyin_name);

  // Get current user session
  const { data: { session } } = await supabase.auth.getSession();

  console.log('🌿 Session user:', session?.user?.email || 'No session');

  if (session?.user) {
    console.log('🌿 Attempting to save to Supabase...');

    // Save to Supabase
    const { data, error } = await supabase
      .from('herbs')
      .insert({
        herb_id: herb.herb_id,
        pinyin_name: herb.pinyin_name,
        hanzi_name: herb.hanzi_name,
        english_name: herb.english_name,
        pharmaceutical_name: herb.pharmaceutical_name,
        alternate_names: herb.alternate_names,
        category: herb.category,
        subcategory: herb.subcategory,
        nature: herb.nature,
        flavor: herb.flavor,
        channels: herb.channels,
        dose: herb.dose,
        tcm_actions: herb.tcm_actions,
        clinical_manifestations: herb.clinical_manifestations,
        clinical_applications: herb.clinical_applications,
        pharmacological_effects: herb.pharmacological_effects,
        biological_mechanisms: herb.biological_mechanisms,
        clinical_studies_and_research: herb.clinical_studies_and_research,
        drug_interactions: herb.drug_interactions,
        herb_interactions: herb.herb_interactions,
        allergens: herb.allergens,
        cautions: herb.cautions,
        contraindications: herb.contraindications,
        toxicology: herb.toxicology,
        notes: herb.notes,
        herb_references: herb.references,
        is_system_item: false,
        user_id: session.user.id,
      })
      .select();

    if (error) {
      console.error('❌ Error saving herb to Supabase:', error);
    } else {
      console.log('✅ Herb saved to Supabase successfully:', data);
    }
  } else {
    console.log('⚠️ No Supabase session - saving only to localStorage');
  }

  // Save to localStorage
  const customHerbs = getCustomHerbs();
  customHerbs.push(herb);
  localStorage.setItem(CUSTOM_HERBS_KEY, JSON.stringify(customHerbs));
  console.log('✅ Herb saved to localStorage');
}

export async function updateHerb(herbId: string, updatedHerb: Herb): Promise<void> {
  console.log('🌿 updateHerb called with:', herbId);

  // Get current user session
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    console.log('🌿 Attempting to update in Supabase...');

    // Update in Supabase
    const { data, error } = await supabase
      .from('herbs')
      .update({
        pinyin_name: updatedHerb.pinyin_name,
        hanzi_name: updatedHerb.hanzi_name,
        english_name: updatedHerb.english_name,
        pharmaceutical_name: updatedHerb.pharmaceutical_name,
        alternate_names: updatedHerb.alternate_names,
        category: updatedHerb.category,
        subcategory: updatedHerb.subcategory,
        nature: updatedHerb.nature,
        flavor: updatedHerb.flavor,
        channels: updatedHerb.channels,
        dose: updatedHerb.dose,
        tcm_actions: updatedHerb.tcm_actions,
        clinical_manifestations: updatedHerb.clinical_manifestations,
        clinical_applications: updatedHerb.clinical_applications,
        pharmacological_effects: updatedHerb.pharmacological_effects,
        biological_mechanisms: updatedHerb.biological_mechanisms,
        clinical_studies_and_research: updatedHerb.clinical_studies_and_research,
        drug_interactions: updatedHerb.drug_interactions,
        herb_interactions: updatedHerb.herb_interactions,
        allergens: updatedHerb.allergens,
        cautions: updatedHerb.cautions,
        contraindications: updatedHerb.contraindications,
        toxicology: updatedHerb.toxicology,
        notes: updatedHerb.notes,
        herb_references: updatedHerb.references,
      })
      .eq('herb_id', herbId)
      .eq('user_id', session.user.id)
      .select();

    if (error) {
      console.error('❌ Error updating herb in Supabase:', error);
    } else {
      console.log('✅ Herb updated in Supabase successfully:', data);
    }
  }

  // Update in localStorage
  const customHerbs = getCustomHerbs();
  const customIndex = customHerbs.findIndex(h => h.herb_id === herbId);

  if (customIndex !== -1) {
    customHerbs[customIndex] = updatedHerb;
    localStorage.setItem(CUSTOM_HERBS_KEY, JSON.stringify(customHerbs));
    console.log('✅ Herb updated in localStorage');
  } else {
    const overrides = getSystemHerbsOverrides();
    overrides[herbId] = updatedHerb;
    localStorage.setItem(SYSTEM_HERBS_OVERRIDES_KEY, JSON.stringify(overrides));
    console.log('✅ Herb override saved in localStorage');
  }
}

export async function deleteCustomHerb(herbName: string): Promise<void> {
  console.log('🌿 deleteCustomHerb called with:', herbName);

  // Get current user session
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    console.log('🌿 Attempting to delete from Supabase...');

    // Delete from Supabase
    const { error } = await supabase
      .from('herbs')
      .delete()
      .eq('pinyin_name', herbName)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('❌ Error deleting herb from Supabase:', error);
    } else {
      console.log('✅ Herb deleted from Supabase successfully');
    }
  }

  // Delete from localStorage
  const customHerbs = getCustomHerbs();
  const filtered = customHerbs.filter(h => h.pinyin_name !== herbName);
  localStorage.setItem(CUSTOM_HERBS_KEY, JSON.stringify(filtered));
  console.log('✅ Herb deleted from localStorage');
}

export function isCustomHerb(herbName: string): boolean {
  const customHerbs = getCustomHerbs();
  return customHerbs.some(h => h.pinyin_name === herbName);
}