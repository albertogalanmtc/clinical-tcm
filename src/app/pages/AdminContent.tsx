/**
 * Admin Content Management Page
 * Manages herbs and formulas library
 * 
 * Last updated: 2026-02-18
 */
import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, Search, X, Pencil, Trash2, Eye } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Herb } from '../data/herbs';
import { Formula } from '../data/formulas';
import { getAllHerbs, addHerb, updateHerb, deleteCustomHerb } from '../data/herbsManager';
import { getAllFormulas, addFormula, updateFormula, deleteCustomFormula } from '../data/formulasManager';
import { getPrescriptionsSync, deletePrescription } from '../data/prescriptions';
import { ContentImportExport } from '../components/ContentImportExport';
import { HerbJsonEditorModal } from '../components/HerbJsonEditorModal';
import { FormulaJsonEditorModal } from '../components/FormulaJsonEditorModal';
import { PrescriptionPreviewModal } from '../components/PrescriptionPreviewModal';
import { useLanguage } from '../contexts/LanguageContext';
import type { Prescription } from '../data/prescriptions';

type MainTab = 'herbs' | 'formulas' | 'prescriptions';
type SubTab = 'system' | 'user-added';

// Helper function to check if herb is banned
const isHerbBanned = (herb: Herb): boolean => {
  const userCountry = localStorage.getItem('user_country') || 'US';
  return herb.banned_countries?.includes(userCountry) || false;
};

// Helper function to get biological mechanisms for a specific herb
const getHerbBiologicalMechanisms = (herbName: string) => {
  const herb = getAllHerbs().find(h => h.pinyin_name === herbName);
  if (!herb || !Array.isArray(herb.biological_mechanisms)) {
    return [];
  }
  
  // Check if it's already in the new format
  if (herb.biological_mechanisms.length > 0 && typeof herb.biological_mechanisms[0] === 'object') {
    return herb.biological_mechanisms as Array<{ system: string; target_action: string }>;
  }
  
  // Convert old format to new format
  return (herb.biological_mechanisms as string[]).map(m => ({
    system: 'Legacy',
    target_action: m
  }));
};

export default function AdminContent() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  
  const [mainTab, setMainTab] = useState<MainTab>('herbs');
  const [subTab, setSubTab] = useState<SubTab>('system');
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for preview modals
  const [selectedHerb, setSelectedHerb] = useState<Herb | null>(null);
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);

  // State for editing modals
  const [editingHerb, setEditingHerb] = useState<Herb | null>(null);
  const [editingFormula, setEditingFormula] = useState<Formula | null>(null);

  // State for delete confirmation modal
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'herb' | 'formula' | 'prescription'; name: string } | null>(null);

  // State for data - loaded from real data sources
  const [systemHerbs, setSystemHerbs] = useState<Herb[]>([]);
  const [userHerbs, setUserHerbs] = useState<Herb[]>([]);
  const [systemFormulas, setSystemFormulas] = useState<Formula[]>([]);
  const [userFormulas, setUserFormulas] = useState<Formula[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const getMainTabLabel = (tab: MainTab) => {
    if (tab === 'herbs') return isSpanish ? 'Hierbas' : 'Herbs';
    if (tab === 'formulas') return isSpanish ? 'Fórmulas' : 'Formulas';
    return isSpanish ? 'Prescripciones' : 'Prescriptions';
  };

  // Load real data on mount and listen for updates
  useEffect(() => {
    const loadData = () => {
      const allHerbs = getAllHerbs();
      const allFormulas = getAllFormulas();
      const allPrescriptions = getPrescriptionsSync();

      // Separate system and user herbs
      // System herbs: those WITHOUT createdBy field (imported or original system items)
      // User herbs: those WITH createdBy field (created by users)
      setSystemHerbs(allHerbs.filter(h => !h.createdBy));
      setUserHerbs(allHerbs.filter(h => h.createdBy));

      // Separate system and user formulas
      setSystemFormulas(allFormulas.filter(f => !f.createdBy));
      setUserFormulas(allFormulas.filter(f => f.createdBy));
      
      // Debug logging
      console.log('All herbs:', allHerbs.length);
      console.log('System herbs (no createdBy):', allHerbs.filter(h => !h.createdBy).length);
      console.log('User herbs (with createdBy):', allHerbs.filter(h => h.createdBy).length);
      console.log('User herbs:', allHerbs.filter(h => h.createdBy));
      
      console.log('All formulas:', allFormulas.length);
      console.log('System formulas (no createdBy):', allFormulas.filter(f => !f.createdBy).length);
      console.log('User formulas (with createdBy):', allFormulas.filter(f => f.createdBy).length);
      console.log('User formulas:', allFormulas.filter(f => f.createdBy));

      // Load prescriptions
      setPrescriptions(allPrescriptions);
    };

    loadData();

    // Listen for updates
    window.addEventListener('storage', loadData);
    window.addEventListener('prescriptions-updated', loadData);
    
    // Custom event for formula updates
    window.addEventListener('formulas-updated', loadData);

    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('prescriptions-updated', loadData);
      window.removeEventListener('formulas-updated', loadData);
    };
  }, []);

  // Delete confirmation handlers
  const handleDeleteClick = (id: string, type: 'herb' | 'formula' | 'prescription', name: string) => {
    setItemToDelete({ id, type, name });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'herb') {
      deleteCustomHerb(itemToDelete.id);
    } else if (itemToDelete.type === 'formula') {
      deleteCustomFormula(itemToDelete.id);
    } else if (itemToDelete.type === 'prescription') {
      deletePrescription(itemToDelete.id);
    }

    // Reload data
    window.location.reload();

    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  // Handlers for herbs
  const handleToggleHerbStatus = (id: string, isSystem: boolean) => {
    // TODO: Implement status toggle in herbsManager
    console.log('Toggle herb status:', id, isSystem);
  };

  // Handlers for formulas
  const handleToggleFormulaStatus = (id: string, isSystem: boolean) => {
    // TODO: Implement status toggle in formulasManager
    console.log('Toggle formula status:', id, isSystem);
  };

  // Handlers for prescriptions
  const handleTogglePrescriptionStatus = (id: string) => {
    // TODO: Implement status toggle in prescriptions
    console.log('Toggle prescription status:', id);
  };

  return (
    <>
      <>
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isSpanish ? 'Gestión de contenido' : 'Content management'}
          </h1>
          <p className="hidden sm:block text-gray-600">
            {isSpanish ? 'Gestiona la biblioteca de hierbas y fórmulas' : 'Manage herbs and formulas library'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-8 flex gap-3">
          <button
            onClick={() => {
              if (window.confirm(isSpanish
                ? '¿Seguro que quieres eliminar TODAS las hierbas (personalizadas y sobrescrituras del sistema)? Esto no se puede deshacer.'
                : 'Are you sure you want to delete ALL herbs (custom and system overrides)? This cannot be undone.')) {
                localStorage.removeItem('tcm_custom_herbs');
                localStorage.removeItem('tcm_system_herbs_overrides');
                alert(isSpanish ? '¡Todas las hierbas se han eliminado! Recargando la página...' : 'All herbs cleared! Reloading page...');
                window.location.reload();
              }
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {isSpanish ? 'Borrar todas las hierbas' : 'Clear All Herbs'}
          </button>
          <ContentImportExport 
            onImportComplete={(items, type) => {
              // Process imported items as system items
              if (type === 'herbs') {
                items.forEach(item => {
                  // Clean up - ensure it's a system item without user metadata
                  const cleanItem = {
                    ...item,
                    isSystemItem: true,
                    createdBy: undefined,
                    createdAt: undefined,
                    updatedAt: undefined
                  };
                  addHerb(cleanItem as Herb);
                });
              } else if (type === 'formulas') {
                items.forEach(item => {
                  // Clean up - ensure it's a system item without user metadata
                  const cleanItem = {
                    ...item,
                    isSystemItem: true,
                    createdBy: undefined,
                    createdAt: undefined,
                    updatedAt: undefined
                  };
                  addFormula(cleanItem as Formula);
                });
              }
              
              // Reload data by triggering a storage event
              window.dispatchEvent(new Event('storage'));
            }}
          />
        </div>

        {/* Main Tabs */}
        <div className="mb-6">
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => {
                setMainTab('herbs');
                setSubTab('system');
              }}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                mainTab === 'herbs'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {isSpanish ? 'Hierbas' : 'Herbs'}
            </button>
            <button
              onClick={() => {
                setMainTab('formulas');
                setSubTab('system');
              }}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                mainTab === 'formulas'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {isSpanish ? 'Fórmulas' : 'Formulas'}
            </button>
            <button
              onClick={() => {
                setMainTab('prescriptions');
                setSubTab('system');
              }}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                mainTab === 'prescriptions'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {isSpanish ? 'Prescripciones' : 'Prescriptions'}
            </button>
          </div>
        </div>

        {/* Sub-tabs and Search */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-6 mb-6">
          {/* Search - appears first on mobile, second on desktop */}
          <div className="flex items-center gap-3 order-1 md:order-2">
            <div className="relative flex-1 md:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 pl-9 pr-4 py-2.5 bg-white text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Sub-tabs - appears second on mobile, first on desktop */}
          <nav className="flex overflow-x-auto shrink-0 order-2 md:order-1">
            {mainTab !== 'prescriptions' ? (
              <>
                <button
                  onClick={() => setSubTab('system')}
                  className={`px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    subTab === 'system'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {isSpanish ? `Sistema ${getMainTabLabel(mainTab)}` : `System ${getMainTabLabel(mainTab)}`}
                </button>
                <button
                  onClick={() => setSubTab('user-added')}
                  className={`px-6 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    subTab === 'user-added'
                      ? 'border-gray-900 text-gray-900'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {isSpanish ? `Añadidas por usuarios ${getMainTabLabel(mainTab)}` : `User-added ${getMainTabLabel(mainTab)}`}
                </button>
              </>
            ) : (
              <button
                className="px-6 py-4 border-b-2 border-gray-900 font-medium text-sm text-gray-900 whitespace-nowrap"
              >
                {isSpanish ? 'Todas las prescripciones' : 'All Prescriptions'}
              </button>
            )}
          </nav>
        </div>

        {/* Content Tables */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {mainTab === 'herbs' && subTab === 'system' && (
            <SystemHerbsTable
              herbs={systemHerbs}
              searchQuery={searchQuery}
              onToggleStatus={(id) => handleToggleHerbStatus(id, true)}
              onEdit={setEditingHerb}
              onDelete={handleDeleteClick}
            />
          )}
          {mainTab === 'herbs' && subTab === 'user-added' && (
            <UserHerbsTable
              herbs={userHerbs}
              searchQuery={searchQuery}
              onToggleStatus={(id) => handleToggleHerbStatus(id, false)}
              onEdit={setEditingHerb}
              onDelete={handleDeleteClick}
            />
          )}
          {mainTab === 'formulas' && subTab === 'system' && (
            <SystemFormulasTable
              formulas={systemFormulas}
              searchQuery={searchQuery}
              onToggleStatus={(id) => handleToggleFormulaStatus(id, true)}
              onEdit={setEditingFormula}
              onDelete={handleDeleteClick}
            />
          )}
          {mainTab === 'formulas' && subTab === 'user-added' && (
            <UserFormulasTable
              formulas={userFormulas}
              searchQuery={searchQuery}
              onToggleStatus={(id) => handleToggleFormulaStatus(id, false)}
              onEdit={setEditingFormula}
              onDelete={handleDeleteClick}
            />
          )}
          {mainTab === 'prescriptions' && (
            <PrescriptionsTable
              prescriptions={prescriptions}
              searchQuery={searchQuery}
              onToggleStatus={(id) => handleTogglePrescriptionStatus(id)}
              onDelete={handleDeleteClick}
            />
          )}
        </div>

        {/* Edit Modals */}
        {editingHerb && (
          <HerbJsonEditorModal
            herb={editingHerb}
            onClose={() => setEditingHerb(null)}
            onSave={(updatedHerb) => {
              updateHerb(updatedHerb.herb_id, updatedHerb);
              setEditingHerb(null);
              window.location.reload();
            }}
          />
        )}

        {editingFormula && (
          <FormulaJsonEditorModal
            formula={editingFormula}
            onClose={() => setEditingFormula(null)}
            onSave={(updatedFormula) => {
              updateFormula(updatedFormula.formula_id, updatedFormula);
              setEditingFormula(null);
              window.location.reload();
            }}
          />
        )}

        {/* Delete Confirmation Modal */}
        <Dialog.Root open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-[110]">
              <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
                {isSpanish ? 'Confirmar eliminación' : 'Confirm Deletion'}
              </Dialog.Title>
              <Dialog.Description className="text-gray-600 mb-6">
                {isSpanish
                  ? `¿Seguro que quieres eliminar ${itemToDelete?.name}? Esta acción no se puede deshacer.`
                  : `Are you sure you want to delete ${itemToDelete?.name}? This action cannot be undone.`}
              </Dialog.Description>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setDeleteConfirmOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {isSpanish ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  {isSpanish ? 'Eliminar' : 'Delete'}
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </>
    </>
  );
}

// System Herbs Table
function SystemHerbsTable({
  herbs,
  searchQuery,
  onToggleStatus,
  onEdit,
  onDelete
}: {
  herbs: Herb[];
  searchQuery: string;
  onToggleStatus: (id: string) => void;
  onEdit: (herb: Herb) => void;
  onDelete: (id: string, type: 'herb' | 'formula' | 'prescription', name: string) => void;
}) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const [selectedHerb, setSelectedHerb] = useState<Herb | null>(null);
  
  const filteredHerbs = herbs.filter(
    (herb) =>
      (herb.pinyin_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (herb.pharmaceutical_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (herb.category?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isSpanish ? 'Nombre pinyin' : 'Pinyin name'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isSpanish ? 'Nombre farmacéutico' : 'Pharmaceutical name'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isSpanish ? 'ID de hierba' : 'Herb ID'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isSpanish ? 'Categoría' : 'Category'}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isSpanish ? 'Acciones' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredHerbs.map((herb) => (
              <tr key={herb.herb_id} className="hover:bg-gray-50 transition-colors">
                <td 
                  className="px-6 py-4 text-sm font-medium text-teal-700 hover:text-teal-800 cursor-pointer"
                  onClick={() => setSelectedHerb(herb)}
                >
                  {herb.pinyin_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{herb.pharmaceutical_name}</td>
                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{herb.herb_id}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{herb.category}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(herb)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title={isSpanish ? 'Editar' : 'Edit'}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(herb.herb_id, 'herb', herb.pinyin_name)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title={isSpanish ? 'Eliminar' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredHerbs.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            {isSpanish ? 'No se encontraron hierbas que coincidan con tu búsqueda.' : 'No herbs found matching your search.'}
          </div>
        )}
      </div>
      
      {/* Herb Preview Modal */}
      {selectedHerb && (
        <HerbJsonEditorModal 
          herb={selectedHerb}
          onClose={() => setSelectedHerb(null)}
          onSave={(updatedHerb) => {
            updateHerb(updatedHerb.herb_id, updatedHerb);
            setSelectedHerb(null);
            // Trigger reload
            window.location.reload();
          }}
        />
      )}
    </>
  );
}

// User Herbs Table
function UserHerbsTable({
  herbs,
  searchQuery,
  onToggleStatus,
  onEdit,
  onDelete
}: {
  herbs: Herb[];
  searchQuery: string;
  onToggleStatus: (id: string) => void;
  onEdit: (herb: Herb) => void;
  onDelete: (id: string, type: 'herb' | 'formula' | 'prescription', name: string) => void;
}) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const filteredHerbs = herbs.filter(
    (herb) =>
      (herb.pinyin_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (herb.pharmaceutical_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (herb.createdBy?.userName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {isSpanish ? 'Nombre pinyin' : 'Pinyin name'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {isSpanish ? 'Nombre farmacéutico' : 'Pharmaceutical name'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {isSpanish ? 'ID de hierba' : 'Herb ID'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {isSpanish ? 'Creado por' : 'Created by'}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {isSpanish ? 'Fecha de creación' : 'Date created'}
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {isSpanish ? 'Acciones' : 'Actions'}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {filteredHerbs.map((herb) => (
            <tr key={herb.herb_id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 text-sm font-medium text-gray-900">{herb.pinyin_name}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{herb.pharmaceutical_name}</td>
              <td className="px-6 py-4 text-sm text-gray-500 font-mono">{herb.herb_id}</td>
              <td className="px-6 py-4 text-sm text-gray-500">{herb.createdBy?.userName || 'Unknown'}</td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {herb.createdAt ? new Date(herb.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }) : '-'}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(herb)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title={isSpanish ? 'Editar' : 'Edit'}
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(herb.herb_id, 'herb', herb.pinyin_name)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title={isSpanish ? 'Eliminar' : 'Delete'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredHerbs.length === 0 && (
        <div className="px-6 py-12 text-center text-sm text-gray-500">
          {isSpanish ? 'No se encontraron hierbas que coincidan con tu búsqueda.' : 'No herbs found matching your search.'}
        </div>
      )}
    </div>
  );
}

// System Formulas Table
function SystemFormulasTable({
  formulas,
  searchQuery,
  onToggleStatus,
  onEdit,
  onDelete
}: {
  formulas: Formula[];
  searchQuery: string;
  onToggleStatus: (id: string) => void;
  onEdit: (formula: Formula) => void;
  onDelete: (id: string, type: 'herb' | 'formula' | 'prescription', name: string) => void;
}) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  
  const filteredFormulas = formulas.filter(
    (formula) =>
      (formula.pinyin_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (formula.translated_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (formula.category?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isSpanish ? 'Nombre pinyin' : 'Pinyin name'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isSpanish ? 'Nombre farmacéutico' : 'Pharmaceutical name'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isSpanish ? 'ID de fórmula' : 'Formula ID'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isSpanish ? 'Categoría' : 'Category'}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isSpanish ? 'Acciones' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFormulas.map((formula) => (
              <tr key={formula.formula_id} className="hover:bg-gray-50 transition-colors">
                <td 
                  className="px-6 py-4 text-sm font-medium text-teal-700 hover:text-teal-800 cursor-pointer"
                  onClick={() => setSelectedFormula(formula)}
                >
                  {formula.pinyin_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{formula.translated_name}</td>
                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{formula.formula_id}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{formula.category}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(formula)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title={isSpanish ? 'Editar' : 'Edit'}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(formula.formula_id, 'formula', formula.pinyin_name)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title={isSpanish ? 'Eliminar' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredFormulas.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            {isSpanish ? 'No se encontraron fórmulas que coincidan con tu búsqueda.' : 'No formulas found matching your search.'}
          </div>
        )}
      </div>
      
      {/* Formula Preview Modal */}
      {selectedFormula && (
        <FormulaJsonEditorModal 
          formula={selectedFormula}
          onClose={() => setSelectedFormula(null)}
          onSave={(updatedFormula) => {
            updateFormula(updatedFormula.formula_id, updatedFormula);
            setSelectedFormula(null);
            // Trigger reload
            window.location.reload();
          }}
        />
      )}
    </>
  );
}

// User Formulas Table
function UserFormulasTable({
  formulas,
  searchQuery,
  onToggleStatus,
  onEdit,
  onDelete
}: {
  formulas: Formula[];
  searchQuery: string;
  onToggleStatus: (id: string) => void;
  onEdit: (formula: Formula) => void;
  onDelete: (id: string, type: 'herb' | 'formula' | 'prescription', name: string) => void;
}) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const [selectedFormula, setSelectedFormula] = useState<Formula | null>(null);
  
  const filteredFormulas = formulas.filter(
    (formula) =>
      (formula.pinyin_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (formula.translated_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (formula.createdBy?.userName && formula.createdBy.userName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isSpanish ? 'Nombre pinyin' : 'Pinyin name'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isSpanish ? 'Nombre farmacéutico' : 'Pharmaceutical name'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isSpanish ? 'ID de fórmula' : 'Formula ID'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isSpanish ? 'Creado por' : 'Created by'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isSpanish ? 'Fecha de creación' : 'Date created'}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isSpanish ? 'Acciones' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredFormulas.map((formula) => (
              <tr key={formula.formula_id} className="hover:bg-gray-50 transition-colors">
                <td 
                  className="px-6 py-4 text-sm font-medium text-teal-700 hover:text-teal-800 cursor-pointer"
                  onClick={() => setSelectedFormula(formula)}
                >
                  {formula.pinyin_name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{formula.translated_name}</td>
                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{formula.formula_id}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{formula.createdBy?.userName || 'Unknown'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formula.createdAt ? new Date(formula.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  }) : '-'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(formula)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title={isSpanish ? 'Editar' : 'Edit'}
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(formula.formula_id, 'formula', formula.pinyin_name)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title={isSpanish ? 'Eliminar' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredFormulas.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
          {isSpanish ? 'No se encontraron fórmulas que coincidan con tu búsqueda.' : 'No formulas found matching your search.'}
        </div>
      )}
      </div>
      
      {/* Formula Preview Modal */}
      {selectedFormula && (
        <FormulaJsonEditorModal 
          formula={selectedFormula}
          onClose={() => setSelectedFormula(null)}
          onSave={(updatedFormula) => {
            updateFormula(updatedFormula.formula_id, updatedFormula);
            setSelectedFormula(null);
            // Trigger reload
            window.location.reload();
          }}
        />
      )}
    </>
  );
}

// Prescriptions Table
function PrescriptionsTable({
  prescriptions,
  searchQuery,
  onToggleStatus,
  onDelete
}: {
  prescriptions: Prescription[];
  searchQuery: string;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string, type: 'herb' | 'formula' | 'prescription', name: string) => void;
}) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
  
  const filteredPrescriptions = prescriptions.filter(
    (prescription) =>
      prescription.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isSpanish ? 'Nombre de prescripción' : 'Prescription Name'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isSpanish ? 'Creado por' : 'Created By'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isSpanish ? 'ID de prescripción' : 'Prescription ID'}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isSpanish ? 'Fecha de creación' : 'Date created'}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {isSpanish ? 'Acciones' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPrescriptions.map((prescription) => (
              <tr key={prescription.id} className="hover:bg-gray-50 transition-colors">
                <td 
                  className="px-6 py-4 text-sm font-medium text-teal-700 hover:text-teal-800 cursor-pointer"
                  onClick={() => setSelectedPrescription(prescription)}
                >
                  {prescription.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {prescription.createdBy ? prescription.createdBy.userName : 'Unknown'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{prescription.id}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(prescription.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => navigate(`/prescriptions`)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title={isSpanish ? 'Ver' : 'View'}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(prescription.id, 'prescription', `prescription for ${prescription.name}`)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title={isSpanish ? 'Eliminar' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredPrescriptions.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            {isSpanish ? 'No se encontraron prescripciones que coincidan con tu búsqueda.' : 'No prescriptions found matching your search.'}
          </div>
        )}
      </div>
      
      {/* Prescription Preview Modal */}
      {selectedPrescription && (
        <PrescriptionPreviewModal
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
        />
      )}
    </>
  );
}
