import { Formula, formulasData } from './formulas';
import { supabase } from '../lib/supabase';

const CUSTOM_FORMULAS_KEY = 'tcm_custom_formulas';
const SYSTEM_FORMULAS_OVERRIDES_KEY = 'tcm_system_formulas_overrides';

// Migration function to fix old formula field names
function migrateOldFormula(oldFormula: any): Formula {
  // Migrate modifications from old format to new format
  let migratedModifications = oldFormula.modifications || [];
  if (migratedModifications.length > 0) {
    migratedModifications = migratedModifications.map((mod: any) => {
      // If it's a string, convert to new format
      if (typeof mod === 'string') {
        return { pattern: mod, add: [], remove: [] };
      }
      // If it has old fields (explanation, add_herbs, remove_herbs), convert to new format
      if (mod.explanation || mod.add_herbs || mod.remove_herbs) {
        return {
          pattern: mod.explanation || '',
          add: mod.add_herbs || [],
          remove: mod.remove_herbs || []
        };
      }
      // Already in new format
      return mod;
    });
  }

  // Migrate old field names to new ones
  const migratedFormula: Formula = {
    formula_id: oldFormula.formula_id || `F${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    pinyin_name: oldFormula.pinyin_name || oldFormula.formula || '',
    hanzi_name: oldFormula.hanzi_name || oldFormula.literal_name || '',
    translated_name: oldFormula.translated_name || oldFormula.pharmaceutical_name || '',
    alternative_names: oldFormula.alternative_names || [],
    category: oldFormula.category || '',
    subcategory: oldFormula.subcategory || '',
    source: oldFormula.source || '',
    composition: oldFormula.composition || [],
    dosage: oldFormula.dosage || [],
    preparation: oldFormula.preparation || [],
    administration: oldFormula.administration || [],
    tcm_actions: oldFormula.tcm_actions || [],
    clinical_manifestations: oldFormula.clinical_manifestations || [],
    clinical_applications: oldFormula.clinical_applications || [],
    modifications: migratedModifications,
    pharmacological_effects: oldFormula.pharmacological_effects || [],
    biological_mechanisms: oldFormula.biological_mechanisms || [],
    clinical_studies_and_research: oldFormula.clinical_studies_and_research || [],
    drug_interactions: oldFormula.drug_interactions || [],
    herb_interactions: oldFormula.herb_interactions || [],
    allergens: oldFormula.allergens || [],
    cautions: oldFormula.cautions || [],
    contraindications: oldFormula.contraindications || [],
    toxicology: oldFormula.toxicology || [],
    notes: oldFormula.notes || oldFormula.author_notes || [],
    reference: oldFormula.reference || []
  };

  return migratedFormula;
}

export function getCustomFormulas(): Formula[] {
  const stored = localStorage.getItem(CUSTOM_FORMULAS_KEY);
  if (!stored) return [];

  try {
    const formulas = JSON.parse(stored);
    // Migrate all formulas
    const migratedFormulas = formulas.map(migrateOldFormula);

    // Always save migrated formulas back to localStorage to ensure consistency
    localStorage.setItem(CUSTOM_FORMULAS_KEY, JSON.stringify(migratedFormulas));

    return migratedFormulas;
  } catch {
    return [];
  }
}

export function getSystemFormulasOverrides(): Record<string, Formula> {
  const stored = localStorage.getItem(SYSTEM_FORMULAS_OVERRIDES_KEY);
  return stored ? JSON.parse(stored) : {};
}

export function getAllFormulas(): Formula[] {
  const customFormulas = getCustomFormulas();
  const overrides = getSystemFormulasOverrides();

  // Apply overrides to system formulas
  const systemFormulas = formulasData.map(formula =>
    overrides[formula.formula_id] || formula
  );

  // Create a set of system formula IDs for duplicate detection
  const systemFormulaIds = new Set(formulasData.map(f => f.formula_id));

  // Filter out custom formulas with IDs that conflict with system formulas
  const validCustomFormulas = customFormulas.filter(customFormula => {
    return !systemFormulaIds.has(customFormula.formula_id);
  });

  // Also remove duplicate IDs within custom formulas themselves
  const seenCustomIds = new Set<string>();
  const uniqueCustomFormulas = validCustomFormulas.filter(formula => {
    if (seenCustomIds.has(formula.formula_id)) {
      // Silently skip duplicates - they'll be removed from localStorage
      return false;
    }
    seenCustomIds.add(formula.formula_id);
    return true;
  });

  // If we filtered out any duplicates, update localStorage
  if (uniqueCustomFormulas.length !== customFormulas.length) {
    localStorage.setItem(CUSTOM_FORMULAS_KEY, JSON.stringify(uniqueCustomFormulas));
  }

  return [...systemFormulas, ...uniqueCustomFormulas];
}

export async function addFormula(formula: Formula): Promise<void> {
  console.log('💊 addFormula called with:', formula.pinyin_name);

  // Get current user session
  const { data: { session } } = await supabase.auth.getSession();

  console.log('💊 Session user:', session?.user?.email || 'No session');

  if (session?.user) {
    console.log('💊 Attempting to save to Supabase...');

    // Save to Supabase
    const { data, error } = await supabase
      .from('formulas')
      .insert({
        formula_id: formula.formula_id,
        pinyin_name: formula.pinyin_name,
        hanzi_name: formula.hanzi_name,
        translated_name: formula.translated_name,
        alternative_names: formula.alternative_names,
        category: formula.category,
        subcategory: formula.subcategory,
        source: formula.source,
        composition: formula.composition,
        dosage: formula.dosage,
        preparation: formula.preparation,
        administration: formula.administration,
        tcm_actions: formula.tcm_actions,
        clinical_manifestations: formula.clinical_manifestations,
        clinical_applications: formula.clinical_applications,
        modifications: formula.modifications,
        pharmacological_effects: formula.pharmacological_effects,
        biological_mechanisms: formula.biological_mechanisms,
        clinical_studies_and_research: formula.clinical_studies_and_research,
        drug_interactions: formula.drug_interactions,
        herb_interactions: formula.herb_interactions,
        allergens: formula.allergens,
        cautions: formula.cautions,
        contraindications: formula.contraindications,
        toxicology: formula.toxicology,
        notes: formula.notes,
        formula_references: formula.reference,
        is_system_item: false,
        user_id: session.user.id,
      })
      .select();

    if (error) {
      console.error('❌ Error saving formula to Supabase:', error);
    } else {
      console.log('✅ Formula saved to Supabase successfully:', data);
    }
  } else {
    console.log('⚠️ No Supabase session - saving only to localStorage');
  }

  // Save to localStorage
  const customFormulas = getCustomFormulas();
  customFormulas.push(formula);
  localStorage.setItem(CUSTOM_FORMULAS_KEY, JSON.stringify(customFormulas));
  console.log('✅ Formula saved to localStorage');
}

export async function deleteCustomFormula(formulaId: string): Promise<void> {
  console.log('💊 deleteCustomFormula called with:', formulaId);

  // Get current user session
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    console.log('💊 Attempting to delete from Supabase...');

    // Delete from Supabase
    const { error } = await supabase
      .from('formulas')
      .delete()
      .eq('formula_id', formulaId)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('❌ Error deleting formula from Supabase:', error);
    } else {
      console.log('✅ Formula deleted from Supabase successfully');
    }
  }

  // Delete from localStorage
  const customFormulas = getCustomFormulas();
  const filtered = customFormulas.filter(f => f.formula_id !== formulaId);
  localStorage.setItem(CUSTOM_FORMULAS_KEY, JSON.stringify(filtered));
  console.log('✅ Formula deleted from localStorage');
}

export async function updateFormula(formulaId: string, updatedFormula: Formula): Promise<void> {
  console.log('💊 updateFormula called with:', formulaId);

  // Get current user session
  const { data: { session } } = await supabase.auth.getSession();

  if (session?.user) {
    console.log('💊 Attempting to update in Supabase...');

    // Update in Supabase
    const { data, error } = await supabase
      .from('formulas')
      .update({
        pinyin_name: updatedFormula.pinyin_name,
        hanzi_name: updatedFormula.hanzi_name,
        translated_name: updatedFormula.translated_name,
        alternative_names: updatedFormula.alternative_names,
        category: updatedFormula.category,
        subcategory: updatedFormula.subcategory,
        source: updatedFormula.source,
        composition: updatedFormula.composition,
        dosage: updatedFormula.dosage,
        preparation: updatedFormula.preparation,
        administration: updatedFormula.administration,
        tcm_actions: updatedFormula.tcm_actions,
        clinical_manifestations: updatedFormula.clinical_manifestations,
        clinical_applications: updatedFormula.clinical_applications,
        modifications: updatedFormula.modifications,
        pharmacological_effects: updatedFormula.pharmacological_effects,
        biological_mechanisms: updatedFormula.biological_mechanisms,
        clinical_studies_and_research: updatedFormula.clinical_studies_and_research,
        drug_interactions: updatedFormula.drug_interactions,
        herb_interactions: updatedFormula.herb_interactions,
        allergens: updatedFormula.allergens,
        cautions: updatedFormula.cautions,
        contraindications: updatedFormula.contraindications,
        toxicology: updatedFormula.toxicology,
        notes: updatedFormula.notes,
        formula_references: updatedFormula.reference,
      })
      .eq('formula_id', formulaId)
      .eq('user_id', session.user.id)
      .select();

    if (error) {
      console.error('❌ Error updating formula in Supabase:', error);
    } else {
      console.log('✅ Formula updated in Supabase successfully:', data);
    }
  }

  // Update in localStorage
  const customFormulas = getCustomFormulas();
  const customIndex = customFormulas.findIndex(f => f.formula_id === formulaId);

  if (customIndex !== -1) {
    customFormulas[customIndex] = updatedFormula;
    localStorage.setItem(CUSTOM_FORMULAS_KEY, JSON.stringify(customFormulas));
    console.log('✅ Formula updated in localStorage');
  } else {
    const overrides = getSystemFormulasOverrides();
    overrides[formulaId] = updatedFormula;
    localStorage.setItem(SYSTEM_FORMULAS_OVERRIDES_KEY, JSON.stringify(overrides));
    console.log('✅ Formula override saved in localStorage');
  }
}

export function isCustomFormula(formulaId: string): boolean {
  const customFormulas = getCustomFormulas();
  return customFormulas.some(f => f.formula_id === formulaId);
}

export function findFormulaByName(name: string): Formula | undefined {
  const allFormulas = getAllFormulas();
  const normalizedName = name.toLowerCase().trim();
  
  return allFormulas.find(formula => 
    formula.pinyin_name.toLowerCase() === normalizedName ||
    formula.hanzi_name.toLowerCase() === normalizedName ||
    formula.translated_name?.toLowerCase() === normalizedName ||
    formula.alternative_names?.some(alt => alt.toLowerCase() === normalizedName)
  );
}