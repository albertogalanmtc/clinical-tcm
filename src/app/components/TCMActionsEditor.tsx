import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { HerbAction, Herb, SubPattern } from '@/app/data/herbs';
import { CombinationSelector } from './CombinationSelector';

interface TCMActionsEditorProps {
  actions: HerbAction[];
  onChange: (actions: HerbAction[]) => void;
  allHerbs: Herb[];
}

export function TCMActionsEditor({ actions, onChange, allHerbs }: TCMActionsEditorProps) {
  // Track which actions are expanded (by default all expanded)
  const [expandedActions, setExpandedActions] = useState<Set<number>>(
    new Set(actions.map((_, i) => i))
  );

  // Track which combination dropdowns are open
  const [openCombinations, setOpenCombinations] = useState<Set<string>>(new Set());

  // Track search text for each combination dropdown
  const [searchTexts, setSearchTexts] = useState<Record<string, string>>({});

  // Ensure we have valid data
  const validActions = actions || [];
  const validAllHerbs = allHerbs || [];

  const toggleActionExpanded = (index: number) => {
    const newExpanded = new Set(expandedActions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedActions(newExpanded);
  };

  const toggleCombinationDropdown = (key: string) => {
    const newOpen = new Set(openCombinations);
    if (newOpen.has(key)) {
      newOpen.delete(key);
      // Clear search text when closing dropdown
      const newSearchTexts = { ...searchTexts };
      delete newSearchTexts[key];
      setSearchTexts(newSearchTexts);
    } else {
      newOpen.add(key);
    }
    setOpenCombinations(newOpen);
  };

  const addAction = () => {
    const newActions = [...validActions, { 
      title: '', 
      branches: [{ pattern: '', sub_patterns: [], combination: [], formula_example: '' }] 
    }];
    onChange(newActions);
    // Expand the newly added action
    setExpandedActions(new Set([...expandedActions, validActions.length]));
  };

  const removeAction = (actionIndex: number) => {
    onChange(validActions.filter((_, i) => i !== actionIndex));
    // Update expanded state
    const newExpanded = new Set(expandedActions);
    newExpanded.delete(actionIndex);
    setExpandedActions(newExpanded);
  };

  const updateActionTitle = (actionIndex: number, value: string) => {
    const newActions = [...validActions];
    newActions[actionIndex].title = value;
    onChange(newActions);
  };

  const addBranch = (actionIndex: number) => {
    const newActions = [...validActions];
    newActions[actionIndex].branches.push({ 
      pattern: '', 
      sub_patterns: [], 
      combination: [], 
      formula_example: '' 
    });
    onChange(newActions);
  };

  const removeBranch = (actionIndex: number, branchIndex: number) => {
    const newActions = [...validActions];
    newActions[actionIndex].branches = newActions[actionIndex].branches.filter((_, i) => i !== branchIndex);
    onChange(newActions);
  };

  const updateBranchPattern = (actionIndex: number, branchIndex: number, value: string) => {
    const newActions = [...validActions];
    newActions[actionIndex].branches[branchIndex].pattern = value;
    onChange(newActions);
  };

  const addSubPattern = (actionIndex: number, branchIndex: number) => {
    const newActions = [...validActions];
    const subPatterns = newActions[actionIndex].branches[branchIndex].sub_patterns || [];
    newActions[actionIndex].branches[branchIndex].sub_patterns = [
      ...subPatterns, 
      { name: '', combination: [], formula_example: '' }
    ];
    onChange(newActions);
  };

  const removeSubPattern = (actionIndex: number, branchIndex: number, subPatternIndex: number) => {
    const newActions = [...validActions];
    const subPatterns = newActions[actionIndex].branches[branchIndex].sub_patterns || [];
    newActions[actionIndex].branches[branchIndex].sub_patterns = subPatterns.filter((_, i) => i !== subPatternIndex);
    onChange(newActions);
  };

  const updateSubPatternName = (actionIndex: number, branchIndex: number, subPatternIndex: number, value: string) => {
    const newActions = [...validActions];
    const subPatterns = newActions[actionIndex].branches[branchIndex].sub_patterns || [];
    subPatterns[subPatternIndex].name = value;
    newActions[actionIndex].branches[branchIndex].sub_patterns = subPatterns;
    onChange(newActions);
  };

  const toggleHerbInSubPatternCombination = (actionIndex: number, branchIndex: number, subPatternIndex: number, herbName: string) => {
    const newActions = [...validActions];
    const subPattern = newActions[actionIndex].branches[branchIndex].sub_patterns![subPatternIndex];
    const combination = subPattern.combination || [];
    if (combination.includes(herbName)) {
      subPattern.combination = combination.filter(h => h !== herbName);
    } else {
      subPattern.combination = [...combination, herbName];
    }
    onChange(newActions);
  };

  const updateSubPatternFormulaExample = (actionIndex: number, branchIndex: number, subPatternIndex: number, value: string) => {
    const newActions = [...validActions];
    newActions[actionIndex].branches[branchIndex].sub_patterns![subPatternIndex].formula_example = value;
    onChange(newActions);
  };

  const toggleHerbInCombination = (actionIndex: number, branchIndex: number, herbName: string) => {
    const newActions = [...validActions];
    const combination = newActions[actionIndex].branches[branchIndex].combination || [];
    if (combination.includes(herbName)) {
      newActions[actionIndex].branches[branchIndex].combination = combination.filter(h => h !== herbName);
    } else {
      newActions[actionIndex].branches[branchIndex].combination = [...combination, herbName];
    }
    onChange(newActions);
  };

  const updateBranchFormulaExample = (actionIndex: number, branchIndex: number, value: string) => {
    const newActions = [...validActions];
    newActions[actionIndex].branches[branchIndex].formula_example = value;
    onChange(newActions);
  };

  return (
    <div className="space-y-4">
      {validActions.map((action, actionIndex) => {
        const isExpanded = expandedActions.has(actionIndex);
        
        return (
          <div key={actionIndex} className="border border-gray-300 rounded-lg overflow-hidden">
            {/* Action Header */}
            <div className="bg-gray-50 p-4">
              <div className="flex gap-2 items-start">
                <button
                  type="button"
                  onClick={() => toggleActionExpanded(actionIndex)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0 mt-1"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </button>
                <input
                  type="text"
                  value={action.title}
                  onChange={(e) => updateActionTitle(actionIndex, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                  placeholder="Enter action title (e.g., 'Tonify Qi')"
                />
                {validActions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeAction(actionIndex)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Action Body - Branches */}
            {isExpanded && (
              <div className="p-4 bg-white">
                <div className="space-y-4">
                  {action.branches.map((branch, branchIndex) => (
                    <div key={branchIndex} className="border-l-4 border-teal-500 pl-4 space-y-3">
                      <div className="flex gap-2 items-start">
                        <div className="flex-1 space-y-3">
                          {/* Pattern */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Pattern
                            </label>
                            <input
                              type="text"
                              value={branch.pattern}
                              onChange={(e) => updateBranchPattern(actionIndex, branchIndex, e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                              placeholder="e.g., 'Spleen Qi deficiency'"
                            />
                          </div>

                          {/* Sub-patterns with their own combination and formula */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-xs font-medium text-gray-500">
                                Sub-patterns (optional)
                              </label>
                              <button
                                type="button"
                                onClick={() => addSubPattern(actionIndex, branchIndex)}
                                className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                              >
                                + Add sub-pattern
                              </button>
                            </div>
                            {(branch.sub_patterns && branch.sub_patterns.length > 0) ? (
                              <div className="space-y-3">
                                {branch.sub_patterns.map((subPattern, subPatternIndex) => (
                                  <div key={subPatternIndex} className="ml-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    {/* Sub-pattern Name */}
                                    <div className="flex items-center gap-2 mb-2">
                                      <input
                                        type="text"
                                        value={subPattern.name}
                                        onChange={(e) => updateSubPatternName(actionIndex, branchIndex, subPatternIndex, e.target.value)}
                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                        placeholder="Sub-pattern name (e.g., 'with Dampness')"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeSubPattern(actionIndex, branchIndex, subPatternIndex)}
                                        className="px-2 py-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    </div>

                                    {/* Sub-pattern Combination */}
                                    <div className="mb-2">
                                      <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Combination
                                      </label>
                                      <CombinationSelector
                                        key={`${actionIndex}-${branchIndex}-sub-${subPatternIndex}`}
                                        herbs={validAllHerbs}
                                        combination={subPattern.combination || []}
                                        onToggleHerb={(herbName) => toggleHerbInSubPatternCombination(actionIndex, branchIndex, subPatternIndex, herbName)}
                                        onSearchChange={(value) => setSearchTexts({ ...searchTexts, [`${actionIndex}-${branchIndex}-sub-${subPatternIndex}`]: value })}
                                        searchText={searchTexts[`${actionIndex}-${branchIndex}-sub-${subPatternIndex}`] || ''}
                                        open={openCombinations.has(`${actionIndex}-${branchIndex}-sub-${subPatternIndex}`)}
                                        onToggleDropdown={() => toggleCombinationDropdown(`${actionIndex}-${branchIndex}-sub-${subPatternIndex}`)}
                                        size="sm"
                                      />
                                      
                                      {/* Show selected herbs as chips */}
                                      {subPattern.combination && subPattern.combination.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {subPattern.combination.map((herbName) => (
                                            <span
                                              key={herbName}
                                              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded text-xs"
                                            >
                                              {herbName}
                                              <button
                                                type="button"
                                                onClick={() => toggleHerbInSubPatternCombination(actionIndex, branchIndex, subPatternIndex, herbName)}
                                                className="hover:bg-teal-200 rounded-full p-0.5"
                                              >
                                                <X className="w-2.5 h-2.5" />
                                              </button>
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>

                                    {/* Sub-pattern Formula Example */}
                                    <div>
                                      <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Formula Example
                                      </label>
                                      <input
                                        type="text"
                                        value={subPattern.formula_example || ''}
                                        onChange={(e) => updateSubPatternFormulaExample(actionIndex, branchIndex, subPatternIndex, e.target.value)}
                                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
                                        placeholder="e.g., 'Liu Jun Zi Tang'"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                          </div>

                          {/* Pattern-level Combination - Only show if NO sub-patterns */}
                          {(!branch.sub_patterns || branch.sub_patterns.length === 0) && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Combination (optional)
                              </label>
                              <CombinationSelector
                                key={`${actionIndex}-${branchIndex}`}
                                herbs={validAllHerbs}
                                combination={branch.combination || []}
                                onToggleHerb={(herbName) => toggleHerbInCombination(actionIndex, branchIndex, herbName)}
                                onSearchChange={(value) => setSearchTexts({ ...searchTexts, [`${actionIndex}-${branchIndex}`]: value })}
                                searchText={searchTexts[`${actionIndex}-${branchIndex}`] || ''}
                                open={openCombinations.has(`${actionIndex}-${branchIndex}`)}
                                onToggleDropdown={() => toggleCombinationDropdown(`${actionIndex}-${branchIndex}`)}
                              />
                              
                              {/* Show selected herbs as chips */}
                              {branch.combination && branch.combination.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {branch.combination.map((herbName) => (
                                    <span
                                      key={herbName}
                                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 text-teal-700 rounded text-xs"
                                    >
                                      {herbName}
                                      <button
                                        type="button"
                                        onClick={() => toggleHerbInCombination(actionIndex, branchIndex, herbName)}
                                        className="hover:bg-teal-200 rounded-full p-0.5"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Pattern-level Formula Example - Only show if NO sub-patterns */}
                          {(!branch.sub_patterns || branch.sub_patterns.length === 0) && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Formula Example (optional)
                              </label>
                              <input
                                type="text"
                                value={branch.formula_example || ''}
                                onChange={(e) => updateBranchFormulaExample(actionIndex, branchIndex, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                                placeholder="e.g., 'Si Jun Zi Tang'"
                              />
                            </div>
                          )}
                        </div>

                        {/* Remove branch button */}
                        {action.branches.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBranch(actionIndex, branchIndex)}
                            className="px-2 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add pattern/branch button */}
                <button
                  type="button"
                  onClick={() => addBranch(actionIndex)}
                  className="mt-4 text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  + Add pattern/branch
                </button>
              </div>
            )}
          </div>
        );
      })}

      {/* Add action button */}
      <button
        type="button"
        onClick={addAction}
        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
      >
        + Add action
      </button>
    </div>
  );
}