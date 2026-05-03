import { useState } from 'react';
import { ChevronDown, X, Ban, Pencil, Trash2, Undo2, Star } from 'lucide-react';
import { ThermalActionIndicator } from './ui/ThermalActionIndicator';
import { Chip } from './ui/Chip';
import { AlertCard, getAlertIcon } from './ui/AlertCard';
import { Accordion } from './ui/CollapsibleSection';
import { getAllHerbs, findHerbByName } from '@/app/data/herbsManager';
import { getAllFormulas } from '@/app/data/formulasManager';
import type { Formula } from '@/app/data/formulas';
import type { Herb } from '@/app/data/herbs';
import React from 'react';
import { useFavorites } from '../hooks/useFavorites';
import { getFormulaCategoryColors, getFormulaSubcategoryColors } from '../../lib/categoryColors';
import { useUser } from '../contexts/UserContext';
import { planService } from '../services/planService';

// Types for expanded ingredients
interface ExpandedIngredient {
  name: string;
  dosage: string;
  pharmaceuticalName: string;
  preparationNote: string;
  isFormula: boolean;
  subComponents?: Array<{
    name: string;
    dosage: string;
    pharmaceuticalName: string;
    preparationNote: string;
  }>;
}

// Helper functions
const extractHerbName = (compositionItem: string | { herb_pinyin: string; pharmaceutical_name: string; dosage: string; preparation_note?: string }): string => {
  if (typeof compositionItem === 'object') {
    return compositionItem.herb_pinyin;
  }
  return compositionItem.replace(/\s+\d+(\.\d+)?g?\s*$/i, '').trim();
};

const extractDosage = (compositionItem: string | { herb_pinyin: string; pharmaceutical_name: string; dosage: string; preparation_note?: string }): string => {
  if (typeof compositionItem === 'object') {
    return compositionItem.dosage;
  }
  const match = compositionItem.match(/\d+(\.\d+)?g?$/i);
  return match ? match[0] : '';
};

const getPharmaceuticalName = (compositionItem: string | { herb_pinyin: string; pharmaceutical_name: string; dosage: string; preparation_note?: string }): string => {
  if (typeof compositionItem === 'object') {
    return compositionItem.pharmaceutical_name || '';
  }
  return '';
};

const getPreparationNote = (compositionItem: string | { herb_pinyin: string; pharmaceutical_name: string; dosage: string; preparation_note?: string }): string => {
  if (typeof compositionItem === 'object') {
    return compositionItem.preparation_note || '';
  }
  return '';
};

const getNatureBorderColor = (herbName: string): string => {
  const herb = findHerbByName(herbName);
  
  if (!herb || !herb.nature) return 'border-gray-200';
  
  const nature = herb.nature.toLowerCase();
  
  if (nature.includes('very hot') || nature === 'muy caliente') return 'border-red-700';
  if (nature === 'hot' || nature === 'caliente') return 'border-red-500';
  if (nature === 'warm' || nature === 'templado') return 'border-orange-500';
  if (nature === 'neutral' || nature === 'neutro') return 'border-gray-400';
  if (nature === 'cool' || nature === 'fresca') return 'border-blue-400';
  if (nature === 'cold' || nature === 'fría') return 'border-blue-600';
  if (nature.includes('very cold') || nature === 'muy fría') return 'border-blue-800';
  
  return 'border-gray-200';
};

const getThermalActionBorderColor = (formulaName: string): string => {
  const formulasData = getAllFormulas();
  const formula = formulasData.find(f => f.pinyin_name.toLowerCase() === formulaName.toLowerCase());
  
  if (!formula || !formula.thermal_action) return 'border-gray-300';
  
  const thermalAction = formula.thermal_action.toLowerCase();
  
  if (thermalAction.includes('very hot') || thermalAction === 'muy caliente') return 'border-red-700';
  if (thermalAction === 'hot' || thermalAction === 'caliente') return 'border-red-500';
  if (thermalAction === 'warm' || thermalAction === 'templado') return 'border-orange-500';
  if (thermalAction === 'neutral' || thermalAction === 'neutro') return 'border-gray-400';
  if (thermalAction === 'cool' || thermalAction === 'fresca') return 'border-blue-400';
  if (thermalAction === 'cold' || thermalAction === 'fría') return 'border-blue-600';
  if (thermalAction.includes('very cold') || thermalAction === 'muy fría') return 'border-blue-800';
  
  return 'border-gray-300';
};

interface FormulaDetailsProps {
  formula: Formula;
  onClose?: () => void;
  onBack?: () => void;
  backLabel?: string;
  showCloseButton?: boolean;
  showThermalActionIndicator?: boolean;
  isHerbBanned?: (herb: Herb) => boolean;
  onHerbClick?: (herbName: string, parentFormula?: string) => void;
  onFormulaClick?: (formulaId: string) => void;
  ingredientsShowFormulas?: boolean;
  ingredientsNatureIndicator?: boolean;
  ingredientsThermalIndicator?: boolean;
  ingredientsLayout?: 'grid' | 'list';
  ingredientsHerbPinyin?: boolean;
  ingredientsHerbLatin?: boolean;
  ingredientsHerbHanzi?: boolean;
  ingredientsHerbOrder?: ('pinyin' | 'latin' | 'hanzi')[];
  ingredientsFormulaPinyin?: boolean;
  ingredientsFormulaPharmaceutical?: boolean;
  ingredientsFormulaHanzi?: boolean;
  ingredientsFormulaOrder?: ('pinyin' | 'pharmaceutical' | 'hanzi')[];
  showAdminActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  detailViewNameOrder?: ('pinyin' | 'pharmaceutical' | 'alternative' | 'hanzi')[];
  detailViewPinyin?: boolean;
  detailViewPharmaceutical?: boolean;
  detailViewAlternative?: boolean;
  detailViewHanzi?: boolean;
}

export function FormulaDetails({ 
  formula, 
  onClose, 
  onBack,
  backLabel,
  showCloseButton = true,
  showThermalActionIndicator = true,
  isHerbBanned = () => false,
  onHerbClick,
  onFormulaClick,
  ingredientsShowFormulas = true,
  ingredientsNatureIndicator = false,
  ingredientsThermalIndicator = false,
  ingredientsLayout = 'grid',
  ingredientsHerbPinyin = true,
  ingredientsHerbLatin = false,
  ingredientsHerbHanzi = false,
  ingredientsHerbOrder = ['pinyin', 'latin', 'hanzi'],
  ingredientsFormulaPinyin = true,
  ingredientsFormulaPharmaceutical = false,
  ingredientsFormulaHanzi = false,
  ingredientsFormulaOrder = ['pinyin', 'pharmaceutical', 'hanzi'],
  showAdminActions = false,
  onEdit,
  onDelete,
  detailViewNameOrder = ['pinyin', 'pharmaceutical', 'alternative', 'hanzi'],
  detailViewPinyin = true,
  detailViewPharmaceutical = true,
  detailViewAlternative = true,
  detailViewHanzi = true,
}: FormulaDetailsProps) {
  const [expandedFormulas, setExpandedFormulas] = useState<Set<number>>(new Set());
  const { toggleFormulaFavorite, isFormulaFavorite } = useFavorites();
  const { planType } = useUser();

  // Get plan permissions
  const plan = planType ? planService.getPlanByCode(planType) : null;
  const permissions = plan?.formulaDetailPermissions;

  // Helper to check if user can view a section
  const canView = (permission: boolean | undefined) => {
    if (permission === undefined) return true; // Default to true if no permission defined
    return permission;
  };

  const formulasData = getAllFormulas();

  // Helper functions to get display names based on selected options and order
  const getHerbDisplayNames = (herbName: string): string[] => {
    const herb = findHerbByName(herbName);
    if (!herb) return [herbName];

    const nameMap = {
      pinyin: herb.pinyin_name,
      latin: herb.pharmaceutical_name, // Note: Herb interface uses pharmaceutical_name, not latin_name
      hanzi: herb.hanzi_name,
    };

    const enabledMap = {
      pinyin: ingredientsHerbPinyin,
      latin: ingredientsHerbLatin,
      hanzi: ingredientsHerbHanzi,
    };

    const names: string[] = [];
    for (const nameType of ingredientsHerbOrder) {
      if (enabledMap[nameType] && nameMap[nameType]) {
        names.push(nameMap[nameType]);
      }
    }
    
    return names.length > 0 ? names : [herb.pinyin_name];
  };

  const getFormulaDisplayNames = (formulaName: string): string[] => {
    const formula = formulasData.find(f => f.pinyin_name.toLowerCase() === formulaName.toLowerCase());
    if (!formula) return [formulaName];

    const nameMap = {
      pinyin: formula.pinyin_name,
      pharmaceutical: formula.translated_name,
      hanzi: formula.hanzi_name,
    };

    const enabledMap = {
      pinyin: ingredientsFormulaPinyin,
      pharmaceutical: ingredientsFormulaPharmaceutical,
      hanzi: ingredientsFormulaHanzi,
    };

    const names: string[] = [];
    for (const nameType of ingredientsFormulaOrder) {
      if (enabledMap[nameType] && nameMap[nameType]) {
        names.push(nameMap[nameType]);
      }
    }
    
    return names.length > 0 ? names : [formula.pinyin_name];
  };

  // Determine which sections to show
  const sections = [
    { 
      id: 'composition', 
      label: 'Composition', 
      show: (formula.composition?.length || 0) > 0 && formula.composition?.some(c => {
        if (typeof c === 'string') return c.trim();
        if (typeof c === 'object' && 'herb_pinyin' in c) return c.herb_pinyin && c.herb_pinyin.trim();
        return false;
      })
    },
    {
      id: 'clinical-use',
      label: 'Clinical use',
      show: (() => {
        const hasTcmActions = canView(permissions?.clinicalUse.actions) && (formula.tcm_actions?.length || 0) > 0 && formula.tcm_actions?.some(a => typeof a === 'string' && a.trim());
        const hasManifestations = canView(permissions?.clinicalUse.indications) && (formula.clinical_manifestations?.length || 0) > 0 && formula.clinical_manifestations?.some(m => typeof m === 'string' && m.trim());
        const hasClinicalApps = canView(permissions?.clinicalUse.indications) && (formula.clinical_applications?.length || 0) > 0 && formula.clinical_applications?.some(c => c.condition && c.condition.trim());
        return hasTcmActions || hasManifestations || hasClinicalApps;
      })()
    },
    {
      id: 'modifications',
      label: 'Modifications',
      show: canView(permissions?.clinicalUse.modifications) && (formula.modifications?.length || 0) > 0 && formula.modifications?.some(m => m.pattern && m.pattern.trim())
    },
    {
      id: 'safety',
      label: 'Safety & Alerts',
      show: (() => {
        const hasContras = canView(permissions?.safety.contraindications) && (formula.contraindications?.length || 0) > 0 && formula.contraindications?.some(c => typeof c === 'string' && c.trim());
        const hasCautions = canView(permissions?.safety.cautions) && (formula.cautions?.length || 0) > 0 && formula.cautions?.some(c => typeof c === 'string' && c.trim());
        const hasDrugInt = (formula.drug_interactions?.length || 0) > 0 && formula.drug_interactions?.some(i => typeof i === 'string' && i.trim());
        const hasHerbInt = (formula.herb_interactions?.length || 0) > 0 && formula.herb_interactions?.some(i => typeof i === 'string' && i.trim());
        const hasAllergens = (formula.allergens?.length || 0) > 0 && formula.allergens?.some(a => typeof a === 'string' && a.trim());
        const hasToxicology = (formula.toxicology?.length || 0) > 0 && formula.toxicology?.some(t => typeof t === 'string' && t.trim());
        return hasContras || hasCautions || hasDrugInt || hasHerbInt || hasAllergens || hasToxicology;
      })()
    },
    {
      id: 'research',
      label: 'Research',
      show: (() => {
        const hasPharm = canView(permissions?.research.pharmacologicalEffects) && (formula.pharmacological_effects?.length || 0) > 0 && formula.pharmacological_effects?.some(effect => typeof effect === 'string' && effect.trim());
        const hasMech = canView(permissions?.research.biologicalMechanisms) && (formula.biological_mechanisms?.length || 0) > 0 && formula.biological_mechanisms?.some(m => m.system && m.system.trim() && m.target_action);
        const hasStudies = canView(permissions?.research.clinicalStudies) && (formula.clinical_studies_and_research?.length || 0) > 0 && formula.clinical_studies_and_research?.some(s => typeof s === 'string' && s.trim());
        return hasPharm || hasMech || hasStudies;
      })()
    },
    {
      id: 'references-notes',
      label: 'References & Notes',
      show: (canView(permissions?.referencesNotes?.references) && (formula.reference?.length || 0) > 0 && formula.reference?.some(r => typeof r === 'string' && r.trim())) || (canView(permissions?.referencesNotes?.notes) && (formula.notes?.length || 0) > 0 && formula.notes?.some(n => typeof n === 'string' && n.trim()))
    }
  ].filter(s => s.show);

  const scrollToSection = (id: string) => {
    document.getElementById(`formula-detail-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const getFormulaData = (formulaName: string) => {
    return formulasData.find(f => f.pinyin_name.toLowerCase() === formulaName.toLowerCase());
  };

  const toggleFormulaExpansion = (idx: number) => {
    setExpandedFormulas(prev => {
      const newSet = new Set(prev);
      if (newSet.has(idx)) {
        newSet.delete(idx);
      } else {
        newSet.add(idx);
      }
      return newSet;
    });
  };

  // Helper to check if sections exist
  const hasComposition = (formula.composition?.length || 0) > 0 && formula.composition?.some(c => {
    if (typeof c === 'string') return c.trim();
    if (typeof c === 'object' && 'herb_pinyin' in c) return c.herb_pinyin && c.herb_pinyin.trim();
    return false;
  });
  const hasTcmActions = canView(permissions?.clinicalUse.actions) && (formula.tcm_actions?.length || 0) > 0 && formula.tcm_actions?.some(a => typeof a === 'string' && a.trim());
  const hasManifestations = canView(permissions?.clinicalUse.indications) && (formula.clinical_manifestations?.length || 0) > 0 && formula.clinical_manifestations?.some(m => typeof m === 'string' && m.trim());
  const hasClinicalApps = canView(permissions?.clinicalUse.indications) && (formula.clinical_applications?.length || 0) > 0 && formula.clinical_applications?.some(c => c.condition && c.condition.trim());
  const hasClinicalUse = hasTcmActions || hasManifestations || hasClinicalApps;
  const hasModifications = canView(permissions?.clinicalUse.modifications) && (formula.modifications?.length || 0) > 0 && formula.modifications?.some(m => m.pattern && m.pattern.trim());
  
  // DEBUG: Log validation results
  console.log('=== FormulaDetails Validation ===');
  console.log('Formula:', formula.pinyin_name);
  console.log('Composition:', formula.composition);
  console.log('hasComposition:', hasComposition);
  console.log('Modifications:', formula.modifications);
  console.log('hasModifications:', hasModifications);
  console.log('================================');
  
  const hasContras = canView(permissions?.safety.contraindications) && (formula.contraindications?.length || 0) > 0 && formula.contraindications?.some(c => typeof c === 'string' && c.trim());
  const hasCautions = canView(permissions?.safety.cautions) && (formula.cautions?.length || 0) > 0 && formula.cautions?.some(c => typeof c === 'string' && c.trim());
  const hasDrugInt = (formula.drug_interactions?.length || 0) > 0 && formula.drug_interactions?.some(i => typeof i === 'string' && i.trim());
  const hasHerbInt = (formula.herb_interactions?.length || 0) > 0 && formula.herb_interactions?.some(i => typeof i === 'string' && i.trim());
  const hasAllergens = (formula.allergens?.length || 0) > 0 && formula.allergens?.some(a => typeof a === 'string' && a.trim());
  const hasToxicology = (formula.toxicology?.length || 0) > 0 && formula.toxicology?.some(t => typeof t === 'string' && t.trim());
  const hasSafety = hasContras || hasCautions || hasDrugInt || hasHerbInt || hasAllergens || hasToxicology;
  const hasPharm = canView(permissions?.research.pharmacologicalEffects) && (formula.pharmacological_effects?.length || 0) > 0 && formula.pharmacological_effects?.some(effect => typeof effect === 'string' && effect.trim());
  const hasMech = canView(permissions?.research.biologicalMechanisms) && (formula.biological_mechanisms?.length || 0) > 0 && formula.biological_mechanisms?.some(m => m.system && m.system.trim() && m.target_action);
  const hasStudies = canView(permissions?.research.clinicalStudies) && (formula.clinical_studies_and_research?.length || 0) > 0 && formula.clinical_studies_and_research?.some(s => typeof s === 'string' && s.trim());
  const hasResearch = hasPharm || hasMech || hasStudies;
  const hasReference = canView(permissions?.referencesNotes?.references) && (formula.reference?.length || 0) > 0 && formula.reference?.some(r => typeof r === 'string' && r.trim());
  const hasNotes = canView(permissions?.referencesNotes?.notes) && (formula.notes?.length || 0) > 0 && formula.notes?.some(n => typeof n === 'string' && n.trim());
  const hasReferences = hasReference || hasNotes;

  const expandIngredients = (composition: Array<string | { herb_pinyin: string; pharmaceutical_name: string; dosage: string; preparation_note?: string }>): ExpandedIngredient[] => {
    const expanded: ExpandedIngredient[] = [];

    composition.forEach((ingredient) => {
      const name = extractHerbName(ingredient);
      const dosage = extractDosage(ingredient);
      const pharmaceuticalName = getPharmaceuticalName(ingredient);
      const preparationNote = getPreparationNote(ingredient);

      // Check if this ingredient is a formula
      const formulaData = getFormulaData(name);

      if (formulaData && formulaData.composition.length > 0 && ingredientsShowFormulas) {
        // It's a formula - calculate subcomponents
        let totalFormulaDosage = 0;
        formulaData.composition.forEach((formulaIngredient) => {
          const formulaDosage = extractDosage(formulaIngredient);
          const numericDosage = parseFloat(formulaDosage.replace(/[^0-9.]/g, ''));
          if (!isNaN(numericDosage)) {
            totalFormulaDosage += numericDosage;
          }
        });

        const currentDosage = parseFloat(dosage.replace(/[^0-9.]/g, ''));

        const subComponents: Array<{
          name: string;
          dosage: string;
          pharmaceuticalName: string;
          preparationNote: string;
        }> = [];

        // Calculate proportional dosages for each herb in the formula
        formulaData.composition.forEach((formulaIngredient) => {
          const herbName = extractHerbName(formulaIngredient);
          const herbDosage = extractDosage(formulaIngredient);
          const herbPharmaceuticalName = getPharmaceuticalName(formulaIngredient);
          const herbPreparationNote = getPreparationNote(formulaIngredient);
          
          const numericHerbDosage = parseFloat(herbDosage.replace(/[^0-9.]/g, ''));
          
          if (!isNaN(numericHerbDosage) && !isNaN(currentDosage) && totalFormulaDosage > 0) {
            const proportionalDosage = (numericHerbDosage / totalFormulaDosage) * currentDosage;
            const roundedDosage = Math.round(proportionalDosage * 100) / 100;
            
            subComponents.push({
              name: herbName,
              dosage: `${roundedDosage}g`,
              pharmaceuticalName: herbPharmaceuticalName,
              preparationNote: herbPreparationNote
            });
          } else {
            subComponents.push({
              name: herbName,
              dosage: herbDosage,
              pharmaceuticalName: herbPharmaceuticalName,
              preparationNote: herbPreparationNote
            });
          }
        });

        expanded.push({
          name,
          dosage,
          pharmaceuticalName,
          preparationNote,
          isFormula: true,
          subComponents
        });
      } else {
        // It's a regular herb
        expanded.push({
          name,
          dosage,
          pharmaceuticalName,
          preparationNote,
          isFormula: false
        });
      }
    });

    return expanded;
  };

  return (
    <div className="flex flex-col min-h-full sm:block">
      {/* Header */}
      <div className="mb-6 flex-shrink-0">
        <div className="space-y-1.5">
          {(() => {
            const visibleNames = detailViewNameOrder.filter(nameType => {
              if (nameType === 'pinyin') return detailViewPinyin;
              if (nameType === 'pharmaceutical') return detailViewPharmaceutical;
              if (nameType === 'alternative') return detailViewAlternative;
              if (nameType === 'hanzi') return detailViewHanzi;
              return false;
            });

            if (visibleNames.length === 0) {
              return (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{formula.pinyin_name}</h3>
                    {/* Favorite Star */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFormulaFavorite(formula.formula_id);
                      }}
                      className="flex-shrink-0 p-1"
                      title={isFormulaFavorite(formula.formula_id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star
                        className={`w-5 h-5 ${isFormulaFavorite(formula.formula_id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    </button>
                  </div>
                  {onClose && (
                    <button
                      onClick={onClose}
                      className={`text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center ${
                        showCloseButton ? '' : 'sm:hidden'
                      }`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              );
            }

            return (
              <>
                {visibleNames.map((nameType, index) => {
                  let content = '';
                  let className = '';

                  // Get content based on type
                  if (nameType === 'pinyin') {
                    content = formula.pinyin_name;
                  } else if (nameType === 'pharmaceutical') {
                    content = formula.translated_name || '';
                  } else if (nameType === 'alternative') {
                    content = formula.alternative_names && formula.alternative_names.length > 0
                      ? formula.alternative_names.join(', ')
                      : '';
                  } else if (nameType === 'hanzi') {
                    content = formula.hanzi_name || '';
                  }

                  // Assign style based on position (index), not type
                  if (index === 0) {
                    className = 'text-2xl sm:text-3xl font-bold text-gray-900';
                  } else if (index === 1) {
                    className = 'text-base sm:text-xl text-gray-500';
                  } else if (index === 2) {
                    className = 'text-gray-500 text-[16px]';
                  } else {
                    className = 'text-sm sm:text-base text-gray-400';
                  }

                  if (!content) return null;

                  if (index === 0) {
                    return (
                      <div key={nameType} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          <h3 className={`${className} ${nameType === 'hanzi' ? 'font-hanzi' : ''}`}>{content}</h3>
                          {/* Favorite Star */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFormulaFavorite(formula.formula_id);
                            }}
                            className="flex-shrink-0 p-1"
                            title={isFormulaFavorite(formula.formula_id) ? "Remove from favorites" : "Add to favorites"}
                          >
                            <Star
                              className={`w-5 h-5 ${isFormulaFavorite(formula.formula_id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          </button>
                        </div>
                        {onClose && (
                          <button
                            onClick={onClose}
                            className={`text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center ${
                              showCloseButton ? '' : 'sm:hidden'
                            }`}
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    );
                  }

                  return <div key={nameType} className={`${className} ${nameType === 'hanzi' ? 'font-hanzi' : ''}`}>{content}</div>;
                })}
              </>
            );
          })()}
        </div>
        
        {(formula.category || formula.subcategory) && (
          <div className="flex gap-2 mt-3">
            {formula.category && (
              <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${getFormulaCategoryColors(formula.category).bg} ${getFormulaCategoryColors(formula.category).text}`}>
                {formula.category}
              </span>
            )}
            {formula.subcategory && (
              <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${getFormulaSubcategoryColors(formula.subcategory).bg} ${getFormulaSubcategoryColors(formula.subcategory).text}`}>
                {formula.subcategory}
              </span>
            )}
          </div>
        )}
        
        {formula.source && formula.source.trim() && (
          <div className="text-sm sm:text-base text-gray-600 mt-3">
            <span className="font-medium">Source: </span>
            {formula.source}
          </div>
        )}
      </div>

      {/* Jump labels */}
      {sections.length > 0 && (
        <div className="flex flex-nowrap lg:flex-wrap items-center gap-2 sm:gap-3 mb-0 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200 overflow-x-auto flex-shrink-0">
          {sections.flatMap((section, index) => {
            const button = (
              <button
                key={`formula-btn-${section.id}`}
                onClick={() => scrollToSection(section.id)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors whitespace-nowrap flex-shrink-0"
              >
                {section.label}
              </button>
            );
            
            if (index === 0) {
              return [button];
            }
            
            return [
              <div key={`formula-sep-${section.id}`} className="w-px h-4 bg-gray-300 flex-shrink-0"></div>,
              button
            ];
          })}
        </div>
      )}

      {/* Composition */}
      {hasComposition && (
        <section id="formula-detail-composition" className="scroll-mt-4">
          <Accordion 
            title="Composition" 
            defaultOpen={true}
            storageKey="formula-composition-section"
            size="large"
          >
          <div className="space-y-4">
            <Accordion
              title="Ingredients"
              defaultOpen={true}
              storageKey={`formula-${formula.formula_id}-ingredients`}
              size="small"
            >
              <div className={ingredientsLayout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-2" : "inline-flex flex-col gap-2"}>
                {expandIngredients(formula.composition).map((ingredient, idx) => {
                  if (ingredient.isFormula && ingredient.subComponents) {
                    // Render formula with subcomponents
                    const isExpanded = expandedFormulas.has(idx);
                    const formulaExists = getFormulaData(ingredient.name);
                    
                    return (
                      <div
                        key={idx}
                        onClick={formulaExists && onFormulaClick ? () => onFormulaClick(formulaExists.formula_id) : undefined}
                        className={`bg-gray-50 rounded-lg p-2 border ${ingredientsThermalIndicator ? getThermalActionBorderColor(ingredient.name) : 'border-gray-300'} hover:bg-gray-100 transition-colors ${formulaExists && onFormulaClick ? 'cursor-pointer' : ''} ${ingredientsLayout === 'list' ? 'w-full' : ''}`}
                      >
                        {/* Formula name with chevron to expand/collapse */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFormulaExpansion(idx);
                              }}
                              className="p-1 hover:bg-gray-200 rounded transition-colors flex items-center justify-center flex-shrink-0"
                            >
                              <ChevronDown 
                                className={`w-3.5 h-3.5 text-gray-500 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                              />
                            </button>
                            <div className="flex items-baseline gap-2 flex-wrap">
                              {getFormulaDisplayNames(ingredient.name).map((name, i) => (
                                <span key={i} className={i === 0 ? "text-base text-gray-900 font-medium whitespace-nowrap" : "text-sm text-gray-600"}>{name}</span>
                              ))}
                            </div>
                          </div>
                          {ingredient.dosage && (
                            <span className="text-sm text-gray-700 font-medium flex-shrink-0">{ingredient.dosage}</span>
                          )}
                        </div>
                        
                        {/* Subcomponents - only show when expanded */}
                        {isExpanded && (
                          <div className="ml-6 mt-2 space-y-1">
                            {ingredient.subComponents.map((sub, subIdx) => {
                              const herb = findHerbByName(sub.name);
                              const isBanned = herb ? isHerbBanned(herb) : false;
                              
                              if (herb) {
                                const subDisplayNames = getHerbDisplayNames(sub.name);
                                return (
                                  <div
                                    key={subIdx}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (onHerbClick) {
                                        onHerbClick(sub.name, formula.pinyin_name);
                                      }
                                    }}
                                    className={`bg-white rounded-lg px-3 py-2 border ${ingredientsNatureIndicator ? getNatureBorderColor(sub.name) : 'border-gray-200'} cursor-pointer hover:bg-gray-50 transition-colors ${onHerbClick ? 'cursor-pointer' : ''}`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex flex-col gap-0.5">
                                        <div className="text-xs text-gray-600 flex items-baseline gap-1.5 flex-wrap">
                                          {subDisplayNames.map((name, i) => (
                                            <span key={i} className={i === 0 ? 'whitespace-nowrap' : 'text-[10px] text-gray-500'}>{name}</span>
                                          ))}
                                          {isBanned && (
                                            <Ban className="w-3 h-3 text-red-600" />
                                          )}
                                        </div>
                                      </div>
                                      {sub.dosage && (
                                        <div className="text-xs text-gray-700 whitespace-nowrap">{sub.dosage}</div>
                                      )}
                                    </div>
                                  </div>
                                );
                              } else {
                                return (
                                  <div
                                    key={subIdx}
                                    className="bg-white rounded-lg px-3 py-2 border border-gray-200 hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex flex-col gap-0.5">
                                        <div className="text-xs text-gray-600">
                                          <span>{sub.name}</span>
                                        </div>
                                        {sub.pharmaceuticalName && (
                                          <div className="text-gray-600 text-[10px]">{sub.pharmaceuticalName}</div>
                                        )}
                                      </div>
                                      {sub.dosage && (
                                        <div className="text-xs text-gray-700 whitespace-nowrap">{sub.dosage}</div>
                                      )}
                                    </div>
                                  </div>
                                );
                              }
                            })}
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    // Render regular herb
                    const herb = findHerbByName(ingredient.name);
                    const isBanned = herb ? isHerbBanned(herb) : false;
                    
                    if (herb) {
                      const displayNames = getHerbDisplayNames(ingredient.name);
                      return (
                        <div
                          key={idx}
                          onClick={onHerbClick ? () => onHerbClick(ingredient.name, formula.pinyin_name) : undefined}
                          className={`bg-gray-50 rounded-lg p-2 border ${ingredientsNatureIndicator ? getNatureBorderColor(ingredient.name) : 'border-gray-200'} hover:bg-gray-100 transition-colors ${onHerbClick ? 'cursor-pointer' : ''} ${ingredientsLayout === 'list' ? 'w-full' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex flex-col gap-0.5">
                              <div className="font-medium text-gray-900 text-[16px] flex items-baseline gap-2 flex-wrap">
                                {displayNames.map((name, i) => (
                                  <span key={i} className={i === 0 ? 'whitespace-nowrap' : 'text-sm text-gray-600 font-normal'}>{name}</span>
                                ))}
                                {isBanned && (
                                  <Ban className="w-4 h-4 text-red-600" />
                                )}
                              </div>
                            </div>
                            {ingredient.dosage && (
                              <div className="text-sm text-gray-700 font-medium flex-shrink-0">{ingredient.dosage}</div>
                            )}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div
                          key={idx}
                          className={`bg-gray-50 rounded-lg p-2 border border-gray-200 hover:bg-gray-100 transition-colors ${ingredientsLayout === 'list' ? 'w-full' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-baseline gap-2 flex-wrap flex-1 min-w-0">
                              <span className="text-gray-900 font-medium text-[16px] whitespace-nowrap">{ingredient.name}</span>
                              {ingredient.pharmaceuticalName && (
                                <span className="text-gray-600 text-[14px]">{ingredient.pharmaceuticalName}</span>
                              )}
                            </div>
                            {ingredient.dosage && (
                              <span className="text-sm text-gray-700 font-medium flex-shrink-0">{ingredient.dosage}</span>
                            )}
                          </div>
                        </div>
                      );
                    }
                  }
                })}
              </div>
            </Accordion>

            {showThermalActionIndicator && formula.thermal_action && formula.thermal_action.trim() && (
              <Accordion
                title="Thermal action"
                defaultOpen={false}
                storageKey={`formula-${formula.formula_id}-thermal-action`}
                size="small"
              >
                <ThermalActionIndicator thermalAction={formula.thermal_action} showLabel={true} />
              </Accordion>
            )}

            {/* Ingredient Functions */}
            {(() => {
              const hasIngredientFunctions = formula.composition?.some(c => {
                if (typeof c === 'object' && 'role' in c && 'function_in_formula' in c) {
                  return (c.role && c.role.trim()) || (c.function_in_formula && c.function_in_formula.trim());
                }
                return false;
              });

              if (!hasIngredientFunctions) return null;

              return (
                <Accordion
                  title="Ingredient Functions"
                  defaultOpen={false}
                  storageKey={`formula-${formula.formula_id}-ingredient-functions`}
                  size="small"
                >
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-50">
                    <div className="space-y-4">
                      {(() => {
                        // Group ingredients by role
                        const ingredientsByRole: { [role: string]: Array<{ herb_pinyin: string; function_in_formula?: string }> } = {};

                        formula.composition?.forEach((ingredient) => {
                          if (typeof ingredient === 'object' && 'herb_pinyin' in ingredient) {
                            const role = ingredient.role?.trim();
                            const functionInFormula = ingredient.function_in_formula?.trim();

                            if (role || functionInFormula) {
                              const roleKey = role || 'Other';
                              if (!ingredientsByRole[roleKey]) {
                                ingredientsByRole[roleKey] = [];
                              }
                              ingredientsByRole[roleKey].push({
                                herb_pinyin: ingredient.herb_pinyin,
                                function_in_formula: functionInFormula
                              });
                            }
                          }
                        });

                        // Define role order
                        const roleOrder = ['Chief', 'Deputy', 'Assistant', 'Envoy', 'Other'];

                        return roleOrder.map(roleKey => {
                          const ingredients = ingredientsByRole[roleKey];
                          if (!ingredients || ingredients.length === 0) return null;

                          return (
                            <div key={roleKey} className="space-y-2">
                              <h4 className="text-sm font-semibold text-gray-900">{roleKey}</h4>
                              <div className="space-y-2">
                                {ingredients.map((ingredient, idx) => (
                                  <div key={idx} className="flex gap-2">
                                    <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 self-start mt-2.5"></div>
                                    <p className="text-gray-700 leading-relaxed flex-1 text-[16px]">
                                      <span className="font-medium">{ingredient.herb_pinyin}</span>
                                      {ingredient.function_in_formula && <span>: {ingredient.function_in_formula}</span>}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }).filter(Boolean);
                      })()}
                    </div>
                  </div>
                </Accordion>
              );
            })()}

            {(formula.dosage?.length || 0) > 0 && (
              <Accordion
                title="Dosage"
                defaultOpen={false}
                storageKey={`formula-${formula.formula_id}-dosage`}
                size="small"
              >
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-50">
                  <div className="space-y-2">
                    {formula.dosage.map((dose, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 self-start mt-2.5"></div>
                        <p className="text-gray-700 leading-relaxed flex-1 text-[16px]">{dose}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Accordion>
            )}

            {(formula.preparation?.length || 0) > 0 && (
              <Accordion
                title="Preparation"
                defaultOpen={false}
                storageKey={`formula-${formula.formula_id}-preparation`}
                size="small"
              >
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-50">
                  <div className="space-y-2">
                    {formula.preparation.map((prep, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 self-start mt-2.5"></div>
                        <p className="text-gray-700 leading-relaxed flex-1">{prep}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Accordion>
            )}

            {(formula.administration?.length || 0) > 0 && (
              <Accordion
                title="Administration"
                defaultOpen={false}
                storageKey={`formula-${formula.formula_id}-administration`}
                size="small"
              >
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-50">
                  <div className="space-y-2">
                    {formula.administration.map((admin, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 self-start mt-2.5"></div>
                        <p className="text-gray-700 leading-relaxed flex-1">{admin}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Accordion>
            )}
          </div>
          </Accordion>
        </section>
      )}

      {/* Separator between Composition and Clinical use */}
      {(() => {
        const compositionSection = sections.find(s => s.id === 'composition');
        const clinicalUseSection = sections.find(s => s.id === 'clinical-use');
        return compositionSection?.show && clinicalUseSection?.show;
      })() && (
        <div className="border-t border-gray-200 my-0 sm:my-5"></div>
      )}

      {/* Clinical use */}
      {(() => {
        const hasTcmActions = (formula.tcm_actions?.length || 0) > 0 && formula.tcm_actions?.some(a => typeof a === 'string' && a.trim());
        const hasManifestations = (formula.clinical_manifestations?.length || 0) > 0 && formula.clinical_manifestations?.some(m => typeof m === 'string' && m.trim());
        const hasClinicalApps = (formula.clinical_applications?.length || 0) > 0 && formula.clinical_applications?.some(c => c.condition && c.condition.trim());
        
        if (!hasTcmActions && !hasManifestations && !hasClinicalApps) return null;
        
        return (
        <section id="formula-detail-clinical-use" className="scroll-mt-4">
          <Accordion 
            title="Clinical use" 
            defaultOpen={true}
            storageKey="formula-clinical-use-section"
            size="large"
          >
          <div className="space-y-4">
          {hasTcmActions && (
            <Accordion
              title="TCM actions"
              defaultOpen={true}
              storageKey={`formula-${formula.formula_id}-tcm-actions`}
              size="small"
            >
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-50">
                <div className="space-y-3">
                  {formula.tcm_actions.filter(a => typeof a === 'string' && a.trim()).map((action, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 self-start mt-2.5"></div>
                      <p className="text-gray-800 leading-relaxed flex-1">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Accordion>
          )}

          {hasManifestations && (
            <Accordion
              title="Clinical manifestations"
              defaultOpen={false}
              storageKey={`formula-${formula.formula_id}-clinical-manifestations`}
              size="small"
            >
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-50">
                <div className="space-y-3">
                  {formula.clinical_manifestations.filter(m => typeof m === 'string' && m.trim()).map((manifestation, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 self-start mt-2.5"></div>
                      <p className="text-gray-800 leading-relaxed flex-1">{manifestation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Accordion>
          )}

          {hasClinicalApps && (
            <Accordion
              title="Clinical applications"
              defaultOpen={false}
              storageKey={`formula-${formula.formula_id}-clinical-applications`}
              size="small"
            >
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-50">
                <div className="space-y-3">
                  {formula.clinical_applications.filter(c => c.condition && c.condition.trim()).map((app, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 self-start mt-2.5"></div>
                      <p className="text-gray-800 leading-relaxed flex-1">
                        {app.condition}{app.pattern && ` • ${app.pattern}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Accordion>
          )}
          </div>
          </Accordion>
        </section>
        );
      })()}

      {/* Separator between Clinical use and Modifications */}
      {(() => {
        const compositionSection = sections.find(s => s.id === 'composition');
        const clinicalUseSection = sections.find(s => s.id === 'clinical-use');
        const modificationsSection = sections.find(s => s.id === 'modifications');
        const hasAnySectionBefore = compositionSection?.show || clinicalUseSection?.show;
        return modificationsSection?.show && hasAnySectionBefore;
      })() && (
        <div className="border-t border-gray-200 my-0 sm:my-5"></div>
      )}

      {/* Modifications */}
      {hasModifications && (
        <section id="formula-detail-modifications" className="scroll-mt-4">
          <Accordion 
            title="Modifications" 
            defaultOpen={true}
            storageKey="formula-modifications-section"
            size="large"
          >
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-50 space-y-3">
            {formula.modifications.filter(m => m.pattern && m.pattern.trim()).map((modification, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 mt-2.5"></div>
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <p className="text-gray-800 leading-relaxed w-full sm:w-auto">{modification.pattern}</p>
                  {modification.add?.map((item, itemIdx) => {
                    const herb = findHerbByName(item);
                    const formula = getAllFormulas().find(f =>
                      f.pinyin_name.toLowerCase() === item.toLowerCase() ||
                      f.pharmaceutical_name?.toLowerCase() === item.toLowerCase() ||
                      f.hanzi_name === item
                    );

                    const handleClick = () => {
                      if (herb && onHerbClick) {
                        onHerbClick(item);
                      } else if (formula && onFormulaClick) {
                        onFormulaClick(formula.formula_id);
                      }
                    };

                    return (
                      <div key={`add-${itemIdx}`} className="flex items-center gap-2">
                        <span className="text-green-800 font-bold">+</span>
                        <button
                          onClick={handleClick}
                          className="chip-compact inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200 hover:bg-green-200 transition-colors cursor-pointer"
                        >
                          {item}
                        </button>
                      </div>
                    );
                  })}
                  {modification.remove?.map((item, itemIdx) => {
                    const herb = findHerbByName(item);
                    const formula = getAllFormulas().find(f =>
                      f.pinyin_name.toLowerCase() === item.toLowerCase() ||
                      f.pharmaceutical_name?.toLowerCase() === item.toLowerCase() ||
                      f.hanzi_name === item
                    );

                    const handleClick = () => {
                      if (herb && onHerbClick) {
                        onHerbClick(item);
                      } else if (formula && onFormulaClick) {
                        onFormulaClick(formula.formula_id);
                      }
                    };

                    return (
                      <div key={`remove-${itemIdx}`} className="flex items-center gap-2">
                        <span className="text-red-800 font-bold">−</span>
                        <button
                          onClick={handleClick}
                          className="chip-compact inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200 hover:bg-red-200 transition-colors cursor-pointer"
                        >
                          {item}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          </Accordion>
        </section>
      )}

      {/* Separator between Modifications and Safety */}
      {(() => {
        const compositionSection = sections.find(s => s.id === 'composition');
        const clinicalUseSection = sections.find(s => s.id === 'clinical-use');
        const modificationsSection = sections.find(s => s.id === 'modifications');
        const safetySection = sections.find(s => s.id === 'safety');
        const hasAnySectionBefore = compositionSection?.show || clinicalUseSection?.show || modificationsSection?.show;
        return safetySection?.show && hasAnySectionBefore;
      })() && (
        <div className="border-t border-gray-200 my-0 sm:my-5"></div>
      )}

      {/* Safety */}
      {hasSafety && (
        <section id="formula-detail-safety" className="scroll-mt-4">
          <Accordion
            title="Safety & Alerts" 
            defaultOpen={true}
            storageKey="formula-safety-section"
            size="large"
          >
          <div className="space-y-4">
            {hasContras && (
              <Accordion 
                title="Contraindications" 
                defaultOpen={false}
                storageKey={`formula-${formula.formula_id}-contraindications`}
                size="small"
                icon={getAlertIcon('contraindication')}
              >
                <AlertCard
                  type="contraindication"
                  title=""
                  items={formula.contraindications.filter(c => typeof c === 'string' && c.trim())}
                />
              </Accordion>
            )}
            {hasCautions && (
              <Accordion 
                title="Cautions" 
                defaultOpen={false}
                storageKey={`formula-${formula.formula_id}-cautions`}
                size="small"
                icon={getAlertIcon('caution')}
              >
                <AlertCard
                  type="caution"
                  title=""
                  items={formula.cautions.filter(c => typeof c === 'string' && c.trim())}
                />
              </Accordion>
            )}
            {hasDrugInt && (
              <Accordion 
                title="Drug interactions" 
                defaultOpen={false}
                storageKey={`formula-${formula.formula_id}-drug-interactions`}
                size="small"
                icon={getAlertIcon('drug-interaction')}
              >
                <AlertCard
                  type="drug-interaction"
                  title=""
                  items={formula.drug_interactions.filter(i => typeof i === 'string' && i.trim())}
                />
              </Accordion>
            )}
            {hasHerbInt && (
              <Accordion 
                title="Herb interactions" 
                defaultOpen={false}
                storageKey={`formula-${formula.formula_id}-herb-interactions`}
                size="small"
                icon={getAlertIcon('herb-interaction')}
              >
                <AlertCard
                  type="herb-interaction"
                  title=""
                  items={formula.herb_interactions.filter(i => typeof i === 'string' && i.trim())}
                />
              </Accordion>
            )}
            {hasAllergens && (
              <Accordion 
                title="Allergens" 
                defaultOpen={false}
                storageKey={`formula-${formula.formula_id}-allergens`}
                size="small"
                icon={getAlertIcon('allergen')}
              >
                <AlertCard
                  type="allergen"
                  title=""
                  items={formula.allergens.filter(a => typeof a === 'string' && a.trim())}
                />
              </Accordion>
            )}
            {hasToxicology && (
              <Accordion 
                title="Toxicology" 
                defaultOpen={false}
                storageKey={`formula-${formula.formula_id}-toxicology`}
                size="small"
                icon={getAlertIcon('toxicology')}
              >
                <AlertCard
                  type="toxicology"
                  title=""
                  items={formula.toxicology.filter(t => typeof t === 'string' && t.trim())}
                />
              </Accordion>
            )}
          </div>
          </Accordion>
        </section>
      )}

      {/* Separator between Safety and Research */}
      {(() => {
        const compositionSection = sections.find(s => s.id === 'composition');
        const clinicalUseSection = sections.find(s => s.id === 'clinical-use');
        const modificationsSection = sections.find(s => s.id === 'modifications');
        const safetySection = sections.find(s => s.id === 'safety');
        const researchSection = sections.find(s => s.id === 'research');
        const hasAnySectionBefore = compositionSection?.show || clinicalUseSection?.show || modificationsSection?.show || safetySection?.show;
        return researchSection?.show && hasAnySectionBefore;
      })() && (
        <div className="border-t border-gray-200 my-0 sm:my-5"></div>
      )}

      {/* Research */}
      {hasResearch && (
        <section id="formula-detail-research" className="scroll-mt-4">
          <Accordion 
            title="Research" 
            defaultOpen={true}
            storageKey="formula-research-section"
            size="large"
          >
          <div className="space-y-4">
          {hasPharm && (
            <Accordion
              title="Pharmacological effects"
              defaultOpen={true}
              storageKey={`formula-${formula.formula_id}-pharmacological-effects`}
              size="small"
            >
              <div className="flex flex-wrap gap-2 bg-gray-50 rounded-lg p-4 border border-gray-50">
                {formula.pharmacological_effects
                  ?.filter(effect => typeof effect === 'string' && effect.trim())
                  .map((effect, idx) => (
                    <Chip key={idx} variant="primary">{effect}</Chip>
                  ))}
              </div>
            </Accordion>
          )}

          {hasMech && (
            <Accordion
              title="Biological mechanisms"
              defaultOpen={false}
              storageKey={`formula-${formula.formula_id}-biological-mechanisms`}
              size="small"
            >
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-50">
                <div className="space-y-4">
                  {formula.biological_mechanisms
                    ?.filter(m => m.system && m.system.trim() && m.target_action)
                    .map((mech, idx) => (
                      <div key={idx}>
                        <p className="text-base font-semibold text-gray-700 mb-2">{mech.system}</p>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            const actions = Array.isArray(mech.target_action)
                              ? mech.target_action
                              : [mech.target_action];

                            return actions
                              .filter(action => action && typeof action === 'string' && action.trim())
                              .map((action, actionIdx) => (
                                <Chip key={actionIdx} variant="secondary">
                                  {action}
                                </Chip>
                              ));
                          })()}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </Accordion>
          )}

          {hasStudies && (
            <Accordion
              title="Clinical studies and research"
              defaultOpen={false}
              storageKey={`formula-${formula.formula_id}-clinical-studies`}
              size="small"
            >
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-50">
                <div className="space-y-3">
                  {formula.clinical_studies_and_research.filter(s => typeof s === 'string' && s.trim()).map((study, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 self-start mt-2.5"></div>
                      <p className="text-gray-800 leading-relaxed flex-1">{study}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Accordion>
          )}

          {(formula.notes?.length || 0) > 0 && (
            <Accordion
              title="Authors' comments"
              defaultOpen={false}
              storageKey={`formula-${formula.formula_id}-authors-comments`}
              size="small"
            >
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-50">
                <div className="space-y-3">
                  {formula.notes.map((note, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 self-start mt-2.5"></div>
                      <p className="text-gray-800 leading-relaxed flex-1">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Accordion>
          )}
          </div>
          </Accordion>
        </section>
      )}

      {/* Separator between Research and References */}
      {(() => {
        const compositionSection = sections.find(s => s.id === 'composition');
        const clinicalUseSection = sections.find(s => s.id === 'clinical-use');
        const modificationsSection = sections.find(s => s.id === 'modifications');
        const safetySection = sections.find(s => s.id === 'safety');
        const researchSection = sections.find(s => s.id === 'research');
        const referencesSection = sections.find(s => s.id === 'references-notes');
        const hasAnySectionBefore = compositionSection?.show || clinicalUseSection?.show || modificationsSection?.show || safetySection?.show || researchSection?.show;
        return referencesSection?.show && hasAnySectionBefore;
      })() && (
        <div className="border-t border-gray-200 my-0 sm:my-5"></div>
      )}

      {/* References & Notes */}
      {hasReferences && (
        <section id="formula-detail-references-notes" className="scroll-mt-4">
          <Accordion 
            title="References & Notes" 
            defaultOpen={true}
            storageKey="formula-references-notes-section"
            size="large"
          >
          <div className="space-y-4">
          {hasReference && (
            <Accordion
              title="References"
              defaultOpen={true}
              storageKey={`formula-${formula.formula_id}-references`}
              size="small"
            >
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-50">
                <div className="space-y-3">
                  {formula.reference.filter(r => typeof r === 'string' && r.trim()).map((ref, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 self-start mt-2.5"></div>
                      <p className="text-gray-800 leading-relaxed flex-1">{ref}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Accordion>
          )}

          {hasNotes && (
            <Accordion
              title="Notes"
              defaultOpen={false}
              storageKey={`formula-${formula.formula_id}-notes`}
              size="small"
            >
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-50">
                <div className="space-y-3">
                  {formula.notes.filter(n => typeof n === 'string' && n.trim()).map((note, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 self-start mt-2.5"></div>
                      <p className="text-gray-800 leading-relaxed flex-1">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Accordion>
          )}
          </div>
          </Accordion>
        </section>
      )}

      {/* Admin actions */}
      {showAdminActions && (
        <div className="mt-auto sm:mt-8 pt-8 pb-28 sm:pb-24 border-t border-gray-200">
          <div className="flex gap-3">{onEdit && (
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit formula
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete formula
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom spacing when no admin actions */}
      {!showAdminActions && !(onBack && (onHerbClick || onFormulaClick)) && (
        <div className="pb-28 sm:pb-24" />
      )}

      {/* Navigation Footer - Only when onBack exists and we're in deep navigation */}
      {onBack && (onHerbClick || onFormulaClick) && (
        <div className="fixed sm:absolute bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-4 z-10">
          <div className="flex justify-center">
            <button
              onClick={onBack}
              className="h-11 w-11 rounded-lg border bg-white border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900 flex items-center justify-center transition-colors"
              title="Go back"
            >
              <Undo2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
