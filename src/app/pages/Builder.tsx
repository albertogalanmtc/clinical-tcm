// Prescription Builder - Advanced filtering and safety system
// Updated: 2026-02-22
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useOutletContext } from 'react-router-dom';
import { getAllHerbs } from '@/app/data/herbsManager';
import { getAllFormulas } from '@/app/data/formulasManager';
import { PrescriptionComponent, savePrescription, getPrescriptionsSync, updatePrescription } from '@/app/data/prescriptions';
import { SearchBar } from '@/app/components/ui/SearchBar';
import { AlertCard } from '@/app/components/ui/AlertCard';
import { Badge } from '@/app/components/ui/Badge';
import { FeatureGuard } from '@/app/components/FeatureGuard';
import { X, Plus, Minus, Save, Trash2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Filter, Info, Ban, Search, Pill, Leaf, Star } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { useUnsavedChanges } from '@/app/hooks/useUnsavedChanges';
import { useHerbBannedStatus } from '@/app/hooks/useHerbBannedStatus';
import { useGlobalSettings } from '@/app/hooks/useGlobalSettings';
import { useFavorites } from '@/app/hooks/useFavorites';
import { NatureIndicator } from '@/app/components/ui/NatureIndicator';
import { FlavorChip } from '@/app/components/ui/FlavorChip';
import { MeridianChip } from '@/app/components/ui/MeridianChip';
import { Chip } from '@/app/components/ui/Chip';
import { ThermalActionIndicator } from '@/app/components/ui/ThermalActionIndicator';
import { GeneralConditionsModal } from '@/app/components/GeneralConditionsModal';
import { MedicationsModal } from '@/app/components/MedicationsModal';
import { AllergiesModal } from '@/app/components/AllergiesModal';
import { TcmRiskPatternsModal } from '@/app/components/TcmRiskPatternsModal';
import { normalizeForSearch } from '@/app/utils/searchUtils';
import { usePlanFeatures } from '@/app/hooks/usePlanFeatures';
import { UpgradePrompt } from '@/app/components/UpgradePrompt';
import { CLINICAL_CONDITIONS } from '@/app/data/clinicalConditions';
import { ClinicalApplicationsModals } from '@/app/components/builder/ClinicalApplicationsModals';
import { UnifiedDetailsModal } from '@/app/components/UnifiedDetailsModal';
import { useModalNavigation } from '@/app/hooks/useModalNavigation';
import type { HerbAction } from '@/app/data/herbs';
import { getDisplayName, getActiveSafetyCategories, type SafetyCategory } from '@/app/data/safetyCategoriesManager';

const STORAGE_KEY = 'builder-expanded-categories';
const BUILDER_STATE_KEY = 'builder-prescription-draft';

// Clinical Applications - Unified conditions list (Western + TCM) with associated patterns
// Clinical conditions data now imported from @/app/data/clinicalConditions

// Western Medical Diagnoses list (to be populated)
const WESTERN_MEDICAL_DX = [
  // List will be provided by user
].sort();

// TCM Patterns list for mobile filters
const TCM_PATTERNS = [
  'Qi Deficiency',
  'Blood Deficiency',
  'Blood Stasis',
  'Yin Deficiency',
  'Yin Deficiency Heat',
  'Yang Deficiency',
  'Dampness',
  'Heat',
  'Liver Yang Rising',
  'Phlegm Damp',
  'Damp Heat'
].sort();

// Helper function to get all available target_actions grouped by system from actual herb/formula data
const getAvailableTargetActions = (): Record<string, string[]> => {
  const targetActionsBySystem: Record<string, Set<string>> = {};

  // Gather from herbs
  getAllHerbs().forEach(herb => {
    if (Array.isArray(herb.biological_mechanisms)) {
      herb.biological_mechanisms.forEach((mechanism: any) => {
        if (typeof mechanism === 'object' && mechanism.system && mechanism.target_action) {
          if (!targetActionsBySystem[mechanism.system]) {
            targetActionsBySystem[mechanism.system] = new Set();
          }
          targetActionsBySystem[mechanism.system].add(mechanism.target_action);
        }
      });
    }
  });

  // Gather from formulas (if they have biological mechanisms in the new format)
  getAllFormulas().forEach(formula => {
    if (Array.isArray(formula.biological_mechanisms)) {
      formula.biological_mechanisms.forEach((mechanism: any) => {
        if (typeof mechanism === 'object' && mechanism.system && mechanism.target_action) {
          if (!targetActionsBySystem[mechanism.system]) {
            targetActionsBySystem[mechanism.system] = new Set();
          }
          targetActionsBySystem[mechanism.system].add(mechanism.target_action);
        }
      });
    }
  });

  // Convert Sets to sorted arrays
  const result: Record<string, string[]> = {};
  Object.keys(targetActionsBySystem).sort().forEach(system => {
    result[system] = Array.from(targetActionsBySystem[system]).sort();
  });

  return result;
};

const getAvailablePharmacologicalEffects = (): string[] => {
  const effects = new Set<string>();

  getAllHerbs().forEach(herb => {
    if (Array.isArray(herb.pharmacological_effects) && herb.pharmacological_effects.length > 0) {
      herb.pharmacological_effects.forEach(effect => {
        if (effect && typeof effect === 'string') {
          effects.add(effect);
        }
      });
    }
  });

  return Array.from(effects).sort();
};

const getAvailableBiologicalMechanisms = (): string[] => {
  const mechanisms = new Set<string>();

  getAllHerbs().forEach(herb => {
    if (Array.isArray(herb.biological_mechanisms) && herb.biological_mechanisms.length > 0) {
      herb.biological_mechanisms.forEach((mechanism: any) => {
        // Extract system from the object structure
        if (typeof mechanism === 'object' && mechanism.system && typeof mechanism.system === 'string') {
          mechanisms.add(mechanism.system);
        }
      });
    }
  });

  // Also gather from formulas
  getAllFormulas().forEach(formula => {
    if (Array.isArray(formula.biological_mechanisms) && formula.biological_mechanisms.length > 0) {
      formula.biological_mechanisms.forEach((mechanism: any) => {
        // Extract system from the object structure
        if (typeof mechanism === 'object' && mechanism.system && typeof mechanism.system === 'string') {
          mechanisms.add(mechanism.system);
        }
      });
    }
  });

  return Array.from(mechanisms).sort();
};

const getAvailableBioactiveCompounds = (): Record<string, string[]> => {
  const compoundsByClass: Record<string, Set<string>> = {};

  // Gather from herbs
  getAllHerbs().forEach(herb => {
    if (Array.isArray(herb.bioactive_compounds) && herb.bioactive_compounds.length > 0) {
      // Check if it's simple array or grouped array
      const firstItem = herb.bioactive_compounds[0];

      if (typeof firstItem === 'string') {
        // Simple array - add all to "Uncategorized" class
        if (!compoundsByClass['Uncategorized']) {
          compoundsByClass['Uncategorized'] = new Set();
        }
        (herb.bioactive_compounds as string[]).forEach(compound => {
          compoundsByClass['Uncategorized'].add(compound);
        });
      } else if (typeof firstItem === 'object' && 'chemical_class' in firstItem && 'compounds' in firstItem) {
        // Grouped array
        (herb.bioactive_compounds as Array<{ chemical_class: string; compounds: string[] }>).forEach(group => {
          if (group.chemical_class && Array.isArray(group.compounds)) {
            if (!compoundsByClass[group.chemical_class]) {
              compoundsByClass[group.chemical_class] = new Set();
            }
            group.compounds.forEach(compound => {
              if (compound && typeof compound === 'string') {
                compoundsByClass[group.chemical_class].add(compound);
              }
            });
          }
        });
      }
    }
  });

  // Convert Sets to sorted arrays
  const result: Record<string, string[]> = {};
  Object.keys(compoundsByClass).sort().forEach(chemClass => {
    result[chemClass] = Array.from(compoundsByClass[chemClass]).sort();
  });

  return result;
};

// Helper function to get biological mechanisms for a specific herb
const getHerbBiologicalMechanisms = (herbName: string) => {
  const herb = getAllHerbs().find(h => h.pinyin_name === herbName);
  if (!herb || !Array.isArray(herb.biological_mechanisms)) {
    return [];
  }
  
  return herb.biological_mechanisms.filter((m: any) => 
    typeof m === 'object' && m.system && m.target_action
  ) as { system: string; target_action: string }[];
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

// Clinical Use Filters - For finding BENEFICIAL herbs
interface ClinicalUseFilters {
  // Clinical Applications - Structure: [{condition, patterns: []}]
  // Empty patterns array means "all patterns" for that condition
  clinicalApplications: Array<{
    condition: string;
    patterns: string[];
  }>;

  // Legacy fields (keeping for backwards compatibility)
  condition: string | null; // Deprecated - use clinicalApplications
  patterns: string[]; // Deprecated - use clinicalApplications
}

// Patient Safety Profile - For safety alerts (contraindications/precautions)
interface PatientSafetyProfile {
  // General Conditions
  pregnancy: boolean;
  breastfeeding: boolean;
  insomnia: boolean;
  epilepsy: boolean;
  bleeding_disorders: boolean;
  liver_disease: boolean;
  kidney_disease: boolean;
  // Medications
  anticoagulants: boolean;
  antihypertensives: boolean;
  hypoglycemics: boolean;
  immunosuppressants: boolean;
  antidepressants: boolean;
  antiplatelets: boolean;
  beta_blockers: boolean;
  diuretics: boolean;
  corticosteroids: boolean;
  sedatives: boolean;
  // Allergies
  shellfish: boolean;
  gluten: boolean;
  nuts: boolean;
  dairy: boolean;
  soy: boolean;
  asteraceae: boolean;
  apiaceae: boolean;
  // TCM Risk Patterns
  qi_deficiency: boolean;
  blood_deficiency: boolean;
  blood_stasis: boolean;
  yin_deficiency: boolean;
  yin_deficiency_heat: boolean;
  yang_deficiency: boolean;
  dampness: boolean;
  heat: boolean;
  liver_yang_rising: boolean;
  phlegm_damp: boolean;
  damp_heat: boolean;
  internal_wind: boolean;
}

interface SelectedComponent extends PrescriptionComponent {
  tempId: string;
  subComponents?: { name: string; dosage: string }[]; // For compound formulas
}

// Helper function to check if text matches a safety category (including related terms)
function matchesSafetyCategory(text: string, category: SafetyCategory): boolean {
  if (!text) return false;

  const lowerText = text.toLowerCase();
  const categoryName = category.displayName.toLowerCase();

  // Check if the main category name is in the text
  if (lowerText.includes(categoryName)) {
    return true;
  }

  // Check if any related terms are in the text
  if (category.relatedTerms && category.relatedTerms.length > 0) {
    return category.relatedTerms.some(term => lowerText.includes(term.toLowerCase()));
  }

  return false;
}

// Helper function to check if an array of texts matches a safety category
function matchesSafetyCategoryInArray(textArray: string[] | undefined, category: SafetyCategory): boolean {
  if (!textArray || textArray.length === 0) return false;
  return textArray.some(text => matchesSafetyCategory(text, category));
}

export default function Builder() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isHerbBanned } = useHerbBannedStatus();
  const { hasFeature } = usePlanFeatures();
  const { globalSettings } = useGlobalSettings();
  const { openGlobalSettings } = useOutletContext<{ openGlobalSettings: (tab?: 'herbs' | 'formulas' | 'prescriptions' | 'builder') => void }>();
  const { isHerbFavorite, isFormulaFavorite } = useFavorites();

  const [activeTab, setActiveTab] = useState<'all' | 'herbs' | 'formulas'>('formulas');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPreviewActions, setExpandedPreviewActions] = useState<number[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  // Get display settings from globalSettings
  const herbDisplayOptions = {
    pinyin: globalSettings.builder.herbsList.pinyin,
    latin: globalSettings.builder.herbsList.latin,
    hanzi: globalSettings.builder.herbsList.hanzi,
    showNatureIndicator: globalSettings.builder.herbsList.natureIndicator,
    order: globalSettings.builder.herbsList.order,
  };
  
  const formulaDisplayOptions = {
    pinyin: globalSettings.builder.formulasList.pinyin,
    pharmaceutical: globalSettings.builder.formulasList.pharmaceutical,
    hanzi: globalSettings.builder.formulasList.hanzi,
    showThermalActionIndicator: globalSettings.builder.formulasList.thermalActionIndicator,
    order: globalSettings.builder.formulasList.order,
  };
  
  const builderDisplayOptions = globalSettings.builder.prescriptionBuilder;
  
  // Local state for safety alert mode (Filtered/All toggle)
  const [alertMode, setAlertMode] = useState<'filtered' | 'all'>('filtered');

  // Modal navigation for preview modal
  const modalNav = useModalNavigation();
  
  // Clinical Applications modal states
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [showPatternModal, setShowPatternModal] = useState(false);

  // New modal states for mobile
  const [showGeneralConditionsModal, setShowGeneralConditionsModal] = useState(false);
  const [showMedicationsModal, setShowMedicationsModal] = useState(false);
  const [showAllergiesModal, setShowAllergiesModal] = useState(false);
  const [showTcmRiskPatternsModal, setShowTcmRiskPatternsModal] = useState(false);
  
  // Herb filters (multi-select)
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [subcategoryFilters, setSubcategoryFilters] = useState<string[]>([]);
  const [natureFilters, setNatureFilters] = useState<string[]>([]);
  const [flavorFilters, setFlavorFilters] = useState<string[]>([]);
  const [channelFilters, setChannelFilters] = useState<string[]>([]);
  
  // Formula filters (multi-select)
  const [formulaCategoryFilters, setFormulaCategoryFilters] = useState<string[]>([]);
  const [formulaSubcategoryFilters, setFormulaSubcategoryFilters] = useState<string[]>([]);
  
  // Advanced filters
  const [pharmacologicalFilters, setPharmacologicalFilters] = useState<string[]>([]);
  const [biologicalMechanisms, setBiologicalMechanisms] = useState<Record<string, string[]>>({});
  const [bioactiveCompounds, setBioactiveCompounds] = useState<Record<string, string[]>>({});
  const [showPharmacologicalModal, setShowPharmacologicalModal] = useState(false);
  const [showBiologicalModal, setShowBiologicalModal] = useState(false);
  const [showBioactiveCompoundsModal, setShowBioactiveCompoundsModal] = useState(false);
  const [pharmacologicalSearch, setPharmacologicalSearch] = useState('');
  const [biologicalSearch, setBiologicalSearch] = useState('');
  const [bioactiveCompoundsSearch, setBioactiveCompoundsSearch] = useState('');
  const [expandedSystems, setExpandedSystems] = useState<string[]>([]);
  const [expandedChemicalClasses, setExpandedChemicalClasses] = useState<string[]>([]);

  // View modes for modals
  const [biologicalViewMode, setBiologicalViewMode] = useState<'categories' | 'all'>('categories');
  const [bioactiveCompoundsViewMode, setBioactiveCompoundsViewMode] = useState<'categories' | 'all'>('categories');
  
  // Clinical Use and Safety Profile modals
  const [showClinicalModal, setShowClinicalModal] = useState(false);
  const [showBiomedicalModal, setShowBiomedicalModal] = useState(false);
  const [showToxicologicalModal, setShowToxicologicalModal] = useState(false);
  const [showHerbDrugModal, setShowHerbDrugModal] = useState(false);
  const [showPregnancyModal, setShowPregnancyModal] = useState(false);
  
  // Discard confirmation modal
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  
  // Mobile filters modal
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [mobileExpandedFilters, setMobileExpandedFilters] = useState({
    herbFilters: false,
    herbCategories: false,
    herbNature: false,
    herbFlavor: false,
    herbChannels: false,
    formulaFilters: false,
    formulaCategories: false,
    formulaSubcategories: false,
    advanced: false,
    clinicalUse: false,
    safetyProfile: false
  });
  
  // Clinical Use Filters (Find beneficial herbs)
  const [clinicalUseFilters, setClinicalUseFilters] = useState<ClinicalUseFilters>({
    clinicalApplications: [],
    condition: null,
    patterns: [],
  });

  // Patient Safety Profile (Safety alerts)
  const [patientSafetyProfile, setPatientSafetyProfile] = useState<PatientSafetyProfile>({
    pregnancy: false,
    breastfeeding: false,
    insomnia: false,
    epilepsy: false,
    bleeding_disorders: false,
    liver_disease: false,
    kidney_disease: false,
    anticoagulants: false,
    antihypertensives: false,
    hypoglycemics: false,
    immunosuppressants: false,
    chemotherapy: false,
    antidepressants: false,
    antiplatelets: false,
    beta_blockers: false,
    diuretics: false,
    corticosteroids: false,
    sedatives: false,
    shellfish: false,
    gluten: false,
    nuts: false,
    dairy: false,
    soy: false,
    asteraceae: false,
    apiaceae: false,
    qi_deficiency: false,
    blood_deficiency: false,
    blood_stasis: false,
    yin_deficiency: false,
    yin_deficiency_heat: false,
    yang_deficiency: false,
    dampness: false,
    heat: false,
    liver_yang_rising: false,
    phlegm_damp: false,
    damp_heat: false,
    internal_wind: false
  });
  
  // Collapsible category state - Load from localStorage or use defaults
  const [expandedCategories, setExpandedCategories] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          // Main sections
          herb_filters_section: false,
          formula_filters_section: false,
          clinical_filters_section: false,
          safety_profile_section: false,
          advanced_filters_section: false,
          // Herb subsections
          herb_category: false,
          herb_nature: false,
          herb_flavor: false,
          herb_channels: false,
          // Formula subsections
          formula_category: false,
          formula_subcategory: false,
          // Clinical use subsections
          clinical_tcm_patterns: false,
          // Patient safety subsections
          safety_general: false,
          safety_medication: false,
          safety_allergies: false,
          safety_tcm_risks: false
        };
      }
    }
    return {
      // Main sections
      herb_filters_section: false,
      formula_filters_section: false,
      clinical_filters_section: false,
      safety_profile_section: false,
      advanced_filters_section: false,
      // Herb subsections
      herb_category: false,
      herb_nature: false,
      herb_flavor: false,
      herb_channels: false,
      // Formula subsections
      formula_category: false,
      formula_subcategory: false,
      // Clinical use subsections
      clinical_tcm_patterns: false,
      // Patient safety subsections
      safety_general: false,
      safety_medication: false,
      safety_allergies: false,
      safety_tcm_risks: false
    };
  });

  // Save expanded categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedCategories));
  }, [expandedCategories]);

  // Reset expanded systems when modal closes
  useEffect(() => {
    if (!showBiologicalModal) {
      setExpandedSystems([]);
    }
  }, [showBiologicalModal]);
  
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponent[]>(() => {
    // Load draft from localStorage if exists
    const saved = localStorage.getItem(BUILDER_STATE_KEY);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        return draft.selectedComponents || [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [formulaName, setFormulaName] = useState(() => {
    const saved = localStorage.getItem(BUILDER_STATE_KEY);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        return draft.formulaName || '';
      } catch {
        return '';
      }
    }
    return '';
  });
  const [comments, setComments] = useState(() => {
    const saved = localStorage.getItem(BUILDER_STATE_KEY);
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        return draft.comments || '';
      } catch {
        return '';
      }
    }
    // Use default commentary from settings if starting a new prescription
    return globalSettings.prescriptions.defaultCommentary || '';
  });
  const [showCompoundModal, setShowCompoundModal] = useState(false);
  const [showComponentsModal, setShowComponentsModal] = useState(false);
  const [pendingFormula, setPendingFormula] = useState<string | null>(null);
  const [formulaDosage, setFormulaDosage] = useState('100');
  
  // Track highlighted component for visual feedback
  const [highlightedComponent, setHighlightedComponent] = useState<string | null>(null);
  
  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Register unsaved changes for global checking (logout, etc.)
  useUnsavedChanges(hasUnsavedChanges && !searchParams.get('prescription'));

  // Save draft to localStorage whenever builder state changes (only for new prescriptions or new versions)
  useEffect(() => {
    const prescriptionId = searchParams.get('prescription');
    const isNewVersion = searchParams.get('newVersion') === 'true';
    const isEditingExisting = prescriptionId && !isNewVersion;
    
    if (!isEditingExisting) {
      const draft = {
        selectedComponents,
        formulaName,
        comments
      };
      localStorage.setItem(BUILDER_STATE_KEY, JSON.stringify(draft));
    }
  }, [selectedComponents, formulaName, comments, searchParams]);

  // Update comments when default commentary changes in settings (only for new prescriptions with no content)
  useEffect(() => {
    const prescriptionId = searchParams.get('prescription');
    const isEditingExisting = prescriptionId && searchParams.get('newVersion') !== 'true';

    // Only update if we're creating a new prescription and comments field is empty
    if (!isEditingExisting && !comments.trim() && selectedComponents.length === 0) {
      setComments(globalSettings.prescriptions.defaultCommentary || '');
    }
  }, [globalSettings.prescriptions.defaultCommentary]);

  // Load prescription if editing or creating new version
  useEffect(() => {
    const prescriptionId = searchParams.get('prescription');
    const isNewVersion = searchParams.get('newVersion') === 'true';
    
    if (prescriptionId) {
      // Check if there are unsaved changes in a new prescription
      if (hasUnsavedChanges && selectedComponents && selectedComponents.length > 0) {
        const action = isNewVersion ? 'create a new version of' : 'edit';
        const confirmSwitch = window.confirm(
          `You have unsaved changes in your current prescription. Do you want to discard them and ${action} this prescription?`
        );
        if (!confirmSwitch) {
          // User cancelled, navigate back to builder without prescription param
          navigate('/builder', { replace: true });
          return;
        }
        // User confirmed, clear the draft
        localStorage.removeItem(BUILDER_STATE_KEY);
      }

      const prescription = getPrescriptionsSync().find(p => p.id === prescriptionId);
      if (prescription) {
        setFormulaName(prescription.name);
        setComments(prescription.comments);
        setSelectedComponents(prescription.components.map(c => ({
          ...c,
          tempId: Math.random().toString()
        })));
        // Note: alertMode is now read from globalSettings.prescriptions.display.safetyFilters
        // Load the patient safety profile if they were saved (for filtered mode)
        if (prescription.patientSafetyProfile) {
          setPatientSafetyProfile(prescription.patientSafetyProfile as any);
        } else if (prescription.safetyFilters) {
          // Backwards compatibility - load old safetyFilters
          setPatientSafetyProfile(prescription.safetyFilters as any);
        }
        setHasUnsavedChanges(false); // No unsaved changes when loading
        localStorage.removeItem(BUILDER_STATE_KEY); // Clear draft when loading existing prescription
      }
    } else {
      // If no prescription param and we just cleared it, reset the unsaved state
      if (!selectedComponents || selectedComponents.length === 0) {
        setHasUnsavedChanges(false);
      }
    }
  }, [searchParams]); // Only depend on searchParams to avoid reloading when adding components

  // Track changes to components, name, or comments (only for NEW prescriptions or new versions)
  useEffect(() => {
    const prescriptionId = searchParams.get('prescription');
    const isNewVersion = searchParams.get('newVersion') === 'true';
    const isEditingExisting = prescriptionId && !isNewVersion;
    
    if (!isSaving && selectedComponents && selectedComponents.length > 0 && !isEditingExisting) {
      setHasUnsavedChanges(true);
    }
  }, [selectedComponents, formulaName, comments, isSaving, searchParams]);

  // Prevent closing window/tab with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = ''; // Chrome requires returnValue to be set
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const clearClinicalFilters = () => {
    setClinicalUseFilters({
      clinicalApplications: [],
      condition: null,
      patterns: [],
    });
  };

  const clearPatientSafetyFilters = () => {
    setPatientSafetyProfile({
      pregnancy: false,
      breastfeeding: false,
      insomnia: false,
      epilepsy: false,
      bleeding_disorders: false,
      liver_disease: false,
      kidney_disease: false,
      anticoagulants: false,
      antihypertensives: false,
      hypoglycemics: false,
      immunosuppressants: false,
      antidepressants: false,
      antiplatelets: false,
      beta_blockers: false,
      diuretics: false,
      corticosteroids: false,
      sedatives: false,
      shellfish: false,
      gluten: false,
      nuts: false,
      dairy: false,
      soy: false,
      asteraceae: false,
      apiaceae: false,
      qi_deficiency: false,
      blood_deficiency: false,
      blood_stasis: false,
      yin_deficiency: false,
      yin_deficiency_heat: false,
      yang_deficiency: false,
      dampness: false,
      heat: false,
      liver_yang_rising: false,
      phlegm_damp: false,
      damp_heat: false,
      internal_wind: false
    });
  };

  const clearAllMobileFilters = () => {
    // Clear herb filters
    setCategoryFilters([]);
    setSubcategoryFilters([]);
    setNatureFilters([]);
    setFlavorFilters([]);
    setChannelFilters([]);
    // Clear formula filters
    setFormulaCategoryFilters([]);
    setFormulaSubcategoryFilters([]);
    // Clear clinical use filters
    clearClinicalFilters();
    // Clear patient safety filters
    clearPatientSafetyFilters();
    // Clear advanced filters
    setPharmacologicalFilters([]);
    setBiologicalMechanisms({});
  };

  const toggleCategoryFilter = (category: string) => {
    setCategoryFilters(prev => {
      const isRemoving = prev.includes(category);

      if (isRemoving) {
        // When removing a category, also remove all its subcategories
        const subcategoriesToRemove = getSubcategoriesForCategory(category);
        setSubcategoryFilters(prevSub =>
          prevSub.filter(sub => !subcategoriesToRemove.includes(sub))
        );
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const toggleSubcategoryFilter = (subcategory: string) => {
    setSubcategoryFilters(prev =>
      prev.includes(subcategory) ? prev.filter(s => s !== subcategory) : [...prev, subcategory]
    );
  };

  const toggleNatureFilter = (nature: string) => {
    setNatureFilters(prev => 
      prev.includes(nature) ? prev.filter(n => n !== nature) : [...prev, nature]
    );
  };

  const toggleFlavorFilter = (flavor: string) => {
    setFlavorFilters(prev => 
      prev.includes(flavor) ? prev.filter(f => f !== flavor) : [...prev, flavor]
    );
  };

  const toggleChannelFilter = (channel: string) => {
    setChannelFilters(prev => 
      prev.includes(channel) ? prev.filter(c => c !== channel) : [...prev, channel]
    );
  };

  const toggleFormulaCategoryFilter = (category: string) => {
    setFormulaCategoryFilters(prev => {
      const isRemoving = prev.includes(category);

      if (isRemoving) {
        // When removing a category, also remove all its subcategories
        const subcategoriesToRemove = getSubcategoriesForFormulaCategory(category);
        setFormulaSubcategoryFilters(prevSub =>
          prevSub.filter(sub => !subcategoriesToRemove.includes(sub))
        );
        return prev.filter(c => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  const toggleFormulaSubcategoryFilter = (subcategory: string) => {
    setFormulaSubcategoryFilters(prev => 
      prev.includes(subcategory) ? prev.filter(s => s !== subcategory) : [...prev, subcategory]
    );
  };

  const hasActiveClinicalFilters =
    (clinicalUseFilters?.clinicalApplications && clinicalUseFilters.clinicalApplications.length > 0) ||
    !!clinicalUseFilters?.condition ||
    (clinicalUseFilters?.patterns?.length || 0) > 0;
  const hasActivePatientSafetyFilters = Object.values(patientSafetyProfile || {}).some(v => v);
  const hasActiveHerbFilters = categoryFilters?.length > 0 || subcategoryFilters?.length > 0 || natureFilters?.length > 0 || flavorFilters?.length > 0 || channelFilters?.length > 0;
  const hasActiveFormulaFilters = formulaCategoryFilters?.length > 0 || formulaSubcategoryFilters?.length > 0;
  const biologicalMechanismsCount = Object.values(biologicalMechanisms || {}).reduce((acc, targets) => acc + (targets?.length || 0), 0);
  const bioactiveCompoundsCount = Object.values(bioactiveCompounds || {}).reduce((acc, compounds) => acc + (compounds?.length || 0), 0);

  // Clinical Use counts
  const clinicalApplicationsCount = (clinicalUseFilters?.western_medical_dx?.length || 0) +
    Object.entries(clinicalUseFilters || {}).filter(([key, value]) => key !== 'western_medical_dx' && value === true).length;
  const biomedicalApplicationsCount = 0; // Placeholder - to be implemented if needed
  
  // Safety Profile counts
  const toxicologicalCount = 0; // Placeholder - to be implemented if needed
  const herbDrugInteractionsCount = 0; // Placeholder - to be implemented if needed
  const pregnancyLactationCount = (patientSafetyProfile?.pregnancy ? 1 : 0) + (patientSafetyProfile?.breastfeeding ? 1 : 0);
  
  // Helper functions to count active filters in each category
  const getGeneralConditionsCount = () => {
    const generalConditionsFields = ['pregnancy', 'breastfeeding', 'insomnia', 'epilepsy', 
      'bleeding_disorders', 'liver_disease', 'kidney_disease'];
    return generalConditionsFields.filter(field => patientSafetyProfile?.[field as keyof typeof patientSafetyProfile]).length;
  };
  
  const getMedicationsCount = () => {
    const medicationsFields = ['anticoagulants', 'antihypertensives', 'hypoglycemics', 
      'immunosuppressants', 'antidepressants', 'antiplatelets', 'beta_blockers', 
      'diuretics', 'corticosteroids', 'sedatives'];
    return medicationsFields.filter(field => patientSafetyProfile?.[field as keyof typeof patientSafetyProfile]).length;
  };
  
  const getAllergiesCount = () => {
    const allergiesFields = ['shellfish', 'gluten', 'nuts', 'dairy', 'soy', 'asteraceae', 'apiaceae'];
    return allergiesFields.filter(field => patientSafetyProfile?.[field as keyof typeof patientSafetyProfile]).length;
  };
  
  const getTcmRiskPatternsCount = () => {
    const tcmRiskFields = ['qi_deficiency', 'blood_deficiency', 'blood_stasis', 'yin_deficiency', 
      'yin_deficiency_heat', 'yang_deficiency', 'dampness', 'heat', 'liver_yang_rising', 
      'phlegm_damp', 'damp_heat', 'internal_wind'];
    return tcmRiskFields.filter(field => patientSafetyProfile?.[field as keyof typeof patientSafetyProfile]).length;
  };
  
  const pharmacologicalFiltersCount = pharmacologicalFilters.length;
  const hasActiveAdvancedFilters = pharmacologicalFiltersCount > 0 || biologicalMechanismsCount > 0 || bioactiveCompoundsCount > 0;
  const hasAnyActiveFilter = hasActiveHerbFilters || hasActiveFormulaFilters || hasActiveClinicalFilters || hasActivePatientSafetyFilters || hasActiveAdvancedFilters;

  // Get unique values for herb filters
  const allHerbs = getAllHerbs();
  const uniqueCategories = Array.from(new Set(allHerbs.map(h => h.category).filter(Boolean))).sort();
  const uniqueNatures = Array.from(new Set(allHerbs.map(h => h.nature).filter(Boolean))).sort();
  const uniqueFlavors = Array.from(new Set(allHerbs.flatMap(h => h.flavor || []).filter(Boolean))).sort();
  const uniqueChannels = Array.from(new Set(allHerbs.flatMap(h => h.channels || []).filter(Boolean))).sort();

  // Get subcategories for a specific herb category
  const getSubcategoriesForCategory = (category: string): string[] => {
    const subcats = Array.from(
      new Set(
        allHerbs
          .filter(h => h.category === category && h.subcategory)
          .map(h => h.subcategory)
      )
    ).sort();
    return subcats;
  };

  // Get unique values for formula filters
  const allFormulas = getAllFormulas();
  const uniqueFormulaCategories = Array.from(new Set(allFormulas.map(f => f.category).filter(Boolean))).sort();
  const uniqueFormulaSubcategories = Array.from(new Set(allFormulas.map(f => f.subcategory).filter(Boolean))).sort();

  // Get available subcategories based on selected formula categories
  const getAvailableFormulaSubcategories = () => {
    if (!formulaCategoryFilters || (formulaCategoryFilters?.length || 0) === 0) return [];

    const subcategories = new Set<string>();
    allFormulas.forEach(formula => {
      if (formulaCategoryFilters?.includes(formula.category || '') && formula.subcategory) {
        subcategories.add(formula.subcategory);
      }
    });

    return Array.from(subcategories).sort();
  };

  // Get subcategories for a specific formula category
  const getSubcategoriesForFormulaCategory = (category: string): string[] => {
    const subcats = Array.from(
      new Set(
        allFormulas
          .filter(f => f.category === category && f.subcategory)
          .map(f => f.subcategory)
      )
    ).sort();
    return subcats;
  };

  // Extract all pharmacological effects from herbs
  const allPharmacologicalEffects = new Set<string>();
  getAllHerbs().forEach(herb => {
    const pharmEffects = herb.pharmacological_effects || [];
    // pharmacological_effects is now a simple string array
    pharmEffects.forEach(effect => {
      if (effect && typeof effect === 'string' && effect.trim()) {
        allPharmacologicalEffects.add(effect);
      }
    });
  });

  // Convert to sorted array for rendering
  const pharmacologicalEffectsData = Array.from(allPharmacologicalEffects).sort();

  // Filtered pharmacological effects based on search
  const searchLowerPharm = normalizeForSearch(pharmacologicalSearch);
  const filteredPharmacologicalEffects = pharmacologicalEffectsData.filter(effect =>
    normalizeForSearch(effect).includes(searchLowerPharm)
  );

  const filteredHerbs = getAllHerbs().filter(herb => {
    // If favorites filter is active, only show favorites
    if (showFavoritesOnly && !isHerbFavorite(herb.herb_id)) {
      return false;
    }

    const query = normalizeForSearch(searchQuery);
    const matchesSearch = !query ||
      normalizeForSearch(herb.pinyin_name).includes(query) ||
      normalizeForSearch(herb.pharmaceutical_name).includes(query) ||
      normalizeForSearch(herb.english_name).includes(query);

    const matchesCategory = !categoryFilters || (categoryFilters?.length || 0) === 0 || categoryFilters?.includes(herb.category);
    const matchesSubcategory = !subcategoryFilters || (subcategoryFilters?.length || 0) === 0 || subcategoryFilters?.includes(herb.subcategory || '');
    const matchesNature = !natureFilters || (natureFilters?.length || 0) === 0 || natureFilters?.includes(herb.nature);
    const matchesFlavor = !flavorFilters || (flavorFilters?.length || 0) === 0 || herb.flavor?.some(f => flavorFilters?.includes(f));
    const matchesChannel = !channelFilters || (channelFilters?.length || 0) === 0 || herb.channels?.some(c => channelFilters?.includes(c));
    
    // Clinical Applications filtering - check herb's clinical_applications field
    let matchesClinicalApplications = true;
    if (clinicalUseFilters?.clinicalApplications && clinicalUseFilters.clinicalApplications.length > 0) {
      // New multi-selection logic: check if herb matches ANY of the selected conditions/patterns
      matchesClinicalApplications = clinicalUseFilters.clinicalApplications.some(selection => {
        if (selection.patterns && selection.patterns.length > 0) {
          // Filter by specific patterns of this condition
          return herb.clinical_applications?.some(app =>
            app.condition === selection.condition &&
            app.pattern && selection.patterns.includes(app.pattern)
          );
        } else {
          // No patterns selected - match condition only (any pattern or no pattern)
          return herb.clinical_applications?.some(app =>
            app.condition === selection.condition
          );
        }
      });
    } else if (clinicalUseFilters?.condition) {
      // Legacy support: old single-condition logic
      if (clinicalUseFilters.patterns && clinicalUseFilters.patterns.length > 0) {
        matchesClinicalApplications = herb.clinical_applications?.some(app =>
          app.condition === clinicalUseFilters.condition &&
          app.pattern && clinicalUseFilters.patterns.includes(app.pattern)
        ) || false;
      } else {
        matchesClinicalApplications = herb.clinical_applications?.some(app =>
          app.condition === clinicalUseFilters.condition
        ) || false;
      }
    }
    
    // Advanced filters
    const matchesPharmacological = !pharmacologicalFilters || pharmacologicalFilters.length === 0 ||
      pharmacologicalFilters.some(selectedEffect => {
        const pharmEffects = herb.pharmacological_effects || [];
        return pharmEffects.includes(selectedEffect);
      });
    
    const matchesBiologicalMechanisms = !biologicalMechanisms || Object.keys(biologicalMechanisms || {}).length === 0 ||
      Object.entries(biologicalMechanisms || {}).some(([system, targetActions]) =>
        herb.biological_mechanisms?.some(bm =>
          bm.system === system && targetActions?.includes(bm.target_action)
        )
      );

    const matchesBioactiveCompounds = !bioactiveCompounds || Object.keys(bioactiveCompounds || {}).length === 0 ||
      Object.entries(bioactiveCompounds || {}).some(([chemicalClass, compounds]) => {
        if (!herb.bioactive_compounds || herb.bioactive_compounds.length === 0) return false;

        // Check if it's simple array or grouped array
        const firstItem = herb.bioactive_compounds[0];

        if (typeof firstItem === 'string') {
          // Simple array - check against "Uncategorized"
          return chemicalClass === 'Uncategorized' &&
            (herb.bioactive_compounds as string[]).some(c => compounds.includes(c));
        } else if (typeof firstItem === 'object' && 'chemical_class' in firstItem) {
          // Grouped array - check by chemical_class
          return (herb.bioactive_compounds as Array<{ chemical_class: string; compounds: string[] }>)
            .some(group =>
              group.chemical_class === chemicalClass &&
              group.compounds.some(c => compounds.includes(c))
            );
        }
        return false;
      });

    return matchesSearch && matchesCategory && matchesSubcategory && matchesNature && matchesFlavor && matchesChannel &&
      matchesClinicalApplications && matchesPharmacological && matchesBiologicalMechanisms && matchesBioactiveCompounds;
  });

  const filteredFormulas = getAllFormulas().filter(formula => {
    // If favorites filter is active, only show favorites
    if (showFavoritesOnly && !isFormulaFavorite(formula.formula_id)) {
      return false;
    }

    const query = normalizeForSearch(searchQuery);
    const matchesSearch = !query ||
      normalizeForSearch(formula.pinyin_name).includes(query) ||
      normalizeForSearch(formula.hanzi_name).includes(query) ||
      normalizeForSearch(formula.translated_name).includes(query);

    const matchesCategory = !formulaCategoryFilters || (formulaCategoryFilters?.length || 0) === 0 || formulaCategoryFilters?.includes(formula.category || '');
    const matchesSubcategory = !formulaSubcategoryFilters || (formulaSubcategoryFilters?.length || 0) === 0 || formulaSubcategoryFilters?.includes(formula.subcategory || '');
    
    // Clinical Applications filtering - check formula's clinical_applications field
    let matchesClinicalApplications = true;
    if (clinicalUseFilters?.clinicalApplications && clinicalUseFilters.clinicalApplications.length > 0) {
      // New multi-selection logic: check if formula matches ANY of the selected conditions/patterns
      matchesClinicalApplications = clinicalUseFilters.clinicalApplications.some(selection => {
        if (selection.patterns && selection.patterns.length > 0) {
          // Filter by specific patterns of this condition
          return formula.clinical_applications?.some(app =>
            app.condition === selection.condition &&
            app.pattern && selection.patterns.includes(app.pattern)
          );
        } else {
          // No patterns selected - match condition only (any pattern or no pattern)
          return formula.clinical_applications?.some(app =>
            app.condition === selection.condition
          );
        }
      });
    } else if (clinicalUseFilters?.condition) {
      // Legacy support: old single-condition logic
      if (clinicalUseFilters.patterns && clinicalUseFilters.patterns.length > 0) {
        matchesClinicalApplications = formula.clinical_applications?.some(app =>
          app.condition === clinicalUseFilters.condition &&
          app.pattern && clinicalUseFilters.patterns.includes(app.pattern)
        ) || false;
      } else {
        matchesClinicalApplications = formula.clinical_applications?.some(app =>
          app.condition === clinicalUseFilters.condition
        ) || false;
      }
    }
    
    return matchesSearch && matchesCategory && matchesSubcategory && matchesClinicalApplications;
  });

  // Combined items for 'all' view - Smart filtering based on active filters
  const combinedItems = (activeTab === 'all')
    ? (() => {
        // Check which type-specific filters are active
        const hasHerbFilters = categoryFilters.length > 0 || subcategoryFilters.length > 0 ||
                               natureFilters.length > 0 || flavorFilters.length > 0 || channelFilters.length > 0;
        const hasFormulaFilters = formulaCategoryFilters.length > 0 || formulaSubcategoryFilters.length > 0;

        // Smart filtering logic:
        // - If only herb-specific filters are active, show only herbs
        // - If only formula-specific filters are active, show only formulas
        // - If both types of filters are active OR no type-specific filters, show both
        let items: Array<{ type: 'herb' | 'formula'; data: any; id: string }> = [];

        if (hasHerbFilters && !hasFormulaFilters) {
          // Only herb filters active - show only herbs
          items = filteredHerbs.map(herb => ({ type: 'herb' as const, data: herb, id: `herb-${herb.herb_id}` }));
        } else if (hasFormulaFilters && !hasHerbFilters) {
          // Only formula filters active - show only formulas
          items = filteredFormulas.map(formula => ({ type: 'formula' as const, data: formula, id: `formula-${formula.formula_id}` }));
        } else {
          // Both types or no type-specific filters - show both
          items = [
            ...filteredHerbs.map(herb => ({ type: 'herb' as const, data: herb, id: `herb-${herb.herb_id}` })),
            ...filteredFormulas.map(formula => ({ type: 'formula' as const, data: formula, id: `formula-${formula.formula_id}` }))
          ];
        }

        return items.sort((a, b) => {
          const aName = a.type === 'herb' ? a.data.pinyin_name : a.data.pinyin_name;
          const bName = b.type === 'herb' ? b.data.pinyin_name : b.data.pinyin_name;
          return aName.localeCompare(bName);
        });
      })()
    : [];

  const togglePharmacologicalFilter = (effect: string) => {
    setPharmacologicalFilters(prev => {
      if (prev.includes(effect)) {
        // Remove effect
        return prev.filter(e => e !== effect);
      } else {
        // Add effect
        return [...prev, effect];
      }
    });
  };

  const toggleBiologicalMechanism = (system: string, targetAction: string) => {
    setBiologicalMechanisms(prev => {
      const systemTargetActions = prev[system] || [];
      
      if (systemTargetActions.includes(targetAction)) {
        // Remove target_action
        const newTargetActions = systemTargetActions.filter(ta => ta !== targetAction);
        if (newTargetActions.length === 0) {
          const { [system]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [system]: newTargetActions };
      } else {
        // Add target_action
        return { ...prev, [system]: [...systemTargetActions, targetAction] };
      }
    });
  };

  const toggleAllSystemTargets = (system: string, allTargetActions: string[]) => {
    setBiologicalMechanisms(prev => {
      const systemSelections = prev[system] || [];
      
      // Check if all target_actions are already selected
      const allSelected = allTargetActions.every(ta => systemSelections.includes(ta));

      if (allSelected) {
        // Deselect all - remove this system
        const { [system]: _, ...rest } = prev;
        return rest;
      } else {
        // Select all target_actions
        return { ...prev, [system]: allTargetActions };
      }
    });
  };

  const clearHerbFilters = () => {
    setCategoryFilters([]);
    setNatureFilters([]);
    setFlavorFilters([]);
    setChannelFilters([]);
  };

  const clearFormulaFilters = () => {
    setFormulaCategoryFilters([]);
    setFormulaSubcategoryFilters([]);
  };

  const clearAdvancedFilters = () => {
    setPharmacologicalFilters([]);
    setBiologicalMechanisms({});
  };

  const clearAllBuilderFilters = () => {
    // Clear herb filters
    clearHerbFilters();
    // Clear formula filters
    clearFormulaFilters();
    // Clear clinical use filters
    clearClinicalFilters();
    // Clear patient safety filters
    clearPatientSafetyFilters();
    // Clear advanced filters
    clearAdvancedFilters();
  };

  // Helper function to get nature border color
  const getNatureBorderColor = (nature?: string) => {
    if (!nature) return '';
    
    const normalized = nature.toLowerCase();
    
    if (normalized.includes('very hot') || normalized === 'muy caliente') return 'border-l-red-400';
    if (normalized === 'hot' || normalized === 'caliente') return 'border-l-red-300';
    if (normalized === 'warm' || normalized === 'templado') return 'border-l-orange-300';
    if (normalized === 'neutral' || normalized === 'neutro') return 'border-l-gray-300';
    if (normalized === 'cool' || normalized === 'fresca') return 'border-l-blue-300';
    if (normalized === 'cold' || normalized === 'fria') return 'border-l-blue-400';
    if (normalized.includes('very cold') || normalized === 'muy fria') return 'border-l-blue-500';
    
    return '';
  };

  // Helper function to get thermal action border color for formulas
  const getThermalActionBorderColor = (thermalAction?: string) => {
    if (!thermalAction) return '';
    
    const normalized = thermalAction.toLowerCase();
    
    if (normalized.includes('very hot')) return 'border-l-red-700';
    if (normalized === 'hot') return 'border-l-red-500';
    if (normalized === 'warm') return 'border-l-orange-500';
    if (normalized === 'slightly warm') return 'border-l-orange-300';
    if (normalized === 'neutral') return 'border-l-gray-400';
    if (normalized === 'slightly cool') return 'border-l-blue-300';
    if (normalized === 'cool') return 'border-l-blue-400';
    if (normalized.includes('very cold')) return 'border-l-blue-800';
    if (normalized.includes('slightly cold')) return 'border-l-blue-500';
    if (normalized === 'cold') return 'border-l-blue-600';
    
    return '';
  };

  const getHerbWarnings = (herbName: string) => {
    const herb = getAllHerbs().find(h => h.pinyin_name === herbName);
    if (!herb) return [];
    
    const warnings = [];
    // NOTE: Antagonisms and incompatibilities are NOT shown in the library sidebar
    // They are ONLY shown in the Prescription Builder via getHerbConflicts()
    // This keeps the library clean and focuses alerts on the active prescription
    
    // Removed pregnancy warning badge - now showing as icon in Prescription Builder instead
    // if (patientSafetyProfile.pregnancy && (herb.cautions.some(c => c.toLowerCase().includes('pregnancy')) || herb.contraindications.some(c => c.toLowerCase().includes('pregnancy')))) {
    //   warnings.push('pregnancy');
    // }
    if (patientSafetyProfile.antihypertensives && herb.contraindications?.some(c => c.toLowerCase().includes('hypertension'))) {
      warnings.push('hypertension');
    }
    if (patientSafetyProfile.hypoglycemics && herb.contraindications?.some(c => c.toLowerCase().includes('insomnia'))) {
      warnings.push('insomnia');
    }
    if (patientSafetyProfile.antidepressants && (herb.contraindications?.some(c => c.toLowerCase().includes('epilepsy')) || herb.contraindications?.some(c => c.toLowerCase().includes('seizure')) || herb.contraindications?.some(c => c.toLowerCase().includes('convulsion')))) {
      warnings.push('epilepsy');
    }
    return warnings;
  };

  // Helper to check if herb has pregnancy warning (for icon display in Prescription Builder)
  const hasPregnancyWarning = (herbName: string) => {
    if (!patientSafetyProfile.pregnancy) return false;
    const herb = getAllHerbs().find(h => h.pinyin_name === herbName);
    if (!herb) return false;
    
    return herb.cautions?.some(c => c.toLowerCase().includes('pregnancy')) || 
           herb.contraindications?.some(c => c.toLowerCase().includes('pregnancy'));
  };

  // Helper to check if formula has any herb with pregnancy warning
  const formulaHasPregnancyWarning = (formulaName: string) => {
    if (!patientSafetyProfile.pregnancy) return false;
    const formula = getAllFormulas().find(f => f.pinyin_name === formulaName);
    if (!formula || !formula.components) return false;
    
    return formula.components?.some(comp => hasPregnancyWarning(comp.herb_name));
  };

  const addHerb = (herbName: string) => {
    // Check if herb already exists
    const existingHerb = selectedComponents.find(
      comp => comp.type === 'herb' && comp.name === herbName
    );
    
    if (existingHerb) {
      // Scroll to existing component and highlight it
      const element = document.getElementById(`component-${existingHerb.tempId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedComponent(existingHerb.tempId);
        setTimeout(() => setHighlightedComponent(null), 2000);
      }
      toast.info(`${herbName} is already in the prescription`);
      return;
    }
    
    const newComponent: SelectedComponent = {
      type: 'herb',
      name: herbName,
      dosage: '10g',
      tempId: Math.random().toString()
    };
    setSelectedComponents([...selectedComponents, newComponent]);
    toast.success(`Added ${herbName}`);
  };

  const openFormulaModal = (formulaName: string) => {
    // Check if formula already exists
    const existingFormula = selectedComponents.find(
      comp => comp.type === 'formula' && comp.name === formulaName
    );
    
    if (existingFormula) {
      // Scroll to existing component and highlight it
      const element = document.getElementById(`component-${existingFormula.tempId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedComponent(existingFormula.tempId);
        setTimeout(() => setHighlightedComponent(null), 2000);
      }
      toast.info(`${formulaName} is already in the prescription`);
      return;
    }
    
    setPendingFormula(formulaName);
    setFormulaDosage('100');
    setShowCompoundModal(true);
  };

  const openComponentsModal = (formulaName: string) => {
    setPendingFormula(formulaName);
    setFormulaDosage('100');
    setShowComponentsModal(true);
  };

  const confirmAddFormula = () => {
    if (!pendingFormula) return;
    
    const formula = getAllFormulas().find(f => f.pinyin_name === pendingFormula);
    if (!formula) {
      toast.error('Formula not found');
      return;
    }

    if (!formula.composition || formula.composition.length === 0) {
      toast.error('This formula has no composition data');
      return;
    }

    const totalDosage = parseInt(formulaDosage) || 30;
    
    // Calculate the original total dosage of the formula by summing all herb dosages
    let originalTotal = 0;
    const herbDosages: Record<string, number> = {};
    
    (formula.composition || []).forEach(comp => {
      const herbName = typeof comp === 'object' ? comp.herb_pinyin : comp.replace(/\s+\d+g?$/i, '').trim();
      const herbDosage = typeof comp === 'object' ? comp.dosage : '';
      
      if (herbDosage) {
        const dosageValue = parseFloat(herbDosage.replace(/[^0-9.]/g, ''));
        if (!isNaN(dosageValue) && dosageValue > 0) {
          herbDosages[herbName] = dosageValue;
          originalTotal += dosageValue;
        }
      }
    });
    
    // If no dosages found in composition, divide equally as fallback
    const useProportional = originalTotal > 0;
    const herbCount = formula.composition?.length || 0;
    const dosagePerHerb = Math.round((totalDosage / herbCount) * 10) / 10;

    const subComponents = (formula.composition || []).map(comp => {
      // Extract herb name from composition object or string
      const herbName = typeof comp === 'object' ? comp.herb_pinyin : comp.replace(/\s+\d+g?$/i, '').trim();
      
      // Calculate proportional dosage
      let dosageAmount: number;
      if (useProportional && herbDosages[herbName]) {
        // Calculate proportional dosage: (herb_dose / original_total) * total_dosage
        dosageAmount = (herbDosages[herbName] / originalTotal) * totalDosage;
      } else {
        // Fallback to equal distribution
        dosageAmount = dosagePerHerb;
      }
      
      return {
        name: herbName,
        dosage: `${Math.round(dosageAmount * 10) / 10}g`
      };
    });

    const newComponent: SelectedComponent = {
      type: 'formula',
      name: pendingFormula,
      dosage: `${totalDosage}g`,
      tempId: Math.random().toString(),
      subComponents
    };
    
    setSelectedComponents([...selectedComponents, newComponent]);
    toast.success(`Added ${pendingFormula} as compound`);
    setShowCompoundModal(false);
    setPendingFormula(null);
  };

  const confirmAddFormulaAsComponents = () => {
    if (!pendingFormula) return;
    
    const formula = getAllFormulas().find(f => f.pinyin_name === pendingFormula);
    if (!formula) {
      toast.error('Formula not found');
      return;
    }

    if (!formula.composition || formula.composition.length === 0) {
      toast.error('This formula has no composition data');
      return;
    }

    const totalDosage = parseInt(formulaDosage) || 30;
    
    // Calculate the original total dosage of the formula by summing all herb dosages
    let originalTotal = 0;
    const herbDosages: Record<string, number> = {};
    
    (formula.composition || []).forEach(comp => {
      const herbName = typeof comp === 'object' ? comp.herb_pinyin : comp.replace(/\s+\d+g?$/i, '').trim();
      const herbDosage = typeof comp === 'object' ? comp.dosage : '';
      
      if (herbDosage) {
        const dosageValue = parseFloat(herbDosage.replace(/[^0-9.]/g, ''));
        if (!isNaN(dosageValue) && dosageValue > 0) {
          herbDosages[herbName] = dosageValue;
          originalTotal += dosageValue;
        }
      }
    });
    
    // If no dosages found in composition, divide equally as fallback
    const useProportional = originalTotal > 0;
    const herbCount = formula.composition?.length || 0;
    const dosagePerHerb = Math.round((totalDosage / herbCount) * 10) / 10;

    // Create a copy of selected components to modify
    let updatedComponents = [...selectedComponents];
    const addedHerbs: string[] = [];
    const mergedHerbs: string[] = [];

    // Process each herb from the formula
    (formula.composition || []).forEach(comp => {
      // Extract herb name from composition object or string
      const herbName = typeof comp === 'object' ? comp.herb_pinyin : comp.replace(/\s+\d+g?$/i, '').trim();
      
      // Calculate proportional dosage
      let dosageAmount: number;
      if (useProportional && herbDosages[herbName]) {
        // Calculate proportional dosage: (herb_dose / original_total) * total_dosage
        dosageAmount = (herbDosages[herbName] / originalTotal) * totalDosage;
      } else {
        // Fallback to equal distribution
        dosageAmount = dosagePerHerb;
      }
      
      // Check if this herb already exists in selected components
      const existingIndex = updatedComponents.findIndex(
        c => c.type === 'herb' && c.name === herbName
      );

      if (existingIndex !== -1) {
        // Herb exists - sum the dosages
        const existingDosage = parseInt(updatedComponents[existingIndex].dosage.replace(/[^0-9]/g, '')) || 0;
        const newTotal = existingDosage + dosageAmount;
        updatedComponents[existingIndex] = {
          ...updatedComponents[existingIndex],
          dosage: `${Math.round(newTotal * 10) / 10}g`
        };
        mergedHerbs.push(herbName);
      } else {
        // Herb doesn't exist - add as new
        updatedComponents.push({
          type: 'herb',
          name: herbName,
          dosage: `${Math.round(dosageAmount * 10) / 10}g`,
          tempId: Math.random().toString()
        });
        addedHerbs.push(herbName);
      }
    });
    
    setSelectedComponents(updatedComponents);
    
    // Show appropriate toast message
    if (mergedHerbs.length > 0 && addedHerbs.length > 0) {
      toast.success(`Added ${pendingFormula} as components (${mergedHerbs.length} merged, ${addedHerbs.length} new)`);
    } else if (mergedHerbs.length > 0) {
      toast.success(`Added ${pendingFormula} as components (all ${mergedHerbs.length} herbs merged with existing)`);
    } else {
      toast.success(`Added ${pendingFormula} as components`);
    }
    
    setShowComponentsModal(false);
    setPendingFormula(null);
  };

  const removeComponent = (tempId: string) => {
    setSelectedComponents(selectedComponents.filter(c => c.tempId !== tempId));
  };

  const updateDosage = (tempId: string, newDosage: string) => {
    setSelectedComponents(selectedComponents.map(c => {
      if (c.tempId === tempId && c.subComponents) {
        // Recalculate subcomponent dosages proportionally based on original ratios
        const newTotal = parseFloat(newDosage.replace(/[^0-9.]/g, '')) || 0;
        
        // Calculate original total from current subcomponents
        let originalTotal = 0;
        c.subComponents.forEach(sub => {
          const dosageValue = parseFloat(sub.dosage.replace(/[^0-9.]/g, ''));
          if (!isNaN(dosageValue)) {
            originalTotal += dosageValue;
          }
        });
        
        // If we have an original total, calculate proportionally; otherwise divide equally
        const useProportional = originalTotal > 0;
        const herbCount = c.subComponents.length;
        const dosagePerHerb = Math.round((newTotal / herbCount) * 10) / 10;
        
        return {
          ...c,
          dosage: newDosage,
          subComponents: c.subComponents.map(sub => {
            if (useProportional) {
              const currentDosage = parseFloat(sub.dosage.replace(/[^0-9.]/g, ''));
              const proportion = currentDosage / originalTotal;
              const newSubDosage = proportion * newTotal;
              return {
                ...sub,
                dosage: `${Math.round(newSubDosage * 10) / 10}g`
              };
            } else {
              return {
                ...sub,
                dosage: `${dosagePerHerb}g`
              };
            }
          })
        };
      }
      return c.tempId === tempId ? { ...c, dosage: newDosage } : c;
    }));
  };

  const incrementDosage = (tempId: string) => {
    setSelectedComponents(selectedComponents.map(c => {
      if (c.tempId === tempId) {
        const currentValue = parseFloat(c.dosage.replace(/[^0-9.]/g, '')) || 0;
        // If has decimals, round up to next integer; if already integer, add 1
        const newValue = currentValue % 1 === 0 ? currentValue + 1 : Math.ceil(currentValue);
        
        if (c.subComponents) {
          // Calculate original total from current subcomponents
          let originalTotal = 0;
          c.subComponents.forEach(sub => {
            const dosageValue = parseFloat(sub.dosage.replace(/[^0-9.]/g, ''));
            if (!isNaN(dosageValue)) {
              originalTotal += dosageValue;
            }
          });
          
          const useProportional = originalTotal > 0;
          const herbCount = c.subComponents.length;
          const dosagePerHerb = Math.round((newValue / herbCount) * 10) / 10;
          
          return {
            ...c,
            dosage: `${newValue}g`,
            subComponents: c.subComponents.map(sub => {
              if (useProportional) {
                const currentDosage = parseFloat(sub.dosage.replace(/[^0-9.]/g, ''));
                const proportion = currentDosage / originalTotal;
                const newSubDosage = proportion * newValue;
                return {
                  ...sub,
                  dosage: `${Math.round(newSubDosage * 10) / 10}g`
                };
              } else {
                return {
                  ...sub,
                  dosage: `${dosagePerHerb}g`
                };
              }
            })
          };
        }
        
        return { ...c, dosage: `${newValue}g` };
      }
      return c;
    }));
  };

  const decrementDosage = (tempId: string) => {
    setSelectedComponents(selectedComponents.map(c => {
      if (c.tempId === tempId) {
        const currentValue = parseFloat(c.dosage.replace(/[^0-9.]/g, '')) || 0;
        // If has decimals, round down to integer; if already integer, subtract 1
        const newValue = currentValue % 1 === 0 ? Math.max(0, currentValue - 1) : Math.floor(currentValue);
        
        if (c.subComponents) {
          // Calculate original total from current subcomponents
          let originalTotal = 0;
          c.subComponents.forEach(sub => {
            const dosageValue = parseFloat(sub.dosage.replace(/[^0-9.]/g, ''));
            if (!isNaN(dosageValue)) {
              originalTotal += dosageValue;
            }
          });
          
          const useProportional = originalTotal > 0;
          const herbCount = c.subComponents.length;
          const dosagePerHerb = Math.round((newValue / herbCount) * 10) / 10;
          
          return {
            ...c,
            dosage: `${newValue}g`,
            subComponents: c.subComponents.map(sub => {
              if (useProportional) {
                const currentDosage = parseFloat(sub.dosage.replace(/[^0-9.]/g, ''));
                const proportion = currentDosage / originalTotal;
                const newSubDosage = proportion * newValue;
                return {
                  ...sub,
                  dosage: `${Math.round(newSubDosage * 10) / 10}g`
                };
              } else {
                return {
                  ...sub,
                  dosage: `${dosagePerHerb}g`
                };
              }
            })
          };
        }
        
        return { ...c, dosage: `${newValue}g` };
      }
      return c;
    }));
  };

  const getSafetyAlerts = () => {
    const alerts = {
      contraindication: [] as string[],
      caution: [] as string[],
      interaction: [] as string[],
      antagonism: [] as string[],
      incompatibility: [] as string[],
      toxic: [] as string[],
      pregnancy: [] as string[]
    };

    // Check if we should process filtered alerts (filtered mode with filters selected)
    const hasFiltersSelected = Object.values(patientSafetyProfile).some(v => v);
    const shouldProcessFilteredAlerts = alertMode === 'all' || (alertMode === 'filtered' && hasFiltersSelected);

    selectedComponents.forEach(comp => {
      // Helper function to check a single herb
      const checkHerbAlerts = (herbName: string) => {
        const herb = getAllHerbs().find(h => h.pinyin_name === herbName);
        if (!herb) return;

        // ALWAYS check for toxic herbs (regardless of alertMode)
        if (herb.toxicology && herb.toxicology.length > 0) {
          const toxicDetails = herb.toxicology.join(' ');
          alerts.toxic.push(`${herbName}: ${toxicDetails}`);
        }

        // Only process other alerts if in 'all' mode or 'filtered' mode with active filters
        if (!shouldProcessFilteredAlerts) return;

        // If alertMode is 'all', show all contraindications, cautions, and interactions
        if (alertMode === 'all') {
          // Add all contraindications
          if (herb.contraindications && Array.isArray(herb.contraindications)) {
            herb.contraindications.forEach(ci => {
              if (ci.trim()) {
                alerts.contraindication.push(`${herbName}: ${ci}`);
              }
            });
          }

          // Add all cautions
          if (herb.cautions && Array.isArray(herb.cautions)) {
            herb.cautions.forEach(caution => {
              if (caution.trim()) {
                alerts.caution.push(`${herbName}: ${caution}`);
              }
            });
          }

          // Add all drug interactions
          if (herb.herb_drug_interactions?.length > 0) {
            alerts.interaction.push(`${herbName}: May interact with ${herb.herb_drug_interactions.join(', ')}`);
          }
        } else {
          // Filtered mode: only show alerts matching active safety filters
          
          // Pregnancy
          if (patientSafetyProfile.pregnancy) {
            if (herb.contraindications?.some(c => c.toLowerCase().includes('pregnancy'))) {
              alerts.contraindication.push(`${herbName}: Contraindicated in pregnancy`);
            } else if (herb.cautions?.some(c => c.toLowerCase().includes('pregnancy'))) {
              alerts.caution.push(`${herbName}: Use with caution in pregnancy`);
            }
          }

          // Breastfeeding
          if (patientSafetyProfile.breastfeeding) {
            if (herb.contraindications?.some(c => c.toLowerCase().includes('breastfeeding') || c.toLowerCase().includes('lactation'))) {
              alerts.contraindication.push(`${herbName}: Contraindicated during breastfeeding`);
            } else if (herb.cautions?.some(c => c.toLowerCase().includes('breastfeeding') || c.toLowerCase().includes('lactation'))) {
              alerts.caution.push(`${herbName}: Use with caution during breastfeeding`);
            }
          }

          // Insomnia
          if (patientSafetyProfile.insomnia) {
            if (herb.contraindications?.some(c => c.toLowerCase().includes('insomnia'))) {
              alerts.contraindication.push(`${herbName}: Contraindicated in insomnia`);
            } else if (herb.cautions?.some(c => c.toLowerCase().includes('insomnia'))) {
              alerts.caution.push(`${herbName}: Use with caution in insomnia`);
            }
          }

          // Epilepsy
          if (patientSafetyProfile.epilepsy) {
            const hasEpilepsyCI = herb.contraindications?.some(c => 
              c.toLowerCase().includes('epilepsy') || 
              c.toLowerCase().includes('seizure') || 
              c.toLowerCase().includes('convulsion')
            );
            const hasEpilepsyCaution = herb.cautions?.some(c => 
              c.toLowerCase().includes('epilepsy') || 
              c.toLowerCase().includes('seizure') || 
              c.toLowerCase().includes('convulsion')
            );
            if (hasEpilepsyCI) {
              alerts.contraindication.push(`${herbName}: Contraindicated in epilepsy/seizure disorders`);
            } else if (hasEpilepsyCaution) {
              alerts.caution.push(`${herbName}: Use with caution in epilepsy/seizure disorders`);
            }
          }

          // Bleeding disorders
          if (patientSafetyProfile.bleeding_disorders) {
            if (herb.contraindications?.some(c => c.toLowerCase().includes('bleeding') || c.toLowerCase().includes('hemorrhag'))) {
              alerts.contraindication.push(`${herbName}: Contraindicated in bleeding disorders`);
            } else if (herb.cautions?.some(c => c.toLowerCase().includes('bleeding') || c.toLowerCase().includes('hemorrhag'))) {
              alerts.caution.push(`${herbName}: Use with caution in bleeding disorders`);
            }
          }

          // Liver disease
          if (patientSafetyProfile.liver_disease) {
            if (herb.contraindications?.some(c => c.toLowerCase().includes('liver') || c.toLowerCase().includes('hepat'))) {
              alerts.contraindication.push(`${herbName}: Contraindicated in liver disease`);
            } else if (herb.cautions?.some(c => c.toLowerCase().includes('liver') || c.toLowerCase().includes('hepat'))) {
              alerts.caution.push(`${herbName}: Use with caution in liver disease`);
            }
          }

          // Kidney disease
          if (patientSafetyProfile.kidney_disease) {
            if (herb.contraindications?.some(c => c.toLowerCase().includes('kidney') || c.toLowerCase().includes('renal'))) {
              alerts.contraindication.push(`${herbName}: Contraindicated in kidney disease`);
            } else if (herb.cautions?.some(c => c.toLowerCase().includes('kidney') || c.toLowerCase().includes('renal'))) {
              alerts.caution.push(`${herbName}: Use with caution in kidney disease`);
            }
          }

          // Medications - Dynamic matching using safety categories
          const medicationCategories = getActiveSafetyCategories().filter(c => c.group === 'medications');
          medicationCategories.forEach(medCategory => {
            const categoryKey = medCategory.displayName.toLowerCase().replace(/\s+/g, '_');
            const isActive = patientSafetyProfile[categoryKey as keyof PatientSafetyProfile];

            if (isActive) {
              // Check contraindications
              if (matchesSafetyCategoryInArray(herb.contraindications, medCategory)) {
                alerts.contraindication.push(`${herbName}: Contraindicated with ${medCategory.displayName.toLowerCase()}`);
              }
              // Check drug interactions
              else if (matchesSafetyCategoryInArray(herb.herb_drug_interactions, medCategory)) {
                alerts.interaction.push(`${herbName}: May interact with ${medCategory.displayName.toLowerCase()}`);
              }
            }
          });
        }
      };

      // Check individual herbs
      if (comp.type === 'herb') {
        checkHerbAlerts(comp.name);
      }
      
      // Check compound formulas (verify all subcomponents)
      if (comp.type === 'formula' && comp.subComponents) {
        (comp.subComponents || []).forEach(sub => {
          if (sub?.name) checkHerbAlerts(sub.name);
        });
      }
    });

    // ALWAYS check for antagonism and incompatibility conflicts between selected herbs (regardless of alertMode)
    const allHerbs = getAllHerbs();
    const selectedHerbNames: string[] = [];
    
    // Collect all herb names (including from formulas)
    selectedComponents.forEach(comp => {
      if (comp.type === 'herb') {
        selectedHerbNames.push(comp.name);
      } else if (comp.type === 'formula' && comp.subComponents) {
        (comp.subComponents || []).forEach(sub => {
          if (sub?.name && !selectedHerbNames.includes(sub.name)) {
            selectedHerbNames.push(sub.name);
          }
        });
      }
    });

    // Check each herb against all others for conflicts
    selectedHerbNames.forEach((herbName, index) => {
      const herb = allHerbs.find(h => h.pinyin_name === herbName);
      if (!herb) return;

      // Check antagonisms
      if (herb.antagonisms && herb.antagonisms.length > 0) {
        herb.antagonisms.forEach(antagonistName => {
          if (selectedHerbNames.includes(antagonistName)) {
            const conflictMsg = `${herbName} ⚠ ${antagonistName}`;
            if (!alerts.antagonism.includes(conflictMsg)) {
              alerts.antagonism.push(conflictMsg);
            }
          }
        });
      }

      // Check incompatibilities
      if (herb.incompatibilities && herb.incompatibilities.length > 0) {
        herb.incompatibilities.forEach(incompatibleName => {
          if (selectedHerbNames.includes(incompatibleName)) {
            const conflictMsg = `${herbName} ⚠ ${incompatibleName}`;
            if (!alerts.incompatibility.includes(conflictMsg)) {
              alerts.incompatibility.push(conflictMsg);
            }
          }
        });
      }
    });

    return alerts;
  };

  // Helper function to check if a specific herb has a conflict
  const getHerbConflicts = (herbName: string): { hasConflict: boolean; conflictWith: string[] } => {
    const allHerbs = getAllHerbs();
    const herb = allHerbs.find(h => h.pinyin_name === herbName);
    if (!herb) return { hasConflict: false, conflictWith: [] };

    const conflictWith: string[] = [];
    const selectedHerbNames: string[] = [];
    
    // Collect all herb names
    selectedComponents.forEach(comp => {
      if (comp.type === 'herb') {
        selectedHerbNames.push(comp.name);
      } else if (comp.type === 'formula' && comp.subComponents) {
        (comp.subComponents || []).forEach(sub => {
          if (sub?.name && !selectedHerbNames.includes(sub.name)) {
            selectedHerbNames.push(sub.name);
          }
        });
      }
    });

    // Check antagonisms
    if (herb.antagonisms && herb.antagonisms.length > 0) {
      herb.antagonisms.forEach(antagonistName => {
        if (selectedHerbNames.includes(antagonistName)) {
          conflictWith.push(antagonistName);
        }
      });
    }

    // Check incompatibilities
    if (herb.incompatibilities && herb.incompatibilities.length > 0) {
      herb.incompatibilities.forEach(incompatibleName => {
        if (selectedHerbNames.includes(incompatibleName)) {
          conflictWith.push(incompatibleName);
        }
      });
    }

    return { hasConflict: conflictWith?.length > 0, conflictWith };
  };

  const handleSave = () => {
    if (!formulaName.trim()) {
      toast.error('Please enter a formula name');
      return;
    }

    if (!selectedComponents || selectedComponents.length === 0) {
      toast.error('Please add at least one component');
      return;
    }

    const prescriptionId = searchParams.get('prescription');
    const isNewVersion = searchParams.get('newVersion') === 'true';
    
    // If editing existing prescription (not a new version), show dialog
    if (prescriptionId && !isNewVersion) {
      setShowSaveDialog(true);
      return;
    }
    
    // Otherwise, save as new prescription directly
    saveAsNew();
  };

  const saveAsUpdate = () => {
    setIsSaving(true);
    
    const prescriptionId = searchParams.get('prescription');
    
    // Check if any patient safety profile filters are actually selected
    const hasAnyProfileFilters = Object.values(patientSafetyProfile).some(v => v === true);
    
    const prescriptionData = {
      name: formulaName,
      components: selectedComponents.map(({ tempId, ...rest }) => rest),
      comments,
      // Save patient safety profile if any filters are selected, regardless of alertMode toggle
      patientSafetyProfile: hasAnyProfileFilters ? patientSafetyProfile : undefined
    };
    
    const prescription = updatePrescription(prescriptionId!, prescriptionData);
    if (!prescription) {
      toast.error('Failed to update prescription');
      setIsSaving(false);
      return;
    }
    
    toast.success('Prescription updated successfully');
    setHasUnsavedChanges(false);
    localStorage.removeItem(BUILDER_STATE_KEY);
    setShowSaveDialog(false);
    
    setTimeout(() => {
      navigate('/prescriptions', { 
        state: { openPrescription: prescription.id }
      });
    }, 0);
  };

  const saveAsNew = () => {
    setIsSaving(true);
    
    // Check if any patient safety profile filters are actually selected
    const hasAnyProfileFilters = Object.values(patientSafetyProfile).some(v => v === true);
    
    const prescriptionData = {
      name: formulaName,
      components: selectedComponents.map(({ tempId, ...rest }) => rest),
      comments,
      // Save patient safety profile if any filters are selected, regardless of alertMode toggle
      patientSafetyProfile: hasAnyProfileFilters ? patientSafetyProfile : undefined
    };
    
    const prescription = savePrescription(prescriptionData);
    toast.success('Prescription saved successfully');

    setHasUnsavedChanges(false);
    localStorage.removeItem(BUILDER_STATE_KEY);
    setShowSaveDialog(false);
    
    setTimeout(() => {
      navigate('/prescriptions', { 
        state: { openPrescription: prescription.id }
      });
    }, 0);
  };

  const safetyAlerts = getSafetyAlerts();

  // Check if user has access to Builder
  if (!hasFeature('builder')) {
    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <UpgradePrompt
          feature="Prescription Builder"
          description="Create custom prescriptions with our advanced builder tool. Select herbs and formulas, manage dosages, and generate comprehensive safety reports."
          requiredPlan="practitioner"
        />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] flex flex-col lg:flex-row gap-4 lg:gap-6 p-4 lg:p-6 bg-gray-50">
      {/* Module 1: All Filters - Hidden on mobile, narrowest column on desktop */}
      <div className="hidden lg:block w-72 flex-shrink-0">
        <div className="bg-white rounded-lg border border-gray-200 sticky top-4 max-h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="px-6 py-6 space-y-6">
              {/* Herb Filters Header */}
              <div>
                <button
              onClick={() => setExpandedCategories({ ...expandedCategories, herb_filters_section: !expandedCategories.herb_filters_section })}
              className="flex items-center justify-between w-full text-left mb-3"
            >
              <h2 className="text-lg font-semibold text-gray-900">Herb Filters</h2>
              <div className="flex items-center gap-2">
                {hasActiveHerbFilters && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      clearHerbFilters();
                    }}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
                  >
                    Clear
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 text-gray-700 transition-transform ${expandedCategories.herb_filters_section ? 'rotate-180' : ''}`} />
              </div>
                </button>

                {expandedCategories.herb_filters_section && (
                  <div className="space-y-4">
              {/* Categories */}
              {uniqueCategories.length > 0 && (
                <div>
                  <button
                    onClick={() => setExpandedCategories({ ...expandedCategories, herb_category: !expandedCategories.herb_category })}
                    className="flex items-center justify-between w-full text-left mb-3"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Categories</h3>
                      {categoryFilters.length > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                          {categoryFilters.length}
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCategories.herb_category ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedCategories.herb_category && (
                    <div className="space-y-2.5">
                      {uniqueCategories.map((category) => {
                        const isCategorySelected = categoryFilters.includes(category);
                        const subcategories = getSubcategoriesForCategory(category);

                        return (
                          <div key={`herb-category-${category}`}>
                            <label className="flex items-start gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isCategorySelected}
                                onChange={() => toggleCategoryFilter(category)}
                                className="w-4 h-4 flex-shrink-0 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5"
                              />
                              <span className="text-sm text-gray-700">{category}</span>
                            </label>
                            {isCategorySelected && subcategories.length > 0 && (
                              <div className="ml-6 mt-2 space-y-2">
                                {subcategories.map(subcategory => (
                                  <label key={`herb-subcategory-${subcategory}`} className="flex items-start gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={subcategoryFilters.includes(subcategory)}
                                      onChange={() => toggleSubcategoryFilter(subcategory)}
                                      className="w-4 h-4 flex-shrink-0 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5"
                                    />
                                    <span className="text-xs text-gray-600">{subcategory}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Natures */}
              {expandedCategories.herb_filters_section && uniqueNatures.length > 0 && (
                <div>
                  <button
                    onClick={() => setExpandedCategories({ ...expandedCategories, herb_nature: !expandedCategories.herb_nature })}
                    className="flex items-center justify-between w-full text-left mb-3"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Natures</h3>
                      {natureFilters.length > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                          {natureFilters.length}
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCategories.herb_nature ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedCategories.herb_nature && (
                    <div className="space-y-2.5">
                      {uniqueNatures.map(nature => (
                        <label key={nature} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={natureFilters.includes(nature)}
                            onChange={() => toggleNatureFilter(nature)}
                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                          />
                          <span className="text-sm text-gray-700">{nature}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Flavors */}
              {expandedCategories.herb_filters_section && uniqueFlavors.length > 0 && (
                <div>
                  <button
                    onClick={() => setExpandedCategories({ ...expandedCategories, herb_flavor: !expandedCategories.herb_flavor })}
                    className="flex items-center justify-between w-full text-left mb-3"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Flavors</h3>
                      {flavorFilters.length > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                          {flavorFilters.length}
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCategories.herb_flavor ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedCategories.herb_flavor && (
                    <div className="space-y-2.5">
                      {uniqueFlavors.map(flavor => (
                        <label key={flavor} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={flavorFilters.includes(flavor)}
                            onChange={() => toggleFlavorFilter(flavor)}
                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                          />
                          <span className="text-sm text-gray-700">{flavor}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Channels */}
              {expandedCategories.herb_filters_section && uniqueChannels.length > 0 && (
                <div>
                  <button
                    onClick={() => setExpandedCategories({ ...expandedCategories, herb_channels: !expandedCategories.herb_channels })}
                    className="flex items-center justify-between w-full text-left mb-3"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Channels</h3>
                      {channelFilters.length > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                          {channelFilters.length}
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCategories.herb_channels ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedCategories.herb_channels && (
                    <div className="space-y-2.5">
                      {uniqueChannels.map(channel => (
                        <label key={channel} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={channelFilters.includes(channel)}
                            onChange={() => toggleChannelFilter(channel)}
                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                          />
                          <span className="text-sm text-gray-700">{channel}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
                  </div>
                )}
              </div>

              {/* Separator */}
              <div className="border-t border-gray-200 my-4"></div>

              {/* Formula Filters Header */}
              <div>
                <button
                  onClick={() => setExpandedCategories({ ...expandedCategories, formula_filters_section: !expandedCategories.formula_filters_section })}
                  className="flex items-center justify-between w-full text-left mb-3"
                >
                  <h2 className="text-lg font-semibold text-gray-900">Formula Filters</h2>
                  <div className="flex items-center gap-2">
                    {hasActiveFormulaFilters && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFormulaFilters();
                        }}
                        className="text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
                      >
                        Clear
                      </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-700 transition-transform ${expandedCategories.formula_filters_section ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {expandedCategories.formula_filters_section && (
                  <div className="space-y-4">
              {/* Formula Categories */}
              {uniqueFormulaCategories.length > 0 && (
                <div>
                  <button
                    onClick={() => setExpandedCategories({ ...expandedCategories, formula_category: !expandedCategories.formula_category })}
                    className="flex items-center justify-between w-full text-left mb-3"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Categories</h3>
                      {formulaCategoryFilters.length > 0 && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                          {formulaCategoryFilters.length}
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCategories.formula_category ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedCategories.formula_category && (
                    <div className="space-y-2.5">
                      {uniqueFormulaCategories.map((category) => {
                        const isCategorySelected = formulaCategoryFilters.includes(category);
                        const subcategories = getSubcategoriesForFormulaCategory(category);

                        return (
                          <div key={`formula-category-${category}`}>
                            <label className="flex items-start gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isCategorySelected}
                                onChange={() => toggleFormulaCategoryFilter(category)}
                                className="w-4 h-4 flex-shrink-0 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5"
                              />
                              <span className="text-sm text-gray-700">{category}</span>
                            </label>
                            {isCategorySelected && subcategories.length > 0 && (
                              <div className="ml-6 mt-2 space-y-2">
                                {subcategories.map(subcategory => (
                                  <label key={`formula-subcategory-${subcategory}`} className="flex items-start gap-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={formulaSubcategoryFilters.includes(subcategory)}
                                      onChange={() => toggleFormulaSubcategoryFilter(subcategory)}
                                      className="w-4 h-4 flex-shrink-0 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5"
                                    />
                                    <span className="text-xs text-gray-600">{subcategory}</span>
                                  </label>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
                  </div>
                )}
              </div>

              {/* Separator */}
              <div className="border-t border-gray-200 my-4"></div>

              {/* Clinical Use Filters Header */}
              {hasFeature('clinicalUseFilters') && (
              <>
              <div>
                <button
                  onClick={() => setExpandedCategories({ ...expandedCategories, clinical_filters_section: !expandedCategories.clinical_filters_section })}
                  className="flex items-center justify-between w-full text-left mb-3"
                >
                  <h2 className="text-lg font-semibold text-gray-900">Clinical Use Filters</h2>
                  <div className="flex items-center gap-2">
                    {(clinicalUseFilters?.clinicalApplications && clinicalUseFilters.clinicalApplications.length > 0) && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setClinicalUseFilters({ ...clinicalUseFilters, clinicalApplications: [], condition: null, patterns: [] });
                        }}
                        className="text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
                      >
                        Clear
                      </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-700 transition-transform ${expandedCategories.clinical_filters_section ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Clinical Applications */}
                {expandedCategories.clinical_filters_section && (
                <>
                {/* Condition / Diagnosis */}
                <div className="mb-3">
                  <button
                    onClick={() => setShowConditionModal(true)}
                    className="flex items-center justify-between w-full text-left mb-3 hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Clinical Applications</h3>
                      {(clinicalUseFilters?.clinicalApplications && clinicalUseFilters.clinicalApplications.length > 0) && (
                        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                          {clinicalUseFilters.clinicalApplications.length}
                        </span>
                      )}
                    </div>
                  </button>
                </div>

              </>
              )}
              </div>

              </>
              )}

              {/* Separator */}
              {(hasFeature('generalConditions') || hasFeature('medications') || hasFeature('allergies') || hasFeature('tcmRiskPatterns')) && (
                <div className="border-t border-gray-200 my-4"></div>
              )}

              {/* Safety Profile Header */}
              {(hasFeature('generalConditions') || hasFeature('medications') || hasFeature('allergies') || hasFeature('tcmRiskPatterns')) && (
              <>
              <div>
                <button
                  onClick={() => setExpandedCategories({ ...expandedCategories, safety_profile_section: !expandedCategories.safety_profile_section })}
                  className="flex items-center justify-between w-full text-left mb-3"
                >
                  <h2 className="text-lg font-semibold text-gray-900">Safety Profile</h2>
                  <div className="flex items-center gap-2">
                    {hasActivePatientSafetyFilters && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          clearPatientSafetyFilters();
                        }}
                        className="text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
                      >
                        Clear
                      </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-700 transition-transform ${expandedCategories.safety_profile_section ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* General Conditions - Open modal instead of inline */}
                {hasFeature('generalConditions') && expandedCategories.safety_profile_section && (
              <div>
                <button
                  onClick={() => setShowGeneralConditionsModal(true)}
                  className="flex items-center justify-between w-full text-left mb-3 hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">General Conditions</h3>
                    {getGeneralConditionsCount() > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                        {getGeneralConditionsCount()}
                      </span>
                    )}
                  </div>
                </button>
              </div>
              )}

              {/* Medications - Open modal instead of inline */}
              {hasFeature('medications') && expandedCategories.safety_profile_section && (
              <div>
                <button
                  onClick={() => setShowMedicationsModal(true)}
                  className="flex items-center justify-between w-full text-left mb-3 hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Medications</h3>
                    {getMedicationsCount() > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                        {getMedicationsCount()}
                      </span>
                    )}
                  </div>
                </button>
              </div>
              )}

              {/* Allergies - Open modal instead of inline */}
              {hasFeature('allergies') && expandedCategories.safety_profile_section && (
              <div>
                <button
                  onClick={() => setShowAllergiesModal(true)}
                  className="flex items-center justify-between w-full text-left mb-3 hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Allergies</h3>
                    {getAllergiesCount() > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                        {getAllergiesCount()}
                      </span>
                    )}
                  </div>
                </button>
              </div>
              )}

              {/* TCM Risk Patterns - Open modal instead of inline */}
              {hasFeature('tcmRiskPatterns') && expandedCategories.safety_profile_section && (
              <div>
                <button
                  onClick={() => setShowTcmRiskPatternsModal(true)}
                  className="flex items-center justify-between w-full text-left mb-3 hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">TCM Risk Patterns</h3>
                    {getTcmRiskPatternsCount() > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                        {getTcmRiskPatternsCount()}
                      </span>
                    )}
                  </div>
                </button>
              </div>
              )}
              </div>

              </>
              )}

              {/* Separator */}
              {((hasFeature('pharmacologicalEffectsFilter') && getAvailablePharmacologicalEffects().length > 0) || (hasFeature('biologicalMechanismsFilter') && getAvailableBiologicalMechanisms().length > 0) || (hasFeature('bioactiveCompoundsFilter') && Object.keys(getAvailableBioactiveCompounds()).length > 0)) && (
                <div className="border-t border-gray-200 my-4"></div>
              )}

              {/* Advanced Filters Header */}
              {((hasFeature('pharmacologicalEffectsFilter') && getAvailablePharmacologicalEffects().length > 0) || (hasFeature('biologicalMechanismsFilter') && getAvailableBiologicalMechanisms().length > 0) || (hasFeature('bioactiveCompoundsFilter') && Object.keys(getAvailableBioactiveCompounds()).length > 0)) && (
              <>
              <div>
                <button
                  onClick={() => setExpandedCategories({ ...expandedCategories, advanced_filters_section: !expandedCategories.advanced_filters_section })}
                  className="flex items-center justify-between w-full text-left mb-3"
                >
                  <h2 className="text-lg font-semibold text-gray-900">Advanced Filters</h2>
                  <div className="flex items-center gap-2">
                    {hasActiveAdvancedFilters && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          clearAdvancedFilters();
                        }}
                        className="text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
                      >
                        Clear
                      </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-700 transition-transform ${expandedCategories.advanced_filters_section ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {/* Pharmacological Effects */}
                {expandedCategories.advanced_filters_section && hasFeature('pharmacologicalEffectsFilter') && getAvailablePharmacologicalEffects().length > 0 && (
              <div>
                <button
                  onClick={() => setShowPharmacologicalModal(true)}
                  className="flex items-center justify-between w-full text-left mb-3 hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pharmacological Effects</h3>
                    {pharmacologicalFiltersCount > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                        {pharmacologicalFiltersCount}
                      </span>
                    )}
                  </div>
                </button>
              </div>
              )}

              {/* Biological Mechanisms */}
              {expandedCategories.advanced_filters_section && hasFeature('biologicalMechanismsFilter') && getAvailableBiologicalMechanisms().length > 0 && (
              <div>
                <button
                  onClick={() => setShowBiologicalModal(true)}
                  className="flex items-center justify-between w-full text-left mb-3 hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Biological Mechanisms</h3>
                    {biologicalMechanismsCount > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                        {biologicalMechanismsCount}
                      </span>
                    )}
                  </div>
                </button>
              </div>
              )}

              {/* Bioactive Compounds */}
              {expandedCategories.advanced_filters_section && hasFeature('bioactiveCompoundsFilter') && Object.keys(getAvailableBioactiveCompounds()).length > 0 && (
              <div>
                <button
                  onClick={() => setShowBioactiveCompoundsModal(true)}
                  className="flex items-center justify-between w-full text-left mb-3 hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Bioactive Compounds</h3>
                    {bioactiveCompoundsCount > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                        {bioactiveCompoundsCount}
                      </span>
                    )}
                  </div>
                </button>
              </div>
              )}
              </div>

              </>
              )}

              {/* Active Filters Summary */}
              {hasAnyActiveFilter && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Active Filters</h3>
                  <div className="space-y-3">
                    {/* Herb Filters */}
                    {categoryFilters.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">Categories</p>
                        <div className="flex flex-wrap gap-1.5">
                          {categoryFilters.map(category => (
                            <button
                              key={category}
                              onClick={() => toggleCategoryFilter(category)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs hover:bg-teal-100 transition-colors"
                            >
                              <span>{category}</span>
                              <X className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {subcategoryFilters.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">Subcategories</p>
                        <div className="flex flex-wrap gap-1.5">
                          {subcategoryFilters.map(subcategory => (
                            <button
                              key={subcategory}
                              onClick={() => toggleSubcategoryFilter(subcategory)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs hover:bg-teal-100 transition-colors"
                            >
                              <span>{subcategory}</span>
                              <X className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {natureFilters.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">Natures</p>
                        <div className="flex flex-wrap gap-1.5">
                          {natureFilters.map(nature => (
                            <button
                              key={nature}
                              onClick={() => toggleNatureFilter(nature)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs hover:bg-teal-100 transition-colors"
                            >
                              <span>{nature}</span>
                              <X className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {flavorFilters.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">Flavors</p>
                        <div className="flex flex-wrap gap-1.5">
                          {flavorFilters.map(flavor => (
                            <button
                              key={flavor}
                              onClick={() => toggleFlavorFilter(flavor)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs hover:bg-teal-100 transition-colors"
                            >
                              <span>{flavor}</span>
                              <X className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {channelFilters.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">Channels</p>
                        <div className="flex flex-wrap gap-1.5">
                          {channelFilters.map(channel => (
                            <button
                              key={channel}
                              onClick={() => toggleChannelFilter(channel)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs hover:bg-teal-100 transition-colors"
                            >
                              <span>{channel}</span>
                              <X className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Formula Filters */}
                    {formulaCategoryFilters.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">Formula Categories</p>
                        <div className="flex flex-wrap gap-1.5">
                          {formulaCategoryFilters.map(category => (
                            <button
                              key={category}
                              onClick={() => toggleFormulaCategoryFilter(category)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs hover:bg-purple-100 transition-colors"
                            >
                              <span>{category}</span>
                              <X className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {formulaSubcategoryFilters.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">Formula Subcategories</p>
                        <div className="flex flex-wrap gap-1.5">
                          {formulaSubcategoryFilters.map(subcategory => (
                            <button
                              key={subcategory}
                              onClick={() => toggleFormulaSubcategoryFilter(subcategory)}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs hover:bg-purple-100 transition-colors"
                            >
                              <span>{subcategory}</span>
                              <X className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Clinical Filters */}
                    {/* Clinical Applications: Conditions + Patterns */}
                    {(clinicalUseFilters?.clinicalApplications && clinicalUseFilters.clinicalApplications.length > 0) && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">Clinical Applications</p>
                        <div className="flex flex-wrap gap-1.5">
                          {clinicalUseFilters.clinicalApplications.map((app, index) => (
                            <div key={`app-${index}`} className="flex flex-wrap gap-1.5">
                              {app.patterns && app.patterns.length > 0 ? (
                                // Show individual chips for each pattern
                                app.patterns.map((pattern, pIndex) => (
                                  <button
                                    key={`pattern-${index}-${pIndex}`}
                                    onClick={() => {
                                      // Remove this specific pattern
                                      const updatedApplications = clinicalUseFilters.clinicalApplications.map((a, i) => {
                                        if (i === index) {
                                          const newPatterns = a.patterns.filter(p => p !== pattern);
                                          return { ...a, patterns: newPatterns };
                                        }
                                        return a;
                                      }).filter(a => a.patterns.length > 0 || a.patterns.length === 0);

                                      // If this was the last pattern, remove the whole condition
                                      const finalApplications = updatedApplications.filter(a => a.patterns.length > 0);

                                      setClinicalUseFilters({
                                        ...clinicalUseFilters,
                                        clinicalApplications: finalApplications,
                                        condition: finalApplications.length > 0 ? finalApplications[0].condition : null,
                                        patterns: finalApplications.length > 0 ? finalApplications[0].patterns : [],
                                      });
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors"
                                  >
                                    <span>{app.condition}: {pattern}</span>
                                    <X className="w-3 h-3" />
                                  </button>
                                ))
                              ) : (
                                // Show chip for whole condition
                                <button
                                  key={`condition-${index}`}
                                  onClick={() => {
                                    // Remove this condition
                                    const updatedApplications = clinicalUseFilters.clinicalApplications.filter((_, i) => i !== index);
                                    setClinicalUseFilters({
                                      ...clinicalUseFilters,
                                      clinicalApplications: updatedApplications,
                                      condition: updatedApplications.length > 0 ? updatedApplications[0].condition : null,
                                      patterns: updatedApplications.length > 0 ? updatedApplications[0].patterns : [],
                                    });
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors"
                                >
                                  <span>{app.condition}</span>
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(clinicalUseFilters?.western_medical_dx?.length || 0) > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">Western Medical Dx</p>
                        <div className="flex flex-wrap gap-1.5">
                          {clinicalUseFilters?.western_medical_dx?.map((dx: string) => (
                            <button
                              key={dx}
                              onClick={() => {
                                setClinicalUseFilters(prev => ({
                                  ...prev,
                                  western_medical_dx: prev?.western_medical_dx?.filter((d: string) => d !== dx) || []
                                }));
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors"
                            >
                              <span>{dx}</span>
                              <X className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Safety Profile Filters */}
                    {getGeneralConditionsCount() > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">General Conditions</p>
                        <div className="flex flex-wrap gap-1.5">
                          {['pregnancy', 'breastfeeding', 'insomnia', 'epilepsy', 'bleeding_disorders', 'liver_disease', 'kidney_disease']
                            .filter(field => patientSafetyProfile?.[field as keyof typeof patientSafetyProfile])
                            .map(field => (
                              <button
                                key={field}
                                onClick={() => {
                                  setPatientSafetyProfile({
                                    ...patientSafetyProfile,
                                    [field]: false
                                  });
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs hover:bg-amber-100 transition-colors"
                              >
                                <span>{getDisplayName(field)}</span>
                                <X className="w-3 h-3" />
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    {getMedicationsCount() > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">Medications</p>
                        <div className="flex flex-wrap gap-1.5">
                          {['anticoagulants', 'antihypertensives', 'hypoglycemics', 'immunosuppressants', 'antidepressants', 'antiplatelets', 'beta_blockers', 'diuretics', 'corticosteroids', 'sedatives']
                            .filter(field => patientSafetyProfile?.[field as keyof typeof patientSafetyProfile])
                            .map(field => (
                              <button
                                key={field}
                                onClick={() => {
                                  setPatientSafetyProfile({
                                    ...patientSafetyProfile,
                                    [field]: false
                                  });
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs hover:bg-amber-100 transition-colors"
                              >
                                <span>{getDisplayName(field)}</span>
                                <X className="w-3 h-3" />
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    {getAllergiesCount() > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">Allergies</p>
                        <div className="flex flex-wrap gap-1.5">
                          {['shellfish', 'gluten', 'nuts', 'dairy', 'soy', 'asteraceae', 'apiaceae']
                            .filter(field => patientSafetyProfile?.[field as keyof typeof patientSafetyProfile])
                            .map(field => (
                              <button
                                key={field}
                                onClick={() => {
                                  setPatientSafetyProfile({
                                    ...patientSafetyProfile,
                                    [field]: false
                                  });
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs hover:bg-amber-100 transition-colors"
                              >
                                <span>{getDisplayName(field)}</span>
                                <X className="w-3 h-3" />
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    {getTcmRiskPatternsCount() > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">TCM Risk Patterns</p>
                        <div className="flex flex-wrap gap-1.5">
                          {['qi_deficiency', 'blood_deficiency', 'blood_stasis', 'yin_deficiency', 'yin_deficiency_heat', 'yang_deficiency', 'dampness', 'heat', 'liver_yang_rising', 'phlegm_damp', 'damp_heat', 'internal_wind']
                            .filter(field => patientSafetyProfile?.[field as keyof typeof patientSafetyProfile])
                            .map(field => (
                              <button
                                key={field}
                                onClick={() => {
                                  setPatientSafetyProfile({
                                    ...patientSafetyProfile,
                                    [field]: false
                                  });
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs hover:bg-amber-100 transition-colors"
                              >
                                <span>{getDisplayName(field)}</span>
                                <X className="w-3 h-3" />
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Advanced Filters */}
                    {pharmacologicalFiltersCount > 0 && hasFeature('pharmacologicalEffectsFilter') && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">Pharmacological Effects</p>
                        <div className="flex flex-wrap gap-1.5">
                          {pharmacologicalFilters.map(effect => (
                            <button
                              key={effect}
                              onClick={() => {
                                setPharmacologicalFilters(pharmacologicalFilters.filter(e => e !== effect));
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs hover:bg-indigo-100 transition-colors"
                            >
                              <span>{effect}</span>
                              <X className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {biologicalMechanismsCount > 0 && hasFeature('biologicalMechanismsFilter') && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">Biological Mechanisms</p>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(biologicalMechanisms || {}).flatMap(([mechanism, targets]) =>
                            (targets || []).map(target => (
                              <button
                                key={`${mechanism}-${target}`}
                                onClick={() => {
                                  const updatedTargets = biologicalMechanisms[mechanism].filter(t => t !== target);
                                  if (updatedTargets.length === 0) {
                                    const { [mechanism]: _, ...rest } = biologicalMechanisms;
                                    setBiologicalMechanisms(rest);
                                  } else {
                                    setBiologicalMechanisms({
                                      ...biologicalMechanisms,
                                      [mechanism]: updatedTargets
                                    });
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs hover:bg-indigo-100 transition-colors"
                              >
                                <span>{mechanism}: {target}</span>
                                <X className="w-3 h-3" />
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}

                    {bioactiveCompoundsCount > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">Bioactive Compounds</p>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(bioactiveCompounds || {}).flatMap(([chemicalClass, compounds]) =>
                            (compounds || []).map(compound => (
                              <button
                                key={`${chemicalClass}-${compound}`}
                                onClick={() => {
                                  const updatedCompounds = bioactiveCompounds[chemicalClass].filter(c => c !== compound);
                                  if (updatedCompounds.length === 0) {
                                    const { [chemicalClass]: _, ...rest } = bioactiveCompounds;
                                    setBioactiveCompounds(rest);
                                  } else {
                                    setBioactiveCompounds({
                                      ...bioactiveCompounds,
                                      [chemicalClass]: updatedCompounds
                                    });
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs hover:bg-green-100 transition-colors"
                              >
                                <span>{chemicalClass !== 'Uncategorized' ? `${chemicalClass}: ${compound}` : compound}</span>
                                <X className="w-3 h-3" />
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Clear All Filters Button */}
              {hasAnyActiveFilter && (
                <div className="mt-6 pt-6 border-t border-gray-200 -mx-6 px-6">
                  <button
                    onClick={clearAllBuilderFilters}
                    className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Controls - Outside container to save space */}
      <div className="lg:hidden flex flex-col gap-4">
        {/* Search bar and Filters button */}
        <div className="flex items-center gap-2 h-10">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={`Search ${activeTab}...`}
            className="flex-1"
          />
          
          {/* Filters button - Mobile only */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="relative h-10 w-10 bg-transparent border-0 text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center shrink-0 rounded-lg"
            title="Filters"
          >
            <Filter className="w-[18px] h-[18px]" />
            {hasAnyActiveFilter && (() => {
              // Calculate clinical use filters count
              const clinicalUseCount = (clinicalUseFilters?.clinicalApplications?.length || 0) +
                (clinicalUseFilters?.clinicalApplications?.reduce((acc, app) => acc + (app.patterns?.length || 0), 0) || 0);

              // Calculate safety profile filters count
              const safetyProfileCount = getGeneralConditionsCount() + getMedicationsCount() + getAllergiesCount() + getTcmRiskPatternsCount();

              const totalCount = (categoryFilters?.length || 0) +
                (subcategoryFilters?.length || 0) +
                (natureFilters?.length || 0) +
                (flavorFilters?.length || 0) +
                (channelFilters?.length || 0) +
                (formulaCategoryFilters?.length || 0) +
                (formulaSubcategoryFilters?.length || 0) +
                pharmacologicalFiltersCount +
                (biologicalMechanismsCount || 0) +
                clinicalUseCount +
                safetyProfileCount;

              return (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-teal-600 text-white text-[10px] rounded-full font-medium">
                  {totalCount}
                </span>
              );
            })()}
          </button>
        </div>
        
        {/* Toggle */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('herbs')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'herbs'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Herbs
            </button>
            <button
              onClick={() => setActiveTab('formulas')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'formulas'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Formulas
            </button>
          </div>
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className="p-2 flex items-center"
            title="Toggle favorites"
          >
            <Star className={`w-5 h-5 ${showFavoritesOnly ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
          </button>
        </div>
      </div>

      {/* Module 2: Library Selector */}
      <div className="lg:flex-1 flex flex-col">
        <div className="hidden lg:block mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('herbs')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'herbs'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Herbs
              </button>
              <button
                onClick={() => setActiveTab('formulas')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'formulas'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Formulas
              </button>
            </div>
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className="p-2 flex items-center"
              title="Toggle favorites"
            >
              <Star className={`w-5 h-5 ${showFavoritesOnly ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
            </button>
            {/* Filters button - visible only on mobile */}
            <button
              onClick={() => {
                toast.info('Filters panel coming soon for mobile');
              }}
              className="lg:hidden ml-auto w-8 h-8 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center justify-center shrink-0"
              title="Filters"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={`Search ${activeTab}...`}
            className="flex-1"
          />
        </div>

        <div className="overflow-y-auto p-0 h-[280px] lg:flex-1 lg:h-auto lg:max-h-none border border-gray-200 rounded-lg">
          {activeTab === 'herbs' ? (
            <div className="lg:divide-y lg:divide-gray-200">
              {/* Mobile: rounded corners pattern */}
              <div className="lg:hidden divide-y divide-gray-200 border-b border-gray-200">
                {filteredHerbs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No herbs found</p>
                ) : (
                  filteredHerbs.map(herb => {
                    const warnings = getHerbWarnings(herb.pinyin_name);
                    return (
                      <div
                        key={herb.herb_id}
                        className={`group hover:bg-gray-50 transition-colors border-l-4 ${herbDisplayOptions.showNatureIndicator ? getNatureBorderColor(herb.nature) : 'border-l-transparent'} lg:cursor-default cursor-pointer`}
                        onClick={() => {
                          modalNav.reset({ name: herb.pinyin_name, type: 'herb' });
                        }}
                      >
                        <div className="px-4 py-3 flex items-center gap-3 bg-white">
                          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                            {(() => {
                              // Get active names in configured order
                              const activeNames = (herbDisplayOptions?.order || [])
                                .filter(nameType => herbDisplayOptions?.[nameType])
                                .map(nameType => {
                                  if (nameType === 'pinyin') return { type: 'pinyin', value: herb.pinyin_name, italic: false };
                                  if (nameType === 'latin' && herb.pharmaceutical_name) return { type: 'latin', value: herb.pharmaceutical_name, italic: false };
                                  if (nameType === 'hanzi' && herb.hanzi_name) return { type: 'hanzi', value: herb.hanzi_name, italic: false };
                                  return null;
                                })
                                .filter(Boolean);
                              
                              if (activeNames.length === 0) {
                                return <div className="font-medium text-gray-900 text-[16px]">{herb.pinyin_name}</div>;
                              }
                              
                              return activeNames.map((name, idx) => (
                                <div
                                  key={idx}
                                  className={`${idx === 0 ? 'font-medium text-gray-900 text-[16px] flex items-center gap-2' : 'text-sm text-gray-600'} ${name!.italic ? 'italic' : ''}`}
                                >
                                  <span className={name!.type === 'hanzi' ? 'font-hanzi' : ''}>{name!.value}</span>
                                  {idx === 0 && isHerbFavorite(herb.herb_id) && (
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  )}
                                  {idx === 0 && isHerbBanned(herb) && (
                                    <Ban className="w-4 h-4 text-red-600" />
                                  )}
                                </div>
                              ));
                            })()}
                          </div>
                          
                          {/* Info Icon + Add Button */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                modalNav.reset({ name: herb.pinyin_name, type: 'herb' });
                              }}
                              className="hidden sm:flex p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                              title="View details"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addHerb(herb.pinyin_name);
                              }}
                              className="chip-compact flex items-center gap-1 px-2.5 py-1.5 bg-[#30B852] text-white rounded-full hover:bg-[#28A045] transition-colors text-sm font-medium"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <Leaf className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Desktop: original pattern */}
              <div className="hidden lg:block divide-y divide-gray-200 border-b border-gray-200">
                {filteredHerbs.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No herbs found</p>
                ) : (
                  filteredHerbs.map(herb => {
                    const warnings = getHerbWarnings(herb.pinyin_name);
                    return (
                      <div
                        key={herb.herb_id}
                        onClick={() => {
                          modalNav.reset({ name: herb.pinyin_name, type: 'herb' });
                        }}
                        className={`group bg-white hover:bg-gray-50 transition-colors relative border-l-4 cursor-pointer ${herbDisplayOptions.showNatureIndicator ? getNatureBorderColor(herb.nature) : 'border-l-transparent'}`}
                      >
                        <div className="px-4 py-3 flex items-center gap-3">
                          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                            {(() => {
                              // Get active names in configured order
                              const activeNames = (herbDisplayOptions?.order || [])
                                .filter(nameType => herbDisplayOptions?.[nameType])
                                .map(nameType => {
                                  if (nameType === 'pinyin') return { type: 'pinyin', value: herb.pinyin_name, italic: false };
                                  if (nameType === 'latin' && herb.pharmaceutical_name) return { type: 'latin', value: herb.pharmaceutical_name, italic: false };
                                  if (nameType === 'hanzi' && herb.hanzi_name) return { type: 'hanzi', value: herb.hanzi_name, italic: false };
                                  return null;
                                })
                                .filter(Boolean);
                              
                              if (activeNames.length === 0) {
                                return <div className="font-medium text-gray-900 text-[16px]">{herb.pinyin_name}</div>;
                              }
                              
                              return activeNames.map((name, idx) => (
                                <div
                                  key={idx}
                                  className={`${idx === 0 ? 'font-medium text-gray-900 text-[16px] flex items-center gap-2' : 'text-sm text-gray-600'} ${name!.italic ? 'italic' : ''}`}
                                >
                                  <span className={name!.type === 'hanzi' ? 'font-hanzi' : ''}>{name!.value}</span>
                                  {idx === 0 && isHerbFavorite(herb.herb_id) && (
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  )}
                                  {idx === 0 && isHerbBanned(herb) && (
                                    <Ban className="w-4 h-4 text-red-600" />
                                  )}
                                </div>
                              ));
                            })()}
                          </div>
                          
                          {/* Add Button */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addHerb(herb.pinyin_name);
                              }}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#30B852] text-white rounded-full hover:bg-[#28A045] transition-colors text-sm font-medium"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <Leaf className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : activeTab === 'formulas' ? (
            <div className="lg:divide-y lg:divide-gray-200">
              {/* Mobile: rounded corners pattern */}
              <div className="lg:hidden divide-y divide-gray-200 border-b border-gray-200">
                {filteredFormulas.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 px-4">
                    <p className="mb-2">No formulas found</p>
                    {clinicalUseFilters?.condition && (
                      <p className="text-xs text-gray-400">
                        {clinicalUseFilters.pattern 
                          ? `Try selecting a different pattern for "${clinicalUseFilters.condition}"`
                          : `No formulas available for "${clinicalUseFilters.condition}"`
                        }
                      </p>
                    )}
                  </div>
                ) : (
                  filteredFormulas.map(formula => (
                    <div
                      key={formula.formula_id}
                      className={`group bg-white hover:bg-gray-50 transition-colors border-l-4 ${formulaDisplayOptions.showThermalActionIndicator ? getThermalActionBorderColor(formula.thermal_action) : 'border-l-transparent'} lg:cursor-default cursor-pointer`}
                      onClick={() => {
                        modalNav.reset({ name: formula.pinyin_name, type: 'formula' });
                      }}
                    >
                      <div className="px-4 py-3 flex items-center gap-3">
                        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                          {(() => {
                            // Get active names in configured order
                            const activeNames = (formulaDisplayOptions?.order || [])
                              .filter(nameType => formulaDisplayOptions?.[nameType])
                              .map(nameType => {
                                if (nameType === 'pinyin') return { type: 'pinyin', value: formula.pinyin_name, italic: false };
                                if (nameType === 'pharmaceutical' && formula.translated_name) return { type: 'pharmaceutical', value: formula.translated_name, italic: false };
                                if (nameType === 'hanzi' && formula.hanzi_name) return { type: 'hanzi', value: formula.hanzi_name, italic: false };
                                return null;
                              })
                              .filter(Boolean);
                            
                            if (activeNames.length === 0) {
                              return <div className="font-medium text-gray-900 text-[16px]">{formula.pinyin_name}</div>;
                            }
                            
                            return activeNames.map((name, idx) => (
                              <div
                                key={idx}
                                className={`${idx === 0 ? 'font-medium text-gray-900 text-[16px] flex items-center gap-2' : 'text-sm text-gray-600'} ${name!.italic ? 'italic' : ''}`}
                              >
                                <span className={name!.type === 'hanzi' ? 'font-hanzi' : ''}>{name!.value}</span>
                                {idx === 0 && isFormulaFavorite(formula.formula_id) && (
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                )}
                              </div>
                            ));
                          })()}
                        </div>
                        
                        {/* Info Icon + Action Buttons */}
                        <div className="flex gap-1.5 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              modalNav.reset({ name: formula.pinyin_name, type: 'formula' });
                            }}
                            className="hidden sm:flex p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                            title="View details"
                          >
                            <Info className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openFormulaModal(formula.pinyin_name);
                            }}
                            className="chip-compact flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors text-sm font-medium"
                            title="Add as compound"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <Pill className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openComponentsModal(formula.pinyin_name);
                            }}
                            className="chip-compact flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-[#30B852] text-white rounded-full hover:bg-[#28A045] transition-colors text-sm font-medium"
                            title="Add as components"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <Leaf className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop: original pattern */}
              <div className="hidden lg:block">
                {filteredFormulas.length === 0 ? (
                  <div className="text-center text-gray-500 py-8 px-4">
                    <p className="mb-2">No formulas found</p>
                    {clinicalUseFilters?.condition && (
                      <p className="text-xs text-gray-400">
                        {clinicalUseFilters.pattern 
                          ? `Try selecting a different pattern for "${clinicalUseFilters.condition}"`
                          : `No formulas available for "${clinicalUseFilters.condition}"`
                        }
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 border-b border-gray-200">
                    {filteredFormulas.map(formula => (
                      <div
                        key={formula.formula_id}
                        onClick={() => {
                          modalNav.reset({ name: formula.pinyin_name, type: 'formula' });
                        }}
                        className={`group bg-white hover:bg-gray-50 transition-colors border-l-4 cursor-pointer ${formulaDisplayOptions.showThermalActionIndicator ? getThermalActionBorderColor(formula.thermal_action) : 'border-l-transparent'}`}
                      >
                        <div className="px-4 py-3 flex items-center gap-3">
                          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                            {(() => {
                              // Get active names in configured order
                              const activeNames = (formulaDisplayOptions?.order || [])
                                .filter(nameType => formulaDisplayOptions?.[nameType])
                                .map(nameType => {
                                  if (nameType === 'pinyin') return { type: 'pinyin', value: formula.pinyin_name, italic: false };
                                  if (nameType === 'pharmaceutical' && formula.translated_name) return { type: 'pharmaceutical', value: formula.translated_name, italic: false };
                                  if (nameType === 'hanzi' && formula.hanzi_name) return { type: 'hanzi', value: formula.hanzi_name, italic: false };
                                  return null;
                                })
                                .filter(Boolean);
                              
                              if (activeNames.length === 0) {
                                return <div className="font-medium text-gray-900 text-[16px]">{formula.pinyin_name}</div>;
                              }
                              
                              return activeNames.map((name, idx) => (
                                <div
                                  key={idx}
                                  className={`${idx === 0 ? 'font-medium text-gray-900 text-[16px] flex items-center gap-2' : 'text-sm text-gray-600'} ${name!.italic ? 'italic' : ''}`}
                                >
                                  <span className={name!.type === 'hanzi' ? 'font-hanzi' : ''}>{name!.value}</span>
                                  {idx === 0 && isFormulaFavorite(formula.formula_id) && (
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  )}
                                </div>
                              ));
                            })()}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openFormulaModal(formula.pinyin_name);
                              }}
                              className="chip-compact flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors text-xs font-medium"
                              title="Add as compound"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <Pill className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openComponentsModal(formula.pinyin_name);
                              }}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-[#30B852] text-white rounded-full hover:bg-[#28A045] transition-colors text-sm font-medium"
                              title="Add as components"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <Leaf className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="lg:divide-y lg:divide-gray-200">
              {/* Mobile: ALL view */}
              {/* Mobile: ALL view */}
              <div className="lg:hidden divide-y divide-gray-200 border-b border-gray-200">
                {combinedItems.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No items found</p>
                ) : (
                  combinedItems.map(item => {
                    if (item.type === 'herb') {
                      const herb = item.data;
                      const warnings = getHerbWarnings(herb.pinyin_name);
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            modalNav.reset({ name: herb.pinyin_name, type: 'herb' });
                          }}
                          className={`group bg-white active:bg-gray-100 transition-colors border-l-4 cursor-pointer ${herbDisplayOptions.showThermalActionIndicator ? getNatureBorderColor(herb.nature) : 'border-l-transparent'}`}
                        >
                          <div className="px-4 py-3 flex items-center gap-3">
                            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                              {(() => {
                                const activeNames = (herbDisplayOptions?.order || [])
                                  .filter(nameType => herbDisplayOptions?.[nameType])
                                  .map(nameType => {
                                    if (nameType === 'pinyin') return { type: 'pinyin', value: herb.pinyin_name, italic: false };
                                    if (nameType === 'pharmaceutical' && herb.pharmaceutical_name) return { type: 'pharmaceutical', value: herb.pharmaceutical_name, italic: true };
                                    if (nameType === 'hanzi' && herb.hanzi_name) return { type: 'hanzi', value: herb.hanzi_name, italic: false };
                                    return null;
                                  })
                                  .filter(Boolean);
                                
                                if (activeNames.length === 0) {
                                  return <div className="font-medium text-gray-900 text-[16px]">{herb.pinyin_name}</div>;
                                }
                                
                                return activeNames.map((name, idx) => (
                                  <div
                                    key={idx}
                                    className={`${idx === 0 ? 'font-medium text-gray-900 text-[16px] flex items-center gap-2' : 'text-sm text-gray-600'} ${name!.italic ? 'italic' : ''}`}
                                  >
                                    <span className={name!.type === 'hanzi' ? 'font-hanzi' : ''}>{name!.value}</span>
                                    {idx === 0 && isHerbFavorite(herb.herb_id) && (
                                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    )}
                                    {idx === 0 && isHerbBanned(herb) && (
                                      <Ban className="w-4 h-4 text-red-600" />
                                    )}
                                  </div>
                                ));
                              })()}
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addHerb(herb.pinyin_name);
                                }}
                                className="chip-compact flex items-center gap-1 px-2.5 py-1.5 bg-[#30B852] text-white rounded-full active:bg-[#28A045] transition-colors text-sm font-medium"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <Leaf className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      const formula = item.data;
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            modalNav.reset({ name: formula.pinyin_name, type: 'formula' });
                          }}
                          className={`group bg-white active:bg-gray-100 transition-colors border-l-4 cursor-pointer ${formulaDisplayOptions.showThermalActionIndicator ? getThermalActionBorderColor(formula.thermal_action) : 'border-l-transparent'}`}
                        >
                          <div className="px-4 py-3 flex items-center gap-3">
                            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                              {(() => {
                                const activeNames = (formulaDisplayOptions?.order || [])
                                  .filter(nameType => formulaDisplayOptions?.[nameType])
                                  .map(nameType => {
                                    if (nameType === 'pinyin') return { type: 'pinyin', value: formula.pinyin_name, italic: false };
                                    if (nameType === 'pharmaceutical' && formula.translated_name) return { type: 'pharmaceutical', value: formula.translated_name, italic: false };
                                    if (nameType === 'hanzi' && formula.hanzi_name) return { type: 'hanzi', value: formula.hanzi_name, italic: false };
                                    return null;
                                  })
                                  .filter(Boolean);
                                
                                if (activeNames.length === 0) {
                                  return <div className="font-medium text-gray-900 text-[16px]">{formula.pinyin_name}</div>;
                                }
                                
                                return activeNames.map((name, idx) => (
                                  <div
                                    key={idx}
                                    className={`${idx === 0 ? 'font-medium text-gray-900 text-[16px] flex items-center gap-2' : 'text-sm text-gray-600'} ${name!.italic ? 'italic' : ''}`}
                                  >
                                    <span className={name!.type === 'hanzi' ? 'font-hanzi' : ''}>{name!.value}</span>
                                    {idx === 0 && isFormulaFavorite(formula.formula_id) && (
                                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    )}
                                  </div>
                                ));
                              })()}
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openFormulaModal(formula.pinyin_name);
                                }}
                                className="chip-compact flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 text-white rounded-full active:bg-amber-600 transition-colors text-sm font-medium"
                                title="Add as compound"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <Pill className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openComponentsModal(formula.pinyin_name);
                                }}
                                className="chip-compact flex items-center gap-1 px-2.5 py-1.5 bg-[#30B852] text-white rounded-full active:bg-[#28A045] transition-colors text-sm font-medium"
                                title="Add as components"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <Leaf className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })
                )}
              </div>

              {/* Desktop: ALL view */}
              <div className="hidden lg:block divide-y divide-gray-200 border-b border-gray-200">
                {combinedItems.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No items found</p>
                ) : (
                  combinedItems.map(item => {
                    if (item.type === 'herb') {
                      const herb = item.data;
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            modalNav.reset({ name: herb.pinyin_name, type: 'herb' });
                          }}
                          className={`group bg-white hover:bg-gray-50 transition-colors border-l-4 cursor-pointer ${herbDisplayOptions.showThermalActionIndicator ? getNatureBorderColor(herb.nature) : 'border-l-transparent'}`}
                        >
                          <div className="px-4 py-3 flex items-center gap-3">
                            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                              {(() => {
                                const activeNames = (herbDisplayOptions?.order || [])
                                  .filter(nameType => herbDisplayOptions?.[nameType])
                                  .map(nameType => {
                                    if (nameType === 'pinyin') return { type: 'pinyin', value: herb.pinyin_name, italic: false };
                                    if (nameType === 'pharmaceutical' && herb.pharmaceutical_name) return { type: 'pharmaceutical', value: herb.pharmaceutical_name, italic: true };
                                    if (nameType === 'hanzi' && herb.hanzi_name) return { type: 'hanzi', value: herb.hanzi_name, italic: false };
                                    return null;
                                  })
                                  .filter(Boolean);
                                
                                if (activeNames.length === 0) {
                                  return <div className="font-medium text-gray-900 text-[16px]">{herb.pinyin_name}</div>;
                                }
                                
                                return activeNames.map((name, idx) => (
                                  <div
                                    key={idx}
                                    className={`${idx === 0 ? 'font-medium text-gray-900 text-[16px] flex items-center gap-2' : 'text-sm text-gray-600'} ${name!.italic ? 'italic' : ''}`}
                                  >
                                    <span className={name!.type === 'hanzi' ? 'font-hanzi' : ''}>{name!.value}</span>
                                    {idx === 0 && isHerbFavorite(herb.herb_id) && (
                                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    )}
                                    {idx === 0 && isHerbBanned(herb) && (
                                      <Ban className="w-4 h-4 text-red-600" />
                                    )}
                                  </div>
                                ));
                              })()}
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addHerb(herb.pinyin_name);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#30B852] text-white rounded-full hover:bg-[#28A045] transition-colors text-sm font-medium"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <Leaf className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      const formula = item.data;
                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            modalNav.reset({ name: formula.pinyin_name, type: 'formula' });
                          }}
                          className={`group bg-white hover:bg-gray-50 transition-colors border-l-4 cursor-pointer ${formulaDisplayOptions.showThermalActionIndicator ? getThermalActionBorderColor(formula.thermal_action) : 'border-l-transparent'}`}
                        >
                          <div className="px-4 py-3 flex items-center gap-3">
                            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                              {(() => {
                                const activeNames = (formulaDisplayOptions?.order || [])
                                  .filter(nameType => formulaDisplayOptions?.[nameType])
                                  .map(nameType => {
                                    if (nameType === 'pinyin') return { type: 'pinyin', value: formula.pinyin_name, italic: false };
                                    if (nameType === 'pharmaceutical' && formula.translated_name) return { type: 'pharmaceutical', value: formula.translated_name, italic: false };
                                    if (nameType === 'hanzi' && formula.hanzi_name) return { type: 'hanzi', value: formula.hanzi_name, italic: false };
                                    return null;
                                  })
                                  .filter(Boolean);
                                
                                if (activeNames.length === 0) {
                                  return <div className="font-medium text-gray-900 text-[16px]">{formula.pinyin_name}</div>;
                                }
                                
                                return activeNames.map((name, idx) => (
                                  <div
                                    key={idx}
                                    className={`${idx === 0 ? 'font-medium text-gray-900 text-[16px] flex items-center gap-2' : 'text-sm text-gray-600'} ${name!.italic ? 'italic' : ''}`}
                                  >
                                    <span className={name!.type === 'hanzi' ? 'font-hanzi' : ''}>{name!.value}</span>
                                    {idx === 0 && isFormulaFavorite(formula.formula_id) && (
                                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    )}
                                  </div>
                                ));
                              })()}
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openFormulaModal(formula.pinyin_name);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 text-white rounded-full hover:bg-amber-600 transition-colors text-sm font-medium"
                                title="Add as compound"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <Pill className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openComponentsModal(formula.pinyin_name);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-[#30B852] text-white rounded-full hover:bg-[#28A045] transition-colors text-sm font-medium"
                                title="Add as components"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <Leaf className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Module 3: Prescription Builder */}
      <div className="lg:flex-1 bg-white rounded-lg border border-gray-200 flex flex-col overflow-hidden">
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 sm:py-6 border-b border-gray-200 relative">
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Prescription Builder</h2>
          </div>
          <input
            type="text"
            value={formulaName}
            onChange={(e) => setFormulaName(e.target.value)}
            className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${formulaName ? 'bg-white placeholder:text-gray-400' : 'bg-teal-50 placeholder:text-teal-600'}`}
            placeholder="Formula name"
            required
          />
        </div>

        <div className="flex-1 lg:overflow-y-auto px-4 sm:px-6 py-4 lg:max-h-none">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Selected components</h3>
            {selectedComponents && selectedComponents.length > 0 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedComponents([]);
                }}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
              >
                Clear
              </span>
            )}
          </div>
          
          {!selectedComponents || selectedComponents.length === 0 ? (
            <p className="text-sm text-gray-500 italic">No components added yet</p>
          ) : (
            <div className="space-y-2">
              {selectedComponents.map(comp => {
                const herb = comp.type === 'herb' ? getAllHerbs().find(h => h.pinyin_name === comp.name) : null;
                const formula = comp.type === 'formula' ? getAllFormulas().find(f => f.pinyin_name === comp.name) : null;
                
                // Check if this herb has conflicts
                const herbConflicts = comp.type === 'herb' ? getHerbConflicts(comp.name) : { hasConflict: false, conflictWith: [] };
                
                return (
                <div key={comp.tempId}>
                  {/* Main component */}
                  <div 
                    id={`component-${comp.tempId}`}
                    className={`bg-gray-50 rounded-lg p-3 border border-gray-200 ${herbConflicts.hasConflict ? 'ring-2 ring-red-500' : ''} ${highlightedComponent === comp.tempId ? 'ring-4 ring-teal-400 transition-all duration-300' : ''}`}
                  >
                    {/* Top row: name and controls */}
                    <div className="flex items-center justify-between gap-3">
                    {/* Left zone: Component name */}
                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      {(() => {
                        if (comp.type === 'herb') {
                          // Get active names in configured order
                          const activeNames = (builderDisplayOptions?.herbs?.order || [])
                            .filter(nameType => builderDisplayOptions?.herbs?.[nameType])
                            .map(nameType => {
                              if (nameType === 'pinyin') return { type: 'pinyin', value: comp.name, italic: false };
                              if (nameType === 'latin' && herb?.pharmaceutical_name) return { type: 'latin', value: herb.pharmaceutical_name, italic: false };
                              if (nameType === 'hanzi' && herb?.hanzi_name) return { type: 'hanzi', value: herb.hanzi_name, italic: false };
                              return null;
                            })
                            .filter(Boolean);
                          
                          if (activeNames.length === 0) {
                            return (
                              <span className="font-medium text-gray-900 text-base lg:text-sm flex items-center gap-1">
                                <span>{comp.name}</span>
                                {hasPregnancyWarning(comp.name) && (
                                  <span className="text-amber-600" title="Pregnancy warning">⚠️</span>
                                )}
                              </span>
                            );
                          }
                          
                          return (
                            <>
                              <span className="font-medium text-gray-900 text-base lg:text-sm flex items-center gap-1">
                                <span className="text-[16px]">{activeNames[0]!.italic ? <em>{activeNames[0]!.value}</em> : activeNames[0]!.value}</span>
                                {hasPregnancyWarning(comp.name) && (
                                  <span className="text-amber-600" title="Pregnancy warning">⚠️</span>
                                )}
                              </span>
                              {activeNames.slice(1).map((name, idx) => (
                                <span key={idx} className={`text-gray-500 ${name!.italic ? 'italic' : ''} text-[14px]`}>
                                  {name!.value}
                                </span>
                              ))}
                            </>
                          );
                        } else if (comp.type === 'formula') {
                          // Get active names in configured order
                          const activeNames = (builderDisplayOptions?.formulas?.order || [])
                            .filter(nameType => builderDisplayOptions?.formulas?.[nameType])
                            .map(nameType => {
                              if (nameType === 'pinyin') return { type: 'pinyin', value: comp.name };
                              if (nameType === 'pharmaceutical' && formula?.translated_name) return { type: 'pharmaceutical', value: formula.translated_name };
                              if (nameType === 'hanzi' && formula?.hanzi_name) return { type: 'hanzi', value: formula.hanzi_name };
                              return null;
                            })
                            .filter(Boolean);
                          
                          if (activeNames.length === 0) {
                            return (
                              <span className="font-medium text-gray-900 text-base lg:text-sm flex items-center gap-1">
                                <span>{comp.name}</span>
                                {formulaHasPregnancyWarning(comp.name) && (
                                  <span className="text-amber-600" title="Pregnancy warning">⚠️</span>
                                )}
                              </span>
                            );
                          }
                          
                          return (
                            <>
                              <span className="font-medium text-gray-900 text-base lg:text-sm flex items-center gap-1">
                                <span className="text-[16px]">{activeNames[0]!.value}</span>
                                {formulaHasPregnancyWarning(comp.name) && (
                                  <span className="text-amber-600" title="Pregnancy warning">⚠️</span>
                                )}
                              </span>
                              {activeNames.slice(1).map((name, idx) => (
                                <span key={idx} className="text-sm lg:text-xs text-gray-500">
                                  {name!.value}
                                </span>
                              ))}
                            </>
                          );
                        }
                        
                        return <span className="font-medium text-gray-900 text-base lg:text-sm">{comp.name}</span>;
                      })()}
                    </div>
                    
                    {/* Right zone: Controls (integrated dosage box + g + delete button) */}
                    <div className="flex items-center gap-1.5">
                      {/* Integrated dosage control box */}
                      <div className="flex items-center border border-gray-300 rounded overflow-hidden focus-within:ring-1 focus-within:ring-teal-500">
                        {/* Dosage input */}
                        <input
                          type="text"
                          value={comp.dosage.replace(/[^0-9.]/g, '')}
                          onChange={(e) => {
                            const numValue = e.target.value.replace(/[^0-9.]/g, '');
                            updateDosage(comp.tempId, numValue ? `${numValue}g` : '0g');
                          }}
                          className="w-12 px-2 py-1 text-sm text-center border-none focus:outline-none"
                          placeholder="10"
                        />
                        
                        {/* Arrow buttons stacked vertically (mobile and desktop) */}
                        <div className="flex flex-col border-l border-gray-300">
                          <button
                            onClick={() => incrementDosage(comp.tempId)}
                            className="px-2 py-1 lg:px-1.5 lg:py-0.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors flex items-center justify-center"
                            aria-label="Increase dosage"
                          >
                            <ChevronUp className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                          </button>
                          <div className="h-px bg-gray-300"></div>
                          <button
                            onClick={() => decrementDosage(comp.tempId)}
                            className="px-2 py-1 lg:px-1.5 lg:py-0.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors flex items-center justify-center"
                            aria-label="Decrease dosage"
                          >
                            <ChevronDown className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Unit (g) */}
                      <span className="text-sm text-gray-600">g</span>
                      
                      {/* Delete button */}
                      <button
                        onClick={() => removeComponent(comp.tempId)}
                        className="p-0 lg:p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors flex-shrink-0 ml-0.5 inline-flex items-center justify-center w-4 h-4 lg:w-auto lg:h-auto"
                        aria-label="Remove component"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    </div>
                    
                    {/* Subcomponents (for compound formulas) - now inside the main box */}
                    {comp.type === 'formula' && comp.subComponents && (comp.subComponents?.length || 0) > 0 && builderDisplayOptions?.formulas?.ingredients && (
                      <div className="mt-3 space-y-1 pl-3">
                      {(comp.subComponents || []).map((sub, idx) => {
                        const subHerb = getAllHerbs().find(h => h.pinyin_name === sub?.name);
                        const isBanned = subHerb ? isHerbBanned(subHerb) : false;
                        const subHerbConflicts = getHerbConflicts(sub?.name || '');
                        return (
                          <div key={`${comp.tempId}-${subHerb?.herb_id || sub?.name}-${idx}`} className={`bg-transparent pl-3 py-1.5 text-xs text-gray-600 flex items-center gap-3 ${subHerbConflicts.hasConflict ? 'ring-2 ring-red-500' : ''}`}>
                            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                              {(() => {
                                // Get active names in configured order
                                const activeNames = (builderDisplayOptions?.herbs?.order || [])
                                  .filter(nameType => builderDisplayOptions?.herbs?.[nameType])
                                  .map(nameType => {
                                    if (nameType === 'pinyin') return { type: 'pinyin', value: sub?.name, italic: false };
                                    if (nameType === 'latin' && subHerb?.pharmaceutical_name) return { type: 'latin', value: subHerb.pharmaceutical_name, italic: false };
                                    if (nameType === 'hanzi' && subHerb?.hanzi_name) return { type: 'hanzi', value: subHerb.hanzi_name, italic: false };
                                    return null;
                                  })
                                  .filter(Boolean);
                                
                                if (activeNames.length === 0) {
                                  return (
                                    <div className="flex items-center gap-1.5">
                                      <span className="flex-shrink-0">{sub?.name}</span>
                                      {hasPregnancyWarning(sub?.name || '') && (
                                        <span className="text-amber-600 text-xs" title="Pregnancy warning">⚠️</span>
                                      )}
                                      {isBanned && (
                                        <Ban className="w-3 h-3 text-red-600 flex-shrink-0" />
                                      )}
                                    </div>
                                  );
                                }
                                
                                return (
                                  <>
                                    <div className="flex items-center gap-1.5">
                                      <span className="flex-shrink-0">
                                        {activeNames[0]!.italic ? <em>{activeNames[0]!.value}</em> : activeNames[0]!.value}
                                      </span>
                                      {hasPregnancyWarning(sub.name) && (
                                        <span className="text-amber-600 text-xs" title="Pregnancy warning">⚠️</span>
                                      )}
                                      {isBanned && (
                                        <Ban className="w-3 h-3 text-red-600 flex-shrink-0" />
                                      )}
                                    </div>
                                    {activeNames.length > 1 && (
                                      <div className="flex items-baseline gap-2 flex-wrap">
                                        {activeNames.slice(1).map((name, idx) => (
                                          <span key={idx} className={`text-gray-400 ${name!.italic ? 'italic' : ''}`}>
                                            {name!.value}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                            <span className="text-gray-500 w-12 text-center">{sub.dosage}</span>
                          </div>
                        );
                      })}
                      </div>
                    )}
                  </div>
                </div>
              );
              })}
            </div>
          )}

          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Comments</h3>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-y h-20 lg:h-auto"
              rows={4}
              placeholder="Clinical notes..."
            />
          </div>

          {/* Active Safety Filters Section */}
          {Object.values(patientSafetyProfile).some(v => v) && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-3">Active Safety Filters</h3>
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(patientSafetyProfile).map(([key, value]) => 
                    value ? (
                      <div key={key} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                        <span className="capitalize">{key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}</span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Safety Display Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Safety Display</h3>
              
              {/* Toggle Filtered/All */}
              <div className="inline-flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => setAlertMode('filtered')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    alertMode === 'filtered'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Filtered
                </button>
                <button
                  onClick={() => setAlertMode('all')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    alertMode === 'all'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  All
                </button>
              </div>
            </div>

            {/* Safety Alerts */}
            {(safetyAlerts.toxic.length > 0 || safetyAlerts.contraindication.length > 0 || safetyAlerts.caution.length > 0 || safetyAlerts.interaction.length > 0 || safetyAlerts.antagonism.length > 0 || safetyAlerts.incompatibility.length > 0 || safetyAlerts.pregnancy.length > 0) && (
              <div className="space-y-4">
                {safetyAlerts.toxic.length > 0 && (
                  <AlertCard
                    key="toxic"
                    type="toxic"
                    title="Toxic"
                    items={safetyAlerts.toxic}
                  />
                )}
                {safetyAlerts.antagonism.length > 0 && (
                  <AlertCard
                    key="antagonism"
                    type="antagonism"
                    title="Antagonisms"
                    items={safetyAlerts.antagonism}
                  />
                )}
                {safetyAlerts.incompatibility.length > 0 && (
                  <AlertCard
                    key="incompatibility"
                    type="incompatibility"
                    title="Incompatibilities"
                    items={safetyAlerts.incompatibility}
                  />
                )}
                {safetyAlerts.pregnancy.length > 0 && (
                  <AlertCard
                    key="pregnancy"
                    type="caution"
                    title="Pregnancy"
                    items={safetyAlerts.pregnancy}
                  />
                )}
                {safetyAlerts.contraindication.length > 0 && (
                  <AlertCard
                    key="contraindication"
                    type="contraindication"
                    title="Contraindications"
                    items={safetyAlerts.contraindication}
                  />
                )}
                {safetyAlerts.caution.length > 0 && (
                  <AlertCard
                    key="caution"
                    type="caution"
                    title="Cautions"
                    items={safetyAlerts.caution}
                  />
                )}
                {safetyAlerts.interaction.length > 0 && (
                  <AlertCard
                    key="interaction"
                    type="interaction"
                    title="Interactions"
                    items={safetyAlerts.interaction}
                  />
                )}
              </div>
            )}
            
            {/* Show message when in filtered mode with no filters selected and no critical alerts */}
            {alertMode === 'filtered' && !Object.values(patientSafetyProfile).some(v => v) && 
             safetyAlerts.toxic.length === 0 && safetyAlerts.antagonism.length === 0 && safetyAlerts.incompatibility.length === 0 && (
              <div className="text-sm text-gray-500 italic mt-4">
                No safety filters selected. Select filters in the Patient Safety Profile to see filtered alerts.
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:block p-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            {selectedComponents && selectedComponents.length > 0 && (
              <button
                onClick={() => setShowDiscardModal(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Trash2 className="w-4 h-4" />
                Discard
              </button>
            )}
            <button
              onClick={handleSave}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Module 4: Action Buttons (Mobile Only) */}
      <div className="lg:hidden bg-white rounded-lg border border-gray-200 p-4 mb-[70px] flex gap-2">
        {selectedComponents && selectedComponents.length > 0 && (
          <button
            onClick={() => setShowDiscardModal(true)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Discard
          </button>
        )}
        <button
          onClick={handleSave}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
      </div>

      {/* Discard Confirmation Modal */}
      <Dialog.Root open={showDiscardModal} onOpenChange={setShowDiscardModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md z-50" aria-describedby="discard-description">
            <Dialog.Title className="text-xl font-semibold text-gray-900 mb-2">
              Discard Prescription Draft?
            </Dialog.Title>
            <Dialog.Description id="discard-description" className="text-sm text-gray-600 mb-6">
              Are you sure you want to discard this prescription draft? This action cannot be undone.
            </Dialog.Description>

            <div className="flex gap-3">
              <Dialog.Close className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                Cancel
              </Dialog.Close>
              <button
                onClick={() => {
                  setSelectedComponents([]);
                  setFormulaName('');
                  setComments(globalSettings.prescriptions.defaultCommentary || '');
                  setHasUnsavedChanges(false);
                  localStorage.removeItem(BUILDER_STATE_KEY);
                  setShowDiscardModal(false);
                  toast.success('Draft discarded');
                }}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Discard
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Compound Formula Modal */}
      <Dialog.Root open={showCompoundModal} onOpenChange={setShowCompoundModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md z-50">
            <Dialog.Title className="text-xl font-semibold text-gray-900 mb-4">
              Add as Compound
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-600 mb-4">
              Enter total dosage for <strong>{pendingFormula}</strong>
            </Dialog.Description>

            <input
              type="text"
              value={formulaDosage}
              onChange={(e) => setFormulaDosage(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 mb-6"
              placeholder="30"
              autoFocus
            />

            <div className="flex gap-2">
              <Dialog.Close className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </Dialog.Close>
              <button
                onClick={confirmAddFormula}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Add
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Components Formula Modal */}
      <Dialog.Root open={showComponentsModal} onOpenChange={setShowComponentsModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md z-50">
            <Dialog.Title className="text-xl font-semibold text-gray-900 mb-4">
              Add as Components
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-600 mb-4">
              Enter total dosage for <strong>{pendingFormula}</strong> to distribute proportionally among herbs
            </Dialog.Description>

            <input
              type="text"
              value={formulaDosage}
              onChange={(e) => setFormulaDosage(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 mb-6"
              placeholder="30"
              autoFocus
            />

            <div className="flex gap-2">
              <Dialog.Close className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Cancel
              </Dialog.Close>
              <button
                onClick={confirmAddFormulaAsComponents}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Add
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Pharmacological Effects Modal */}
      <Dialog.Root open={showPharmacologicalModal} onOpenChange={setShowPharmacologicalModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowPharmacologicalModal(false)} />
          <Dialog.Content 
            className="fixed left-0 right-0 bottom-0 top-[10vh] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:w-full sm:max-w-md sm:max-h-[85vh] overflow-hidden z-50 flex flex-col" 
            onPointerDownOutside={() => setShowPharmacologicalModal(false)}
          >
            <Dialog.Title className="sr-only">Select Pharmacological Effects</Dialog.Title>
            <Dialog.Description className="sr-only">Choose pharmacological effects to filter herbs and formulas</Dialog.Description>

            {/* Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setShowPharmacologicalModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900 flex-1 text-center">Pharmacological Effects</h2>
                <button
                  onClick={() => setShowPharmacologicalModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={pharmacologicalSearch}
                  onChange={(e) => setPharmacologicalSearch(e.target.value)}
                  placeholder="Search pharmacological effects..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  autoFocus
                />
              </div>

              {/* Quick actions */}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-600">
                  {pharmacologicalFiltersCount} selected
                </span>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-1">
                {filteredPharmacologicalEffects.map((effect) => {
                  const isSelected = pharmacologicalFilters.includes(effect);

                  return (
                    <label
                      key={effect}
                      className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 transition-colors rounded"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => togglePharmacologicalFilter(effect)}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700">{effect}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-2">
                <button
                  onClick={() => setPharmacologicalFilters([])}
                  disabled={pharmacologicalFilters.length === 0}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors font-medium disabled:opacity-0 disabled:cursor-default"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowPharmacologicalModal(false)}
                  disabled={pharmacologicalFilters.length === 0}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-0 disabled:cursor-default"
                >
                  Apply
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Biological Mechanisms Modal */}
      <Dialog.Root open={showBiologicalModal} onOpenChange={setShowBiologicalModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowBiologicalModal(false)} />
          <Dialog.Content 
            className="fixed left-0 right-0 bottom-0 top-[10vh] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:w-full sm:max-w-md sm:max-h-[85vh] overflow-hidden z-50 flex flex-col" 
            onPointerDownOutside={() => setShowBiologicalModal(false)}
          >
            <Dialog.Title className="sr-only">Select Biological Mechanisms</Dialog.Title>
            <Dialog.Description className="sr-only">Choose biological mechanisms to filter herbs and formulas</Dialog.Description>

            {/* Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setShowBiologicalModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900 flex-1 text-center">Biological Mechanisms</h2>
                <button
                  onClick={() => setShowBiologicalModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={biologicalSearch}
                  onChange={(e) => setBiologicalSearch(e.target.value)}
                  placeholder="Search systems or targets..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  autoFocus
                />
              </div>

              {/* Quick actions */}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-600">
                  {biologicalMechanismsCount} selected
                </span>
                
                {/* View mode toggle */}
                <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setBiologicalViewMode('categories')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      biologicalViewMode === 'categories'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Categories
                  </button>
                  <button
                    onClick={() => setBiologicalViewMode('all')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      biologicalViewMode === 'all'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {biologicalViewMode === 'categories' ? (
                <div className="space-y-2">
                  {(() => {
                    const searchLower = normalizeForSearch(biologicalSearch);
                    const availableTargetActions = getAvailableTargetActions();
                    
                    return Object.entries(availableTargetActions).sort((a, b) => a[0].localeCompare(b[0])).map(([system, targetActions]) => {
                      // Filter target_actions based on search
                      const filteredTargetActions = targetActions.filter(targetAction =>
                        normalizeForSearch(system).includes(searchLower) ||
                        normalizeForSearch(targetAction).includes(searchLower)
                      );

                      if (filteredTargetActions.length === 0) return null;

                      const isSystemExpanded = expandedSystems.includes(system);
                      const systemSelections = biologicalMechanisms[system] || [];
                      const systemCount = systemSelections.length;

                      return (
                        <div key={system} className="border-b border-gray-100 last:border-b-0">
                          {/* System Header - Clean without box */}
                          <div className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors rounded">
                            {/* Checkbox for select all */}
                            <input
                              type="checkbox"
                              checked={systemCount === filteredTargetActions.length && systemCount > 0}
                              ref={(el) => {
                                if (el) {
                                  el.indeterminate = systemCount > 0 && systemCount < filteredTargetActions.length;
                                }
                              }}
                              onChange={() => toggleAllSystemTargets(system, filteredTargetActions)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                              title="Select all target actions in this system"
                            />
                            
                            {/* Expandable header */}
                            <div
                              onClick={() => setExpandedSystems(prev =>
                                prev.includes(system) ? prev.filter(s => s !== system) : [...prev, system]
                              )}
                              className="flex-1 flex items-center justify-between text-left cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900">{system}</span>
                                {systemCount > 0 && (
                                  <span className="inline-flex items-center justify-center min-w-[18px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                    {systemCount}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {isSystemExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <ChevronUp className="w-4 h-4 text-gray-400 transform rotate-180" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Target Actions List - Clean checkbox style */}
                          {isSystemExpanded && (
                            <div className="bg-white">
                              {filteredTargetActions.map((targetAction) => {
                                const isSelected = systemSelections.includes(targetAction);

                                return (
                                  <label
                                    key={targetAction}
                                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 ml-6 transition-colors rounded"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleBiologicalMechanism(system, targetAction)}
                                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                    />
                                    <span className="text-sm text-gray-700">{targetAction}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }).filter(Boolean);
                  })()}

                  {/* No results message */}
                  {(() => {
                    const searchLower = normalizeForSearch(biologicalSearch);
                    const availableTargetActions = getAvailableTargetActions();
                    const hasResults = Object.entries(availableTargetActions).some(([system, targetActions]) =>
                      targetActions.some(targetAction =>
                        normalizeForSearch(system).includes(searchLower) ||
                        normalizeForSearch(targetAction).includes(searchLower)
                      )
                    );
                    
                    return biologicalSearch && !hasResults && (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-xs">No systems or target actions found matching "{biologicalSearch}"</p>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="space-y-1">
                  {(() => {
                    const searchLower = normalizeForSearch(biologicalSearch);
                    const availableTargetActions = getAvailableTargetActions();

                    // Create data array, sort by target_action alphabetically
                    const allTargetActionsData = Object.entries(availableTargetActions)
                      .flatMap(([system, targetActions]) =>
                        targetActions
                          .filter(targetAction =>
                            normalizeForSearch(system).includes(searchLower) ||
                            normalizeForSearch(targetAction).includes(searchLower)
                          )
                          .map(targetAction => ({
                            system,
                            targetAction
                          }))
                      )
                      .sort((a, b) => a.targetAction.localeCompare(b.targetAction));

                    // Map to JSX
                    const allTargetActions = allTargetActionsData.map(({ system, targetAction }) => {
                      const systemSelections = biologicalMechanisms[system] || [];
                      const isSelected = systemSelections.includes(targetAction);

                      return (
                        <label
                          key={`${system}-${targetAction}`}
                          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleBiologicalMechanism(system, targetAction)}
                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                          />
                          <span className="text-sm text-gray-700">{targetAction}</span>
                        </label>
                      );
                    });

                    return allTargetActions.length > 0 ? (
                      allTargetActions
                    ) : biologicalSearch ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-xs">No systems or target actions found matching "{biologicalSearch}"</p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-2">
                <button
                  onClick={() => setBiologicalMechanisms({})}
                  disabled={biologicalMechanismsCount === 0}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors font-medium disabled:opacity-0 disabled:cursor-default"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowBiologicalModal(false)}
                  disabled={biologicalMechanismsCount === 0}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-0 disabled:cursor-default"
                >
                  Apply
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Bioactive Compounds Modal */}
      <Dialog.Root open={showBioactiveCompoundsModal} onOpenChange={setShowBioactiveCompoundsModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowBioactiveCompoundsModal(false)} />
          <Dialog.Content
            className="fixed left-0 right-0 bottom-0 top-[10vh] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:w-full sm:max-w-md sm:max-h-[85vh] overflow-hidden z-50 flex flex-col"
            onPointerDownOutside={() => setShowBioactiveCompoundsModal(false)}
          >
            <Dialog.Title className="sr-only">Select Bioactive Compounds</Dialog.Title>
            <Dialog.Description className="sr-only">Choose bioactive compounds to filter herbs and formulas</Dialog.Description>

            {/* Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setShowBioactiveCompoundsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900 flex-1 text-center">Bioactive Compounds</h2>
                <button
                  onClick={() => setShowBioactiveCompoundsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={bioactiveCompoundsSearch}
                  onChange={(e) => setBioactiveCompoundsSearch(e.target.value)}
                  placeholder="Search compounds or classes..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  autoFocus
                />
              </div>

              {/* Quick actions */}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-600">
                  {bioactiveCompoundsCount} selected
                </span>

                {/* View mode toggle */}
                <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setBioactiveCompoundsViewMode('categories')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      bioactiveCompoundsViewMode === 'categories'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Categories
                  </button>
                  <button
                    onClick={() => setBioactiveCompoundsViewMode('all')}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      bioactiveCompoundsViewMode === 'all'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    All
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {bioactiveCompoundsViewMode === 'categories' ? (
                <div className="space-y-2">
                  {(() => {
                    const searchLower = normalizeForSearch(bioactiveCompoundsSearch);
                    const availableCompounds = getAvailableBioactiveCompounds();

                    return Object.entries(availableCompounds).sort(([a], [b]) => {
                      if (a === 'Uncategorized') return 1;
                      if (b === 'Uncategorized') return -1;
                      return a.localeCompare(b);
                    }).map(([chemicalClass, compounds]) => {
                      // Filter compounds based on search
                      const filteredCompounds = compounds.filter(compound =>
                        normalizeForSearch(chemicalClass).includes(searchLower) ||
                        normalizeForSearch(compound).includes(searchLower)
                      );

                      if (filteredCompounds.length === 0) return null;

                      const isClassExpanded = expandedChemicalClasses.includes(chemicalClass);
                      const classSelections = bioactiveCompounds[chemicalClass] || [];
                      const classCount = classSelections.length;

                      return (
                        <div key={chemicalClass} className="border-b border-gray-100 last:border-b-0">
                          {/* Chemical Class Header - Clean without box */}
                          <div className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors rounded">
                            {/* Checkbox for select all */}
                            <input
                              type="checkbox"
                              checked={classCount === filteredCompounds.length && classCount > 0}
                              ref={(el) => {
                                if (el) {
                                  el.indeterminate = classCount > 0 && classCount < filteredCompounds.length;
                                }
                              }}
                              onChange={() => {
                                if (classCount === filteredCompounds.length) {
                                  // Deselect all
                                  setBioactiveCompounds(prev => {
                                    const newState = { ...prev };
                                    delete newState[chemicalClass];
                                    return newState;
                                  });
                                } else {
                                  // Select all
                                  setBioactiveCompounds(prev => ({
                                    ...prev,
                                    [chemicalClass]: filteredCompounds
                                  }));
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                              title="Select all compounds in this chemical class"
                            />

                            {/* Expandable header */}
                            <div
                              onClick={() => setExpandedChemicalClasses(prev =>
                                prev.includes(chemicalClass) ? prev.filter(c => c !== chemicalClass) : [...prev, chemicalClass]
                              )}
                              className="flex-1 flex items-center justify-between text-left cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-900">{chemicalClass}</span>
                                {classCount > 0 && (
                                  <span className="inline-flex items-center justify-center min-w-[18px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                    {classCount}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {isClassExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <ChevronUp className="w-4 h-4 text-gray-400 transform rotate-180" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Compounds List - Clean checkbox style */}
                          {isClassExpanded && (
                            <div className="bg-white">
                              {filteredCompounds.map((compound) => {
                                const isSelected = classSelections.includes(compound);

                                return (
                                  <label
                                    key={compound}
                                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 ml-6 transition-colors rounded"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {
                                        setBioactiveCompounds(prev => {
                                          const currentSelections = prev[chemicalClass] || [];
                                          const newSelections = isSelected
                                            ? currentSelections.filter(c => c !== compound)
                                            : [...currentSelections, compound];

                                          if (newSelections.length === 0) {
                                            const newState = { ...prev };
                                            delete newState[chemicalClass];
                                            return newState;
                                          }

                                          return {
                                            ...prev,
                                            [chemicalClass]: newSelections
                                          };
                                        });
                                      }}
                                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                    />
                                    <span className="text-sm text-gray-700">{compound}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    }).filter(Boolean);
                  })()}

                  {/* No results message */}
                  {(() => {
                    const searchLower = normalizeForSearch(bioactiveCompoundsSearch);
                    const availableCompounds = getAvailableBioactiveCompounds();
                    const hasResults = Object.entries(availableCompounds).some(([chemicalClass, compounds]) =>
                      compounds.some(compound =>
                        normalizeForSearch(chemicalClass).includes(searchLower) ||
                        normalizeForSearch(compound).includes(searchLower)
                      )
                    );

                    return bioactiveCompoundsSearch && !hasResults && (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-xs">No chemical classes or compounds found matching "{bioactiveCompoundsSearch}"</p>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="space-y-1">
                  {(() => {
                    const searchLower = normalizeForSearch(bioactiveCompoundsSearch);
                    const availableCompounds = getAvailableBioactiveCompounds();

                    // Create data array, sort by compound alphabetically
                    const allCompoundsData = Object.entries(availableCompounds)
                      .flatMap(([chemicalClass, compounds]) =>
                        compounds
                          .filter(compound =>
                            normalizeForSearch(chemicalClass).includes(searchLower) ||
                            normalizeForSearch(compound).includes(searchLower)
                          )
                          .map(compound => ({
                            chemicalClass,
                            compound
                          }))
                      )
                      .sort((a, b) => a.compound.localeCompare(b.compound));

                    // Map to JSX
                    const allCompounds = allCompoundsData.map(({ chemicalClass, compound }) => {
                      const classSelections = bioactiveCompounds[chemicalClass] || [];
                      const isSelected = classSelections.includes(compound);

                      return (
                        <label
                          key={`${chemicalClass}-${compound}`}
                          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setBioactiveCompounds(prev => {
                                const currentSelections = prev[chemicalClass] || [];
                                const newSelections = isSelected
                                  ? currentSelections.filter(c => c !== compound)
                                  : [...currentSelections, compound];

                                if (newSelections.length === 0) {
                                  const newState = { ...prev };
                                  delete newState[chemicalClass];
                                  return newState;
                                }

                                return {
                                  ...prev,
                                  [chemicalClass]: newSelections
                                };
                              });
                            }}
                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                          />
                          <span className="text-sm text-gray-700">{compound}</span>
                        </label>
                      );
                    });

                    return allCompounds.length > 0 ? (
                      allCompounds
                    ) : bioactiveCompoundsSearch ? (
                      <div className="text-center py-8 text-gray-500">
                        <p className="text-xs">No chemical classes or compounds found matching "{bioactiveCompoundsSearch}"</p>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-2">
                <button
                  onClick={() => setBioactiveCompounds({})}
                  disabled={bioactiveCompoundsCount === 0}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors font-medium disabled:opacity-0 disabled:cursor-default"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowBioactiveCompoundsModal(false)}
                  disabled={bioactiveCompoundsCount === 0}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-0 disabled:cursor-default"
                >
                  Apply
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* General Conditions Modal */}
      <GeneralConditionsModal
        isOpen={showGeneralConditionsModal}
        onClose={() => setShowGeneralConditionsModal(false)}
        patientSafetyProfile={patientSafetyProfile}
        onUpdateProfile={setPatientSafetyProfile}
      />

      {/* Medications Modal */}
      <MedicationsModal
        isOpen={showMedicationsModal}
        onClose={() => setShowMedicationsModal(false)}
        patientSafetyProfile={patientSafetyProfile}
        onUpdateProfile={setPatientSafetyProfile}
      />

      {/* Allergies Modal */}
      <AllergiesModal
        isOpen={showAllergiesModal}
        onClose={() => setShowAllergiesModal(false)}
        patientSafetyProfile={patientSafetyProfile}
        onUpdateProfile={setPatientSafetyProfile}
      />

      {/* TCM Risk Patterns Modal */}
      <TcmRiskPatternsModal
        isOpen={showTcmRiskPatternsModal}
        onClose={() => setShowTcmRiskPatternsModal(false)}
        patientSafetyProfile={patientSafetyProfile}
        onUpdateProfile={setPatientSafetyProfile}
      />

      {/* Mobile Filters Modal */}
      <Dialog.Root open={showMobileFilters} onOpenChange={setShowMobileFilters}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] bg-white overflow-hidden z-50 flex flex-col rounded-t-2xl">
            {/* Header */}
            <div className="flex-shrink-0 px-4 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <Dialog.Title className="text-lg font-semibold text-gray-900">
                  Filters
                </Dialog.Title>
                <Dialog.Description className="sr-only">Filter herbs and formulas by category, nature, and other properties</Dialog.Description>
                <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </Dialog.Close>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <div className="space-y-4">
                {/* Herb Filters */}
                <div>
                  <button
                    onClick={() => setMobileExpandedFilters(prev => ({ ...prev, herbFilters: !prev.herbFilters }))}
                    className="flex items-center justify-between w-full text-left mb-3"
                  >
                    <h2 className="text-base font-semibold text-gray-900">Herb Filters</h2>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${mobileExpandedFilters.herbFilters ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {mobileExpandedFilters.herbFilters && (
                    <>
                      {/* Categories */}
                      {uniqueCategories.length > 0 && (
                        <div className="mb-4">
                          <button
                            onClick={() => setMobileExpandedFilters(prev => ({ ...prev, herbCategories: !prev.herbCategories }))}
                            className="flex items-center justify-between w-full text-left mb-3"
                          >
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Categories</h3>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${mobileExpandedFilters.herbCategories ? 'rotate-180' : ''}`} />
                          </button>
                          {mobileExpandedFilters.herbCategories && (
                            <div className="space-y-2.5 max-h-48 overflow-y-auto">
                              {uniqueCategories.map((category) => {
                                const isCategorySelected = categoryFilters.includes(category);
                                const subcategories = getSubcategoriesForCategory(category);

                                return (
                                  <div key={`mobile-herb-category-${category}`}>
                                    <label className="flex items-start gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isCategorySelected}
                                        onChange={() => toggleCategoryFilter(category)}
                                        className="w-4 h-4 flex-shrink-0 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5"
                                      />
                                      <span className="text-sm text-gray-700">{category}</span>
                                    </label>
                                    {isCategorySelected && subcategories.length > 0 && (
                                      <div className="ml-6 mt-2 space-y-2">
                                        {subcategories.map(subcategory => (
                                          <label key={`mobile-herb-subcategory-${subcategory}`} className="flex items-start gap-2 cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={subcategoryFilters.includes(subcategory)}
                                              onChange={() => toggleSubcategoryFilter(subcategory)}
                                              className="w-4 h-4 flex-shrink-0 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5"
                                            />
                                            <span className="text-xs text-gray-600">{subcategory}</span>
                                          </label>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Nature */}
                      {uniqueNatures.length > 0 && (
                        <div className="mb-4">
                          <button
                            onClick={() => setMobileExpandedFilters(prev => ({ ...prev, herbNature: !prev.herbNature }))}
                            className="flex items-center justify-between w-full text-left mb-3"
                          >
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Nature</h3>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${mobileExpandedFilters.herbNature ? 'rotate-180' : ''}`} />
                          </button>
                          {mobileExpandedFilters.herbNature && (
                            <div className="space-y-2.5 max-h-48 overflow-y-auto">
                              {uniqueNatures.map(nature => (
                                <label key={nature} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={natureFilters.includes(nature)}
                                    onChange={() => toggleNatureFilter(nature)}
                                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                  />
                                  <span className="text-sm text-gray-700">{nature}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Flavor */}
                      {uniqueFlavors.length > 0 && (
                        <div className="mb-4">
                          <button
                            onClick={() => setMobileExpandedFilters(prev => ({ ...prev, herbFlavor: !prev.herbFlavor }))}
                            className="flex items-center justify-between w-full text-left mb-3"
                          >
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Flavor</h3>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${mobileExpandedFilters.herbFlavor ? 'rotate-180' : ''}`} />
                          </button>
                          {mobileExpandedFilters.herbFlavor && (
                            <div className="space-y-2.5 max-h-48 overflow-y-auto">
                              {uniqueFlavors.map(flavor => (
                                <label key={flavor} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={flavorFilters.includes(flavor)}
                                    onChange={() => toggleFlavorFilter(flavor)}
                                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                  />
                                  <span className="text-sm text-gray-700">{flavor}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Channels */}
                      {uniqueChannels.length > 0 && (
                        <div className="mb-4">
                          <button
                            onClick={() => setMobileExpandedFilters(prev => ({ ...prev, herbChannels: !prev.herbChannels }))}
                            className="flex items-center justify-between w-full text-left mb-3"
                          >
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Channels</h3>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${mobileExpandedFilters.herbChannels ? 'rotate-180' : ''}`} />
                          </button>
                          {mobileExpandedFilters.herbChannels && (
                            <div className="space-y-2.5 max-h-48 overflow-y-auto">
                              {uniqueChannels.map(channel => (
                                <label key={channel} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={channelFilters.includes(channel)}
                                    onChange={() => toggleChannelFilter(channel)}
                                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                  />
                                  <span className="text-sm text-gray-700">{channel}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Separator */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Formula Filters */}
                <div>
                  <button
                    onClick={() => setMobileExpandedFilters(prev => ({ ...prev, formulaFilters: !prev.formulaFilters }))}
                    className="flex items-center justify-between w-full text-left mb-3"
                  >
                    <h2 className="text-base font-semibold text-gray-900">Formula Filters</h2>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${mobileExpandedFilters.formulaFilters ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {mobileExpandedFilters.formulaFilters && (
                    <>
                      {/* Categories */}
                      {uniqueFormulaCategories.length > 0 && (
                        <div className="mb-4">
                          <button
                            onClick={() => setMobileExpandedFilters(prev => ({ ...prev, formulaCategories: !prev.formulaCategories }))}
                            className="flex items-center justify-between w-full text-left mb-3"
                          >
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Categories</h3>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${mobileExpandedFilters.formulaCategories ? 'rotate-180' : ''}`} />
                          </button>
                          {mobileExpandedFilters.formulaCategories && (
                            <div className="space-y-2.5 max-h-48 overflow-y-auto">
                              {uniqueFormulaCategories.map((category) => {
                                const isCategorySelected = formulaCategoryFilters.includes(category);
                                const subcategories = getSubcategoriesForFormulaCategory(category);

                                return (
                                  <div key={`mobile-formula-category-${category}`}>
                                    <label className="flex items-start gap-2 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isCategorySelected}
                                        onChange={() => toggleFormulaCategoryFilter(category)}
                                        className="w-4 h-4 flex-shrink-0 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5"
                                      />
                                      <span className="text-sm text-gray-700">{category}</span>
                                    </label>
                                    {isCategorySelected && subcategories.length > 0 && (
                                      <div className="ml-6 mt-2 space-y-2">
                                        {subcategories.map(subcategory => (
                                          <label key={`mobile-formula-subcategory-${subcategory}`} className="flex items-start gap-2 cursor-pointer">
                                            <input
                                              type="checkbox"
                                              checked={formulaSubcategoryFilters.includes(subcategory)}
                                              onChange={() => toggleFormulaSubcategoryFilter(subcategory)}
                                              className="w-4 h-4 flex-shrink-0 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5"
                                            />
                                            <span className="text-xs text-gray-600">{subcategory}</span>
                                          </label>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Separator */}
                <div className="border-t border-gray-200 my-4"></div>

                {/* Clinical Use Filters */}
                <div>
                  <button
                    onClick={() => setMobileExpandedFilters(prev => ({ ...prev, clinicalUse: !prev.clinicalUse }))}
                    className="flex items-center justify-between w-full text-left mb-3"
                  >
                    <h2 className="text-base font-semibold text-gray-900">Clinical Use Filters</h2>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${mobileExpandedFilters.clinicalUse ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {mobileExpandedFilters.clinicalUse && (
                    <div className="space-y-3">
                      {/* Clinical Applications */}
                      <div>
                        <button
                          onClick={() => setShowConditionModal(true)}
                          className="flex items-center justify-between w-full text-left px-4 py-2.5 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Clinical Applications</h3>
                          <div className="flex items-center gap-2">
                            {clinicalUseFilters?.condition && (
                              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                {clinicalUseFilters.patterns.length > 0 ? clinicalUseFilters.patterns.length : 1}
                              </span>
                            )}
                            <ChevronDown className="w-4 h-4 text-gray-500 rotate-[-90deg]" />
                          </div>
                        </button>
                      </div>

                    </div>
                  )}
                </div>

                {/* Separator */}
                {(hasFeature('generalConditions') || hasFeature('medications') || hasFeature('allergies') || hasFeature('tcmRiskPatterns')) && (
                  <div className="border-t border-gray-200 my-4"></div>
                )}

                {/* Safety Profile */}
                {(hasFeature('generalConditions') || hasFeature('medications') || hasFeature('allergies') || hasFeature('tcmRiskPatterns')) && (
                <div>
                  <button
                    onClick={() => setMobileExpandedFilters(prev => ({ ...prev, safetyProfile: !prev.safetyProfile }))}
                    className="flex items-center justify-between w-full text-left mb-3"
                  >
                    <h2 className="text-base font-semibold text-gray-900">Safety Profile</h2>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${mobileExpandedFilters.safetyProfile ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {mobileExpandedFilters.safetyProfile && (
                    <div className="space-y-3">
                      {/* General Conditions */}
                      {hasFeature('generalConditions') && (
                      <div>
                        <button
                          onClick={() => setShowGeneralConditionsModal(true)}
                          className="flex items-center justify-between w-full text-left px-4 py-2.5 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">General Conditions</h3>
                          <div className="flex items-center gap-2">
                            {Object.values(patientSafetyProfile).filter((v, i) => i < 7 && v === true).length > 0 && (
                              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                {Object.values(patientSafetyProfile).filter((v, i) => i < 7 && v === true).length}
                              </span>
                            )}
                            <ChevronDown className="w-4 h-4 text-gray-500 rotate-[-90deg]" />
                          </div>
                        </button>
                      </div>
                      )}

                      {/* Medications */}
                      {hasFeature('medications') && (
                      <div>
                        <button
                          onClick={() => setShowMedicationsModal(true)}
                          className="flex items-center justify-between w-full text-left px-4 py-2.5 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Medications</h3>
                          <div className="flex items-center gap-2">
                            {[patientSafetyProfile.anticoagulants, patientSafetyProfile.antihypertensives, patientSafetyProfile.hypoglycemics, patientSafetyProfile.immunosuppressants, patientSafetyProfile.chemotherapy, patientSafetyProfile.antiplatelets, patientSafetyProfile.beta_blockers, patientSafetyProfile.diuretics, patientSafetyProfile.corticosteroids, patientSafetyProfile.sedatives].filter(v => v === true).length > 0 && (
                              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                {[patientSafetyProfile.anticoagulants, patientSafetyProfile.antihypertensives, patientSafetyProfile.hypoglycemics, patientSafetyProfile.immunosuppressants, patientSafetyProfile.chemotherapy, patientSafetyProfile.antiplatelets, patientSafetyProfile.beta_blockers, patientSafetyProfile.diuretics, patientSafetyProfile.corticosteroids, patientSafetyProfile.sedatives].filter(v => v === true).length}
                              </span>
                            )}
                            <ChevronDown className="w-4 h-4 text-gray-500 rotate-[-90deg]" />
                          </div>
                        </button>
                      </div>
                      )}

                      {/* Allergies */}
                      {hasFeature('allergies') && (
                      <div>
                        <button
                          onClick={() => setShowAllergiesModal(true)}
                          className="flex items-center justify-between w-full text-left px-4 py-2.5 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Allergies</h3>
                          <div className="flex items-center gap-2">
                            {[patientSafetyProfile.shellfish, patientSafetyProfile.gluten, patientSafetyProfile.nuts, patientSafetyProfile.dairy, patientSafetyProfile.soy, patientSafetyProfile.asteraceae, patientSafetyProfile.apiaceae].filter(v => v === true).length > 0 && (
                              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                {[patientSafetyProfile.shellfish, patientSafetyProfile.gluten, patientSafetyProfile.nuts, patientSafetyProfile.dairy, patientSafetyProfile.soy, patientSafetyProfile.asteraceae, patientSafetyProfile.apiaceae].filter(v => v === true).length}
                              </span>
                            )}
                            <ChevronDown className="w-4 h-4 text-gray-500 rotate-[-90deg]" />
                          </div>
                        </button>
                      </div>
                      )}

                      {/* TCM Risk Patterns */}
                      {hasFeature('tcmRiskPatterns') && (
                      <div>
                        <button
                          onClick={() => setShowTcmRiskPatternsModal(true)}
                          className="flex items-center justify-between w-full text-left px-4 py-2.5 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">TCM Risk Patterns</h3>
                          <div className="flex items-center gap-2">
                            {[patientSafetyProfile.qi_deficiency, patientSafetyProfile.blood_deficiency, patientSafetyProfile.blood_stasis, patientSafetyProfile.yin_deficiency, patientSafetyProfile.yin_deficiency_heat, patientSafetyProfile.yang_deficiency, patientSafetyProfile.dampness, patientSafetyProfile.phlegm, patientSafetyProfile.heat, patientSafetyProfile.cold, patientSafetyProfile.wind, patientSafetyProfile.internal_wind].filter(v => v === true).length > 0 && (
                              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                {[patientSafetyProfile.qi_deficiency, patientSafetyProfile.blood_deficiency, patientSafetyProfile.blood_stasis, patientSafetyProfile.yin_deficiency, patientSafetyProfile.yin_deficiency_heat, patientSafetyProfile.yang_deficiency, patientSafetyProfile.dampness, patientSafetyProfile.phlegm, patientSafetyProfile.heat, patientSafetyProfile.cold, patientSafetyProfile.wind, patientSafetyProfile.internal_wind].filter(v => v === true).length}
                              </span>
                            )}
                            <ChevronDown className="w-4 h-4 text-gray-500 rotate-[-90deg]" />
                          </div>
                        </button>
                      </div>
                      )}
                    </div>
                  )}
                </div>
                )}

                {/* Separator */}
                {(hasFeature('pharmacologicalEffectsFilter') || hasFeature('biologicalMechanismsFilter')) && (
                  <div className="border-t border-gray-200 my-4"></div>
                )}

                {/* Advanced Filters */}
                {(hasFeature('pharmacologicalEffectsFilter') || hasFeature('biologicalMechanismsFilter')) && (
                <div>
                  <button
                    onClick={() => setMobileExpandedFilters(prev => ({ ...prev, advanced: !prev.advanced }))}
                    className="flex items-center justify-between w-full text-left mb-3"
                  >
                    <h2 className="text-base font-semibold text-gray-900">Advanced Filters</h2>
                    <div className="flex items-center gap-2">
                      {hasActiveAdvancedFilters && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            clearAdvancedFilters();
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.stopPropagation();
                              clearAdvancedFilters();
                            }
                          }}
                          className="text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
                        >
                          Clear
                        </span>
                      )}
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${mobileExpandedFilters.advanced ? 'rotate-180' : ''}`} />
                    </div>
                  </button>
                  
                  {mobileExpandedFilters.advanced && (
                    <div className="space-y-3">
                      {/* Pharmacological Effects */}
                      <div>
                        <button
                          onClick={() => setShowPharmacologicalModal(true)}
                          className="flex items-center justify-between w-full text-left px-4 py-2.5 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pharmacological Effects</h3>
                          <div className="flex items-center gap-2">
                            {pharmacologicalFiltersCount > 0 && (
                              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                {pharmacologicalFiltersCount}
                              </span>
                            )}
                            <ChevronDown className="w-4 h-4 text-gray-500 rotate-[-90deg]" />
                          </div>
                        </button>
                      </div>

                      {/* Biological Mechanisms */}
                      <div>
                        <button
                          onClick={() => setShowBiologicalModal(true)}
                          className="flex items-center justify-between w-full text-left px-4 py-2.5 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Biological Mechanisms</h3>
                          <div className="flex items-center gap-2">
                            {biologicalMechanismsCount > 0 && (
                              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                {biologicalMechanismsCount}
                              </span>
                            )}
                            <ChevronDown className="w-4 h-4 text-gray-500 rotate-[-90deg]" />
                          </div>
                        </button>
                      </div>

                      {/* Bioactive Compounds */}
                      <div>
                        <button
                          onClick={() => setShowBioactiveCompoundsModal(true)}
                          className="flex items-center justify-between w-full text-left px-4 py-2.5 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Bioactive Compounds</h3>
                          <div className="flex items-center gap-2">
                            {bioactiveCompoundsCount > 0 && (
                              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                {bioactiveCompoundsCount}
                              </span>
                            )}
                            <ChevronDown className="w-4 h-4 text-gray-500 rotate-[-90deg]" />
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                )}

                {/* Active Filters Summary */}
                {hasAnyActiveFilter && (
                  <>
                    <div className="border-t border-gray-200 my-4"></div>
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Active Filters</h3>
                      <div className="space-y-3">
                        {/* Herb Filters */}
                        {categoryFilters.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1.5">Categories</p>
                            <div className="flex flex-wrap gap-1.5">
                              {categoryFilters.map(category => (
                                <button
                                  key={category}
                                  onClick={() => toggleCategoryFilter(category)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs hover:bg-teal-100 transition-colors"
                                >
                                  <span>{category}</span>
                                  <X className="w-3 h-3" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {subcategoryFilters.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1.5">Subcategories</p>
                            <div className="flex flex-wrap gap-1.5">
                              {subcategoryFilters.map(subcategory => (
                                <button
                                  key={subcategory}
                                  onClick={() => toggleSubcategoryFilter(subcategory)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs hover:bg-teal-100 transition-colors"
                                >
                                  <span>{subcategory}</span>
                                  <X className="w-3 h-3" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {natureFilters.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1.5">Natures</p>
                            <div className="flex flex-wrap gap-1.5">
                              {natureFilters.map(nature => (
                                <button
                                  key={nature}
                                  onClick={() => toggleNatureFilter(nature)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs hover:bg-teal-100 transition-colors"
                                >
                                  <span>{nature}</span>
                                  <X className="w-3 h-3" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {flavorFilters.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1.5">Flavors</p>
                            <div className="flex flex-wrap gap-1.5">
                              {flavorFilters.map(flavor => (
                                <button
                                  key={flavor}
                                  onClick={() => toggleFlavorFilter(flavor)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs hover:bg-teal-100 transition-colors"
                                >
                                  <span>{flavor}</span>
                                  <X className="w-3 h-3" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {channelFilters.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1.5">Channels</p>
                            <div className="flex flex-wrap gap-1.5">
                              {channelFilters.map(channel => (
                                <button
                                  key={channel}
                                  onClick={() => toggleChannelFilter(channel)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs hover:bg-teal-100 transition-colors"
                                >
                                  <span>{channel}</span>
                                  <X className="w-3 h-3" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Formula Filters */}
                        {formulaCategoryFilters.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1.5">Formula Categories</p>
                            <div className="flex flex-wrap gap-1.5">
                              {formulaCategoryFilters.map(category => (
                                <button
                                  key={category}
                                  onClick={() => toggleFormulaCategoryFilter(category)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs hover:bg-purple-100 transition-colors"
                                >
                                  <span>{category}</span>
                                  <X className="w-3 h-3" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {formulaSubcategoryFilters.length > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1.5">Formula Subcategories</p>
                            <div className="flex flex-wrap gap-1.5">
                              {formulaSubcategoryFilters.map(subcategory => (
                                <button
                                  key={subcategory}
                                  onClick={() => toggleFormulaSubcategoryFilter(subcategory)}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs hover:bg-purple-100 transition-colors"
                                >
                                  <span>{subcategory}</span>
                                  <X className="w-3 h-3" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Clinical Filters */}
                        {/* Clinical Applications: Conditions + Patterns */}
                        {(clinicalUseFilters?.clinicalApplications && clinicalUseFilters.clinicalApplications.length > 0) && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1.5">Clinical Applications</p>
                            <div className="flex flex-wrap gap-1.5">
                              {clinicalUseFilters.clinicalApplications.map((app, index) => (
                                <div key={`app-${index}`} className="flex flex-wrap gap-1.5">
                                  {app.patterns && app.patterns.length > 0 ? (
                                    // Show individual chips for each pattern
                                    app.patterns.map((pattern, pIndex) => (
                                      <button
                                        key={`pattern-${index}-${pIndex}`}
                                        onClick={() => {
                                          // Remove this specific pattern
                                          const updatedApplications = clinicalUseFilters.clinicalApplications.map((a, i) => {
                                            if (i === index) {
                                              const newPatterns = a.patterns.filter(p => p !== pattern);
                                              return { ...a, patterns: newPatterns };
                                            }
                                            return a;
                                          }).filter(a => a.patterns.length > 0 || a.patterns.length === 0);

                                          // If this was the last pattern, remove the whole condition
                                          const finalApplications = updatedApplications.filter(a => a.patterns.length > 0);

                                          setClinicalUseFilters({
                                            ...clinicalUseFilters,
                                            clinicalApplications: finalApplications,
                                            condition: finalApplications.length > 0 ? finalApplications[0].condition : null,
                                            patterns: finalApplications.length > 0 ? finalApplications[0].patterns : [],
                                          });
                                        }}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors"
                                      >
                                        <span>{app.condition}: {pattern}</span>
                                        <X className="w-3 h-3" />
                                      </button>
                                    ))
                                  ) : (
                                    // Show chip for whole condition
                                    <button
                                      key={`condition-${index}`}
                                      onClick={() => {
                                        // Remove this condition
                                        const updatedApplications = clinicalUseFilters.clinicalApplications.filter((_, i) => i !== index);
                                        setClinicalUseFilters({
                                          ...clinicalUseFilters,
                                          clinicalApplications: updatedApplications,
                                          condition: updatedApplications.length > 0 ? updatedApplications[0].condition : null,
                                          patterns: updatedApplications.length > 0 ? updatedApplications[0].patterns : [],
                                        });
                                      }}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors"
                                    >
                                      <span>{app.condition}</span>
                                      <X className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {(clinicalUseFilters?.western_medical_dx?.length || 0) > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1.5">Western Medical Dx</p>
                            <div className="flex flex-wrap gap-1.5">
                              {clinicalUseFilters?.western_medical_dx?.map((dx: string) => (
                                <button
                                  key={dx}
                                  onClick={() => {
                                    setClinicalUseFilters(prev => ({
                                      ...prev,
                                      western_medical_dx: prev?.western_medical_dx?.filter((d: string) => d !== dx) || []
                                    }));
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs hover:bg-blue-100 transition-colors"
                                >
                                  <span>{dx}</span>
                                  <X className="w-3 h-3" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Safety Profile Filters */}
                        {getGeneralConditionsCount() > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1.5">General Conditions</p>
                            <div className="flex flex-wrap gap-1.5">
                              {['pregnancy', 'breastfeeding', 'insomnia', 'epilepsy', 'bleeding_disorders', 'liver_disease', 'kidney_disease']
                                .filter(field => patientSafetyProfile?.[field as keyof typeof patientSafetyProfile])
                                .map(field => (
                                  <button
                                    key={field}
                                    onClick={() => {
                                      setPatientSafetyProfile({
                                        ...patientSafetyProfile,
                                        [field]: false
                                      });
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs hover:bg-amber-100 transition-colors"
                                  >
                                    <span>{getDisplayName(field)}</span>
                                    <X className="w-3 h-3" />
                                  </button>
                                ))}
                            </div>
                          </div>
                        )}

                        {getMedicationsCount() > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1.5">Medications</p>
                            <div className="flex flex-wrap gap-1.5">
                              {['anticoagulants', 'antihypertensives', 'hypoglycemics', 'immunosuppressants', 'antidepressants', 'antiplatelets', 'beta_blockers', 'diuretics', 'corticosteroids', 'sedatives']
                                .filter(field => patientSafetyProfile?.[field as keyof typeof patientSafetyProfile])
                                .map(field => (
                                  <button
                                    key={field}
                                    onClick={() => {
                                      setPatientSafetyProfile({
                                        ...patientSafetyProfile,
                                        [field]: false
                                      });
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs hover:bg-amber-100 transition-colors"
                                  >
                                    <span>{getDisplayName(field)}</span>
                                    <X className="w-3 h-3" />
                                  </button>
                                ))}
                            </div>
                          </div>
                        )}

                        {getAllergiesCount() > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1.5">Allergies</p>
                            <div className="flex flex-wrap gap-1.5">
                              {['shellfish', 'gluten', 'nuts', 'dairy', 'soy', 'asteraceae', 'apiaceae']
                                .filter(field => patientSafetyProfile?.[field as keyof typeof patientSafetyProfile])
                                .map(field => (
                                  <button
                                    key={field}
                                    onClick={() => {
                                      setPatientSafetyProfile({
                                        ...patientSafetyProfile,
                                        [field]: false
                                      });
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs hover:bg-amber-100 transition-colors"
                                  >
                                    <span>{getDisplayName(field)}</span>
                                    <X className="w-3 h-3" />
                                  </button>
                                ))}
                            </div>
                          </div>
                        )}

                        {getTcmRiskPatternsCount() > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1.5">TCM Risk Patterns</p>
                            <div className="flex flex-wrap gap-1.5">
                              {['qi_deficiency', 'blood_deficiency', 'blood_stasis', 'yin_deficiency', 'yin_deficiency_heat', 'yang_deficiency', 'dampness', 'heat', 'liver_yang_rising', 'phlegm_damp', 'damp_heat', 'internal_wind']
                                .filter(field => patientSafetyProfile?.[field as keyof typeof patientSafetyProfile])
                                .map(field => (
                                  <button
                                    key={field}
                                    onClick={() => {
                                      setPatientSafetyProfile({
                                        ...patientSafetyProfile,
                                        [field]: false
                                      });
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs hover:bg-amber-100 transition-colors"
                                  >
                                    <span>{getDisplayName(field)}</span>
                                    <X className="w-3 h-3" />
                                  </button>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Advanced Filters */}
                        {pharmacologicalFiltersCount > 0 && hasFeature('pharmacologicalEffectsFilter') && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1.5">Pharmacological Effects</p>
                            <div className="flex flex-wrap gap-1.5">
                              {pharmacologicalFilters.map(effect => (
                                <button
                                  key={effect}
                                  onClick={() => {
                                    setPharmacologicalFilters(pharmacologicalFilters.filter(e => e !== effect));
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs hover:bg-indigo-100 transition-colors"
                                >
                                  <span>{effect}</span>
                                  <X className="w-3 h-3" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {biologicalMechanismsCount > 0 && hasFeature('biologicalMechanismsFilter') && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1.5">Biological Mechanisms</p>
                            <div className="flex flex-wrap gap-1.5">
                              {Object.entries(biologicalMechanisms || {}).flatMap(([mechanism, targets]) =>
                                (targets || []).map(target => (
                                  <button
                                    key={`${mechanism}-${target}`}
                                    onClick={() => {
                                      const updatedTargets = biologicalMechanisms[mechanism].filter(t => t !== target);
                                      if (updatedTargets.length === 0) {
                                        const { [mechanism]: _, ...rest } = biologicalMechanisms;
                                        setBiologicalMechanisms(rest);
                                      } else {
                                        setBiologicalMechanisms({
                                          ...biologicalMechanisms,
                                          [mechanism]: updatedTargets
                                        });
                                      }
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs hover:bg-teal-100 transition-colors"
                                  >
                                    <span>{mechanism}: {target}</span>
                                    <X className="w-3 h-3" />
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        )}

                        {bioactiveCompoundsCount > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1.5">Bioactive Compounds</p>
                            <div className="flex flex-wrap gap-1.5">
                              {Object.entries(bioactiveCompounds || {}).flatMap(([chemicalClass, compounds]) =>
                                (compounds || []).map(compound => (
                                  <button
                                    key={`${chemicalClass}-${compound}`}
                                    onClick={() => {
                                      const updatedCompounds = bioactiveCompounds[chemicalClass].filter(c => c !== compound);
                                      if (updatedCompounds.length === 0) {
                                        const { [chemicalClass]: _, ...rest } = bioactiveCompounds;
                                        setBioactiveCompounds(rest);
                                      } else {
                                        setBioactiveCompounds({
                                          ...bioactiveCompounds,
                                          [chemicalClass]: updatedCompounds
                                        });
                                      }
                                    }}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded text-xs hover:bg-green-100 transition-colors"
                                  >
                                    <span>{chemicalClass !== 'Uncategorized' ? `${chemicalClass}: ${compound}` : compound}</span>
                                    <X className="w-3 h-3" />
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-2 min-h-[44px]">
                {hasAnyActiveFilter && (
                  <>
                    <button
                      onClick={clearAllMobileFilters}
                      className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors font-medium"
                    >
                      Clear All
                    </button>
                    <Dialog.Close className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium">
                      Apply
                    </Dialog.Close>
                  </>
                )}
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Clinical Applications Modals (Condition & Pattern) */}
      <ClinicalApplicationsModals
        showConditionModal={showConditionModal}
        setShowConditionModal={setShowConditionModal}
        showPatternModal={showPatternModal}
        setShowPatternModal={setShowPatternModal}
        clinicalConditions={CLINICAL_CONDITIONS}
        clinicalUseFilters={clinicalUseFilters}
        setClinicalUseFilters={setClinicalUseFilters}
        allHerbs={allHerbs}
        allFormulas={allFormulas}
      />

      {/* Preview Modal - Using UnifiedDetailsModal like in Herbs/Formulas libraries */}
      <UnifiedDetailsModal
        isOpen={modalNav.isOpen}
        currentItem={modalNav.currentItem}
        canGoBack={modalNav.canGoBack}
        onClose={modalNav.close}
        onGoBack={modalNav.goBack}
        onNavigate={modalNav.navigateTo}
        showNatureIndicator={herbDisplayOptions.showNatureIndicator}
        showThermalActionIndicator={formulaDisplayOptions.showThermalActionIndicator}
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
        allItems={[]}
        onNavigatePrevious={undefined}
        onNavigateNext={undefined}
      />

      {/* Save Confirmation Dialog - when editing existing prescription */}
      <Dialog.Root open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md z-50 shadow-xl">
            <Dialog.Title className="text-xl font-semibold text-gray-900 mb-2">
              Save Prescription
            </Dialog.Title>
            <Dialog.Description className="text-sm text-gray-600 mb-6">
              Would you like to update the existing prescription or save as a new one?
            </Dialog.Description>

            <div className="flex gap-2">
              <Dialog.Close 
                disabled={isSaving}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </Dialog.Close>
              <button
                onClick={saveAsNew}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border-2 border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save New
              </button>
              <button
                onClick={saveAsUpdate}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Update
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
