import { Plus, Trash2, Edit2, X, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { initializeDefaultCategories, type SafetyCategory } from '@/app/data/safetyCategoriesManager';

const STORAGE_KEY = 'tcm_safety_categories';

export default function AdvancedFiltersManager() {
  const [categories, setCategories] = useState<SafetyCategory[]>([]);
  const [addingGroup, setAddingGroup] = useState<'conditions' | 'medications' | 'allergies' | 'tcm_risk_patterns' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingTermsId, setEditingTermsId] = useState<string | null>(null);
  const [newTerm, setNewTerm] = useState('');

  // Load categories from localStorage
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setCategories(parsed.map((c: any) => ({
          ...c,
          createdAt: new Date(c.createdAt)
        })));
      } else {
        // Initialize with default categories
        initializeDefaultCategories();
        loadCategories(); // Reload after initialization
      }
    } catch (error) {
      console.error('Error loading safety categories:', error);
      toast.error('Error loading categories');
    }
  };

  const saveCategories = (cats: SafetyCategory[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cats));
      setCategories(cats);
      toast.success('Categories saved successfully');
    } catch (error) {
      console.error('Error saving categories:', error);
      toast.error('Error saving categories');
    }
  };

  const addCategory = (group: 'conditions' | 'medications' | 'allergies' | 'tcm_risk_patterns') => {
    if (!newCategoryName.trim()) {
      toast.error('Display Name is required');
      return;
    }

    const category: SafetyCategory = {
      id: Date.now().toString(),
      displayName: newCategoryName,
      group: group,
      active: true,
      createdAt: new Date()
    };

    saveCategories([...categories, category]);
    setNewCategoryName('');
    setAddingGroup(null);
  };

  const updateCategory = (id: string, updates: Partial<SafetyCategory>) => {
    const updated = categories.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    saveCategories(updated);
    setEditingId(null);
  };

  const deleteCategory = (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    saveCategories(categories.filter(c => c.id !== id));
  };

  const addRelatedTerm = (categoryId: string, term: string) => {
    if (!term.trim()) return;

    // Split by comma and trim each term
    const termsToAdd = term.split(',').map(t => t.trim()).filter(t => t.length > 0);

    if (termsToAdd.length === 0) return;

    const updated = categories.map(c => {
      if (c.id === categoryId) {
        const currentTerms = c.relatedTerms || [];
        const newTerms = [...currentTerms];
        let duplicatesFound = 0;
        let addedCount = 0;

        termsToAdd.forEach(termToAdd => {
          // Avoid duplicates
          if (currentTerms.some(t => t.toLowerCase() === termToAdd.toLowerCase())) {
            duplicatesFound++;
          } else {
            newTerms.push(termToAdd);
            addedCount++;
          }
        });

        if (duplicatesFound > 0 && addedCount === 0) {
          toast.error(duplicatesFound === 1 ? 'This term already exists' : 'These terms already exist');
          return c;
        } else if (duplicatesFound > 0) {
          toast.warning(`${addedCount} term(s) added, ${duplicatesFound} duplicate(s) skipped`);
        }

        return { ...c, relatedTerms: newTerms };
      }
      return c;
    });

    saveCategories(updated);
    setNewTerm('');
  };

  const removeRelatedTerm = (categoryId: string, termToRemove: string) => {
    const updated = categories.map(c => {
      if (c.id === categoryId) {
        return { ...c, relatedTerms: (c.relatedTerms || []).filter(t => t !== termToRemove) };
      }
      return c;
    });

    saveCategories(updated);
  };

  const groupedCategories = {
    conditions: categories.filter(c => c.group === 'conditions').sort((a, b) => a.displayName.localeCompare(b.displayName)),
    medications: categories.filter(c => c.group === 'medications').sort((a, b) => a.displayName.localeCompare(b.displayName)),
    allergies: categories.filter(c => c.group === 'allergies').sort((a, b) => a.displayName.localeCompare(b.displayName)),
    tcm_risk_patterns: categories.filter(c => c.group === 'tcm_risk_patterns').sort((a, b) => a.displayName.localeCompare(b.displayName))
  };

  const getGroupTitle = (group: string) => {
    switch(group) {
      case 'conditions': return 'General Conditions';
      case 'tcm_risk_patterns': return 'TCM Risk Patterns';
      default: return group.charAt(0).toUpperCase() + group.slice(1);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Safety Categories</h1>
        <p className="text-gray-600">
          Manage patient safety profile categories for the prescription builder
        </p>
      </div>

      {/* Categories by Group */}
      {(['conditions', 'medications', 'allergies', 'tcm_risk_patterns'] as const).map(group => (
        <div key={group} className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {getGroupTitle(group)}
            </h2>
            <button
              onClick={() => {
                setAddingGroup(group);
                setNewCategoryName('');
              }}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {/* Add Form for this group */}
          {addingGroup === group && (
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addCategory(group);
                    } else if (e.key === 'Escape') {
                      setAddingGroup(null);
                      setNewCategoryName('');
                    }
                  }}
                  placeholder={`Add new ${getGroupTitle(group).toLowerCase()}...`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  autoFocus
                />
                <button
                  onClick={() => addCategory(group)}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">Save</span>
                </button>
                <button
                  onClick={() => {
                    setAddingGroup(null);
                    setNewCategoryName('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {groupedCategories[group].length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No categories in this group
              </div>
            ) : (
              <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
                {groupedCategories[group].map(category => (
                  <div key={category.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        {editingId === category.id ? (
                          <input
                            type="text"
                            defaultValue={category.displayName}
                            onBlur={(e) => updateCategory(category.id, { displayName: e.target.value })}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                updateCategory(category.id, { displayName: (e.target as HTMLInputElement).value });
                              } else if (e.key === 'Escape') {
                                setEditingId(null);
                              }
                            }}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                            autoFocus
                          />
                        ) : (
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900">
                                {category.displayName}
                              </h3>
                            </div>

                            {/* Related Terms Section - For medications, conditions, allergies, and tcm_risk_patterns */}
                            {['medications', 'conditions', 'allergies', 'tcm_risk_patterns'].includes(category.group) && (
                              <div className="mt-2">
                                {/* Display existing terms */}
                                {(category.relatedTerms && category.relatedTerms.length > 0) && (
                                  <div className="flex flex-wrap gap-2 mb-2">
                                    {category.relatedTerms.map((term, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-full"
                                      >
                                        {term}
                                        <button
                                          onClick={() => removeRelatedTerm(category.id, term)}
                                          className="hover:bg-teal-100 rounded-full p-0.5"
                                          title="Remove term"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {/* Add new term input */}
                                {editingTermsId === category.id ? (
                                  <div className="flex gap-2 mt-2">
                                    <input
                                      type="text"
                                      value={newTerm}
                                      onChange={(e) => setNewTerm(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          addRelatedTerm(category.id, newTerm);
                                        } else if (e.key === 'Escape') {
                                          setEditingTermsId(null);
                                          setNewTerm('');
                                        }
                                      }}
                                      placeholder={
                                        category.group === 'medications' ? 'Add related term (e.g., losartan, valsartan)...' :
                                        category.group === 'conditions' ? 'Add related term (e.g., high blood pressure, HTN)...' :
                                        category.group === 'allergies' ? 'Add related term (e.g., shellfish, peanuts)...' :
                                        'Add related term (e.g., Qi Deficiency, Yin Xu)...'
                                      }
                                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => addRelatedTerm(category.id, newTerm)}
                                      className="px-3 py-1 text-sm bg-teal-600 text-white rounded hover:bg-teal-700 transition-colors"
                                    >
                                      Add
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingTermsId(null);
                                        setNewTerm('');
                                      }}
                                      className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setEditingTermsId(category.id)}
                                    className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                                  >
                                    + Add related term
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => setEditingId(editingId === category.id ? null : category.id)}
                          className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                          title="Edit"
                        >
                          {editingId === category.id ? (
                            <X className="w-4 h-4" />
                          ) : (
                            <Edit2 className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </>
    );
  }