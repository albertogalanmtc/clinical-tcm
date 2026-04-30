import { ChevronLeft, Edit2, Trash2, Ban, ChevronDown, ChevronRight, AlertCircle, Skull } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useSwipeBack } from '../hooks/useSwipeBack';
import { useHerbBannedStatus } from '../hooks/useHerbBannedStatus';
import { useHerbDetailPermissions } from '../hooks/useDetailPermissions';
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import type { HerbAction } from '../data/herbs';
import { getPlatformSettings } from '@/app/data/platformSettings';
import { useParams, useNavigate, Link } from 'react-router-dom';

import { getAllHerbs, isCustomHerb, deleteCustomHerb } from '@/app/data/herbsManager';
import { getAllFormulas } from '@/app/data/formulasManager';
import { getPrescriptionsSync } from '@/app/data/prescriptions';
import { Chip } from '@/app/components/ui/Chip';
import { AlertCard } from '@/app/components/ui/AlertCard';
import { NatureIndicator } from '@/app/components/ui/NatureIndicator';
import { FlavorChip } from '@/app/components/ui/FlavorChip';
import { MeridianChip } from '@/app/components/ui/MeridianChip';
import { ThermalActionIndicator } from '@/app/components/ui/ThermalActionIndicator';
import { getHerbCategoryColors, getHerbSubcategoryColors } from '../../lib/categoryColors';

export default function HerbDetail() {
  const { herbName } = useParams();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [expandedActions, setExpandedActions] = useState<number[]>([]);
  const { isHerbBanned } = useHerbBannedStatus();
  const permissions = useHerbDetailPermissions();
  
  // Enable swipe-to-go-back gesture on mobile
  useSwipeBack();
  
  // Load display settings from localStorage
  const getDisplaySettings = () => {
    try {
      const saved = localStorage.getItem('herbs-display-settings');
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
  
  const herbsData = getAllHerbs();
  const formulasData = getAllFormulas();
  const herb = herbsData.find(h => h.pinyin_name === decodeURIComponent(herbName || ''));
  
  // Helper function to get nature border color for a herb name
  const getNatureBorderColor = (herbName: string): string => {
    const foundHerb = herbsData.find(h => h.pinyin_name === herbName);
    if (!foundHerb || !foundHerb.nature) return 'border-gray-400';
    
    const nature = foundHerb.nature.toLowerCase();
    
    if (nature.includes('very hot') || nature === 'muy caliente') {
      return 'border-red-700';
    }
    if (nature === 'hot' || nature === 'caliente') {
      return 'border-red-500';
    }
    if (nature === 'warm' || nature === 'templado') {
      return 'border-orange-500';
    }
    if (nature === 'neutral' || nature === 'neutro') {
      return 'border-gray-400';
    }
    if (nature === 'cool' || nature === 'fresca') {
      return 'border-blue-400';
    }
    if (nature === 'cold' || nature === 'fría') {
      return 'border-blue-600';
    }
    if (nature.includes('very cold') || nature === 'muy fría') {
      return 'border-blue-800';
    }
    
    return 'border-gray-400';
  };
  
  // Check where we came from
  const from = new URLSearchParams(window.location.search).get('from');
  const fromFormula = from === 'formula';
  const formulaName = new URLSearchParams(window.location.search).get('formulaName');
  const fromAdminContent = from === 'admin-content';
  const fromHerbsList = from === 'herbs-list';
  const fromPrescription = from === 'prescription';
  const prescriptionId = new URLSearchParams(window.location.search).get('prescriptionId');
  
  // Get prescription name if coming from prescription
  const prescription = fromPrescription && prescriptionId 
    ? getPrescriptionsSync().find(p => p.id === prescriptionId)
    : null;
  
  // Get formula name if coming from formula
  const formula = fromFormula && formulaName
    ? formulasData.find(f => f.formula_id === formulaName)
    : null;

  if (!herb) {
    return (
      <div className="lg:ml-[20.5rem] lg:max-w-5xl px-4 lg:px-6 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Herb not found</h1>
          <Link 
            to="/herbs" 
            className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 group"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
        </div>
      </div>
    );
  }

  const sections = [
    { id: 'properties', label: 'Properties', show: true },
    { id: 'clinical-use', label: 'Clinical use', show: herb.actions.length > 0 || herb.indications.length > 0 },
    { id: 'safety', label: 'Safety & alerts', show: 
      herb.contraindications.length > 0 || 
      herb.cautions.length > 0 || 
      herb.herb_drug_interactions.length > 0 || 
      herb.herb_herb_interactions.length > 0 || 
      herb.allergens.length > 0 || 
      (herb.antagonisms?.length || 0) > 0 || 
      (herb.incompatibilities?.length || 0) > 0 ||
      (herb.toxicology?.length || 0) > 0 ||
      (herb.pregnancy_warning?.details?.length || 0) > 0
    },
    { id: 'research', label: 'Research', show: (() => {
      const pharmEffects = herb.pharmacological_effects || [];
      const hasPharmEffects = pharmEffects.length > 0 && pharmEffects.some(effect => 
        typeof effect === 'string' && effect.trim()
      );
      
      // Get biological mechanisms directly from herb object
      const hasMechanisms = (herb.biological_mechanisms?.length || 0) > 0 && 
        herb.biological_mechanisms.some(m => 
          m.system && m.system.trim() && m.target_action && m.target_action.trim()
        );
      
      const hasStudies = herb.clinical_studies_and_research.length > 0;
      const hasBioactive = (herb.bioactive_compounds?.length || 0) > 0;
      const hasDetox = (herb.detoxification?.length || 0) > 0;
      
      // Don't render section if no content
      if (!hasPharmEffects && !hasMechanisms && !hasStudies && !hasBioactive && !hasDetox) {
        return false;
      }
      
      return true;
    })() },
    { id: 'additional', label: 'Additional info', show: (herb.notes?.length || 0) > 0 || (herb.references?.length || 0) > 0 }
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
          
          {/* Main content area - aligned with Herbs main, centered */}
          <div className="flex-1 min-w-0 flex flex-col gap-2 sm:gap-4">
            {/* Back button */}
            {fromAdminContent ? (
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
            ) : fromFormula && formulaName ? (
              <Link 
                to={`/formulas/${encodeURIComponent(formulaName)}`} 
                className="h-10 w-10 sm:w-11 sm:h-11 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
                title="Back to Formula"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
            ) : (
              <Link 
                to="/herbs" 
                className="h-10 w-10 sm:w-11 sm:h-11 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
                title="Back to Herbs"
              >
                <ChevronLeft className="w-5 h-5" />
              </Link>
            )}
            
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
                  <div key="pinyin" className="flex items-center gap-2 mb-1">
                    <h1 className={isFirst ? "text-2xl font-bold text-gray-900" : "text-base text-gray-500"}>{herb.pinyin_name}</h1>
                    {isFirst && isHerbBanned(herb) && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 whitespace-nowrap">
                        <Ban className="w-3 h-3" />
                        Banned
                      </span>
                    )}
                  </div>
                );
              
              case 'pharmaceutical':
                return herb.pharmaceutical_name ? (
                  <div key="pharmaceutical" className={isFirst ? "text-2xl font-bold text-gray-900 mb-1 italic" : "text-base text-gray-500 mb-1 italic"}>
                    {herb.pharmaceutical_name}
                  </div>
                ) : null;
              
              case 'hanzi':
                return herb.hanzi_name ? (
                  <div key="hanzi" className={isFirst ? "text-2xl font-bold text-gray-900 mb-3 font-hanzi" : "text-base text-gray-400 mb-3 font-hanzi"}>
                    {herb.hanzi_name}
                  </div>
                ) : null;
              
              default:
                return null;
            }
          })}
          
          {(herb.category || herb.subcategory) && (
            <div className="flex gap-2">
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

        {/* Desktop layout - original */}
        <div className="hidden sm:block">
          {nameOrder.map((fieldType, idx) => {
            const isFirst = idx === 0;
            
            switch (fieldType) {
              case 'pinyin':
                return (
                  <div key="pinyin" className="flex items-center gap-3 mb-2">
                    <h1 className={isFirst ? "text-3xl font-bold text-gray-900" : "text-2xl text-gray-500"}>{herb.pinyin_name}</h1>
                    {isFirst && isHerbBanned(herb) && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-800 whitespace-nowrap">
                        <Ban className="w-4 h-4" />
                        Banned
                      </span>
                    )}
                  </div>
                );
              
              case 'pharmaceutical':
                return herb.pharmaceutical_name ? (
                  <div key="pharmaceutical" className={isFirst ? "text-3xl font-bold text-gray-900 mb-2 italic" : "text-2xl text-gray-500 mb-2 italic"}>
                    {herb.pharmaceutical_name}
                  </div>
                ) : null;
              
              case 'hanzi':
                return herb.hanzi_name ? (
                  <div key="hanzi" className={isFirst ? "text-3xl font-bold text-gray-900 mb-4 font-hanzi" : "text-lg text-gray-400 mb-4 font-hanzi"}>
                    {herb.hanzi_name}
                  </div>
                ) : null;
              
              default:
                return null;
            }
          })}
          
          {(herb.category || herb.subcategory) && (
            <div className="flex gap-2">
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

      {/* Properties */}
      {permissions.properties && (
      <section id="properties" className="mb-12 scroll-mt-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Properties</h2>
        <div className="bg-gray-50 rounded-lg px-6 py-4 border border-gray-200 md:w-fit">
          <div className="flex flex-wrap items-center gap-4">
            {/* Nature */}
            <div className="flex items-center gap-2">
              <NatureIndicator nature={herb.nature} showLabel={true} />
            </div>

            {/* Separator */}
            {herb.flavor.length > 0 && (
              <div className="h-6 w-px bg-gray-300" />
            )}

            {/* Flavors */}
            {herb.flavor.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {herb.flavor.map(f => (
                  <FlavorChip key={f} flavor={f} />
                ))}
              </div>
            )}

            {/* Separator */}
            {herb.channels.length > 0 && (
              <div className="h-6 w-px bg-gray-300" />
            )}

            {/* Meridians */}
            {herb.channels.length > 0 && (
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

            {/* Separator */}
            {herb.dose && (
              <div className="h-6 w-px bg-gray-300" />
            )}

            {/* Dosage */}
            {herb.dose && (
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
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 border border-red-500 text-red-700">
                <Skull className="w-3 h-3 flex-shrink-0" />
                <span>Toxic</span>
              </div>
            )}
          </div>
        </div>
      </section>
      )}

      {/* Separator between sections */}
      {(herb.actions.length > 0 || herb.indications.length > 0) && (
        <div className="border-t border-gray-300 my-12"></div>
      )}

      {/* Clinical use */}
      {(herb.actions.length > 0 || herb.indications.length > 0) && (
        <section id="clinical-use" className="mb-12 scroll-mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Clinical use</h2>

          {permissions.clinicalUse.actions && herb.actions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">TCM actions</h3>
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-50">
                <div className="space-y-3">
                  {herb.actions.map((action, idx) => {
                    // Check if action is object (new structure) or string (old structure)
                    const isObjectAction = typeof action === 'object' && 'title' in action;
                    const isExpanded = expandedActions.includes(idx);
                    
                    if (isObjectAction) {
                      const actionObj = action as HerbAction;
                      // Only show chevron if there are branches with actual data beyond just the pattern field
                      const hasBranches = actionObj.branches && actionObj.branches.length > 0 && 
                        actionObj.branches.some(b => 
                          (b.pattern && b.pattern.trim()) || 
                          (b.sub_pattern && b.sub_pattern.trim()) || 
                          (b.combination && b.combination.length > 0 && b.combination.some(h => h.trim())) || 
                          (b.formula_example && b.formula_example.trim())
                        );
                      return (
                        <div key={idx}>
                          {/* If has branches, show clickable header with chevron */}
                          {hasBranches ? (
                            <button
                              onClick={() => {
                                setExpandedActions(prev =>
                                  prev.includes(idx)
                                    ? prev.filter(i => i !== idx)
                                    : [...prev, idx]
                                );
                              }}
                              className="w-full flex items-center gap-3 text-left hover:opacity-80 transition-opacity"
                            >
                              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-teal-600 mt-2"></div>
                              <p className="text-gray-800 leading-relaxed flex-1">{actionObj.title}</p>
                              {isExpanded ? (
                                <ChevronDown className="w-5 h-5 text-teal-600 flex-shrink-0" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-teal-600 flex-shrink-0" />
                              )}
                            </button>
                          ) : (
                            /* If no branches, show static text without chevron */
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-teal-600"></div>
                              <p className="text-gray-800 leading-relaxed flex-1">{actionObj.title}</p>
                            </div>
                          )}
                          
                          {/* Expandable branches content */}
                          {isExpanded && hasBranches && (
                            <div className="mt-3 ml-3.5 space-y-3">
                              {actionObj.branches.map((branch, branchIdx) => (
                                <div key={branchIdx} className="pl-3 border-l-2 border-teal-200">
                                  <p className="text-sm text-gray-700 mb-1.5">{branch.pattern}</p>
                                  
                                  {/* Sub-pattern if exists - with left border */}
                                  {branch.sub_pattern && (
                                    <div className="pl-3 border-l-2 border-gray-300">
                                      <p className="text-sm text-gray-500 mb-1.5">{branch.sub_pattern}</p>
                                      
                                      {/* Combination and formula in same row */}
                                      <div className="flex flex-wrap items-start gap-2">
                                        {/* Combination chips with nature border */}
                                        {branch.combination && branch.combination.length > 0 && (
                                          <div className="flex flex-wrap gap-1">
                                            {branch.combination.map((herb, herbIdx) => {
                                              // Find the herb in database to get exact pinyin_name (handles accents)
                                              const normalizeString = (str: string) => str
                                                .normalize('NFD')
                                                .replace(/[\u0300-\u036f]/g, '')
                                                .toLowerCase();
                                              
                                              const foundHerb = herbsData.find(h => 
                                                normalizeString(h.pinyin_name) === normalizeString(herb)
                                              );
                                              
                                              const exactHerbName = foundHerb ? foundHerb.pinyin_name : herb;
                                              
                                              return (
                                                <Link
                                                  key={herbIdx}
                                                  to={`/herbs/${encodeURIComponent(exactHerbName)}`}
                                                  className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border ${getNatureBorderColor(exactHerbName)} no-underline`}
                                                >
                                                  {herb}
                                                </Link>
                                              );
                                            })}
                                          </div>
                                        )}
                                        
                                        {/* Formula example chip */}
                                        {branch.formula_example && (
                                          <Link 
                                            to={`/formulas/${encodeURIComponent(branch.formula_example)}`}
                                            className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 border border-blue-600 no-underline"
                                          >
                                            {branch.formula_example}
                                          </Link>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* If no sub_pattern, show combination and formula directly */}
                                  {!branch.sub_pattern && (
                                    <div className="flex flex-wrap items-start gap-2">
                                      {/* Combination chips with nature border */}
                                      {branch.combination && branch.combination.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                          {branch.combination.map((herb, herbIdx) => {
                                            // Find the herb in database to get exact pinyin_name (handles accents)
                                            const normalizeString = (str: string) => str
                                              .normalize('NFD')
                                              .replace(/[\u0300-\u036f]/g, '')
                                              .toLowerCase();
                                            
                                            const foundHerb = herbsData.find(h => 
                                              normalizeString(h.pinyin_name) === normalizeString(herb)
                                            );
                                            
                                            const exactHerbName = foundHerb ? foundHerb.pinyin_name : herb;
                                            
                                            return (
                                              <Link
                                                key={herbIdx}
                                                to={`/herbs/${encodeURIComponent(exactHerbName)}`}
                                                className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border ${getNatureBorderColor(exactHerbName)} no-underline`}
                                              >
                                                {herb}
                                              </Link>
                                            );
                                          })}
                                        </div>
                                      )}
                                      
                                      {/* Formula example chip */}
                                      {branch.formula_example && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 border border-blue-600">
                                          {branch.formula_example}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      // Old string format
                      return (
                        <div key={idx} className="flex gap-3">
                          <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-teal-600 mt-2"></div>
                          <p className="text-gray-800 leading-relaxed flex-1">{action as string}</p>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            </div>
          )}

          {permissions.clinicalUse.indications && herb.indications.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Clinical indications</h3>
              <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                <div className="space-y-3">
                  {herb.indications.map((indication, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></div>
                      <p className="text-gray-800 leading-relaxed flex-1">{indication}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {permissions.clinicalUse.clinicalApplications && herb.clinical_applications && herb.clinical_applications.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Clinical applications</h3>
              <div className="bg-purple-50 rounded-lg p-5 border border-purple-100">
                <div className="space-y-3">
                  {herb.clinical_applications.map((app, idx) => (
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
      {(herb.contraindications.length > 0 || herb.cautions.length > 0 || herb.herb_drug_interactions.length > 0 || herb.herb_herb_interactions.length > 0 || herb.allergens.length > 0 || (herb.antagonisms?.length || 0) > 0 || (herb.incompatibilities?.length || 0) > 0) && (
        <div className="border-t border-gray-300 my-12"></div>
      )}

      {/* Safety & alerts */}
      {(herb.contraindications.length > 0 || herb.cautions.length > 0 || herb.herb_drug_interactions.length > 0 || herb.herb_herb_interactions.length > 0 || herb.allergens.length > 0 || (herb.antagonisms?.length || 0) > 0 || (herb.incompatibilities?.length || 0) > 0) && (
        <section id="safety" className="mb-12 scroll-mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Safety & alerts</h2>
          <div className="space-y-4">
            {permissions.safety.antagonisms && (herb.antagonisms?.length || 0) > 0 && (
              <div>
                <div className="flex gap-2 items-center mb-3">
                  {(() => {
                    const settings = getPlatformSettings().designSettings;
                    const customSvg = settings.customAlertSvgs?.antagonisms;
                    const iconColor = settings.alertColors.antagonisms.icon;
                    
                    if (customSvg) {
                      return (
                        <div 
                          className="w-5 h-5 flex-shrink-0"
                          style={{ color: iconColor }}
                          dangerouslySetInnerHTML={{ __html: customSvg }}
                        />
                      );
                    }
                    
                    const iconName = settings.alertIcons.antagonisms;
                    const Icon = (LucideIcons as any)[iconName] || AlertCircle;
                    
                    return <Icon className="w-5 h-5 flex-shrink-0" style={{ color: iconColor }} />;
                  })()}
                  <h3 className="text-lg font-semibold text-gray-900">Antagonisms ({herb.antagonisms.length} {herb.antagonisms.length === 1 ? 'Antagonism' : 'Antagonisms'})</h3>
                </div>
                <div 
                  className="rounded-lg border p-4"
                  style={{
                    backgroundColor: getPlatformSettings().designSettings.alertColors.antagonisms.bg,
                    borderColor: getPlatformSettings().designSettings.alertColors.antagonisms.border
                  }}
                >
                  <div className="space-y-2">
                    {herb.antagonisms.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: getPlatformSettings().designSettings.alertColors.antagonisms.icon }}></div>
                        <p className="leading-relaxed flex-1" style={{ color: getPlatformSettings().designSettings.alertColors.antagonisms.text }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {permissions.safety.incompatibilities && (herb.incompatibilities?.length || 0) > 0 && (
              <div>
                <div className="flex gap-2 items-center mb-3">
                  {(() => {
                    const settings = getPlatformSettings().designSettings;
                    const customSvg = settings.customAlertSvgs?.incompatibilities;
                    const iconColor = settings.alertColors.incompatibilities.icon;
                    
                    if (customSvg) {
                      return (
                        <div 
                          className="w-5 h-5 flex-shrink-0"
                          style={{ color: iconColor }}
                          dangerouslySetInnerHTML={{ __html: customSvg }}
                        />
                      );
                    }
                    
                    const iconName = settings.alertIcons.incompatibilities;
                    const Icon = (LucideIcons as any)[iconName] || AlertCircle;
                    
                    return <Icon className="w-5 h-5 flex-shrink-0" style={{ color: iconColor }} />;
                  })()}
                  <h3 className="text-lg font-semibold text-gray-900">Incompatibilities ({herb.incompatibilities.length} {herb.incompatibilities.length === 1 ? 'Incompatibility' : 'Incompatibilities'})</h3>
                </div>
                <div 
                  className="rounded-lg border p-4"
                  style={{
                    backgroundColor: getPlatformSettings().designSettings.alertColors.incompatibilities.bg,
                    borderColor: getPlatformSettings().designSettings.alertColors.incompatibilities.border
                  }}
                >
                  <div className="space-y-2">
                    {herb.incompatibilities.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: getPlatformSettings().designSettings.alertColors.incompatibilities.icon }}></div>
                        <p className="leading-relaxed flex-1" style={{ color: getPlatformSettings().designSettings.alertColors.incompatibilities.text }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {permissions.safety.contraindications && herb.contraindications.length > 0 && (
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
                    {herb.contraindications.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: getPlatformSettings().designSettings.alertColors.contraindications.icon }}></div>
                        <p className="leading-relaxed flex-1" style={{ color: getPlatformSettings().designSettings.alertColors.contraindications.text }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {permissions.safety.cautions && herb.cautions.length > 0 && (
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
                    
                    // Get icon component from settings
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
                    {herb.cautions.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: getPlatformSettings().designSettings.alertColors.cautions.icon }}></div>
                        <p className="leading-relaxed flex-1" style={{ color: getPlatformSettings().designSettings.alertColors.cautions.text }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {permissions.safety.allergens && herb.allergens.length > 0 && (
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
                    {herb.allergens.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: getPlatformSettings().designSettings.alertColors.allergens.icon }}></div>
                        <p className="leading-relaxed flex-1" style={{ color: getPlatformSettings().designSettings.alertColors.allergens.text }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {permissions.safety.drugInteractions && herb.herb_drug_interactions.length > 0 && (
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
                  <h3 className="text-lg font-semibold text-gray-900">Herb-drug interactions</h3>
                </div>
                <div 
                  className="rounded-lg border p-4"
                  style={{
                    backgroundColor: getPlatformSettings().designSettings.alertColors.drugInteractions.bg,
                    borderColor: getPlatformSettings().designSettings.alertColors.drugInteractions.border
                  }}
                >
                  <div className="space-y-2">
                    {herb.herb_drug_interactions.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: getPlatformSettings().designSettings.alertColors.drugInteractions.icon }}></div>
                        <p className="leading-relaxed flex-1" style={{ color: getPlatformSettings().designSettings.alertColors.drugInteractions.text }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {permissions.safety.herbInteractions && herb.herb_herb_interactions.length > 0 && (
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
                  <h3 className="text-lg font-semibold text-gray-900">Herb-herb interactions</h3>
                </div>
                <div 
                  className="rounded-lg border p-4"
                  style={{
                    backgroundColor: getPlatformSettings().designSettings.alertColors.herbInteractions.bg,
                    borderColor: getPlatformSettings().designSettings.alertColors.herbInteractions.border
                  }}
                >
                  <div className="space-y-2">
                    {herb.herb_herb_interactions.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: getPlatformSettings().designSettings.alertColors.herbInteractions.icon }}></div>
                        <p className="leading-relaxed flex-1" style={{ color: getPlatformSettings().designSettings.alertColors.herbInteractions.text }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {herb.toxicology && herb.toxicology.length > 0 && (
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
                    {herb.toxicology.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: getPlatformSettings().designSettings.alertColors.toxicology.icon }}></div>
                        <p className="leading-relaxed flex-1" style={{ color: getPlatformSettings().designSettings.alertColors.toxicology.text }}>{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {herb.pregnancy_warning && herb.pregnancy_warning.details && herb.pregnancy_warning.details.length > 0 && (
              <div>
                <div className="flex gap-2 items-center mb-3">
                  {(() => {
                    const settings = getPlatformSettings().designSettings;
                    const customSvg = settings.customAlertSvgs?.pregnancyWarning;
                    const iconColor = settings.alertColors.pregnancyWarning.icon;
                    
                    if (customSvg) {
                      return (
                        <div 
                          className="w-5 h-5 flex-shrink-0"
                          style={{ color: iconColor }}
                          dangerouslySetInnerHTML={{ __html: customSvg }}
                        />
                      );
                    }
                    
                    const iconName = settings.alertIcons.pregnancyWarning;
                    const Icon = (LucideIcons as any)[iconName] || AlertCircle;
                    
                    return <Icon className="w-5 h-5 flex-shrink-0" style={{ color: iconColor }} />;
                  })()}
                  <h3 className="text-lg font-semibold text-gray-900">Pregnancy warning</h3>
                </div>
                <div 
                  className="rounded-lg border p-4"
                  style={{
                    backgroundColor: getPlatformSettings().designSettings.alertColors.pregnancyWarning.bg,
                    borderColor: getPlatformSettings().designSettings.alertColors.pregnancyWarning.border
                  }}
                >
                  <div className="space-y-2">
                    {herb.pregnancy_warning.details.map((item, idx) => (
                      <div key={idx} className="flex gap-2">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2" style={{ backgroundColor: getPlatformSettings().designSettings.alertColors.pregnancyWarning.icon }}></div>
                        <p className="leading-relaxed flex-1" style={{ color: getPlatformSettings().designSettings.alertColors.pregnancyWarning.text }}>{item}</p>
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
      {(() => {
        const pharmEffects = herb.pharmacological_effects || [];
        const hasPharmEffects = pharmEffects.length > 0 && pharmEffects.some(effect => 
          typeof effect === 'string' && effect.trim()
        );
        
        // Get biological mechanisms directly from herb object
        const hasMechanisms = (herb.biological_mechanisms?.length || 0) > 0 && 
          herb.biological_mechanisms.some(m => 
            m.system && m.system.trim() && m.target_action && m.target_action.trim()
          );
        
        const hasStudies = herb.clinical_studies_and_research.length > 0;
        const hasBioactive = (herb.bioactive_compounds?.length || 0) > 0;
        const hasDetox = (herb.detoxification?.length || 0) > 0;
        
        // Don't render section if no content
        if (!hasPharmEffects && !hasMechanisms && !hasStudies && !hasBioactive && !hasDetox) {
          return null;
        }
        
        return (
          <div className="border-t border-gray-300 my-12"></div>
        );
      })()}

      {/* Research */}
      {(() => {
        const pharmEffects = herb.pharmacological_effects || [];
        const hasPharmEffects = pharmEffects.length > 0 && pharmEffects.some(effect => 
          typeof effect === 'string' && effect.trim()
        );
        
        // Get biological mechanisms directly from herb object
        const hasMechanisms = (herb.biological_mechanisms?.length || 0) > 0 && 
          herb.biological_mechanisms.some(m => 
            m.system && m.system.trim() && m.target_action && m.target_action.trim()
          );
        
        const hasStudies = herb.clinical_studies_and_research.length > 0;
        const hasBioactive = (herb.bioactive_compounds?.length || 0) > 0;
        const hasDetox = (herb.detoxification?.length || 0) > 0;
        
        // Don't render section if no content
        if (!hasPharmEffects && !hasMechanisms && !hasStudies && !hasBioactive && !hasDetox) {
          return null;
        }
        
        return (
          <section id="research" className="mb-12 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Research</h2>
            
            {(() => {
              const pharmEffects = herb.pharmacological_effects || [];
              const hasEffects = pharmEffects.length > 0 && pharmEffects.some(effect =>
                typeof effect === 'string' && effect.trim()
              );

              if (!permissions.research.pharmacologicalEffects || !hasEffects) return null;
              
              return (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Pharmacological effects</h3>
                  <div className="flex flex-wrap gap-2">
                    {pharmEffects.map((effect, idx) => (
                      <Chip key={idx} variant="primary">{effect}</Chip>
                    ))}
                  </div>
                </div>
              );
            })()}

            {permissions.research.biologicalMechanisms && herb.biological_mechanisms && herb.biological_mechanisms.length > 0 && (() => {
              // Filter out empty or placeholder mechanisms
              const validMechanisms = herb.biological_mechanisms.filter(m =>
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

            {permissions.research.clinicalStudies && herb.clinical_studies_and_research.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Clinical studies and research</h3>
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <div className="space-y-3">
                    {herb.clinical_studies_and_research.map((study, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 mt-2.5"></div>
                        <p className="text-gray-800 leading-relaxed flex-1">{study}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {permissions.research.bioactiveCompounds && herb.bioactive_compounds && herb.bioactive_compounds.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Bioactive compounds</h3>
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <div className="space-y-4">
                    {herb.bioactive_compounds.map((item, idx) => (
                      <div key={idx}>
                        <p className="text-sm font-semibold text-gray-700 mb-2">{item.chemical_class}</p>
                        <div className="flex flex-wrap gap-2">
                          {item.compounds.map((compound, compoundIdx) => (
                            <Chip key={compoundIdx} variant="secondary">{compound}</Chip>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {herb.detoxification && herb.detoxification.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Detoxification</h3>
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <div className="space-y-4">
                    {herb.detoxification.map((item, idx) => (
                      <div key={idx}>
                        <p className="text-sm font-semibold text-gray-700 mb-2">{item.toxin_group}</p>
                        <div className="flex flex-wrap gap-2">
                          {item.agents.map((agent, agentIdx) => (
                            <Chip key={agentIdx} variant="secondary">{agent}</Chip>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        );
      })()}

      {/* Separator between sections */}
      {((herb.notes?.length || 0) > 0 || (herb.references?.length || 0) > 0) && (
        <div className="border-t border-gray-300 my-12"></div>
      )}

      {/* Additional info */}
      {(() => {
        const hasNotes = (herb.notes?.length || 0) > 0;
        const hasReferences = (herb.references?.length || 0) > 0;
        
        // Don't render section if no content
        if (!hasNotes && !hasReferences) {
          return null;
        }
        
        return (
          <section id="additional" className="mb-12 scroll-mt-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional info</h2>
            
            {permissions.referencesNotes.notes && herb.notes && herb.notes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <div className="space-y-3">
                    {herb.notes.map((note, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 mt-2.5"></div>
                        <p className="text-gray-800 leading-relaxed flex-1">{note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {permissions.referencesNotes.references && herb.references && herb.references.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">References</h3>
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <div className="space-y-3">
                    {herb.references.map((reference, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-600 mt-2.5"></div>
                        <p className="text-gray-800 leading-relaxed flex-1">{reference}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        );
      })()}

      {/* Edit and Delete buttons for custom herbs */}
      {herbName && isCustomHerb(decodeURIComponent(herbName)) && (
        <div className="flex gap-3 mt-12 pt-6 pb-24 sm:pb-0 border-t border-gray-300">
          <Link
            to={`/herbs/${encodeURIComponent(herbName)}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Edit2 className="w-4 h-4" />
            Edit Herb
          </Link>
          <Dialog.Root open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <Dialog.Trigger asChild>
              <button className="inline-flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4" />
                Delete Herb
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
              <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4 z-50">
                <Dialog.Title className="text-xl font-bold text-gray-900 mb-2">
                  Delete Herb
                </Dialog.Title>
                <Dialog.Description className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete "{herb.pinyin_name}"? This action cannot be undone.
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
                      deleteCustomHerb(decodeURIComponent(herbName));
                      toast.success('Herb deleted successfully');
                      setShowDeleteDialog(false);
                      navigate('/herbs');
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