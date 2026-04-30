import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { getPrescriptions, deletePrescription, migratePrescriptionsToCurrentUser, getPrescriptionsSync } from '@/app/data/prescriptions';
import { SearchBar } from '@/app/components/ui/SearchBar';
import { EmptyState } from '@/app/components/ui/EmptyState';
import { ScrollableListCard } from '@/app/components/ui/ScrollableListCard';
import { normalizeForSearch } from '@/app/utils/searchUtils';
import { Plus, Search, LayoutList, LayoutGrid, Trash2, FileText } from 'lucide-react';
import { useSectionIcon } from '../hooks/useSectionIcon';
import { usePlanFeatures } from '../hooks/usePlanFeatures';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { toast } from 'sonner';
import { useGlobalSettings } from '../hooks/useGlobalSettings';
import { useModalNavigation } from '../hooks/useModalNavigation';
import { UnifiedDetailsModal } from '../components/UnifiedDetailsModal';
import { useNavigate } from 'react-router-dom';

// Get current user identifier (email if logged in, or persistent browser ID)
function getCurrentUserId(): string {
  try {
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      return profile.email; // Use email as primary identifier when logged in
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
  }

  // Fallback to persistent browser ID
  const USER_ID_KEY = 'tcm_user_id';
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    // If no ID exists, generate one
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

// Helper function to get user's prescriptions only (async - loads from Supabase)
const getUserPrescriptions = async () => {
  const allPrescriptions = await getPrescriptions();
  // Supabase already filters by user_id, so just return all
  return allPrescriptions;
};

// Synchronous version using localStorage
const getUserPrescriptionsSync = () => {
  const allPrescriptions = getPrescriptionsSync();
  const currentUserId = getCurrentUserId();

  // Filter to show only prescriptions created by current user
  return allPrescriptions.filter(prescription => {
    // Handle prescriptions that might not have createdBy (legacy data)
    if (!prescription.createdBy) {
      return false; // Don't show prescriptions without owner
    }
    return prescription.createdBy.userId === currentUserId;
  });
};

export default function Prescriptions() {
  const { IconComponent: PrescriptionIcon, customSvg: prescriptionCustomSvg } = useSectionIcon('prescriptions');
  const { hasFeature } = usePlanFeatures();
  const { globalSettings } = useGlobalSettings();
  const modalNav = useModalNavigation();
  const navigate = useNavigate();
  const location = useLocation();

  const [prescriptions, setPrescriptions] = useState(getUserPrescriptionsSync());
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [prescriptionToDelete, setPrescriptionToDelete] = useState<{ id: string; name: string } | null>(null);

  // Load prescriptions from Supabase on mount
  useEffect(() => {
    const loadPrescriptions = async () => {
      setIsLoading(true);
      const prescriptionsFromDb = await getUserPrescriptions();
      setPrescriptions(prescriptionsFromDb);
      setIsLoading(false);
    };

    loadPrescriptions();
  }, []);

  // Run migration on first load to recover old prescriptions
  useEffect(() => {
    const migratedCount = migratePrescriptionsToCurrentUser();
    if (migratedCount > 0) {
      console.log(`Migrated ${migratedCount} prescription(s) to current user`);
      getUserPrescriptions().then(setPrescriptions);
      toast.success(`Recovered ${migratedCount} prescription${migratedCount > 1 ? 's' : ''}`);
    }
  }, []); // Run only once on mount

  // Open modal if coming from Builder with a prescription ID
  useEffect(() => {
    const state = location.state as { openPrescription?: string } | null;
    if (state?.openPrescription) {
      // Small delay to ensure the page is fully rendered
      setTimeout(() => {
        // Open the modal for the newly created prescription
        modalNav.reset({ 
          type: 'prescription', 
          name: state.openPrescription, 
          prescriptionId: state.openPrescription 
        });
      }, 100);
      
      // Clear the state to prevent reopening on subsequent navigations
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, modalNav, navigate]);

  useEffect(() => {
    const handleStorageChange = async () => {
      const updated = await getUserPrescriptions();
      setPrescriptions(updated);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Refresh when window gains focus (to catch changes from Builder)
  useEffect(() => {
    const handleFocus = async () => {
      const updated = await getUserPrescriptions();
      setPrescriptions(updated);
    };
    window.addEventListener('focus', handleFocus);

    // Also listen for custom event
    const handleUpdate = async () => {
      const updated = await getUserPrescriptions();
      setPrescriptions(updated);
    };
    window.addEventListener('prescriptions-updated', handleUpdate);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('prescriptions-updated', handleUpdate);
    };
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.preventDefault(); // Prevent navigation to detail page
    e.stopPropagation();
    setPrescriptionToDelete({ id, name });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!prescriptionToDelete) return;
    await deletePrescription(prescriptionToDelete.id);
    const updated = await getUserPrescriptions();
    setPrescriptions(updated);
    setDeleteConfirmOpen(false);
    setPrescriptionToDelete(null);
    toast.success('Prescription deleted');
  };

  const filteredPrescriptions = prescriptions.filter(prescription =>
    normalizeForSearch(prescription.name).includes(normalizeForSearch(searchQuery))
  );

  // Check if user has access to Prescription Library
  if (!hasFeature('prescriptionLibrary')) {
    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <UpgradePrompt
          feature="Prescription Library"
          description="Save and manage your prescriptions. Access your prescription history and reuse successful formulations."
          requiredPlan="practitioner"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-4 lg:p-6 pb-[86px] sm:pb-4 lg:pb-6 flex flex-col gap-4 flex-1 min-h-0 overflow-hidden sm:overflow-auto">
      
      <main className="flex-1 min-w-0 flex flex-col gap-4">
        {prescriptions.length > 0 && (
          <div className="flex items-center gap-2 h-10 sm:h-11 flex-shrink-0">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search prescriptions..."
              className="w-full sm:w-[400px]"
            />
            
            {/* Add New Prescription Button - Mobile: between search and view toggle */}
            <Link
              to="/builder"
              className="sm:hidden flex items-center justify-center gap-2 w-10 h-10 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap flex-shrink-0"
              title="New Prescription"
            >
              <Plus className="w-[18px] h-[18px]" />
            </Link>
            
            {/* Spacer to push buttons to the right on desktop */}
            <div className="hidden sm:block flex-1" />
            
            {/* Add New Prescription Button - Desktop */}
            <Link
              to="/builder"
              className="hidden sm:flex items-center justify-center gap-2 px-4 h-10 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap flex-shrink-0"
              title="New Prescription"
            >
              <Plus className="w-4 h-4" />
              <FileText className="w-4 h-4" />
            </Link>
            
            {/* View Toggle */}
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
        )}

        {prescriptions.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12">
            <EmptyState
              icon={PrescriptionIcon}
              title="No prescriptions yet"
              description="Create your first prescription using the Builder"
              action={
                <Link
                  to="/builder"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Prescription
                </Link>
              }
            />
          </div>
        ) : filteredPrescriptions.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 sm:p-12">
            <EmptyState
              icon={Search}
              title="No prescriptions found"
              description="Try adjusting your search query"
            />
          </div>
        ) : viewMode === 'list' ? (
          <ScrollableListCard className="flex-1 min-h-0 overflow-hidden" dynamic>
            <div className="divide-y divide-gray-200 border-b border-gray-200">
              {filteredPrescriptions
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map((prescription) => (
                  <div
                    key={prescription.id}
                    className="group hover:bg-gray-50 transition-colors"
                  >
                    <div
                      onClick={() => modalNav.reset({ type: 'prescription', name: prescription.id, prescriptionId: prescription.id })}
                      className="block px-3 sm:px-4 lg:px-6 py-3 sm:py-4 w-full text-left cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base flex-1 min-w-0">
                          {prescription.name}
                        </h3>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                            {prescription.createdAt.toLocaleDateString()}
                          </span>
                          <button
                            onClick={(e) => handleDelete(e, prescription.id, prescription.name)}
                            className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            title="Delete prescription"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                      {globalSettings.prescriptions.list.ingredients && prescription.components.length > 0 && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-1 sm:line-clamp-2">
                          {prescription.components
                            .map((comp) => `${comp.name} ${comp.dosage}`)
                            .join(', ')}
                        </p>
                      )}
                      {globalSettings.prescriptions.list.comments && prescription.comments && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 line-clamp-1 sm:line-clamp-2">
                          {prescription.comments}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </ScrollableListCard>
        ) : (
          <ScrollableListCard className="flex-1 min-h-0 overflow-hidden" dynamic>
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 p-3 sm:p-4 lg:p-6">
              {filteredPrescriptions
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map((prescription) => (
                  <div
                    key={prescription.id}
                    className="group relative bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <button
                      onClick={() => modalNav.reset({ type: 'prescription', name: prescription.id, prescriptionId: prescription.id })}
                      className="block p-4 sm:p-6 w-full text-left"
                    >
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3 pr-8 line-clamp-2">
                        {prescription.name}
                      </h3>
                      <div className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                        {globalSettings.prescriptions.list.ingredients && prescription.components.length > 0 && (
                          <p className="mb-2 line-clamp-2">
                            {prescription.components
                              .map((comp) => `${comp.name} ${comp.dosage}`)
                              .join(', ')}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          {prescription.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                      {globalSettings.prescriptions.list.comments && prescription.comments && (
                        <p className="text-xs sm:text-sm text-gray-500 line-clamp-2">
                          {prescription.comments}
                        </p>
                      )}
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, prescription.id, prescription.name)}
                      className="absolute top-3 sm:top-4 right-3 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 sm:p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete prescription"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                ))}
            </div>
          </ScrollableListCard>
        )}
      </main>
      </div>

      {/* Unified Details Modal */}
      <UnifiedDetailsModal
        isOpen={modalNav.isOpen}
        currentItem={modalNav.currentItem}
        canGoBack={modalNav.canGoBack}
        onClose={modalNav.close}
        onGoBack={modalNav.goBack}
        onNavigate={modalNav.navigateTo}
        showNatureIndicator={globalSettings?.herbs?.nature ?? false}
        showThermalActionIndicator={globalSettings?.formulas?.thermalAction ?? false}
        herbDetailChipsNatureIndicator={globalSettings?.herbs?.detailViewChipsNature ?? true}
        herbDetailViewNameOrder={globalSettings?.herbs?.detailViewNameOrder ?? ['pinyin', 'pharmaceutical', 'hanzi']}
        herbDetailViewPinyin={globalSettings?.herbs?.detailViewPinyin ?? true}
        herbDetailViewPharmaceutical={globalSettings?.herbs?.detailViewPharmaceutical ?? true}
        herbDetailViewHanzi={globalSettings?.herbs?.detailViewHanzi ?? true}
        formulaDetailChipsThermalIndicator={globalSettings?.formulas?.detailViewChipsThermalAction ?? true}
        formulaDetailViewNameOrder={globalSettings?.formulas?.detailViewNameOrder ?? ['pinyin', 'pharmaceutical', 'alternative', 'hanzi']}
        formulaDetailViewPinyin={globalSettings?.formulas?.detailViewPinyin ?? true}
        formulaDetailViewPharmaceutical={globalSettings?.formulas?.detailViewPharmaceutical ?? true}
        formulaDetailViewAlternative={globalSettings?.formulas?.detailViewAlternative ?? true}
        formulaDetailViewHanzi={globalSettings?.formulas?.detailViewHanzi ?? true}
        ingredientsShowFormulas={globalSettings?.formulas?.ingredients ?? true}
        ingredientsNatureIndicator={globalSettings?.formulas?.nature ?? false}
        ingredientsThermalIndicator={globalSettings?.formulas?.thermalAction ?? false}
        ingredientsLayout={globalSettings?.formulas?.ingredientsLayout ?? 'grid'}
        ingredientsHerbPinyin={globalSettings?.formulas?.herbsName?.pinyin ?? true}
        ingredientsHerbLatin={globalSettings?.formulas?.herbsName?.pharmaceutical ?? false}
        ingredientsHerbHanzi={globalSettings?.formulas?.herbsName?.hanzi ?? false}
        ingredientsHerbOrder={globalSettings?.formulas?.herbsName?.order ?? ['pinyin', 'latin', 'hanzi']}
        ingredientsFormulaPinyin={globalSettings?.formulas?.formulasName?.pinyin ?? true}
        ingredientsFormulaPharmaceutical={globalSettings?.formulas?.formulasName?.pharmaceutical ?? false}
        ingredientsFormulaHanzi={globalSettings?.formulas?.formulasName?.hanzi ?? false}
        ingredientsFormulaOrder={globalSettings?.formulas?.formulasName?.order ?? ['pinyin', 'pharmaceutical', 'hanzi']}
        allItems={modalNav.currentItem?.type === 'prescription' && !modalNav.canGoBack ? filteredPrescriptions.map(p => p.id) : []}
        onNavigatePrevious={() => {
          if (!modalNav.currentItem || modalNav.currentItem.type !== 'prescription') return;
          const currentIndex = filteredPrescriptions.findIndex(p => p.id === modalNav.currentItem!.prescriptionId);
          if (currentIndex > 0) {
            const prevPrescription = filteredPrescriptions[currentIndex - 1];
            modalNav.reset({ type: 'prescription', name: prevPrescription.name, prescriptionId: prevPrescription.id });
          }
        }}
        onNavigateNext={() => {
          if (!modalNav.currentItem || modalNav.currentItem.type !== 'prescription') return;
          const currentIndex = filteredPrescriptions.findIndex(p => p.id === modalNav.currentItem!.prescriptionId);
          if (currentIndex < filteredPrescriptions.length - 1) {
            const nextPrescription = filteredPrescriptions[currentIndex + 1];
            modalNav.reset({ type: 'prescription', name: nextPrescription.name, prescriptionId: nextPrescription.id });
          }
        }}
        onEditPrescription={(id) => navigate(`/builder?prescription=${id}`)}
        onDeletePrescription={(id) => {
          const prescription = prescriptions.find(p => p.id === id);
          if (prescription) {
            setPrescriptionToDelete({ id, name: prescription.name });
            setDeleteConfirmOpen(true);
            modalNav.close();
          }
        }}
        prescriptionDisplayConfig={globalSettings?.prescriptions}
      />

      {/* Delete Confirmation Modal */}
      <Dialog.Root open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-[100]">
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
              Confirmar eliminación
            </Dialog.Title>
            <Dialog.Description className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar "{prescriptionToDelete?.name}"? Esta acción no se puede deshacer.
            </Dialog.Description>
            <div className="flex gap-3 justify-end">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}