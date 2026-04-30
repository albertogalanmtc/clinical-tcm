import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllHerbs } from '@/app/data/herbsManager';
import { getAllFormulas } from '@/app/data/formulasManager';
import { AlertCard } from '@/app/components/ui/AlertCard';
import { NatureIndicator } from '@/app/components/ui/NatureIndicator';
import { ThermalActionIndicator } from '@/app/components/ui/ThermalActionIndicator';
import { Copy, Edit, Trash2, Check, ChevronUp, ChevronDown, ChevronRight, Ban, X } from 'lucide-react';
import { toast } from 'sonner';
import { useGlobalSettings } from '@/app/hooks/useGlobalSettings';
import type { Prescription } from '@/app/data/prescriptions';
import type { HerbAction } from '../data/herbs';

// Helper function to get herb display names based on config
const getHerbDisplayNames = (herbName: string, config: any) => {
  const herbsData = getAllHerbs();
  const herb = herbsData.find(h => h.pinyin_name === herbName);
  if (!herb) return [{ type: 'pinyin', value: herbName }];

  const names: { type: string; value: string }[] = [];
  const order = config?.display?.herbs?.order || ['pinyin', 'latin', 'hanzi'];

  order.forEach((nameType: string) => {
    if (config?.display?.herbs?.[nameType]) {
      if (nameType === 'pinyin' && herb.pinyin_name) {
        names.push({ type: 'pinyin', value: herb.pinyin_name });
      } else if (nameType === 'latin' && herb.pharmaceutical_name) {
        names.push({ type: 'latin', value: herb.pharmaceutical_name });
      } else if (nameType === 'hanzi' && herb.hanzi_name) {
        names.push({ type: 'hanzi', value: herb.hanzi_name });
      }
    }
  });

  return names.length > 0 ? names : [{ type: 'pinyin', value: herbName }];
};

// Helper function to get formula display names based on config
const getFormulaDisplayNames = (formulaName: string, config: any) => {
  const formulasData = getAllFormulas();
  const formula = formulasData.find(f => f.pinyin_name === formulaName);
  if (!formula) return [{ type: 'pinyin', value: formulaName }];

  const names: { type: string; value: string }[] = [];
  const order = config?.display?.formulas?.order || ['pinyin', 'pharmaceutical', 'hanzi'];

  order.forEach((nameType: string) => {
    if (config?.display?.formulas?.[nameType]) {
      if (nameType === 'pinyin' && formula.pinyin_name) {
        names.push({ type: 'pinyin', value: formula.pinyin_name });
      } else if (nameType === 'pharmaceutical' && formula.translated_name) {
        names.push({ type: 'pharmaceutical', value: formula.translated_name });
      } else if (nameType === 'hanzi' && formula.hanzi_name) {
        names.push({ type: 'hanzi', value: formula.hanzi_name });
      }
    }
  });

  return names.length > 0 ? names : [{ type: 'pinyin', value: formulaName }];
};

// Helper function to get nature border color for a herb name
const getNatureBorderColor = (herbName: string): string => {
  const herbsData = getAllHerbs();
  const foundHerb = herbsData.find(h => h.pinyin_name === herbName);
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

// Helper function to get thermal action border color for a formula
const getThermalActionBorderColor = (formulaName: string): string => {
  const formulasData = getAllFormulas();
  const formula = formulasData.find(f => f.pinyin_name === formulaName);
  if (!formula) return 'border-gray-400';
  
  const action = formula.thermal_action?.toLowerCase() || '';
  
  if (action.includes('very warm') || action === 'muy caliente') return 'border-red-700';
  if (action === 'warm' || action === 'caliente' || action === 'warming') return 'border-red-500';
  if (action === 'slightly warm' || action === 'ligeramente caliente') return 'border-orange-500';
  if (action === 'neutral' || action === 'neutro') return 'border-gray-400';
  if (action === 'slightly cool' || action === 'ligeramente fresca') return 'border-blue-400';
  if (action === 'cool' || action === 'fresca' || action === 'cooling') return 'border-blue-600';
  if (action.includes('very cool') || action === 'muy fría' || action === 'cold') return 'border-blue-800';
  
  return 'border-gray-400';
};

// Helper to get subcomponents from a formula
const getSubComponents = (formulaName: string, formulaDosage: string) => {
  const formulasData = getAllFormulas();
  const formula = formulasData.find(f => f.pinyin_name === formulaName);
  if (!formula || !formula.ingredients) return [];

  const totalFormulaDosage = parseFloat(formulaDosage);
  if (isNaN(totalFormulaDosage)) return [];

  return formula.ingredients.map(ing => {
    const dosageNum = parseFloat(ing.dosage);
    const proportionalDosage = (dosageNum / 100) * totalFormulaDosage;
    return {
      name: ing.name,
      dosage: proportionalDosage.toFixed(1) + 'g',
    };
  });
};

interface PrescriptionDetailsProps {
  prescription: Prescription;
  onClose?: () => void;
  showCloseButton?: boolean;
  displayConfig?: any;
  onHerbClick?: (herbName: string) => void;
  onFormulaClick?: (formulaName: string) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  copied?: boolean;
  onCopyStateChange?: (copied: boolean) => void;
}

export function PrescriptionDetails({
  prescription,
  onClose,
  showCloseButton = true,
  displayConfig,
  onHerbClick,
  onFormulaClick,
  onEdit,
  onDelete,
  copied: externalCopied,
  onCopyStateChange
}: PrescriptionDetailsProps) {
  const [internalCopied, setInternalCopied] = useState(false);
  const copied = externalCopied !== undefined ? externalCopied : internalCopied;
  const setCopied = onCopyStateChange || setInternalCopied;

  const [expandedFormulas, setExpandedFormulas] = useState<number[]>([]);
  const [expandedActions, setExpandedActions] = useState<number[]>([]);
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  const herbsData = getAllHerbs();
  const formulasData = getAllFormulas();
  const { globalSettings } = useGlobalSettings();

  // Generate prescription text for copying
  const generatePrescriptionText = () => {
    const copySettings = globalSettings.prescriptions?.copy || {};
    const sectionOrder = copySettings.sectionOrder || ['name', 'components', 'filters', 'comments'];

    const sections: { [key: string]: string } = {};

    console.log('Copy Settings:', copySettings);
    console.log('Prescription:', prescription);

    // Build name section
    if (copySettings.includeName ?? true) {
      sections.name = `${prescription.name}\n\n`;
    }

    // Build components section
    if (copySettings.includeComponents ?? true) {
      let componentsText = 'COMPONENTS:\n\n';
      prescription.components.forEach((component, idx) => {
        componentsText += `${idx + 1}. ${component.name} - ${component.dosage}\n`;

        if (component.type === 'formula' && copySettings.formulas?.ingredients) {
          const subComponents = component.subComponents || getSubComponents(component.name, component.dosage);
          if (subComponents && subComponents.length > 0) {
            subComponents.forEach(sub => {
              componentsText += `   └─ ${sub.name} - ${sub.dosage}\n`;
            });
          }
        }
      });
      sections.components = componentsText;
    }

    // Build filters section
    if ((copySettings.includeFilters ?? true) && prescription.patientSafetyProfile) {
      const activeFilters = Object.entries(prescription.patientSafetyProfile)
        .filter(([_, value]) => value === true)
        .map(([key]) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));

      if (activeFilters.length > 0) {
        sections.filters = `\nSAFETY FILTERS:\n${activeFilters.join(', ')}\n`;
      }
    }

    // Build comments section
    if (copySettings.includeComments && prescription.comments) {
      sections.comments = `\nCOMMENTS:\n${prescription.comments}\n`;
    }

    // Assemble text based on configured order
    let text = '';
    sectionOrder.forEach(section => {
      if (sections[section]) {
        text += sections[section];
      }
    });

    return text;
  };

  const handleCopy = async () => {
    const text = generatePrescriptionText();

    if (!text || text.trim().length === 0) {
      toast.error('No content to copy. Enable at least one section in Settings → Prescriptions → Copy Settings');
      return;
    }

    try {
      // Try modern clipboard API first
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Prescription copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback to legacy method
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        setCopied(true);
        toast.success('Prescription copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        const errorMsg = fallbackErr instanceof Error ? fallbackErr.message : 'Unknown error';
        toast.error(`Failed to copy: ${errorMsg}`);
        console.error('Copy failed:', fallbackErr);
      }
    }
  };

  // Calculate alerts
  const calculateAlerts = () => {
    const alerts = {
      contraindications: [] as string[],
      cautions: [] as string[],
      interactions: [] as string[],
      allergens: [] as string[],
      antagonisms: [] as string[],
      incompatibilities: [] as string[]
    };

    // First, collect all herb names present in the prescription (including formula ingredients)
    const presentHerbNames: string[] = [];
    
    prescription.components.forEach(component => {
      if (component.type === 'herb') {
        presentHerbNames.push(component.name);
      } else if (component.type === 'formula') {
        const subComponents = component.subComponents || getSubComponents(component.name, component.dosage);
        if (subComponents && subComponents.length > 0) {
          subComponents.forEach(sub => {
            if (!presentHerbNames.includes(sub.name)) {
              presentHerbNames.push(sub.name);
            }
          });
        }
      }
    });

    // Now collect alerts from each component
    prescription.components.forEach(component => {
      if (component.type === 'herb') {
        const herb = herbsData.find(h => h.pinyin_name === component.name);
        if (herb) {
          if (herb.contraindications) {
            alerts.contraindications.push(...herb.contraindications.map(alert => `${component.name}: ${alert}`));
          }
          if (herb.cautions) {
            alerts.cautions.push(...herb.cautions.map(alert => `${component.name}: ${alert}`));
          }
          if (herb.herb_drug_interactions) {
            alerts.interactions.push(...herb.herb_drug_interactions.map(alert => `${component.name}: ${alert}`));
          }
          if (herb.herb_herb_interactions) {
            alerts.interactions.push(...herb.herb_herb_interactions.map(alert => `${component.name}: ${alert}`));
          }
          if (herb.allergens) {
            alerts.allergens.push(...herb.allergens.map(alert => `${component.name}: ${alert}`));
          }
          
          // Check antagonisms - only add if the antagonist is present in the prescription
          if (herb.antagonisms && herb.antagonisms.length > 0) {
            herb.antagonisms.forEach(antagonistName => {
              if (presentHerbNames.includes(antagonistName)) {
                const conflictMsg = `${component.name} ⚠ ${antagonistName}`;
                if (!alerts.antagonisms.includes(conflictMsg)) {
                  alerts.antagonisms.push(conflictMsg);
                }
              }
            });
          }
          
          // Check incompatibilities - only add if the incompatible herb is present in the prescription
          if (herb.incompatibilities && herb.incompatibilities.length > 0) {
            herb.incompatibilities.forEach(incompatibleName => {
              if (presentHerbNames.includes(incompatibleName)) {
                const conflictMsg = `${component.name} ⚠ ${incompatibleName}`;
                if (!alerts.incompatibilities.includes(conflictMsg)) {
                  alerts.incompatibilities.push(conflictMsg);
                }
              }
            });
          }
        }
      } else if (component.type === 'formula') {
        const formula = formulasData.find(f => f.pinyin_name === component.name);
        if (formula) {
          if (formula.contraindications) {
            alerts.contraindications.push(...formula.contraindications.map(alert => `${component.name}: ${alert}`));
          }
          if (formula.cautions) {
            alerts.cautions.push(...formula.cautions.map(alert => `${component.name}: ${alert}`));
          }
        }
      }
    });

    // Remove duplicates
    alerts.contraindications = [...new Set(alerts.contraindications)];
    alerts.cautions = [...new Set(alerts.cautions)];
    alerts.interactions = [...new Set(alerts.interactions)];
    alerts.allergens = [...new Set(alerts.allergens)];
    alerts.antagonisms = [...new Set(alerts.antagonisms)];
    alerts.incompatibilities = [...new Set(alerts.incompatibilities)];

    return alerts;
  };

  const alerts = calculateAlerts();

  // Filter alerts based on patient safety profile
  const getFilteredAlerts = () => {
    // If "All" is selected, show everything
    if (showAllAlerts) {
      return alerts;
    }

    // Check if any profile condition is true
    const profile = prescription.patientSafetyProfile;
    const hasAnyCondition = profile ? Object.values(profile).some(v => v) : false;
    
    // Helper function to check if alert is critical (incompatibilities, antagonisms, toxicology)
    const isCriticalAlert = (alert: string) => {
      const lowerAlert = alert.toLowerCase();
      const criticalKeywords = [
        'incompatible', 'incompatibilidad', 
        'antagonism', 'antagonismo', 'antagonist',
        'toxic', 'toxicity', 'tóxico', 'toxicidad', 'toxicología',
        'contraindicated with', 'contraindicado con',
        'do not combine', 'no combinar',
        'avoid combination', 'evitar combinación'
      ];
      return criticalKeywords.some(keyword => lowerAlert.includes(keyword));
    };

    // Separate critical alerts (always show these)
    const criticalAlerts = {
      contraindications: alerts.contraindications.filter(isCriticalAlert),
      cautions: alerts.cautions.filter(isCriticalAlert),
      interactions: alerts.interactions.filter(isCriticalAlert),
      allergens: alerts.allergens.filter(isCriticalAlert)
    };
    
    // If no conditions are marked (or no profile), return ONLY critical alerts
    if (!hasAnyCondition) {
      return criticalAlerts;
    }

    // Collect all relevant alerts based on marked conditions
    const relevantAlerts = {
      contraindications: [] as string[],
      cautions: [] as string[],
      interactions: [] as string[],
      allergens: [] as string[]
    };
    
    // Helper function to check if alert matches a condition
    const matchesCondition = (alert: string, keywords: string[]) => {
      const lowerAlert = alert.toLowerCase();
      return keywords.some(keyword => lowerAlert.includes(keyword.toLowerCase()));
    };

    // Collect alerts for each marked condition
    if (profile.pregnancy) {
      const pregnancyKeywords = ['pregnancy', 'pregnant', 'embarazo', 'embarazada', 'gestation'];
      relevantAlerts.contraindications.push(...alerts.contraindications.filter(alert => 
        matchesCondition(alert, pregnancyKeywords)
      ));
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, pregnancyKeywords)
      ));
    }

    if (profile.breastfeeding) {
      const breastfeedingKeywords = ['breastfeeding', 'breast-feeding', 'nursing', 'lactation', 'lactancia'];
      relevantAlerts.contraindications.push(...alerts.contraindications.filter(alert => 
        matchesCondition(alert, breastfeedingKeywords)
      ));
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, breastfeedingKeywords)
      ));
    }

    if (profile.pediatric) {
      const pediatricKeywords = ['children', 'child', 'pediatric', 'niños', 'infantil'];
      relevantAlerts.contraindications.push(...alerts.contraindications.filter(alert => 
        matchesCondition(alert, pediatricKeywords)
      ));
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, pediatricKeywords)
      ));
    }

    if (profile.elderly) {
      const elderlyKeywords = ['elderly', 'geriatric', 'ancianos', 'mayores'];
      relevantAlerts.contraindications.push(...alerts.contraindications.filter(alert => 
        matchesCondition(alert, elderlyKeywords)
      ));
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, elderlyKeywords)
      ));
    }

    if (profile.hypertension) {
      const hypertensionKeywords = ['hypertension', 'high blood pressure', 'hipertensión', 'presión alta'];
      relevantAlerts.contraindications.push(...alerts.contraindications.filter(alert => 
        matchesCondition(alert, hypertensionKeywords)
      ));
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, hypertensionKeywords)
      ));
    }

    if (profile.diabetes) {
      const diabetesKeywords = ['diabetes', 'diabetic', 'diabético', 'blood sugar'];
      relevantAlerts.contraindications.push(...alerts.contraindications.filter(alert => 
        matchesCondition(alert, diabetesKeywords)
      ));
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, diabetesKeywords)
      ));
    }

    if (profile.bleedingDisorders) {
      const bleedingKeywords = ['bleeding', 'hemorrhage', 'anticoagulant', 'sangrado', 'hemorragia'];
      relevantAlerts.contraindications.push(...alerts.contraindications.filter(alert => 
        matchesCondition(alert, bleedingKeywords)
      ));
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, bleedingKeywords)
      ));
    }

    if (profile.liverDisease) {
      const liverKeywords = ['liver', 'hepatic', 'hígado', 'hepática'];
      relevantAlerts.contraindications.push(...alerts.contraindications.filter(alert => 
        matchesCondition(alert, liverKeywords)
      ));
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, liverKeywords)
      ));
    }

    if (profile.kidneyDisease) {
      const kidneyKeywords = ['kidney', 'renal', 'riñón', 'renal'];
      relevantAlerts.contraindications.push(...alerts.contraindications.filter(alert => 
        matchesCondition(alert, kidneyKeywords)
      ));
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, kidneyKeywords)
      ));
    }

    if (profile.insomnia) {
      const insomniaKeywords = ['insomnia', 'sleep', 'insomnio', 'sueño'];
      relevantAlerts.contraindications.push(...alerts.contraindications.filter(alert => 
        matchesCondition(alert, insomniaKeywords)
      ));
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, insomniaKeywords)
      ));
    }

    if (profile.epilepsy) {
      const epilepsyKeywords = ['epilepsy', 'seizure', 'convulsion', 'epilepsia', 'convulsión'];
      relevantAlerts.contraindications.push(...alerts.contraindications.filter(alert => 
        matchesCondition(alert, epilepsyKeywords)
      ));
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, epilepsyKeywords)
      ));
    }

    if (profile.bleeding_disorders) {
      const bleedingDisordersKeywords = ['bleeding', 'hemorrhage', 'coagulation', 'sangrado', 'hemorragia'];
      relevantAlerts.contraindications.push(...alerts.contraindications.filter(alert => 
        matchesCondition(alert, bleedingDisordersKeywords)
      ));
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, bleedingDisordersKeywords)
      ));
    }

    if (profile.liver_disease) {
      const liverDiseaseKeywords = ['liver', 'hepatic', 'hepatotoxic', 'hígado', 'hepática'];
      relevantAlerts.contraindications.push(...alerts.contraindications.filter(alert => 
        matchesCondition(alert, liverDiseaseKeywords)
      ));
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, liverDiseaseKeywords)
      ));
    }

    if (profile.kidney_disease) {
      const kidneyDiseaseKeywords = ['kidney', 'renal', 'nephrotoxic', 'riñón'];
      relevantAlerts.contraindications.push(...alerts.contraindications.filter(alert => 
        matchesCondition(alert, kidneyDiseaseKeywords)
      ));
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, kidneyDiseaseKeywords)
      ));
    }

    if (profile.anticoagulants) {
      const anticoagulantsKeywords = ['anticoagulant', 'warfarin', 'blood thinner', 'anticoagulante'];
      relevantAlerts.interactions.push(...alerts.interactions.filter(alert => 
        matchesCondition(alert, anticoagulantsKeywords)
      ));
    }

    if (profile.antihypertensives) {
      const antihypertensivesKeywords = ['antihypertensive', 'blood pressure medication', 'antihipertensivo'];
      relevantAlerts.interactions.push(...alerts.interactions.filter(alert => 
        matchesCondition(alert, antihypertensivesKeywords)
      ));
    }

    if (profile.hypoglycemics) {
      const hypoglycemicsKeywords = ['hypoglycemic', 'insulin', 'diabetes medication', 'metformin', 'hipoglucemiante'];
      relevantAlerts.interactions.push(...alerts.interactions.filter(alert => 
        matchesCondition(alert, hypoglycemicsKeywords)
      ));
    }

    if (profile.immunosuppressants) {
      const immunosuppressantsKeywords = ['immunosuppressant', 'immune', 'inmunosupresor'];
      relevantAlerts.interactions.push(...alerts.interactions.filter(alert => 
        matchesCondition(alert, immunosuppressantsKeywords)
      ));
    }

    if (profile.chemotherapy) {
      const chemotherapyKeywords = ['chemotherapy', 'cancer treatment', 'quimioterapia'];
      relevantAlerts.interactions.push(...alerts.interactions.filter(alert => 
        matchesCondition(alert, chemotherapyKeywords)
      ));
    }

    if (profile.antidepressants) {
      const antidepressantsKeywords = ['antidepressant', 'ssri', 'maoi', 'antidepresivo'];
      relevantAlerts.interactions.push(...alerts.interactions.filter(alert => 
        matchesCondition(alert, antidepressantsKeywords)
      ));
    }

    if (profile.antiplatelets) {
      const antiplateletsKeywords = ['antiplatelet', 'aspirin', 'clopidogrel', 'antiplaquetario'];
      relevantAlerts.interactions.push(...alerts.interactions.filter(alert => 
        matchesCondition(alert, antiplateletsKeywords)
      ));
    }

    if (profile.beta_blockers) {
      const betaBlockersKeywords = ['beta blocker', 'beta-blocker', 'betabloqueador'];
      relevantAlerts.interactions.push(...alerts.interactions.filter(alert => 
        matchesCondition(alert, betaBlockersKeywords)
      ));
    }

    if (profile.diuretics) {
      const diureticsKeywords = ['diuretic', 'diurético'];
      relevantAlerts.interactions.push(...alerts.interactions.filter(alert => 
        matchesCondition(alert, diureticsKeywords)
      ));
    }

    if (profile.corticosteroids) {
      const corticosteroidsKeywords = ['corticosteroid', 'steroid', 'prednisone', 'corticosteroide'];
      relevantAlerts.interactions.push(...alerts.interactions.filter(alert => 
        matchesCondition(alert, corticosteroidsKeywords)
      ));
    }

    if (profile.sedatives) {
      const sedativesKeywords = ['sedative', 'benzodiazepine', 'sleeping pill', 'sedante'];
      relevantAlerts.interactions.push(...alerts.interactions.filter(alert => 
        matchesCondition(alert, sedativesKeywords)
      ));
    }

    if (profile.shellfish) {
      const shellfishKeywords = ['shellfish', 'oyster', 'marisco'];
      relevantAlerts.allergens.push(...alerts.allergens.filter(alert => 
        matchesCondition(alert, shellfishKeywords)
      ));
    }

    if (profile.gluten) {
      const glutenKeywords = ['gluten', 'wheat', 'trigo'];
      relevantAlerts.allergens.push(...alerts.allergens.filter(alert => 
        matchesCondition(alert, glutenKeywords)
      ));
    }

    if (profile.nuts) {
      const nutsKeywords = ['nut', 'peanut', 'almond', 'nuez', 'maní', 'almendra'];
      relevantAlerts.allergens.push(...alerts.allergens.filter(alert => 
        matchesCondition(alert, nutsKeywords)
      ));
    }

    if (profile.dairy) {
      const dairyKeywords = ['dairy', 'milk', 'lactose', 'lácteo', 'leche'];
      relevantAlerts.allergens.push(...alerts.allergens.filter(alert => 
        matchesCondition(alert, dairyKeywords)
      ));
    }

    if (profile.soy) {
      const soyKeywords = ['soy', 'soya'];
      relevantAlerts.allergens.push(...alerts.allergens.filter(alert => 
        matchesCondition(alert, soyKeywords)
      ));
    }

    if (profile.asteraceae) {
      const asteraceaeKeywords = ['asteraceae', 'compositae', 'chamomile', 'manzanilla'];
      relevantAlerts.allergens.push(...alerts.allergens.filter(alert => 
        matchesCondition(alert, asteraceaeKeywords)
      ));
    }

    if (profile.apiaceae) {
      const apiaceaeKeywords = ['apiaceae', 'umbelliferae', 'celery', 'apio'];
      relevantAlerts.allergens.push(...alerts.allergens.filter(alert => 
        matchesCondition(alert, apiaceaeKeywords)
      ));
    }

    if (profile.qi_deficiency) {
      const qiDeficiencyKeywords = ['qi deficiency', 'deficiencia de qi', 'qi vacío'];
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, qiDeficiencyKeywords)
      ));
    }

    if (profile.blood_deficiency) {
      const bloodDeficiencyKeywords = ['blood deficiency', 'deficiencia de sangre', 'sangre vacía'];
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, bloodDeficiencyKeywords)
      ));
    }

    if (profile.blood_stasis) {
      const bloodStasisKeywords = ['blood stasis', 'estasis de sangre'];
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, bloodStasisKeywords)
      ));
    }

    if (profile.yin_deficiency) {
      const yinDeficiencyKeywords = ['yin deficiency', 'deficiencia de yin', 'yin vacío'];
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, yinDeficiencyKeywords)
      ));
    }

    if (profile.yin_deficiency_heat) {
      const yinDeficiencyHeatKeywords = ['yin deficiency heat', 'yin vacío con calor', 'deficiencia de yin con calor'];
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, yinDeficiencyHeatKeywords)
      ));
    }

    if (profile.yang_deficiency) {
      const yangDeficiencyKeywords = ['yang deficiency', 'deficiencia de yang', 'yang vacío'];
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, yangDeficiencyKeywords)
      ));
    }

    if (profile.dampness) {
      const dampnessKeywords = ['dampness', 'damp', 'humedad'];
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, dampnessKeywords)
      ));
    }

    if (profile.heat) {
      const heatKeywords = ['heat', 'calor'];
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, heatKeywords)
      ));
    }

    if (profile.liver_yang_rising) {
      const liverYangRisingKeywords = ['liver yang rising', 'yang de hígado ascendente'];
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, liverYangRisingKeywords)
      ));
    }

    if (profile.phlegm_damp) {
      const phlegmDampKeywords = ['phlegm damp', 'phlegm-damp', 'flema humedad'];
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, phlegmDampKeywords)
      ));
    }

    if (profile.damp_heat) {
      const dampHeatKeywords = ['damp heat', 'damp-heat', 'humedad calor'];
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, dampHeatKeywords)
      ));
    }

    if (profile.internal_wind) {
      const internalWindKeywords = ['internal wind', 'viento interno'];
      relevantAlerts.cautions.push(...alerts.cautions.filter(alert => 
        matchesCondition(alert, internalWindKeywords)
      ));
    }

    // Combine relevant alerts with critical alerts (critical alerts always included)
    relevantAlerts.contraindications = [...new Set([...relevantAlerts.contraindications, ...criticalAlerts.contraindications])];
    relevantAlerts.cautions = [...new Set([...relevantAlerts.cautions, ...criticalAlerts.cautions])];
    relevantAlerts.interactions = [...new Set([...relevantAlerts.interactions, ...criticalAlerts.interactions])];
    relevantAlerts.allergens = [...new Set([...relevantAlerts.allergens, ...criticalAlerts.allergens])];

    return relevantAlerts;
  };

  const displayedAlerts = getFilteredAlerts();

  return (
    <div>
      {/* Hidden copy trigger button for footer */}
      <button
        data-prescription-copy-trigger
        onClick={handleCopy}
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      {/* Title and Close button */}
      <div className="pb-6 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">{prescription.name}</h1>
          {showCloseButton && onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Components */}
      <div className="pt-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Components</h2>
        <div className={`${(displayConfig?.display?.preview?.ingredientsLayout ?? 'grid') === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2' : 'inline-flex flex-col gap-2'}`}>
          {prescription.components.map((component, idx) => {
            const subComponents = component.type === 'formula'
              ? (component.subComponents || getSubComponents(component.name, component.dosage))
              : null;
            const herb = component.type === 'herb' ? herbsData.find(h => h.pinyin_name === component.name) : null;

            const isExpandableFormula = component.type === 'formula' && subComponents && subComponents.length > 0 && displayConfig?.display?.formulas?.ingredients;
            const isListLayout = (displayConfig?.display?.preview?.ingredientsLayout ?? 'grid') === 'list';

            return (
              <div key={idx} className={`bg-gray-50 rounded-lg p-3 border ${component.type === 'herb' && displayConfig?.display?.preview?.natureIndicator && herb ? getNatureBorderColor(component.name) : component.type === 'formula' && displayConfig?.display?.preview?.thermalActionIndicator ? getThermalActionBorderColor(component.name) : 'border-gray-200'} ${isListLayout ? 'w-full' : ''}`}>
                {/* Main component */}
                <div>
                  <div className="flex items-center justify-between gap-3">
                    {/* Expand/Collapse button for formulas */}
                    {isExpandableFormula && (
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
                      className="flex items-baseline gap-2 flex-wrap flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        if (component.type === 'herb' && onHerbClick) {
                          const herbExists = herbsData.find(h => h.pinyin_name === component.name);
                          if (herbExists) {
                            onHerbClick(component.name);
                          }
                        } else if (component.type === 'formula' && onFormulaClick) {
                          const formulaExists = formulasData.find(f => f.pinyin_name === component.name);
                          if (formulaExists) {
                            onFormulaClick(component.name);
                          }
                        }
                      }}
                    >
                      {component.type === 'herb' ? (
                        <>
                          {getHerbDisplayNames(component.name, displayConfig).map((nameObj, i) => {
                            const displayValue = typeof nameObj === 'string' ? nameObj : nameObj.value;
                            return (
                              <span key={i} className={i === 0 ? 'font-medium text-gray-900 text-[16px] whitespace-nowrap' : 'text-sm text-gray-600'}>
                                {displayValue}
                              </span>
                            );
                          })}
                        </>
                      ) : (
                        <>
                          {getFormulaDisplayNames(component.name, displayConfig).map((nameObj, i) => {
                            const displayValue = typeof nameObj === 'string' ? nameObj : nameObj.value;
                            return (
                              <span key={i} className={i === 0 ? 'font-medium text-gray-900 text-[16px] whitespace-nowrap' : 'text-sm text-gray-600'}>
                                {displayValue}
                              </span>
                            );
                          })}
                        </>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-medium text-gray-700">{component.dosage}</span>
                    </div>
                  </div>
                </div>

                {/* Sub-ingredients for formulas */}
                {isExpandableFormula && expandedFormulas.includes(idx) && (
                  <div className="mt-2 ml-4 space-y-1.5">
                    {subComponents.map((sub, subIdx) => {
                      const subHerb = herbsData.find(h => h.pinyin_name === sub.name);
                      const subHerbNames = getHerbDisplayNames(sub.name, displayConfig);
                      return (
                        <div
                          key={subIdx}
                          className={`flex items-center justify-between gap-2 p-2 bg-white rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${displayConfig?.display?.preview?.natureIndicator && subHerb ? getNatureBorderColor(sub.name) : 'border-gray-200'}`}
                          onClick={() => {
                            if (onHerbClick) {
                              const herbExists = herbsData.find(h => h.pinyin_name === sub.name);
                              if (herbExists) {
                                onHerbClick(sub.name);
                              }
                            }
                          }}
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                              {subHerbNames.map((nameObj, i) => {
                                const displayValue = typeof nameObj === 'string' ? nameObj : nameObj.value;
                                return (
                                  <span key={i} className={i === 0 ? 'text-sm text-gray-700 whitespace-nowrap' : 'text-xs text-gray-500'}>
                                    {displayValue}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-600">{sub.dosage}</span>
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

      {/* Comments */}
      {prescription.comments && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Comments</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 whitespace-pre-wrap">{prescription.comments}</p>
          </div>
        </div>
      )}

      {/* Active Safety Filters Section */}
      {prescription.patientSafetyProfile && Object.values(prescription.patientSafetyProfile).some(v => v) && (
        <div className="pb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Safety Filters</h2>
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <div className="flex flex-wrap gap-2">
              {Object.entries(prescription.patientSafetyProfile).map(([key, value]) => 
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
      <div className="pt-6 mb-6 border-t border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Safety Alerts</h2>
          
          {/* Toggle Filtered/All - Always visible */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setShowAllAlerts(false)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                !showAllAlerts 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Filtered
            </button>
            <button
              onClick={() => setShowAllAlerts(true)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                showAllAlerts 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All
            </button>
          </div>
        </div>
        
        {/* Show alerts or empty state */}
        {(displayedAlerts.contraindications.length > 0 || displayedAlerts.cautions.length > 0 || displayedAlerts.interactions.length > 0 || displayedAlerts.allergens.length > 0 || (showAllAlerts && (alerts.antagonisms.length > 0 || alerts.incompatibilities.length > 0))) ? (
          <div className="space-y-3">
            {/* Antagonisms - only show in "All" mode and when conflicts exist */}
            {showAllAlerts && alerts.antagonisms.length > 0 && (
              <AlertCard
                type="antagonism"
                title="Antagonisms"
                items={alerts.antagonisms}
              />
            )}
            
            {/* Incompatibilities - only show in "All" mode and when conflicts exist */}
            {showAllAlerts && alerts.incompatibilities.length > 0 && (
              <AlertCard
                type="incompatibility"
                title="Incompatibilities"
                items={alerts.incompatibilities}
              />
            )}
            
            {displayedAlerts.contraindications.length > 0 && (
              <AlertCard
                type="contraindication"
                title="Contraindications"
                items={displayedAlerts.contraindications}
              />
            )}
            
            {displayedAlerts.cautions.length > 0 && (
              <AlertCard
                type="caution"
                title="Cautions"
                items={displayedAlerts.cautions}
              />
            )}
            
            {displayedAlerts.interactions.length > 0 && (
              <AlertCard
                type="interaction"
                title="Interactions"
                items={displayedAlerts.interactions}
              />
            )}
            
            {displayedAlerts.allergens.length > 0 && (
              <AlertCard
                type="allergen"
                title="Allergens"
                items={displayedAlerts.allergens}
              />
            )}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-sm text-gray-500 text-center">
              {showAllAlerts
                ? "No safety alerts found for this prescription."
                : "No matching alerts found for the selected conditions."}
            </p>
          </div>
        )}
      </div>

      {/* Created date */}
      <p className="text-sm text-gray-500 mt-6 mb-6">
        Created on {prescription.createdAt.toLocaleDateString()}
      </p>

      {/* Action buttons - Edit & Delete at the bottom */}
      {(onEdit || onDelete) && (
        <div className="mt-auto sm:mt-8 pt-8 pb-28 sm:pb-24 border-t border-gray-200">
          <div className="flex gap-3">
            {onEdit && (
              <button
                onClick={onEdit}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
            )}

            {onDelete && (
              <button
                onClick={onDelete}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom spacing when no action buttons */}
      {!onEdit && !onDelete && (
        <div className="pb-20 sm:pb-8" />
      )}
    </div>
  );
}