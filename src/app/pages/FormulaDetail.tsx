import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getAllFormulas, isCustomFormula, deleteCustomFormula } from '@/app/data/formulasManager';
import { getAllHerbs } from '@/app/data/herbsManager';
import { getPrescriptionsSync } from '@/app/data/prescriptions';
import { Chip } from '@/app/components/ui/Chip';
import { AlertCard } from '@/app/components/ui/AlertCard';
import { ThermalActionIndicator } from '@/app/components/ui/ThermalActionIndicator';
import { ChevronLeft, Edit2, Trash2, Ban, AlertCircle, ChevronDown } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { getPlatformSettings } from '@/app/data/platformSettings';
import { useSwipeBack } from '../hooks/useSwipeBack';
import { useHerbBannedStatus } from '../hooks/useHerbBannedStatus';
import { useGlobalSettings } from '../hooks/useGlobalSettings';
import { useFormulaDetailPermissions } from '../hooks/useDetailPermissions';
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';

export default function FormulaDetail() {
  const { formulaName } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [expandedFormulas, setExpandedFormulas] = useState<Set<number>>(new Set());
  const { isHerbBanned } = useHerbBannedStatus();
  const { globalSettings } = useGlobalSettings();
  const permissions = useFormulaDetailPermissions();

  // Enable swipe-to-go-back gesture on mobile
  useSwipeBack();
  
  // Toggle formula expansion
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
  
  // Load display settings from localStorage (refresh cache)
  const getDisplaySettings = () => {
    try {
      const saved = localStorage.getItem('formulas-display-settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      // Ignore parse errors
    }
    return {
      pinyin: true,
      pharmaceutical: true,
      hanzi: true,
      order: ['pinyin', 'pharmaceutical', 'hanzi']
    };
  };
  
  const displaySettings = getDisplaySettings();
  
  // Filter order to only include name fields
  const nameOrder = displaySettings.order.filter((field: string) => 
    field === 'pinyin' || field === 'pharmaceutical' || field === 'hanzi'
  );
  
  const formulasData = getAllFormulas();
  const herbsData = getAllHerbs();
  const formula = formulasData.find(f => f.formula_id === decodeURIComponent(formulaName || ''));
  
  // Check where we came from
  const from = searchParams.get('from');
  const fromContentManagement = from === 'admin-content';
  const fromFormulasList = from === 'formulas-list';
  const fromPrescription = from === 'prescription';
  const prescriptionId = searchParams.get('prescriptionId');
  
  // Get prescription name if coming from prescription
  const prescription = fromPrescription && prescriptionId 
    ? getPrescriptionsSync().find(p => p.id === prescriptionId)
    : null;

  if (!formula) {
    return (
      <div className="lg:ml-[20.5rem] lg:max-w-5xl px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Formula not found</h1>
          <Link 
            to="/formulas" 
            className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 group"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
        </div>
      </div>
    );
  }

  // Helper function to extract herb name from composition string (e.g., "Ma Huang 9g" -> "Ma Huang")
  const extractHerbName = (compositionItem: string | { herb_pinyin: string; pharmaceutical_name: string; dosage: string; preparation_note?: string }): string => {
    if (typeof compositionItem === 'object') {
      return compositionItem.herb_pinyin;
    }
    // Fallback for old string format
    return compositionItem.replace(/\s+\d+(\.\d+)?g?\s*$/i, '').trim();
  };

  // Helper function to extract dosage from composition string (e.g., "Ma Huang 9g" -> "9g")
  const extractDosage = (compositionItem: string | { herb_pinyin: string; pharmaceutical_name: string; dosage: string; preparation_note?: string }): string => {
    if (typeof compositionItem === 'object') {
      return compositionItem.dosage;
    }
    // Fallback for old string format
    const match = compositionItem.match(/\d+(\.\d+)?g?$/i);
    return match ? match[0] : '';
  };

  // Helper function to get pharmaceutical name
  const getPharmaceuticalName = (compositionItem: string | { herb_pinyin: string; pharmaceutical_name: string; dosage: string; preparation_note?: string }): string => {
    if (typeof compositionItem === 'object') {
      return compositionItem.pharmaceutical_name;
    }
    return '';
  };

  // Helper function to get preparation note
  const getPreparationNote = (compositionItem: string | { herb_pinyin: string; pharmaceutical_name: string; dosage: string; preparation_note?: string }): string => {
    if (typeof compositionItem === 'object') {
      return compositionItem.preparation_note || '';
    }
    return '';
  };

  // Helper function to get herb data by name
  const getHerbData = (herbName: string) => {
    return herbsData.find(h => h.pinyin_name.toLowerCase() === herbName.toLowerCase());
  };

  // Helper function to get formula data by name
  const getFormulaData = (formulaName: string) => {
    return formulasData.find(f => f.pinyin_name.toLowerCase() === formulaName.toLowerCase());
  };

  // Helper function to expand formula ingredients with proportional dosage
  const expandIngredients = (composition: Array<string | { herb_pinyin: string; pharmaceutical_name: string; dosage: string; preparation_note?: string }>) => {
    const expanded: Array<{
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
    }> = [];

    composition.forEach((ingredient) => {
      const name = extractHerbName(ingredient);
      const dosage = extractDosage(ingredient);
      const pharmaceuticalName = getPharmaceuticalName(ingredient);
      const preparationNote = getPreparationNote(ingredient);

      // Check if this ingredient is a formula
      const formulaData = getFormulaData(name);

      if (formulaData && formulaData.composition.length > 0 && globalSettings.formulas.ingredientsShowFormulas) {
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

  // Helper function to get border color based on herb nature
  const getNatureBorderColor = (herbName: string): string => {
    const herb = getHerbData(herbName);
    
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

  // Helper function to get border color based on formula thermal action
  const getThermalActionBorderColor = (formulaName: string): string => {
    const formulaData = getFormulaData(formulaName);
    
    if (!formulaData || !formulaData.thermal_action) return 'border-gray-300';
    
    const thermalAction = formulaData.thermal_action.toLowerCase();
    
    if (thermalAction.includes('very hot') || thermalAction === 'muy caliente') return 'border-red-700';
    if (thermalAction === 'hot' || thermalAction === 'caliente') return 'border-red-500';
    if (thermalAction === 'warm' || thermalAction === 'templado') return 'border-orange-500';
    if (thermalAction === 'neutral' || thermalAction === 'neutro') return 'border-gray-400';
    if (thermalAction === 'cool' || thermalAction === 'fresca') return 'border-blue-400';
    if (thermalAction === 'cold' || thermalAction === 'fría') return 'border-blue-600';
    if (thermalAction.includes('very cold') || thermalAction === 'muy fría') return 'border-blue-800';
    
    return 'border-gray-300';
  };

  // Helper function to get full border color based on formula thermal action
  const getThermalActionFullBorderColor = (formulaName: string): string => {
    return getThermalActionBorderColor(formulaName);
  };

  const sections = [
    { id: 'composition', label: 'Composition', show: formula.composition.length > 0 },
    { id: 'clinical-use', label: 'Clinical use', show: formula.tcm_actions.length > 0 || formula.clinical_manifestations.length > 0 || formula.clinical_applications.length > 0 },
    { id: 'modifications', label: 'Modifications', show: formula.modifications.length > 0 },
    { id: 'safety', label: 'Safety', show: formula.contraindications.length > 0 || formula.cautions.length > 0 || formula.drug_interactions.length > 0 || formula.herb_interactions.length > 0 || formula.allergens.length > 0 || formula.toxicology.length > 0 },
    { id: 'research', label: 'Research', show: formula.pharmacological_effects.length > 0 || formula.biological_mechanisms.length > 0 || (formula.bioactive_compounds?.length || 0) > 0 || (formula.detoxification?.length || 0) > 0 || formula.clinical_studies_and_research.length > 0 || (formula.notes?.length || 0) > 0 }
  ].filter(s => s.show);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-2 sm:p-4 lg:p-6 flex flex-col gap-2 sm:gap-4">
        <div className="flex gap-4 lg:gap-6">
          {/* Left spacer to match sidebar width on desktop */}
          <div className="hidden lg:block w-72 flex-shrink-0" />
          
          {/* Main content area - aligned with Formulas main, centered */}
          <div className="flex-1 min-w-0 flex flex-col gap-2 sm:gap-4">
            {/* Back button and Settings button */}
            <div className="flex items-center justify-between h-10 sm:h-auto">
            {fromContentManagement ? (
              <Link 
                to="/admin/content" 
                className="h-10 w-10 sm:w-11 sm:h-11 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
                title="Back to Admin"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
            ) : fromPrescription && prescriptionId ? (
              <Link 
                to={`/prescriptions/${prescriptionId}`} 
                className="h-10 w-10 sm:w-11 sm:h-11 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
                title="Back to Prescription"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
            ) : fromFormulasList ? (
              <Link 
                to="/formulas" 
                className="h-10 w-10 sm:w-11 sm:h-11 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
                title="Back to Formulas"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
            ) : (
              <Link 
                to="/formulas" 
                className="h-10 w-10 sm:w-11 sm:h-11 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
                title="Back to Formulas"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
            )}
            </div>
            
            {/* White container */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">

      {/* Header */}
      <div className="mb-8">
        {/* Mobile layout - vertical stack */}
        <div className="sm:hidden">
          {nameOrder.map((fieldType, idx) => {
            const isFirst = idx === 0;
            
            switch (fieldType) {
              case 'pinyin':
                return (
                  <h1 key="pinyin" className={isFirst ? "text-2xl font-bold text-gray-900 mb-1" : "text-base text-gray-500 mb-1"}>
                    {formula.pinyin_name}
                  </h1>
                );
              
              case 'pharmaceutical':
                return formula.translated_name ? (
                  <div key="pharmaceutical" className={isFirst ? "text-2xl font-bold text-gray-900 mb-1" : "text-base text-gray-500 mb-1"}>
                    {formula.translated_name}
                    {/* Alternative names hidden temporarily */}
                    {/* {!isFirst && formula.alternative_names.length > 0 && (
                      <span> | {formula.alternative_names.join(', ')}</span>
                    )} */}
                  </div>
                ) : null;
              
              case 'hanzi':
                return (
                  <div key="hanzi" className={isFirst ? "text-2xl font-bold text-gray-900 mb-3 font-hanzi" : "text-base text-gray-400 mb-3 font-hanzi"}>
                    {formula.hanzi_name}
                  </div>
                );
              
              default:
                return null;
            }
          })}
          
          {(formula.category || formula.subcategory) && (
            <div className="flex gap-2 mb-4">
              {formula.category && (
                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-teal-100 text-teal-800">
                  {formula.category}
                </span>
              )}
              {formula.subcategory && (
                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {formula.subcategory}
                </span>
              )}
            </div>
          )}
          
          {formula.source && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Source: </span>
              {formula.source}
            </div>
          )}
        </div>

        {/* Desktop layout - original */}
        <div className="hidden sm:block">
          {nameOrder.map((fieldType, idx) => {
            const isFirst = idx === 0;
            
            switch (fieldType) {
              case 'pinyin':
                return (
                  <h1 key="pinyin" className={isFirst ? "text-3xl font-bold text-gray-900 mb-2" : "text-2xl text-gray-500 mb-2"}>
                    {formula.pinyin_name}
                  </h1>
                );
              
              case 'pharmaceutical':
                return formula.translated_name ? (
                  <div key="pharmaceutical" className={isFirst ? "text-3xl font-bold text-gray-900 mb-2" : "text-2xl text-gray-500 mb-2"}>
                    {formula.translated_name}
                  </div>
                ) : null;
              
              case 'hanzi':
                return (
                  <div key="hanzi" className={isFirst ? "text-3xl font-bold text-gray-900 mb-4 font-hanzi" : "text-lg text-gray-400 mb-4 font-hanzi"}>
                    {formula.hanzi_name}
                  </div>
                );
              
              default:
                return null;
            }
          })}
          
          {/* Alternative names hidden temporarily */}
          {/* {formula.alternative_names.length > 0 && (
            <div className="text-2xl text-gray-500 mb-2">
              {formula.alternative_names.map((name, idx) => (
                <span key={idx}>
                  {idx > 0 && <span className="text-gray-400 mx-2">|</span>}
                  {name}
                </span>
              ))}
            </div>
          )} */}
          
          {(formula.category || formula.subcategory) && (
            <div className="flex gap-2 mb-4">
              {formula.category && (
                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-teal-100 text-teal-800">
                  {formula.category}
                </span>
              )}
              {formula.subcategory && (
                <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {formula.subcategory}
                </span>
              )}
            </div>
          )}
          
          {formula.source && (
            <div className="text-gray-600">
              <span className="font-medium">Source: </span>
              {formula.source}
            </div>
          )}
        </div>
      </div>

      {/* Jump labels */}
      {sections.length > 0 && (
        <div className="flex overflow-x-auto sm:flex-wrap items-center gap-3 mb-8 pb-6 border-b border-gray-200">
          {sections.flatMap((section, index) => {
            const button = (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors whitespace-nowrap flex-shrink-0"
              >
                {section.label}
              </button>
            );
            
            if (index === 0) {
              return [button];
            }
            
            return [
              <div key={`sep-${section.id}`} className="w-px h-6 bg-gray-300 flex-shrink-0"></div>,
              button
            ];
          })}
        </div>
      )}

      {/* Composition */}
      {permissions.composition && formula.composition.length > 0 && (
        <section id="composition" className="mb-12 scroll-mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Composition</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Ingredients</h3>
              <div className={globalSettings.formulas.ingredientsLayout === 'list' ? 'space-y-3 max-w-md' : 'grid grid-cols-1 md:grid-cols-2 gap-3'}>
                {expandIngredients(formula.composition).map((ingredient, idx) => {
                  if (ingredient.isFormula && ingredient.subComponents) {
                    // Render formula with subcomponents in container
                    const isExpanded = expandedFormulas.has(idx);
                    const formulaExists = getFormulaData(ingredient.name);
                    
                    return (
                      <div 
                        key={idx} 
                        onClick={formulaExists ? () => navigate(`/formulas/${encodeURIComponent(formulaExists.formula_id)}?from=formula&formulaName=${encodeURIComponent(formula.formula_id)}`) : undefined}
                        className={`bg-gray-50 rounded-lg p-3 space-y-2 hover:bg-gray-100 transition-colors ${formulaExists ? 'cursor-pointer' : ''} border ${
                          globalSettings.formulas.ingredientsThermalIndicator 
                            ? getThermalActionFullBorderColor(ingredient.name)
                            : 'border-gray-200'
                        }`}
                      >
                        {/* Formula name with chevron to expand/collapse */}
                        <div className="w-full flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFormulaExpansion(idx);
                              }}
                              className="hover:opacity-75 transition-opacity flex items-center justify-center"
                            >
                              <ChevronDown 
                                className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                              />
                            </button>
                            <span className="text-gray-900 font-semibold whitespace-nowrap">
                              {ingredient.name}
                            </span>
                          </div>
                          {ingredient.dosage && (
                            <span className="text-gray-700 font-medium text-sm flex-shrink-0">{ingredient.dosage}</span>
                          )}
                        </div>
                        
                        {/* Subcomponents - only show when expanded */}
                        {isExpanded && (
                          <div className="space-y-1 ml-6">
                            {ingredient.subComponents.map((sub, subIdx) => {
                              const herb = getHerbData(sub.name);
                              const isBanned = herb ? isHerbBanned(herb) : false;
                              
                              if (herb) {
                                return (
                                  <Link
                                    key={subIdx}
                                    to={`/herbs/${encodeURIComponent(sub.name)}?from=formula&formulaName=${encodeURIComponent(formula.formula_id)}`}
                                    className={`bg-gray-50 pl-3 py-2 rounded flex items-center justify-between gap-2 hover:bg-gray-100 transition-colors cursor-pointer block ${
                                      globalSettings.formulas.ingredientsNatureIndicator
                                        ? `border ${getNatureBorderColor(sub.name)}`
                                        : 'border border-gray-200'
                                    }`}
                                  >
                                    <div className="flex items-baseline gap-2 flex-1 min-w-0">
                                      <span className="text-sm text-gray-900">{sub.name}</span>
                                      {sub.pharmaceuticalName && (
                                        <span className="text-xs text-gray-600">{sub.pharmaceuticalName}</span>
                                      )}
                                      {isBanned && (
                                        <Ban className="w-3 h-3 text-red-600 flex-shrink-0" />
                                      )}
                                    </div>
                                    {sub.dosage && (
                                      <span className="text-xs text-gray-500 flex-shrink-0">{sub.dosage}</span>
                                    )}
                                  </Link>
                                );
                              } else {
                                // Herb doesn't exist - render with hover but non-clickable
                                return (
                                  <div
                                    key={subIdx}
                                    className={`bg-gray-50 pl-3 py-2 rounded flex items-center justify-between gap-2 hover:bg-gray-100 transition-colors ${
                                      globalSettings.formulas.ingredientsNatureIndicator
                                        ? `border ${getNatureBorderColor(sub.name)}`
                                        : 'border border-gray-200'
                                    }`}
                                  >
                                    <div className="flex items-baseline gap-2 flex-1 min-w-0">
                                      <span className="text-sm text-gray-900">{sub.name}</span>
                                      {sub.pharmaceuticalName && (
                                        <span className="text-xs text-gray-600">{sub.pharmaceuticalName}</span>
                                      )}
                                    </div>
                                    {sub.dosage && (
                                      <span className="text-xs text-gray-500 flex-shrink-0">{sub.dosage}</span>
                                    )}
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
                    const herb = getHerbData(ingredient.name);
                    const isBanned = herb ? isHerbBanned(herb) : false;
                    
                    if (herb) {
                      return (
                        <Link
                          key={idx}
                          to={`/herbs/${encodeURIComponent(ingredient.name)}?from=formula&formulaName=${encodeURIComponent(formula.formula_id)}`}
                          className={`bg-gray-50 rounded-lg p-3 border ${
                            globalSettings.formulas.ingredientsNatureIndicator
                              ? getNatureBorderColor(ingredient.name)
                              : 'border-gray-200'
                          } hover:bg-gray-100 transition-colors cursor-pointer block`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-baseline gap-2 flex-1 min-w-0">
                              <span className="text-gray-900 font-semibold whitespace-nowrap">{ingredient.name}</span>
                              {ingredient.pharmaceuticalName && (
                                <span className="text-sm text-gray-600">{ingredient.pharmaceuticalName}</span>
                              )}
                              {isBanned && (
                                <Ban className="w-4 h-4 text-red-600 flex-shrink-0" />
                              )}
                            </div>
                            {ingredient.dosage && (
                              <span className="text-gray-700 font-medium text-sm flex-shrink-0">{ingredient.dosage}</span>
                            )}
                          </div>
                        </Link>
                      );
                    } else {
                      // Herb doesn't exist - render with hover but non-clickable
                      return (
                        <div
                          key={idx}
                          className={`bg-gray-50 rounded-lg p-3 border ${
                            globalSettings.formulas.ingredientsNatureIndicator
                              ? getNatureBorderColor(ingredient.name)
                              : 'border-gray-200'
                          } hover:bg-gray-100 transition-colors`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-baseline gap-2 flex-1 min-w-0">
                              <span className="text-gray-900 font-semibold whitespace-nowrap">{ingredient.name}</span>
                              {ingredient.pharmaceuticalName && (
                                <span className="text-sm text-gray-600">{ingredient.pharmaceuticalName}</span>
                              )}
                            </div>
                            {ingredient.dosage && (
                              <span className="text-gray-700 font-medium text-sm flex-shrink-0">{ingredient.dosage}</span>
                            )}
                          </div>
                        </div>
                      );
                    }
                  }
                })}
              </div>
            </div>

            {formula.thermal_action && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Thermal Action</h3>
                <ThermalActionIndicator thermalAction={formula.thermal_action} />
              </div>
            )}

            {formula.dosage.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Dosage</h3>
                <div className="space-y-2">
                  {formula.dosage.map((dose, idx) => (
                    <div key={idx} className="flex gap-2">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 mt-2.5"></div>
                      <p className="text-gray-700 leading-relaxed flex-1">{dose}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formula.preparation.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Preparation</h3>
                <div className="space-y-2">
                  {formula.preparation.map((prep, idx) => (
                    <div key={idx} className="flex gap-2">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 mt-2.5"></div>
                      <p className="text-gray-700 leading-relaxed flex-1">{prep}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formula.administration.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Administration</h3>
                <div className="space-y-2">
                  {formula.administration.map((admin, idx) => (
                    <div key={idx} className="flex gap-2">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 mt-2.5"></div>
                      <p className="text-gray-700 leading-relaxed flex-1">{admin}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Separator between sections */}
      {(formula.tcm_actions.length > 0 || formula.clinical_manifestations.length > 0 || formula.clinical_applications.length > 0) && (
        <div className="border-t border-gray-300 my-12"></div>
      )}

      {/* Clinical use */}
      {(formula.tcm_actions.length > 0 || formula.clinical_manifestations.length > 0 || formula.clinical_applications.length > 0) && (
        <section id="clinical-use" className="mb-12 scroll-mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Clinical use</h2>
          
          {permissions.clinicalUse.tcmActions && formula.tcm_actions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">TCM actions</h3>
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-50">
                <div className="space-y-3">
                  {formula.tcm_actions.map((action, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-teal-600 mt-2"></div>
                      <p className="text-gray-800 leading-relaxed flex-1">{action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {permissions.clinicalUse.clinicalManifestations && formula.clinical_manifestations.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Clinical manifestations</h3>
              <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                <div className="space-y-3">
                  {formula.clinical_manifestations.map((manifestation, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></div>
                      <p className="text-gray-800 leading-relaxed flex-1">{manifestation}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {permissions.clinicalUse.clinicalApplications && formula.clinical_applications.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Clinical applications</h3>
              <div className="bg-purple-50 rounded-lg p-5 border border-purple-100">
                <div className="space-y-3">
                  {formula.clinical_applications.map((app, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-purple-600 mt-2"></div>
                      <p className="text-gray-800 leading-relaxed flex-1">{app.condition}{app.pattern && ` • ${app.pattern}`}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Separator between sections */}
      {formula.modifications.length > 0 && (
        <div className="border-t border-gray-300 my-12"></div>
      )}

      {/* Modifications */}
      {permissions.modifications && formula.modifications.length > 0 && (
        <section id="modifications" className="mb-12 scroll-mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Modifications</h2>
          {formula.modifications.length === 1 ? (
            <div className="bg-amber-50 rounded-lg p-5 border border-amber-100">
              {typeof formula.modifications[0] === 'string' ? (
                <p className="text-gray-800 leading-relaxed">{formula.modifications[0]}</p>
              ) : (
                <div className="space-y-3">
                  {formula.modifications[0].explanation && (
                    <p className="text-gray-700 leading-relaxed mb-3">{formula.modifications[0].explanation}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {formula.modifications[0].add_herbs?.map((herbName, herbIdx) => (
                      <Link
                        key={`add-${herbIdx}`}
                        to={`/herbs/${encodeURIComponent(herbName)}`}
                        className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-green-100 text-green-800 border border-green-300 no-underline"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        {herbName}
                      </Link>
                    ))}
                    {formula.modifications[0].remove_herbs?.map((herbName, herbIdx) => (
                      <Link
                        key={`remove-${herbIdx}`}
                        to={`/herbs/${encodeURIComponent(herbName)}`}
                        className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-red-100 text-red-800 border border-red-300 no-underline leading-none"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        {herbName}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {formula.modifications.map((modification, idx) => (
                <div key={idx} className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                  {typeof modification === 'string' ? (
                    <p className="text-gray-800 leading-relaxed">{modification}</p>
                  ) : (
                    <div className="space-y-3">
                      {modification.explanation && (
                        <p className="text-gray-700 leading-relaxed">{modification.explanation}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {modification.add_herbs?.map((herbName, herbIdx) => (
                          <Link
                            key={`add-${herbIdx}`}
                            to={`/herbs/${encodeURIComponent(herbName)}`}
                            className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-green-100 text-green-800 border border-green-300 no-underline"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                          >
                            {herbName}
                          </Link>
                        ))}
                        {modification.remove_herbs?.map((herbName, herbIdx) => (
                          <Link
                            key={`remove-${herbIdx}`}
                            to={`/herbs/${encodeURIComponent(herbName)}`}
                            className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-red-100 text-red-800 border border-red-300 no-underline leading-none"
                            style={{ WebkitTapHighlightColor: 'transparent' }}
                          >
                            {herbName}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Separator between sections */}
      {(formula.contraindications.length > 0 || formula.cautions.length > 0 || formula.drug_interactions.length > 0 || formula.herb_interactions.length > 0 || formula.allergens.length > 0 || formula.toxicology.length > 0) && (
        <div className="border-t border-gray-300 my-12"></div>
      )}

      {/* Safety */}
      {(formula.contraindications.length > 0 || formula.cautions.length > 0 || formula.drug_interactions.length > 0 || formula.herb_interactions.length > 0 || formula.allergens.length > 0 || formula.toxicology.length > 0) && (
        <section id="safety" className="mb-12 scroll-mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Safety & alerts</h2>
          <div className="space-y-4">
            {permissions.safety.contraindications && formula.contraindications.length > 0 && (
              <div>
                <div className="flex gap-2 items-center mb-3">
                  {(() => {
                    const settings = getPlatformSettings().designSettings;
                    const customSvg = settings.customAlertSvgs?.contraindications;
                    const iconColor = settings.alertColors.contraindications.icon;
                    
                    if (customSvg) {
                      return (
                        <div 
                          className="w-5 h-5 flex-shrink-0"
                          style={{ color: iconColor }}
                          dangerouslySetInnerHTML={{ __html: customSvg }}
                        />
                      );
                    }
                    
                    const iconName = settings.alertIcons.contraindications;
                    const Icon = (LucideIcons as any)[iconName] || AlertCircle;
                    
                    return <Icon className="w-5 h-5 flex-shrink-0" style={{ color: iconColor }} />;
                  })()}
                  <h3 className="text-lg font-semibold text-gray-900">Contraindications</h3>
                </div>
                <div 
                  className="rounded-lg border p-4"
                  style={{
                    backgroundColor: getPlatformSettings().designSettings.alertColors.contraindications.bg,
                    borderColor: getPlatformSettings().designSettings.alertColors.contraindications.border
                  }}
                >
                  <div className="space-y-2">
                    {formula.contraindications.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: getPlatformSettings().designSettings.alertColors.contraindications.icon }}></div>
                        <p className="leading-relaxed flex-1" style={{ color: getPlatformSettings().designSettings.alertColors.contraindications.text }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {permissions.safety.cautions && formula.cautions.length > 0 && (
              <div>
                <div className="flex gap-2 items-center mb-3">
                  {(() => {
                    const settings = getPlatformSettings().designSettings;
                    const customSvg = settings.customAlertSvgs?.cautions;
                    const iconColor = settings.alertColors.cautions.icon;
                    
                    if (customSvg) {
                      return (
                        <div 
                          className="w-5 h-5 flex-shrink-0"
                          style={{ color: iconColor }}
                          dangerouslySetInnerHTML={{ __html: customSvg }}
                        />
                      );
                    }
                    
                    const iconName = settings.alertIcons.cautions;
                    const Icon = (LucideIcons as any)[iconName] || AlertCircle;
                    
                    return <Icon className="w-5 h-5 flex-shrink-0" style={{ color: iconColor }} />;
                  })()}
                  <h3 className="text-lg font-semibold text-gray-900">Cautions</h3>
                </div>
                <div 
                  className="rounded-lg border p-4"
                  style={{
                    backgroundColor: getPlatformSettings().designSettings.alertColors.cautions.bg,
                    borderColor: getPlatformSettings().designSettings.alertColors.cautions.border
                  }}
                >
                  <div className="space-y-2">
                    {formula.cautions.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: getPlatformSettings().designSettings.alertColors.cautions.icon }}></div>
                        <p className="leading-relaxed flex-1" style={{ color: getPlatformSettings().designSettings.alertColors.cautions.text }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {permissions.safety.drugInteractions && formula.drug_interactions.length > 0 && (
              <div>
                <div className="flex gap-2 items-center mb-3">
                  {(() => {
                    const settings = getPlatformSettings().designSettings;
                    const customSvg = settings.customAlertSvgs?.drugInteractions;
                    const iconColor = settings.alertColors.drugInteractions.icon;
                    
                    if (customSvg) {
                      return (
                        <div 
                          className="w-5 h-5 flex-shrink-0"
                          style={{ color: iconColor }}
                          dangerouslySetInnerHTML={{ __html: customSvg }}
                        />
                      );
                    }
                    
                    const iconName = settings.alertIcons.drugInteractions;
                    const Icon = (LucideIcons as any)[iconName] || AlertCircle;
                    
                    return <Icon className="w-5 h-5 flex-shrink-0" style={{ color: iconColor }} />;
                  })()}
                  <h3 className="text-lg font-semibold text-gray-900">Drug interactions</h3>
                </div>
                <div 
                  className="rounded-lg border p-4"
                  style={{
                    backgroundColor: getPlatformSettings().designSettings.alertColors.drugInteractions.bg,
                    borderColor: getPlatformSettings().designSettings.alertColors.drugInteractions.border
                  }}
                >
                  <div className="space-y-2">
                    {formula.drug_interactions.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: getPlatformSettings().designSettings.alertColors.drugInteractions.icon }}></div>
                        <p className="leading-relaxed flex-1" style={{ color: getPlatformSettings().designSettings.alertColors.drugInteractions.text }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {permissions.safety.herbInteractions && formula.herb_interactions.length > 0 && (
              <div>
                <div className="flex gap-2 items-center mb-3">
                  {(() => {
                    const settings = getPlatformSettings().designSettings;
                    const customSvg = settings.customAlertSvgs?.herbInteractions;
                    const iconColor = settings.alertColors.herbInteractions.icon;
                    
                    if (customSvg) {
                      return (
                        <div 
                          className="w-5 h-5 flex-shrink-0"
                          style={{ color: iconColor }}
                          dangerouslySetInnerHTML={{ __html: customSvg }}
                        />
                      );
                    }
                    
                    const iconName = settings.alertIcons.herbInteractions;
                    const Icon = (LucideIcons as any)[iconName] || AlertCircle;
                    
                    return <Icon className="w-5 h-5 flex-shrink-0" style={{ color: iconColor }} />;
                  })()}
                  <h3 className="text-lg font-semibold text-gray-900">Herb interactions</h3>
                </div>
                <div 
                  className="rounded-lg border p-4"
                  style={{
                    backgroundColor: getPlatformSettings().designSettings.alertColors.herbInteractions.bg,
                    borderColor: getPlatformSettings().designSettings.alertColors.herbInteractions.border
                  }}
                >
                  <div className="space-y-2">
                    {formula.herb_interactions.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: getPlatformSettings().designSettings.alertColors.herbInteractions.icon }}></div>
                        <p className="leading-relaxed flex-1" style={{ color: getPlatformSettings().designSettings.alertColors.herbInteractions.text }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {permissions.safety.allergens && formula.allergens.length > 0 && (
              <div>
                <div className="flex gap-2 items-center mb-3">
                  {(() => {
                    const settings = getPlatformSettings().designSettings;
                    const customSvg = settings.customAlertSvgs?.allergens;
                    const iconColor = settings.alertColors.allergens.icon;
                    
                    if (customSvg) {
                      return (
                        <div 
                          className="w-5 h-5 flex-shrink-0"
                          style={{ color: iconColor }}
                          dangerouslySetInnerHTML={{ __html: customSvg }}
                        />
                      );
                    }
                    
                    const iconName = settings.alertIcons.allergens;
                    const Icon = (LucideIcons as any)[iconName] || AlertCircle;
                    
                    return <Icon className="w-5 h-5 flex-shrink-0" style={{ color: iconColor }} />;
                  })()}
                  <h3 className="text-lg font-semibold text-gray-900">Allergens</h3>
                </div>
                <div 
                  className="rounded-lg border p-4"
                  style={{
                    backgroundColor: getPlatformSettings().designSettings.alertColors.allergens.bg,
                    borderColor: getPlatformSettings().designSettings.alertColors.allergens.border
                  }}
                >
                  <div className="space-y-2">
                    {formula.allergens.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: getPlatformSettings().designSettings.alertColors.allergens.icon }}></div>
                        <p className="leading-relaxed flex-1" style={{ color: getPlatformSettings().designSettings.alertColors.allergens.text }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {permissions.safety.toxicology && formula.toxicology.length > 0 && (
              <div>
                <div className="flex gap-2 items-center mb-3">
                  {(() => {
                    const settings = getPlatformSettings().designSettings;
                    const customSvg = settings.customAlertSvgs?.toxicology;
                    const iconColor = settings.alertColors.toxicology.icon;
                    
                    if (customSvg) {
                      return (
                        <div 
                          className="w-5 h-5 flex-shrink-0"
                          style={{ color: iconColor }}
                          dangerouslySetInnerHTML={{ __html: customSvg }}
                        />
                      );
                    }
                    
                    const iconName = settings.alertIcons.toxicology;
                    const Icon = (LucideIcons as any)[iconName] || AlertCircle;
                    
                    return <Icon className="w-5 h-5 flex-shrink-0" style={{ color: iconColor }} />;
                  })()}
                  <h3 className="text-lg font-semibold text-gray-900">Toxicology</h3>
                </div>
                <div 
                  className="rounded-lg border p-4"
                  style={{
                    backgroundColor: getPlatformSettings().designSettings.alertColors.toxicology.bg,
                    borderColor: getPlatformSettings().designSettings.alertColors.toxicology.border
                  }}
                >
                  <div className="space-y-2">
                    {formula.toxicology.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: getPlatformSettings().designSettings.alertColors.toxicology.icon }}></div>
                        <p className="leading-relaxed flex-1" style={{ color: getPlatformSettings().designSettings.alertColors.toxicology.text }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Separator between sections */}
      {(formula.pharmacological_effects.length > 0 || formula.biological_mechanisms.length > 0 || (formula.bioactive_compounds?.length || 0) > 0 || (formula.detoxification?.length || 0) > 0 || formula.clinical_studies_and_research.length > 0 || (formula.notes?.length || 0) > 0) && (
        <div className="border-t border-gray-300 my-12"></div>
      )}

      {/* Research */}
      {(formula.pharmacological_effects.length > 0 || formula.biological_mechanisms.length > 0 || (formula.bioactive_compounds?.length || 0) > 0 || (formula.detoxification?.length || 0) > 0 || formula.clinical_studies_and_research.length > 0 || (formula.notes?.length || 0) > 0) && (
        <section id="research" className="mb-12 scroll-mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Research</h2>
          
          {permissions.research.pharmacologicalEffects && formula.pharmacological_effects && formula.pharmacological_effects.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Pharmacological effects</h3>
              <div className="flex flex-wrap gap-2">
                {formula.pharmacological_effects.map((effect, idx) => (
                  <Chip key={idx} variant="primary">{effect}</Chip>
                ))}
              </div>
            </div>
          )}

          {permissions.research.biologicalMechanisms && formula.biological_mechanisms && formula.biological_mechanisms.length > 0 && (() => {
            // Filter out empty or placeholder mechanisms
            const validMechanisms = formula.biological_mechanisms.filter(m =>
              m.system && m.system.trim() && m.target_action && m.target_action.trim()
            );

            if (validMechanisms.length === 0) return null;
            
            return (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Biological mechanisms</h3>
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <div className="space-y-4">
                    {validMechanisms.map((item, idx) => (
                      <div key={idx}>
                        <p className="text-sm font-semibold text-gray-700 mb-2">{item.system}</p>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            // target_action can be either a string or an array
                            const actions = Array.isArray(item.target_action) 
                              ? item.target_action 
                              : [item.target_action];
                            
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
              </div>
            );
          })()}

          {/* Bioactive compounds - REMOVED */}

          {/* Detoxification - REMOVED */}

          {permissions.research.clinicalStudies && formula.clinical_studies_and_research.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Clinical studies and research</h3>
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                <div className="space-y-3">
                  {formula.clinical_studies_and_research.map((study, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 mt-2.5"></div>
                      <p className="text-gray-800 leading-relaxed flex-1">{study}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {permissions.referencesNotes.notes && formula.notes && formula.notes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
              <div className="bg-indigo-50 rounded-lg p-5 border border-indigo-100">
                <div className="space-y-3">
                  {formula.notes.map((note, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-indigo-600 mt-2"></div>
                      <p className="text-gray-800 leading-relaxed flex-1">{note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Separator between sections */}
      {formula.reference.length > 0 && (
        <div className="border-t border-gray-300 my-12"></div>
      )}

      {/* References */}
      {permissions.referencesNotes.references && formula.reference.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">References</h2>
          <ul className="space-y-1">
            {formula.reference.map((ref, idx) => (
              <li key={idx} className="text-gray-700">{ref}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Edit and Delete buttons for custom formulas */}
      {formulaName && isCustomFormula(decodeURIComponent(formulaName)) && (
        <div className="flex gap-3 mt-12 pt-6 border-t border-gray-300">
          <Link
            to={`/formulas/${encodeURIComponent(formulaName)}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Edit2 className="w-4 h-4" />
            Edit Formula
          </Link>
          <Dialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <Dialog.Trigger asChild>
              <button className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4" />
                Delete Formula
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
              <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 z-50">
                <Dialog.Title className="text-xl font-bold text-gray-900 mb-2">
                  Delete Formula
                </Dialog.Title>
                <Dialog.Description className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete "{formula.pinyin_name}"? This action cannot be undone.
                </Dialog.Description>
                <div className="flex gap-3 justify-end">
                  <Dialog.Close
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </Dialog.Close>
                  <button
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    onClick={() => {
                      deleteCustomFormula(decodeURIComponent(formulaName));
                      toast.success('Formula deleted successfully');
                      setShowDeleteDialog(false);
                      navigate('/formulas');
                    }}
                  >
                    Delete
                  </button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      )}
        </div>
          </div>
          
          {/* Right spacer for symmetry */}
          <div className="hidden lg:block w-72 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}