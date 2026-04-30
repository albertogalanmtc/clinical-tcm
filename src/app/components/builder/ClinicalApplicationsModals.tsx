import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, X, Search, ChevronDown, ChevronUp } from 'lucide-react';

export interface ClinicalPattern {
  name: string;
  formulas: string[];
}

export interface ClinicalCondition {
  name: string;
  category: 'western' | 'tcm';
  patterns?: ClinicalPattern[];
}

interface ClinicalApplication {
  condition: string;
  pattern: string | null;
}

interface HerbData {
  herb_id: string;
  pinyin_name: string;
  clinical_applications?: ClinicalApplication[];
}

interface FormulaData {
  formula_id: string;
  pinyin_name: string;
  clinical_applications?: ClinicalApplication[];
}

interface ClinicalApplicationsModalsProps {
  showConditionModal: boolean;
  setShowConditionModal: (show: boolean) => void;
  showPatternModal: boolean;
  setShowPatternModal: (show: boolean) => void;
  clinicalConditions: ClinicalCondition[];
  clinicalUseFilters: {
    clinicalApplications?: Array<{
      condition: string;
      patterns: string[];
    }>;
    condition: string | null;
    patterns: string[];
    indications?: string[];
    western_medical_dx?: string[];
  } | null;
  setClinicalUseFilters: (filters: any) => void;
  allHerbs?: HerbData[];
  allFormulas?: FormulaData[];
}

export function ClinicalApplicationsModals({
  showConditionModal,
  setShowConditionModal,
  showPatternModal,
  setShowPatternModal,
  clinicalConditions,
  clinicalUseFilters,
  setClinicalUseFilters,
  allHerbs = [],
  allFormulas = [],
}: ClinicalApplicationsModalsProps) {
  const [conditionSearch, setConditionSearch] = useState('');
  const [expandedConditions, setExpandedConditions] = useState<string[]>([]);

  // Temporary selection state - now supports multiple conditions with their patterns
  // Structure: Map<condition, Set<pattern>> where empty set = whole condition selected
  const [tempSelections, setTempSelections] = useState<Map<string, Set<string>>>(new Map());

  // Generate dynamic conditions from actual herb/formula data
  const generateDynamicConditions = (): ClinicalCondition[] => {
    const conditionsMap = new Map<string, Set<string>>();

    // Collect from herbs
    allHerbs.forEach(herb => {
      herb.clinical_applications?.forEach(app => {
        if (!conditionsMap.has(app.condition)) {
          conditionsMap.set(app.condition, new Set());
        }
        if (app.pattern) {
          conditionsMap.get(app.condition)!.add(app.pattern);
        }
      });
    });

    // Collect from formulas
    allFormulas.forEach(formula => {
      formula.clinical_applications?.forEach(app => {
        if (!conditionsMap.has(app.condition)) {
          conditionsMap.set(app.condition, new Set());
        }
        if (app.pattern) {
          conditionsMap.get(app.condition)!.add(app.pattern);
        }
      });
    });

    // Convert to ClinicalCondition format
    const dynamicConditions: ClinicalCondition[] = Array.from(conditionsMap.entries()).map(([condition, patterns]) => ({
      name: condition,
      category: 'western' as const,
      patterns: patterns.size > 0 
        ? Array.from(patterns).map(pattern => ({ name: pattern, formulas: [] }))
        : undefined,
    }));

    return dynamicConditions.sort((a, b) => a.name.localeCompare(b.name));
  };

  // Use dynamic conditions if we have herb/formula data, otherwise fall back to static
  const effectiveConditions = (allHerbs.length > 0 || allFormulas.length > 0) 
    ? generateDynamicConditions() 
    : clinicalConditions;

  // Helper function to count items for a condition/pattern
  const countItemsForCondition = (conditionName: string, patternName?: string) => {
    let herbCount = 0;
    let formulaCount = 0;

    // Count herbs
    allHerbs.forEach(herb => {
      const match = herb.clinical_applications?.some(app => {
        if (patternName) {
          return app.condition === conditionName && app.pattern === patternName;
        } else {
          return app.condition === conditionName;
        }
      });
      if (match) herbCount++;
    });

    // Count formulas
    allFormulas.forEach(formula => {
      const match = formula.clinical_applications?.some(app => {
        if (patternName) {
          return app.condition === conditionName && app.pattern === patternName;
        } else {
          return app.condition === conditionName;
        }
      });
      if (match) formulaCount++;
    });

    return { herbs: herbCount, formulas: formulaCount, total: herbCount + formulaCount };
  };

  // Initialize temp state when modal opens
  useEffect(() => {
    if (showConditionModal) {
      const newSelections = new Map<string, Set<string>>();

      // Load from new clinicalApplications structure
      if (clinicalUseFilters?.clinicalApplications && clinicalUseFilters.clinicalApplications.length > 0) {
        clinicalUseFilters.clinicalApplications.forEach(app => {
          newSelections.set(app.condition, new Set(app.patterns));
        });
      }
      // Fallback to legacy structure
      else if (clinicalUseFilters?.condition) {
        newSelections.set(
          clinicalUseFilters.condition,
          new Set(clinicalUseFilters.patterns || [])
        );
      }

      setTempSelections(newSelections);
    }
  }, [showConditionModal, clinicalUseFilters?.clinicalApplications, clinicalUseFilters?.condition, clinicalUseFilters?.patterns]);

  // Toggle condition checkbox
  const toggleCondition = (conditionName: string) => {
    const newSelections = new Map(tempSelections);
    const currentPatterns = newSelections.get(conditionName);

    // Find the condition to get its patterns
    const condition = effectiveConditions.find(c => c.name === conditionName);
    const availablePatterns = condition?.patterns?.map(p => p.name) || [];

    if (availablePatterns.length === 0) {
      // No patterns - just toggle the condition itself
      if (currentPatterns) {
        newSelections.delete(conditionName);
      } else {
        newSelections.set(conditionName, new Set());
      }
    } else {
      // Has patterns - select/deselect all patterns
      if (currentPatterns && currentPatterns.size === availablePatterns.length) {
        // All patterns selected - deselect all
        newSelections.delete(conditionName);
      } else {
        // Not all patterns selected - select all patterns
        newSelections.set(conditionName, new Set(availablePatterns));
      }
    }

    setTempSelections(newSelections);

    // Update immediately
    const clinicalApplications = Array.from(newSelections.entries()).map(([condition, patterns]) => ({
      condition,
      patterns: Array.from(patterns),
    }));

    setClinicalUseFilters({
      ...clinicalUseFilters,
      clinicalApplications,
      condition: clinicalApplications.length > 0 ? clinicalApplications[0].condition : null,
      patterns: clinicalApplications.length > 0 ? clinicalApplications[0].patterns : [],
    });
  };

  // Toggle pattern checkbox
  const togglePattern = (conditionName: string, patternName: string) => {
    const newSelections = new Map(tempSelections);
    const currentPatterns = newSelections.get(conditionName) || new Set<string>();

    if (currentPatterns.has(patternName)) {
      // Pattern is selected - uncheck it
      currentPatterns.delete(patternName);
      if (currentPatterns.size === 0) {
        // No patterns left - remove condition entirely
        newSelections.delete(conditionName);
      } else {
        newSelections.set(conditionName, currentPatterns);
      }
    } else {
      // Pattern not selected - add it
      const newPatterns = new Set(currentPatterns);
      newPatterns.add(patternName);
      newSelections.set(conditionName, newPatterns);
    }

    setTempSelections(newSelections);

    // Update immediately
    const clinicalApplications = Array.from(newSelections.entries()).map(([condition, patterns]) => ({
      condition,
      patterns: Array.from(patterns),
    }));

    setClinicalUseFilters({
      ...clinicalUseFilters,
      clinicalApplications,
      condition: clinicalApplications.length > 0 ? clinicalApplications[0].condition : null,
      patterns: clinicalApplications.length > 0 ? clinicalApplications[0].patterns : [],
    });
  };

  // Apply selections
  const applySelections = () => {
    // Convert Map to array format
    const clinicalApplications = Array.from(tempSelections.entries()).map(([condition, patterns]) => ({
      condition,
      patterns: Array.from(patterns),
    }));

    setClinicalUseFilters({
      ...clinicalUseFilters,
      clinicalApplications,
      // Keep legacy fields for backwards compatibility
      condition: clinicalApplications.length > 0 ? clinicalApplications[0].condition : null,
      patterns: clinicalApplications.length > 0 ? clinicalApplications[0].patterns : [],
    });
  };

  // Clear all selections
  const clearSelections = () => {
    setTempSelections(new Map());
    setClinicalUseFilters({
      ...clinicalUseFilters,
      clinicalApplications: [],
      condition: null,
      patterns: [],
    });
  };

  return (
    <>
      {/* Condition / Diagnosis Modal */}
      <Dialog.Root open={showConditionModal} onOpenChange={setShowConditionModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content
            className="fixed inset-x-0 bottom-0 top-[10vh] sm:inset-x-4 sm:top-1/2 sm:-translate-y-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:bottom-auto bg-white sm:rounded-lg sm:max-w-4xl sm:max-h-[85vh] overflow-hidden z-50 flex flex-col rounded-t-2xl sm:rounded-b-lg"
          >
            {/* Header */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setShowConditionModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors sm:hidden"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <Dialog.Title className="text-lg font-semibold text-gray-900 flex-1 text-center">
                  Clinical Applications
                </Dialog.Title>
                <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center">
                  <X className="w-5 h-5" />
                </Dialog.Close>
              </div>
              
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={conditionSearch}
                  onChange={(e) => setConditionSearch(e.target.value)}
                  placeholder="Search conditions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  autoFocus
                />
              </div>

              {/* Quick actions */}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-600">
                  {(() => {
                    const totalConditions = tempSelections.size;
                    const totalPatterns = Array.from(tempSelections.values()).reduce(
                      (sum, patterns) => sum + patterns.size,
                      0
                    );

                    if (totalPatterns > 0) {
                      return `${totalConditions} condition${totalConditions !== 1 ? 's' : ''}, ${totalPatterns} pattern${totalPatterns !== 1 ? 's' : ''} selected`;
                    } else if (totalConditions > 0) {
                      return `${totalConditions} condition${totalConditions !== 1 ? 's' : ''} selected`;
                    } else {
                      return '0 selected';
                    }
                  })()}
                </span>
              </div>
            </div>

            {/* Condition list */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-2">
                {effectiveConditions
                  .filter((condition) =>
                    condition.name.toLowerCase().includes(conditionSearch.toLowerCase())
                  )
                  .map((condition) => {
                    const isExpanded = expandedConditions.includes(condition.name);
                    const hasPatterns = condition.patterns && condition.patterns.length > 0;
                    const conditionPatterns = tempSelections.get(condition.name);
                    const selectedPatternsCount = conditionPatterns?.size || 0;
                    const totalPatternsCount = condition.patterns?.length || 0;

                    // Check if condition is selected:
                    // - If whole condition is selected (conditionPatterns exists with size 0)
                    // - OR if all patterns are selected (conditionPatterns size equals total patterns)
                    const isConditionChecked = conditionPatterns !== undefined &&
                      (conditionPatterns.size === 0 || (hasPatterns && conditionPatterns.size === totalPatternsCount));

                    // Show count if condition is selected OR if any patterns are selected
                    const displayCount = conditionPatterns !== undefined ? (
                      conditionPatterns.size === 0
                        ? countItemsForCondition(condition.name).total
                        : selectedPatternsCount
                    ) : 0;

                    return (
                      <div key={condition.name} className="border-b border-gray-100 last:border-b-0">
                        {/* Condition Header - Clean without box */}
                        <div className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors rounded">
                          {/* Checkbox for condition */}
                          <input
                            type="checkbox"
                            checked={isConditionChecked}
                            ref={(el) => {
                              if (el && hasPatterns && conditionPatterns) {
                                // Indeterminate when some (but not all) patterns are selected
                                // AND the whole condition isn't selected
                                el.indeterminate = conditionPatterns.size > 0 &&
                                  conditionPatterns.size < totalPatternsCount;
                              }
                            }}
                            onChange={() => toggleCondition(condition.name)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                            title={hasPatterns ? "Select all patterns in this condition" : "Select condition"}
                          />

                          {/* Expandable header */}
                          {hasPatterns ? (
                            <div
                              onClick={() => {
                                if (isExpanded) {
                                  setExpandedConditions(expandedConditions.filter((c) => c !== condition.name));
                                } else {
                                  setExpandedConditions([...expandedConditions, condition.name]);
                                }
                              }}
                              className="flex-1 flex items-center justify-between text-left cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <div>
                                  <span className="text-sm font-semibold text-gray-900">{condition.name}</span>
                                </div>
                                {displayCount > 0 && (
                                  <span className="inline-flex items-center justify-center min-w-[18px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                    {displayCount}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {isExpanded ? (
                                  <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                  <ChevronUp className="w-4 h-4 text-gray-400 transform rotate-180" />
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1">
                              <div className="text-sm font-semibold text-gray-900">{condition.name}</div>
                            </div>
                          )}
                        </div>

                        {/* Patterns List - Clean checkbox style */}
                        {hasPatterns && isExpanded && (
                          <div className="bg-white">
                            {condition.patterns!.map((pattern) => {
                              const isSelected = conditionPatterns?.has(pattern.name) || false;

                              return (
                                <label
                                  key={pattern.name}
                                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 ml-6 transition-colors rounded"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => togglePattern(condition.name, pattern.name)}
                                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {pattern.name}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-4 sm:px-6 py-4">
              <div className="flex gap-2">
                <button
                  onClick={clearSelections}
                  disabled={tempSelections.size === 0}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors font-medium disabled:opacity-0 disabled:cursor-default"
                >
                  Clear
                </button>
                <button
                  onClick={() => {
                    applySelections();
                    setShowConditionModal(false);
                  }}
                  disabled={tempSelections.size === 0}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-0 disabled:cursor-default"
                >
                  Apply
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}