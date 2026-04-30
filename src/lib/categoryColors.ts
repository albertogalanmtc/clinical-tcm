/**
 * Centralized category and subcategory color configuration
 * Based on Traditional Chinese Medicine philosophy and thermal properties
 */

export interface ColorConfig {
  bg: string;
  text: string;
}

// ========================================
// HERBS - CATEGORIES
// ========================================
const herbCategoryColors: Record<string, ColorConfig> = {
  'Exterior-Releasing': { bg: 'bg-green-100', text: 'text-green-800' },
  'Heat-Clearing': { bg: 'bg-red-100', text: 'text-red-800' },
  'Downward Draining': { bg: 'bg-orange-100', text: 'text-orange-800' },
  'Wind-Damp Dispelling': { bg: 'bg-teal-100', text: 'text-teal-800' },
  'Aromatic Damp-Dissolving': { bg: 'bg-lime-100', text: 'text-lime-800' },
  'Water-Regulating and Damp-Resolving': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'Interior-Warming': { bg: 'bg-amber-100', text: 'text-amber-800' },
  'Qi-Regulating': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  'Digestive': { bg: 'bg-amber-100', text: 'text-amber-800' },
  'Antiparasitic': { bg: 'bg-stone-200', text: 'text-stone-900' },
  'Stop-Bleeding': { bg: 'bg-red-200', text: 'text-red-900' },
  'Blood-Invigorating and Stasis-Removing': { bg: 'bg-rose-100', text: 'text-rose-800' },
  'Phlegm-Resolving and Coughing and Wheezing Relieving': { bg: 'bg-purple-100', text: 'text-purple-800' },
  'Shen-Calming': { bg: 'bg-violet-100', text: 'text-violet-800' },
  'Liver-Calming and Wind-Extinguishing': { bg: 'bg-green-200', text: 'text-green-900' },
  'Orifice-Opening': { bg: 'bg-pink-100', text: 'text-pink-800' },
  'Tonic': { bg: 'bg-yellow-200', text: 'text-yellow-900' },
  'Astringent': { bg: 'bg-gray-100', text: 'text-gray-800' },
  'Emetic': { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800' },
  'Substances for Topical Application': { bg: 'bg-slate-100', text: 'text-slate-800' },
};

// ========================================
// HERBS - SUBCATEGORIES
// ========================================
const herbSubcategoryColors: Record<string, ColorConfig> = {
  // Exterior-Releasing (verde - green)
  'Wind-Cold Releasing': { bg: 'bg-green-50', text: 'text-green-700' },
  'Wind-Heat Releasing': { bg: 'bg-green-50', text: 'text-green-700' },
  
  // Heat-Clearing (rojo - red)
  'Heat-Clearing and Fire-Purging': { bg: 'bg-red-50', text: 'text-red-700' },
  'Heat-Clearing and Dampness Drying': { bg: 'bg-red-50', text: 'text-red-700' },
  'Heat-Clearing and Blood-Cooling': { bg: 'bg-red-50', text: 'text-red-700' },
  'Heat-Clearing and Toxin-Eliminating': { bg: 'bg-red-50', text: 'text-red-700' },
  'Deficiency Heat-Clearing': { bg: 'bg-red-50', text: 'text-red-700' },
  
  // Downward Draining (naranja - orange)
  'Purgatives': { bg: 'bg-orange-50', text: 'text-orange-700' },
  'Moist Laxatives': { bg: 'bg-orange-50', text: 'text-orange-700' },
  'Harsh Expellants (Cathartics)': { bg: 'bg-orange-50', text: 'text-orange-700' },
  
  // Wind-Damp Dispelling (verde azulado - teal)
  'Wind-Damp Dispelling and Pain-Relieving': { bg: 'bg-teal-50', text: 'text-teal-700' },
  'Wind-Damp Dispelling and Channel and Collateral-Opening': { bg: 'bg-teal-50', text: 'text-teal-700' },
  'Wind-Damp Dispelling and Tendon and Bone-Strengthening': { bg: 'bg-teal-50', text: 'text-teal-700' },
  
  // Aromatic Damp-Dissolving (lima - lime)
  'Aromatic Damp-Dissolving': { bg: 'bg-lime-50', text: 'text-lime-700' },
  
  // Water-Regulating and Damp-Resolving (amarillo - yellow)
  'Water-Regulating and Damp-Resolving': { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  
  // Interior-Warming (ámbar - amber)
  'Interior-Warming': { bg: 'bg-amber-50', text: 'text-amber-700' },
  
  // Qi-Regulating (índigo - indigo)
  'Qi-Regulating': { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  
  // Digestive (ámbar - amber, same as Interior-Warming)
  'Digestive': { bg: 'bg-amber-50', text: 'text-amber-700' },
  
  // Antiparasitic (piedra - stone)
  'Antiparasitic': { bg: 'bg-stone-100', text: 'text-stone-800' },
  
  // Stop-Bleeding (rojo - red, same family as Heat-Clearing but darker category)
  'Stop-Bleeding': { bg: 'bg-red-100', text: 'text-red-800' },
  
  // Blood-Invigorating and Stasis-Removing (rosa - rose)
  'Blood-Invigorating and Stasis-Removing': { bg: 'bg-rose-50', text: 'text-rose-700' },
  
  // Phlegm-Resolving (púrpura - purple)
  'Phlegm-Resolving': { bg: 'bg-purple-50', text: 'text-purple-700' },
  'Coughing and Wheezing-Relieving': { bg: 'bg-purple-50', text: 'text-purple-700' },
  
  // Shen-Calming (violeta - violet)
  'Sedative that Calm the Shen (Spirit)': { bg: 'bg-violet-50', text: 'text-violet-700' },
  'Nourishing that Calm the Shen (Spirit)': { bg: 'bg-violet-50', text: 'text-violet-700' },
  
  // Liver-Calming and Wind-Extinguishing (verde - green, same family as Exterior-Releasing but darker category)
  'Liver-Calming and Wind-Extinguishing': { bg: 'bg-green-100', text: 'text-green-800' },
  
  // Orifice-Opening (rosa pálido - pink)
  'Orifice-Opening': { bg: 'bg-pink-50', text: 'text-pink-700' },
  
  // Tonic (amarillo - yellow, same family as Water-Regulating but darker category)
  'Qi-Tonifying': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'Yang-Tonifying': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'Blood-Tonifying': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'Yin-Tonifying': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  
  // Astringent (gris - gray)
  'Astringent': { bg: 'bg-gray-50', text: 'text-gray-700' },
  
  // Emetic (fucsia - fuchsia)
  'Emetic': { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700' },
  
  // Topical (pizarra - slate)
  'Substances for Topical Application': { bg: 'bg-slate-50', text: 'text-slate-700' },
};

// ========================================
// FORMULAS - CATEGORIES
// ========================================
const formulaCategoryColors: Record<string, ColorConfig> = {
  'Exterior-Releasing': { bg: 'bg-green-100', text: 'text-green-800' },
  'Heat-Clearing': { bg: 'bg-red-100', text: 'text-red-800' },
  'Downward Draining': { bg: 'bg-orange-100', text: 'text-orange-800' },
  'Harmonizing': { bg: 'bg-teal-100', text: 'text-teal-800' },
  'Exterior and Interior Releasing': { bg: 'bg-sky-100', text: 'text-sky-800' },
  'Summer-Heat-Dispelling': { bg: 'bg-cyan-100', text: 'text-cyan-800' },
  'Interior-Warming': { bg: 'bg-amber-100', text: 'text-amber-800' },
  'Tonic': { bg: 'bg-yellow-200', text: 'text-yellow-900' },
  'Shen-Calming': { bg: 'bg-violet-100', text: 'text-violet-800' },
  'Orifice-Opening': { bg: 'bg-pink-100', text: 'text-pink-800' },
  'Astringent': { bg: 'bg-gray-100', text: 'text-gray-800' },
  'Qi-Regulating': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  'Blood-Regulating': { bg: 'bg-rose-100', text: 'text-rose-800' },
  'Wind-Expelling': { bg: 'bg-green-100', text: 'text-green-800' },
  'Dryness-Relieving': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'Damp-Dispelling': { bg: 'bg-lime-100', text: 'text-lime-800' },
  'Wind-Damp': { bg: 'bg-teal-100', text: 'text-teal-800' },
  'Phlegm-Dispelling': { bg: 'bg-purple-100', text: 'text-purple-800' },
  'Reducing, Guiding, and Dissolving': { bg: 'bg-stone-100', text: 'text-stone-800' },
  'Antiparasitic': { bg: 'bg-stone-200', text: 'text-stone-900' },
  'Emetic': { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800' },
  'Formulas that Treat Abscesses and Sores': { bg: 'bg-red-200', text: 'text-red-900' },
};

// ========================================
// FORMULAS - SUBCATEGORIES
// ========================================
const formulaSubcategoryColors: Record<string, ColorConfig> = {
  // Exterior-Releasing
  'Acrid and Warm Exterior-Releasing': { bg: 'bg-green-50', text: 'text-green-700' },
  'Acrid and Cold Exterior-Releasing': { bg: 'bg-green-50', text: 'text-green-700' },
  'Supporting the Upright and Releasing the Exterior': { bg: 'bg-green-50', text: 'text-green-700' },
  
  // Heat-Clearing
  'Qi (Energy) Level-Clearing': { bg: 'bg-red-50', text: 'text-red-700' },
  'Ying (Nutritive) Level-Clearing': { bg: 'bg-red-50', text: 'text-red-700' },
  'Qi (Energy) and Xue (Blood) Levels-Clearing': { bg: 'bg-red-50', text: 'text-red-700' },
  'Heat-Clearing and Toxin-Eliminating': { bg: 'bg-red-50', text: 'text-red-700' },
  'Zang Fu-Clearing': { bg: 'bg-red-50', text: 'text-red-700' },
  'Deficiency Heat-Clearing': { bg: 'bg-red-50', text: 'text-red-700' },
  
  // Downward Draining
  'Cold Purgatives': { bg: 'bg-orange-50', text: 'text-orange-700' },
  'Warm Purgatives': { bg: 'bg-orange-50', text: 'text-orange-700' },
  'Moist Laxatives': { bg: 'bg-orange-50', text: 'text-orange-700' },
  'Harsh Expellants': { bg: 'bg-orange-50', text: 'text-orange-700' },
  'Harsh Expellants (Cathartics)': { bg: 'bg-orange-50', text: 'text-orange-700' },
  'Purgative and Tonic': { bg: 'bg-orange-50', text: 'text-orange-700' },
  
  // Harmonizing
  'Shaoyang Harmonizing': { bg: 'bg-teal-50', text: 'text-teal-700' },
  'Liver and Spleen Harmonizing': { bg: 'bg-teal-50', text: 'text-teal-700' },
  'Intestines and Stomach Harmonizing': { bg: 'bg-teal-50', text: 'text-teal-700' },
  
  // Exterior and Interior Releasing
  'Exterior-Releasing and Interior-Attacking': { bg: 'bg-sky-50', text: 'text-sky-700' },
  
  // Summer-Heat-Dispelling
  'Summer-Heat-Dispelling': { bg: 'bg-cyan-50', text: 'text-cyan-700' },
  
  // Interior-Warming
  'Middle-Warming and Cold-Dispelling': { bg: 'bg-amber-50', text: 'text-amber-700' },
  'Yang-Resuscitating': { bg: 'bg-amber-50', text: 'text-amber-700' },
  'Channel-Warming and Cold-Dispelling': { bg: 'bg-amber-50', text: 'text-amber-700' },
  
  // Tonic
  'Qi-Tonifying': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'Blood-Tonifying': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'Qi and Blood-Tonifying': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'Yin-Tonifying': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'Yang-Tonifying': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  'Yin and Yang-Tonifying': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  
  // Shen-Calming
  'Sedative that Calm the Shen (Spirit)': { bg: 'bg-violet-50', text: 'text-violet-700' },
  'Nourishing that Calm the Shen (Spirit)': { bg: 'bg-violet-50', text: 'text-violet-700' },
  
  // Orifice-Opening
  'Cold Orifice-Opening': { bg: 'bg-pink-50', text: 'text-pink-700' },
  'Warm Orifice-Opening': { bg: 'bg-pink-50', text: 'text-pink-700' },
  
  // Astringent
  'Exterior-Stabilizing to Stop Perspiration': { bg: 'bg-gray-50', text: 'text-gray-700' },
  'Exterior-Stabilizing to Relieve Cough': { bg: 'bg-gray-50', text: 'text-gray-700' },
  'Intestine-Binding to Stop Leakage': { bg: 'bg-gray-50', text: 'text-gray-700' },
  'Jing (Essence)-Stabilizing to Stop Leakage': { bg: 'bg-gray-50', text: 'text-gray-700' },
  'Womb-Stabilizing to Stop Leakage': { bg: 'bg-gray-50', text: 'text-gray-700' },
  
  // Qi-Regulating
  'Qi-Moving': { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  'Qi-Descending': { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  
  // Blood-Regulating
  'Blood-Invigorating and Stasis-Removing': { bg: 'bg-rose-50', text: 'text-rose-700' },
  'Stop-Bleeding': { bg: 'bg-rose-50', text: 'text-rose-700' },
  
  // Wind-Expelling
  'External Wind-Releasing': { bg: 'bg-green-50', text: 'text-green-700' },
  'Internal Wind-Extinguishing': { bg: 'bg-green-50', text: 'text-green-700' },
  
  // Dryness-Relieving
  'Dispersing and Moistening': { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  
  // Damp-Dispelling
  'Damp-Drying and Stomach-Harmonizing': { bg: 'bg-lime-50', text: 'text-lime-700' },
  'Heat-Clearing and Damp-Dispelling': { bg: 'bg-lime-50', text: 'text-lime-700' },
  'Water-Regulating and Damp-Resolving': { bg: 'bg-lime-50', text: 'text-lime-700' },
  'Warm that Dissolve Dampness': { bg: 'bg-lime-50', text: 'text-lime-700' },
  
  // Wind-Damp
  'Wind-Damp Dispelling': { bg: 'bg-teal-50', text: 'text-teal-700' },
  'Damp-Phlegm Dispelling': { bg: 'bg-teal-50', text: 'text-teal-700' },
  
  // Phlegm-Dispelling
  'Damp-Drying and Phlegm-Dissolving': { bg: 'bg-purple-50', text: 'text-purple-700' },
  'Heat-Clearing and Phlegm-Dissolving': { bg: 'bg-purple-50', text: 'text-purple-700' },
  'Dryness-Moistening and Phlegm-Dissolving': { bg: 'bg-purple-50', text: 'text-purple-700' },
  'Warm that Dissolve Cold Phlegm': { bg: 'bg-purple-50', text: 'text-purple-700' },
  'Wind-Expelling and Phlegm-Dissolving': { bg: 'bg-purple-50', text: 'text-purple-700' },
  
  // Reducing, Guiding, and Dissolving
  'Reducing, Guiding and Dissolving that Treat Food Stagnation': { bg: 'bg-stone-50', text: 'text-stone-700' },
  
  // Antiparasitic
  'Antiparasitic': { bg: 'bg-stone-100', text: 'text-stone-800' },
  
  // Emetic
  'Emetic': { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700' },
  
  // Abscesses and Sores
  'External Abscesses and Sores': { bg: 'bg-red-100', text: 'text-red-800' },
};

// ========================================
// DEFAULT FALLBACK COLORS
// ========================================
const defaultCategoryColor: ColorConfig = { bg: 'bg-teal-100', text: 'text-teal-800' };
const defaultSubcategoryColor: ColorConfig = { bg: 'bg-gray-100', text: 'text-gray-700' };

// ========================================
// PUBLIC API
// ========================================

/**
 * Get colors for a herb category
 */
export function getHerbCategoryColors(category: string | undefined | null): ColorConfig {
  if (!category) return defaultCategoryColor;
  return herbCategoryColors[category] || defaultCategoryColor;
}

/**
 * Get colors for a herb subcategory
 */
export function getHerbSubcategoryColors(subcategory: string | undefined | null): ColorConfig {
  if (!subcategory) return defaultSubcategoryColor;
  return herbSubcategoryColors[subcategory] || defaultSubcategoryColor;
}

/**
 * Get colors for a formula category
 */
export function getFormulaCategoryColors(category: string | undefined | null): ColorConfig {
  if (!category) return defaultCategoryColor;
  return formulaCategoryColors[category] || defaultCategoryColor;
}

/**
 * Get colors for a formula subcategory
 */
export function getFormulaSubcategoryColors(subcategory: string | undefined | null): ColorConfig {
  if (!subcategory) return defaultSubcategoryColor;
  return formulaSubcategoryColors[subcategory] || defaultSubcategoryColor;
}

/**
 * Get all herb categories with their colors (for admin/preview purposes)
 */
export function getAllHerbCategories(): Array<{ name: string; colors: ColorConfig }> {
  return Object.entries(herbCategoryColors).map(([name, colors]) => ({ name, colors }));
}

/**
 * Get all formula categories with their colors (for admin/preview purposes)
 */
export function getAllFormulaCategories(): Array<{ name: string; colors: ColorConfig }> {
  return Object.entries(formulaCategoryColors).map(([name, colors]) => ({ name, colors }));
}