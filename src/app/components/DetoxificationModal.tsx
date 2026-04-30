import * as Dialog from '@radix-ui/react-dialog';
import { X, Search, ChevronDown, ChevronUp, ChevronLeft } from 'lucide-react';
import { normalizeForSearch } from '@/app/utils/searchUtils';

interface DetoxificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableDetox: Record<string, string[]>;
  selectedDetox: Record<string, string[]>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  expandedGroups: string[];
  onToggleGroup: (toxinGroup: string) => void;
  onToggleAgent: (toxinGroup: string, agent: string) => void;
  onToggleAllGroupAgents: (toxinGroup: string, agents: string[]) => void;
  onClearAll: () => void;
  viewMode: 'categories' | 'all';
  onViewModeChange: (mode: 'categories' | 'all') => void;
}

export function DetoxificationModal({
  isOpen,
  onClose,
  availableDetox,
  selectedDetox,
  searchQuery,
  onSearchChange,
  expandedGroups,
  onToggleGroup,
  onToggleAgent,
  onToggleAllGroupAgents,
  onClearAll,
  viewMode,
  onViewModeChange
}: DetoxificationModalProps) {
  const selectedCount = Object.values(selectedDetox).reduce((acc, agents) => acc + agents.length, 0);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
        <Dialog.Content
          className="fixed left-0 right-0 bottom-0 top-[10vh] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:w-full sm:max-w-md sm:max-h-[85vh] overflow-hidden z-50 flex flex-col"
          onPointerDownOutside={onClose}
        >
          <Dialog.Title className="sr-only">Select Detoxification</Dialog.Title>

          {/* Header */}
          <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 flex-1 text-center">Detoxification</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search toxin groups or agents..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                autoFocus
              />
            </div>

            {/* Quick actions */}
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-gray-600">
                {selectedCount} selected
              </span>
              
              {/* View mode toggle */}
              <div className="flex items-center gap-1.5 bg-gray-100 rounded-lg p-0.5">
                <button
                  onClick={() => onViewModeChange('categories')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === 'categories'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Categories
                </button>
                <button
                  onClick={() => onViewModeChange('all')}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                    viewMode === 'all'
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
            {viewMode === 'categories' ? (
              <div className="space-y-2">
                {(() => {
                  const searchLower = normalizeForSearch(searchQuery);
                  
                  return Object.entries(availableDetox).map(([toxinGroup, agents]) => {
                    // Filter agents based on search
                    const filteredAgents = agents.filter(agent =>
                      normalizeForSearch(toxinGroup).includes(searchLower) ||
                      normalizeForSearch(agent).includes(searchLower)
                    );

                    if (filteredAgents.length === 0) return null;

                    const isGroupExpanded = expandedGroups.includes(toxinGroup);
                    const groupSelections = selectedDetox[toxinGroup] || [];
                    const groupCount = groupSelections.length;

                    return (
                      <div key={toxinGroup} className="border-b border-gray-100 last:border-b-0">
                        {/* Toxin Group Header */}
                        <div className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors">
                          {/* Checkbox for select all */}
                          <input
                            type="checkbox"
                            checked={groupCount === filteredAgents.length && groupCount > 0}
                            ref={(el) => {
                              if (el) {
                                el.indeterminate = groupCount > 0 && groupCount < filteredAgents.length;
                              }
                            }}
                            onChange={() => onToggleAllGroupAgents(toxinGroup, filteredAgents)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                            title="Select all agents in this group"
                          />
                          
                          {/* Expandable header */}
                          <div
                            onClick={() => onToggleGroup(toxinGroup)}
                            className="flex-1 flex items-center justify-between text-left cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{toxinGroup}</span>
                              {groupCount > 0 && (
                                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                  {groupCount}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {isGroupExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                              ) : (
                                <ChevronUp className="w-4 h-4 text-gray-400 transform rotate-180" />
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Agent List */}
                        {isGroupExpanded && (
                          <div className="bg-white">
                            {filteredAgents.map(agent => (
                              <label key={agent} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 ml-6 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={groupSelections.includes(agent)}
                                  onChange={() => onToggleAgent(toxinGroup, agent)}
                                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-700">{agent}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            ) : (
              <div className="space-y-1">
                {(() => {
                  const searchLower = normalizeForSearch(searchQuery);
                  
                  return Object.entries(availableDetox).flatMap(([toxinGroup, agents]) =>
                    agents
                      .filter(agent =>
                        normalizeForSearch(toxinGroup).includes(searchLower) ||
                        normalizeForSearch(agent).includes(searchLower)
                      )
                      .map(agent => {
                        const groupSelections = selectedDetox[toxinGroup] || [];
                        const isSelected = groupSelections.includes(agent);

                        return (
                          <label
                            key={`${toxinGroup}-${agent}`}
                            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 rounded transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => onToggleAgent(toxinGroup, agent)}
                              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                            />
                            <span className="text-sm text-gray-700">{agent}</span>
                          </label>
                        );
                      })
                  );
                })()}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              Apply
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}