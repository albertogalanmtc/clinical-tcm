import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Tabs from '@radix-ui/react-tabs';
import { X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

// Herbs Library Settings
export interface HerbsLibrarySettings {
  pinyin: boolean;
  pharmaceutical: boolean;
  hanzi: boolean;
  category: boolean;
  subcategory: boolean;
  flavor: boolean;
  channels: boolean;
  natureIndicator: boolean;
  sortOrder: 'alphabetical' | 'categorical';
  order: ('pinyin' | 'pharmaceutical' | 'hanzi' | 'category' | 'subcategory' | 'flavor' | 'channels')[];
  // Detail View Settings
  detailViewChipsNature: boolean;
  detailViewNameOrder: ('pinyin' | 'pharmaceutical' | 'hanzi')[];
  detailViewPinyin: boolean;
  detailViewPharmaceutical: boolean;
  detailViewHanzi: boolean;
}

// Formulas Library Settings
export interface FormulasLibrarySettings {
  pinyin: boolean;
  pharmaceutical: boolean;
  hanzi: boolean;
  category: boolean;
  subcategory: boolean;
  thermalActionIndicator: boolean;
  sortOrder: 'alphabetical' | 'categorical';
  order: ('pinyin' | 'pharmaceutical' | 'hanzi' | 'category' | 'subcategory')[];
  // Detail View Settings
  ingredientsShowFormulas: boolean;
  ingredientsNatureIndicator: boolean;
  ingredientsThermalIndicator: boolean;
  ingredientsLayout: 'grid' | 'list';
  // Detail View - Herbs display
  ingredientsHerbPinyin: boolean;
  ingredientsHerbLatin: boolean;
  ingredientsHerbHanzi: boolean;
  ingredientsHerbOrder: ('pinyin' | 'latin' | 'hanzi')[];
  // Detail View - Formulas display
  ingredientsFormulaPinyin: boolean;
  ingredientsFormulaPharmaceutical: boolean;
  ingredientsFormulaHanzi: boolean;
  ingredientsFormulaOrder: ('pinyin' | 'pharmaceutical' | 'hanzi')[];
  // Detail View - Chips display
  detailViewChipsThermalAction: boolean;
  // Detail View - Names display
  detailViewNameOrder: ('pinyin' | 'pharmaceutical' | 'alternative' | 'hanzi')[];
  detailViewPinyin: boolean;
  detailViewPharmaceutical: boolean;
  detailViewAlternative: boolean;
  detailViewHanzi: boolean;
}

// Prescriptions Settings
export interface PrescriptionsSettings {
  // List Display
  list: {
    ingredients: boolean;
    comments: boolean;
  };
  // Default Commentary
  defaultCommentary: string;
  // Display Settings (for prescription detail view)
  display: {
    herbs: {
      pinyin: boolean;
      latin: boolean;
      hanzi: boolean;
      order: ('pinyin' | 'latin' | 'hanzi')[];
    };
    formulas: {
      pinyin: boolean;
      pharmaceutical: boolean;
      hanzi: boolean;
      ingredients: boolean;
      order: ('pinyin' | 'pharmaceutical' | 'hanzi')[];
    };
    safetyFilters: 'filtered' | 'all';
    preview: {
      natureIndicator: boolean;
      thermalActionIndicator: boolean;
      ingredientsLayout: 'grid' | 'list';
    };
  };
  // Copy Format Settings
  copy: {
    herbs: {
      pinyin: boolean;
      latin: boolean;
      hanzi: boolean;
      order: ('pinyin' | 'latin' | 'hanzi')[];
    };
    formulas: {
      pinyin: boolean;
      pharmaceutical: boolean;
      hanzi: boolean;
      ingredients: boolean;
      order: ('pinyin' | 'pharmaceutical' | 'hanzi')[];
    };
    includeName: boolean;
    includeComponents: boolean;
    includeFilters: boolean;
    includeComments: boolean;
    sectionOrder: ('name' | 'components' | 'comments' | 'filters')[];
  };
}

// Builder Settings
export interface BuilderSettings {
  // Herbs List Display
  herbsList: {
    pinyin: boolean;
    latin: boolean;
    hanzi: boolean;
    natureIndicator: boolean;
    order: ('pinyin' | 'latin' | 'hanzi')[];
  };
  // Formulas List Display
  formulasList: {
    pinyin: boolean;
    pharmaceutical: boolean;
    hanzi: boolean;
    thermalActionIndicator: boolean;
    order: ('pinyin' | 'pharmaceutical' | 'hanzi')[];
  };
  // Prescription Builder (components added)
  prescriptionBuilder: {
    herbs: {
      pinyin: boolean;
      latin: boolean;
      hanzi: boolean;
      order: ('pinyin' | 'latin' | 'hanzi')[];
    };
    formulas: {
      pinyin: boolean;
      pharmaceutical: boolean;
      hanzi: boolean;
      ingredients: boolean;
      order: ('pinyin' | 'pharmaceutical' | 'hanzi')[];
    };
  };
  // Preview Panel Settings (for modals)
  preview: {
    herbs: {
      pinyin: boolean;
      latin: boolean;
      hanzi: boolean;
      order: ('pinyin' | 'latin' | 'hanzi')[];
    };
    formulas: {
      pinyin: boolean;
      pharmaceutical: boolean;
      hanzi: boolean;
      ingredients: boolean;
      order: ('pinyin' | 'pharmaceutical' | 'hanzi')[];
    };
    ingredientsNatureIndicator: boolean;
    ingredientsThermalIndicator: boolean;
    ingredientsLayout: 'grid' | 'list';
  };
}

// Combined Global Settings
export interface GlobalSettings {
  herbs: HerbsLibrarySettings;
  formulas: FormulasLibrarySettings;
  prescriptions: PrescriptionsSettings;
  builder: BuilderSettings;
}

// Props
interface GlobalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GlobalSettings;
  onUpdateSettings: (settings: GlobalSettings) => void;
  defaultTab?: 'herbs' | 'formulas' | 'prescriptions' | 'builder';
}

// ============================================================================
// COMPONENT
// ============================================================================

export function GlobalSettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  defaultTab = 'herbs',
}: GlobalSettingsModalProps) {
  const [activeTab, setActiveTab] = React.useState<'herbs' | 'formulas' | 'prescriptions' | 'builder'>(defaultTab);
  const [initialSettings, setInitialSettings] = React.useState<GlobalSettings>(settings);

  // Update active tab when defaultTab changes (e.g., when opening from different pages)
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, isOpen]);

  // Store initial settings only when modal opens (not when settings change)
  React.useEffect(() => {
    if (isOpen) {
      setInitialSettings(JSON.parse(JSON.stringify(settings)));
    }
  }, [isOpen]);

  // Check if settings have changed
  const hasChanges = React.useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(initialSettings);
  }, [settings, initialSettings]);

  // Update a specific section of settings
  const updateSection = <K extends keyof GlobalSettings>(
    section: K,
    update: Partial<GlobalSettings[K]> | ((prev: GlobalSettings[K]) => GlobalSettings[K])
  ) => {
    onUpdateSettings({
      ...settings,
      [section]: typeof update === 'function' 
        ? update(settings[section]) 
        : { ...settings[section], ...update },
    });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content
          className="fixed left-0 right-0 bottom-0 top-[10vh] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:w-full sm:max-w-2xl sm:max-h-[85vh] overflow-hidden z-50 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
            <Dialog.Title className="text-lg font-semibold text-gray-900">
              Display Settings
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* Tabs Navigation + Content */}
          <Tabs.Root value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 flex flex-col overflow-hidden">
            {/* Tabs List */}
            <Tabs.List className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 mx-6 mt-4 mb-2 flex-shrink-0">
              <Tabs.Trigger
                value="herbs"
                className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 hover:text-gray-900 whitespace-nowrap"
              >
                Herbs
              </Tabs.Trigger>
              <Tabs.Trigger
                value="formulas"
                className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 hover:text-gray-900 whitespace-nowrap"
              >
                Formulas
              </Tabs.Trigger>
              <Tabs.Trigger
                value="prescriptions"
                className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 hover:text-gray-900 whitespace-nowrap"
              >
                Prescriptions
              </Tabs.Trigger>
              <Tabs.Trigger
                value="builder"
                className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 hover:text-gray-900 whitespace-nowrap"
              >
                Builder
              </Tabs.Trigger>
            </Tabs.List>

            {/* Tabs Content */}
            <div className="flex-1 overflow-y-auto">
              {/* HERBS TAB */}
              <Tabs.Content value="herbs" className="px-6 py-6">
                <HerbsLibraryTab
                  settings={settings.herbs}
                  onUpdate={(update) => updateSection('herbs', update)}
                />
              </Tabs.Content>

              {/* FORMULAS TAB */}
              <Tabs.Content value="formulas" className="px-6 py-6">
                <FormulasLibraryTab
                  settings={settings.formulas}
                  onUpdate={(update) => updateSection('formulas', update)}
                />
              </Tabs.Content>

              {/* PRESCRIPTIONS TAB */}
              <Tabs.Content value="prescriptions" className="px-6 py-6">
                <PrescriptionsTab
                  settings={settings.prescriptions}
                  onUpdate={(update) => updateSection('prescriptions', update)}
                />
              </Tabs.Content>

              {/* BUILDER TAB */}
              <Tabs.Content value="builder" className="px-6 py-6">
                <BuilderTab
                  settings={settings.builder}
                  onUpdate={(update) => updateSection('builder', update)}
                  prescriptionsSettings={settings.prescriptions}
                  onUpdatePrescriptions={(update) => updateSection('prescriptions', update)}
                />
              </Tabs.Content>
            </div>
          </Tabs.Root>

          {/* Footer */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  // Reset to initial settings
                  onUpdateSettings(initialSettings);
                  onClose();
                }}
                disabled={!hasChanges}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors font-medium disabled:opacity-0 disabled:cursor-default"
              >
                Cancel
              </button>
              <Dialog.Close
                disabled={!hasChanges}
                className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-0 disabled:cursor-default"
              >
                Apply
              </Dialog.Close>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ============================================================================
// TAB COMPONENTS
// ============================================================================

// -----------------------------------------------------------------------------
// HERBS LIBRARY TAB
// -----------------------------------------------------------------------------
interface HerbsLibraryTabProps {
  settings: HerbsLibrarySettings;
  onUpdate: (update: Partial<HerbsLibrarySettings>) => void;
}

function HerbsLibraryTab({ settings, onUpdate }: HerbsLibraryTabProps) {
  const [viewMode, setViewMode] = React.useState<'list' | 'detail'>('list');

  const labels = {
    pinyin: 'Pinyin Name',
    pharmaceutical: 'Pharmaceutical Name',
    hanzi: 'Hanzi Name',
    category: 'Category',
    subcategory: 'Subcategory',
    flavor: 'Flavor',
    channels: 'Channels',
  };

  const handleReorder = (newOrder: typeof settings.order) => {
    onUpdate({ order: newOrder });
  };

  return (
    <>
      {/* Toggle between List Display and Detail View */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              viewMode === 'list'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            List Display
          </button>
          <button
            onClick={() => setViewMode('detail')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              viewMode === 'detail'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Detail View
          </button>
        </div>
      </div>

      {/* List Display Section */}
      {viewMode === 'list' && (
        <div className="space-y-4">
            {/* Fields Section */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Fields</h4>
              <div className="space-y-2">
                {settings.order.map((columnType, index) => {
                  const isFirst = index === 0;
                  const isLast = index === settings.order.length - 1;

                  return (
                    <div key={columnType} className="flex items-center gap-2">
                      <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                        <input
                          type="checkbox"
                          checked={settings[columnType]}
                          onChange={(e) => onUpdate({ [columnType]: e.target.checked })}
                          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700 flex-1">{labels[columnType]}</span>

                        {/* Mobile: Arrows inside label */}
                        <div className="flex gap-1 sm:hidden">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isFirst) {
                                const newOrder = [...settings.order];
                                [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                                handleReorder(newOrder);
                              }
                            }}
                            disabled={isFirst}
                            className={`p-1 rounded transition-colors flex items-center justify-center ${
                              isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                            }`}
                            aria-label="Move up"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isLast) {
                                const newOrder = [...settings.order];
                                [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                handleReorder(newOrder);
                              }
                            }}
                            disabled={isLast}
                            className={`p-1 rounded transition-colors flex items-center justify-center ${
                              isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                            }`}
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
                              const newOrder = [...settings.order];
                              [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                              handleReorder(newOrder);
                            }
                          }}
                          disabled={isFirst}
                          className={`p-1 rounded transition-colors flex items-center justify-center ${
                            isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                          }`}
                          aria-label="Move up"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (!isLast) {
                              const newOrder = [...settings.order];
                              [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                              handleReorder(newOrder);
                            }
                          }}
                          disabled={isLast}
                          className={`p-1 rounded transition-colors flex items-center justify-center ${
                            isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                          }`}
                          aria-label="Move down"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Nature Indicator */}
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.natureIndicator}
                    onChange={(e) => onUpdate({ natureIndicator: e.target.checked })}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">Nature Indicator</span>
                </label>
              </div>
            </div>

            {/* Sort Order Section */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Sort Order</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    checked={settings.sortOrder === 'alphabetical'}
                    onChange={() => onUpdate({ sortOrder: 'alphabetical' })}
                    className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">Alphabetical</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    checked={settings.sortOrder === 'categorical'}
                    onChange={() => onUpdate({ sortOrder: 'categorical' })}
                    className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">Categorical</span>
                </label>
              </div>
            </div>
          </div>
      )}

      {/* Detail View Section */}
      {viewMode === 'detail' && (
        <div className="space-y-4">
          {/* Name Order Section */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Names</h4>
            <div className="space-y-2">
              {(settings.detailViewNameOrder || ['pinyin', 'pharmaceutical', 'hanzi']).map((nameType, index) => {
                const isFirst = index === 0;
                const isLast = index === (settings.detailViewNameOrder || ['pinyin', 'pharmaceutical', 'hanzi']).length - 1;

                const nameLabels: { [key: string]: string } = {
                  pinyin: 'Pinyin Name',
                  pharmaceutical: 'Pharmaceutical Name',
                  hanzi: 'Hanzi Name',
                };

                // Get checkbox state for each name type
                const checkboxKey = nameType === 'pinyin' ? 'detailViewPinyin' :
                                   nameType === 'pharmaceutical' ? 'detailViewPharmaceutical' :
                                   'detailViewHanzi';

                return (
                  <div key={nameType} className="flex items-center gap-2">
                    <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                      <input
                        type="checkbox"
                        checked={settings[checkboxKey as keyof HerbsLibrarySettings] as boolean}
                        onChange={(e) => onUpdate({ [checkboxKey]: e.target.checked })}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700 flex-1">{nameLabels[nameType]}</span>

                      {/* Mobile: Arrows inside label */}
                      <div className="flex gap-1 sm:hidden">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            const currentOrder = settings.detailViewNameOrder || ['pinyin', 'pharmaceutical', 'hanzi'];
                            if (!isFirst) {
                              const newOrder = [...currentOrder];
                              [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                              onUpdate({ detailViewNameOrder: newOrder });
                            }
                          }}
                          disabled={isFirst}
                          className={`p-1 rounded transition-colors flex items-center justify-center ${
                            isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                          }`}
                          aria-label="Move up"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            const currentOrder = settings.detailViewNameOrder || ['pinyin', 'pharmaceutical', 'hanzi'];
                            if (!isLast) {
                              const newOrder = [...currentOrder];
                              [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                              onUpdate({ detailViewNameOrder: newOrder });
                            }
                          }}
                          disabled={isLast}
                          className={`p-1 rounded transition-colors flex items-center justify-center ${
                            isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                          }`}
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
                          const currentOrder = settings.detailViewNameOrder || ['pinyin', 'pharmaceutical', 'hanzi'];
                          if (!isFirst) {
                            const newOrder = [...currentOrder];
                            [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                            onUpdate({ detailViewNameOrder: newOrder });
                          }
                        }}
                        disabled={isFirst}
                        className={`p-1 rounded transition-colors flex items-center justify-center ${
                          isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        }`}
                        aria-label="Move up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => {
                          const currentOrder = settings.detailViewNameOrder || ['pinyin', 'pharmaceutical', 'hanzi'];
                          if (!isLast) {
                            const newOrder = [...currentOrder];
                            [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                            onUpdate({ detailViewNameOrder: newOrder });
                          }
                        }}
                        disabled={isLast}
                        className={`p-1 rounded transition-colors flex items-center justify-center ${
                          isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        }`}
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

          {/* Chips Display Section */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Chips Display</h4>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={settings.detailViewChipsNature}
                  onChange={(e) => onUpdate({ detailViewChipsNature: e.target.checked })}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700 flex-1">Show Nature</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// -----------------------------------------------------------------------------
// FORMULAS LIBRARY TAB
// -----------------------------------------------------------------------------
interface FormulasLibraryTabProps {
  settings: FormulasLibrarySettings;
  onUpdate: (update: Partial<FormulasLibrarySettings>) => void;
}

function FormulasLibraryTab({ settings, onUpdate }: FormulasLibraryTabProps) {
  const [viewMode, setViewMode] = React.useState<'list' | 'detail'>('list');

  const labels = {
    pinyin: 'Pinyin Name',
    pharmaceutical: 'Translated Name',
    hanzi: 'Hanzi Name',
    category: 'Category',
    subcategory: 'Subcategory',
  };

  const handleReorder = (newOrder: typeof settings.order) => {
    onUpdate({ order: newOrder });
  };

  // Helper to get herb name settings
  const getHerbNameSetting = (nameType: 'pinyin' | 'latin' | 'hanzi') => {
    if (nameType === 'pinyin') return { checked: settings.ingredientsHerbPinyin ?? true, key: 'ingredientsHerbPinyin' as const };
    if (nameType === 'latin') return { checked: settings.ingredientsHerbLatin ?? false, key: 'ingredientsHerbLatin' as const };
    return { checked: settings.ingredientsHerbHanzi ?? false, key: 'ingredientsHerbHanzi' as const };
  };

  // Helper to get formula name settings
  const getFormulaNameSetting = (nameType: 'pinyin' | 'pharmaceutical' | 'hanzi') => {
    if (nameType === 'pinyin') return { checked: settings.ingredientsFormulaPinyin ?? true, key: 'ingredientsFormulaPinyin' as const };
    if (nameType === 'pharmaceutical') return { checked: settings.ingredientsFormulaPharmaceutical ?? false, key: 'ingredientsFormulaPharmaceutical' as const };
    return { checked: settings.ingredientsFormulaHanzi ?? false, key: 'ingredientsFormulaHanzi' as const };
  };

  return (
    <>
      {/* Toggle between List Display and Detail View */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              viewMode === 'list'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            List Display
          </button>
          <button
            onClick={() => setViewMode('detail')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              viewMode === 'detail'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Detail View
          </button>
        </div>
      </div>

      {/* List Display Section */}
      {viewMode === 'list' && (
        <div className="space-y-4">
            {/* Fields Section */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Fields</h4>
              <div className="space-y-2">
                {settings.order.map((columnType, index) => {
                  const isFirst = index === 0;
                  const isLast = index === settings.order.length - 1;

                  return (
                    <div key={columnType} className="flex items-center gap-2">
                      <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                        <input
                          type="checkbox"
                          checked={settings[columnType]}
                          onChange={(e) => onUpdate({ [columnType]: e.target.checked })}
                          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700 flex-1">{labels[columnType]}</span>

                        {/* Mobile: Arrows inside label */}
                        <div className="flex gap-1 sm:hidden">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isFirst) {
                                const newOrder = [...settings.order];
                                [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                                handleReorder(newOrder);
                              }
                            }}
                            disabled={isFirst}
                            className={`p-1 rounded transition-colors flex items-center justify-center ${
                              isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                            }`}
                            aria-label="Move up"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isLast) {
                                const newOrder = [...settings.order];
                                [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                handleReorder(newOrder);
                              }
                            }}
                            disabled={isLast}
                            className={`p-1 rounded transition-colors flex items-center justify-center ${
                              isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                            }`}
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
                              const newOrder = [...settings.order];
                              [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                              handleReorder(newOrder);
                            }
                          }}
                          disabled={isFirst}
                          className={`p-1 rounded transition-colors flex items-center justify-center ${
                            isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                          }`}
                          aria-label="Move up"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (!isLast) {
                              const newOrder = [...settings.order];
                              [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                              handleReorder(newOrder);
                            }
                          }}
                          disabled={isLast}
                          className={`p-1 rounded transition-colors flex items-center justify-center ${
                            isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                          }`}
                          aria-label="Move down"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Thermal Action Indicator */}
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.thermalActionIndicator}
                    onChange={(e) => onUpdate({ thermalActionIndicator: e.target.checked })}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">Thermal Action Indicator</span>
                </label>
              </div>
            </div>

            {/* Sort Order Section */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Sort Order</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    checked={settings.sortOrder === 'alphabetical'}
                    onChange={() => onUpdate({ sortOrder: 'alphabetical' })}
                    className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">Alphabetical</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    checked={settings.sortOrder === 'categorical'}
                    onChange={() => onUpdate({ sortOrder: 'categorical' })}
                    className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">Categorical</span>
                </label>
              </div>
            </div>
        </div>
      )}

      {/* Detail View Section */}
      {viewMode === 'detail' && (
        <div className="space-y-4">
            {/* Names subsection */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Names</h4>
              <div className="space-y-2">
                {(settings.detailViewNameOrder || ['pinyin', 'pharmaceutical', 'alternative', 'hanzi']).map((nameType, index) => {
                  const isFirst = index === 0;
                  const isLast = index === (settings.detailViewNameOrder || ['pinyin', 'pharmaceutical', 'alternative', 'hanzi']).length - 1;
                  const nameLabels = {
                    pinyin: 'Pinyin Name',
                    pharmaceutical: 'Translated Name',
                    alternative: 'Alternative Names',
                    hanzi: 'Hanzi Name'
                  };

                  let checked = false;
                  let key = '';
                  if (nameType === 'pinyin') {
                    checked = settings.detailViewPinyin;
                    key = 'detailViewPinyin';
                  } else if (nameType === 'pharmaceutical') {
                    checked = settings.detailViewPharmaceutical;
                    key = 'detailViewPharmaceutical';
                  } else if (nameType === 'alternative') {
                    checked = settings.detailViewAlternative;
                    key = 'detailViewAlternative';
                  } else if (nameType === 'hanzi') {
                    checked = settings.detailViewHanzi;
                    key = 'detailViewHanzi';
                  }

                  return (
                    <div key={nameType} className="flex items-center gap-2">
                      <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => onUpdate({ [key]: e.target.checked })}
                          className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700 flex-1">{nameLabels[nameType]}</span>

                        {/* Mobile: Arrows inside label */}
                        <div className="flex gap-1 sm:hidden">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isFirst) {
                                const newOrder = [...(settings.detailViewNameOrder || ['pinyin', 'pharmaceutical', 'alternative', 'hanzi'])];
                                [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                                onUpdate({ detailViewNameOrder: newOrder });
                              }
                            }}
                            disabled={isFirst}
                            className={`p-1 rounded transition-colors flex items-center justify-center ${
                              isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                            }`}
                            aria-label="Move up"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              if (!isLast) {
                                const newOrder = [...(settings.detailViewNameOrder || ['pinyin', 'pharmaceutical', 'alternative', 'hanzi'])];
                                [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                onUpdate({ detailViewNameOrder: newOrder });
                              }
                            }}
                            disabled={isLast}
                            className={`p-1 rounded transition-colors flex items-center justify-center ${
                              isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                            }`}
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
                              const newOrder = [...(settings.detailViewNameOrder || ['pinyin', 'pharmaceutical', 'alternative', 'hanzi'])];
                              [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                              onUpdate({ detailViewNameOrder: newOrder });
                            }
                          }}
                          disabled={isFirst}
                          className={`p-1 rounded transition-colors flex items-center justify-center ${
                            isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                          }`}
                          aria-label="Move up"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (!isLast) {
                              const newOrder = [...(settings.detailViewNameOrder || ['pinyin', 'pharmaceutical', 'alternative', 'hanzi'])];
                              [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                              onUpdate({ detailViewNameOrder: newOrder });
                            }
                          }}
                          disabled={isLast}
                          className={`p-1 rounded transition-colors flex items-center justify-center ${
                            isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                          }`}
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

            {/* Ingredients > Herbs subsection */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Ingredients</h4>
              <div className="ml-2 mb-3">
                <h5 className="text-xs font-semibold text-gray-700 mb-2">Herbs</h5>
                <div className="space-y-2">
                  {(settings.ingredientsHerbOrder || ['pinyin', 'latin', 'hanzi']).map((nameType, index) => {
                    const isFirst = index === 0;
                    const isLast = index === (settings.ingredientsHerbOrder || ['pinyin', 'latin', 'hanzi']).length - 1;
                    const nameLabels = { pinyin: 'Pinyin Name', latin: 'Pharmaceutical Name', hanzi: 'Hanzi Name' };
                    const { checked, key } = getHerbNameSetting(nameType);

                    return (
                      <div key={nameType} className="flex items-center gap-2">
                        <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => onUpdate({ [key]: e.target.checked })}
                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                          />
                          <span className="text-sm text-gray-700 flex-1">{nameLabels[nameType]}</span>

                          {/* Mobile: Arrows inside label */}
                          <div className="flex gap-1 sm:hidden">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                if (!isFirst) {
                                  const newOrder = [...(settings.ingredientsHerbOrder || ['pinyin', 'latin', 'hanzi'])];
                                  [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                                  onUpdate({ ingredientsHerbOrder: newOrder });
                                }
                              }}
                              disabled={isFirst}
                              className={`p-1 rounded transition-colors flex items-center justify-center ${
                                isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                              }`}
                              aria-label="Move up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                if (!isLast) {
                                  const newOrder = [...(settings.ingredientsHerbOrder || ['pinyin', 'latin', 'hanzi'])];
                                  [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                  onUpdate({ ingredientsHerbOrder: newOrder });
                                }
                              }}
                              disabled={isLast}
                              className={`p-1 rounded transition-colors flex items-center justify-center ${
                                isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                              }`}
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
                                const newOrder = [...(settings.ingredientsHerbOrder || ['pinyin', 'latin', 'hanzi'])];
                                [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                                onUpdate({ ingredientsHerbOrder: newOrder });
                              }
                            }}
                            disabled={isFirst}
                            className={`p-1 rounded transition-colors flex items-center justify-center ${
                              isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                            }`}
                            aria-label="Move up"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              if (!isLast) {
                                const newOrder = [...(settings.ingredientsHerbOrder || ['pinyin', 'latin', 'hanzi'])];
                                [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                onUpdate({ ingredientsHerbOrder: newOrder });
                              }
                            }}
                            disabled={isLast}
                            className={`p-1 rounded transition-colors flex items-center justify-center ${
                              isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                            }`}
                            aria-label="Move down"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={settings.ingredientsNatureIndicator}
                      onChange={(e) => onUpdate({ ingredientsNatureIndicator: e.target.checked })}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700 flex-1">Nature Indicator</span>
                  </label>
                </div>
              </div>

              {/* Formulas subsection */}
              <div className="ml-2 mb-3">
                <h5 className="text-xs font-semibold text-gray-700 mb-2">Formulas</h5>
                <div className="space-y-2">
                  {(settings.ingredientsFormulaOrder || ['pinyin', 'pharmaceutical', 'hanzi']).map((nameType, index) => {
                    const isFirst = index === 0;
                    const isLast = index === (settings.ingredientsFormulaOrder || ['pinyin', 'pharmaceutical', 'hanzi']).length - 1;
                    const nameLabels = { pinyin: 'Pinyin Name', pharmaceutical: 'Translated Name', hanzi: 'Hanzi Name' };
                    const { checked, key } = getFormulaNameSetting(nameType);

                    return (
                      <div key={nameType} className="flex items-center gap-2">
                        <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => onUpdate({ [key]: e.target.checked })}
                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                          />
                          <span className="text-sm text-gray-700 flex-1">{nameLabels[nameType]}</span>

                          {/* Mobile: Arrows inside label */}
                          <div className="flex gap-1 sm:hidden">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                if (!isFirst) {
                                  const newOrder = [...(settings.ingredientsFormulaOrder || ['pinyin', 'pharmaceutical', 'hanzi'])];
                                  [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                                  onUpdate({ ingredientsFormulaOrder: newOrder });
                                }
                              }}
                              disabled={isFirst}
                              className={`p-1 rounded transition-colors flex items-center justify-center ${
                                isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                              }`}
                              aria-label="Move up"
                            >
                              <ChevronUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                if (!isLast) {
                                  const newOrder = [...(settings.ingredientsFormulaOrder || ['pinyin', 'pharmaceutical', 'hanzi'])];
                                  [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                  onUpdate({ ingredientsFormulaOrder: newOrder });
                                }
                              }}
                              disabled={isLast}
                              className={`p-1 rounded transition-colors flex items-center justify-center ${
                                isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                              }`}
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
                                const newOrder = [...(settings.ingredientsFormulaOrder || ['pinyin', 'pharmaceutical', 'hanzi'])];
                                [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                                onUpdate({ ingredientsFormulaOrder: newOrder });
                              }
                            }}
                            disabled={isFirst}
                            className={`p-1 rounded transition-colors flex items-center justify-center ${
                              isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                            }`}
                            aria-label="Move up"
                          >
                            <ChevronUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              if (!isLast) {
                                const newOrder = [...(settings.ingredientsFormulaOrder || ['pinyin', 'pharmaceutical', 'hanzi'])];
                                [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                onUpdate({ ingredientsFormulaOrder: newOrder });
                              }
                            }}
                            disabled={isLast}
                            className={`p-1 rounded transition-colors flex items-center justify-center ${
                              isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                            }`}
                            aria-label="Move down"
                          >
                            <ChevronDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={settings.ingredientsThermalIndicator}
                      onChange={(e) => onUpdate({ ingredientsThermalIndicator: e.target.checked })}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700 flex-1">Thermal Action Indicator</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={settings.ingredientsShowFormulas ?? true}
                      onChange={(e) => onUpdate({ ingredientsShowFormulas: e.target.checked })}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700 flex-1">Show Ingredients (when ingredient is a formula)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Ingredients Layout subsection */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Layout</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    checked={settings.ingredientsLayout === 'grid'}
                    onChange={() => onUpdate({ ingredientsLayout: 'grid' })}
                    className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">Two Columns (Grid)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    checked={settings.ingredientsLayout === 'list'}
                    onChange={() => onUpdate({ ingredientsLayout: 'list' })}
                    className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">Ordered List (Single Column)</span>
                </label>
              </div>
            </div>

            {/* Chips Display subsection */}
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Chips Display</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.detailViewChipsThermalAction}
                    onChange={(e) => onUpdate({ detailViewChipsThermalAction: e.target.checked })}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">Show Thermal Action</span>
                </label>
              </div>
            </div>
          </div>
      )}
    </>
  );
}

// -----------------------------------------------------------------------------
// PRESCRIPTIONS TAB
// -----------------------------------------------------------------------------
interface PrescriptionsTabProps {
  settings: PrescriptionsSettings;
  onUpdate: (update: Partial<PrescriptionsSettings>) => void;
}

function PrescriptionsTab({ settings, onUpdate }: PrescriptionsTabProps) {
  const [subTab, setSubTab] = React.useState<'list' | 'detail' | 'copy'>('list');

  return (
    <>
      {/* Toggle between List Display, Detail View and Copy Settings */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setSubTab('list')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              subTab === 'list'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            List Display
          </button>
          <button
            onClick={() => setSubTab('detail')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              subTab === 'detail'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Detail View
          </button>
          <button
            onClick={() => setSubTab('copy')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              subTab === 'copy'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Copy Settings
          </button>
        </div>
      </div>

      {subTab === 'list' && <PrescriptionsListDisplay settings={settings} onUpdate={onUpdate} />}
      {subTab === 'detail' && <PrescriptionsDetailView settings={settings} onUpdate={onUpdate} />}
      {subTab === 'copy' && <PrescriptionsCopySettings settings={settings} onUpdate={onUpdate} />}
    </>
  );
}

function PrescriptionsListDisplay({
  settings,
  onUpdate,
}: {
  settings: PrescriptionsSettings;
  onUpdate: (update: Partial<PrescriptionsSettings>) => void;
}) {
  const updateList = (update: Partial<PrescriptionsSettings['list']>) => {
    onUpdate({ list: { ...settings.list, ...update } });
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Fields</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={settings.list.ingredients}
              onChange={(e) => updateList({ ingredients: e.target.checked })}
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700 flex-1">Ingredients</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={settings.list.comments}
              onChange={(e) => updateList({ comments: e.target.checked })}
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700 flex-1">Comments</span>
          </label>
        </div>
      </div>
    </div>
  );
}

function PrescriptionsDetailView({
  settings,
  onUpdate,
}: {
  settings: PrescriptionsSettings;
  onUpdate: (update: Partial<PrescriptionsSettings>) => void;
}) {
  const updateDisplay = (update: Partial<PrescriptionsSettings['display']>) => {
    onUpdate({ display: { ...settings.display, ...update } });
  };

  // Ensure order arrays exist, fallback to default order
  const herbsOrder = settings.display.herbs.order || ['pinyin', 'latin', 'hanzi'];
  const formulasOrder = settings.display.formulas.order || ['pinyin', 'pharmaceutical', 'hanzi'];

  // Reorder functions for Herbs
  const moveHerbsItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...herbsOrder];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      updateDisplay({
        herbs: { ...settings.display.herbs, order: newOrder },
      });
    }
  };

  // Reorder functions for Formulas
  const moveFormulasItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...formulasOrder];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      updateDisplay({
        formulas: { ...settings.display.formulas, order: newOrder },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Ingredients Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Ingredients</h3>
        
        {/* Herbs Subsection */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Herbs</h4>
          <div className="space-y-2">
            {herbsOrder.map((nameType, index) => {
              const isFirst = index === 0;
              const isLast = index === herbsOrder.length - 1;
              const labels: Record<string, string> = {
                pinyin: 'Pinyin Name',
                latin: 'Pharmaceutical Name',
                hanzi: 'Hanzi Name',
              };

              return (
                <div key={nameType} className="flex items-center gap-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                    <input
                      type="checkbox"
                      checked={settings.display.herbs[nameType as keyof typeof settings.display.herbs]}
                      onChange={(e) =>
                        updateDisplay({
                          herbs: { ...settings.display.herbs, [nameType]: e.target.checked },
                        })
                      }
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700 flex-1">{labels[nameType] || nameType}</span>

                    {/* Mobile: Arrows inside label */}
                    <div className="flex gap-1 sm:hidden">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          moveHerbsItem(index, 'up');
                        }}
                        disabled={isFirst}
                        className={`p-1 rounded transition-colors flex items-center justify-center ${
                          isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        }`}
                        aria-label="Move up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          moveHerbsItem(index, 'down');
                        }}
                        disabled={isLast}
                        className={`p-1 rounded transition-colors flex items-center justify-center ${
                          isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        }`}
                        aria-label="Move down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </label>

                  {/* Desktop: Arrows outside label */}
                  <div className="hidden sm:flex flex-col gap-0.5">
                    <button
                      onClick={() => moveHerbsItem(index, 'up')}
                      disabled={isFirst}
                      className={`p-1 rounded transition-colors flex items-center justify-center ${
                        isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                      aria-label="Move up"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveHerbsItem(index, 'down')}
                      disabled={isLast}
                      className={`p-1 rounded transition-colors flex items-center justify-center ${
                        isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                      aria-label="Move down"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
            <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={settings.display.preview.natureIndicator}
                onChange={(e) =>
                  updateDisplay({
                    preview: { ...settings.display.preview, natureIndicator: e.target.checked },
                  })
                }
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700 flex-1">Nature Indicator</span>
            </label>
          </div>
        </div>

        {/* Formulas Subsection */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Formulas</h4>
          <div className="space-y-2">
            {formulasOrder.map((nameType, index) => {
              const isFirst = index === 0;
              const isLast = index === formulasOrder.length - 1;
              const labels = {
                pinyin: 'Pinyin Name',
                pharmaceutical: 'Translated Name',
                hanzi: 'Hanzi Name',
              };

              return (
                <div key={nameType} className="flex items-center gap-2">
                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                    <input
                      type="checkbox"
                      checked={settings.display.formulas[nameType]}
                      onChange={(e) =>
                        updateDisplay({
                          formulas: { ...settings.display.formulas, [nameType]: e.target.checked },
                        })
                      }
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700 flex-1">{labels[nameType]}</span>

                    {/* Mobile: Arrows inside label */}
                    <div className="flex gap-1 sm:hidden">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          moveFormulasItem(index, 'up');
                        }}
                        disabled={isFirst}
                        className={`p-1 rounded transition-colors flex items-center justify-center ${
                          isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        }`}
                        aria-label="Move up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          moveFormulasItem(index, 'down');
                        }}
                        disabled={isLast}
                        className={`p-1 rounded transition-colors flex items-center justify-center ${
                          isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        }`}
                        aria-label="Move down"
                      >
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>
                  </label>

                  {/* Desktop: Arrows outside label */}
                  <div className="hidden sm:flex flex-col gap-0.5">
                    <button
                      onClick={() => moveFormulasItem(index, 'up')}
                      disabled={isFirst}
                      className={`p-1 rounded transition-colors flex items-center justify-center ${
                        isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                      aria-label="Move up"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveFormulasItem(index, 'down')}
                      disabled={isLast}
                      className={`p-1 rounded transition-colors flex items-center justify-center ${
                        isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                      aria-label="Move down"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
            <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={settings.display.formulas.ingredients}
                onChange={(e) =>
                  updateDisplay({
                    formulas: { ...settings.display.formulas, ingredients: e.target.checked },
                  })
                }
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700 flex-1">Show Ingredients</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={settings.display.preview.thermalActionIndicator}
                onChange={(e) =>
                  updateDisplay({
                    preview: { ...settings.display.preview, thermalActionIndicator: e.target.checked },
                  })
                }
                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700 flex-1">Thermal Action Indicator</span>
            </label>
          </div>
        </div>
      </div>

      {/* Ingredients Layout */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Ingredients Layout</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              checked={settings.display.preview.ingredientsLayout === 'grid'}
              onChange={() =>
                updateDisplay({
                  preview: { ...settings.display.preview, ingredientsLayout: 'grid' },
                })
              }
              className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700 flex-1">Two Columns (Grid)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              checked={settings.display.preview.ingredientsLayout === 'list'}
              onChange={() =>
                updateDisplay({
                  preview: { ...settings.display.preview, ingredientsLayout: 'list' },
                })
              }
              className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700 flex-1">Ordered List (Single Column)</span>
          </label>
        </div>
      </div>

    </div>
  );
}

function PrescriptionsDisplaySettings({
  settings,
  onUpdate,
}: {
  settings: PrescriptionsSettings;
  onUpdate: (update: Partial<PrescriptionsSettings>) => void;
}) {
  const updateDisplay = (update: Partial<PrescriptionsSettings['display']>) => {
    onUpdate({ display: { ...settings.display, ...update } });
  };

  // Ensure order arrays exist, fallback to default order
  const herbsOrder = settings.display.herbs.order || ['pinyin', 'latin', 'hanzi'];
  const formulasOrder = settings.display.formulas.order || ['pinyin', 'pharmaceutical', 'hanzi'];

  // Reorder functions for Herbs
  const moveHerbsItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...herbsOrder];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      updateDisplay({
        herbs: { ...settings.display.herbs, order: newOrder },
      });
    }
  };

  // Reorder functions for Formulas
  const moveFormulasItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...formulasOrder];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      updateDisplay({
        formulas: { ...settings.display.formulas, order: newOrder },
      });
    }
  };

  return (
    <>
      {/* Herbs Display */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Herbs</h3>
        <div className="space-y-2">
          {herbsOrder.map((nameType, index) => {
            const isFirst = index === 0;
            const isLast = index === herbsOrder.length - 1;
            const labels: Record<string, string> = {
              pinyin: 'Pinyin Name',
              latin: 'Pharmaceutical Name',
              hanzi: 'Hanzi Name',
            };

            return (
              <div key={nameType} className="flex items-center gap-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                  <input
                    type="checkbox"
                    checked={settings.display.herbs[nameType as keyof typeof settings.display.herbs]}
                    onChange={(e) =>
                      updateDisplay({
                        herbs: { ...settings.display.herbs, [nameType]: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">{labels[nameType] || nameType}</span>

                  {/* Mobile: Arrows inside label */}
                  <div className="flex gap-1 sm:hidden">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        moveHerbsItem(index, 'up');
                      }}
                      disabled={isFirst}
                      className={`p-1 rounded transition-colors flex items-center justify-center ${
                        isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                      aria-label="Move up"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        moveHerbsItem(index, 'down');
                      }}
                      disabled={isLast}
                      className={`p-1 rounded transition-colors flex items-center justify-center ${
                        isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                      aria-label="Move down"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </label>

                {/* Desktop: Arrows outside label */}
                <div className="hidden sm:flex flex-col gap-0.5">
                  <button
                    onClick={() => moveHerbsItem(index, 'up')}
                    disabled={isFirst}
                    className={`p-1 rounded transition-colors flex items-center justify-center ${
                      isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                    aria-label="Move up"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveHerbsItem(index, 'down')}
                    disabled={isLast}
                    className={`p-1 rounded transition-colors flex items-center justify-center ${
                      isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
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

      {/* Formulas Display */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Formulas</h3>
        <div className="space-y-2">
          {formulasOrder.map((nameType, index) => {
            const isFirst = index === 0;
            const isLast = index === formulasOrder.length - 1;
            const labels = {
              pinyin: 'Pinyin Name',
              pharmaceutical: 'Translated Name',
              hanzi: 'Hanzi Name',
            };

            return (
              <div key={nameType} className="flex items-center gap-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                  <input
                    type="checkbox"
                    checked={settings.display.formulas[nameType]}
                    onChange={(e) =>
                      updateDisplay({
                        formulas: { ...settings.display.formulas, [nameType]: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">{labels[nameType]}</span>

                  {/* Mobile: Arrows inside label */}
                  <div className="flex gap-1 sm:hidden">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        moveFormulasItem(index, 'up');
                      }}
                      disabled={isFirst}
                      className={`p-1 rounded transition-colors flex items-center justify-center ${
                        isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                      aria-label="Move up"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        moveFormulasItem(index, 'down');
                      }}
                      disabled={isLast}
                      className={`p-1 rounded transition-colors flex items-center justify-center ${
                        isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                      aria-label="Move down"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </label>

                {/* Desktop: Arrows outside label */}
                <div className="hidden sm:flex flex-col gap-0.5">
                  <button
                    onClick={() => moveFormulasItem(index, 'up')}
                    disabled={isFirst}
                    className={`p-1 rounded transition-colors flex items-center justify-center ${
                      isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                    aria-label="Move up"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveFormulasItem(index, 'down')}
                    disabled={isLast}
                    className={`p-1 rounded transition-colors flex items-center justify-center ${
                      isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                    aria-label="Move down"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={settings.display.formulas.ingredients}
              onChange={(e) =>
                updateDisplay({
                  formulas: { ...settings.display.formulas, ingredients: e.target.checked },
                })
              }
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700 flex-1">Show Ingredients</span>
          </label>
        </div>
      </div>

      {/* Safety Filters */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Safety Filters</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              checked={settings.display.safetyFilters === 'filtered'}
              onChange={() => updateDisplay({ safetyFilters: 'filtered' })}
              className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700 flex-1">Filtered Alerts</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              checked={settings.display.safetyFilters === 'all'}
              onChange={() => updateDisplay({ safetyFilters: 'all' })}
              className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700 flex-1">All Alerts</span>
          </label>
        </div>
      </div>

      {/* Preview Display */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Preview Display</h3>
        <p className="text-xs text-gray-600 mb-3">Configure how components appear in the prescription detail view</p>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={settings.display.preview.natureIndicator}
              onChange={(e) =>
                updateDisplay({
                  preview: { ...settings.display.preview, natureIndicator: e.target.checked },
                })
              }
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700 flex-1">Nature Indicator (Herbs)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={settings.display.preview.thermalActionIndicator}
              onChange={(e) =>
                updateDisplay({
                  preview: { ...settings.display.preview, thermalActionIndicator: e.target.checked },
                })
              }
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700 flex-1">Thermal Action Indicator (Formulas)</span>
          </label>
        </div>
      </div>

      {/* Ingredients Layout */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Ingredients Layout</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              checked={settings.display.preview.ingredientsLayout === 'grid'}
              onChange={() =>
                updateDisplay({
                  preview: { ...settings.display.preview, ingredientsLayout: 'grid' },
                })
              }
              className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700 flex-1">Two Columns (Grid)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              checked={settings.display.preview.ingredientsLayout === 'list'}
              onChange={() =>
                updateDisplay({
                  preview: { ...settings.display.preview, ingredientsLayout: 'list' },
                })
              }
              className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700 flex-1">Ordered List (Single Column)</span>
          </label>
        </div>
      </div>
    </>
  );
}

function PrescriptionsCopySettings({
  settings,
  onUpdate,
}: {
  settings: PrescriptionsSettings;
  onUpdate: (update: Partial<PrescriptionsSettings>) => void;
}) {
  const updateCopy = (update: Partial<PrescriptionsSettings['copy']>) => {
    onUpdate({ copy: { ...settings.copy, ...update } });
  };

  // Ensure order arrays exist, fallback to default order
  const herbsOrder = settings.copy.herbs.order || ['pinyin', 'latin', 'hanzi'];
  const formulasOrder = settings.copy.formulas.order || ['pinyin', 'pharmaceutical', 'hanzi'];
  const sectionOrder = settings.copy.sectionOrder || ['name', 'components', 'filters', 'comments'];

  // Reorder functions for Sections
  const moveSectionItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...sectionOrder];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      updateCopy({ sectionOrder: newOrder });
    }
  };

  // Reorder functions for Herbs
  const moveHerbsItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...herbsOrder];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      updateCopy({
        herbs: { ...settings.copy.herbs, order: newOrder },
      });
    }
  };

  // Reorder functions for Formulas
  const moveFormulasItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...formulasOrder];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      updateCopy({
        formulas: { ...settings.copy.formulas, order: newOrder },
      });
    }
  };

  return (
    <>
      {/* Herbs Copy Format */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Herbs</h3>
        <div className="space-y-2">
          {herbsOrder.map((nameType, index) => {
            const isFirst = index === 0;
            const isLast = index === herbsOrder.length - 1;
            const labels = {
              pinyin: 'Pinyin Name',
              latin: 'Pharmaceutical Name',
              hanzi: 'Hanzi Name',
            };

            return (
              <div key={nameType} className="flex items-center gap-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                  <input
                    type="checkbox"
                    checked={settings.copy.herbs[nameType]}
                    onChange={(e) =>
                      updateCopy({
                        herbs: { ...settings.copy.herbs, [nameType]: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">{labels[nameType]}</span>

                  {/* Mobile: Arrows inside label */}
                  <div className="flex gap-1 sm:hidden">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        moveHerbsItem(index, 'up');
                      }}
                      disabled={isFirst}
                      className={`p-1 rounded transition-colors flex items-center justify-center ${
                        isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                      aria-label="Move up"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        moveHerbsItem(index, 'down');
                      }}
                      disabled={isLast}
                      className={`p-1 rounded transition-colors flex items-center justify-center ${
                        isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                      aria-label="Move down"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </label>

                {/* Desktop: Arrows outside label */}
                <div className="hidden sm:flex flex-col gap-0.5">
                  <button
                    onClick={() => moveHerbsItem(index, 'up')}
                    disabled={isFirst}
                    className={`p-1 rounded transition-colors flex items-center justify-center ${
                      isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                    aria-label="Move up"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveHerbsItem(index, 'down')}
                    disabled={isLast}
                    className={`p-1 rounded transition-colors flex items-center justify-center ${
                      isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
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

      {/* Formulas Copy Format */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Formulas</h3>
        <div className="space-y-2">
          {formulasOrder.map((nameType, index) => {
            const isFirst = index === 0;
            const isLast = index === formulasOrder.length - 1;
            const labels = {
              pinyin: 'Pinyin Name',
              pharmaceutical: 'Translated Name',
              hanzi: 'Hanzi Name',
            };

            return (
              <div key={nameType} className="flex items-center gap-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                  <input
                    type="checkbox"
                    checked={settings.copy.formulas[nameType]}
                    onChange={(e) =>
                      updateCopy({
                        formulas: { ...settings.copy.formulas, [nameType]: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">{labels[nameType]}</span>

                  {/* Mobile: Arrows inside label */}
                  <div className="flex gap-1 sm:hidden">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        moveFormulasItem(index, 'up');
                      }}
                      disabled={isFirst}
                      className={`p-1 rounded transition-colors flex items-center justify-center ${
                        isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                      aria-label="Move up"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        moveFormulasItem(index, 'down');
                      }}
                      disabled={isLast}
                      className={`p-1 rounded transition-colors flex items-center justify-center ${
                        isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                      aria-label="Move down"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </label>

                {/* Desktop: Arrows outside label */}
                <div className="hidden sm:flex flex-col gap-0.5">
                  <button
                    onClick={() => moveFormulasItem(index, 'up')}
                    disabled={isFirst}
                    className={`p-1 rounded transition-colors flex items-center justify-center ${
                      isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                    aria-label="Move up"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveFormulasItem(index, 'down')}
                    disabled={isLast}
                    className={`p-1 rounded transition-colors flex items-center justify-center ${
                      isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                    aria-label="Move down"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={settings.copy.formulas.ingredients}
              onChange={(e) =>
                updateCopy({
                  formulas: { ...settings.copy.formulas, ingredients: e.target.checked },
                })
              }
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700 flex-1">Show Ingredients</span>
          </label>
        </div>
      </div>

      {/* Section Order */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Section Order</h3>
        <p className="text-xs text-gray-500 mb-3">Organize the order of sections when copying prescriptions</p>
        <div className="space-y-2">
          {sectionOrder.map((section, index) => {
            const isFirst = index === 0;
            const isLast = index === sectionOrder.length - 1;
            const labels = {
              name: 'Prescription Name',
              components: 'Components (Herbs & Formulas)',
              filters: 'Safety Filters',
              comments: 'Comments',
            };

            const checkboxMap = {
              name: settings.copy.includeName,
              components: settings.copy.includeComponents,
              filters: settings.copy.includeFilters,
              comments: settings.copy.includeComments,
            };

            const handleCheckboxChange = (section: string, checked: boolean) => {
              if (section === 'name') updateCopy({ includeName: checked });
              else if (section === 'components') updateCopy({ includeComponents: checked });
              else if (section === 'filters') updateCopy({ includeFilters: checked });
              else if (section === 'comments') updateCopy({ includeComments: checked });
            };

            return (
              <div key={section} className="flex items-center gap-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                  <input
                    type="checkbox"
                    checked={checkboxMap[section]}
                    onChange={(e) => handleCheckboxChange(section, e.target.checked)}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">{labels[section]}</span>

                  {/* Mobile: Arrows inside */}
                  <div className="flex gap-1 sm:hidden">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        moveSectionItem(index, 'up');
                      }}
                      disabled={isFirst}
                      className={`p-1 rounded transition-colors flex items-center justify-center ${
                        isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                      aria-label="Move up"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        moveSectionItem(index, 'down');
                      }}
                      disabled={isLast}
                      className={`p-1 rounded transition-colors flex items-center justify-center ${
                        isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                      aria-label="Move down"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </label>

                {/* Desktop: Arrows outside */}
                <div className="hidden sm:flex flex-col gap-0.5">
                  <button
                    onClick={() => moveSectionItem(index, 'up')}
                    disabled={isFirst}
                    className={`p-1 rounded transition-colors flex items-center justify-center ${
                      isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                    aria-label="Move up"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveSectionItem(index, 'down')}
                    disabled={isLast}
                    className={`p-1 rounded transition-colors flex items-center justify-center ${
                      isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
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
    </>
  );
}

// -----------------------------------------------------------------------------
// BUILDER TAB
// -----------------------------------------------------------------------------
interface BuilderTabProps {
  settings: BuilderSettings;
  onUpdate: (update: Partial<BuilderSettings>) => void;
  prescriptionsSettings: PrescriptionsSettings;
  onUpdatePrescriptions: (update: Partial<PrescriptionsSettings>) => void;
}

function BuilderTab({ settings, onUpdate, prescriptionsSettings, onUpdatePrescriptions }: BuilderTabProps) {
  const [subTab, setSubTab] = React.useState<'list' | 'builder'>('list');

  const updateHerbsList = (update: Partial<BuilderSettings['herbsList']>) => {
    onUpdate({ herbsList: { ...settings.herbsList, ...update } });
  };

  const updateFormulasList = (update: Partial<BuilderSettings['formulasList']>) => {
    onUpdate({ formulasList: { ...settings.formulasList, ...update } });
  };

  const updatePrescriptionBuilder = (update: Partial<BuilderSettings['prescriptionBuilder']>) => {
    onUpdate({ prescriptionBuilder: { ...settings.prescriptionBuilder, ...update } });
  };

  const updatePreview = (update: Partial<BuilderSettings['preview']>) => {
    onUpdate({ preview: { ...settings.preview, ...update } });
  };

  // Reorder functions for Herbs List
  const moveHerbsListItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...settings.herbsList.order];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      updateHerbsList({ order: newOrder });
    }
  };

  // Reorder functions for Formulas List
  const moveFormulasListItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...settings.formulasList.order];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      updateFormulasList({ order: newOrder });
    }
  };

  // Reorder functions for Prescription Builder Herbs
  const movePrescriptionHerbsItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...settings.prescriptionBuilder.herbs.order];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      updatePrescriptionBuilder({
        herbs: { ...settings.prescriptionBuilder.herbs, order: newOrder },
      });
    }
  };

  // Reorder functions for Prescription Builder Formulas
  const movePrescriptionFormulasItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...settings.prescriptionBuilder.formulas.order];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      updatePrescriptionBuilder({
        formulas: { ...settings.prescriptionBuilder.formulas, order: newOrder },
      });
    }
  };

  // Reorder functions for Preview Herbs
  const movePreviewHerbsItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...settings.preview.herbs.order];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      updatePreview({
        herbs: { ...settings.preview.herbs, order: newOrder },
      });
    }
  };

  // Reorder functions for Preview Formulas
  const movePreviewFormulasItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...settings.preview.formulas.order];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      updatePreview({
        formulas: { ...settings.preview.formulas, order: newOrder },
      });
    }
  };

  return (
    <>
      {/* Sub-Tab Toggle */}
      <div className="mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setSubTab('list')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              subTab === 'list'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            List Display
          </button>
          <button
            onClick={() => setSubTab('builder')}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              subTab === 'builder'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Prescription Builder Display
          </button>
        </div>
      </div>

      {subTab === 'list' && <BuilderListDisplay settings={settings} onUpdate={onUpdate} />}
      {subTab === 'builder' && (
        <BuilderPrescriptionDisplay
          settings={settings}
          onUpdate={onUpdate}
          prescriptionsSettings={prescriptionsSettings}
          onUpdatePrescriptions={onUpdatePrescriptions}
        />
      )}
    </>
  );
}

// List Display Sub-Component
function BuilderListDisplay({
  settings,
  onUpdate,
}: {
  settings: BuilderSettings;
  onUpdate: (update: Partial<BuilderSettings>) => void;
}) {
  const updateHerbsList = (update: Partial<BuilderSettings['herbsList']>) => {
    onUpdate({ herbsList: { ...settings.herbsList, ...update } });
  };

  const updateFormulasList = (update: Partial<BuilderSettings['formulasList']>) => {
    onUpdate({ formulasList: { ...settings.formulasList, ...update } });
  };

  const moveHerbsListItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...settings.herbsList.order];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      updateHerbsList({ order: newOrder });
    }
  };

  const moveFormulasListItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...settings.formulasList.order];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      updateFormulasList({ order: newOrder });
    }
  };

  return (
    <>
      {/* Herbs List Display */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Herbs List Display</h3>
        <div className="space-y-2">
          {settings.herbsList.order.map((nameType, index) => {
            const isFirst = index === 0;
            const isLast = index === settings.herbsList.order.length - 1;
            const labels: Record<string, string> = {
              pinyin: 'Pinyin Name',
              latin: 'Pharmaceutical Name',
              hanzi: 'Hanzi Name',
            };

            return (
              <div key={nameType} className="flex items-center gap-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                  <input
                    type="checkbox"
                    checked={settings.herbsList[nameType as keyof typeof settings.herbsList]}
                    onChange={(e) =>
                      updateHerbsList({
                        [nameType]: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">{labels[nameType] || nameType}</span>

                  {/* Mobile: Arrows inside label */}
                  <div className="flex gap-1 sm:hidden">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        moveHerbsListItem(index, 'up');
                      }}
                      disabled={isFirst}
                      className={`p-1 rounded transition-colors flex items-center justify-center ${
                        isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                      aria-label="Move up"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        moveHerbsListItem(index, 'down');
                      }}
                      disabled={isLast}
                      className={`p-1 rounded transition-colors flex items-center justify-center ${
                        isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                      aria-label="Move down"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </label>

                {/* Desktop: Arrows outside label */}
                <div className="hidden sm:flex flex-col gap-0.5">
                  <button
                    onClick={() => moveHerbsListItem(index, 'up')}
                    disabled={isFirst}
                    className={`p-1 rounded transition-colors flex items-center justify-center ${
                      isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                    aria-label="Move up"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveHerbsListItem(index, 'down')}
                    disabled={isLast}
                    className={`p-1 rounded transition-colors flex items-center justify-center ${
                      isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                    aria-label="Move down"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={settings.herbsList.natureIndicator}
              onChange={(e) => updateHerbsList({ natureIndicator: e.target.checked })}
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700 flex-1">Nature Indicator</span>
          </label>
        </div>
      </div>

      {/* Formulas List Display */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Formulas List Display</h3>
        <div className="space-y-2">
          {settings.formulasList.order.map((nameType, index) => {
            const isFirst = index === 0;
            const isLast = index === settings.formulasList.order.length - 1;
            const labels = {
              pinyin: 'Pinyin Name',
              pharmaceutical: 'Translated Name',
              hanzi: 'Hanzi Name',
            };

            return (
              <div key={nameType} className="flex items-center gap-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                  <input
                    type="checkbox"
                    checked={settings.formulasList[nameType]}
                    onChange={(e) =>
                      updateFormulasList({
                        [nameType]: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">{labels[nameType]}</span>

                  {/* Mobile: Arrows inside label */}
                  <div className="flex gap-1 sm:hidden">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        moveFormulasListItem(index, 'up');
                      }}
                      disabled={isFirst}
                      className={`p-1 rounded transition-colors flex items-center justify-center ${
                        isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                      aria-label="Move up"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        moveFormulasListItem(index, 'down');
                      }}
                      disabled={isLast}
                      className={`p-1 rounded transition-colors flex items-center justify-center ${
                        isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                      aria-label="Move down"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </label>

                {/* Desktop: Arrows outside label */}
                <div className="hidden sm:flex flex-col gap-0.5">
                  <button
                    onClick={() => moveFormulasListItem(index, 'up')}
                    disabled={isFirst}
                    className={`p-1 rounded transition-colors flex items-center justify-center ${
                      isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                    aria-label="Move up"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => moveFormulasListItem(index, 'down')}
                    disabled={isLast}
                    className={`p-1 rounded transition-colors flex items-center justify-center ${
                      isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                    aria-label="Move down"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={settings.formulasList.thermalActionIndicator}
              onChange={(e) => updateFormulasList({ thermalActionIndicator: e.target.checked })}
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700 flex-1">Thermal Action Indicator</span>
          </label>
        </div>
      </div>
    </>
  );
}

// Prescription Builder Display Sub-Component
function BuilderPrescriptionDisplay({
  settings,
  onUpdate,
  prescriptionsSettings,
  onUpdatePrescriptions,
}: {
  settings: BuilderSettings;
  onUpdate: (update: Partial<BuilderSettings>) => void;
  prescriptionsSettings: PrescriptionsSettings;
  onUpdatePrescriptions: (update: Partial<PrescriptionsSettings>) => void;
}) {
  const updatePrescriptionBuilder = (update: Partial<BuilderSettings['prescriptionBuilder']>) => {
    onUpdate({ prescriptionBuilder: { ...settings.prescriptionBuilder, ...update } });
  };

  const movePrescriptionHerbsItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...settings.prescriptionBuilder.herbs.order];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      updatePrescriptionBuilder({
        herbs: { ...settings.prescriptionBuilder.herbs, order: newOrder },
      });
    }
  };

  const movePrescriptionFormulasItem = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...settings.prescriptionBuilder.formulas.order];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < newOrder.length) {
      [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
      updatePrescriptionBuilder({
        formulas: { ...settings.prescriptionBuilder.formulas, order: newOrder },
      });
    }
  };

  return (
    <>
      {/* Herbs */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Herbs</h3>
        <div className="space-y-2">
              {settings.prescriptionBuilder.herbs.order.map((nameType, index) => {
                const isFirst = index === 0;
                const isLast = index === settings.prescriptionBuilder.herbs.order.length - 1;
                const labels: Record<string, string> = {
                  pinyin: 'Pinyin Name',
                  latin: 'Pharmaceutical Name',
                  hanzi: 'Hanzi Name',
                };

                return (
                  <div key={nameType} className="flex items-center gap-2">
                    <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                      <input
                        type="checkbox"
                        checked={settings.prescriptionBuilder.herbs[nameType as keyof typeof settings.prescriptionBuilder.herbs]}
                        onChange={(e) =>
                          updatePrescriptionBuilder({
                            herbs: { ...settings.prescriptionBuilder.herbs, [nameType]: e.target.checked },
                          })
                        }
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <span className="text-sm text-gray-700 flex-1">{labels[nameType] || nameType}</span>

                      {/* Mobile: Arrows inside label */}
                      <div className="flex gap-1 sm:hidden">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            movePrescriptionHerbsItem(index, 'up');
                          }}
                          disabled={isFirst}
                          className={`p-1 rounded transition-colors flex items-center justify-center ${
                            isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                          }`}
                          aria-label="Move up"
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            movePrescriptionHerbsItem(index, 'down');
                          }}
                          disabled={isLast}
                          className={`p-1 rounded transition-colors flex items-center justify-center ${
                            isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                          }`}
                          aria-label="Move down"
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                    </label>

                    {/* Desktop: Arrows outside label */}
                    <div className="hidden sm:flex flex-col gap-0.5">
                      <button
                        onClick={() => movePrescriptionHerbsItem(index, 'up')}
                        disabled={isFirst}
                        className={`p-1 rounded transition-colors flex items-center justify-center ${
                          isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        }`}
                        aria-label="Move up"
                      >
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => movePrescriptionHerbsItem(index, 'down')}
                        disabled={isLast}
                        className={`p-1 rounded transition-colors flex items-center justify-center ${
                          isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                        }`}
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

      {/* Formulas */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Formulas</h3>
        <div className="space-y-2">
          {settings.prescriptionBuilder.formulas.order.map((nameType, index) => {
            const isFirst = index === 0;
            const isLast = index === settings.prescriptionBuilder.formulas.order.length - 1;
            const labels = {
              pinyin: 'Pinyin Name',
              pharmaceutical: 'Translated Name',
              hanzi: 'Hanzi Name',
            };

            return (
              <div key={nameType} className="flex items-center gap-2">
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-1">
                  <input
                    type="checkbox"
                    checked={settings.prescriptionBuilder.formulas[nameType]}
                    onChange={(e) =>
                      updatePrescriptionBuilder({
                        formulas: { ...settings.prescriptionBuilder.formulas, [nameType]: e.target.checked },
                      })
                    }
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">{labels[nameType]}</span>

                  {/* Mobile: Arrows inside label */}
                  <div className="flex gap-1 sm:hidden">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        movePrescriptionFormulasItem(index, 'up');
                      }}
                      disabled={isFirst}
                      className={`p-1 rounded transition-colors flex items-center justify-center ${
                        isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                      aria-label="Move up"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        movePrescriptionFormulasItem(index, 'down');
                      }}
                      disabled={isLast}
                      className={`p-1 rounded transition-colors flex items-center justify-center ${
                        isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                      }`}
                      aria-label="Move down"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                </label>

                {/* Desktop: Arrows outside label */}
                <div className="hidden sm:flex flex-col gap-0.5">
                  <button
                    onClick={() => movePrescriptionFormulasItem(index, 'up')}
                    disabled={isFirst}
                    className={`p-1 rounded transition-colors flex items-center justify-center ${
                      isFirst ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                    aria-label="Move up"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => movePrescriptionFormulasItem(index, 'down')}
                    disabled={isLast}
                    className={`p-1 rounded transition-colors flex items-center justify-center ${
                      isLast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                    }`}
                    aria-label="Move down"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={settings.prescriptionBuilder.formulas.ingredients}
              onChange={(e) =>
                updatePrescriptionBuilder({
                  formulas: { ...settings.prescriptionBuilder.formulas, ingredients: e.target.checked },
                })
              }
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
            <span className="text-sm text-gray-700 flex-1">Show Ingredients</span>
          </label>
        </div>
      </div>

      {/* Default Commentary */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Default Comments</h3>
        <div className="space-y-2">
          <textarea
            value={prescriptionsSettings.defaultCommentary || ''}
            onChange={(e) => onUpdatePrescriptions({ defaultCommentary: e.target.value })}
            placeholder="Enter default comments text (leave empty for no default)..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-gray-900 placeholder:text-gray-400"
          />
          <p className="text-xs text-gray-500">
            This text will be automatically added to the comments field when creating new prescriptions. Leave empty to have no default comments.
          </p>
        </div>
      </div>
    </>
  );
}