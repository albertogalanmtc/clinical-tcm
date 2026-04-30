import { useState, useRef } from 'react';
import { Download, Upload, X, Check, AlertCircle } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Herb } from '../data/herbs';
import { Formula } from '../data/formulas';
import { getPrescriptionsSync } from '../data/prescriptions';

type ExportType = 'system-herbs' | 'user-herbs' | 'system-formulas' | 'user-formulas' | 'user-prescriptions';

interface ContentImportExportProps {
  onImportComplete?: (items: (Herb | Formula)[], type: 'herbs' | 'formulas') => void;
}

interface UserInfo {
  userId: string;
  userName: string;
  userEmail: string;
  itemCount: number;
}

export function ContentImportExport({ onImportComplete }: ContentImportExportProps) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showUserSelectionModal, setShowUserSelectionModal] = useState(false);
  const [selectedExportType, setSelectedExportType] = useState<'user-herbs' | 'user-formulas' | 'user-prescriptions' | null>(null);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [exportTab, setExportTab] = useState<'herbs' | 'formulas' | 'prescriptions'>('herbs');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | 'warning' | null;
    message: string;
    details?: string[];
    filesProcessed?: number;
    totalFiles?: number;
  }>({ type: null, message: '' });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock data - in production this would come from your data store
  const getAllHerbs = (): Herb[] => {
    // TODO: Replace with actual data fetching
    // Mock data for demonstration
    return [
      {
        herb_id: 'h001',
        pinyin_name: 'Ren Shen',
        hanzi_name: '人参',
        pharmaceutical_name: 'Panax ginseng',
        english_name: 'Ginseng',
        category: 'Qi Tonifying',
        subcategory: 'Tonify the Qi',
        nature: 'Warm',
        flavor: ['Sweet', 'Slightly Bitter'],
        channels: ['LU', 'SP'],
        banned_countries: [],
        actions: [],
        indications: [],
        cautions: [],
        contraindications: [],
        dose: '3-9g',
        toxic: {
          icon: false,
          details: []
        },
        antagonisms: {
          icon: false,
          herbs: []
        },
        incompatibilities: {
          icon: false,
          herbs: []
        },
        pharmacological_effects: [],
        biological_mechanisms: [],
        bioactive_compounds: [],
        detoxification: [],
        clinical_studies_and_research: [],
        herb_drug_interactions: [],
        herb_herb_interactions: [],
        allergens: [],
        isSystemItem: true
      },
      {
        herb_id: 'uh001',
        pinyin_name: 'Custom Herb 1',
        hanzi_name: '自定义草药1',
        pharmaceutical_name: 'Custom herbis uno',
        english_name: 'Custom Herb One',
        category: 'Custom Category',
        subcategory: 'Custom Subcat',
        nature: 'Neutral',
        flavor: ['Sweet'],
        channels: ['LU'],
        banned_countries: [],
        actions: [],
        indications: [],
        cautions: [],
        contraindications: [],
        dose: '3-6g',
        toxic: {
          icon: false,
          details: []
        },
        antagonisms: {
          icon: false,
          herbs: []
        },
        incompatibilities: {
          icon: false,
          herbs: []
        },
        pharmacological_effects: [],
        biological_mechanisms: [],
        bioactive_compounds: [],
        detoxification: [],
        clinical_studies_and_research: [],
        herb_drug_interactions: [],
        herb_herb_interactions: [],
        allergens: [],
        isSystemItem: false,
        createdBy: {
          userId: 'user001',
          userName: 'Dr. Maria Chen',
          userEmail: 'maria.chen@clinic.com'
        },
        createdAt: '2026-01-15T10:30:00Z',
        updatedAt: '2026-01-15T10:30:00Z'
      },
      {
        herb_id: 'uh002',
        pinyin_name: 'Custom Herb 2',
        hanzi_name: '自定义草药2',
        pharmaceutical_name: 'Custom herbis dos',
        english_name: 'Custom Herb Two',
        category: 'Custom Category',
        subcategory: 'Custom Subcat',
        nature: 'Cool',
        flavor: ['Bitter'],
        channels: ['HT'],
        banned_countries: [],
        actions: [],
        indications: [],
        cautions: [],
        contraindications: [],
        dose: '6-12g',
        toxic: {
          icon: false,
          details: []
        },
        antagonisms: {
          icon: false,
          herbs: []
        },
        incompatibilities: {
          icon: false,
          herbs: []
        },
        pharmacological_effects: [],
        biological_mechanisms: [],
        bioactive_compounds: [],
        detoxification: [],
        clinical_studies_and_research: [],
        herb_drug_interactions: [],
        herb_herb_interactions: [],
        allergens: [],
        isSystemItem: false,
        createdBy: {
          userId: 'user001',
          userName: 'Dr. Maria Chen',
          userEmail: 'maria.chen@clinic.com'
        },
        createdAt: '2026-01-20T14:15:00Z',
        updatedAt: '2026-01-20T14:15:00Z'
      },
      {
        herb_id: 'uh003',
        pinyin_name: 'Custom Herb 3',
        hanzi_name: '自定义草药3',
        pharmaceutical_name: 'Custom herbis tres',
        english_name: 'Custom Herb Three',
        category: 'Another Category',
        subcategory: 'Another Subcat',
        nature: 'Warm',
        flavor: ['Pungent'],
        channels: ['SP', 'ST'],
        banned_countries: [],
        actions: [],
        indications: [],
        cautions: [],
        contraindications: [],
        dose: '3-9g',
        toxic: {
          icon: false,
          details: []
        },
        antagonisms: {
          icon: false,
          herbs: []
        },
        incompatibilities: {
          icon: false,
          herbs: []
        },
        pharmacological_effects: [],
        biological_mechanisms: [],
        bioactive_compounds: [],
        detoxification: [],
        clinical_studies_and_research: [],
        herb_drug_interactions: [],
        herb_herb_interactions: [],
        allergens: [],
        isSystemItem: false,
        createdBy: {
          userId: 'user002',
          userName: 'Dr. James Kim',
          userEmail: 'james.kim@clinic.com'
        },
        createdAt: '2026-02-01T09:00:00Z',
        updatedAt: '2026-02-01T09:00:00Z'
      }
    ];
  };

  const getAllFormulas = (): Formula[] => {
    // TODO: Replace with actual data fetching
    // Mock data for demonstration
    return [
      {
        formula_id: 'F001',
        pinyin_name: 'Si Jun Zi Tang',
        hanzi_name: '四君子汤',
        pharmaceutical_name: 'Four Gentlemen Decoction',
        alternative_names: [],
        category: 'Qi Tonifying',
        subcategory: 'Tonify Qi',
        source: 'Tai Ping Hui Min He Ji Ju Fang',
        composition: [],
        dosage: [],
        preparation: [],
        administration: [],
        tcm_actions: [],
        clinical_manifestations: [],
        clinical_applications: [],
        modifications: [],
        pharmacological_effects: [],
        biological_mechanisms: [],
        clinical_studies_and_research: [],
        drug_interactions: [],
        herb_interactions: [],
        allergens: [],
        cautions: [],
        contraindications: [],
        toxicology: [],
        author_notes: [],
        reference: [],
        isSystemItem: true
      },
      {
        formula_id: 'UC001',
        pinyin_name: 'Custom Formula One',
        hanzi_name: '自定义方剂一',
        pharmaceutical_name: 'Custom Formula One',
        alternative_names: [],
        category: 'Custom Category',
        subcategory: 'Custom Subcat',
        source: 'User Created',
        composition: [],
        dosage: [],
        preparation: [],
        administration: [],
        tcm_actions: [],
        clinical_manifestations: [],
        clinical_applications: [],
        modifications: [],
        pharmacological_effects: [],
        biological_mechanisms: [],
        clinical_studies_and_research: [],
        drug_interactions: [],
        herb_interactions: [],
        allergens: [],
        cautions: [],
        contraindications: [],
        toxicology: [],
        author_notes: [],
        reference: [],
        isSystemItem: false,
        createdBy: {
          userId: 'user001',
          userName: 'Dr. Maria Chen',
          userEmail: 'maria.chen@clinic.com'
        },
        createdAt: '2026-01-18T11:20:00Z',
        updatedAt: '2026-01-18T11:20:00Z'
      },
      {
        formula_id: 'UC002',
        pinyin_name: 'Custom Formula Two',
        hanzi_name: '自定义方剂二',
        pharmaceutical_name: 'Custom Formula Two',
        alternative_names: [],
        category: 'Custom Category',
        subcategory: 'Custom Subcat',
        source: 'User Created',
        composition: [],
        dosage: [],
        preparation: [],
        administration: [],
        tcm_actions: [],
        clinical_manifestations: [],
        clinical_applications: [],
        modifications: [],
        pharmacological_effects: [],
        biological_mechanisms: [],
        clinical_studies_and_research: [],
        drug_interactions: [],
        herb_interactions: [],
        allergens: [],
        cautions: [],
        contraindications: [],
        toxicology: [],
        author_notes: [],
        reference: [],
        isSystemItem: false,
        createdBy: {
          userId: 'user002',
          userName: 'Dr. James Kim',
          userEmail: 'james.kim@clinic.com'
        },
        createdAt: '2026-02-03T16:45:00Z',
        updatedAt: '2026-02-03T16:45:00Z'
      },
      {
        formula_id: 'UC003',
        pinyin_name: 'Custom Formula Three',
        hanzi_name: '自定义方剂三',
        pharmaceutical_name: 'Custom Formula Three',
        alternative_names: [],
        category: 'Another Category',
        subcategory: 'Another Subcat',
        source: 'User Created',
        composition: [],
        dosage: [],
        preparation: [],
        administration: [],
        tcm_actions: [],
        clinical_manifestations: [],
        clinical_applications: [],
        modifications: [],
        pharmacological_effects: [],
        biological_mechanisms: [],
        clinical_studies_and_research: [],
        drug_interactions: [],
        herb_interactions: [],
        allergens: [],
        cautions: [],
        contraindications: [],
        toxicology: [],
        author_notes: [],
        reference: [],
        isSystemItem: false,
        createdBy: {
          userId: 'user003',
          userName: 'Dr. Sarah Johnson',
          userEmail: 'sarah.johnson@clinic.com'
        },
        createdAt: '2026-02-05T08:30:00Z',
        updatedAt: '2026-02-05T08:30:00Z'
      }
    ];
  };

  // Get unique users from herbs or formulas
  const getUniqueUsers = (type: 'herbs' | 'formulas' | 'prescriptions'): UserInfo[] => {
    let items: any[];
    
    if (type === 'herbs') {
      items = getAllHerbs();
    } else if (type === 'formulas') {
      items = getAllFormulas();
    } else {
      items = getPrescriptionsSync();
    }
    
    const userMap = new Map<string, UserInfo>();

    items.forEach(item => {
      if (item.isSystemItem === false && item.createdBy) {
        const userId = item.createdBy.userId;
        if (userMap.has(userId)) {
          const user = userMap.get(userId)!;
          user.itemCount++;
        } else {
          userMap.set(userId, {
            userId: item.createdBy.userId,
            userName: item.createdBy.userName,
            userEmail: item.createdBy.userEmail,
            itemCount: 1,
          });
        }
      } else if (type === 'prescriptions' && item.createdBy) {
        // For prescriptions (no isSystemItem flag)
        const userId = item.createdBy.userId;
        if (userMap.has(userId)) {
          const user = userMap.get(userId)!;
          user.itemCount++;
        } else {
          userMap.set(userId, {
            userId: item.createdBy.userId,
            userName: item.createdBy.userName,
            userEmail: item.createdBy.userEmail,
            itemCount: 1,
          });
        }
      }
    });

    return Array.from(userMap.values()).sort((a, b) => a.userName.localeCompare(b.userName));
  };

  const handleExport = (type: ExportType, userId?: string) => {
    let data: any[] = [];
    let filename = '';

    const allHerbs = getAllHerbs();
    const allFormulas = getAllFormulas();

    switch (type) {
      case 'system-herbs':
        data = allHerbs.filter(h => h.isSystemItem !== false);
        filename = `system-herbs-${new Date().toISOString().split('T')[0]}.json`;
        break;
      case 'user-herbs': {
        data = allHerbs.filter(h => {
          if (h.isSystemItem !== false) return false;
          if (userId && h.createdBy?.userId !== userId) return false;
          return true;
        });
        const herbUserSuffix = userId ? `-${userId}` : '-all';
        filename = `user-herbs${herbUserSuffix}-${new Date().toISOString().split('T')[0]}.json`;
        break;
      }
      case 'system-formulas':
        data = allFormulas.filter(f => f.isSystemItem !== false);
        filename = `system-formulas-${new Date().toISOString().split('T')[0]}.json`;
        break;
      case 'user-formulas': {
        data = allFormulas.filter(f => {
          if (f.isSystemItem !== false) return false;
          if (userId && f.createdBy?.userId !== userId) return false;
          return true;
        });
        const formulaUserSuffix = userId ? `-${userId}` : '-all';
        filename = `user-formulas${formulaUserSuffix}-${new Date().toISOString().split('T')[0]}.json`;
        break;
      }
      case 'user-prescriptions': {
        data = getPrescriptionsSync().filter(p => p.createdBy?.userId === userId);
        const prescriptionUserSuffix = userId ? `-${userId}` : '-all';
        filename = `user-prescriptions${prescriptionUserSuffix}-${new Date().toISOString().split('T')[0]}.json`;
        break;
      }
    }

    // Create and download JSON file
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setShowExportModal(false);
    setShowUserSelectionModal(false);
  };

  const handleUserExportClick = (type: 'user-herbs' | 'user-formulas' | 'user-prescriptions') => {
    setSelectedExportType(type);
    setSelectedUserIds(new Set());
    setShowExportModal(false);
    setShowUserSelectionModal(true);
  };

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUserIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUserIds(newSelection);
  };

  const toggleAllUsers = () => {
    const allUsers = getUniqueUsers(
      selectedExportType === 'user-herbs' ? 'herbs' : 
      selectedExportType === 'user-formulas' ? 'formulas' : 
      'prescriptions'
    );
    if (selectedUserIds.size === allUsers.length) {
      // Deselect all
      setSelectedUserIds(new Set());
    } else {
      // Select all
      setSelectedUserIds(new Set(allUsers.map(u => u.userId)));
    }
  };

  const handleExportSelected = async () => {
    if (selectedUserIds.size === 0) return;

    const type = selectedExportType!;
    const userIds = Array.from(selectedUserIds);
    
    for (let i = 0; i < userIds.length; i++) {
      const userId = userIds[i];
      let userData: any[] = [];
      let filename = '';
      
      if (type === 'user-herbs') {
        const allHerbs = getAllHerbs();
        userData = allHerbs.filter(item => 
          item.isSystemItem === false && item.createdBy?.userId === userId
        );
        if (userData.length > 0) {
          const userInfo = userData[0].createdBy!;
          filename = `user-herbs-${userInfo.userName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
        }
      } else if (type === 'user-formulas') {
        const allFormulas = getAllFormulas();
        userData = allFormulas.filter(item => 
          item.isSystemItem === false && item.createdBy?.userId === userId
        );
        if (userData.length > 0) {
          const userInfo = userData[0].createdBy!;
          filename = `user-formulas-${userInfo.userName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
        }
      } else if (type === 'user-prescriptions') {
        const allPrescriptions = getPrescriptionsSync();
        const filteredPrescriptions = allPrescriptions.filter(item => item.createdBy?.userId === userId);
        
        // Filter prescription data to only include necessary fields
        userData = filteredPrescriptions.map(prescription => ({
          createdBy: prescription.createdBy,
          id: prescription.id,
          createdAt: prescription.createdAt,
          prescription_name: prescription.name,
          components: prescription.components,
          comments: prescription.comments
        }));
        
        if (userData.length > 0 && userData[0].createdBy) {
          const userInfo = userData[0].createdBy;
          filename = `user-prescriptions-${userInfo.userName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
        }
      }

      if (userData.length > 0 && filename) {
        const jsonString = JSON.stringify(userData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Add delay between downloads to prevent browser blocking
        if (i < userIds.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    }

    setShowUserSelectionModal(false);
    setSelectedUserIds(new Set());
  };

  const validateHerbStructure = (item: any, index: number): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const itemLabel = `Item ${index + 1}`;

    // Required fields
    if (!item.herb_id || typeof item.herb_id !== 'string') {
      errors.push(`${itemLabel}: herb_id is required and must be a string`);
    }
    if (!item.pinyin_name || typeof item.pinyin_name !== 'string') {
      errors.push(`${itemLabel}: pinyin_name is required and must be a string`);
    }

    // Simple array fields
    const arrayFields = [
      'flavor', 'channels', 'toxicology', 'banned_countries', 'indications',
      'cautions', 'contraindications', 'antagonisms', 'incompatibilities',
      'pharmacological_effects', 'compounds', 'clinical_studies_and_research',
      'herb_drug_interactions', 'herb_herb_interactions', 'allergens', 'notes', 'references'
    ];

    arrayFields.forEach(field => {
      if (item[field] !== undefined && !Array.isArray(item[field])) {
        errors.push(`${itemLabel}: ${field} must be an array`);
      }
    });

    // Complex structure: actions (can be array of strings OR array of objects)
    if (item.actions !== undefined) {
      if (!Array.isArray(item.actions)) {
        errors.push(`${itemLabel}: actions must be an array`);
      } else {
        item.actions.forEach((action: any, i: number) => {
          // Accept both string format and object format
          if (typeof action === 'string') {
            // Simple string format is valid
            return;
          } else if (typeof action === 'object' && action !== null) {
            // Complex object format
            if (action.title !== undefined && typeof action.title !== 'string') {
              errors.push(`${itemLabel}: actions[${i}].title must be a string`);
            }
            if (action.branches !== undefined) {
              if (!Array.isArray(action.branches)) {
                errors.push(`${itemLabel}: actions[${i}].branches must be an array`);
              } else {
                action.branches.forEach((branch: any, j: number) => {
                  if (typeof branch !== 'object' || branch === null) {
                    errors.push(`${itemLabel}: actions[${i}].branches[${j}] must be an object`);
                  } else {
                    if (branch.combination !== undefined && !Array.isArray(branch.combination)) {
                      errors.push(`${itemLabel}: actions[${i}].branches[${j}].combination must be an array`);
                    }
                  }
                });
              }
            }
          } else {
            errors.push(`${itemLabel}: actions[${i}] must be a string or object`);
          }
        });
      }
    }

    // Complex structure: biological_mechanisms (can be array of strings OR array of objects)
    if (item.biological_mechanisms !== undefined) {
      if (!Array.isArray(item.biological_mechanisms)) {
        errors.push(`${itemLabel}: biological_mechanisms must be an array`);
      } else {
        item.biological_mechanisms.forEach((mech: any, i: number) => {
          // Accept both string format and object format
          if (typeof mech === 'string') {
            // Simple string format is valid
            return;
          } else if (typeof mech === 'object' && mech !== null) {
            // Complex object format with system and target_action
            // Valid as long as it's an object
            return;
          } else {
            errors.push(`${itemLabel}: biological_mechanisms[${i}] must be a string or object`);
          }
        });
      }
    }

    // Complex structure: bioactive_compounds (can be array of strings OR array of objects with chemical_class)
    if (item.bioactive_compounds !== undefined) {
      if (!Array.isArray(item.bioactive_compounds)) {
        errors.push(`${itemLabel}: bioactive_compounds must be an array`);
      } else {
        item.bioactive_compounds.forEach((compound: any, i: number) => {
          // Accept both string format and object format
          if (typeof compound === 'string') {
            // Simple string format is valid
            return;
          } else if (typeof compound === 'object' && compound !== null) {
            // Complex object format with chemical_class and compounds
            if (compound.chemical_class !== undefined && typeof compound.chemical_class !== 'string') {
              errors.push(`${itemLabel}: bioactive_compounds[${i}].chemical_class must be a string`);
            }
            if (compound.compounds !== undefined && !Array.isArray(compound.compounds)) {
              errors.push(`${itemLabel}: bioactive_compounds[${i}].compounds must be an array`);
            }
          } else {
            errors.push(`${itemLabel}: bioactive_compounds[${i}] must be a string or object`);
          }
        });
      }
    }

    // Complex structure: clinical_applications
    if (item.clinical_applications !== undefined) {
      if (!Array.isArray(item.clinical_applications)) {
        errors.push(`${itemLabel}: clinical_applications must be an array`);
      } else {
        item.clinical_applications.forEach((app: any, i: number) => {
          if (typeof app !== 'object' || app === null) {
            errors.push(`${itemLabel}: clinical_applications[${i}] must be an object with 'condition' and 'pattern' fields`);
          }
        });
      }
    }

    // Complex structure: dui_yao
    if (item.dui_yao !== undefined) {
      if (!Array.isArray(item.dui_yao)) {
        errors.push(`${itemLabel}: dui_yao must be an array`);
      } else {
        item.dui_yao.forEach((dy: any, i: number) => {
          if (typeof dy !== 'object' || dy === null) {
            errors.push(`${itemLabel}: dui_yao[${i}] must be an object`);
          } else {
            if (dy.pair !== undefined && !Array.isArray(dy.pair)) {
              errors.push(`${itemLabel}: dui_yao[${i}].pair must be an array`);
            }
            if (dy.functions !== undefined && !Array.isArray(dy.functions)) {
              errors.push(`${itemLabel}: dui_yao[${i}].functions must be an array`);
            }
          }
        });
      }
    }

    return { valid: errors.length === 0, errors };
  };

  const validateFormulaStructure = (item: any, index: number): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const itemLabel = `Item ${index + 1}`;

    // Required fields
    if (!item.formula_id || typeof item.formula_id !== 'string') {
      errors.push(`${itemLabel}: formula_id is required and must be a string`);
    }
    if (!item.pinyin_name || typeof item.pinyin_name !== 'string') {
      errors.push(`${itemLabel}: pinyin_name is required and must be a string`);
    }

    // Simple array fields
    const arrayFields = [
      'alternative_names', 'dosage', 'preparation', 'administration',
      'tcm_actions', 'clinical_manifestations', 'pharmacological_effects',
      'clinical_studies_and_research', 'drug_interactions', 'herb_interactions',
      'allergens', 'cautions', 'contraindications', 'toxicology', 'notes', 'reference'
    ];

    arrayFields.forEach(field => {
      if (item[field] !== undefined && !Array.isArray(item[field])) {
        errors.push(`${itemLabel}: ${field} must be an array`);
      }
    });

    // Complex structure: composition (can have simple or complex format)
    if (item.composition !== undefined) {
      if (!Array.isArray(item.composition)) {
        errors.push(`${itemLabel}: composition must be an array`);
      } else {
        item.composition.forEach((comp: any, i: number) => {
          if (typeof comp !== 'object' || comp === null) {
            errors.push(`${itemLabel}: composition[${i}] must be an object`);
          } else {
            // Validate basic fields present in both simple and complex formats
            if (comp.herb_pinyin !== undefined && typeof comp.herb_pinyin !== 'string') {
              errors.push(`${itemLabel}: composition[${i}].herb_pinyin must be a string`);
            }
            if (comp.pharmaceutical_name !== undefined && typeof comp.pharmaceutical_name !== 'string') {
              errors.push(`${itemLabel}: composition[${i}].pharmaceutical_name must be a string`);
            }
            if (comp.dosage !== undefined && typeof comp.dosage !== 'string') {
              errors.push(`${itemLabel}: composition[${i}].dosage must be a string`);
            }
            // Complex format fields (optional)
            if (comp.role !== undefined && typeof comp.role !== 'string') {
              errors.push(`${itemLabel}: composition[${i}].role must be a string`);
            }
            if (comp.function_in_formula !== undefined && typeof comp.function_in_formula !== 'string') {
              errors.push(`${itemLabel}: composition[${i}].function_in_formula must be a string`);
            }
          }
        });
      }
    }

    // Complex structure: clinical_applications
    if (item.clinical_applications !== undefined) {
      if (!Array.isArray(item.clinical_applications)) {
        errors.push(`${itemLabel}: clinical_applications must be an array`);
      } else {
        item.clinical_applications.forEach((app: any, i: number) => {
          if (typeof app !== 'object' || app === null) {
            errors.push(`${itemLabel}: clinical_applications[${i}] must be an object with 'condition' and 'pattern' fields`);
          }
        });
      }
    }

    // Complex structure: modifications
    if (item.modifications !== undefined) {
      if (!Array.isArray(item.modifications)) {
        errors.push(`${itemLabel}: modifications must be an array`);
      } else {
        item.modifications.forEach((mod: any, i: number) => {
          if (typeof mod !== 'object' || mod === null) {
            errors.push(`${itemLabel}: modifications[${i}] must be an object`);
          } else {
            if (mod.add !== undefined && !Array.isArray(mod.add)) {
              errors.push(`${itemLabel}: modifications[${i}].add must be an array`);
            }
            if (mod.remove !== undefined && !Array.isArray(mod.remove)) {
              errors.push(`${itemLabel}: modifications[${i}].remove must be an array`);
            }
          }
        });
      }
    }

    // Complex structure: biological_mechanisms (can be array of strings OR array of objects)
    if (item.biological_mechanisms !== undefined) {
      if (!Array.isArray(item.biological_mechanisms)) {
        errors.push(`${itemLabel}: biological_mechanisms must be an array`);
      } else {
        item.biological_mechanisms.forEach((mech: any, i: number) => {
          if (typeof mech === 'string') {
            // Simple string format is valid
            return;
          } else if (typeof mech === 'object' && mech !== null) {
            // Complex object format is valid
            return;
          } else {
            errors.push(`${itemLabel}: biological_mechanisms[${i}] must be a string or object`);
          }
        });
      }
    }

    return { valid: errors.length === 0, errors };
  };

  const validateHerb = (item: any): item is Herb => {
    const requiredFields = ['herb_id', 'pinyin_name'];
    return requiredFields.every(field => field in item && item[field]);
  };

  const validateFormula = (item: any): item is Formula => {
    const requiredFields = ['formula_id', 'pinyin_name'];
    return requiredFields.every(field => field in item && item[field]);
  };

  const processImportFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      // Determine if it's an array or single item
      const items = Array.isArray(parsed) ? parsed : [parsed];

      if (items.length === 0) {
        return {
          success: false,
          error: 'No items found in JSON file',
          validItems: [],
          invalidItems: []
        };
      }

      // Detect type (herb or formula) from first item
      const firstItem = items[0];
      const isHerb = validateHerb(firstItem);
      const isFormula = validateFormula(firstItem);

      if (!isHerb && !isFormula) {
        return {
          success: false,
          error: 'Could not detect valid herb or formula structure in JSON',
          validItems: [],
          invalidItems: []
        };
      }

      // Validate all items
      const validItems: (Herb | Formula)[] = [];
      const invalidItems: string[] = [];
      const existingIds = new Set<string>();

      // Check for duplicate IDs with existing system data
      if (isHerb) {
        const allHerbs = getAllHerbs();
        allHerbs.forEach(h => existingIds.add(h.herb_id));
      } else if (isFormula) {
        const allFormulas = getAllFormulas();
        allFormulas.forEach(f => existingIds.add(f.formula_id));
      }

      items.forEach((item, index) => {
        if (isHerb) {
          // Validate structure first
          const structureValidation = validateHerbStructure(item, index);

          if (!structureValidation.valid) {
            invalidItems.push(...structureValidation.errors);
          } else if (validateHerb(item)) {
            // Check for duplicate ID
            if (existingIds.has(item.herb_id)) {
              invalidItems.push(`Item ${index + 1}: Duplicate ID '${item.herb_id}' already exists in system`);
            } else {
              validItems.push(item as Herb);
              existingIds.add(item.herb_id);
            }
          }
        } else if (isFormula) {
          // Validate structure first
          const structureValidation = validateFormulaStructure(item, index);

          if (!structureValidation.valid) {
            invalidItems.push(...structureValidation.errors);
          } else if (validateFormula(item)) {
            // Check for duplicate ID
            if (existingIds.has(item.formula_id)) {
              invalidItems.push(`Item ${index + 1}: Duplicate ID '${item.formula_id}' already exists in system`);
            } else {
              validItems.push(item as Formula);
              existingIds.add(item.formula_id);
            }
          }
        } else {
          invalidItems.push(`Item ${index + 1}: Missing required fields`);
        }
      });

      return {
        success: validItems.length > 0,
        type: isHerb ? 'herbs' : 'formulas',
        validItems,
        invalidItems
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        validItems: [],
        invalidItems: []
      };
    }
  };

  const processMultipleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    let totalValidHerbs = 0;
    let totalValidFormulas = 0;
    let totalInvalidItems: string[] = [];
    let totalErrors: string[] = [];
    let allValidItems: (Herb | Formula)[] = [];
    let itemType: 'herbs' | 'formulas' | null = null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const result = await processImportFile(file);

      if (result.success) {
        allValidItems.push(...result.validItems);
        if (result.type === 'herbs') {
          totalValidHerbs += result.validItems.length;
          itemType = 'herbs';
        } else {
          totalValidFormulas += result.validItems.length;
          itemType = 'formulas';
        }
        if (result.invalidItems.length > 0) {
          totalInvalidItems.push(`${file.name}: ${result.invalidItems.join(', ')}`);
        }
      } else {
        totalErrors.push(`${file.name}: ${result.error || 'Failed to process'}`);
      }
    }

    const totalValid = totalValidHerbs + totalValidFormulas;
    const hasErrors = totalErrors.length > 0;
    const hasWarnings = totalInvalidItems.length > 0;

    if (totalValid === 0) {
      setImportStatus({
        type: 'error',
        message: `Failed to import any items from ${files.length} file${files.length > 1 ? 's' : ''}`,
        details: [...totalErrors, ...totalInvalidItems],
        filesProcessed: files.length,
        totalFiles: files.length
      });
      return;
    }

    let message = '';
    if (totalValidHerbs > 0 && totalValidFormulas > 0) {
      message = `Successfully imported ${totalValidHerbs} herbs and ${totalValidFormulas} formulas from ${files.length} file${files.length > 1 ? 's' : ''}`;
    } else if (totalValidHerbs > 0) {
      message = `Successfully imported ${totalValidHerbs} herbs from ${files.length} file${files.length > 1 ? 's' : ''}`;
    } else {
      message = `Successfully imported ${totalValidFormulas} formulas from ${files.length} file${files.length > 1 ? 's' : ''}`;
    }

    if (hasErrors || hasWarnings) {
      message += ` (${totalErrors.length + totalInvalidItems.length} issue${totalErrors.length + totalInvalidItems.length > 1 ? 's' : ''})`;
    }

    setImportStatus({
      type: hasErrors || hasWarnings ? 'warning' : 'success',
      message,
      details: hasErrors || hasWarnings ? [...totalErrors, ...totalInvalidItems] : undefined,
      filesProcessed: files.length,
      totalFiles: files.length
    });

    // Callback to parent component
    if (onImportComplete && itemType && allValidItems.length > 0) {
      onImportComplete(allValidItems, itemType);
    }

    // Auto-close modal after success (only if no errors or warnings)
    if (!hasErrors && !hasWarnings) {
      setTimeout(() => {
        setShowImportModal(false);
        setImportStatus({ type: null, message: '' });
      }, 2000);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processMultipleFiles(Array.from(files));
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const files = Array.from(event.dataTransfer.files).filter(
      file => file.type === 'application/json'
    );

    if (files.length === 0) {
      setImportStatus({
        type: 'error',
        message: 'Invalid file type',
        details: ['Please upload JSON files only'],
      });
      return;
    }

    processMultipleFiles(files);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex gap-3">
      {/* Import Button */}
      <button
        onClick={() => setShowImportModal(true)}
        className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        <span className="hidden sm:inline">Import JSON</span>
      </button>

      {/* Export Button */}
      <button
        onClick={() => setShowExportModal(true)}
        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export JSON</span>
      </button>

      {/* Export Modal */}
      {showExportModal && createPortal(
        <div className="fixed inset-0 bg-black/50 flex sm:items-center justify-center items-end z-[9999] sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Export Content</h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Choose which content to export as JSON file
            </p>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => setExportTab('herbs')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  exportTab === 'herbs'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Herbs
              </button>
              <button
                onClick={() => setExportTab('formulas')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  exportTab === 'formulas'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Formulas
              </button>
              <button
                onClick={() => setExportTab('prescriptions')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                  exportTab === 'prescriptions'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Prescriptions
              </button>
            </div>

            <div className="space-y-3">
              {/* Herbs Tab Content */}
              {exportTab === 'herbs' && (
                <>
                  <button
                    onClick={() => handleExport('system-herbs')}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all text-left group"
                  >
                    <h3 className="font-medium text-gray-900 group-hover:text-teal-700 mb-1">
                      System Herbs
                    </h3>
                    <p className="text-xs text-gray-600">
                      All default herbs included in the system
                    </p>
                  </button>

                  <button
                    onClick={() => handleUserExportClick('user-herbs')}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all text-left group"
                  >
                    <h3 className="font-medium text-gray-900 group-hover:text-teal-700 mb-1">
                      User Added Herbs
                    </h3>
                    <p className="text-xs text-gray-600">
                      Custom herbs created by users (includes creator information)
                    </p>
                  </button>
                </>
              )}

              {/* Formulas Tab Content */}
              {exportTab === 'formulas' && (
                <>
                  <button
                    onClick={() => handleExport('system-formulas')}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all text-left group"
                  >
                    <h3 className="font-medium text-gray-900 group-hover:text-teal-700 mb-1">
                      System Formulas
                    </h3>
                    <p className="text-xs text-gray-600">
                      All default formulas included in the system
                    </p>
                  </button>

                  <button
                    onClick={() => handleUserExportClick('user-formulas')}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all text-left group"
                  >
                    <h3 className="font-medium text-gray-900 group-hover:text-teal-700 mb-1">
                      User Added Formulas
                    </h3>
                    <p className="text-xs text-gray-600">
                      Custom formulas created by users (includes creator information)
                    </p>
                  </button>
                </>
              )}

              {/* Prescriptions Tab Content */}
              {exportTab === 'prescriptions' && (
                <>
                  <button
                    onClick={() => handleUserExportClick('user-prescriptions')}
                    className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all text-left group"
                  >
                    <h3 className="font-medium text-gray-900 group-hover:text-teal-700 mb-1">
                      User Added Prescriptions
                    </h3>
                    <p className="text-xs text-gray-600">
                      Prescriptions created by users (includes creator information)
                    </p>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* User Selection Modal */}
      {showUserSelectionModal && createPortal((() => {
        const allUsers = getUniqueUsers(
          selectedExportType === 'user-herbs' ? 'herbs' :
          selectedExportType === 'user-formulas' ? 'formulas' :
          'prescriptions'
        );
        const allSelected = selectedUserIds.size === allUsers.length && allUsers.length > 0;

        return (
          <div className="fixed inset-0 bg-black/50 flex sm:items-center justify-center items-end z-[9999] sm:p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Select Users</h2>
                  {selectedUserIds.size > 0 && (
                    <p className="text-sm text-teal-600 mt-1">
                      {selectedUserIds.size} user{selectedUserIds.size !== 1 ? 's' : ''} selected
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowUserSelectionModal(false);
                    setSelectedUserIds(new Set());
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Select users to export. One JSON file will be generated per user.
              </p>

              <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                {/* All Users Checkbox */}
                <label
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    allSelected
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAllUsers}
                    className="w-5 h-5 flex-shrink-0 text-teal-600 rounded border-gray-300 focus:ring-teal-500 focus:ring-2 cursor-pointer mt-0.5"
                  />
                  <div className="flex-1">
                    <h3 className={`font-medium ${allSelected ? 'text-teal-700' : 'text-gray-900'}`}>
                      All Users
                    </h3>
                    <p className="text-xs text-gray-600">
                      Select all {allUsers.length} users ({allUsers.length} individual files)
                    </p>
                  </div>
                </label>

                {/* Individual User Checkboxes */}
                {allUsers.map(user => {
                  const isSelected = selectedUserIds.has(user.userId);
                  return (
                    <label
                      key={user.userId}
                      className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleUserSelection(user.userId)}
                        className="w-5 h-5 flex-shrink-0 text-teal-600 rounded border-gray-300 focus:ring-teal-500 focus:ring-2 cursor-pointer mt-0.5"
                      />
                      <div className="flex-1">
                        <h3 className={`font-medium ${isSelected ? 'text-teal-700' : 'text-gray-900'}`}>
                          {user.userName}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {user.itemCount} item{user.itemCount !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* Export Button */}
              <button
                onClick={handleExportSelected}
                disabled={selectedUserIds.size === 0}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  selectedUserIds.size === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                }`}
              >
                {selectedUserIds.size === 0
                  ? 'Select users to export'
                  : `Export ${selectedUserIds.size} file${selectedUserIds.size !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        );
      })(), document.body)}

      {/* Import Modal */}
      <Dialog.Root open={showImportModal} onOpenChange={setShowImportModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[70]" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:max-w-lg w-full sm:max-h-[90vh] overflow-hidden z-[80] flex flex-col">
            <Dialog.Description className="sr-only">
              Import herbs or formulas from JSON files
            </Dialog.Description>

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
              <Dialog.Title className="text-xl font-semibold text-gray-900">Import Content</Dialog.Title>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportStatus({ type: null, message: '' });
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-sm text-gray-600 mb-6">
                Upload JSON files containing herbs or formulas. Each file can contain a single item or an array of items. You can select or drag multiple files at once.
              </p>

              {/* Drag & Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                  isDragging
                    ? 'border-teal-500 bg-teal-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-teal-600' : 'text-gray-400'}`} />
                <p className="text-sm font-medium text-gray-900 mb-2">
                  {isDragging ? 'Drop files here' : 'Drag and drop your JSON files here'}
                </p>
                <p className="text-xs text-gray-500 mb-4">or</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                >
                  Browse Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                  multiple
                />
              </div>

              {/* Status Message */}
              {importStatus.type && (
                <div
                  className={`mt-4 p-4 rounded-lg border ${
                    importStatus.type === 'success'
                      ? 'bg-green-50 border-green-200'
                      : importStatus.type === 'warning'
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {importStatus.type === 'success' ? (
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        importStatus.type === 'warning' ? 'text-yellow-600' : 'text-red-600'
                      }`} />
                    )}
                    <div className="flex-1">
                      <p
                        className={`text-sm font-medium ${
                          importStatus.type === 'success'
                            ? 'text-green-900'
                            : importStatus.type === 'warning'
                            ? 'text-yellow-900'
                            : 'text-red-900'
                        }`}
                      >
                        {importStatus.message}
                      </p>
                      {importStatus.details && importStatus.details.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {importStatus.details.slice(0, 5).map((detail, index) => (
                            <li
                              key={index}
                              className={`text-xs ${
                                importStatus.type === 'warning' ? 'text-yellow-700' : 'text-red-700'
                              }`}
                            >
                              • {detail}
                            </li>
                          ))}
                          {importStatus.details.length > 5 && (
                            <li
                              className={`text-xs ${
                                importStatus.type === 'warning' ? 'text-yellow-700' : 'text-red-700'
                              }`}
                            >
                              ... and {importStatus.details.length - 5} more
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Format:</strong> The system automatically detects whether your JSON contains herbs or formulas. User-created items will preserve creator information (userId, userName, userEmail) for proper attribution.
                </p>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}