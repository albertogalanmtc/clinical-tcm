import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export type AppLanguage = 'en' | 'es';

type TranslationTree = {
  nav: {
    herbs: string;
    formulas: string;
    prescriptions: string;
    builder: string;
    notes: string;
  };
  menus: {
    currentPlan: string;
    account: string;
    adminPanel: string;
    logOut: string;
    displaySettings: string;
  };
  accountMenu: {
    profile: string;
    membership: string;
    usage: string;
    settings: string;
    help: string;
    legal: string;
  };
  adminMenu: {
    dashboard: string;
    content: string;
    users: string;
    patients: string;
    community: string;
    planManagement: string;
    safetyCategories: string;
    designSettings: string;
    usageAnalytics: string;
    dashboardContent: string;
    platformSettings: string;
  };
  dialogs: {
    cancel: string;
    confirmLogout: string;
    discard: string;
    delete: string;
    save: string;
    saveNew: string;
    update: string;
    savePrescription: string;
    discardPrescriptionDraft: string;
    deleteHerb: string;
    deleteFormula: string;
  };
  layouts: {
    account: string;
    admin: string;
  };
  filters: {
    herbFilters: string;
    formulaFilters: string;
    categories: string;
    subcategories: string;
    filtered: string;
    natures: string;
    flavors: string;
    channels: string;
    advancedFilters: string;
    clinicalUseFilters: string;
    safetyProfile: string;
    prescriptionBuilder: string;
    clinicalApplications: string;
    generalConditions: string;
    medications: string;
    allergies: string;
    tcmRiskPatterns: string;
    pharmacologicalEffects: string;
    biologicalMechanisms: string;
    bioactiveCompounds: string;
    formulaCategories: string;
    listView: string;
    gridView: string;
    clear: string;
    clearAllFilters: string;
    apply: string;
    activeFilters: string;
    searchHerbs: string;
    searchFormulas: string;
    searchBuilder: string;
    addNewHerb: string;
    addNewFormula: string;
    addAsCompound: string;
    addAsComponents: string;
    viewDetails: string;
    toggleFavorites: string;
    filtersComingSoonMobile: string;
    filtersPanel: string;
    formulaName: string;
    search: string;
    searchPharmacologicalEffects: string;
    searchSystemsOrTargets: string;
    searchCompoundsOrClasses: string;
    filterHerbsByPharmacologicalEffects: string;
    filterHerbsByCategoryNatureFlavorAndOtherProperties: string;
    filterHerbsByBiologicalMechanisms: string;
    filterHerbsByBioactiveCompounds: string;
    filterFormulasByPharmacologicalEffects: string;
    filterFormulasByBiologicalMechanisms: string;
    filterFormulasByTypeNatureAndOtherProperties: string;
    selectPharmacologicalEffects: string;
    selectBiologicalMechanisms: string;
    selectBioactiveCompounds: string;
    selectedComponents: string;
    comments: string;
    noComponentsAddedYet: string;
    noHerbsFound: string;
    noFormulasFound: string;
    noItemsFound: string;
    westernMedicalDx: string;
    clinicalNotes: string;
    pregnancyWarning: string;
    enterTotalDosage: string;
    add: string;
    selectAllTargetActions: string;
    selectAllCompounds: string;
    noSystemsOrTargetActionsFound: string;
    noChemicalClassesOrCompoundsFound: string;
    noBiologicalMechanismsData: string;
    noSafetyFiltersSelected: string;
    savePrescriptionPrompt: string;
    discardPrescriptionPrompt: string;
    all: string;
    herbs: string;
    formulas: string;
    builder: string;
  };
  settings: {
    interfaceLanguage: string;
    currentEnglishOnly: string;
  };
};

const TRANSLATIONS: Record<AppLanguage, TranslationTree> = {
  en: {
    nav: {
      herbs: 'Herbs',
      formulas: 'Formulas',
      prescriptions: 'Prescriptions',
      builder: 'Builder',
      notes: 'Notes',
    },
    menus: {
      currentPlan: 'Current Plan',
      account: 'Account',
      adminPanel: 'Admin Panel',
      logOut: 'Log out',
      displaySettings: 'Display Settings',
    },
    accountMenu: {
      profile: 'Profile',
      membership: 'Membership & Billing',
      usage: 'Usage & Analytics',
      settings: 'Settings',
      help: 'Help & Support',
      legal: 'Legal & Policies',
    },
    adminMenu: {
      dashboard: 'Admin Dashboard',
      content: 'Content',
      users: 'Users',
      patients: 'Patients',
      community: 'Community',
      planManagement: 'Plan Management',
      safetyCategories: 'Safety Categories',
      designSettings: 'Design Settings',
      usageAnalytics: 'Usage Analytics',
      dashboardContent: 'Dashboard Content',
      platformSettings: 'Platform Settings',
    },
    dialogs: {
      cancel: 'Cancel',
      confirmLogout: 'Are you sure you want to log out?',
      discard: 'Discard',
      delete: 'Delete',
      save: 'Save',
      saveNew: 'Save New',
      update: 'Update',
      savePrescription: 'Save Prescription',
      discardPrescriptionDraft: 'Discard Prescription Draft?',
      deleteHerb: 'Delete Herb',
      deleteFormula: 'Delete Formula',
    },
    layouts: {
      account: 'Account',
      admin: 'Admin Panel',
    },
    filters: {
      herbFilters: 'Herb Filters',
      formulaFilters: 'Formula Filters',
      categories: 'Categories',
      subcategories: 'Subcategories',
      filtered: 'Filtered',
      natures: 'Natures',
      flavors: 'Flavors',
      channels: 'Channels',
      advancedFilters: 'Advanced Filters',
      clinicalUseFilters: 'Clinical Use Filters',
      safetyProfile: 'Safety Profile',
      prescriptionBuilder: 'Prescription Builder',
      clinicalApplications: 'Clinical Applications',
      generalConditions: 'General Conditions',
      medications: 'Medications',
      allergies: 'Allergies',
      tcmRiskPatterns: 'TCM Risk Patterns',
      pharmacologicalEffects: 'Pharmacological Effects',
      biologicalMechanisms: 'Biological Mechanisms',
      bioactiveCompounds: 'Bioactive Compounds',
      formulaCategories: 'Formula Categories',
      listView: 'List view',
      gridView: 'Grid view',
      clear: 'Clear',
      clearAllFilters: 'Clear All Filters',
      apply: 'Apply',
      activeFilters: 'Active Filters',
      searchHerbs: 'Search herbs...',
      searchFormulas: 'Search formulas...',
      searchBuilder: 'Search...',
      addNewHerb: 'Add New Herb',
      addNewFormula: 'Add New Formula',
      addAsCompound: 'Add as compound',
      addAsComponents: 'Add as components',
      viewDetails: 'View details',
      toggleFavorites: 'Toggle favorites',
      filtersComingSoonMobile: 'Filters panel coming soon for mobile',
      filtersPanel: 'Filters',
      formulaName: 'Formula name',
      search: 'Search...',
      searchPharmacologicalEffects: 'Search pharmacological effects...',
      searchSystemsOrTargets: 'Search systems or targets...',
      searchCompoundsOrClasses: 'Search compounds or classes...',
      filterHerbsByPharmacologicalEffects: 'Filter herbs by their pharmacological effects',
      filterHerbsByCategoryNatureFlavorAndOtherProperties: 'Filter herbs by category, nature, flavor, and other properties',
      filterHerbsByBiologicalMechanisms: 'Filter herbs by their biological mechanisms',
      filterHerbsByBioactiveCompounds: 'Choose bioactive compounds to filter herbs',
      filterFormulasByPharmacologicalEffects: 'Filter formulas by their pharmacological effects',
      filterFormulasByBiologicalMechanisms: 'Filter formulas by their biological mechanisms',
      filterFormulasByTypeNatureAndOtherProperties: 'Filter formulas by type, nature, and other properties',
      selectPharmacologicalEffects: 'Select Pharmacological Effects',
      selectBiologicalMechanisms: 'Select Biological Mechanisms',
      selectBioactiveCompounds: 'Select Bioactive Compounds',
      selectedComponents: 'Selected components',
      comments: 'Comments',
      noComponentsAddedYet: 'No components added yet',
      noHerbsFound: 'No herbs found',
      noFormulasFound: 'No formulas found',
      noItemsFound: 'No items found',
      westernMedicalDx: 'Western Medical Dx',
      clinicalNotes: 'Clinical notes...',
      pregnancyWarning: 'Pregnancy warning',
      enterTotalDosage: 'Enter total dosage for',
      add: 'Add',
      selectAllTargetActions: 'Select all target actions in this system',
      selectAllCompounds: 'Select all compounds in this chemical class',
      noSystemsOrTargetActionsFound: 'No systems or target actions found matching',
      noChemicalClassesOrCompoundsFound: 'No chemical classes or compounds found matching',
      noBiologicalMechanismsData: 'No biological mechanisms data available yet.',
      noSafetyFiltersSelected: 'No safety filters selected. Select filters in the Patient Safety Profile to see filtered alerts.',
      savePrescriptionPrompt: 'Would you like to update the existing prescription or save as a new one?',
      discardPrescriptionPrompt: 'Are you sure you want to discard this prescription draft? This action cannot be undone.',
      all: 'All',
      herbs: 'Herbs',
      formulas: 'Formulas',
      builder: 'Builder',
    },
    settings: {
      interfaceLanguage: 'Interface Language',
      currentEnglishOnly: 'Currently only English is available. More languages coming soon.',
    },
  },
  es: {
    nav: {
      herbs: 'Hierbas',
      formulas: 'Fórmulas',
      prescriptions: 'Prescripciones',
      builder: 'Builder',
      notes: 'Notas',
    },
    menus: {
      currentPlan: 'Plan actual',
      account: 'Cuenta',
      adminPanel: 'Panel de admin',
      logOut: 'Cerrar sesión',
      displaySettings: 'Ajustes de vista',
    },
    accountMenu: {
      profile: 'Perfil',
      membership: 'Membresía y facturación',
      usage: 'Uso y analíticas',
      settings: 'Ajustes',
      help: 'Ayuda y soporte',
      legal: 'Legal y políticas',
    },
    adminMenu: {
      dashboard: 'Panel de admin',
      content: 'Contenido',
      users: 'Usuarios',
      patients: 'Pacientes',
      community: 'Comunidad',
      planManagement: 'Gestión de planes',
      safetyCategories: 'Categorías de seguridad',
      designSettings: 'Ajustes de diseño',
      usageAnalytics: 'Analíticas de uso',
      dashboardContent: 'Contenido del dashboard',
      platformSettings: 'Ajustes de la plataforma',
    },
    dialogs: {
      cancel: 'Cancelar',
      confirmLogout: '¿Seguro que quieres cerrar sesión?',
      discard: 'Descartar',
      delete: 'Eliminar',
      save: 'Guardar',
      saveNew: 'Guardar como nuevo',
      update: 'Actualizar',
      savePrescription: 'Guardar prescripción',
      discardPrescriptionDraft: '¿Descartar el borrador de la prescripción?',
      deleteHerb: 'Eliminar hierba',
      deleteFormula: 'Eliminar fórmula',
    },
    layouts: {
      account: 'Cuenta',
      admin: 'Panel de admin',
    },
    filters: {
      herbFilters: 'Filtros de hierbas',
      formulaFilters: 'Filtros de fórmulas',
      categories: 'Categorías',
      subcategories: 'Subcategorías',
      filtered: 'Filtrado',
      natures: 'Naturalezas',
      flavors: 'Sabores',
      channels: 'Canales',
      advancedFilters: 'Filtros avanzados',
      clinicalUseFilters: 'Filtros de uso clínico',
      safetyProfile: 'Perfil de seguridad',
      prescriptionBuilder: 'Constructor de prescripciones',
      clinicalApplications: 'Aplicaciones clínicas',
      generalConditions: 'Condiciones generales',
      medications: 'Medicamentos',
      allergies: 'Alergias',
      tcmRiskPatterns: 'Patrones TCM de riesgo',
      pharmacologicalEffects: 'Efectos farmacológicos',
      biologicalMechanisms: 'Mecanismos biológicos',
      bioactiveCompounds: 'Compuestos bioactivos',
      formulaCategories: 'Categorías de fórmulas',
      listView: 'Vista de lista',
      gridView: 'Vista de cuadrícula',
      clear: 'Limpiar',
      clearAllFilters: 'Limpiar todos los filtros',
      apply: 'Aplicar',
      activeFilters: 'Filtros activos',
      searchHerbs: 'Buscar hierbas...',
      searchFormulas: 'Buscar fórmulas...',
      searchBuilder: 'Buscar...',
      addNewHerb: 'Añadir nueva hierba',
      addNewFormula: 'Añadir nueva fórmula',
      addAsCompound: 'Añadir como compuesto',
      addAsComponents: 'Añadir como componentes',
      viewDetails: 'Ver detalles',
      toggleFavorites: 'Alternar favoritos',
      filtersComingSoonMobile: 'El panel de filtros estará disponible pronto en móvil',
      filtersPanel: 'Filtros',
      formulaName: 'Nombre de la fórmula',
      search: 'Buscar...',
      searchPharmacologicalEffects: 'Buscar efectos farmacológicos...',
      searchSystemsOrTargets: 'Buscar sistemas o dianas...',
      searchCompoundsOrClasses: 'Buscar compuestos o clases...',
      filterHerbsByPharmacologicalEffects: 'Filtrar hierbas por sus efectos farmacológicos',
      filterHerbsByCategoryNatureFlavorAndOtherProperties: 'Filtrar hierbas por categoría, naturaleza, sabor y otras propiedades',
      filterHerbsByBiologicalMechanisms: 'Filtrar hierbas por sus mecanismos biológicos',
      filterHerbsByBioactiveCompounds: 'Elegir compuestos bioactivos para filtrar hierbas',
      filterFormulasByPharmacologicalEffects: 'Filtrar fórmulas por sus efectos farmacológicos',
      filterFormulasByBiologicalMechanisms: 'Filtrar fórmulas por sus mecanismos biológicos',
      filterFormulasByTypeNatureAndOtherProperties: 'Filtrar fórmulas por tipo, naturaleza y otras propiedades',
      selectPharmacologicalEffects: 'Seleccionar efectos farmacológicos',
      selectBiologicalMechanisms: 'Seleccionar mecanismos biológicos',
      selectBioactiveCompounds: 'Seleccionar compuestos bioactivos',
      selectedComponents: 'Componentes seleccionados',
      comments: 'Comentarios',
      noComponentsAddedYet: 'Todavía no se han añadido componentes',
      noHerbsFound: 'No se encontraron hierbas',
      noFormulasFound: 'No se encontraron fórmulas',
      noItemsFound: 'No se encontraron elementos',
      westernMedicalDx: 'Dx médico occidental',
      clinicalNotes: 'Notas clínicas...',
      pregnancyWarning: 'Advertencia de embarazo',
      enterTotalDosage: 'Introducir la dosis total de',
      add: 'Añadir',
      selectAllTargetActions: 'Seleccionar todas las acciones diana de este sistema',
      selectAllCompounds: 'Seleccionar todos los compuestos de esta clase química',
      noSystemsOrTargetActionsFound: 'No se encontraron sistemas ni acciones diana que coincidan con',
      noChemicalClassesOrCompoundsFound: 'No se encontraron clases químicas ni compuestos que coincidan con',
      noBiologicalMechanismsData: 'Todavía no hay datos de mecanismos biológicos disponibles.',
      noSafetyFiltersSelected: 'No hay filtros de seguridad seleccionados. Selecciona filtros en el Perfil de seguridad del paciente para ver alertas filtradas.',
      savePrescriptionPrompt: '¿Quieres actualizar la prescripción existente o guardarla como una nueva?',
      discardPrescriptionPrompt: '¿Seguro que quieres descartar este borrador de prescripción? Esta acción no se puede deshacer.',
      all: 'Todo',
      herbs: 'Hierbas',
      formulas: 'Fórmulas',
      builder: 'Builder',
    },
    settings: {
      interfaceLanguage: 'Idioma de la interfaz',
      currentEnglishOnly: 'Actualmente solo está disponible inglés. Próximamente habrá más idiomas.',
    },
  },
};

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  t: (path: string) => string;
}

const STORAGE_KEY = 'app_language';

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getStoredLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'es' ? 'es' : 'en';
}

function resolveTranslation(language: AppLanguage, path: string): string {
  const parts = path.split('.');
  let current: unknown = TRANSLATIONS[language];

  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in (current as Record<string, unknown>))) {
      return path;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === 'string' ? current : path;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>(getStoredLanguage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = (nextLanguage: AppLanguage) => {
    setLanguageState(nextLanguage);
    localStorage.setItem(STORAGE_KEY, nextLanguage);
    window.dispatchEvent(new Event('app-language-updated'));
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (path: string) => resolveTranslation(language, path),
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
