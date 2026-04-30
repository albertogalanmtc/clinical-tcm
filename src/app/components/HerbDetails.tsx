import { FlavorChip } from './ui/FlavorChip';
import { MeridianChip } from './ui/MeridianChip';
import { NatureIndicator } from './ui/NatureIndicator';
import { Chip } from './ui/Chip';
import { AlertCard, getAlertIcon } from './ui/AlertCard';
import { Accordion } from './ui/CollapsibleSection';
import { ChevronLeft, ChevronRight, ChevronDown, X, Ban, Pencil, Trash2, Undo2, Star, Skull } from 'lucide-react';
import { getAllHerbs, findHerbByName } from '@/app/data/herbsManager';
import { getAllFormulas } from '@/app/data/formulasManager';
import { getPlatformSettings } from '@/app/data/platformSettings';
import type { Herb } from '@/app/data/herbs';
import type { HerbAction } from '@/app/data/herbs';
import React from 'react';
import { useFavorites } from '../hooks/useFavorites';
import { getHerbCategoryColors, getHerbSubcategoryColors } from '../../lib/categoryColors';
import { useUser } from '../contexts/UserContext';
import { planService } from '../services/planService';

// Helper function to get biological mechanisms for a specific herb
const getHerbBiologicalMechanisms = (herbName: string) => {
  const herb = findHerbByName(herbName);
  if (!herb || !Array.isArray(herb.biological_mechanisms)) {
    return [];
  }
  return herb.biological_mechanisms;
};

const getNatureBorderColor = (herbName: string): string => {
  const foundHerb = findHerbByName(herbName);
  if (!foundHerb || !foundHerb.nature) return 'border-gray-400';

  const nature = foundHerb.nature.toLowerCase();

  if (nature.includes('very hot') || nature === 'muy caliente') return 'border-red-700';
  if (nature === 'hot' || nature === 'caliente') return 'border-red-500';
  if (nature === 'warm' || nature === 'templado') return 'border-orange-500';
  if (nature === 'neutral' || nature === 'neutro') return 'border-gray-400';
  if (nature === 'cool' || nature === 'fresca') return 'border-blue-400';
  if (nature === 'cold' || nature === 'fría') return 'border-blue-600';
  if (nature.includes('very cold') || nature === 'muy fría') return 'border-blue-800';

  return 'border-gray-400';
};

const getThermalActionBorderColor = (formulaName: string): string => {
  const formulasData = getAllFormulas();
  const formula = formulasData.find((f: any) => f.pinyin_name.toLowerCase() === formulaName.toLowerCase());

  if (!formula || !formula.thermal_action) return 'border-blue-600';

  const thermalAction = formula.thermal_action.toLowerCase();

  if (thermalAction.includes('very hot') || thermalAction === 'muy caliente') return 'border-red-700';
  if (thermalAction === 'hot' || thermalAction === 'caliente') return 'border-red-500';
  if (thermalAction === 'warm' || thermalAction === 'templado') return 'border-orange-500';
  if (thermalAction === 'neutral' || thermalAction === 'neutro') return 'border-gray-400';
  if (thermalAction === 'cool' || thermalAction === 'fresca') return 'border-blue-400';
  if (thermalAction === 'cold' || thermalAction === 'fría') return 'border-blue-600';
  if (thermalAction.includes('very cold') || thermalAction === 'muy fría') return 'border-blue-800';

  return 'border-blue-600';
};

interface HerbDetailsProps {
  herb: Herb;
  onClose?: () => void;
  onBack?: () => void;
  backLabel?: string;
  showCloseButton?: boolean;
  showNatureIndicator?: boolean;
  detailChipsNatureIndicator?: boolean;
  detailChipsFormulasThermalIndicator?: boolean;
  detailViewNameOrder?: ('pinyin' | 'pharmaceutical' | 'hanzi')[];
  detailViewPinyin?: boolean;
  detailViewPharmaceutical?: boolean;
  detailViewHanzi?: boolean;
  isHerbBanned?: (herb: Herb) => boolean;
  showAdminActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onFormulaClick?: (formulaName: string) => void;
  onHerbClick?: (herbName: string) => void;
}

export function HerbDetails({
  herb,
  onClose,
  onBack,
  backLabel,
  showCloseButton = true,
  showNatureIndicator = true,
  detailChipsNatureIndicator = true,
  detailChipsFormulasThermalIndicator = true,
  detailViewNameOrder = ['pinyin', 'pharmaceutical', 'hanzi'],
  detailViewPinyin = true,
  detailViewPharmaceutical = true,
  detailViewHanzi = true,
  isHerbBanned = () => false,
  showAdminActions = false,
  onEdit,
  onDelete,
  onFormulaClick,
  onHerbClick
}: HerbDetailsProps) {
  const [expandedActions, setExpandedActions] = React.useState<number[]>([]);
  const { toggleHerbFavorite, isHerbFavorite } = useFavorites();
  const { planType, isAdmin } = useUser();

  // Get plan permissions
  const plan = planType ? planService.getPlanByCode(planType) : null;
  const permissions = plan?.herbDetailPermissions;

  // Admin users bypass all restrictions
  const canView = (permission: boolean | undefined) => {
    if (isAdmin) return true;
    return permission !== false;
  };

  // Function to handle formula chip click
  const handleFormulaClick = (formulaName: string) => {
    if (onFormulaClick) {
      onFormulaClick(formulaName);
    }
  };

  // Function to handle herb chip click
  const handleHerbClick = (herbName: string) => {
    if (onHerbClick) {
      onHerbClick(herbName);
    }
  };

  // Function to find formulas that contain this herb
  const getFormulasContainingHerb = (herbPinyin: string): string[] => {
    const allFormulas = getAllFormulas();
    const foundFormulas: string[] = [];
    
    allFormulas.forEach((formula: any) => {
      if (formula.composition && Array.isArray(formula.composition)) {
        const hasHerb = formula.composition.some((comp: any) => 
          comp.herb_pinyin && 
          comp.herb_pinyin.toLowerCase() === herbPinyin.toLowerCase()
        );
        if (hasHerb && formula.pinyin_name) {
          foundFormulas.push(formula.pinyin_name);
        }
      }
    });
    
    return foundFormulas.sort();
  };

  // Get formulas containing this herb
  const formulasWithThisHerb = getFormulasContainingHerb(herb.pinyin_name);

  // Get herb chip border color based on nature indicator setting
  const getHerbChipBorderColor = (herbName: string): string => {
    if (!detailChipsNatureIndicator) {
      return 'border-gray-400';
    }
    return getNatureBorderColor(herbName);
  };

  // Get formula chip border color based on thermal indicator setting
  const getFormulaChipBorderColor = (formulaName: string): string => {
    if (!detailChipsFormulasThermalIndicator) {
      return 'border-gray-400';
    }
    return getThermalActionBorderColor(formulaName);
  };

  // Determine which sections to show
  const sections = [
    { 
      id: 'properties', 
      label: 'Properties', 
      show: canView(permissions?.properties) && ((herb.nature && herb.nature.trim()) || (herb.flavor?.length || 0) > 0 || (herb.channels?.length || 0) > 0 || (herb.dose && herb.dose.trim())) 
    },
    {
      id: 'clinical-use',
      label: 'Clinical use',
      show: (() => {
        const hasActions = canView(permissions?.clinicalUse.actions) && (herb.actions?.length || 0) > 0 && herb.actions?.some(a => {
          if (typeof a === 'string') return a.trim();
          if (typeof a === 'object' && 'title' in a) return a.title && a.title.trim();
          return false;
        });
        const hasIndications = canView(permissions?.clinicalUse.indications) && (herb.indications?.length || 0) > 0 && herb.indications?.some(i => typeof i === 'string' && i.trim());
        const hasDuiYao = canView(permissions?.clinicalUse.duiYao) && (herb.dui_yao?.length || 0) > 0 && herb.dui_yao?.some(d => d.pair && d.pair.length > 0);
        const hasClinicalApps = canView(permissions?.clinicalUse.clinicalApplications) && (herb.clinical_applications?.length || 0) > 0 && herb.clinical_applications?.some(c => c.condition && c.condition.trim());
        return hasActions || hasIndications || hasDuiYao || hasClinicalApps;
      })()
    },
    {
      id: 'safety',
      label: 'Safety & Alerts',
      show: (() => {
        const hasContras = canView(permissions?.safety.contraindications) && (herb.contraindications?.length || 0) > 0 && herb.contraindications?.some(c => typeof c === 'string' && c.trim());
        const hasCautions = canView(permissions?.safety.cautions) && (herb.cautions?.length || 0) > 0 && herb.cautions?.some(c => typeof c === 'string' && c.trim());
        const hasDrugInt = canView(permissions?.safety.drugInteractions) && (herb.herb_drug_interactions?.length || 0) > 0 && herb.herb_drug_interactions?.some(i => typeof i === 'string' && i.trim());
        const hasHerbInt = canView(permissions?.safety.herbInteractions) && (herb.herb_herb_interactions?.length || 0) > 0 && herb.herb_herb_interactions?.some(i => typeof i === 'string' && i.trim());
        const hasAllergens = canView(permissions?.safety.allergens) && (herb.allergens?.length || 0) > 0 && herb.allergens?.some(a => typeof a === 'string' && a.trim());
        const hasAntag = canView(permissions?.safety.antagonisms) && (herb.antagonisms?.length || 0) > 0 && herb.antagonisms?.some(a => typeof a === 'string' && a.trim());
        const hasIncompat = canView(permissions?.safety.incompatibilities) && (herb.incompatibilities?.length || 0) > 0 && herb.incompatibilities?.some(i => typeof i === 'string' && i.trim());
        return hasContras || hasCautions || hasDrugInt || hasHerbInt || hasAllergens || hasAntag || hasIncompat;
      })()
    },
    {
      id: 'research',
      label: 'Research',
      show: (() => {
        const hasPharm = canView(permissions?.research.pharmacologicalEffects) && (herb.pharmacological_effects?.length || 0) > 0 && herb.pharmacological_effects?.some(effect => typeof effect === 'string' && effect.trim());
        const herbMechanisms = getHerbBiologicalMechanisms(herb.pinyin_name);
        const hasMech = canView(permissions?.research.biologicalMechanisms) && herbMechanisms.length > 0 && herbMechanisms.some(m => m.system && m.system.trim() && m.target_action && m.target_action.trim());
        const hasBioactiveCompounds = canView(permissions?.research.bioactiveCompounds) && (herb.bioactive_compounds?.length || 0) > 0;
        const hasStudies = canView(permissions?.research.clinicalStudies) && (herb.clinical_studies_and_research?.length || 0) > 0;
        return hasPharm || hasMech || hasBioactiveCompounds || hasStudies;
      })()
    },
    {
      id: 'found-in',
      label: 'Found in',
      show: canView(permissions?.foundIn) && formulasWithThisHerb.length > 0
    },
    {
      id: 'references-notes',
      label: 'References & Notes',
      show: (() => {
        const hasReferences = canView(permissions?.referencesNotes?.references) && (herb.references?.length || 0) > 0;
        const hasNotes = canView(permissions?.referencesNotes?.notes) && (herb.notes?.length || 0) > 0;
        return hasReferences || hasNotes;
      })()
    }
  ].filter(s => s.show);

  const scrollToSection = (id: string) => {
    document.getElementById(`herb-detail-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex flex-col min-h-full sm:block">
      {/* Back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="h-10 w-10 sm:w-11 sm:h-11 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0 mb-4"
          title={backLabel || 'Back'}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}
      
      {/* Header */}
      <div className="mb-6 flex-shrink-0">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {/* Render first visible name in order as the main title */}
              {(() => {
                // Filter order to only include visible names
                const visibleNames = detailViewNameOrder.filter(nameType => {
                  if (nameType === 'pinyin') return detailViewPinyin;
                  if (nameType === 'pharmaceutical') return detailViewPharmaceutical;
                  if (nameType === 'hanzi') return detailViewHanzi;
                  return false;
                });

                if (visibleNames.length === 0) {
                  // Fallback to pinyin if no names are visible
                  return <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{herb.pinyin_name}</h3>;
                }

                const firstNameType = visibleNames[0];
                let firstName = '';
                if (firstNameType === 'pinyin') firstName = herb.pinyin_name;
                else if (firstNameType === 'pharmaceutical') firstName = herb.pharmaceutical_name || '';
                else if (firstNameType === 'hanzi') firstName = herb.hanzi_name || '';

                return <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">{firstName}</h3>;
              })()}
              {/* Favorite Star */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleHerbFavorite(herb.herb_id);
                }}
                className="flex-shrink-0 p-1"
                title={isHerbFavorite(herb.herb_id) ? "Remove from favorites" : "Add to favorites"}
              >
                <Star
                  className={`w-5 h-5 ${isHerbFavorite(herb.herb_id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              </button>
              {isHerbBanned(herb) && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 whitespace-nowrap">
                  <Ban className="w-3.5 h-3.5" />
                  Banned
                </span>
              )}
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

          {/* Render remaining visible names in order */}
          {(() => {
            // Filter order to only include visible names
            const visibleNames = detailViewNameOrder.filter(nameType => {
              if (nameType === 'pinyin') return detailViewPinyin;
              if (nameType === 'pharmaceutical') return detailViewPharmaceutical;
              if (nameType === 'hanzi') return detailViewHanzi;
              return false;
            });

            return visibleNames.slice(1).map((nameType) => {
              let name = '';
              let className = '';

              if (nameType === 'pinyin') {
                name = herb.pinyin_name;
                className = 'text-base sm:text-xl text-gray-500';
              } else if (nameType === 'pharmaceutical') {
                name = herb.pharmaceutical_name || '';
                className = 'text-base sm:text-xl text-gray-500';
              } else if (nameType === 'hanzi') {
                name = herb.hanzi_name || '';
                className = 'text-sm sm:text-base text-gray-400';
              }

              if (!name) return null;

              return (
                <div key={nameType} className={className}>
                  {name}
                </div>
              );
            });
          })()}
        </div>

        {(herb.category || herb.subcategory) && (
          <div className="flex gap-2 mt-3">
            {herb.category && (
              <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${getHerbCategoryColors(herb.category).bg} ${getHerbCategoryColors(herb.category).text}`}>
                {herb.category}
              </span>
            )}
            {herb.subcategory && (
              <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${getHerbSubcategoryColors(herb.subcategory).bg} ${getHerbSubcategoryColors(herb.subcategory).text}`}>
                {herb.subcategory}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Jump labels */}
      {sections.length > 0 && (
        <div className="flex flex-nowrap lg:flex-wrap items-center gap-2 sm:gap-3 mb-0 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200 overflow-x-auto flex-shrink-0">
          {sections.flatMap((section, index) => {
            const button = (
              <button
                key={`herb-btn-${section.id}`}
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
              <div key={`herb-sep-${section.id}`} className="w-px h-4 bg-gray-300 flex-shrink-0"></div>,
              button
            ];
          })}
        </div>
      )}

      {/* Properties */}
      {(() => {
        const propertiesSection = sections.find(s => s.id === 'properties');
        return propertiesSection?.show;
      })() && (
        <section id="herb-detail-properties" className="scroll-mt-4">
          <Accordion 
            title="Properties" 
            defaultOpen={true}
            storageKey="herb-properties-section"
            size="large"
          >
            <div className="bg-gray-50 rounded-lg px-4 py-3 border border-gray-50 md:w-fit">
              <div className="flex flex-wrap items-center gap-3">
                {herb.nature && herb.nature.trim() && (
                  <div className="flex items-center gap-2">
                    <NatureIndicator nature={herb.nature} showLabel={true} />
                  </div>
                )}

                {herb.nature && herb.nature.trim() && (herb.flavor?.length || 0) > 0 && (
                  <div className="h-6 w-px bg-gray-300" />
                )}

                {(herb.flavor?.length || 0) > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {herb.flavor.map(f => (
                      <FlavorChip key={f} flavor={f} />
                    ))}
                  </div>
                )}

                {(herb.channels?.length || 0) > 0 && (
                  <div className="h-6 w-px bg-gray-300" />
                )}

                {(herb.channels?.length || 0) > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {herb.channels.map(c => {
                      const expandMeridianName = (abbr: string) => {
                        const normalized = abbr.toUpperCase().trim();
                        const meridianMap: Record<string, string> = {
                          'SP': 'Spleen',
                          'ST': 'Stomach',
                          'LU': 'Lung',
                          'LI': 'Large Intestine',
                          'HT': 'Heart',
                          'SI': 'Small Intestine',
                          'BL': 'Bladder',
                          'UB': 'Bladder',
                          'KD': 'Kidney',
                          'KI': 'Kidney',
                          'PC': 'Pericardium',
                          'SJ': 'San Jiao',
                          'LV': 'Liver',
                          'GB': 'Gallbladder'
                        };
                        return meridianMap[normalized] || abbr;
                      };

                      return <MeridianChip key={c} meridian={expandMeridianName(c)} />;
                    })}
                  </div>
                )}

                {herb.dose && herb.dose.trim() && (
                  <div className="h-6 w-px bg-gray-300" />
                )}

                {herb.dose && herb.dose.trim() && (
                  <div className="text-sm text-gray-700 font-medium">
                    {herb.dose}
                  </div>
                )}

                {/* Separator */}
                {herb.toxicology && herb.toxicology.length > 0 && (
                  <div className="h-6 w-px bg-gray-300" />
                )}

                {/* Toxicology indicator */}
                {herb.toxicology && herb.toxicology.length > 0 && (
                  <div className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700">
                    <Skull className="w-3 h-3 flex-shrink-0" />
                    <span>Toxic</span>
                  </div>
                )}
              </div>
            </div>
          </Accordion>
        </section>
      )}

      {/* Separator between Properties and Clinical use */}
      {(() => {
        const propertiesSection = sections.find(s => s.id === 'properties');
        const clinicalUseSection = sections.find(s => s.id === 'clinical-use');
        return propertiesSection?.show && clinicalUseSection?.show;
      })() && (
        <div className="border-t border-gray-200 my-0 sm:my-5"></div>
      )}

      {(() => {
        const clinicalUseSection = sections.find(s => s.id === 'clinical-use');
        if (!clinicalUseSection?.show) return null;

        const hasActions = canView(permissions?.clinicalUse.actions) && (herb.actions?.length || 0) > 0 && herb.actions?.some(a => {
          if (typeof a === 'string') return a.trim();
          if (typeof a === 'object' && 'title' in a) return a.title && a.title.trim();
          return false;
        });
        const hasIndications = canView(permissions?.clinicalUse.indications) && (herb.indications?.length || 0) > 0 && herb.indications?.some(i => typeof i === 'string' && i.trim());
        const hasDuiYao = canView(permissions?.clinicalUse.duiYao) && (herb.dui_yao?.length || 0) > 0 && herb.dui_yao?.some(d => d.pair && d.pair.length > 0);
        const hasClinicalApps = canView(permissions?.clinicalUse.clinicalApplications) && (herb.clinical_applications?.length || 0) > 0 && herb.clinical_applications?.some(c => c.condition && c.condition.trim());
        
        if (!hasActions && !hasIndications && !hasDuiYao && !hasClinicalApps) return null;
        
        return (
        <section id="herb-detail-clinical-use" className="scroll-mt-4">
          <Accordion 
            title="Clinical use" 
            defaultOpen={true}
            storageKey="herb-clinical-use-section"
            size="large"
          >
          <div className="space-y-4">
          {hasActions && (
            <Accordion
              title="TCM actions"
              defaultOpen={true}
              storageKey={`herb-${herb.herb_id}-tcm-actions`}
              size="small"
            >
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-50">
                <div className="space-y-3">
                  {herb.actions.map((action, idx) => {
                    const isObjectAction = typeof action === 'object' && 'title' in action;
                    const isExpanded = expandedActions.includes(idx);

                    if (isObjectAction) {
                      const actionObj = action as HerbAction;
                      const hasBranches = actionObj.branches && actionObj.branches.length > 0;

                      return (
                        <div key={idx}>
                          {hasBranches ? (
                            <div>
                              <button
                                onClick={() => {
                                  const newExpanded = new Set(expandedActions);
                                  if (newExpanded.has(idx)) {
                                    newExpanded.delete(idx);
                                  } else {
                                    newExpanded.add(idx);
                                  }
                                  setExpandedActions(Array.from(newExpanded));
                                }}
                                className="w-full flex items-start sm:items-center gap-3 text-left hover:opacity-80 transition-opacity"
                              >
                                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 self-start mt-2.5"></div>
                                <p className="text-gray-800 leading-relaxed flex-1">{actionObj.title}</p>
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                )}
                              </button>

                              {isExpanded && (
                                <div className="mt-2 ml-3.5 space-y-3">
                                  {actionObj.branches.map((branch, branchIdx) => {
                                    return (
                                      <div key={branchIdx} className="pl-3 border-l-2 border-gray-200">
                                        <p className="text-sm text-gray-700 mb-1.5">{branch.pattern}</p>
                                        
                                        {branch.sub_pattern && branch.sub_pattern.trim() && (
                                          <div className="pl-3 border-l-2 border-gray-300 mt-2">
                                            <p className="text-sm text-gray-500 italic mb-2">{branch.sub_pattern}</p>
                                            
                                            {(branch.combination || branch.formula_example) && (
                                              <div className="flex flex-wrap items-center gap-2">
                                                {branch.combination && branch.combination.length > 0 && (
                                                  <div className="flex flex-wrap items-center gap-1">
                                                    {branch.combination.map((herb, herbIdx) => {
                                                      const herbExists = findHerbByName(herb);
                                                      const borderColor = getHerbChipBorderColor(herb);

                                                      return (
                                                        <button
                                                          key={herbIdx}
                                                          onClick={herbExists && onHerbClick ? () => onHerbClick(herb) : undefined}
                                                          className={`chip-compact inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border ${borderColor} hover:bg-gray-200 transition-colors ${herbExists && onHerbClick ? 'cursor-pointer' : 'cursor-default'}`}
                                                        >
                                                          {herb}
                                                        </button>
                                                      );
                                                    })}
                                                  </div>
                                                )}

                                                {branch.combination && branch.combination.length > 0 && branch.formula_example && (
                                                  <div className="w-px h-5 bg-gray-300"></div>
                                                )}

                                                {branch.formula_example && (
                                                  <button
                                                    className={`chip-compact inline-flex items-center px-2 py-0.5 rounded-full text-xs leading-4 font-medium bg-gray-200 text-gray-900 border ${getFormulaChipBorderColor(branch.formula_example)} hover:bg-gray-300 cursor-pointer transition-colors`}
                                                    onClick={() => handleFormulaClick(branch.formula_example)}
                                                  >
                                                    {branch.formula_example}
                                                  </button>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {(!branch.sub_pattern || !branch.sub_pattern.trim()) && (branch.combination || branch.formula_example) && (
                                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                            {branch.combination && branch.combination.length > 0 && (
                                              <div className="flex flex-wrap items-center gap-1">
                                                {branch.combination.map((herb, herbIdx) => {
                                                  const herbExists = findHerbByName(herb);
                                                  const borderColor = getHerbChipBorderColor(herb);

                                                  return (
                                                    <button
                                                      key={herbIdx}
                                                      onClick={herbExists && onHerbClick ? () => onHerbClick(herb) : undefined}
                                                      className={`chip-compact inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border ${borderColor} hover:bg-gray-200 transition-colors ${herbExists && onHerbClick ? 'cursor-pointer' : 'cursor-default'}`}
                                                    >
                                                      {herb}
                                                    </button>
                                                  );
                                                })}
                                              </div>
                                            )}

                                            {branch.combination && branch.combination.length > 0 && branch.formula_example && (
                                              <div className="w-px h-5 bg-gray-300"></div>
                                            )}

                                            {branch.formula_example && (
                                              <button
                                                className={`chip-compact inline-flex items-center px-2 py-0.5 rounded-full text-xs leading-4 font-medium bg-gray-200 text-gray-900 border ${getFormulaChipBorderColor(branch.formula_example)} hover:bg-gray-300 cursor-pointer transition-colors`}
                                                onClick={() => handleFormulaClick(branch.formula_example)}
                                              >
                                                {branch.formula_example}
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="flex gap-3">
                              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 self-start mt-2.5"></div>
                              <p className="text-gray-800 leading-relaxed flex-1">{actionObj.title}</p>
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <div key={idx} className="flex gap-3">
                          <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 self-start mt-2.5"></div>
                          <p className="text-gray-800 leading-relaxed flex-1">{action as string}</p>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </Accordion>
          )}

          {hasIndications && (
            <Accordion
              title="Clinical indications"
              defaultOpen={true}
              storageKey={`herb-${herb.herb_id}-clinical-indications`}
              size="small"
            >
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-50">
                <div className="space-y-3">
                  {herb.indications.map((indication, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 self-start mt-2.5"></div>
                      <p className="text-gray-800 leading-relaxed flex-1">{indication}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Accordion>
          )}

          {hasClinicalApps && (
            <Accordion
              title="Clinical applications"
              defaultOpen={true}
              storageKey={`herb-${herb.herb_id}-clinical-applications`}
              size="small"
            >
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-50">
                <div className="space-y-3">
                  {herb.clinical_applications.map((app, idx) => (
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

          {hasDuiYao && (
            <div>
              <Accordion 
                title="Dui Yao" 
                defaultOpen={true}
                storageKey={`herb-${herb.herb_id}-dui-yao`}
                size="small"
              >
                <div className="space-y-4">
                  {herb.dui_yao.map((duiYao, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-5 border border-gray-50">
                      {/* Herb pair chips */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {duiYao.pair.map((herbName, herbIdx) => (
                          <div key={herbIdx} className="flex items-center gap-2">
                            <button
                              onClick={() => handleHerbClick(herbName)}
                              className={`chip-compact inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border ${getHerbChipBorderColor(herbName)} hover:bg-gray-200 transition-colors cursor-pointer`}
                            >
                              {herbName}
                            </button>
                            {herbIdx < duiYao.pair.length - 1 && (
                              <span className="text-gray-600 font-bold text-lg">+</span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Functions */}
                      {duiYao.functions && duiYao.functions.length > 0 && (
                        <div className="mb-3">
                          <div className="space-y-2">
                            {duiYao.functions.map((func, funcIdx) => (
                              <div key={funcIdx} className="flex gap-3">
                                <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 self-start mt-2"></div>
                                <p className="text-gray-800 leading-relaxed flex-1 text-sm">{func}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {duiYao.notes && duiYao.notes.trim() && (
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-sm text-gray-700 italic">{duiYao.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Accordion>
            </div>
          )}
          </div>
          </Accordion>
        </section>
        );
      })()}

      {/* Separator between Clinical use and Safety & alerts */}
      {(() => {
        const propertiesSection = sections.find(s => s.id === 'properties');
        const clinicalUseSection = sections.find(s => s.id === 'clinical-use');
        const safetySection = sections.find(s => s.id === 'safety');
        const hasAnySectionBefore = propertiesSection?.show || clinicalUseSection?.show;
        return safetySection?.show && hasAnySectionBefore;
      })() && (
        <div className="border-t border-gray-200 my-0 sm:my-5"></div>
      )}

      {/* Safety & alerts */}
      {(() => {
        const safetySection = sections.find(s => s.id === 'safety');
        return safetySection?.show;
      })() && (
        <section id="herb-detail-safety" className="scroll-mt-4">
          <Accordion
            title="Safety & Alerts" 
            defaultOpen={true}
            storageKey="herb-safety-section"
            size="large"
          >
            <div className="space-y-4">
              {canView(permissions?.safety.antagonisms) && (herb.antagonisms?.length || 0) > 0 && (() => {
                const { bg, border, icon } = (() => {
                  const settings = getPlatformSettings().designSettings;
                  return settings.alertColors.antagonisms;
                })();

                return (
                  <Accordion
                    title="Antagonisms"
                    defaultOpen={false}
                    storageKey={`herb-${herb.herb_id}-antagonisms`}
                    size="small"
                    icon={getAlertIcon('antagonism')}
                  >
                    <div
                      className="rounded-lg border p-4"
                      style={{
                        backgroundColor: bg,
                        borderColor: bg
                      }}
                    >
                      <div className="flex flex-wrap gap-2">
                        {herb.antagonisms.map((herbName, idx) => {
                            const herbExists = findHerbByName(herbName);
                            return (
                              <button
                                key={idx}
                                onClick={herbExists ? () => handleHerbClick(herbName) : undefined}
                                className={`chip-compact inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border ${getHerbChipBorderColor(herbName)} hover:bg-gray-200 transition-colors ${herbExists ? 'cursor-pointer' : 'cursor-default'}`}
                              >
                                {herbName}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </Accordion>
                );
              })()}

              {canView(permissions?.safety.incompatibilities) && (herb.incompatibilities?.length || 0) > 0 && (() => {
                const { bg, border, icon } = (() => {
                  const settings = getPlatformSettings().designSettings;
                  return settings.alertColors.incompatibilities;
                })();

                return (
                  <Accordion
                    title="Incompatibilities"
                    defaultOpen={false}
                    storageKey={`herb-${herb.herb_id}-incompatibilities`}
                    size="small"
                    icon={getAlertIcon('incompatibility')}
                  >
                    <div
                      className="rounded-lg border p-4"
                      style={{
                        backgroundColor: bg,
                        borderColor: bg
                      }}
                    >
                      <div className="flex flex-wrap gap-2">
                        {herb.incompatibilities.map((herbName, idx) => {
                            const herbExists = findHerbByName(herbName);
                            return (
                              <button
                                key={idx}
                                onClick={herbExists ? () => handleHerbClick(herbName) : undefined}
                                className={`chip-compact inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border ${getHerbChipBorderColor(herbName)} hover:bg-gray-200 transition-colors ${herbExists ? 'cursor-pointer' : 'cursor-default'}`}
                              >
                                {herbName}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  </Accordion>
                );
              })()}

              {canView(permissions?.safety.contraindications) && (herb.contraindications?.length || 0) > 0 && (
                <Accordion
                  title="Contraindications"
                  defaultOpen={false}
                  storageKey={`herb-${herb.herb_id}-contraindications`}
                  size="small"
                  icon={getAlertIcon('contraindication')}
                >
                  <AlertCard
                    type="contraindication"
                    title=""
                    items={herb.contraindications}
                    onHerbClick={handleHerbClick}
                    onFormulaClick={handleFormulaClick}
                  />
                </Accordion>
              )}

              {canView(permissions?.safety.cautions) && (herb.cautions?.length || 0) > 0 && (
                <Accordion
                  title="Cautions"
                  defaultOpen={false}
                  storageKey={`herb-${herb.herb_id}-cautions`}
                  size="small"
                  icon={getAlertIcon('caution')}
                >
                  <AlertCard
                    type="caution"
                    title=""
                    items={herb.cautions}
                    onHerbClick={handleHerbClick}
                    onFormulaClick={handleFormulaClick}
                  />
                </Accordion>
              )}

              {canView(permissions?.safety.drugInteractions) && (herb.herb_drug_interactions?.length || 0) > 0 && (
                <Accordion
                  title="Herb-Drug interactions"
                  defaultOpen={false}
                  storageKey={`herb-${herb.herb_id}-herb-drug-interactions`}
                  size="small"
                  icon={getAlertIcon('drug-interaction')}
                >
                  <AlertCard
                    type="drug-interaction"
                    title=""
                    items={herb.herb_drug_interactions}
                    onHerbClick={handleHerbClick}
                    onFormulaClick={handleFormulaClick}
                  />
                </Accordion>
              )}

              {canView(permissions?.safety.herbInteractions) && (herb.herb_herb_interactions?.length || 0) > 0 && (
                <Accordion
                  title="Herb-Herb interactions"
                  defaultOpen={false}
                  storageKey={`herb-${herb.herb_id}-herb-herb-interactions`}
                  size="small"
                  icon={getAlertIcon('herb-interaction')}
                >
                  <AlertCard
                    type="herb-interaction"
                    title=""
                    items={herb.herb_herb_interactions}
                    onHerbClick={handleHerbClick}
                    onFormulaClick={handleFormulaClick}
                  />
                </Accordion>
              )}

              {canView(permissions?.safety.allergens) && (herb.allergens?.length || 0) > 0 && (
                <Accordion
                  title="Allergens"
                  defaultOpen={false}
                  storageKey={`herb-${herb.herb_id}-allergens`}
                  size="small"
                  icon={getAlertIcon('allergen')}
                >
                  <AlertCard
                    type="allergen"
                    title=""
                    items={herb.allergens}
                    onHerbClick={handleHerbClick}
                    onFormulaClick={handleFormulaClick}
                  />
                </Accordion>
              )}
            </div>
          </Accordion>
        </section>
      )}

      {/* Separator between Safety and Research */}
      {(() => {
        const propertiesSection = sections.find(s => s.id === 'properties');
        const clinicalUseSection = sections.find(s => s.id === 'clinical-use');
        const safetySection = sections.find(s => s.id === 'safety');
        const researchSection = sections.find(s => s.id === 'research');
        const hasAnySectionBefore = propertiesSection?.show || clinicalUseSection?.show || safetySection?.show;
        return researchSection?.show && hasAnySectionBefore;
      })() && (
        <div className="border-t border-gray-200 my-0 sm:my-5"></div>
      )}

      {/* Research */}
      {(() => {
        const researchSection = sections.find(s => s.id === 'research');
        if (!researchSection?.show) return null;

        const hasPharm = canView(permissions?.research.pharmacologicalEffects) && (herb.pharmacological_effects?.length || 0) > 0 && herb.pharmacological_effects?.some(effect => typeof effect === 'string' && effect.trim());
        const herbMechanisms = getHerbBiologicalMechanisms(herb.pinyin_name);
        const hasMech = canView(permissions?.research.biologicalMechanisms) && herbMechanisms.length > 0 && herbMechanisms.some(m => m.system && m.system.trim() && m.target_action && m.target_action.trim());
        const hasStudies = canView(permissions?.research.clinicalStudies) && (herb.clinical_studies_and_research?.length || 0) > 0;
        return (hasPharm || hasMech || hasStudies) && (
          <section id="herb-detail-research" className="scroll-mt-4">
            <Accordion 
              title="Research" 
              defaultOpen={true}
              storageKey="herb-research-section"
              size="large"
            >
            <div className="space-y-4">
            {canView(permissions?.research.pharmacologicalEffects) && (herb.pharmacological_effects?.length || 0) > 0 && (
              <Accordion 
                title="Pharmacological effects" 
                defaultOpen={false}
                storageKey={`herb-${herb.herb_id}-pharmacological-effects`}
                size="small"
              >
                <div className="flex flex-wrap gap-1.5 bg-gray-50 rounded-lg p-4 border border-gray-50">
                  {herb.pharmacological_effects.map((effect, idx) => (
                    <Chip key={idx} variant="primary">{effect}</Chip>
                  ))}
                </div>
              </Accordion>
            )}

            {canView(permissions?.research.biologicalMechanisms) && (() => {
              const herbMechanisms = getHerbBiologicalMechanisms(herb.pinyin_name);
              const validMechanisms = herbMechanisms.filter(m =>
                m.system && m.system.trim() && m.target_action && m.target_action.trim()
              );

              if (validMechanisms.length === 0) return null;

              return (
                <Accordion
                  title="Biological mechanisms"
                  defaultOpen={false}
                  storageKey={`herb-${herb.herb_id}-biological-mechanisms`}
                  size="small"
                >
                  <div className="bg-gray-50 rounded-lg p-5 border border-gray-50">
                    <div className="space-y-4">
                      {validMechanisms.map((mechanism, idx) => (
                        <div key={idx}>
                          <p className="text-base font-semibold text-gray-700 mb-2">{mechanism.system}</p>
                          <div className="flex flex-wrap gap-2">
                            {(() => {
                              const actions = Array.isArray(mechanism.target_action)
                                ? mechanism.target_action
                                : [mechanism.target_action];

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
              );
            })()}

            {(permissions?.research.bioactiveCompounds !== false) && (herb.bioactive_compounds?.length || 0) > 0 && (() => {
              // Detect if it's simple array or grouped array
              const isSimpleArray = typeof herb.bioactive_compounds[0] === 'string';

              if (isSimpleArray) {
                // Render as chips (simple array of strings)
                return (
                  <Accordion
                    title="Bioactive compounds"
                    defaultOpen={false}
                    storageKey={`herb-${herb.herb_id}-bioactive-compounds`}
                    size="small"
                  >
                    <div className="flex flex-wrap gap-1.5 bg-gray-50 rounded-lg p-4 border border-gray-50">
                      {(herb.bioactive_compounds as string[]).map((compound, idx) => (
                        <Chip key={idx} variant="success">{compound}</Chip>
                      ))}
                    </div>
                  </Accordion>
                );
              } else {
                // Render grouped by chemical_class (like biological mechanisms)
                const groupedCompounds = herb.bioactive_compounds as Array<{ chemical_class: string; compounds: string[] }>;
                const validGroups = groupedCompounds.filter(g => g.chemical_class && g.chemical_class.trim() && g.compounds && g.compounds.length > 0);

                if (validGroups.length === 0) return null;

                return (
                  <Accordion
                    title="Bioactive compounds"
                    defaultOpen={false}
                    storageKey={`herb-${herb.herb_id}-bioactive-compounds`}
                    size="small"
                  >
                    <div className="bg-gray-50 rounded-lg p-5 border border-gray-50">
                      <div className="space-y-4">
                        {validGroups.map((group, idx) => (
                          <div key={idx}>
                            <p className="text-base font-semibold text-gray-700 mb-2">{group.chemical_class}</p>
                            <div className="flex flex-wrap gap-2">
                              {group.compounds.map((compound, compIdx) => (
                                <Chip key={compIdx} variant="success">
                                  {compound}
                                </Chip>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Accordion>
                );
              }
            })()}

            {canView(permissions?.research.clinicalStudies) && (herb.clinical_studies_and_research?.length || 0) > 0 && (
              <Accordion 
                title="Clinical studies and research" 
                defaultOpen={false}
                storageKey={`herb-${herb.herb_id}-clinical-studies`}
                size="small"
              >
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-50">
                  <div className="space-y-3">
                    {herb.clinical_studies_and_research.map((study, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 self-start mt-2.5"></div>
                        <p className="text-gray-800 leading-relaxed flex-1">{study}</p>
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

      {/* Separator between Research and Found in / References & Notes */}
      {(() => {
        const propertiesSection = sections.find(s => s.id === 'properties');
        const clinicalUseSection = sections.find(s => s.id === 'clinical-use');
        const safetySection = sections.find(s => s.id === 'safety');
        const researchSection = sections.find(s => s.id === 'research');
        const foundInSection = sections.find(s => s.id === 'found-in');
        const referencesSection = sections.find(s => s.id === 'references-notes');
        const hasAnySectionBefore = propertiesSection?.show || clinicalUseSection?.show || safetySection?.show || researchSection?.show;
        return (foundInSection?.show || referencesSection?.show) && hasAnySectionBefore;
      })() && (
        <div className="border-t border-gray-200 my-0 sm:my-5"></div>
      )}

      {/* Found in Formulas */}
      {(() => {
        const foundInSection = sections.find(s => s.id === 'found-in');
        return foundInSection?.show;
      })() && (
        <section id="herb-detail-found-in" className="scroll-mt-4">
          <Accordion 
            title="Found in" 
            defaultOpen={true}
            storageKey={`herb-${herb.herb_id}-found-in`}
            size="large"
          >
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-50">
              <div className="flex flex-wrap gap-2">
                {formulasWithThisHerb.map((formulaName, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleFormulaClick(formulaName)}
                    className={`chip-compact inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-900 border ${getFormulaChipBorderColor(formulaName)} hover:bg-gray-300 cursor-pointer transition-colors`}
                  >
                    {formulaName}
                  </button>
                ))}
              </div>
            </div>
          </Accordion>
        </section>
      )}

      {/* References & Notes */}
      {(() => {
        const referencesSection = sections.find(s => s.id === 'references-notes');
        return referencesSection?.show;
      })() && (
        <section id="herb-detail-references-notes" className="scroll-mt-4">
          <Accordion 
            title="References & Notes" 
            defaultOpen={true}
            storageKey="herb-references-notes-section"
            size="large"
          >
          <div className="space-y-4">
          {canView(permissions?.referencesNotes?.references) && (herb.references?.length || 0) > 0 && (
            <Accordion 
              title="References" 
              defaultOpen={false}
              storageKey={`herb-${herb.herb_id}-references`}
              size="small"
            >
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-50">
                <div className="space-y-3">
                  {herb.references.map((reference, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 self-start mt-2.5"></div>
                      <p className="text-gray-800 leading-relaxed flex-1">{reference}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Accordion>
          )}

          {canView(permissions?.referencesNotes?.notes) && (herb.notes?.length || 0) > 0 && (
            <Accordion
              title="Notes"
              defaultOpen={false}
              storageKey={`herb-${herb.herb_id}-notes`}
              size="small"
            >
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-50">
                <div className="space-y-3">
                  {herb.notes.map((note, idx) => (
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
          <div className="flex gap-3">
            {onEdit && (
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Edit herb
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete herb
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