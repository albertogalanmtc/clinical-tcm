import { useState, useCallback } from 'react';

export type ModalItem = {
  type: 'herb' | 'formula' | 'prescription';
  name: string;
  parentFormula?: string;
  prescriptionId?: string; // For prescriptions
  scrollPosition?: number; // Store scroll position for back navigation
  listIndex?: number; // Current index in the filtered list for navigation
};

export function useModalNavigation() {
  const [navigationStack, setNavigationStack] = useState<ModalItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const isOpen = navigationStack.length > 0 && currentIndex >= 0;
  const currentItem = currentIndex >= 0 ? navigationStack[currentIndex] : null;
  const canGoBack = currentIndex > 0;

  const navigateTo = useCallback((item: ModalItem, currentScrollPosition?: number) => {
    setNavigationStack(prev => {
      // Remove any items after current index (when navigating from middle of stack)
      const newStack = prev.slice(0, currentIndex + 1);

      // Save scroll position of current item before navigating forward
      if (currentIndex >= 0 && currentScrollPosition !== undefined) {
        newStack[currentIndex] = { ...newStack[currentIndex], scrollPosition: currentScrollPosition };
      }

      return [...newStack, item];
    });
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);

  const goBack = useCallback(() => {
    if (canGoBack) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [canGoBack]);

  const close = useCallback(() => {
    setNavigationStack([]);
    setCurrentIndex(-1);
  }, []);

  const reset = useCallback((item: ModalItem) => {
    setNavigationStack([item]);
    setCurrentIndex(0);
  }, []);

  // Replace current item without adding to history (for list navigation)
  const replaceCurrentItem = useCallback((item: ModalItem) => {
    setNavigationStack(prev => {
      const newStack = [...prev];
      newStack[currentIndex] = item;
      return newStack;
    });
  }, [currentIndex]);

  return {
    isOpen,
    currentItem,
    canGoBack,
    navigateTo,
    goBack,
    close,
    reset,
    replaceCurrentItem,
  };
}