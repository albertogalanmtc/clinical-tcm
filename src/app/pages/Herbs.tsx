import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAllHerbs, deleteCustomHerb } from '@/app/data/herbsManager';
import { Herb } from '@/app/data/herbs';
import { SearchBar } from '@/app/components/ui/SearchBar';
import { FlavorChip } from '@/app/components/ui/FlavorChip';
import { MeridianChip } from '@/app/components/ui/MeridianChip';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { ScrollableListCard } from '@/app/components/ui/ScrollableListCard';
import { FeatureGuard } from '@/app/components/FeatureGuard';
import { normalizeForSearch } from '@/app/utils/searchUtils';
import { Search, Plus, ChevronDown, ChevronUp, X, LayoutList, LayoutGrid, Filter, Ban, ChevronLeft, ChevronRight, Leaf, Star } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import { NewHerbModal } from '@/app/components/NewHerbModal';
import { UnifiedDetailsModal } from '@/app/components/UnifiedDetailsModal';
import { useHerbBannedStatus } from '../hooks/useHerbBannedStatus';
import { useSectionIcon } from '../hooks/useSectionIcon';
import { usePlanFeatures } from '../hooks/usePlanFeatures';
import { useGlobalSettings } from '../hooks/useGlobalSettings';
import { useModalNavigation } from '../hooks/useModalNavigation';
import { useFavorites } from '../hooks/useFavorites';
import { getHerbCategoryColors, getHerbSubcategoryColors } from '../../lib/categoryColors';

const STORAGE_KEY = 'herbs-expanded-categories';

// Display column settings
interface HerbsDisplayColumns {
  pinyin: boolean;
  pharmaceutical: boolean;
  hanzi: boolean;
  category: boolean;
  subcategory: boolean;
  flavor: boolean;
  channels: boolean;
  natureIndicator: boolean;
  sortOrder?: 'alphabetical' | 'categorical';
  order: ('pinyin' | 'pharmaceutical' | 'hanzi' | 'category' | 'subcategory' | 'flavor' | 'channels')[];
}

export default function Herbs() {
  const { isHerbBanned } = useHerbBannedStatus();
  const { IconComponent: HerbIcon, customSvg: herbCustomSvg } = useSectionIcon('herbs');
  const { getLibraryAccess, hasFeature } = usePlanFeatures();
  const navigate = useNavigate();
  const { globalSettings } = useGlobalSettings();
  const { toggleHerbFavorite, isHerbFavorite } = useFavorites();

  // Modal navigation hook
  const modalNav = useModalNavigation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showMobileFilters, setShowMobileFilters] = useState(false); // Mobile filters modal
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false); // Favorites filter
  
  // Get display columns from global settings
  const displayColumns: HerbsDisplayColumns = globalSettings.herbs;
  
  // Filters
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [subcategoryFilters, setSubcategoryFilters] = useState<string[]>([]);
  const [natureFilters, setNatureFilters] = useState<string[]>([]);
  const [flavorFilters, setFlavorFilters] = useState<string[]>([]);
  const [channelFilters, setChannelFilters] = useState<string[]>([]);
  const [pharmacologicalFilters, setPharmacologicalFilters] = useState<string[]>([]);
  const [biologicalFilters, setBiologicalFilters] = useState<Record<string, string[]>>({});
  const [bioactiveCompoundsFilters, setBioactiveCompoundsFilters] = useState<Record<string, string[]>>({});
  const [detoxificationFilters, setDetoxificationFilters] = useState<string[]>([]);
  
  // Modals
  const [showPharmacologicalModal, setShowPharmacologicalModal] = useState(false);
  const [showBiologicalModal, setShowBiologicalModal] = useState(false);
  const [showBioactiveCompoundsModal, setShowBioactiveCompoundsModal] = useState(false);
  const [showNewHerbModal, setShowNewHerbModal] = useState(false);
  const [editingHerb, setEditingHerb] = useState<Herb | null>(null);
  const [deletingHerb, setDeletingHerb] = useState<Herb | null>(null);

  // Modal search states
  const [pharmacologicalSearch, setPharmacologicalSearch] = useState('');
  const [biologicalSearch, setBiologicalSearch] = useState('');
  const [bioactiveCompoundsSearch, setBioactiveCompoundsSearch] = useState('');
  const [expandedPharmSections, setExpandedPharmSections] = useState<string[]>([]);
  const [expandedSystems, setExpandedSystems] = useState<string[]>([]);
  const [expandedChemicalClasses, setExpandedChemicalClasses] = useState<string[]>([]);

  // View modes for modals
  const [pharmacologicalViewMode, setPharmacologicalViewMode] = useState<'categories' | 'all'>('categories');
  const [biologicalViewMode, setBiologicalViewMode] = useState<'categories' | 'all'>('categories');
  const [bioactiveCompoundsViewMode, setBioactiveCompoundsViewMode] = useState<'categories' | 'all'>('categories');
  
  // Collapsible state - Load from localStorage or use defaults
  const [expandedCategories, setExpandedCategories] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return {
          herbFilters: false,
          category: false,
          nature: false,
          flavor: false,
          channels: false,
          advanced: false
        };
      }
    }
    return {
      herbFilters: false,
      category: false,
      nature: false,
      flavor: false,
      channels: false,
      advanced: false
    };
  });

  // Save expanded categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expandedCategories));
  }, [expandedCategories]);
  
  const herbsData = getAllHerbs();
  
  // Filter by plan access level
  const accessLevel = getLibraryAccess('herb');
  const filteredByAccess = accessLevel === 'sample' 
    ? herbsData.filter(herb => herb.category === 'Exterior Releasing Herbs')
    : herbsData;
  
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

  // Filter herbs to show only system herbs and user's own created herbs
  const userEmail = getCurrentUserEmail();
  const userHerbs = filteredByAccess.filter(herb => {
    // Show system herbs (no createdBy or isSystemItem !== false)
    if (herb.isSystemItem !== false) {
      return true;
    }
    // Show only herbs created by current user
    if (userEmail && herb.createdBy?.userId === userEmail) {
      return true;
    }
    return false;
  });

  // Category order for categorical sorting (traditional TCM book order)
  const categoryOrder = [
    'Exterior-Releasing',
    'Heat-Clearing',
    'Downward Draining',
    'Wind-Damp Dispelling',
    'Aromatic Damp-Dissolving',
    'Water-Regulating and Damp-Resolving',
    'Interior-Warming',
    'Qi-Regulating',
    'Digestive',
    'Antiparasitic',
    'Stop-Bleeding',
    'Blood-Invigorating and Stasis-Removing',
    'Phlegm-Resolving and Coughing and Wheezing Relieving',
    'Shen-Calming',
    'Liver-Calming and Wind-Extinguishing',
    'Orifice-Opening',
    'Tonic',
    'Astringent',
    'Emetic',
    'Substances for Topical Application'
  ];

  // Get unique values for filters with proper ordering
  const uniqueCategoriesUnsorted = Array.from(new Set(userHerbs.map(h => h.category).filter(Boolean)));
  const uniqueCategories = uniqueCategoriesUnsorted.sort((a, b) => {
    const indexA = categoryOrder.indexOf(a);
    const indexB = categoryOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });
  const uniqueNatures = Array.from(new Set(userHerbs.map(h => h.nature).filter(Boolean))).sort();
  const uniqueFlavors = Array.from(new Set(userHerbs.flatMap(h => h.flavor).filter(Boolean))).sort();
  const uniqueChannels = Array.from(new Set(userHerbs.flatMap(h => h.channels).filter(Boolean))).sort();

  // Get subcategories for selected categories
  const getSubcategoriesForCategory = (category: string): string[] => {
    const subcats = Array.from(
      new Set(
        userHerbs
          .filter(h => h.category === category && h.subcategory)
          .map(h => h.subcategory)
          .filter(Boolean)
      )
    ).sort() as string[];

    // Debug log
    if (subcats.length > 0) {
      console.log(`Herb category "${category}" has ${subcats.length} subcategories:`, subcats);
    }

    return subcats;
  };
  
  // Extract all unique pharmacological effects from herbs
  const allPharmacologicalEffects = new Set<string>();
  userHerbs.forEach(herb => {
    const pharmEffects = herb.pharmacological_effects || [];
    pharmEffects.forEach(effect => {
      if (effect && typeof effect === 'string' && effect.trim()) {
        allPharmacologicalEffects.add(effect);
      }
    });
  });

  // Convert to sorted array for rendering
  const pharmacologicalEffectsData = Array.from(allPharmacologicalEffects).sort();

  // Extract biological mechanisms grouped by system from herbs
  const allBiologicalSystems = new Map<string, Set<string>>();
  userHerbs.forEach(herb => {
    const bioMechanisms = herb.biological_mechanisms || [];
    bioMechanisms.forEach(({ system, target_action }) => {
      if (system && system.trim()) {
        if (!allBiologicalSystems.has(system)) {
          allBiologicalSystems.set(system, new Set());
        }
        // target_action is an array, just like effects in pharmacological_effects
        if (Array.isArray(target_action)) {
          target_action.forEach(action => {
            if (action && typeof action === 'string' && action.trim()) {
              allBiologicalSystems.get(system)!.add(action);
            }
          });
        }
      }
    });
  });

  // Convert to sorted object for rendering
  const biologicalSystemsData: Record<string, string[]> = {};
  Array.from(allBiologicalSystems.keys()).sort().forEach(system => {
    biologicalSystemsData[system] = Array.from(allBiologicalSystems.get(system)!).filter(item => typeof item === 'string').sort();
  });

  // Extract pharmacological effects from herbs
  const getAvailablePharmacologicalEffects = (): string[] => {
    const effects = new Set<string>();

    userHerbs.forEach(herb => {
      if (Array.isArray(herb.pharmacological_effects) && herb.pharmacological_effects.length > 0) {
        herb.pharmacological_effects.forEach(effect => {
          if (effect && typeof effect === 'string' && effect.trim()) {
            effects.add(effect);
          }
        });
      }
    });

    return Array.from(effects).sort();
  };

  // Extract biological mechanisms from herbs
  const getAvailableBiologicalMechanisms = (): string[] => {
    const mechanisms = new Set<string>();

    userHerbs.forEach(herb => {
      if (Array.isArray(herb.biological_mechanisms) && herb.biological_mechanisms.length > 0) {
        herb.biological_mechanisms.forEach(mechanism => {
          if (mechanism && typeof mechanism === 'string' && mechanism.trim()) {
            mechanisms.add(mechanism);
          }
        });
      }
    });

    return Array.from(mechanisms).sort();
  };

  // Extract bioactive compounds grouped by chemical class from herbs
  const getAvailableBioactiveCompounds = (): Record<string, string[]> => {
    const compoundsByClass = new Map<string, Set<string>>();

    userHerbs.forEach(herb => {
      if (!herb.bioactive_compounds || herb.bioactive_compounds.length === 0) return;

      const firstItem = herb.bioactive_compounds[0];

      if (typeof firstItem === 'string') {
        // Simple array format
        if (!compoundsByClass.has('Uncategorized')) {
          compoundsByClass.set('Uncategorized', new Set());
        }
        (herb.bioactive_compounds as string[]).forEach(compound => {
          if (compound && compound.trim()) {
            compoundsByClass.get('Uncategorized')!.add(compound);
          }
        });
      } else if (typeof firstItem === 'object' && 'chemical_class' in firstItem) {
        // Grouped array format
        (herb.bioactive_compounds as Array<{ chemical_class: string; compounds: string[] }>).forEach(group => {
          if (group.chemical_class && group.chemical_class.trim()) {
            if (!compoundsByClass.has(group.chemical_class)) {
              compoundsByClass.set(group.chemical_class, new Set());
            }
            group.compounds.forEach(compound => {
              if (compound && compound.trim()) {
                compoundsByClass.get(group.chemical_class)!.add(compound);
              }
            });
          }
        });
      }
    });

    // Convert to sorted object
    const result: Record<string, string[]> = {};
    Array.from(compoundsByClass.keys()).sort((a, b) => {
      if (a === 'Uncategorized') return 1;
      if (b === 'Uncategorized') return -1;
      return a.localeCompare(b);
    }).forEach(chemicalClass => {
      result[chemicalClass] = Array.from(compoundsByClass.get(chemicalClass)!).sort();
    });

    return result;
  };

  // Filtered pharmacological effects based on search
  const searchLower = normalizeForSearch(pharmacologicalSearch);
  const filteredPharmacologicalEffects = pharmacologicalEffectsData.filter(effect =>
    normalizeForSearch(effect).includes(searchLower)
  );

  // Filtered biological systems/target actions based on search
  const filteredBiologicalSystems: Record<string, string[]> = {};
  const bioSearchLower = normalizeForSearch(biologicalSearch);
  
  Object.entries(biologicalSystemsData).forEach(([system, targetActions]) => {
    const systemMatches = normalizeForSearch(system).includes(bioSearchLower);
    const matchedActions = targetActions.filter(action => 
      typeof action === 'string' && normalizeForSearch(action).includes(bioSearchLower)
    );
    
    if (systemMatches || matchedActions.length > 0) {
      filteredBiologicalSystems[system] = systemMatches ? targetActions : matchedActions;
    }
  });

  // Filter logic
  const filteredAndSortedHerbs = userHerbs.filter(herb => {
    const query = normalizeForSearch(searchQuery);
    const matchesSearch = !query ||
      normalizeForSearch(herb.pinyin_name).includes(query) ||
      normalizeForSearch(herb.pharmaceutical_name).includes(query) ||
      normalizeForSearch(herb.english_name).includes(query) ||
      normalizeForSearch(herb.hanzi_name).includes(query);

    const matchesCategory = categoryFilters.length === 0 || categoryFilters.includes(herb.category || '');
    const matchesSubcategory = subcategoryFilters.length === 0 || subcategoryFilters.includes(herb.subcategory || '');
    const matchesNature = natureFilters.length === 0 || natureFilters.includes(herb.nature || '');
    const matchesFlavor = flavorFilters.length === 0 || flavorFilters.some(f => herb.flavor.includes(f));
    const matchesChannel = channelFilters.length === 0 || channelFilters.some(c => herb.channels.includes(c));
    
    // Favorites filter
    const matchesFavorites = !showOnlyFavorites || isHerbFavorite(herb.herb_id);
    
    // Advanced filters
    const matchesPharmacological = pharmacologicalFilters.length === 0 ||
      pharmacologicalFilters.some(filter => {
        const pharmEffects = herb.pharmacological_effects || [];
        return pharmEffects.includes(filter);
      });
    
    const matchesBiologicalMechanisms = Object.keys(biologicalFilters).length === 0 ||
      Object.entries(biologicalFilters).some(([system, targetActions]) =>
        herb.biological_mechanisms?.some((bm: any) =>
          bm.system === system && targetActions.includes(bm.target_action)
        )
      );
    
    const matchesBioactiveCompounds = Object.keys(bioactiveCompoundsFilters).length === 0 ||
      Object.entries(bioactiveCompoundsFilters).some(([chemicalClass, compounds]) =>
        herb.bioactive_compounds?.some(bc =>
          bc.chemical_class === chemicalClass && compounds.some(c => bc.compounds?.includes(c))
        )
      );
    
    const matchesDetoxification = Object.keys(detoxificationFilters).length === 0 ||
      Object.entries(detoxificationFilters).some(([toxinGroup, agents]) =>
        herb.detoxification?.some(d =>
          d.toxin_group === toxinGroup && agents.some(a => d.agents?.includes(a))
        )
      );
    
    return matchesSearch && matchesCategory && matchesSubcategory && matchesNature && matchesFlavor && matchesChannel &&
      matchesFavorites && matchesPharmacological && matchesBiologicalMechanisms && matchesBioactiveCompounds && matchesDetoxification;
  }).sort((a, b) => {
    // Sort based on display settings
    if (displayColumns.sortOrder === 'categorical') {
      // Normalize category names for comparison (remove color names like "Verdes", "Rojos")
      const normalizeCategoryName = (cat: string) => {
        return cat.replace(/\s+(Verdes|Rojos|Azules|Amarillos|Naranjas|Morados|Rosas|Blancos|Grises|Negros)$/i, '').trim();
      };

      const normalizedCategoryA = normalizeCategoryName(a.category || '');
      const normalizedCategoryB = normalizeCategoryName(b.category || '');

      // Find index in categoryOrder array (also normalize the order names)
      const categoryIndexA = categoryOrder.findIndex(cat => normalizeCategoryName(cat) === normalizedCategoryA);
      const categoryIndexB = categoryOrder.findIndex(cat => normalizeCategoryName(cat) === normalizedCategoryB);

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
  const filteredHerbs = filteredAndSortedHerbs;

  // Toggle functions
  const toggleCategoryFilter = (category: string) => {
    setCategoryFilters(prev =>
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
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

  const togglePharmacologicalFilter = (effect: string) => {
    setPharmacologicalFilters(prev => {
      if (prev.includes(effect)) {
        return prev.filter(e => e !== effect);
      } else {
        return [...prev, effect];
      }
    });
  };

  const toggleBiologicalFilter = (system: string, targetAction: string) => {
    setBiologicalFilters(prev => {
      const systemActions = prev[system] || [];
      
      if (systemActions.includes(targetAction)) {
        // Remove target action
        const newActions = systemActions.filter(a => a !== targetAction);
        if (newActions.length === 0) {
          const { [system]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [system]: newActions };
      } else {
        // Add target action
        return { ...prev, [system]: [...systemActions, targetAction] };
      }
    });
  };

  const toggleAllBiologicalSystem = (system: string, targetActions: string[]) => {
    setBiologicalFilters(prev => {
      const systemActions = prev[system] || [];
      const allSelected = targetActions.every(action => systemActions.includes(action));
      
      if (allSelected) {
        // Deselect all
        const { [system]: _, ...rest } = prev;
        return rest;
      } else {
        // Select all
        return { ...prev, [system]: targetActions };
      }
    });
  };

  const clearAllFilters = () => {
    setCategoryFilters([]);
    setSubcategoryFilters([]);
    setNatureFilters([]);
    setFlavorFilters([]);
    setChannelFilters([]);
    setPharmacologicalFilters([]);
    setBiologicalFilters({});
    setBioactiveCompoundsFilters({});
  };

  const clearAdvancedFilters = () => {
    setPharmacologicalFilters([]);
    setBiologicalFilters({});
    setBioactiveCompoundsFilters({});
  };

  const hasActiveBasicFilters = categoryFilters.length > 0 || subcategoryFilters.length > 0 || natureFilters.length > 0 || flavorFilters.length > 0 || channelFilters.length > 0;
  const pharmacologicalFiltersCount = pharmacologicalFilters.length;
  const biologicalFiltersCount = Object.values(biologicalFilters).flat().length;
  const bioactiveCompoundsCount = Object.values(bioactiveCompoundsFilters).flat().length;
  const hasActiveAdvancedFilters = pharmacologicalFiltersCount > 0 || biologicalFiltersCount > 0 || bioactiveCompoundsCount > 0;

  // Calculate grid columns for list view based on visible columns
  const getListGridClass = () => {
    const visibleColumns = [
      displayColumns.pinyin,
      displayColumns.pharmaceutical,
      displayColumns.hanzi,
      displayColumns.category,
      displayColumns.subcategory,
      displayColumns.flavor,
      displayColumns.channels
    ].filter(Boolean).length;

    switch (visibleColumns) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-4';
      case 5:
        return 'grid-cols-5';
      case 6:
        return 'grid-cols-6';
      case 7:
        return 'grid-cols-7';
      default:
        return 'grid-cols-7';
    }
  };

  // Helper function to get nature border color
  const getNatureBorderColor = (nature?: string): string => {
    if (!nature) return '';
    
    const normalized = nature.toLowerCase();
    
    if (normalized.includes('very hot') || normalized === 'muy caliente') return 'border-l-red-400';
    if (normalized === 'hot' || normalized === 'caliente') return 'border-l-red-300';
    if (normalized === 'warm' || normalized === 'templado') return 'border-l-orange-300';
    if (normalized === 'neutral' || normalized === 'neutro') return 'border-l-gray-300';
    if (normalized === 'cool' || normalized === 'fresca') return 'border-l-blue-300';
    if (normalized === 'cold' || normalized === 'fría') return 'border-l-blue-400';
    if (normalized.includes('very cold') || normalized === 'muy fría') return 'border-l-blue-500';
    
    return '';
  };

  // Helper function to get nature background color for vertical strip
  const getNatureStripColor = (nature?: string) => {
    if (!nature) return '';
    
    const normalized = nature.toLowerCase();
    
    if (normalized.includes('very hot') || normalized === 'muy caliente') return 'bg-red-700';
    if (normalized === 'hot' || normalized === 'caliente') return 'bg-red-500';
    if (normalized === 'warm' || normalized === 'templado') return 'bg-orange-500';
    if (normalized === 'neutral' || normalized === 'neutro') return 'bg-gray-400';
    if (normalized === 'cool' || normalized === 'fresca') return 'bg-blue-400';
    if (normalized === 'cold' || normalized === 'fría') return 'bg-blue-600';
    if (normalized.includes('very cold') || normalized === 'muy fría') return 'bg-blue-800';
    
    return '';
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden sm:overflow-auto p-4 lg:p-6 pb-[86px] sm:pb-4 lg:pb-6 gap-4">
      {/* Mobile Header - Hidden: moved to search bar line */}
      <div className="hidden">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Materia Medica</h1>
          {hasFeature('customContent') && (
          <button
            onClick={() => setShowNewHerbModal(true)}
            className="inline-flex items-center justify-center gap-1 px-2 py-1 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors text-xs whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-3 h-3" />
            {herbCustomSvg ? (
              <div 
                className="w-3 h-3 [&>svg]:w-full [&>svg]:h-full [&_path]:fill-current [&_circle]:fill-current [&_rect]:fill-current [&_polygon]:fill-current [&_polyline]:stroke-current [&_line]:stroke-current" 
                dangerouslySetInnerHTML={{ __html: herbCustomSvg }} 
              />
            ) : (
              <HerbIcon className="w-3 h-3" />
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
          <div className="bg-white rounded-lg border border-gray-200 sticky top-4 max-h-[calc(100vh-6rem)] flex flex-col overflow-hidden">
            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="px-6 py-6 space-y-6">
              {/* Herb Filters Header */}
              <div>
                <div
                  onClick={() => setExpandedCategories({ ...expandedCategories, herbFilters: !expandedCategories.herbFilters })}
                  className="flex items-center justify-between w-full text-left mb-3 cursor-pointer"
                >
                  <h2 className="text-lg font-semibold text-gray-900">Herb Filters</h2>
                  <div className="flex items-center gap-2">
                    {hasActiveBasicFilters && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setCategoryFilters([]);
                          setSubcategoryFilters([]);
                          setNatureFilters([]);
                          setFlavorFilters([]);
                          setChannelFilters([]);
                        }}
                        className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                      >
                        Clear
                      </button>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCategories.herbFilters ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {expandedCategories.herbFilters && (
                  <div className="space-y-4">
                    {/* Categories - Protected by herbPropertyFilters */}
                    <FeatureGuard feature="herbPropertyFilters">
                    {uniqueCategories.length > 0 && (
                      <div>
                        <button
                          onClick={() => setExpandedCategories({ ...expandedCategories, category: !expandedCategories.category })}
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
                          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCategories.category ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedCategories.category && (
                          <div className="space-y-2.5">
                            {uniqueCategories.map(category => {
                              const subcategories = getSubcategoriesForCategory(category);
                              const isCategorySelected = categoryFilters.includes(category);

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

                                  {/* Subcategories - only show when category is selected */}
                                  {isCategorySelected && subcategories.length > 0 && (
                                    <div className="ml-6 mt-2 space-y-2">
                                      {subcategories.map(subcategory => (
                                        <label key={`subcategory-${subcategory}`} className="flex items-start gap-2 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={subcategoryFilters.includes(subcategory)}
                                            onChange={() => toggleSubcategoryFilter(subcategory)}
                                            className="w-3.5 h-3.5 flex-shrink-0 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5"
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
                    {uniqueNatures.length > 0 && (
                      <div>
                        <button
                          onClick={() => setExpandedCategories({ ...expandedCategories, nature: !expandedCategories.nature })}
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
                          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCategories.nature ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedCategories.nature && (
                          <div className="space-y-2.5">
                            {uniqueNatures.map(nature => (
                                <label key={nature} className="flex items-start gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={natureFilters.includes(nature)}
                                    onChange={() => toggleNatureFilter(nature)}
                                    className="w-4 h-4 flex-shrink-0 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5"
                                  />
                                  <span className="text-sm text-gray-700">{nature}</span>
                                </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Flavors */}
                    {uniqueFlavors.length > 0 && (
                      <div>
                        <button
                          onClick={() => setExpandedCategories({ ...expandedCategories, flavor: !expandedCategories.flavor })}
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
                          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCategories.flavor ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedCategories.flavor && (
                          <div className="space-y-2.5">
                            {uniqueFlavors.map(flavor => (
                                <label key={flavor} className="flex items-start gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={flavorFilters.includes(flavor)}
                                    onChange={() => toggleFlavorFilter(flavor)}
                                    className="w-4 h-4 flex-shrink-0 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5"
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
                      <div>
                        <button
                          onClick={() => setExpandedCategories({ ...expandedCategories, channels: !expandedCategories.channels })}
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
                          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCategories.channels ? 'rotate-180' : ''}`} />
                        </button>
                        {expandedCategories.channels && (
                          <div className="space-y-2.5">
                            {uniqueChannels.map(channel => (
                                <label key={channel} className="flex items-start gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={channelFilters.includes(channel)}
                                    onChange={() => toggleChannelFilter(channel)}
                                    className="w-4 h-4 flex-shrink-0 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5"
                                  />
                                  <span className="text-sm text-gray-700">{channel}</span>
                                </label>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    </FeatureGuard>
                  </div>
                )}
              </div>

              {/* Advanced Filters Header */}
              {/* Separator */}
              {((hasFeature('pharmacologicalEffectsFilter') && getAvailablePharmacologicalEffects().length > 0) || (hasFeature('biologicalMechanismsFilter') && getAvailableBiologicalMechanisms().length > 0) || (hasFeature('bioactiveCompoundsFilter') && Object.keys(getAvailableBioactiveCompounds()).length > 0)) && (
                <div className="border-t border-gray-200 my-4"></div>
              )}

              {((hasFeature('pharmacologicalEffectsFilter') && getAvailablePharmacologicalEffects().length > 0) || (hasFeature('biologicalMechanismsFilter') && getAvailableBiologicalMechanisms().length > 0) || (hasFeature('bioactiveCompoundsFilter') && Object.keys(getAvailableBioactiveCompounds()).length > 0)) && (
              <>
              <div>
                <div
                  onClick={() => setExpandedCategories({ ...expandedCategories, advanced: !expandedCategories.advanced })}
                  className="flex items-center justify-between w-full text-left mb-3 cursor-pointer"
                >
                  <h2 className="text-lg font-semibold text-gray-900 text-[18px]">Advanced Filters</h2>
                  <div className="flex items-center gap-2">
                    {hasActiveAdvancedFilters && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearAdvancedFilters();
                        }}
                        className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                      >
                        Clear
                      </button>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCategories.advanced ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {expandedCategories.advanced && (
                  <div className="space-y-3">
                    {/* Pharmacological Effects */}
                    {hasFeature('pharmacologicalEffectsFilter') && getAvailablePharmacologicalEffects().length > 0 && (
                      <div>
                        <button
                          onClick={() => setShowPharmacologicalModal(true)}
                          className="flex items-center justify-between w-full text-left mb-3 hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pharmacological Effects</h3>
                            {pharmacologicalFilters.length > 0 && (
                              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                {pharmacologicalFilters.length}
                              </span>
                            )}
                          </div>
                        </button>
                      </div>
                    )}

                    {/* Biological Mechanisms */}
                    {hasFeature('biologicalMechanismsFilter') && getAvailableBiologicalMechanisms().length > 0 && (
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

                    {/* Bioactive Compounds */}
                    {hasFeature('bioactiveCompoundsFilter') && Object.keys(getAvailableBioactiveCompounds()).length > 0 && (
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
                )}
              </div>
              </>
              )}

              {/* Active Filters */}
              {(hasActiveBasicFilters || hasActiveAdvancedFilters) && (
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

                    {/* Nature Filters */}
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

                    {/* Flavor Filters */}
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

                    {/* Channel Filters */}
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

                    {/* Bioactive Compounds Filters */}
                    {bioactiveCompoundsCount > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1.5">Bioactive Compounds</p>
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(bioactiveCompoundsFilters).flatMap(([chemicalClass, compounds]) =>
                            (compounds || []).map(compound => (
                              <button
                                key={`${chemicalClass}-${compound}`}
                                onClick={() => {
                                  const updatedCompounds = bioactiveCompoundsFilters[chemicalClass].filter(c => c !== compound);
                                  if (updatedCompounds.length === 0) {
                                    const { [chemicalClass]: _, ...rest } = bioactiveCompoundsFilters;
                                    setBioactiveCompoundsFilters(rest);
                                  } else {
                                    setBioactiveCompoundsFilters({
                                      ...bioactiveCompoundsFilters,
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

              {/* Clear All Button */}
              {(hasActiveBasicFilters || hasActiveAdvancedFilters) && (
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
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search herbs..."
              className="w-full sm:w-[400px]"
              showFavoriteButton={true}
              onFavoriteClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              isFavoriteActive={showOnlyFavorites}
            />
            
            {/* Add New Herb Button - Mobile: between search and filter */}
            {hasFeature('customContent') && (
            <button
              onClick={() => setShowNewHerbModal(true)}
              className="sm:hidden flex items-center justify-center gap-2 w-10 h-10 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap flex-shrink-0"
              title="Add New Herb"
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
                {(hasActiveBasicFilters || hasActiveAdvancedFilters) && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center px-1 bg-teal-600 text-white text-[10px] rounded-full font-medium">
                    {categoryFilters.length + natureFilters.length + flavorFilters.length + channelFilters.length + pharmacologicalFiltersCount + biologicalFiltersCount + bioactiveCompoundsCount}
                  </span>
                )}
              </button>
            </div>
            
            {/* Spacer to push buttons to the right on desktop */}
            <div className="hidden sm:block flex-1" />
        
        {/* Add New Herb Button - Desktop only */}
        {hasFeature('customContent') && (
        <button
          onClick={() => setShowNewHerbModal(true)}
          className="hidden sm:flex items-center justify-center gap-2 px-4 w-auto h-10 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap flex-shrink-0"
          title="Add New Herb"
        >
          <Plus className="w-4 h-4" />
          <Leaf className="w-4 h-4" />
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
          </div>

          {/* Clinical list card - Always list on mobile, list/grid on desktop */}
          {filteredHerbs.length === 0 ? (
            <div className="flex-1 bg-white rounded-lg border border-gray-200 p-8 sm:p-12 flex items-center justify-center">
              <EmptyState
                icon={Search}
                title="No herbs found"
                description="Try adjusting your search query or filters"
              />
            </div>
          ) : (
            <ScrollableListCard className="flex-1 min-h-0 overflow-hidden" dynamic>
              {/* Mobile: Always list view */}
              <div className="sm:hidden divide-y divide-gray-200 border-b border-gray-200">
                {filteredHerbs.map(herb => (
                  <div
                    key={herb.herb_id}
                    onClick={() => {
                      const herbIndex = filteredHerbs.findIndex(h => h.herb_id === herb.herb_id);
                      modalNav.reset({ type: 'herb', name: herb.pinyin_name, listIndex: herbIndex });
                    }}
                    className={`group hover:bg-gray-50 transition-colors relative cursor-pointer ${displayColumns.natureIndicator && herb.nature ? `border-l-4 ${getNatureBorderColor(herb.nature)}` : ''}`}
                  >
                    {/* Favorite Star */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleHerbFavorite(herb.herb_id);
                      }}
                      className="absolute top-2 right-2 p-1 z-10 flex items-start justify-end"
                      title={isHerbFavorite(herb.herb_id) ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star
                        className={`w-5 h-5 ${isHerbFavorite(herb.herb_id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
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
                                  {herb.pinyin_name}
                                </div>
                              );
                            }

                            if (!displayColumns[column]) return null;

                            const isFirstName = column === firstVisibleName;

                            switch (column) {
                              case 'pinyin':
                                return (
                                  <div key="pinyin" className={isFirstName ? "font-medium text-gray-900 text-sm" : "text-xs text-gray-500"}>
                                    {herb.pinyin_name}
                                  </div>
                                );
                              case 'hanzi':
                                return (
                                  <div key="hanzi" className={isFirstName ? "font-medium text-gray-900 text-sm" : "text-xs text-gray-500"}>
                                    {herb.hanzi_name}
                                  </div>
                                );
                              case 'pharmaceutical':
                                return (
                                  <div key="pharmaceutical" className={isFirstName ? "font-medium text-gray-900 text-sm" : "text-xs text-gray-600"}>
                                    {herb.pharmaceutical_name}
                                  </div>
                                );
                              case 'category':
                                return herb.category ? (
                                  <div key="category">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getHerbCategoryColors(herb.category).bg} ${getHerbCategoryColors(herb.category).text}`}>
                                      {herb.category}
                                    </span>
                                  </div>
                                ) : null;
                              case 'subcategory':
                                return herb.subcategory ? (
                                  <div key="subcategory" className="text-xs text-gray-600">
                                    {herb.subcategory}
                                  </div>
                                ) : null;
                              case 'flavor':
                                return herb.flavor && herb.flavor.length > 0 ? (
                                  <div key="flavor" className="flex flex-wrap gap-1">
                                    {herb.flavor.map((flavor) => (
                                      <FlavorChip key={flavor} flavor={flavor} size="sm" />
                                    ))}
                                  </div>
                                ) : null;
                              case 'channels':
                                return herb.channels && herb.channels.length > 0 ? (
                                  <div key="channels" className="flex flex-wrap gap-1">
                                    {herb.channels.map((meridian) => (
                                      <MeridianChip key={meridian} meridian={meridian} size="sm" />
                                    ))}
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
                ))}
              </div>

              {/* Desktop: List or Grid view based on viewMode */}
              {viewMode === 'list' ? (
                <div className="hidden sm:block">
                  <div className="divide-y divide-gray-200 border-b border-gray-200">
                    {filteredHerbs.map(herb => (
                      <div
                        key={herb.herb_id}
                        onClick={() => {
                          const herbIndex = filteredHerbs.findIndex(h => h.herb_id === herb.herb_id);
                          modalNav.reset({ type: 'herb', name: herb.pinyin_name, listIndex: herbIndex });
                        }}
                        className={`group hover:bg-gray-50 transition-colors relative cursor-pointer ${displayColumns.natureIndicator && herb.nature ? `border-l-4 ${getNatureBorderColor(herb.nature)}` : ''}`}
                      >
                        <div className="block px-6 py-4">
                          <div className="flex items-start gap-4">
                            <div className={`flex-1 min-w-0 grid ${getListGridClass()} gap-6 items-baseline`}>
                              {(() => {
                                const visibleNames = displayColumns.order.filter(col => displayColumns[col] && (col === 'pinyin' || col === 'hanzi' || col === 'pharmaceutical'));
                                const hasNoVisibleNames = visibleNames.length === 0;

                                return displayColumns.order.map((columnType) => {
                                  // Force pinyin to show if no names are visible
                                  if (hasNoVisibleNames && columnType === 'pinyin') {
                                    return (
                                      <div key="pinyin" className="font-medium text-gray-900 flex items-center gap-2">
                                        <span>{herb.pinyin_name}</span>
                                        {isHerbBanned(herb) && (
                                          <Ban className="w-4 h-4 text-red-600" />
                                        )}
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
                                        <div key="pinyin" className={`${isFirstVisible ? "font-medium text-gray-900" : "text-sm text-gray-600"} ${isFirstVisible ? "flex items-center gap-2" : ""}`}>
                                          <span>{herb.pinyin_name}</span>
                                          {isFirstVisible && isHerbBanned(herb) && (
                                            <Ban className="w-4 h-4 text-red-600" />
                                          )}
                                        </div>
                                      );

                                    case 'pharmaceutical':
                                      return (
                                        <div key="pharmaceutical" className={`${isFirstVisible ? "font-medium text-gray-900" : "text-sm text-gray-600"} ${isFirstVisible ? "flex items-center gap-2" : ""}`}>
                                          <span>{herb.pharmaceutical_name}</span>
                                          {isFirstVisible && isHerbBanned(herb) && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 whitespace-nowrap">
                                              <Ban className="w-3.5 h-3.5" />
                                              Banned
                                            </span>
                                          )}
                                        </div>
                                      );

                                    case 'hanzi':
                                      return (
                                        <div key="hanzi" className={`${isFirstVisible ? "font-medium text-gray-900" : "text-sm text-gray-500"} ${isFirstVisible ? "flex items-center gap-2" : ""}`}>
                                          <span className="font-hanzi">{herb.hanzi_name}</span>
                                          {isFirstVisible && isHerbBanned(herb) && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 whitespace-nowrap">
                                              <Ban className="w-3.5 h-3.5" />
                                              Banned
                                            </span>
                                          )}
                                        </div>
                                      );
                                  
                                  case 'category':
                                    return (
                                      <div key="category">
                                        {herb.category ? (
                                          <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${getHerbCategoryColors(herb.category).bg} ${getHerbCategoryColors(herb.category).text}`}>
                                            {herb.category}
                                          </span>
                                        ) : (
                                          <span className="text-sm text-gray-400">—</span>
                                        )}
                                      </div>
                                    );
                                  
                                  case 'subcategory':
                                    return (
                                      <div key="subcategory">
                                        {herb.subcategory ? (
                                          <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${getHerbSubcategoryColors(herb.subcategory).bg} ${getHerbSubcategoryColors(herb.subcategory).text}`}>
                                            {herb.subcategory}
                                          </span>
                                        ) : (
                                          <span className="text-sm text-gray-400">—</span>
                                        )}
                                      </div>
                                    );
                                  
                                  case 'flavor':
                                    return (
                                      <div key="flavor" className="flex flex-wrap gap-1">
                                        {herb.flavor && herb.flavor.length > 0 ? (
                                          herb.flavor.map((flavor, idx) => (
                                            <FlavorChip key={idx} flavor={flavor} size="sm" />
                                          ))
                                        ) : (
                                          <span className="text-sm text-gray-400">—</span>
                                        )}
                                      </div>
                                    );
                                  
                                  case 'channels':
                                    return (
                                      <div key="channels" className="flex flex-wrap gap-1">
                                        {herb.channels && herb.channels.length > 0 ? (
                                          herb.channels.map((meridian, idx) => (
                                            <MeridianChip key={idx} meridian={meridian} size="sm" />
                                          ))
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
                                toggleHerbFavorite(herb.herb_id);
                              }}
                              className="flex-shrink-0 p-1"
                              title={isHerbFavorite(herb.herb_id) ? "Remove from favorites" : "Add to favorites"}
                            >
                              <Star
                                className={`w-5 h-5 ${isHerbFavorite(herb.herb_id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
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
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 p-6">
                    {filteredHerbs.map((herb) => (
                      <div
                        key={herb.herb_id}
                        onClick={() => {
                          const herbIndex = filteredHerbs.findIndex(h => h.herb_id === herb.herb_id);
                          modalNav.reset({ type: 'herb', name: herb.pinyin_name, listIndex: herbIndex });
                        }}
                        className="block bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative cursor-pointer"
                      >
                        {displayColumns.natureIndicator && herb.nature && (
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${getNatureStripColor(herb.nature)}`}></div>
                        )}

                        {/* Favorite Star */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleHerbFavorite(herb.herb_id);
                          }}
                          className="absolute top-3 right-3 p-1 z-10"
                          title={isHerbFavorite(herb.herb_id) ? "Remove from favorites" : "Add to favorites"}
                        >
                          <Star
                            className={`w-5 h-5 ${isHerbFavorite(herb.herb_id) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        </button>

                        <div className={`pr-4 py-4 ${displayColumns.natureIndicator ? 'pl-5' : 'pl-4'}`}>
                          <div className="mb-3">
                            {(() => {
                              const visibleNames = displayColumns.order.filter(col => {
                                if (col === 'pinyin') return displayColumns.pinyin;
                                if (col === 'pharmaceutical') return displayColumns.pharmaceutical && herb.pharmaceutical_name;
                                if (col === 'hanzi') return displayColumns.hanzi;
                                return false;
                              });
                              const hasNoVisibleNames = visibleNames.length === 0;
                              const isBanned = isHerbBanned(herb);

                              // Force pinyin to show if no names are visible
                              if (hasNoVisibleNames) {
                                return (
                                  <div className="font-medium text-gray-900 mb-1 flex items-center gap-2">
                                    <span>{herb.pinyin_name}</span>
                                    {isBanned && (
                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 whitespace-nowrap">
                                        <Ban className="w-3.5 h-3.5" />
                                        Banned
                                      </span>
                                    )}
                                  </div>
                                );
                              }

                              const firstVisibleColumn = visibleNames[0];

                              return (
                                <>
                                  {displayColumns.pinyin && (
                                    <div className={`font-medium text-gray-900 mb-1 ${firstVisibleColumn === 'pinyin' ? 'flex items-center gap-2' : ''}`}>
                                      <span>{herb.pinyin_name}</span>
                                      {firstVisibleColumn === 'pinyin' && isBanned && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 whitespace-nowrap">
                                          <Ban className="w-3.5 h-3.5" />
                                          Banned
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {displayColumns.pharmaceutical && herb.pharmaceutical_name && (
                                    <div className={`text-sm text-gray-600 mb-1 ${firstVisibleColumn === 'pharmaceutical' ? 'flex items-center gap-2' : ''}`}>
                                      <span>{herb.pharmaceutical_name}</span>
                                      {firstVisibleColumn === 'pharmaceutical' && isBanned && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 whitespace-nowrap">
                                          <Ban className="w-3.5 h-3.5" />
                                          Banned
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {displayColumns.hanzi && (
                                    <div className={`text-sm text-gray-400 mb-3 ${firstVisibleColumn === 'hanzi' ? 'flex items-center gap-2' : ''}`}>
                                      <span>{herb.hanzi_name}</span>
                                      {firstVisibleColumn === 'hanzi' && isBanned && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 whitespace-nowrap">
                                          <Ban className="w-3.5 h-3.5" />
                                          Banned
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                          
                          <div className="space-y-2">
                            {displayColumns.category && herb.category && (
                              <div>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${getHerbCategoryColors(herb.category).bg} ${getHerbCategoryColors(herb.category).text}`}>
                                  {herb.category}
                                </span>
                              </div>
                            )}
                            
                            {displayColumns.subcategory && herb.subcategory && (
                              <div>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-medium ${getHerbSubcategoryColors(herb.subcategory).bg} ${getHerbSubcategoryColors(herb.subcategory).text}`}>
                                  {herb.subcategory}
                                </span>
                              </div>
                            )}
                            
                            {displayColumns.flavor && herb.flavor && herb.flavor.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {herb.flavor.map((flavor, idx) => (
                                  <FlavorChip key={idx} flavor={flavor} size="sm" />
                                ))}
                              </div>
                            )}
                            
                            {displayColumns.channels && herb.channels && herb.channels.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {herb.channels.map((meridian, idx) => (
                                  <MeridianChip key={idx} meridian={meridian} size="sm" />
                                ))}
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
            <Dialog.Description className="sr-only">Filter herbs by their pharmacological effects</Dialog.Description>
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
                  {pharmacologicalFilters.length} selected
                </span>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-2">
                {filteredPharmacologicalEffects.map((effect) => {
                  const isSelected = pharmacologicalFilters.includes(effect);

                  return (
                    <label
                      key={effect}
                      className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 transition-colors border-b border-gray-100 last:border-b-0 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => togglePharmacologicalFilter(effect)}
                        className="w-4 h-4 flex-shrink-0 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5"
                      />
                      <span className="text-sm text-gray-700">{effect}</span>
                    </label>
                  );
                })}
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
            <Dialog.Description className="sr-only">Filter herbs by their biological mechanisms</Dialog.Description>
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
                  {Object.values(biologicalFilters).flat().length} selected
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
                {biologicalViewMode === 'categories' ? (
                  // Categories view with accordions
                  <>
                    {Object.entries(filteredBiologicalSystems).sort((a, b) => a[0].localeCompare(b[0])).map(([system, targetActions]) => {
                      if (targetActions.length === 0) return null;

                      const isSystemExpanded = expandedSystems.includes(system);
                      const systemSelections = biologicalFilters[system] || [];
                      const systemCount = systemSelections.length;

                      return (
                        <div key={system} className="border-b border-gray-100 last:border-b-0">
                          {/* System Header - Clean without box */}
                          <div className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors rounded">
                            {/* Checkbox for select all */}
                            <input
                              type="checkbox"
                              checked={systemCount === targetActions.length && systemCount > 0}
                              ref={(el) => {
                                if (el) {
                                  el.indeterminate = systemCount > 0 && systemCount < targetActions.length;
                                }
                              }}
                              onChange={() => toggleAllBiologicalSystem(system, targetActions)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 flex-shrink-0 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5"
                              title="Select all target actions in this system"
                            />

                            {/* Expandable header */}
                            <div
                              onClick={() => {
                                setExpandedSystems(prev =>
                                  prev.includes(system) ? prev.filter(s => s !== system) : [...prev, system]
                                );
                              }}
                              className="flex-1 flex items-center justify-between text-left cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">{system}</span>
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
                              {targetActions.map((action) => {
                                const isSelected = systemSelections.includes(action);

                                return (
                                  <label
                                    key={action}
                                    className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 ml-6 transition-colors rounded"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleBiologicalFilter(system, action)}
                                      className="w-4 h-4 flex-shrink-0 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5"
                                    />
                                    <span className="text-sm text-gray-700">{action}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                ) : (
                  // All view - flat list of all target actions
                  <>
                    {(() => {
                      // Create data array, sort by target_action alphabetically
                      const allTargetActionsData = Object.entries(filteredBiologicalSystems)
                        .flatMap(([system, targetActions]) =>
                          targetActions.map(action => ({
                            system,
                            action
                          }))
                        )
                        .sort((a, b) => a.action.localeCompare(b.action));

                      // Map to JSX
                      return allTargetActionsData.map(({ system, action }) => {
                        const systemSelections = biologicalFilters[system] || [];
                        const isSelected = systemSelections.includes(action);

                        return (
                          <label
                            key={`${system}-${action}`}
                            className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 px-3 py-2 transition-colors border-b border-gray-100 last:border-b-0 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleBiologicalFilter(system, action)}
                              className="w-4 h-4 flex-shrink-0 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5"
                            />
                            <span className="text-sm text-gray-700">{action}</span>
                          </label>
                        );
                      });
                    })()}
                  </>
                )}
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

      {/* Bioactive Compounds Modal */}
      <Dialog.Root open={showBioactiveCompoundsModal} onOpenChange={setShowBioactiveCompoundsModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" onClick={() => setShowBioactiveCompoundsModal(false)} />
          <Dialog.Content
            className="fixed left-0 right-0 bottom-0 top-[10vh] sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:w-full sm:max-w-md sm:max-h-[85vh] overflow-hidden z-50 flex flex-col"
            onPointerDownOutside={() => setShowBioactiveCompoundsModal(false)}
          >
            <Dialog.Title className="sr-only">Select Bioactive Compounds</Dialog.Title>
            <Dialog.Description className="sr-only">Choose bioactive compounds to filter herbs</Dialog.Description>

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
                      const classSelections = bioactiveCompoundsFilters[chemicalClass] || [];
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
                                  setBioactiveCompoundsFilters(prev => {
                                    const newState = { ...prev };
                                    delete newState[chemicalClass];
                                    return newState;
                                  });
                                } else {
                                  // Select all
                                  setBioactiveCompoundsFilters(prev => ({
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
                                        setBioactiveCompoundsFilters(prev => {
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
                      const classSelections = bioactiveCompoundsFilters[chemicalClass] || [];
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
                              setBioactiveCompoundsFilters(prev => {
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
                  onClick={() => setBioactiveCompoundsFilters({})}
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

      {/* Mobile Filters Modal */}
      <Dialog.Root open={showMobileFilters} onOpenChange={setShowMobileFilters}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:top-[15vh] sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 bg-white sm:rounded-lg sm:max-w-md sm:max-h-[85vh] overflow-hidden z-50 flex flex-col rounded-t-2xl sm:rounded-b-lg">
            <Dialog.Description className="sr-only">Filter herbs by category, nature, flavor, and other properties</Dialog.Description>
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
                {/* Herb Filters */}
                <div>
                  <button
                    onClick={() => setExpandedCategories({ ...expandedCategories, herbFilters: !expandedCategories.herbFilters })}
                    className="flex items-center justify-between w-full text-left mb-3"
                  >
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">Herb Filters</h2>
                    <div className="flex items-center gap-2">
                      {hasActiveBasicFilters && (
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setCategoryFilters([]);
                            setNatureFilters([]);
                            setFlavorFilters([]);
                            setChannelFilters([]);
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.stopPropagation();
                              setCategoryFilters([]);
                              setNatureFilters([]);
                              setFlavorFilters([]);
                              setChannelFilters([]);
                            }
                          }}
                          className="text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
                        >
                          Clear
                        </span>
                      )}
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCategories.herbFilters ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {expandedCategories.herbFilters && (
                    <div className="space-y-4">
                      {/* Categories - Protected by herbPropertyFilters */}
                      <FeatureGuard feature="herbPropertyFilters">
                      {uniqueCategories.length > 0 && (
                        <div>
                          <button
                            onClick={() => setExpandedCategories({ ...expandedCategories, category: !expandedCategories.category })}
                            className="flex items-center justify-between w-full text-left mb-3"
                          >
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Categories</h3>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCategories.category ? 'rotate-180' : ''}`} />
                          </button>
                          {expandedCategories.category && (
                            <div className="space-y-2.5 max-h-48 overflow-y-auto">
                              {uniqueCategories.map(category => {
                                const subcategories = getSubcategoriesForCategory(category);
                                const isCategorySelected = categoryFilters.includes(category);

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

                                    {/* Subcategories - only show when category is selected */}
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

                      {/* Natures */}
                      {uniqueNatures.length > 0 && (
                        <div>
                          <button
                            onClick={() => setExpandedCategories({ ...expandedCategories, nature: !expandedCategories.nature })}
                            className="flex items-center justify-between w-full text-left mb-3"
                          >
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Natures</h3>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCategories.nature ? 'rotate-180' : ''}`} />
                          </button>
                          {expandedCategories.nature && (
                            <div className="space-y-2.5">
                              {uniqueNatures.map(nature => (
                                <label key={nature} className="flex items-start gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={natureFilters.includes(nature)}
                                    onChange={() => toggleNatureFilter(nature)}
                                    className="w-4 h-4 flex-shrink-0 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5"
                                  />
                                  <span className="text-sm text-gray-700">{nature}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Flavors */}
                      {uniqueFlavors.length > 0 && (
                        <div>
                          <button
                            onClick={() => setExpandedCategories({ ...expandedCategories, flavor: !expandedCategories.flavor })}
                            className="flex items-center justify-between w-full text-left mb-3"
                          >
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Flavors</h3>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCategories.flavor ? 'rotate-180' : ''}`} />
                          </button>
                          {expandedCategories.flavor && (
                            <div className="space-y-2.5 max-h-48 overflow-y-auto">
                              {uniqueFlavors.map(flavor => (
                                <label key={flavor} className="flex items-start gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={flavorFilters.includes(flavor)}
                                    onChange={() => toggleFlavorFilter(flavor)}
                                    className="w-4 h-4 flex-shrink-0 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5"
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
                        <div>
                          <button
                            onClick={() => setExpandedCategories({ ...expandedCategories, channels: !expandedCategories.channels })}
                            className="flex items-center justify-between w-full text-left mb-3"
                          >
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Channels</h3>
                            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCategories.channels ? 'rotate-180' : ''}`} />
                          </button>
                          {expandedCategories.channels && (
                            <div className="space-y-2.5 max-h-48 overflow-y-auto">
                              {uniqueChannels.map(channel => (
                                <label key={channel} className="flex items-start gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={channelFilters.includes(channel)}
                                    onChange={() => toggleChannelFilter(channel)}
                                    className="w-4 h-4 flex-shrink-0 text-teal-600 border-gray-300 rounded focus:ring-teal-500 mt-0.5"
                                  />
                                  <span className="text-sm text-gray-700">{channel}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                      </FeatureGuard>
                    </div>
                  )}
                </div>

                {/* Separator */}
                {((hasFeature('pharmacologicalEffectsFilter') && getAvailablePharmacologicalEffects().length > 0) || (hasFeature('biologicalMechanismsFilter') && getAvailableBiologicalMechanisms().length > 0) || (hasFeature('bioactiveCompoundsFilter') && Object.keys(getAvailableBioactiveCompounds()).length > 0)) && (
                  <div className="border-t border-gray-200 my-4"></div>
                )}

                {/* Advanced Filters */}
                {((hasFeature('pharmacologicalEffectsFilter') && getAvailablePharmacologicalEffects().length > 0) || (hasFeature('biologicalMechanismsFilter') && getAvailableBiologicalMechanisms().length > 0) || (hasFeature('bioactiveCompoundsFilter') && Object.keys(getAvailableBioactiveCompounds()).length > 0)) && (
                <div>
                  <button
                    onClick={() => setExpandedCategories({ ...expandedCategories, advanced: !expandedCategories.advanced })}
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
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedCategories.advanced ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  {expandedCategories.advanced && (
                    <div className="space-y-3">
                      {/* Pharmacological Effects */}
                      {hasFeature('pharmacologicalEffectsFilter') && getAvailablePharmacologicalEffects().length > 0 && (
                        <div>
                          <button
                            onClick={() => setShowPharmacologicalModal(true)}
                            className="flex items-center justify-between w-full text-left px-4 py-2.5 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pharmacological Effects</h3>
                            <div className="flex items-center gap-2">
                              {pharmacologicalFilters.length > 0 && (
                                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                  {pharmacologicalFilters.length}
                                </span>
                              )}
                              <ChevronDown className="w-4 h-4 text-gray-500 rotate-[-90deg]" />
                            </div>
                          </button>
                        </div>
                      )}

                      {/* Biological Mechanisms */}
                      {hasFeature('biologicalMechanismsFilter') && getAvailableBiologicalMechanisms().length > 0 && (
                        <div>
                          <button
                            onClick={() => setShowBiologicalModal(true)}
                            className="flex items-center justify-between w-full text-left px-4 py-2.5 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Biological Mechanisms</h3>
                            <div className="flex items-center gap-2">
                              {biologicalFiltersCount > 0 && (
                                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                  {biologicalFiltersCount}
                                </span>
                              )}
                              <ChevronDown className="w-4 h-4 text-gray-500 rotate-[-90deg]" />
                            </div>
                          </button>
                        </div>
                      )}

                      {/* Bioactive Compounds */}
                      {hasFeature('bioactiveCompoundsFilter') && Object.keys(getAvailableBioactiveCompounds()).length > 0 && (
                      <div>
                        <button
                          onClick={() => setShowBioactiveCompoundsModal(true)}
                          className="flex items-center justify-between w-full text-left px-4 py-2.5 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Bioactive Compounds</h3>
                          <div className="flex items-center gap-2">
                            {bioactiveCompoundsCount > 0 && (
                              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                {bioactiveCompoundsCount}
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

                {/* Active Filters */}
                {(hasActiveBasicFilters || hasActiveAdvancedFilters) && (
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

                        {/* Nature Filters */}
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

                        {/* Flavor Filters */}
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

                        {/* Channel Filters */}
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

                        {/* Bioactive Compounds Filters */}
                        {bioactiveCompoundsCount > 0 && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1.5">Bioactive Compounds</p>
                            <div className="flex flex-wrap gap-1.5">
                              {Object.entries(bioactiveCompoundsFilters).flatMap(([chemicalClass, compounds]) =>
                                (compounds || []).map(compound => (
                                  <button
                                    key={`${chemicalClass}-${compound}`}
                                    onClick={() => {
                                      const updatedCompounds = bioactiveCompoundsFilters[chemicalClass].filter(c => c !== compound);
                                      if (updatedCompounds.length === 0) {
                                        const { [chemicalClass]: _, ...rest } = bioactiveCompoundsFilters;
                                        setBioactiveCompoundsFilters(rest);
                                      } else {
                                        setBioactiveCompoundsFilters({
                                          ...bioactiveCompoundsFilters,
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

            {/* Footer with Actions */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-4 py-4">
              <div className="flex gap-2 min-h-[44px]">
                {(hasActiveBasicFilters || hasActiveAdvancedFilters) && (
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
        showNatureIndicator={displayColumns.natureIndicator}
        showThermalActionIndicator={false}
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
        ingredientsShowFormulas={true}
        ingredientsNatureIndicator={false}
        ingredientsThermalIndicator={false}
        ingredientsLayout="grid"
        allItems={filteredHerbs.map(h => h.pinyin_name)}
        onNavigatePrevious={() => {
          if (!modalNav.currentItem) return;
          const currentIndex = modalNav.currentItem.listIndex ?? filteredHerbs.findIndex(h => h.pinyin_name === modalNav.currentItem!.name);
          if (currentIndex > 0) {
            const previousHerb = filteredHerbs[currentIndex - 1];
            modalNav.replaceCurrentItem({ type: 'herb', name: previousHerb.pinyin_name, listIndex: currentIndex - 1 });
          }
        }}
        onNavigateNext={() => {
          if (!modalNav.currentItem) return;
          const currentIndex = modalNav.currentItem.listIndex ?? filteredHerbs.findIndex(h => h.pinyin_name === modalNav.currentItem!.name);
          if (currentIndex < filteredHerbs.length - 1) {
            const nextHerb = filteredHerbs[currentIndex + 1];
            modalNav.replaceCurrentItem({ type: 'herb', name: nextHerb.pinyin_name, listIndex: currentIndex + 1 });
          }
        }}
        showAdminActions={hasFeature('customContent')}
        onEditHerb={(herb) => {
          setEditingHerb(herb);
        }}
        onDeleteHerb={(herb) => {
          setDeletingHerb(herb);
        }}
      />

      {/* New Herb Modal */}
      <NewHerbModal
        isOpen={showNewHerbModal || !!editingHerb}
        onClose={() => {
          setShowNewHerbModal(false);
          setEditingHerb(null);
        }}
        onSuccess={() => {
          // Refresh herbs list
          window.location.reload();
        }}
        editingHerb={editingHerb}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog.Root open={!!deletingHerb} onOpenChange={(open) => !open && setDeletingHerb(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-full max-w-md z-50 shadow-xl">
            <Dialog.Title className="text-xl font-bold text-gray-900 mb-2">
              Delete Herb
            </Dialog.Title>
            <Dialog.Description className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{deletingHerb?.pinyin_name}</span>? This action cannot be undone.
            </Dialog.Description>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeletingHerb(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deletingHerb) {
                    deleteCustomHerb(deletingHerb.pinyin_name);
                    toast.success(`${deletingHerb.pinyin_name} deleted successfully`);
                    setDeletingHerb(null);
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
