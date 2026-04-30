import { useState, useEffect } from 'react';
import type { GlobalSettings } from '@/app/components/GlobalSettingsModal';

const GLOBAL_SETTINGS_KEY = 'globalDisplaySettings';

// Event for cross-component communication
const SETTINGS_UPDATE_EVENT = 'globalSettingsUpdate';

// Default settings (centralized)
const getDefaultSettings = (): GlobalSettings => ({
  herbs: {
    pinyin: true,
    pharmaceutical: true,
    hanzi: true,
    category: true,
    subcategory: true,
    flavor: true,
    channels: true,
    natureIndicator: true,
    sortOrder: 'alphabetical',
    order: ['pinyin', 'pharmaceutical', 'hanzi', 'category', 'subcategory', 'flavor', 'channels'],
    detailViewChipsNature: true,
    detailViewNameOrder: ['pinyin', 'pharmaceutical', 'hanzi'],
    detailViewPinyin: true,
    detailViewPharmaceutical: true,
    detailViewHanzi: true,
  },
  formulas: {
    pinyin: true,
    pharmaceutical: true,
    hanzi: true,
    category: true,
    subcategory: true,
    thermalActionIndicator: false,
    sortOrder: 'alphabetical',
    order: ['pinyin', 'pharmaceutical', 'hanzi', 'category', 'subcategory'],
    ingredientsShowFormulas: true,
    ingredientsNatureIndicator: false,
    ingredientsThermalIndicator: false,
    ingredientsLayout: 'grid',
    ingredientsHerbPinyin: true,
    ingredientsHerbLatin: false,
    ingredientsHerbHanzi: false,
    ingredientsHerbOrder: ['pinyin', 'latin', 'hanzi'],
    ingredientsFormulaPinyin: true,
    ingredientsFormulaPharmaceutical: false,
    ingredientsFormulaHanzi: false,
    ingredientsFormulaOrder: ['pinyin', 'pharmaceutical', 'hanzi'],
    detailViewChipsThermalAction: true,
    detailViewNameOrder: ['pinyin', 'pharmaceutical', 'alternative', 'hanzi'],
    detailViewPinyin: true,
    detailViewPharmaceutical: true,
    detailViewAlternative: true,
    detailViewHanzi: true,
  },
  prescriptions: {
    list: {
      ingredients: true,
      comments: true,
    },
    defaultCommentary: '',
    display: {
      herbs: {
        pinyin: true,
        latin: true,
        hanzi: true,
        order: ['pinyin', 'latin', 'hanzi'],
      },
      formulas: {
        pinyin: true,
        pharmaceutical: true,
        hanzi: true,
        ingredients: true,
        order: ['pinyin', 'pharmaceutical', 'hanzi'],
      },
      safetyFilters: 'filtered',
      preview: {
        natureIndicator: true,
        thermalActionIndicator: true,
        ingredientsLayout: 'grid',
      },
    },
    copy: {
      herbs: {
        pinyin: true,
        latin: true,
        hanzi: true,
        order: ['pinyin', 'latin', 'hanzi'],
      },
      formulas: {
        pinyin: true,
        pharmaceutical: true,
        hanzi: true,
        ingredients: true,
        order: ['pinyin', 'pharmaceutical', 'hanzi'],
      },
      includeName: true,
      includeComponents: true,
      includeFilters: true,
      includeComments: false,
      sectionOrder: ['name', 'components', 'filters', 'comments'],
    },
  },
  builder: {
    herbsList: {
      pinyin: true,
      latin: true,
      hanzi: true,
      natureIndicator: true,
      order: ['pinyin', 'latin', 'hanzi'],
    },
    formulasList: {
      pinyin: true,
      pharmaceutical: true,
      hanzi: true,
      thermalActionIndicator: false,
      order: ['pinyin', 'pharmaceutical', 'hanzi'],
    },
    prescriptionBuilder: {
      herbs: {
        pinyin: true,
        latin: true,
        hanzi: true,
        order: ['pinyin', 'latin', 'hanzi'],
      },
      formulas: {
        pinyin: true,
        pharmaceutical: true,
        hanzi: true,
        ingredients: true,
        order: ['pinyin', 'pharmaceutical', 'hanzi'],
      },
    },
    preview: {
      herbs: {
        pinyin: true,
        latin: true,
        hanzi: true,
        order: ['pinyin', 'latin', 'hanzi'],
      },
      formulas: {
        pinyin: true,
        pharmaceutical: true,
        hanzi: true,
        ingredients: true,
        order: ['pinyin', 'pharmaceutical', 'hanzi'],
      },
      ingredientsNatureIndicator: false,
      ingredientsThermalIndicator: false,
      ingredientsLayout: 'grid',
    },
  },
});

// Deep merge function to combine saved and default settings
function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  
  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = result[key];
    
    if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
      // Recursively merge objects
      result[key] = deepMerge(
        targetValue && typeof targetValue === 'object' && !Array.isArray(targetValue) 
          ? targetValue 
          : {} as any,
        sourceValue
      );
    } else if (sourceValue !== undefined) {
      // Use source value if defined
      result[key] = sourceValue as any;
    }
  }
  
  return result;
}

// Migration function to convert old 'pharmaceutical' to 'latin' for herbs
function migrateSettings(settings: any): GlobalSettings {
  const migrated = { ...settings };
  
  // Migrate builder.herbsList
  if (migrated.builder?.herbsList) {
    const herbsList = migrated.builder.herbsList;
    // Convert order array: pharmaceutical -> latin
    if (herbsList.order && Array.isArray(herbsList.order)) {
      herbsList.order = herbsList.order.map((item: string) => 
        item === 'pharmaceutical' ? 'latin' : item
      );
    }
    // Rename pharmaceutical property to latin
    if ('pharmaceutical' in herbsList) {
      herbsList.latin = herbsList.pharmaceutical;
      delete herbsList.pharmaceutical;
    }
  }
  
  // Migrate builder.prescriptionBuilder.herbs
  if (migrated.builder?.prescriptionBuilder?.herbs) {
    const herbs = migrated.builder.prescriptionBuilder.herbs;
    if (herbs.order && Array.isArray(herbs.order)) {
      herbs.order = herbs.order.map((item: string) => 
        item === 'pharmaceutical' ? 'latin' : item
      );
    }
    if ('pharmaceutical' in herbs) {
      herbs.latin = herbs.pharmaceutical;
      delete herbs.pharmaceutical;
    }
  }
  
  // Migrate builder.preview.herbs
  if (migrated.builder?.preview?.herbs) {
    const herbs = migrated.builder.preview.herbs;
    if (herbs.order && Array.isArray(herbs.order)) {
      herbs.order = herbs.order.map((item: string) => 
        item === 'pharmaceutical' ? 'latin' : item
      );
    }
    if ('pharmaceutical' in herbs) {
      herbs.latin = herbs.pharmaceutical;
      delete herbs.pharmaceutical;
    }
  }
  
  // Migrate prescriptions.display.herbs (already correct, but check)
  if (migrated.prescriptions?.display?.herbs) {
    const herbs = migrated.prescriptions.display.herbs;
    if (herbs.order && Array.isArray(herbs.order)) {
      herbs.order = herbs.order.map((item: string) => 
        item === 'pharmaceutical' ? 'latin' : item
      );
    }
    if ('pharmaceutical' in herbs) {
      herbs.latin = herbs.pharmaceutical;
      delete herbs.pharmaceutical;
    }
  }
  
  // Migrate prescriptions.copy.herbs
  if (migrated.prescriptions?.copy?.herbs) {
    const herbs = migrated.prescriptions.copy.herbs;
    if (herbs.order && Array.isArray(herbs.order)) {
      herbs.order = herbs.order.map((item: string) => 
        item === 'pharmaceutical' ? 'latin' : item
      );
    }
    if ('pharmaceutical' in herbs) {
      herbs.latin = herbs.pharmaceutical;
      delete herbs.pharmaceutical;
    }
  }
  
  return migrated as GlobalSettings;
}

export function useGlobalSettings() {
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(() => {
    const defaults = getDefaultSettings();
    
    try {
      const saved = localStorage.getItem(GLOBAL_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Apply migration before merging
        const migrated = migrateSettings(parsed);
        // Merge saved settings with defaults to ensure all fields exist
        const merged = deepMerge(defaults, migrated);
        // Save the migrated settings back to localStorage
        localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (error) {
      console.error('Error loading global settings:', error);
    }

    return defaults;
  });

  useEffect(() => {
    // Listen for updates from GlobalSettingsModal
    const handleSettingsUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<GlobalSettings>;
      if (customEvent.detail) {
        setGlobalSettings(customEvent.detail);
      }
    };

    window.addEventListener(SETTINGS_UPDATE_EVENT, handleSettingsUpdate);

    return () => {
      window.removeEventListener(SETTINGS_UPDATE_EVENT, handleSettingsUpdate);
    };
  }, []);

  const updateGlobalSettings = (newSettings: GlobalSettings) => {
    setGlobalSettings(newSettings);
    localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(newSettings));
    
    // Dispatch event to notify other components
    window.dispatchEvent(
      new CustomEvent(SETTINGS_UPDATE_EVENT, { detail: newSettings })
    );
  };

  return {
    globalSettings,
    updateGlobalSettings,
  };
}