import * as Dialog from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, Undo2, Copy, Check } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { HerbDetails } from './HerbDetails';
import { FormulaDetails } from './FormulaDetails';
import { PrescriptionDetails } from './PrescriptionDetails';
import { getAllHerbs } from '@/app/data/herbsManager';
import { getAllFormulas } from '@/app/data/formulasManager';
import { getPrescriptionsSync } from '@/app/data/prescriptions';
import type { ModalItem } from '@/app/hooks/useModalNavigation';
import type { Herb } from '@/app/data/herbs';

interface UnifiedDetailsModalProps {
  isOpen: boolean;
  currentItem: ModalItem | null;
  canGoBack: boolean;
  onClose: () => void;
  onGoBack: () => void;
  onNavigate: (item: ModalItem, currentScrollPosition?: number) => void;
  showNatureIndicator?: boolean;
  showThermalActionIndicator?: boolean;
  herbDetailChipsNatureIndicator?: boolean;
  herbDetailViewNameOrder?: ('pinyin' | 'pharmaceutical' | 'hanzi')[];
  herbDetailViewPinyin?: boolean;
  herbDetailViewPharmaceutical?: boolean;
  herbDetailViewHanzi?: boolean;
  formulaDetailChipsThermalIndicator?: boolean;
  formulaDetailViewNameOrder?: ('pinyin' | 'pharmaceutical' | 'alternative' | 'hanzi')[];
  formulaDetailViewPinyin?: boolean;
  formulaDetailViewPharmaceutical?: boolean;
  formulaDetailViewAlternative?: boolean;
  formulaDetailViewHanzi?: boolean;
  isHerbBanned?: (herb: Herb) => boolean;
  ingredientsShowFormulas?: boolean;
  ingredientsNatureIndicator?: boolean;
  ingredientsThermalIndicator?: boolean;
  ingredientsLayout?: 'grid' | 'list';
  ingredientsHerbPinyin?: boolean;
  ingredientsHerbLatin?: boolean;
  ingredientsHerbHanzi?: boolean;
  ingredientsHerbOrder?: ('pinyin' | 'latin' | 'hanzi')[];
  ingredientsFormulaPinyin?: boolean;
  ingredientsFormulaPharmaceutical?: boolean;
  ingredientsFormulaHanzi?: boolean;
  ingredientsFormulaOrder?: ('pinyin' | 'pharmaceutical' | 'hanzi')[];
  // List navigation props
  allItems?: string[]; // Array of pinyin names in current filtered list
  onNavigatePrevious?: () => void;
  onNavigateNext?: () => void;
  // Admin actions props
  showAdminActions?: boolean;
  onEditHerb?: (herb: Herb) => void;
  onDeleteHerb?: (herb: Herb) => void;
  onEditFormula?: (formulaId: string) => void;
  onDeleteFormula?: (formulaId: string) => void;
  onEditPrescription?: (prescriptionId: string) => void;
  onDeletePrescription?: (prescriptionId: string) => void;
  // Prescription display config
  prescriptionDisplayConfig?: any;
}

export function UnifiedDetailsModal({
  isOpen,
  currentItem,
  canGoBack,
  onClose,
  onGoBack,
  onNavigate,
  showNatureIndicator = false,
  showThermalActionIndicator = true,
  herbDetailChipsNatureIndicator = true,
  herbDetailViewNameOrder = ['pinyin', 'pharmaceutical', 'hanzi'],
  herbDetailViewPinyin = true,
  herbDetailViewPharmaceutical = true,
  herbDetailViewHanzi = true,
  formulaDetailChipsThermalIndicator = true,
  formulaDetailViewNameOrder = ['pinyin', 'pharmaceutical', 'alternative', 'hanzi'],
  formulaDetailViewPinyin = true,
  formulaDetailViewPharmaceutical = true,
  formulaDetailViewAlternative = true,
  formulaDetailViewHanzi = true,
  isHerbBanned = () => false,
  ingredientsShowFormulas = true,
  ingredientsNatureIndicator = false,
  ingredientsThermalIndicator = false,
  ingredientsLayout = 'grid',
  ingredientsHerbPinyin = true,
  ingredientsHerbLatin = false,
  ingredientsHerbHanzi = false,
  ingredientsHerbOrder = ['pinyin', 'latin', 'hanzi'],
  ingredientsFormulaPinyin = true,
  ingredientsFormulaPharmaceutical = false,
  ingredientsFormulaHanzi = false,
  ingredientsFormulaOrder = ['pinyin', 'pharmaceutical', 'hanzi'],
  allItems = [],
  onNavigatePrevious,
  onNavigateNext,
  showAdminActions = false,
  onEditHerb,
  onDeleteHerb,
  onEditFormula,
  onDeleteFormula,
  onEditPrescription,
  onDeletePrescription,
  prescriptionDisplayConfig,
}: UnifiedDetailsModalProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousItemRef = useRef<ModalItem | null>(null);

  // Data states that refresh when modal opens
  const [herbsData, setHerbsData] = useState(getAllHerbs());
  const [formulasData, setFormulasData] = useState(getAllFormulas());
  const [prescriptionsData, setPrescriptionsData] = useState(getPrescriptionsSync());

  // Refresh data when modal opens or current item changes
  useEffect(() => {
    if (isOpen) {
      setHerbsData(getAllHerbs());
      setFormulasData(getAllFormulas());
      setPrescriptionsData(getPrescriptionsSync());
    }
  }, [isOpen, currentItem]);

  // Copy state for prescriptions
  const [copied, setCopied] = useState(false);

  // Pull-to-dismiss state (simple: only swipe down to close)
  const [dragState, setDragState] = useState({
    isDragging: false,
    startY: 0,
    currentY: 0,
    startScrollTop: 0,
  });
  const contentRef = useRef<HTMLDivElement>(null);

  // Scroll handling: restore saved position on back navigation, or scroll to top on forward navigation
  useEffect(() => {
    if (scrollContainerRef.current && currentItem) {
      const isBackNavigation = previousItemRef.current &&
        currentItem.scrollPosition !== undefined;

      if (isBackNavigation) {
        // Restore saved scroll position when navigating back
        scrollContainerRef.current.scrollTop = currentItem.scrollPosition || 0;
      } else {
        // Scroll to top when navigating forward or opening new modal
        scrollContainerRef.current.scrollTop = 0;
      }

      previousItemRef.current = currentItem;
    }
  }, [currentItem]);

  // Pull-to-dismiss handlers (only swipe down to close)
  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollTop = scrollContainerRef.current?.scrollTop || 0;
    // Only start drag if we're at the top of the scroll
    if (scrollTop === 0) {
      setDragState({
        isDragging: true,
        startY: e.touches[0].clientY,
        currentY: e.touches[0].clientY,
        startScrollTop: scrollTop,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragState.isDragging) return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - dragState.startY;
    
    // Only allow dragging down (positive deltaY)
    if (deltaY > 0 && scrollContainerRef.current?.scrollTop === 0) {
      setDragState({
        ...dragState,
        currentY,
      });
    }
  };

  const handleTouchEnd = () => {
    if (!dragState.isDragging) return;
    
    const deltaY = dragState.currentY - dragState.startY;
    
    // If dragged down more than 150px, close the modal
    if (deltaY > 150) {
      onClose();
    }
    
    setDragState({
      isDragging: false,
      startY: 0,
      currentY: 0,
      startScrollTop: 0,
    });
  };

  // Calculate transform based on drag distance (only positive = down)
  const dragDistance = dragState.isDragging ? Math.max(0, dragState.currentY - dragState.startY) : 0;
  const opacity = dragState.isDragging ? Math.max(0.5, 1 - dragDistance / 300) : 1;

  // Calculate if there's previous/next items in the list
  const currentIndex = currentItem?.listIndex ?? (currentItem
    ? currentItem.type === 'prescription' 
      ? allItems.findIndex(id => id === currentItem.prescriptionId)
      : allItems.findIndex(name => name === currentItem.name)
    : -1);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allItems.length - 1;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[70]" onClick={onClose} />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white sm:rounded-lg sm:max-w-5xl w-full sm:max-h-[85vh] overflow-hidden z-[80] flex flex-col rounded-t-2xl sm:rounded-b-lg"
          onPointerDownOutside={onClose}
          ref={contentRef}
          onPointerDown={(e) => {
            if (dragState.isDragging) return;
            setDragState({
              isDragging: true,
              startY: e.clientY,
              currentY: e.clientY,
              startScrollTop: scrollContainerRef.current?.scrollTop || 0,
            });
          }}
          onPointerMove={(e) => {
            if (!dragState.isDragging) return;
            setDragState({
              ...dragState,
              currentY: e.clientY,
            });
          }}
          onPointerUp={() => {
            if (!dragState.isDragging) return;
            const deltaY = dragState.currentY - dragState.startY;
            if (deltaY > 100 && scrollContainerRef.current?.scrollTop === 0) {
              onClose();
            }
            setDragState({
              isDragging: false,
              startY: 0,
              currentY: 0,
              startScrollTop: 0,
            });
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{ 
            // Mobile: dynamic top based on expansion state, Desktop: centered
            top: window.innerWidth < 640 ? '10vh' : undefined,
            transform: `translateY(${dragDistance}px)`, 
            opacity,
            transition: dragState.isDragging ? 'none' : 'all 0.3s ease-out'
          }}
        >
          {/* Pull indicator - Mobile only */}
          <div className="sm:hidden flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
          
          <Dialog.Title className="sr-only">
            {currentItem?.type === 'herb' ? 'Herb' : 'Formula'} Details
          </Dialog.Title>
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-20 flex flex-col sm:block min-h-0" ref={scrollContainerRef}>
            {!currentItem ? (
              <div className="text-center text-gray-500 py-12">
                <p className="text-sm">No item selected</p>
              </div>
            ) : currentItem.type === 'herb' ? (
              (() => {
                const herb = herbsData.find(h => h.pinyin_name === currentItem.name);
                if (!herb) return <p className="text-gray-500">Herb not found</p>;
                
                return (
                  <HerbDetails
                    herb={herb}
                    onClose={onClose}
                    showCloseButton={!canGoBack}
                    showNatureIndicator={showNatureIndicator}
                    detailChipsNatureIndicator={herbDetailChipsNatureIndicator}
                    detailViewNameOrder={herbDetailViewNameOrder}
                    detailViewPinyin={herbDetailViewPinyin}
                    detailViewPharmaceutical={herbDetailViewPharmaceutical}
                    detailViewHanzi={herbDetailViewHanzi}
                    detailChipsFormulasThermalIndicator={formulaDetailChipsThermalIndicator}
                    isHerbBanned={isHerbBanned}
                    showAdminActions={showAdminActions}
                    onEdit={onEditHerb ? () => onEditHerb(herb) : undefined}
                    onDelete={onDeleteHerb ? () => onDeleteHerb(herb) : undefined}
                    onHerbClick={(herbName) => {
                      const currentScrollPosition = scrollContainerRef.current?.scrollTop || 0;
                      onNavigate({ type: 'herb', name: herbName }, currentScrollPosition);
                    }}
                    onFormulaClick={(formulaName) => {
                      const targetFormula = formulasData.find(f => f.pinyin_name === formulaName);
                      if (targetFormula) {
                        const currentScrollPosition = scrollContainerRef.current?.scrollTop || 0;
                        onNavigate({ type: 'formula', name: targetFormula.pinyin_name }, currentScrollPosition);
                      }
                    }}
                  />
                );
              })()
            ) : currentItem.type === 'formula' ? (
              (() => {
                const formula = formulasData.find(f => f.pinyin_name === currentItem.name);
                if (!formula) return <p className="text-gray-500">Formula not found</p>;
                
                return (
                  <FormulaDetails
                    formula={formula}
                    onClose={onClose}
                    showCloseButton={!canGoBack}
                    showThermalActionIndicator={showThermalActionIndicator}
                    isHerbBanned={isHerbBanned}
                    ingredientsShowFormulas={ingredientsShowFormulas}
                    ingredientsNatureIndicator={ingredientsNatureIndicator}
                    ingredientsThermalIndicator={ingredientsThermalIndicator}
                    ingredientsLayout={ingredientsLayout}
                    ingredientsHerbPinyin={ingredientsHerbPinyin}
                    ingredientsHerbLatin={ingredientsHerbLatin}
                    ingredientsHerbHanzi={ingredientsHerbHanzi}
                    ingredientsHerbOrder={ingredientsHerbOrder}
                    ingredientsFormulaPinyin={ingredientsFormulaPinyin}
                    ingredientsFormulaPharmaceutical={ingredientsFormulaPharmaceutical}
                    ingredientsFormulaHanzi={ingredientsFormulaHanzi}
                    ingredientsFormulaOrder={ingredientsFormulaOrder}
                    onHerbClick={(herbName) => {
                      onNavigate({ type: 'herb', name: herbName });
                    }}
                    onFormulaClick={(formulaId) => {
                      const targetFormula = formulasData.find(f => f.formula_id === formulaId);
                      if (targetFormula) {
                        onNavigate({ type: 'formula', name: targetFormula.pinyin_name });
                      }
                    }}
                    showAdminActions={showAdminActions}
                    onEdit={onEditFormula ? () => onEditFormula(formula.formula_id) : undefined}
                    onDelete={onDeleteFormula ? () => onDeleteFormula(formula.formula_id) : undefined}
                    detailViewNameOrder={formulaDetailViewNameOrder}
                    detailViewPinyin={formulaDetailViewPinyin}
                    detailViewPharmaceutical={formulaDetailViewPharmaceutical}
                    detailViewAlternative={formulaDetailViewAlternative}
                    detailViewHanzi={formulaDetailViewHanzi}
                  />
                );
              })()
            ) : (
              (() => {
                const prescription = prescriptionsData.find(p => p.id === currentItem.prescriptionId);
                if (!prescription) return <p className="text-gray-500">Prescription not found</p>;
                
                return (
                  <PrescriptionDetails
                    prescription={prescription}
                    onClose={onClose}
                    showCloseButton={!canGoBack}
                    displayConfig={prescriptionDisplayConfig}
                    onHerbClick={(herbName) => {
                      const currentScrollPosition = scrollContainerRef.current?.scrollTop || 0;
                      onNavigate({ type: 'herb', name: herbName }, currentScrollPosition);
                    }}
                    onFormulaClick={(formulaName) => {
                      const targetFormula = formulasData.find(f => f.pinyin_name === formulaName);
                      if (targetFormula) {
                        const currentScrollPosition = scrollContainerRef.current?.scrollTop || 0;
                        onNavigate({ type: 'formula', name: targetFormula.pinyin_name }, currentScrollPosition);
                      }
                    }}
                    onEdit={onEditPrescription ? () => onEditPrescription(prescription.id) : undefined}
                    onDelete={onDeletePrescription ? () => onDeletePrescription(prescription.id) : undefined}
                    copied={copied}
                    onCopyStateChange={setCopied}
                  />
                );
              })()
            )}
          </div>

          {/* Navigation footer - Mobile and Desktop */}
          {(allItems.length > 0 || canGoBack || currentItem?.type === 'prescription') && (
            <div className="fixed sm:absolute bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 px-4 sm:px-6 py-4 z-10">
              {canGoBack ? (
                // Mode: Deep navigation - Show only back button (centered)
                <div className="flex justify-center">
                  <button
                    onClick={onGoBack}
                    className="h-11 w-11 rounded-full border bg-white border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900 flex items-center justify-center transition-colors"
                    title="Go back"
                  >
                    <Undo2 className="w-5 h-5" />
                  </button>
                </div>
              ) : currentItem?.type === 'prescription' ? (
                // Mode: Prescription - Show copy button + optional navigation
                <div className="flex justify-between items-center gap-3">
                  {/* Previous item in list (if list exists) */}
                  {allItems.length > 0 ? (
                    <button
                      onClick={onNavigatePrevious}
                      disabled={!hasPrevious}
                      className={`h-11 w-11 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${
                        hasPrevious
                          ? 'bg-white border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                          : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      title="Previous item"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  ) : <div />}

                  {/* Copy button */}
                  <button
                    onClick={async () => {
                      const prescription = prescriptionsData.find(p => p.id === currentItem.prescriptionId);
                      if (prescription) {
                        // We'll trigger the copy from PrescriptionDetails
                        const copyButton = document.querySelector('[data-prescription-copy-trigger]') as HTMLButtonElement;
                        if (copyButton) copyButton.click();
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 h-11 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>

                  {/* Next item in list (if list exists) */}
                  {allItems.length > 0 ? (
                    <button
                      onClick={onNavigateNext}
                      disabled={!hasNext}
                      className={`h-11 w-11 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${
                        hasNext
                          ? 'bg-white border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                          : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      title="Next item"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  ) : <div />}
                </div>
              ) : (
                // Mode: List navigation - Show only previous/next buttons (herbs/formulas)
                <div className="flex justify-between items-center gap-3">
                  {/* Previous item in list */}
                  <button
                    onClick={onNavigatePrevious}
                    disabled={!hasPrevious}
                    className={`h-11 w-11 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${
                      hasPrevious
                        ? 'bg-white border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    title="Previous item"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Next item in list */}
                  <button
                    onClick={onNavigateNext}
                    disabled={!hasNext}
                    className={`h-11 w-11 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${
                      hasNext
                        ? 'bg-white border-gray-200 hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    title="Next item"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}