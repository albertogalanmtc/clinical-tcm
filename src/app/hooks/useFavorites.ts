import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'tcm_favorites';
const FAVORITES_EVENT = 'favorites-updated';

interface Favorites {
  herbs: string[];
  formulas: string[];
}

// Helper to get favorites from localStorage
const getFavoritesFromStorage = (): Favorites => {
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading favorites:', error);
  }
  return { herbs: [], formulas: [] };
};

// Helper to save favorites to localStorage and notify all listeners
const saveFavoritesToStorage = (favorites: Favorites) => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    // Dispatch custom event to notify all components
    window.dispatchEvent(new CustomEvent(FAVORITES_EVENT, { detail: favorites }));
  } catch (error) {
    console.error('Error saving favorites:', error);
  }
};

export function useFavorites() {
  const [favorites, setFavorites] = useState<Favorites>(getFavoritesFromStorage);

  // Listen for favorites updates from other components
  useEffect(() => {
    const handleFavoritesUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<Favorites>;
      setFavorites(customEvent.detail);
    };

    window.addEventListener(FAVORITES_EVENT, handleFavoritesUpdate);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, handleFavoritesUpdate);
    };
  }, []);

  const toggleHerbFavorite = (herbId: string) => {
    const newFavorites = {
      ...favorites,
      herbs: favorites.herbs.includes(herbId)
        ? favorites.herbs.filter(id => id !== herbId)
        : [...favorites.herbs, herbId]
    };
    setFavorites(newFavorites);
    saveFavoritesToStorage(newFavorites);
  };

  const toggleFormulaFavorite = (formulaId: string) => {
    const newFavorites = {
      ...favorites,
      formulas: favorites.formulas.includes(formulaId)
        ? favorites.formulas.filter(id => id !== formulaId)
        : [...favorites.formulas, formulaId]
    };
    setFavorites(newFavorites);
    saveFavoritesToStorage(newFavorites);
  };

  const isHerbFavorite = (herbId: string) => favorites.herbs.includes(herbId);
  const isFormulaFavorite = (formulaId: string) => favorites.formulas.includes(formulaId);

  return {
    favorites,
    toggleHerbFavorite,
    toggleFormulaFavorite,
    isHerbFavorite,
    isFormulaFavorite
  };
}
