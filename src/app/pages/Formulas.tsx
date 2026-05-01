import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllFormulas, deleteCustomFormula } from '@/app/data/formulasManager';
import { Formula } from '@/app/data/formulas';
import { SearchBar } from '@/app/components/ui/SearchBar';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { ScrollableListCard } from '@/app/components/ui/ScrollableListCard';
import { FeatureGuard } from '@/app/components/FeatureGuard';
import { normalizeForSearch } from '@/app/utils/searchUtils';
import { Search, Plus, ChevronDown, ChevronUp, X, LayoutList, LayoutGrid, Filter, ChevronLeft, ChevronRight, Pill, Star } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { NewFormulaModal } from '@/app/components/NewFormulaModal';
import { UnifiedDetailsModal } from '@/app/components/UnifiedDetailsModal';
import { useSectionIcon } from '../hooks/useSectionIcon';
import { usePlanFeatures } from '../hooks/usePlanFeatures';
import { useGlobalSettings } from '../hooks/useGlobalSettings';
import { useModalNavigation } from '../hooks/useModalNavigation';
import { useHerbBannedStatus } from '../hooks/useHerbBannedStatus';
import { useFavorites } from '../hooks/useFavorites';
import { getFormulaCategoryColors, getFormulaSubcategoryColors } from '../../lib/categoryColors';

const STORAGE_KEY = 'formulas-expanded-filters';

// Display column settings
interface DisplayColumns {
  pinyin: boolean;
  pharmaceutical: boolean;
  hanzi: boolean;
  category: boolean;
  subcategory: boolean;
  thermalActionIndicator?: boolean;
  sortOrder?: 'alphabetical' | 'categorical';
  order: ('pinyin' | 'pharmaceutical' | 'hanzi' | 'category' | 'subcategory')[];
  // New properties for formula detail ingredients display
  ingredientsNatureIndicator?: boolean;
  ingredientsThermalIndicator?: boolean;
  ingredientsLayout?: 'grid' | 'list';
}

export default function Formulas() {
  const { IconComponent: FormulaIcon, customSvg: formulaCustomSvg } = useSectionIcon('formulas');
  const { getLibraryAccess, hasFeature } = usePlanFeatures();
  const navigate = useNavigate();
  const { globalSettings } = useGlobalSettings();
  const { isHerbBanned } = useHerbBannedStatus();
  const { toggleFormulaFavorite, isFormulaFavorite } = useFavorites();

  // Modal navigation hook
  const modalNav = useModalNavigation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false); // Favorites filter
  
  // Get display columns from global settings
  const displayColumns: DisplayColumns = globalSettings.formulas;
  
  // Filters
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [subcategoryFilters, setSubcategoryFilters] = useState<string[]>([]);
  const [pharmacologicalFilters, setPharmacologicalFilters] = useState<string[]>([]);
  const [biologicalFilters, setBiologicalFilters] = useState<Record<string, string[]>>({});
  
  // Modals
  const [showPharmacologicalModal, setShowPharmacologicalModal] = useState(false);
  const [showBiologicalModal, setShowBiologicalModal] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showNewFormulaModal, setShowNewFormulaModal] = useState(false);
  const [editingFormula, setEditingFormula] = useState<Formula | null>(null);
  const [deletingFormula, setDeletingFormula] = useState<Formula | null>(null);
  
  // Modal search states
  const [pharmacologicalSearch, setPharmacologicalSearch] = useState('');
  const [biologicalSearch, setBiologicalSearch] = useState('');
  const [expandedSystems, setExpandedSystems] = useState<string[]>([]);
  
  // View modes for modals
  const [biologicalViewMode, setBiologicalViewMode] = useState<'categories' | 'all'>('categories');
  
  // Collapsible state for mobile filters
  const [mobileExpandedFilters, setMobileExpandedFilters] = useState({
    formulaFilters: false,
    categories: false,
    subcategories: false,
    advanced: false
  });
  
  // Collapsible state - Load from localStorage or use defaults
  const [expandedFilters, setExpandedFilters] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          formulaFilters: false,
          category: false,
          subcategory: false,
          advanced: false
        };
      }
    }
    return {
      formulaFilters: false,
      category: false,
      subcategory: false,
      advanced: false
    };
  });

  // Save expanded filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedFilters));
  }, [expandedFilters]);

  const formulasData = getAllFormulas();

  // Filter by plan access level
  const accessLevel = getLibraryAccess('formula');
  const filteredByAccess = accessLevel === 'sample' 
    ? formulasData.filter(formula => formula.category === 'Exterior Releasing Formulas')
    : formulasData;

  // Helper function to get current user's email
  const getCurrentUserEmail = (): string | null => {
    try {
      const userProfile = localStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        return profile.email || null;
      }
    } catch (error) {
      console.error('Error getting user email:', error);
    }
    return null;
  };

  // Filter formulas to show only system formulas and user's own created formulas
  const userEmail = getCurrentUserEmail();
  const userFormulas = filteredByAccess.filter(formula => {
    // Show system formulas (no createdBy or isSystemItem !== false)
    if (formula.isSystemItem !== false) {
      return true;
    }
    // Show only formulas created by current user
    if (userEmail && formula.createdBy?.userId === userEmail) {
      return true;
    }
    return false;
  });

  // Category order for categorical sorting (traditional TCM book order for formulas)
  const formulaCategoryOrder = [
    'Exterior-Releasing',
    'Heat-Clearing',
    'Downward Draining',
    'Harmonizing',
    'Exterior and Interior Releasing',
    'Summer-Heat-Dispelling',
    'Interior-Warming',
    'Tonic',
    'Shen-Calming',
    'Orifice-Opening',
    'Astringent',
    'Qi-Regulating',
    'Blood-Regulating',
    'Wind-Expelling',
    'Dryness-Relieving',
    'Damp-Dispelling',
    'Wind-Damp',
    'Phlegm-Dispelling',
    'Reducing, Guiding, and Dissolving',
    'Antiparasitic',
    'Emetic',
    'Formulas that Treat Abscesses and Sores'
  ];

  // Get all unique categories and subcategories
  const uniqueCategories = Array.from(new Set(userFormulas.map(f => f.category).filter(Boolean)));
  const allCategories = uniqueCategories.sort((a, b) => {
    const indexA = formulaCategoryOrder.indexOf(a);
    const indexB = formulaCategoryOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
  const allSubcategories = Array.from(new Set(userFormulas.map(f => f.subcategory).filter(Boolean))).sort();

  // Helper function to get thermal action border color
  const getThermalActionBorderColor = (thermalAction?: string) => {
    if (!thermalAction) return '';
    
    const normalized = thermalAction.toLowerCase();
    
    if (normalized.includes('very hot')) return 'border-l-red-400';
    if (normalized === 'hot') return 'border-l-red-300';
    if (normalized === 'warm') return 'border-l-orange-300';
    if (normalized === 'slightly warm') return 'border-l-orange-200';
    if (normalized === 'neutral') return 'border-l-gray-300';
    if (normalized === 'slightly cool') return 'border-l-blue-200';
    if (normalized === 'cool') return 'border-l-blue-300';
    if (normalized === 'cold') return 'border-l-blue-400';
    if (normalized.includes('very cold')) return 'border-l-blue-500';
    if (normalized.includes('slightly cold')) return 'border-l-blue-300';
    
    return '';
  };

  // Helper function to get thermal action border color as hex value (for inline styles)
  const getThermalActionBorderColorHex = (thermalAction?: string): string => {
    if (!thermalAction) return 'transparent';
    
    const normalized = thermalAction.toLowerCase();
    
    if (normalized.includes('very hot')) return '#f87171'; // red-400
    if (normalized === 'hot') return '#fca5a5'; // red-300
    if (normalized === 'warm') return '#fdba74'; // orange-300
    if (normalized === 'slightly warm') return '#fed7aa'; // orange-200
    if (normalized === 'neutral') return '#d1d5db'; // gray-300
    if (normalized === 'slightly cool') return '#bfdbfe'; // blue-200
    if (normalized === 'cool') return '#93c5fd'; // blue-300
    if (normalized === 'cold') return '#60a5fa'; // blue-400
    if (normalized.includes('very cold')) return '#3b82f6'; // blue-500
    if (normalized.includes('slightly cold')) return '#93c5fd'; // blue-300
    
    return 'transparent';
  };

  // Helper function to get thermal action background color for vertical strip
  const getThermalActionStripColor = (thermalAction?: string) => {
    if (!thermalAction) return '';
    
    const normalized = thermalAction.toLowerCase();
    
    if (normalized.includes('very hot')) return 'bg-red-400';
    if (normalized === 'hot') return 'bg-red-300';
    if (normalized === 'warm') return 'bg-orange-300';
    if (normalized === 'slightly warm') return 'bg-orange-200';
    if (normalized === 'neutral') return 'bg-gray-300';
    if (normalized === 'slightly cool') return 'bg-blue-200';
    if (normalized === 'cool') return 'bg-blue-300';
    if (normalized === 'cold') return 'bg-blue-400';
    if (normalized.includes('very cold')) return 'bg-blue-500';
    if (normalized.includes('slightly cold')) return 'bg-blue-300';
    
    return '';
  };

  // Get available subcategories based on selected categories
  const getAvailableSubcategories = () => {
    if (categoryFilters.length === 0) {
      // If no category is selected, show all subcategories
      return allSubcategories;
    }
    // Show only subcategories of selected categories
    return Array.from(
      new Set(
        userFormulas
          .filter(f => categoryFilters.includes(f.category))
          .map(f => f.subcategory)
      )
    ).sort();
  };

  // Get subcategories for a specific category
  const getSubcategoriesForCategory = (category: string): string[] => {
    const subcats = Array.from(
      new Set(
        userFormulas
          .filter(f => f.category === category && f.subcategory)
          .map(f => f.subcategory)
          .filter(Boolean)
      )
    ).sort() as string[];

    // Debug log
    if (subcats.length > 0) {
      console.log(`Category "${category}" has ${subcats.length} subcategories:`, subcats);
    }

    return subcats;
  };
  
  // Available effects for advanced filters - Auto-detect from formulas data
  const availablePharmacologicalEffects = Array.from(
    new Set(
      formulasData.flatMap(formula => 
        formula.pharmacological_effects || []
      )
    )
  ).sort();

  const availableBiologicalEffects = [
    'Increases blood flow',
    'Reduces blood pressure',
    'Lowers blood sugar',
    'Reduces cholesterol',
    'Enhances immunity',
    'Promotes digestion',
    'Relieves pain',
    'Reduces fever',
    'Clears heat',
    'Eliminates dampness',
    'Transforms phlegm',
    'Stops cough',
    'Calms spirit',
    'Nourishes blood',
    'Tonifies qi',
    'Warms yang',
    'Nourishes yin',
    'Moves blood',
    'Breaks stasis',
    'Regulates qi',
    'Opens channels',
    'Expels wind',
    'Clears toxins',
    'Generates fluids',
    'Sympathetic stimulation'
  ].sort();

  // Filtered effects based on search
  const filteredPharmacologicalEffects = availablePharmacologicalEffects.filter(effect =>
    normalizeForSearch(effect).includes(normalizeForSearch(pharmacologicalSearch))
  );

  const filteredBiologicalEffects = availableBiologicalEffects.filter(effect =>
    normalizeForSearch(effect).includes(normalizeForSearch(biologicalSearch))
  );

  // Filter logic
  const filteredAndSortedFormulas = userFormulas.filter(formula => {
    const query = normalizeForSearch(searchQuery);
    const matchesSearch = !query || 
      normalizeForSearch(formula.pinyin_name).includes(query) ||
      normalizeForSearch(formula.translated_name).includes(query) ||
      normalizeForSearch(formula.hanzi_name).includes(query) ||
      formula.alternative_names.some(name => normalizeForSearch(name).includes(query));
    
    const matchesCategory = categoryFilters.length === 0 || categoryFilters.includes(formula.category);
    const matchesSubcategory = subcategoryFilters.length === 0 || subcategoryFilters.includes(formula.subcategory);
    
    // Favorites filter
    const matchesFavorites = !showOnlyFavorites || isFormulaFavorite(formula.formula_id);
    
    return matchesSearch && matchesCategory && matchesSubcategory && matchesFavorites;
  }).sort((a, b) => {
    // Sort based on display settings
    if (displayColumns.sortOrder === 'categorical') {
      // First sort by category order
      const categoryIndexA = formulaCategoryOrder.indexOf(a.category || '');
      const categoryIndexB = formulaCategoryOrder.indexOf(b.category || '');
      
      // If both categories are in the order list, sort by category
      if (categoryIndexA !== -1 && categoryIndexB !== -1) {
        if (categoryIndexA !== categoryIndexB) {
          return categoryIndexA - categoryIndexB;
        }
      } else if (categoryIndexA !== -1) {
        return -1; // a has known category, b doesn't
      } else if (categoryIndexB !== -1) {
        return 1; // b has known category, a doesn't
      }
      
      // Within same category (or both unknown), sort alphabetically by pinyin
      return (a.pinyin_name || '').localeCompare(b.pinyin_name || '');
    } else {
      // Alphabetical sorting by pinyin name
      return (a.pinyin_name || '').localeCompare(b.pinyin_name || '');
    }
  });
  
  // Keep the old variable name for backwards compatibility
  const filteredFormulas = filteredAndSortedFormulas;

  // Toggle functions
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

  const togglePharmacologicalFilter = (effect: string) => {
    setPharmacologicalFilters(prev =>
      prev.includes(effect) ? prev.filter(e => e !== effect) : [...prev, effect]
    );
  };

  const toggleBiologicalFilter = (system: string, targetAction: string) => {
    setBiologicalFilters(prev => {
      const systemActions = prev[system] || [];
      if (systemActions.includes(targetAction)) {
        const newActions = systemActions.filter(a => a !== targetAction);
        if (newActions.length === 0) {
          const { [system]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [system]: newActions };
      } else {
        return { ...prev, [system]: [...systemActions, targetAction] };
      }
    });
  };

  const toggleAllBiologicalSystem = (system: string, targetActions: string[]) => {
    setBiologicalFilters(prev => {
      const systemActions = prev[system] || [];
      const allSelected = targetActions.every(action => systemActions.includes(action));
      if (allSelected) {
        const { [system]: _, ...rest } = prev;
        return rest;
      } else {
        return { ...prev, [system]: targetActions };
      }
    });
  };

  const clearAllFilters = () => {
    setCategoryFilters([]);
    setSubcategoryFilters([]);
    setPharmacologicalFilters([]);
    setBiologicalFilters({});
  };

  const clearAdvancedFilters = () => {
    setPharmacologicalFilters([]);
    setBiologicalFilters({});
  };

  const pharmacologicalFiltersCount = pharmacologicalFilters.length;
  const biologicalFiltersCount = Object.values(biologicalFilters).flat().length;
  const hasActiveFilters = categoryFilters.length > 0 || subcategoryFilters.length > 0 || pharmacologicalFiltersCount > 0 || biologicalFiltersCount > 0;
  const hasActiveAdvancedFilters = pharmacologicalFiltersCount > 0 || biologicalFiltersCount > 0;

  // Calculate dynamic grid columns based on visible columns
  const getGridColumnsClass = () => {
    const visibleColumns = [
      displayColumns.pinyin,
      displayColumns.pharmaceutical,
      displayColumns.hanzi,
      displayColumns.category,
      displayColumns.subcategory
    ].filter(Boolean).length;

    // Dynamic grid based on number of visible columns
    switch (visibleColumns) {
      case 1: return 'grid-cols-1';
      case 2: return 'grid-cols-2';
      case 3: return 'grid-cols-3';
      case 4: return 'grid-cols-4';
      case 5: return 'grid-cols-5';
      default: return 'grid-cols-5';
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden sm:overflow-auto p-4 lg:p-6 pb-[86px] sm:pb-4 lg:pb-6 gap-4">
      {/* Mobile Header - Hidden (moved to search bar) */}
      <div className="hidden flex-shrink-0">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Formulas</h1>
          {hasFeature('customContent') && (
          <button
            onClick={() => { setEditingFormula(null); setShowNewFormulaModal(true); }}
            className="inline-flex items-center justify-center gap-1 px-2 py-1 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors text-xs whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-3 h-3" />
            {formulaCustomSvg ? (
              <div 
                className="w-3 h-3 [&>svg]:w-full [&>svg]:h-full [&_path]:fill-current [&_circle]:fill-current [&_rect]:fill-current [&_polygon]:fill-current [&_polyline]:stroke-current [&_line]:stroke-current" 
                dangerouslySetInnerHTML={{ __html: formulaCustomSvg }} 
              />
            ) : (
              <FormulaIcon className="w-3 h-3" />
            )}
          </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 lg:gap-6 flex-1 min-h-0 items-stretch">
        {/* Left Column: H1 + Sidebar - Hidden on mobile */}
        <aside className="hidden lg:block w-72 flex-shrink-0 self-stretch">
          {/* Desktop H1 - Above filter container */}
          

          {/* Filters Container */}
          <div className="bg-white rounded-lg border border-gray-200 sticky top-4 max-h-[calc(100vh-6rem)] flex min-h-full flex-col overflow-hidden self-stretch">
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="px-6 py-6 space-y-6">
              {/* Formula Filters Header */}
              <div>
                <button
                  onClick={() => setExpandedFilters(prev => ({ ...prev, formulaFilters: !prev.formulaFilters }))}
                  className="flex items-center justify-between w-full text-left mb-3"
                >
                  <h2 className="text-lg font-semibold text-gray-900">Formula Filters</h2>
                  <div className="flex items-center gap-2">
                    {(categoryFilters.length > 0 || subcategoryFilters.length > 0) && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setCategoryFilters([]);
                          setSubcategoryFilters([]);
                        }}
                        className="text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
                      >
                        Clear
                      </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedFilters.formulaFilters ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {expandedFilters.formulaFilters && (
                  <div className="space-y-4">
                    {/* Categories - Protected by formulaPropertyFilters */}
                    <FeatureGuard feature="formulaPropertyFilters">
                    {allCategories.length > 0 && (
                      <div>
                        <button
                          onClick={() => setExpandedFilters(prev => ({ ...prev, category: !prev.category }))}
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
                          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedFilters.category ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedFilters.category && (
                          <div className="space-y-2.5">
                            {allCategories.map((category) => {
                              const isCategorySelected = categoryFilters.includes(category);
                              const subcategories = getSubcategoriesForCategory(category);

                              return (
                                <div key={`category-${category}`}>
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
                                        <label key={`subcategory-${subcategory}`} className="flex items-start gap-2 cursor-pointer">
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
                    </FeatureGuard>
                  </div>
                )}
              </div>


              {/* Advanced Filters */}
              {/* Separator */}
              {(hasFeature('pharmacologicalEffectsFilter') || hasFeature('biologicalMechanismsFilter')) && (
                <div className="border-t border-gray-200 my-4"></div>
              )}

              {(hasFeature('pharmacologicalEffectsFilter') || hasFeature('biologicalMechanismsFilter')) && (
              <>
              <div>
                <button
                  onClick={() => setExpandedFilters(prev => ({ ...prev, advanced: !prev.advanced }))}
                  className="flex items-center justify-between w-full text-left mb-3"
                >
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">Advanced Filters</h2>
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
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedFilters.advanced ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                
                {expandedFilters.advanced && (
                  <div className="space-y-3">
                    {/* Pharmacological Effects */}
                    {hasFeature('pharmacologicalEffectsFilter') && (
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
                    {hasFeature('biologicalMechanismsFilter') && (
                      <div>
                        <button
                          onClick={() => setShowBiologicalModal(true)}
                          className="flex items-center justify-between w-full text-left mb-3 hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Biological Mechanisms</h3>
                            {biologicalFiltersCount > 0 && (
                              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                {biologicalFiltersCount}
                              </span>
                            )}
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              </>
              )}

              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Active Filters</h3>
                  <div className="space-y-3">
                    {/* Category Filters */}
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

                    {/* Subcategory Filters */}
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

                    {/* Pharmacological Filters */}
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

                    {/* Biological Mechanisms Filters */}
                    {biologicalFiltersCount > 0 && hasFeature('biologicalMechanismsFilter') && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">Biological Mechanisms</p>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(biologicalFilters).flatMap(([mechanism, targets]) =>
                            (targets || []).map(target => (
                              <button
                                key={`${mechanism}-${target}`}
                                onClick={() => {
                                  const updatedTargets = biologicalFilters[mechanism].filter(t => t !== target);
                                  if (updatedTargets.length === 0) {
                                    const { [mechanism]: _, ...rest } = biologicalFilters;
                                    setBiologicalFilters(rest);
                                  } else {
                                    setBiologicalFilters({
                                      ...biologicalFilters,
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
                  </div>
                </div>
              )}

              {/* Clear All Button */}
              {hasActiveFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={clearAllFilters}
                    className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0 flex h-full min-h-0 flex-col gap-4 self-stretch">
          {/* Search bar with Filters and Display Settings */}
          <div className="flex items-center gap-2 h-10 sm:h-11 flex-shrink-0">
              <>
                <SearchBar
                  value={searchQuery}
                  onChange={setSearchQuery}
                  placeholder="Search formulas..."
                  className="w-full sm:w-[400px]"
                  showFavoriteButton={true}
                  onFavoriteClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                  isFavoriteActive={showOnlyFavorites}
                />
                
                {/* Add New Formula Button - Mobile: between search and filter */}
                {hasFeature('customContent') && (
                <button
                  onClick={() => { setEditingFormula(null); setShowNewFormulaModal(true); }}
                  className="sm:hidden flex items-center justify-center gap-2 w-10 h-10 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap flex-shrink-0"
                  title="Add New Formula"
                >
                  <Plus className="w-[18px] h-[18px]" />
                </button>
                )}
            
            {/* Mobile Filters Button - Icon only */}
            <div className="lg:hidden relative flex-shrink-0">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="h-10 w-10 bg-transparent border-0 sm:w-auto sm:h-11 sm:px-3 sm:bg-white sm:border sm:border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 sm:hover:bg-gray-50 transition-colors flex items-center justify-center"
                title="Filters"
              >
                <Filter className="w-[18px] h-[18px] sm:w-5 sm:h-5" />
                {(() => {
                  const biologicalFiltersCount = Object.values(biologicalFilters || {}).reduce((acc, targets) => acc + (targets?.length || 0), 0);
                  const totalCount = categoryFilters.length + subcategoryFilters.length + pharmacologicalFilters.length + biologicalFiltersCount;
                  return totalCount > 0 ? (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-teal-600 text-white text-[10px] rounded-full font-medium">
                      {totalCount}
                    </span>
                  ) : null;
                })()}
              </button>
            </div>
            
            {/* Spacer to push buttons to the right on desktop */}
            <div className="hidden sm:block flex-1" />
            
            {/* Add New Formula Button - Desktop only */}
            {hasFeature('customContent') && (
            <button
              onClick={() => { setEditingFormula(null); setShowNewFormulaModal(true); }}
              className="hidden sm:flex items-center justify-center gap-2 px-4 w-auto h-10 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap flex-shrink-0"
              title="Add New Formula"
            >
              <Plus className="w-4 h-4" />
              {formulaCustomSvg ? (
                <div 
                  className="w-4 h-4 [&>svg]:w-full [&>svg]:h-full [&_path]:fill-current [&_circle]:fill-current [&_rect]:fill-current [&_polygon]:fill-current [&_polyline]:stroke-current [&_line]:stroke-current" 
                  dangerouslySetInnerHTML={{ __html: formulaCustomSvg }} 
                />
              ) : (
                <Pill className="w-4 h-4" />
              )}
            </button>
            )}
            
            {/* View toggle - Desktop only */}
            <div className="hidden sm:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="List view"
              >
                <LayoutList className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Grid view"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
              </>
          </div>

          {/* Clinical list card - Always list on mobile, list/grid on desktop */}
          {filteredFormulas.length === 0 ? (
            <div className="flex-1 bg-white rounded-lg border border-gray-200 p-8 sm:p-12 flex items-center justify-center">
              <EmptyState
                icon={Search}
                title="No formulas found"
                description="Try adjusting your search query or filters"
              />
            </div>
          ) : (
            <ScrollableListCard className="flex-1 min-h-0 overflow-hidden" dynamic>
              {/* Mobile: Always list view */}
              <div className="sm:hidden divide-y divide-gray-200 border-b border-gray-200">
                {filteredFormulas.map((formula, index) => {
                  const categoryColors = formula.category ? getFormulaCategoryColors(formula.category) : null;
                  const subcategoryColors = formula.subcategory ? getFormulaSubcategoryColors(formula.subcategory) : null;

                  return (
                    <div
                      key={`mobile-formula-${formula.formula_id}-${index}`}
                      onClick={() => {
                        const formulaIndex = filteredFormulas.findIndex(f => f.formula_id === formula.formula_id);
                        modalNav.reset({ type: 'formula', name: formula.pinyin_name, listIndex: formulaIndex });
                      }}
                      className={`group hover:bg-gray-50 transition-colors cursor-pointer relative ${displayColumns.thermalActionIndicator !== false && formula.thermal_action ? `border-l-[3px] ${getThermalActionBorderColor(formula.thermal_action)}` : ''}`}
                    >
                      {/* Favorite Star */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFormulaFavorite(formula.formula_id);
                        }}
                        className="absolute top-2 right-2 p-1 z-10 flex items-start justify-end"
                        title={isFormulaFavorite(formula.formula_id) ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star
                          className={`w-5 h-5 ${isFormulaFavorite(formula.formula_id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                        />
                      </button>
                      <div className="block px-3 py-2.5 pr-10">
                        <div className="space-y-1.5">
                          {(() => {
                            const visibleNames = displayColumns.order.filter(col => displayColumns[col] && (col === 'pinyin' || col === 'hanzi' || col === 'pharmaceutical'));
                            const hasNoVisibleNames = visibleNames.length === 0;
                            const firstVisibleName = hasNoVisibleNames ? 'pinyin' : visibleNames[0];

                            return displayColumns.order.map((column) => {
                              // Force pinyin to show if no names are visible
                              if (hasNoVisibleNames && column === 'pinyin') {
                                return (
                                  <div key="pinyin" className="font-medium text-gray-900 text-sm">
                                    {formula.pinyin_name}
                                  </div>
                                );
                              }

                              if (!displayColumns[column]) return null;

                              const isFirstName = column === firstVisibleName;

                              switch (column) {
                                case 'pinyin':
                                  return (
                                    <div key="pinyin" className={isFirstName ? "font-medium text-gray-900 text-sm" : "text-xs text-gray-500"}>
                                      {formula.pinyin_name}
                                    </div>
                                  );
                                case 'hanzi':
                                  return (
                                    <div key="hanzi" className={isFirstName ? "font-medium text-gray-900 text-sm" : "text-xs text-gray-500"}>
                                      {formula.hanzi_name}
                                    </div>
                                  );
                                case 'pharmaceutical':
                                  return (
                                    <div key="pharmaceutical" className={isFirstName ? "font-medium text-gray-900 text-sm" : "text-xs text-gray-600"}>
                                      {formula.translated_name || '—'}
                                    </div>
                                  );
                                case 'category':
                                  return formula.category && categoryColors ? (
                                    <div key="category">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${categoryColors.bg} ${categoryColors.text}`}>
                                        {formula.category}
                                      </span>
                                    </div>
                                  ) : null;
                                case 'subcategory':
                                  return formula.subcategory && subcategoryColors ? (
                                    <div key="subcategory">
                                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${subcategoryColors.bg} ${subcategoryColors.text}`}>
                                        {formula.subcategory}
                                      </span>
                                    </div>
                                  ) : null;
                                default:
                                  return null;
                              }
                            });
                          })()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop: List or Grid view based on viewMode */}
              {viewMode === 'list' ? (
                <div className="hidden sm:block">
                  <div className="divide-y divide-gray-200 border-b border-gray-200">
                    {filteredFormulas.map((formula, index) => (
                      <div
                        key={`desktop-list-formula-${formula.formula_id}-${index}`}
                        onClick={() => {
                          const formulaIndex = filteredFormulas.findIndex(f => f.formula_id === formula.formula_id);
                          modalNav.reset({ type: 'formula', name: formula.pinyin_name, listIndex: formulaIndex });
                        }}
                        className={`group hover:bg-gray-50 transition-colors cursor-pointer ${displayColumns.thermalActionIndicator !== false && formula.thermal_action ? `border-l-4 ${getThermalActionBorderColor(formula.thermal_action)}` : ''}`}
                      >
                        <div className="block px-6 py-4">
                          <div className="flex items-start gap-4">
                            <div className={`flex-1 min-w-0 grid ${getGridColumnsClass()} gap-4 items-baseline`}>
                              {(() => {
                                const visibleNames = displayColumns.order.filter(col => displayColumns[col] && (col === 'pinyin' || col === 'hanzi' || col === 'pharmaceutical'));
                                const hasNoVisibleNames = visibleNames.length === 0;

                                return displayColumns.order.map((columnType) => {
                                  // Force pinyin to show if no names are visible
                                  if (hasNoVisibleNames && columnType === 'pinyin') {
                                    return (
                                      <div key="pinyin" className="font-medium text-gray-900">
                                        {formula.pinyin_name}
                                      </div>
                                    );
                                  }

                                  if (!displayColumns[columnType]) return null;

                                  // Determinar si este es el primer elemento visible
                                  const firstVisibleColumn = displayColumns.order.find(col => displayColumns[col]);
                                  const isFirstVisible = columnType === firstVisibleColumn;

                                  switch (columnType) {
                                    case 'pinyin':
                                      return (
                                        <div key="pinyin" className={isFirstVisible ? "font-medium text-gray-900" : "text-sm text-gray-600"}>
                                          {formula.pinyin_name}
                                        </div>
                                      );

                                    case 'pharmaceutical':
                                      return (
                                        <div key="pharmaceutical" className={isFirstVisible ? "font-medium text-gray-900" : "text-sm text-gray-600"}>
                                          {formula.translated_name || '—'}
                                        </div>
                                      );

                                    case 'hanzi':
                                      return (
                                        <div key="hanzi" className={isFirstVisible ? "font-medium text-gray-900" : "text-sm text-gray-500"}>
                                          <span className="font-hanzi">{formula.hanzi_name}</span>
                                        </div>
                                      );

                                    case 'category':
                                      return (
                                        <div key="category">
                                          {formula.category ? (
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${getFormulaCategoryColors(formula.category).bg} ${getFormulaCategoryColors(formula.category).text}`}>
                                              {formula.category}
                                            </span>
                                          ) : (
                                            <span className="text-sm text-gray-400">—</span>
                                          )}
                                        </div>
                                      );

                                    case 'subcategory':
                                      return (
                                        <div key="subcategory">
                                          {formula.subcategory ? (
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${getFormulaSubcategoryColors(formula.subcategory).bg} ${getFormulaSubcategoryColors(formula.subcategory).text}`}>
                                              {formula.subcategory}
                                            </span>
                                          ) : (
                                            <span className="text-sm text-gray-400">—</span>
                                          )}
                                        </div>
                                      );

                                    default:
                                      return null;
                                  }
                                });
                              })()}
                            </div>
                            {/* Favorite Star */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFormulaFavorite(formula.formula_id);
                              }}
                              className="flex-shrink-0 p-1"
                              title={isFormulaFavorite(formula.formula_id) ? "Remove from favorites" : "Add to favorites"}
                            >
                              <Star
                                className={`w-5 h-5 ${isFormulaFavorite(formula.formula_id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Desktop Grid View */
                <div className="hidden sm:block">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-6">
                    {filteredFormulas.map((formula, index) => (
                      <div
                        key={`desktop-grid-formula-${formula.formula_id}-${index}`}
                        onClick={() => {
                          const formulaIndex = filteredFormulas.findIndex(f => f.formula_id === formula.formula_id);
                          modalNav.reset({ type: 'formula', name: formula.pinyin_name, listIndex: formulaIndex });
                        }}
                        className="block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative cursor-pointer"
                      >
                        {displayColumns.thermalActionIndicator !== false && formula.thermal_action && (
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${getThermalActionStripColor(formula.thermal_action)}`}></div>
                        )}

                        {/* Favorite Star */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFormulaFavorite(formula.formula_id);
                          }}
                          className="absolute top-3 right-3 p-1 z-10"
                          title={isFormulaFavorite(formula.formula_id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Star
                            className={`w-5 h-5 ${isFormulaFavorite(formula.formula_id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        </button>

                        <div className={`pr-4 py-4 ${displayColumns.thermalActionIndicator !== false ? 'pl-5' : 'pl-4'}`}>
                          <div className="mb-3">
                            {(() => {
                              const visibleNames = [
                                displayColumns.pinyin && 'pinyin',
                                displayColumns.pharmaceutical && formula.translated_name && 'pharmaceutical',
                                displayColumns.hanzi && 'hanzi'
                              ].filter(Boolean);
                              const hasNoVisibleNames = visibleNames.length === 0;

                              // Force pinyin to show if no names are visible
                              if (hasNoVisibleNames) {
                                return (
                                  <div className="font-medium text-gray-900 mb-1">
                                    {formula.pinyin_name}
                                  </div>
                                );
                              }

                              return (
                                <>
                                  {/* Pinyin Name */}
                                  {displayColumns.pinyin && (
                                    <div className="font-medium text-gray-900 mb-1">
                                      {formula.pinyin_name}
                                    </div>
                                  )}

                                  {/* Pharmaceutical Name */}
                                  {displayColumns.pharmaceutical && formula.translated_name && (
                                    <div className="text-sm text-gray-600 mb-1">
                                      {formula.translated_name}
                                    </div>
                                  )}

                                  {/* Hanzi Name */}
                                  {displayColumns.hanzi && (
                                    <div className="text-sm text-gray-400 mb-3">
                                      {formula.hanzi_name}
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                          {/* Category and Subcategory */}
                          <div className="space-y-1.5">
                            {displayColumns.category && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800">
                                {formula.category}
                              </span>
                            )}
                            {displayColumns.subcategory && (
                              <div className="flex items-center gap-1.5">
                                {displayColumns.category && <span className="text-gray-400 text-xs">→</span>}
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                  {formula.subcategory}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </ScrollableListCard>
          )}
        </main>
      </div>

      {/* Pharmacological Effects Modal */}
      <Dialog.Root open={showPharmacologicalModal} onOpenChange={setShowPharmacologicalModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:inset-x-4 sm:top-1/2 sm:-translate-y-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:bottom-auto bg-white sm:rounded-lg sm:max-w-4xl sm:max-h-[85vh] overflow-hidden z-50 flex flex-col rounded-t-2xl sm:rounded-b-lg">
            <Dialog.Title className="sr-only">Pharmacological Effects</Dialog.Title>
            <Dialog.Description className="sr-only">Filter formulas by their pharmacological effects</Dialog.Description>
            {/* Header */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setShowPharmacologicalModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors sm:hidden"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900 flex-1 text-center">
                  Pharmacological Effects
                </h2>
                <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center">
                  <X className="w-5 h-5" />
                </Dialog.Close>
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-2">
                {filteredPharmacologicalEffects.map((effect) => (
                  <label
                    key={effect}
                    className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 transition-colors border-b border-gray-100 last:border-b-0 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={pharmacologicalFilters.includes(effect)}
                      onChange={() => togglePharmacologicalFilter(effect)}
                      className="w-4 h-4 flex-shrink-0 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5"
                    />
                    <span className="text-sm text-gray-700">{effect}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-4 sm:px-6 py-4">
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
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:inset-x-4 sm:top-1/2 sm:-translate-y-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:bottom-auto bg-white sm:rounded-lg sm:max-w-4xl sm:max-h-[85vh] overflow-hidden z-50 flex flex-col rounded-t-2xl sm:rounded-b-lg">
            <Dialog.Title className="sr-only">Biological Mechanisms</Dialog.Title>
            <Dialog.Description className="sr-only">Filter formulas by their biological mechanisms</Dialog.Description>
            {/* Header */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setShowBiologicalModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors sm:hidden"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900 flex-1 text-center">
                  Biological Mechanisms
                </h2>
                <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center">
                  <X className="w-5 h-5" />
                </Dialog.Close>
              </div>
              
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={biologicalSearch}
                  onChange={(e) => setBiologicalSearch(e.target.value)}
                  placeholder="Search biological mechanisms..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  autoFocus
                />
              </div>

              {/* Quick actions */}
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-gray-600">
                  {biologicalFiltersCount} selected
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500 italic px-3">No biological mechanisms data for formulas yet.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-4 sm:px-6 py-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setBiologicalFilters({})}
                  disabled={Object.keys(biologicalFilters).length === 0}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors font-medium disabled:opacity-0 disabled:cursor-default"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowBiologicalModal(false)}
                  disabled={Object.keys(biologicalFilters).length === 0}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-0 disabled:cursor-default"
                >
                  Apply
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Mobile Filters Modal */}
      <Dialog.Root open={showMobileFilters} onOpenChange={setShowMobileFilters}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:top-[15vh] sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 bg-white sm:rounded-lg sm:max-w-md sm:max-h-[85vh] overflow-hidden z-50 flex flex-col rounded-t-2xl sm:rounded-b-lg">
            <Dialog.Description className="sr-only">Filter formulas by type, nature, and other properties</Dialog.Description>
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center order-2">
                <X className="w-5 h-5" />
              </Dialog.Close>
              <Dialog.Title className="text-lg sm:text-xl font-semibold text-gray-900 order-1">
                Filters
              </Dialog.Title>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
              <div className="space-y-4">
                {/* Formula Filters */}
                <div>
                  <button
                    onClick={() => setMobileExpandedFilters(prev => ({ ...prev, formulaFilters: !prev.formulaFilters }))}
                    className="flex items-center justify-between w-full text-left mb-3"
                  >
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">Formula Filters</h2>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${mobileExpandedFilters.formulaFilters ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {mobileExpandedFilters.formulaFilters && (
                    <>
                      {/* Categories - Protected by formulaPropertyFilters */}
                      <FeatureGuard feature="formulaPropertyFilters">
                      {allCategories.length > 0 && (
                        <div className="mb-4">
                          <button
                            onClick={() => setMobileExpandedFilters(prev => ({ ...prev, categories: !prev.categories }))}
                            className="flex items-center justify-between w-full text-left mb-3"
                          >
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Categories</h3>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${mobileExpandedFilters.categories ? 'rotate-180' : ''}`} />
                          </button>
                          {mobileExpandedFilters.categories && (
                            <div className="space-y-2.5 max-h-48 overflow-y-auto">
                              {allCategories.map(category => {
                                const isCategorySelected = categoryFilters.includes(category);
                                const subcategories = getSubcategoriesForCategory(category);

                                return (
                                  <div key={`mobile-category-${category}`}>
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
                                          <label key={`mobile-subcategory-${subcategory}`} className="flex items-start gap-2 cursor-pointer">
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
                      </FeatureGuard>

                    </>
                  )}
                </div>

                {/* Advanced Filters */}
                {/* Separator */}
                {(hasFeature('pharmacologicalEffectsFilter') || hasFeature('biologicalMechanismsFilter')) && (
                  <div className="border-t border-gray-200 my-4"></div>
                )}

                {(hasFeature('pharmacologicalEffectsFilter') || hasFeature('biologicalMechanismsFilter')) && (
                <>
                <div>
                  <button
                    onClick={() => setMobileExpandedFilters(prev => ({ ...prev, advanced: !prev.advanced }))}
                    className="flex items-center justify-between w-full text-left mb-3"
                  >
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">Advanced Filters</h2>
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
                      {hasFeature('pharmacologicalEffectsFilter') && (
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
                      {hasFeature('biologicalMechanismsFilter') && (
                        <div>
                          <button
                            onClick={() => setShowBiologicalModal(true)}
                            className="flex items-center justify-between w-full text-left mb-3 hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Biological Mechanisms</h3>
                              {biologicalFiltersCount > 0 && (
                                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                  {biologicalFiltersCount}
                                </span>
                              )}
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                </>
                )}

                {/* Active Filters */}
                {hasActiveFilters && (
                  <>
                    <div className="border-t border-gray-200 my-4"></div>
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Active Filters</h3>
                      <div className="space-y-3">
                        {/* Category Filters */}
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

                        {/* Subcategory Filters */}
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

                        {/* Pharmacological Filters */}
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

                        {/* Biological Mechanisms Filters */}
                        {biologicalFiltersCount > 0 && hasFeature('biologicalMechanismsFilter') && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1.5">Biological Mechanisms</p>
                            <div className="flex flex-wrap gap-1.5">
                              {Object.entries(biologicalFilters).flatMap(([mechanism, targets]) =>
                                (targets || []).map(target => (
                                  <button
                                    key={`${mechanism}-${target}`}
                                    onClick={() => {
                                      const updatedTargets = biologicalFilters[mechanism].filter(t => t !== target);
                                      if (updatedTargets.length === 0) {
                                        const { [mechanism]: _, ...rest } = biologicalFilters;
                                        setBiologicalFilters(rest);
                                      } else {
                                        setBiologicalFilters({
                                          ...biologicalFilters,
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
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-2 min-h-[44px]">
                {hasActiveFilters && (
                  <>
                    <button
                      onClick={clearAllFilters}
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

      {/* Unified Details Modal */}
      <UnifiedDetailsModal
        isOpen={modalNav.isOpen}
        currentItem={modalNav.currentItem}
        canGoBack={modalNav.canGoBack}
        onClose={modalNav.close}
        onGoBack={modalNav.goBack}
        onNavigate={modalNav.navigateTo}
        showNatureIndicator={false}
        showThermalActionIndicator={globalSettings.formulas.thermalActionIndicator}
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
        allItems={filteredFormulas.map(f => f.pinyin_name)}
        onNavigatePrevious={() => {
          if (!modalNav.currentItem) return;
          const currentIndex = modalNav.currentItem.listIndex ?? filteredFormulas.findIndex(f => f.pinyin_name === modalNav.currentItem!.name);
          if (currentIndex > 0) {
            const previousFormula = filteredFormulas[currentIndex - 1];
            modalNav.replaceCurrentItem({ type: 'formula', name: previousFormula.pinyin_name, listIndex: currentIndex - 1 });
          }
        }}
        onNavigateNext={() => {
          if (!modalNav.currentItem) return;
          const currentIndex = modalNav.currentItem.listIndex ?? filteredFormulas.findIndex(f => f.pinyin_name === modalNav.currentItem!.name);
          if (currentIndex < filteredFormulas.length - 1) {
            const nextFormula = filteredFormulas[currentIndex + 1];
            modalNav.replaceCurrentItem({ type: 'formula', name: nextFormula.pinyin_name, listIndex: currentIndex + 1 });
          }
        }}
        showAdminActions={hasFeature('customContent')}
        onEditFormula={(formulaId) => {
          const formula = getAllFormulas().find(f => f.formula_id === formulaId);
          if (formula) {
            setEditingFormula(formula);
            setShowNewFormulaModal(true);
            modalNav.close();
          }
        }}
        onDeleteFormula={(formulaId) => {
          const formula = getAllFormulas().find(f => f.formula_id === formulaId);
          if (formula) {
            setDeletingFormula(formula);
          }
        }}
      />

      {/* New Formula Modal */}
      <NewFormulaModal
        isOpen={showNewFormulaModal}
        onClose={() => {
          setShowNewFormulaModal(false);
          setEditingFormula(null);
        }}
        onSuccess={() => {
          // Refresh formulas list
          window.location.reload();
        }}
        editingFormula={editingFormula || undefined}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={!!deletingFormula} onOpenChange={(open) => !open && setDeletingFormula(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md z-50 shadow-xl">
            <Dialog.Title className="text-xl font-bold text-gray-900 mb-2">
              Delete Formula
            </Dialog.Title>
            <Dialog.Description className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{deletingFormula?.pinyin_name}</span>? This action cannot be undone.
            </Dialog.Description>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingFormula(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deletingFormula) {
                    deleteCustomFormula(deletingFormula.formula_id);
                    toast.success(`${deletingFormula.pinyin_name} deleted successfully`);
                    setDeletingFormula(null);
                    modalNav.close();
                    window.location.reload();
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      </div>
    </div>
  );
}
