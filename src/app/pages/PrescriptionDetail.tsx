import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPrescriptionsSync, deletePrescription } from '@/app/data/prescriptions';
import { getAllHerbs } from '@/app/data/herbsManager';
import { getAllFormulas } from '@/app/data/formulasManager';
import { AlertCard } from '@/app/components/ui/AlertCard';
import { NatureIndicator } from '@/app/components/ui/NatureIndicator';
import { FlavorChip } from '@/app/components/ui/FlavorChip';
import { MeridianChip } from '@/app/components/ui/MeridianChip';
import { Chip } from '@/app/components/ui/Chip';
import { ThermalActionIndicator } from '@/app/components/ui/ThermalActionIndicator';
import { ChevronLeft, Copy, Edit, Trash2, Check, FileText, Ban, X, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { useSwipeBack } from '../hooks/useSwipeBack';
import { useHerbBannedStatus } from '../hooks/useHerbBannedStatus';
import { useGlobalSettings } from '../hooks/useGlobalSettings';
import { useModalNavigation } from '../hooks/useModalNavigation';
import { UnifiedDetailsModal } from '@/app/components/UnifiedDetailsModal';
import type { HerbAction } from '../data/herbs';

// Helper function to get biological mechanisms from localStorage
const getBiologicalMechanismsFromStorage = () => {
  try {
    const stored = localStorage.getItem('biologicalMechanisms');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading biological mechanisms:', error);
  }
  return [];
};

// Helper function to get nature border color for a herb name
const getNatureBorderColor = (herbName: string): string => {
  const herbsData = getAllHerbs();
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

// Helper function to get thermal action border color for a formula name
const getThermalActionBorderColor = (formulaName: string): string => {
  const formulasData = getAllFormulas();
  const foundFormula = formulasData.find(f => f.pinyin_name === formulaName);
  if (!foundFormula || !foundFormula.thermal_action) return 'border-gray-300';
  
  const thermalAction = foundFormula.thermal_action.toLowerCase();
  
  if (thermalAction.includes('very hot') || thermalAction === 'muy caliente') {
    return 'border-red-700';
  }
  if (thermalAction === 'hot' || thermalAction === 'caliente') {
    return 'border-red-500';
  }
  if (thermalAction === 'warm' || thermalAction === 'templado') {
    return 'border-orange-500';
  }
  if (thermalAction === 'neutral' || thermalAction === 'neutro') {
    return 'border-gray-400';
  }
  if (thermalAction === 'cool' || thermalAction === 'fresca') {
    return 'border-blue-400';
  }
  if (thermalAction === 'cold' || thermalAction === 'fría') {
    return 'border-blue-600';
  }
  if (thermalAction.includes('very cold') || thermalAction === 'muy fría') {
    return 'border-blue-800';
  }
  
  return 'border-gray-300';
};

// Helper function to get biological mechanisms for a specific herb
const getHerbBiologicalMechanisms = (herbName: string) => {
  const allMechanisms = getBiologicalMechanismsFromStorage();
  const result: { system: string; target_action: string }[] = [];
  
  // Iterate through systems -> targets -> directions and find where this herb is included
  allMechanisms.forEach((system: any) => {
    system.targets?.forEach((target: any) => {
      target.directions?.forEach((direction: any) => {
        // Check if this herb is in the herbs array for this direction
        if (direction.herbs?.includes(herbName)) {
          result.push({
            system: system.system,
            target_action: `${target.name} ${direction.name}`.trim()
          });
        }
      });
    });
  });
  
  return result;
};

// Helper function to get biological mechanisms for a specific formula
const getFormulaBiologicalMechanisms = (formulaName: string) => {
  const allMechanisms = getBiologicalMechanismsFromStorage();
  const result: { system: string; target_action: string }[] = [];
  
  // Iterate through systems -> targets -> directions and find where this formula is included
  allMechanisms.forEach((system: any) => {
    system.targets?.forEach((target: any) => {
      target.directions?.forEach((direction: any) => {
        // Check if this formula is in the formulas array for this direction
        if (direction.formulas?.includes(formulaName)) {
          result.push({
            system: system.system,
            target_action: `${target.name} ${direction.name}`.trim()
          });
        }
      });
    });
  });
  
  return result;
};

// Helper to check if biological mechanisms exist (legacy or new format)
const hasBiologicalMechanisms = (name: string, type: 'herb' | 'formula', legacyData: any[]) => {
  const mechanisms = type === 'herb' 
    ? getHerbBiologicalMechanisms(name) 
    : getFormulaBiologicalMechanisms(name);
  return mechanisms.length > 0 || legacyData.length > 0;
};

export default function PrescriptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isHerbBanned } = useHerbBannedStatus();
  const { globalSettings, updateGlobalSettings } = useGlobalSettings();
  
  // Enable swipe-to-go-back gesture on mobile
  useSwipeBack();
  
  const [copied, setCopied] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [expandedHerbActions, setExpandedHerbActions] = useState<number[]>([]);
  const [expandedFormulas, setExpandedFormulas] = useState<number[]>([]);
  
  // Modal navigation hook
  const modalNav = useModalNavigation();
  
  // Unified settings modal state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'display' | 'copy'>('display');
  
  // Use global settings for display and copy configuration
  const displayConfig = globalSettings.prescriptions.display;
  const copyConfig = globalSettings.prescriptions.copy;
  const alertDisplayMode = globalSettings.prescriptions.display.safetyFilters;
  
  // Helper functions to update global settings
  const updateDisplayConfig = (update: Partial<typeof displayConfig> | ((prev: typeof displayConfig) => typeof displayConfig)) => {
    const newDisplay = typeof update === 'function' ? update(displayConfig) : { ...displayConfig, ...update };
    updateGlobalSettings({
      ...globalSettings,
      prescriptions: {
        ...globalSettings.prescriptions,
        display: newDisplay,
      },
    });
  };
  
  const updateCopyConfig = (update: Partial<typeof copyConfig> | ((prev: typeof copyConfig) => typeof copyConfig)) => {
    const newCopy = typeof update === 'function' ? update(copyConfig) : { ...copyConfig, ...update };
    updateGlobalSettings({
      ...globalSettings,
      prescriptions: {
        ...globalSettings.prescriptions,
        copy: newCopy,
      },
    });
  };
  
  const updateAlertDisplayMode = (mode: 'filtered' | 'all') => {
    updateGlobalSettings({
      ...globalSettings,
      prescriptions: {
        ...globalSettings.prescriptions,
        display: {
          ...displayConfig,
          safetyFilters: mode,
        },
      },
    });
  };
  
  // Clinical filters display state
  const [showClinicalFilters, setShowClinicalFilters] = useState<boolean>(() => {
    try {
      const savedShow = localStorage.getItem('prescriptionShowClinicalFilters');
      if (savedShow !== null) {
        return savedShow === 'true';
      }
    } catch (error) {
      console.error('Error loading show clinical filters from localStorage:', error);
    }
    return true; // Default to showing clinical filters
  });
  
  // Save clinical filters display state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('prescriptionShowClinicalFilters', showClinicalFilters.toString());
    } catch (error) {
      console.error('Error saving show clinical filters to localStorage:', error);
    }
  }, [showClinicalFilters]);
  
  const prescription = getPrescriptionsSync().find(p => p.id === id);
  const herbsData = getAllHerbs();
  const formulasData = getAllFormulas();
  
  // Initialize all formulas as expanded when prescription loads
  useEffect(() => {
    if (prescription) {
      const formulaIndices = prescription.components
        .map((comp, idx) => comp.type === 'formula' ? idx : -1)
        .filter(idx => idx !== -1);
      setExpandedFormulas(formulaIndices);
    }
  }, [prescription?.id]);

  // Helper function to get subcomponents for compound formulas
  const getSubComponents = (componentName: string, dosage: string) => {
    const formula = formulasData.find(f => f.pinyin_name === componentName);
    if (!formula || !formula.composition) return null;

    const totalDosage = parseInt(dosage.replace(/[^0-9]/g, '')) || 0;
    const herbCount = formula.composition.length;
    const dosagePerHerb = Math.round((totalDosage / herbCount) * 10) / 10;

    return formula.composition.map(comp => {
      // Extract herb name - handle both object and string format
      const herbName = typeof comp === 'object' ? comp.herb_pinyin : comp.replace(/\s+\d+(\.\d+)?g?$/i, '').trim();
      return {
        name: herbName,
        dosage: `${dosagePerHerb}g`
      };
    });
  };

  // Get all alerts from the prescription
  const getAllAlerts = () => {
    const alerts: { 
      contraindications: string[];
      cautions: string[];
      interactions: string[];
      allergens: string[];
    } = {
      contraindications: [],
      cautions: [],
      interactions: [],
      allergens: []
    };

    if (!prescription) return alerts;

    // Determine if we should filter alerts based on user's display preference
    const shouldFilterAlerts = alertDisplayMode === 'filtered' && prescription.patientSafetyProfile;
    const profile = prescription.patientSafetyProfile || {};

    // Helper function to check if an alert text matches any active filter
    const matchesActiveFilters = (alertText: string): boolean => {
      if (!shouldFilterAlerts) return true; // Show all if mode is 'all' or no profile saved
      
      const lowerText = alertText.toLowerCase();
      
      // Patient populations
      if (profile.pregnancy && (lowerText.includes('pregnancy') || lowerText.includes('pregnant'))) return true;
      if (profile.breastfeeding && (lowerText.includes('breastfeeding') || lowerText.includes('lactation'))) return true;
      if (profile.pediatric && (lowerText.includes('pediatric') || lowerText.includes('children') || lowerText.includes('infant'))) return true;
      if (profile.geriatric && (lowerText.includes('geriatric') || lowerText.includes('elderly'))) return true;
      
      // Organ impairment
      if (profile.renalImpairment && (lowerText.includes('renal') || lowerText.includes('kidney'))) return true;
      if (profile.hepaticImpairment && (lowerText.includes('hepatic') || lowerText.includes('liver'))) return true;
      
      // Comorbidities
      if (profile.hypertension && (lowerText.includes('hypertension') || lowerText.includes('blood pressure'))) return true;
      if (profile.diabetes && (lowerText.includes('diabetes') || lowerText.includes('blood sugar') || lowerText.includes('hypoglycemic'))) return true;
      
      // Medications
      if (profile.anticoagulants && (lowerText.includes('anticoagulant') || lowerText.includes('warfarin') || lowerText.includes('bleeding'))) return true;
      if (profile.immunosuppressants && (lowerText.includes('immunosuppressant') || lowerText.includes('immune'))) return true;
      if (profile.chemotherapy && (lowerText.includes('chemotherapy') || lowerText.includes('cancer'))) return true;
      
      return false;
    };

    // Track which herbs we've already processed to avoid duplicates
    const processedHerbs = new Set<string>();

    const checkHerbAlerts = (herbName: string) => {
      // Skip if we've already processed this herb
      if (processedHerbs.has(herbName)) return;
      processedHerbs.add(herbName);

      const herb = herbsData.find(h => h.pinyin_name === herbName);
      if (!herb) return;

      // Contraindications
      herb.contraindications.forEach(ci => {
        const alertText = `${herbName}: ${ci}`;
        if (matchesActiveFilters(ci)) {
          alerts.contraindications.push(alertText);
        }
      });

      // Cautions
      herb.cautions.forEach(caution => {
        const alertText = `${herbName}: ${caution}`;
        if (matchesActiveFilters(caution)) {
          alerts.cautions.push(alertText);
        }
      });

      // Interactions
      herb.herb_drug_interactions.forEach(interaction => {
        const alertText = `${herbName}: ${interaction}`;
        if (matchesActiveFilters(interaction)) {
          alerts.interactions.push(alertText);
        }
      });

      herb.herb_herb_interactions.forEach(interaction => {
        const alertText = `${herbName}: ${interaction}`;
        if (matchesActiveFilters(interaction)) {
          alerts.interactions.push(alertText);
        }
      });

      // Allergens
      herb.allergens.forEach(allergen => {
        const alertText = `${herbName}: ${allergen}`;
        if (matchesActiveFilters(allergen)) {
          alerts.allergens.push(alertText);
        }
      });
    };

    // Check individual herbs
    prescription.components.forEach(component => {
      if (component.type === 'herb') {
        checkHerbAlerts(component.name);
      }

      // Check compound formulas
      if (component.type === 'formula') {
        const subComponents = getSubComponents(component.name, component.dosage);
        if (subComponents) {
          subComponents.forEach(sub => {
            checkHerbAlerts(sub.name);
          });
        }
      }
    });

    return alerts;
  };

  const alerts = getAllAlerts();

  const handleCopy = async () => {
    if (!prescription) return;
    
    let text = `${prescription.name}\n\n`;
    text += 'Components:\n';
    
    prescription.components.forEach(comp => {
      const nameParts: string[] = [];
      
      if (comp.type === 'herb') {
        const herb = herbsData.find(h => h.pinyin_name === comp.name);
        
        // Add names based on config and order
        copyConfig.herbs.order.forEach(nameType => {
          if (nameType === 'pinyin' && copyConfig.herbs.pinyin) {
            nameParts.push(comp.name);
          } else if (nameType === 'pharmaceutical' && copyConfig.herbs.pharmaceutical && herb?.pharmaceutical_name) {
            nameParts.push(herb.pharmaceutical_name);
          } else if (nameType === 'hanzi' && copyConfig.herbs.hanzi && herb?.hanzi_name) {
            nameParts.push(herb.hanzi_name);
          }
        });
      } else if (comp.type === 'formula') {
        const formula = formulasData.find(f => f.pinyin_name === comp.name);
        
        // Add names based on config and order
        copyConfig.formulas.order.forEach(nameType => {
          if (nameType === 'pinyin' && copyConfig.formulas.pinyin) {
            nameParts.push(comp.name);
          } else if (nameType === 'pharmaceutical' && copyConfig.formulas.pharmaceutical && formula?.translated_name) {
            nameParts.push(formula.translated_name);
          } else if (nameType === 'hanzi' && copyConfig.formulas.hanzi && formula?.hanzi_name) {
            nameParts.push(formula.hanzi_name);
          }
        });
      }
      
      const displayName = nameParts.length > 0 ? nameParts.join(' / ') : comp.name;
      text += `- ${displayName} (${comp.dosage})\n`;
      
      // Add formula ingredients if enabled
      if (comp.type === 'formula' && copyConfig.formulas.ingredients) {
        const subComponents = getSubComponents(comp.name, comp.dosage);
        if (subComponents && subComponents.length > 0) {
          subComponents.forEach(sub => {
            const subHerb = herbsData.find(h => h.pinyin_name === sub.name);
            const subNameParts: string[] = [];
            
            copyConfig.herbs.order.forEach(nameType => {
              if (nameType === 'pinyin' && copyConfig.herbs.pinyin) {
                subNameParts.push(sub.name);
              } else if (nameType === 'pharmaceutical' && copyConfig.herbs.pharmaceutical && subHerb?.pharmaceutical_name) {
                subNameParts.push(subHerb.pharmaceutical_name);
              } else if (nameType === 'hanzi' && copyConfig.herbs.hanzi && subHerb?.hanzi_name) {
                subNameParts.push(subHerb.hanzi_name);
              }
            });
            
            const subDisplayName = subNameParts.length > 0 ? subNameParts.join(' / ') : sub.name;
            text += `  - ${subDisplayName} (${sub.dosage})\n`;
          });
        }
      }
    });
    
    if (prescription.comments && copyConfig.includeComments) {
      text += `\nComments:\n${prescription.comments}`;
    }
    
    // Fallback method for clipboard that works in all contexts
    try {
      // Try modern clipboard API first
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Prescription copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback to legacy method
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        toast.success('Prescription copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error('Failed to copy to clipboard');
      } finally {
        document.body.removeChild(textArea);
      }
    }
  };

  const handleDelete = () => {
    if (!prescription) return;
    
    deletePrescription(prescription.id);
    toast.success('Prescription deleted');
    setShowDeleteDialog(false);
    navigate('/prescriptions');
  };

  if (!prescription) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Prescription not found</h1>
          <Link
            to="/prescriptions"
            className="h-10 w-10 sm:w-11 sm:h-11 bg-white rounded-full border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
            title="Back to Prescriptions"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 lg:p-6 pb-[86px] sm:pb-4 lg:pb-6 flex flex-col gap-4 flex-1 min-h-0 overflow-hidden sm:overflow-auto">
        <main className="flex-1 min-w-0 flex flex-col gap-4 max-w-5xl mx-auto w-full">
          {/* Back button with standardized height - aligned with search bars */}
          <div className="flex items-center gap-2 h-10 sm:h-11 flex-shrink-0">
            <Link 
              to="/prescriptions" 
              className="h-10 w-10 sm:w-11 sm:h-11 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
              title="Back to Prescriptions"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
          </div>

          {/* Main content */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col flex-1 min-h-0 max-h-full">
            <div className="overflow-y-auto p-4 sm:p-6">
              <div className="mb-6 space-y-4">
                {/* Action buttons with standardized height */}
              <div className="flex items-center gap-2 h-10 sm:h-11 flex-shrink-0">
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:gap-2 sm:px-4 sm:py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm sm:text-base h-full"
                >
                  {copied ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{prescription.name}</h1>
                <p className="text-sm text-gray-500">
                  Created on {prescription.createdAt.toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Components</h2>
              <div className={`${(displayConfig.preview?.ingredientsLayout ?? 'grid') === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' : 'space-y-2 max-w-md'}`}>
                {prescription.components.map((component, idx) => {
                  // Use saved subComponents if available, otherwise calculate them
                  const subComponents = component.type === 'formula' 
                    ? (component.subComponents || getSubComponents(component.name, component.dosage))
                    : null;
                  const herb = component.type === 'herb' ? herbsData.find(h => h.pinyin_name === component.name) : null;

                  return (
                    <div key={idx} className={component.type === 'formula' && subComponents && subComponents.length > 0 && displayConfig.formulas.ingredients ? `bg-gray-50 rounded-lg p-3 border ${displayConfig.preview?.thermalActionIndicator ? getThermalActionBorderColor(component.name) : 'border-gray-200'}` : ""}>
                      {/* Main component */}
                      <div className={component.type === 'herb' || !subComponents || subComponents.length === 0 || !displayConfig.formulas.ingredients ? `bg-gray-50 rounded-lg p-3 border ${component.type === 'herb' && displayConfig.preview?.natureIndicator && herb ? getNatureBorderColor(component.name) : component.type === 'formula' && displayConfig.preview?.thermalActionIndicator ? getThermalActionBorderColor(component.name) : 'border-gray-200'}` : ""}>
                        <div className="flex items-center justify-between gap-3">
                          {/* Expand/Collapse button for formulas with ingredients - moved to left */}
                          {component.type === 'formula' && subComponents && subComponents.length > 0 && displayConfig.formulas.ingredients && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedFormulas(prev => 
                                  prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
                                );
                              }}
                              className="p-1 hover:bg-gray-200 rounded transition-colors flex items-center justify-center flex-shrink-0 mt-0.5"
                              aria-label={expandedFormulas.includes(idx) ? "Collapse ingredients" : "Expand ingredients"}
                            >
                              {expandedFormulas.includes(idx) ? (
                                <ChevronUp className="w-3.5 h-3.5 text-gray-600" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-gray-600" />
                              )}
                            </button>
                          )}
                          
                          <div
                            className="flex flex-col gap-0.5 flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => {
                              if (component.type === 'herb') {
                                // Only open modal if herb exists in database
                                const herbExists = herbsData.find(h => h.pinyin_name === component.name);
                                if (herbExists) {
                                  modalNav.reset({ type: 'herb', name: component.name });
                                }
                              } else {
                                // Only open modal if formula exists in database
                                const formulaExists = formulasData.find(f => f.pinyin_name === component.name);
                                if (formulaExists) {
                                  modalNav.reset({ type: 'formula', name: component.name });
                                }
                              }
                            }}
                          >
                            {/* Herb display */}
                            {component.type === 'herb' && (() => {
                              // If herb is not found in herbsData, display component name only
                              if (!herb) {
                                return (
                                  <div className="font-medium text-gray-900 text-[16px]">
                                    {component.name}
                                  </div>
                                );
                              }
                              
                              const visibleNames = displayConfig.herbs.order.filter(nameType => {
                                if (nameType === 'pinyin') return displayConfig.herbs.pinyin;
                                if (nameType === 'pharmaceutical') return displayConfig.herbs.pharmaceutical && herb.pharmaceutical_name;
                                if (nameType === 'hanzi') return displayConfig.herbs.hanzi && herb.hanzi_name;
                                return false;
                              });
                              const firstVisibleName = visibleNames[0];
                              
                              return (
                                <>
                                  {displayConfig.herbs.order.map((nameType) => {
                                    const isFirst = nameType === firstVisibleName;
                                    if (nameType === 'pinyin' && displayConfig.herbs.pinyin) {
                                      return (
                                        <div key={nameType} className={isFirst ? "font-medium text-gray-900 text-[16px] flex items-center gap-2" : "text-sm lg:text-xs text-gray-500"}>
                                          <span>{component.name}</span>
                                          {isFirst && isHerbBanned(herb) && (
                                            <Ban className="w-4 h-4 text-red-600" />
                                          )}
                                        </div>
                                      );
                                    }
                                    if (nameType === 'pharmaceutical' && displayConfig.herbs.pharmaceutical && herb.pharmaceutical_name) {
                                      return (
                                        <div key={nameType} className={isFirst ? "font-medium text-gray-900 text-[16px] flex items-center gap-2" : "text-sm lg:text-xs text-gray-500"}>
                                          <span>{herb.pharmaceutical_name}</span>
                                          {isFirst && isHerbBanned(herb) && (
                                            <Ban className="w-4 h-4 text-red-600" />
                                          )}
                                        </div>
                                      );
                                    }
                                    if (nameType === 'hanzi' && displayConfig.herbs.hanzi && herb.hanzi_name) {
                                      return (
                                        <div key={nameType} className={isFirst ? "font-medium text-gray-900 text-[16px] flex items-center gap-2" : "text-sm lg:text-xs text-gray-500"}>
                                          <span>{herb.hanzi_name}</span>
                                          {isFirst && isHerbBanned(herb) && (
                                            <Ban className="w-4 h-4 text-red-600" />
                                          )}
                                        </div>
                                      );
                                    }
                                    return null;
                                  })}
                                </>
                              );
                            })()}
                            
                            {/* Formula display */}
                            {component.type === 'formula' && (() => {
                              const formula = formulasData.find(f => f.pinyin_name === component.name);
                              const visibleNames = displayConfig.formulas.order.filter(nameType => {
                                if (nameType === 'pinyin') return displayConfig.formulas.pinyin;
                                if (nameType === 'pharmaceutical') return displayConfig.formulas.pharmaceutical && formula?.translated_name;
                                if (nameType === 'hanzi') return displayConfig.formulas.hanzi && formula?.hanzi_name;
                                return false;
                              });
                              const firstVisibleName = visibleNames[0];
                              
                              return (
                                <>
                                  {displayConfig.formulas.order.map((nameType) => {
                                    const isFirst = nameType === firstVisibleName;
                                    if (nameType === 'pinyin' && displayConfig.formulas.pinyin) {
                                      return <div key={nameType} className={isFirst ? "font-medium text-gray-900 text-[16px]" : "text-sm lg:text-xs text-gray-500"}>{component.name}</div>;
                                    }
                                    if (nameType === 'pharmaceutical' && displayConfig.formulas.pharmaceutical && formula?.translated_name) {
                                      return <div key={nameType} className={isFirst ? "font-medium text-gray-900 text-[16px]" : "text-sm lg:text-xs text-gray-500"}>{formula.translated_name}</div>;
                                    }
                                    if (nameType === 'hanzi' && displayConfig.formulas.hanzi && formula?.hanzi_name) {
                                      return <div key={nameType} className={isFirst ? "font-medium text-gray-900 text-[16px]" : "text-sm lg:text-xs text-gray-500"}>{formula.hanzi_name}</div>;
                                    }
                                    return null;
                                  })}
                                </>
                              );
                            })()}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <div className="text-gray-900 font-medium whitespace-nowrap">{component.dosage}</div>
                          </div>
                        </div>
                      </div>

                      {/* Formula ingredients as separate sub-items */}
                      {component.type === 'formula' && subComponents && subComponents.length > 0 && displayConfig.formulas.ingredients && expandedFormulas.includes(idx) && (
                        <div className="ml-6 mt-2 space-y-1">
                          {subComponents.map((sub, subIdx) => {
                            const subHerb = herbsData.find(h => h.pinyin_name === sub.name);
                            return (
                              <div
                                key={`${idx}-sub-${subIdx}`}
                                className={`bg-white rounded-lg px-3 py-2 border ${displayConfig.preview?.natureIndicator && subHerb ? getNatureBorderColor(sub.name) : 'border-gray-200'} cursor-pointer hover:bg-gray-50 transition-colors`}
                                onClick={() => {
                                  // Only open modal if herb exists in database
                                  const herbExists = herbsData.find(h => h.pinyin_name === sub.name);
                                  if (herbExists) {
                                    modalNav.reset({ type: 'herb', name: sub.name });
                                  }
                                }}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex flex-col gap-0.5">
                                    {(() => {
                                      const visibleNames = displayConfig.herbs.order.filter(nameType => {
                                        if (nameType === 'pinyin') return displayConfig.herbs.pinyin;
                                        if (nameType === 'pharmaceutical') return displayConfig.herbs.pharmaceutical && subHerb?.pharmaceutical_name;
                                        if (nameType === 'hanzi') return displayConfig.herbs.hanzi && subHerb?.chinese;
                                        return false;
                                      });
                                      const firstVisibleName = visibleNames[0];
                                      
                                      return displayConfig.herbs.order.map((nameType) => {
                                        const isFirst = nameType === firstVisibleName;
                                        if (nameType === 'pinyin' && displayConfig.herbs.pinyin) {
                                          return (
                                            <div key={nameType} className={isFirst ? "text-xs text-gray-600 flex items-center gap-1.5" : "text-xs text-gray-500"}>
                                              <span>{sub.name}</span>
                                              {isFirst && subHerb && isHerbBanned(subHerb) && (
                                                <Ban className="w-3 h-3 text-red-600" />
                                              )}
                                            </div>
                                          );
                                        }
                                        if (nameType === 'pharmaceutical' && displayConfig.herbs.pharmaceutical && subHerb?.pharmaceutical_name) {
                                          return (
                                            <div key={nameType} className={isFirst ? "text-xs text-gray-600 flex items-center gap-1.5" : "text-xs text-gray-500"}>
                                              <span>{subHerb.pharmaceutical_name}</span>
                                              {isFirst && isHerbBanned(subHerb) && (
                                                <Ban className="w-3 h-3 text-red-600" />
                                              )}
                                            </div>
                                          );
                                        }
                                        if (nameType === 'hanzi' && displayConfig.herbs.hanzi && subHerb?.hanzi_name) {
                                          return (
                                            <div key={nameType} className={isFirst ? "text-xs text-gray-600 flex items-center gap-1.5" : "text-xs text-gray-500"}>
                                              <span>{subHerb.hanzi_name}</span>
                                              {isFirst && isHerbBanned(subHerb) && (
                                                <Ban className="w-3 h-3 text-red-600" />
                                              )}
                                            </div>
                                          );
                                        }
                                        return null;
                                      });
                                    })()}
                                  </div>
                                  <div className="text-xs text-gray-700 whitespace-nowrap">{sub.dosage}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comments section */}
            {prescription.comments && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Comments</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{prescription.comments}</p>
                </div>
              </div>
            )}

            {/* Patient Safety Profile - Show active filters */}
            {prescription.patientSafetyProfile && Object.values(prescription.patientSafetyProfile).some(v => v) && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Patient Safety Profile</h2>
                <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(prescription.patientSafetyProfile)
                      .filter(([_, value]) => value === true)
                      .map(([key, _]) => {
                        const labels: Record<string, string> = {
                          pregnancy: 'Pregnancy',
                          breastfeeding: 'Breastfeeding',
                          pediatric: 'Pediatric',
                          geriatric: 'Geriatric',
                          renalImpairment: 'Renal Impairment',
                          hepaticImpairment: 'Hepatic Impairment',
                          hypertension: 'Hypertension',
                          diabetes: 'Diabetes',
                          anticoagulants: 'Anticoagulants',
                          immunosuppressants: 'Immunosuppressants',
                          chemotherapy: 'Chemotherapy',
                        };
                        return (
                          <span 
                            key={key}
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300"
                          >
                            {labels[key] || key}
                          </span>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* Safety Alerts */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Safety Alerts</h2>
                
                {/* Alert Display Mode Toggle */}
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => updateAlertDisplayMode('filtered')}
                    className={`px-3 py-1 text-xs sm:text-sm font-medium rounded transition-colors ${
                      alertDisplayMode === 'filtered'
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Filtered
                  </button>
                  <button
                    onClick={() => updateAlertDisplayMode('all')}
                    className={`px-3 py-1 text-xs sm:text-sm font-medium rounded transition-colors ${
                      alertDisplayMode === 'all'
                        ? 'bg-white text-teal-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>
              
              {alerts.contraindications.length === 0 && alerts.cautions.length === 0 && alerts.interactions.length === 0 && alerts.allergens.length === 0 ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">No safety alerts for this prescription.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alerts.contraindications.length > 0 && (
                    <AlertCard
                      type="contraindication"
                      title="Contraindications"
                      items={alerts.contraindications}
                    />
                  )}
                  
                  {alerts.cautions.length > 0 && (
                    <AlertCard
                      type="caution"
                      title="Cautions"
                      items={alerts.cautions}
                    />
                  )}
                  
                  {alerts.interactions.length > 0 && (
                    <AlertCard
                      type="interaction"
                      title="Interactions"
                      items={alerts.interactions}
                    />
                  )}
                  
                  {alerts.allergens.length > 0 && (
                    <AlertCard
                      type="allergen"
                      title="Allergens"
                      items={alerts.allergens}
                    />
                  )}
                </div>
              )}
              </div>
            </div>
          </div>
      </main>

      {/* Unified Details Modal */}
      <UnifiedDetailsModal
        isOpen={modalNav.isOpen}
        currentItem={modalNav.currentItem}
        canGoBack={modalNav.canGoBack}
        onClose={modalNav.close}
        onGoBack={modalNav.goBack}
        onNavigate={modalNav.navigateTo}
        showNatureIndicator={displayConfig.herbs.natureIndicator}
        showThermalActionIndicator={displayConfig.formulas.thermalActionIndicator}
        herbDetailChipsNatureIndicator={globalSettings.herbs.detailViewChipsNature}
        herbDetailViewNameOrder={globalSettings.herbs.detailViewNameOrder}
        herbDetailViewPinyin={globalSettings.herbs.detailViewPinyin}
        herbDetailViewPharmaceutical={globalSettings.herbs.detailViewPharmaceutical}
        herbDetailViewHanzi={globalSettings.herbs.detailViewHanzi}
        formulaDetailChipsThermalIndicator={globalSettings.formulas.detailViewChipsThermalAction}
        formulaDetailViewNameOrder={globalSettings.formulas.detailViewNameOrder}
        formulaDetailViewPinyin={globalSettings.formulas.detailViewPinyin}
        formulaDetailViewPharmaceutical={globalSettings.formulas.detailViewPharmaceutical}
        formulaDetailViewAlternative={globalSettings.formulas.detailViewAlternative}
        formulaDetailViewHanzi={globalSettings.formulas.detailViewHanzi}
        isHerbBanned={isHerbBanned}
        ingredientsShowFormulas={globalSettings.formulas.ingredientsShowFormulas}
        ingredientsNatureIndicator={globalSettings.formulas.ingredientsNatureIndicator}
        ingredientsThermalIndicator={globalSettings.formulas.ingredientsThermalIndicator}
        ingredientsLayout={globalSettings.formulas.ingredientsLayout}
        ingredientsHerbPinyin={globalSettings.formulas.ingredientsHerbPinyin}
        ingredientsHerbLatin={globalSettings.formulas.ingredientsHerbLatin}
        ingredientsHerbHanzi={globalSettings.formulas.ingredientsHerbHanzi}
        ingredientsHerbOrder={globalSettings.formulas.ingredientsHerbOrder}
        ingredientsFormulaPinyin={globalSettings.formulas.ingredientsFormulaPinyin}
        ingredientsFormulaPharmaceutical={globalSettings.formulas.ingredientsFormulaPharmaceutical}
        ingredientsFormulaHanzi={globalSettings.formulas.ingredientsFormulaHanzi}
        ingredientsFormulaOrder={globalSettings.formulas.ingredientsFormulaOrder}
        allItems={prescription?.components.map(c => c.name) || []}
        onNavigatePrevious={() => {
          if (!modalNav.currentItem || !prescription) return;
          const currentIndex = prescription.components.findIndex(c => c.name === modalNav.currentItem!.name);
          if (currentIndex > 0) {
            const previousComponent = prescription.components[currentIndex - 1];
            modalNav.navigateTo({ 
              type: previousComponent.type as 'herb' | 'formula', 
              name: previousComponent.name 
            });
          }
        }}
        onNavigateNext={() => {
          if (!modalNav.currentItem || !prescription) return;
          const currentIndex = prescription.components.findIndex(c => c.name === modalNav.currentItem!.name);
          if (currentIndex < prescription.components.length - 1) {
            const nextComponent = prescription.components[currentIndex + 1];
            modalNav.navigateTo({ 
              type: nextComponent.type as 'herb' | 'formula', 
              name: nextComponent.name 
            });
          }
        }}
      />

      {/* Settings Modal */}
      <Dialog.Root open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/30 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl z-50 w-[95vw] sm:w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <Dialog.Title className="text-lg font-bold text-gray-900">
                Display & Copy Settings
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>

            {/* Tabs */}
            <div className="flex-shrink-0 flex border-b border-gray-200 px-6">
              <button
                onClick={() => setSettingsTab('display')}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  settingsTab === 'display'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Display Settings
              </button>
              <button
                onClick={() => setSettingsTab('copy')}
                className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                  settingsTab === 'copy'
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Copy Settings
              </button>
            </div>

            {/* Content - scrollable */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Display Settings Tab */}
              {settingsTab === 'display' && (
                <>
                <Dialog.Description className="text-sm text-gray-600 mb-4">
                  Customize how names and information are displayed on screen
                </Dialog.Description>

                {/* Herbs Display Options */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Herbs</h3>
                  <div className="space-y-2">
                    {displayConfig.herbs.order.map((nameType, index) => {
                      const labels = { pinyin: 'Pinyin Name', pharmaceutical: 'Pharmaceutical Name', hanzi: 'Hanzi Name' };
                      const isFirst = index === 0;
                      const isLast = index === displayConfig.herbs.order.length - 1;
                      
                      return (
                        <div key={nameType} className="flex items-center gap-2">
                          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                            <input
                              type="checkbox"
                              checked={displayConfig.herbs[nameType as keyof typeof displayConfig.herbs] as boolean}
                              onChange={(e) => updateDisplayConfig({
                                herbs: { ...displayConfig.herbs, [nameType]: e.target.checked }
                              })}
                              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-700 flex-1">{labels[nameType as keyof typeof labels]}</span>
                            
                            {/* Mobile: Arrows inside label */}
                            <div className="flex gap-1 sm:hidden">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (!isFirst) {
                                    const newOrder = [...displayConfig.herbs.order];
                                    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                                    updateDisplayConfig({ herbs: { ...displayConfig.herbs, order: newOrder } });
                                  }
                                }}
                                disabled={isFirst}
                                className={`p-1 rounded transition-colors flex items-center justify-center ${isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
                                aria-label="Move up"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (!isLast) {
                                    const newOrder = [...displayConfig.herbs.order];
                                    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                    updateDisplayConfig({ herbs: { ...displayConfig.herbs, order: newOrder } });
                                  }
                                }}
                                disabled={isLast}
                                className={`p-1 rounded transition-colors flex items-center justify-center ${isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
                                aria-label="Move down"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>
                            </div>
                          </label>
                          
                          {/* Desktop: Arrows outside label */}
                          <div className="hidden sm:flex flex-col gap-0.5">
                            <button
                              onClick={() => {
                                if (!isFirst) {
                                  const newOrder = [...displayConfig.herbs.order];
                                  [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                                  updateDisplayConfig({ herbs: { ...displayConfig.herbs, order: newOrder } });
                                }
                              }}
                              disabled={isFirst}
                              className={`p-1 rounded transition-colors flex items-center justify-center ${isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
                              aria-label="Move up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                if (!isLast) {
                                  const newOrder = [...displayConfig.herbs.order];
                                  [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                  updateDisplayConfig({ herbs: { ...displayConfig.herbs, order: newOrder } });
                                }
                              }}
                              disabled={isLast}
                              className={`p-1 rounded transition-colors flex items-center justify-center ${isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
                              aria-label="Move down"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Formulas Display Options */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Formulas</h3>
                  <div className="space-y-2">
                    {displayConfig.formulas.order.map((nameType, index) => {
                      const labels = { pinyin: 'Pinyin Name', pharmaceutical: 'Pharmaceutical Name', hanzi: 'Hanzi Name' };
                      const isFirst = index === 0;
                      const isLast = index === displayConfig.formulas.order.length - 1;
                      
                      return (
                        <div key={nameType} className="flex items-center gap-2">
                          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                            <input
                              type="checkbox"
                              checked={displayConfig.formulas[nameType as keyof typeof displayConfig.formulas] as boolean}
                              onChange={(e) => updateDisplayConfig({
                                formulas: { ...displayConfig.formulas, [nameType]: e.target.checked }
                              })}
                              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-700 flex-1">{labels[nameType as keyof typeof labels]}</span>
                            
                            {/* Mobile: Arrows inside label */}
                            <div className="flex gap-1 sm:hidden">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (!isFirst) {
                                    const newOrder = [...displayConfig.formulas.order];
                                    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                                    updateDisplayConfig({ formulas: { ...displayConfig.formulas, order: newOrder } });
                                  }
                                }}
                                disabled={isFirst}
                                className={`p-1 rounded transition-colors flex items-center justify-center ${isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
                                aria-label="Move up"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (!isLast) {
                                    const newOrder = [...displayConfig.formulas.order];
                                    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                    updateDisplayConfig({ formulas: { ...displayConfig.formulas, order: newOrder } });
                                  }
                                }}
                                disabled={isLast}
                                className={`p-1 rounded transition-colors flex items-center justify-center ${isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
                                aria-label="Move down"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>
                            </div>
                          </label>
                          
                          {/* Desktop: Arrows outside label */}
                          <div className="hidden sm:flex flex-col gap-0.5">
                            <button
                              onClick={() => {
                                if (!isFirst) {
                                  const newOrder = [...displayConfig.formulas.order];
                                  [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                                  updateDisplayConfig({ formulas: { ...displayConfig.formulas, order: newOrder } });
                                }
                              }}
                              disabled={isFirst}
                              className={`p-1 rounded transition-colors flex items-center justify-center ${isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
                              aria-label="Move up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                if (!isLast) {
                                  const newOrder = [...displayConfig.formulas.order];
                                  [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                  updateDisplayConfig({ formulas: { ...displayConfig.formulas, order: newOrder } });
                                }
                              }}
                              disabled={isLast}
                              className={`p-1 rounded transition-colors flex items-center justify-center ${isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
                              aria-label="Move down"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Show Ingredients checkbox */}
                    <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={displayConfig.formulas.ingredients}
                        onChange={(e) => updateDisplayConfig({
                          formulas: { ...displayConfig.formulas, ingredients: e.target.checked }
                        })}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700 flex-1">Show Ingredients</span>
                    </label>
                  </div>
                </div>

                {/* Filters Display Options */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Safety Filters</h3>
                  
                  {/* Safety Profile Subsection */}
                  <div className="mb-4">
                    <div className="space-y-2">
                      <label className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="alertMode"
                          checked={alertDisplayMode === 'filtered'}
                          onChange={() => updateAlertDisplayMode('filtered')}
                          className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500 mt-0.5"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900 block">Filtered Alerts</span>
                          <span className="text-xs text-gray-500">Only show alerts matching selected safety filters</span>
                        </div>
                      </label>
                      
                      <label className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="alertMode"
                          checked={alertDisplayMode === 'all'}
                          onChange={() => updateAlertDisplayMode('all')}
                          className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500 mt-0.5"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900 block">All Alerts</span>
                          <span className="text-xs text-gray-500">Show all contraindications, cautions, and interactions</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Preview Display Options */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Preview Display</h3>
                  
                  {/* Ingredient Indicators */}
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Ingredient Indicators</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={displayConfig.preview?.natureIndicator ?? true}
                          onChange={(e) => updateDisplayConfig({
                            preview: { ...displayConfig.preview, natureIndicator: e.target.checked }
                          })}
                          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700 flex-1">Nature Indicator</span>
                      </label>
                      
                      <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={displayConfig.preview?.thermalActionIndicator ?? true}
                          onChange={(e) => updateDisplayConfig({
                            preview: { ...displayConfig.preview, thermalActionIndicator: e.target.checked }
                          })}
                          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700 flex-1">Thermal Action Indicator</span>
                      </label>
                    </div>
                  </div>
                  
                  {/* Ingredients Layout */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Ingredients Layout</h4>
                    <div className="space-y-2">
                      <label className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="ingredientsLayout"
                          checked={(displayConfig.preview?.ingredientsLayout ?? 'grid') === 'grid'}
                          onChange={() => updateDisplayConfig({
                            preview: { ...displayConfig.preview, ingredientsLayout: 'grid' as 'grid' | 'list' }
                          })}
                          className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500 mt-0.5"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900 block">Two Columns (Grid)</span>
                          <span className="text-xs text-gray-500">Display ingredients in a two-column grid layout</span>
                        </div>
                      </label>
                      
                      <label className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                          type="radio"
                          name="ingredientsLayout"
                          checked={(displayConfig.preview?.ingredientsLayout ?? 'grid') === 'list'}
                          onChange={() => updateDisplayConfig({
                            preview: { ...displayConfig.preview, ingredientsLayout: 'list' as 'grid' | 'list' }
                          })}
                          className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500 mt-0.5"
                        />
                        <div className="flex-1">
                          <span className="text-sm font-medium text-gray-900 block">Ordered List (Single Column)</span>
                          <span className="text-xs text-gray-500">Display ingredients in a single-column ordered list</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
                </>
              )}

              {/* Copy Settings Tab */}
              {settingsTab === 'copy' && (
                <>
                <Dialog.Description className="text-sm text-gray-600 mb-4">
                  Choose which names to include when copying the prescription
                </Dialog.Description>

                {/* Herbs Copy Options */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Herbs</h3>
                  <div className="space-y-2">
                    {copyConfig.herbs.order.map((nameType, index) => {
                      const labels = { pinyin: 'Pinyin Name', pharmaceutical: 'Pharmaceutical Name', hanzi: 'Hanzi Name' };
                      const isFirst = index === 0;
                      const isLast = index === copyConfig.herbs.order.length - 1;
                      
                      return (
                        <div key={nameType} className="flex items-center gap-2">
                          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                            <input
                              type="checkbox"
                              checked={copyConfig.herbs[nameType as keyof typeof copyConfig.herbs] as boolean}
                              onChange={(e) => updateCopyConfig({
                                herbs: { ...copyConfig.herbs, [nameType]: e.target.checked }
                              })}
                              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-700 flex-1">{labels[nameType as keyof typeof labels]}</span>
                            
                            {/* Mobile: Arrows inside label */}
                            <div className="flex gap-1 sm:hidden">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (!isFirst) {
                                    const newOrder = [...copyConfig.herbs.order];
                                    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                                    updateCopyConfig({ herbs: { ...copyConfig.herbs, order: newOrder } });
                                  }
                                }}
                                disabled={isFirst}
                                className={`p-1 rounded transition-colors flex items-center justify-center ${isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
                                aria-label="Move up"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (!isLast) {
                                    const newOrder = [...copyConfig.herbs.order];
                                    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                    updateCopyConfig({ herbs: { ...copyConfig.herbs, order: newOrder } });
                                  }
                                }}
                                disabled={isLast}
                                className={`p-1 rounded transition-colors flex items-center justify-center ${isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
                                aria-label="Move down"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>
                            </div>
                          </label>
                          
                          {/* Desktop: Arrows outside label */}
                          <div className="hidden sm:flex flex-col gap-0.5">
                            <button
                              onClick={() => {
                                if (!isFirst) {
                                  const newOrder = [...copyConfig.herbs.order];
                                  [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                                  updateCopyConfig({ herbs: { ...copyConfig.herbs, order: newOrder } });
                                }
                              }}
                              disabled={isFirst}
                              className={`p-1 rounded transition-colors flex items-center justify-center ${isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
                              aria-label="Move up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                if (!isLast) {
                                  const newOrder = [...copyConfig.herbs.order];
                                  [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                  updateCopyConfig({ herbs: { ...copyConfig.herbs, order: newOrder } });
                                }
                              }}
                              disabled={isLast}
                              className={`p-1 rounded transition-colors flex items-center justify-center ${isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
                              aria-label="Move down"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Formulas Copy Options */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Formulas</h3>
                  <div className="space-y-2">
                    {copyConfig.formulas.order.map((nameType, index) => {
                      const labels = { pinyin: 'Pinyin Name', pharmaceutical: 'Pharmaceutical Name', hanzi: 'Hanzi Name' };
                      const isFirst = index === 0;
                      const isLast = index === copyConfig.formulas.order.length - 1;
                      
                      return (
                        <div key={nameType} className="flex items-center gap-2">
                          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                            <input
                              type="checkbox"
                              checked={copyConfig.formulas[nameType as keyof typeof copyConfig.formulas] as boolean}
                              onChange={(e) => updateCopyConfig({
                                formulas: { ...copyConfig.formulas, [nameType]: e.target.checked }
                              })}
                              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-700 flex-1">{labels[nameType as keyof typeof labels]}</span>
                            
                            {/* Mobile: Arrows inside label */}
                            <div className="flex gap-1 sm:hidden">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (!isFirst) {
                                    const newOrder = [...copyConfig.formulas.order];
                                    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                                    updateCopyConfig({ formulas: { ...copyConfig.formulas, order: newOrder } });
                                  }
                                }}
                                disabled={isFirst}
                                className={`p-1 rounded transition-colors flex items-center justify-center ${isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
                                aria-label="Move up"
                              >
                                <ChevronUp className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  if (!isLast) {
                                    const newOrder = [...copyConfig.formulas.order];
                                    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                    updateCopyConfig({ formulas: { ...copyConfig.formulas, order: newOrder } });
                                  }
                                }}
                                disabled={isLast}
                                className={`p-1 rounded transition-colors flex items-center justify-center ${isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
                                aria-label="Move down"
                              >
                                <ChevronDown className="w-3 h-3" />
                              </button>
                            </div>
                          </label>
                          
                          {/* Desktop: Arrows outside label */}
                          <div className="hidden sm:flex flex-col gap-0.5">
                            <button
                              onClick={() => {
                                if (!isFirst) {
                                  const newOrder = [...copyConfig.formulas.order];
                                  [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                                  updateCopyConfig({ formulas: { ...copyConfig.formulas, order: newOrder } });
                                }
                              }}
                              disabled={isFirst}
                              className={`p-1 rounded transition-colors flex items-center justify-center ${isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
                              aria-label="Move up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => {
                                if (!isLast) {
                                  const newOrder = [...copyConfig.formulas.order];
                                  [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                  updateCopyConfig({ formulas: { ...copyConfig.formulas, order: newOrder } });
                                }
                              }}
                              disabled={isLast}
                              className={`p-1 rounded transition-colors flex items-center justify-center ${isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'}`}
                              aria-label="Move down"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Show Ingredients checkbox */}
                    <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <input
                        type="checkbox"
                        checked={copyConfig.formulas.ingredients}
                        onChange={(e) => updateCopyConfig({
                          formulas: { ...copyConfig.formulas, ingredients: e.target.checked }
                        })}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700 flex-1">Include Ingredients</span>
                    </label>
                  </div>
                </div>

                {/* Comments Option */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Other</h3>
                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={copyConfig.includeComments}
                      onChange={(e) => updateCopyConfig({
                        includeComments: e.target.checked
                      })}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700 flex-1">Include Comments</span>
                  </label>
                </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <Dialog.Close asChild>
                <button className="w-full px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
                  Apply
                </button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      </div>
    </div>
  );
}
