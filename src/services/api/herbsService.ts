/**
 * Herbs Service
 * 
 * Handles all herb-related data operations.
 * Currently uses localStorage for mock data.
 * When migrating to Supabase, only this file needs to be updated.
 */

import type { Herb, ApiResponse, PaginationParams, FilterParams } from '@/types';
import { herbsData } from '@/app/data/herbs';

// ============================================================================
// STORAGE KEYS
// ============================================================================

const CUSTOM_HERBS_KEY = 'tcm_custom_herbs';
const SYSTEM_HERBS_OVERRIDES_KEY = 'tcm_system_herbs_overrides';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get custom herbs from localStorage
 */
function getCustomHerbs(): Herb[] {
  try {
    const stored = localStorage.getItem(CUSTOM_HERBS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading custom herbs:', error);
    return [];
  }
}

/**
 * Get system herb overrides from localStorage
 */
function getSystemHerbsOverrides(): Record<string, Herb> {
  try {
    const stored = localStorage.getItem(SYSTEM_HERBS_OVERRIDES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading herb overrides:', error);
    return {};
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get all herbs (system + custom)
 */
export async function getAllHerbs(
  filters?: FilterParams,
  pagination?: PaginationParams
): Promise<ApiResponse<Herb[]>> {
  try {
    // TODO: Replace with Supabase query
    // const query = supabase
    //   .from('herbs')
    //   .select('*', { count: 'exact' });
    // 
    // if (filters?.category) {
    //   query.in('category', filters.category);
    // }
    // 
    // if (pagination?.limit) {
    //   query.limit(pagination.limit);
    // }
    // 
    // const { data, error, count } = await query;

    // Mock implementation
    const customHerbs = getCustomHerbs();
    const overrides = getSystemHerbsOverrides();

    // Apply overrides to system herbs
    const systemHerbs = herbsData.map(herb => 
      overrides[herb.herb_id] || herb
    );

    // Combine and deduplicate
    const deduped = new Map<string, Herb>();
    
    systemHerbs.forEach(herb => {
      deduped.set(herb.herb_id, herb);
    });
    
    customHerbs.forEach(herb => {
      deduped.set(herb.herb_id, herb);
    });

    let allHerbs = Array.from(deduped.values());

    // Apply filters (mock)
    if (filters?.category && filters.category.length > 0) {
      allHerbs = allHerbs.filter(h => 
        h.category && filters.category!.includes(h.category)
      );
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      allHerbs = allHerbs.filter(h =>
        h.pinyin_name.toLowerCase().includes(searchLower) ||
        h.hanzi_name?.toLowerCase().includes(searchLower) ||
        h.pharmaceutical_name?.toLowerCase().includes(searchLower) ||
        h.english_name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination (mock)
    const total = allHerbs.length;
    if (pagination?.limit) {
      const offset = ((pagination.page || 1) - 1) * pagination.limit;
      allHerbs = allHerbs.slice(offset, offset + pagination.limit);
    }

    return {
      success: true,
      data: allHerbs,
      meta: {
        total,
        page: pagination?.page || 1,
        limit: pagination?.limit || total,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to load herbs',
        code: 'FETCH_HERBS_ERROR',
      },
    };
  }
}

/**
 * Get a single herb by ID
 */
export async function getHerbById(herbId: string): Promise<ApiResponse<Herb>> {
  try {
    // TODO: Replace with Supabase query
    // const { data, error } = await supabase
    //   .from('herbs')
    //   .select('*')
    //   .eq('herb_id', herbId)
    //   .single();

    // Mock implementation
    const result = await getAllHerbs();
    if (!result.success || !result.data) {
      return {
        success: false,
        error: {
          message: 'Herb not found',
          code: 'HERB_NOT_FOUND',
        },
      };
    }

    const herb = result.data.find(h => h.herb_id === herbId);
    if (!herb) {
      return {
        success: false,
        error: {
          message: 'Herb not found',
          code: 'HERB_NOT_FOUND',
        },
      };
    }

    return {
      success: true,
      data: herb,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to load herb',
        code: 'FETCH_HERB_ERROR',
      },
    };
  }
}

/**
 * Create a new herb
 */
export async function createHerb(
  herb: Omit<Herb, 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<Herb>> {
  try {
    // TODO: Replace with Supabase insert
    // const { data, error } = await supabase
    //   .from('herbs')
    //   .insert([herb])
    //   .select()
    //   .single();

    // Mock implementation
    const customHerbs = getCustomHerbs();
    
    const newHerb: Herb = {
      ...herb,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    customHerbs.push(newHerb);
    localStorage.setItem(CUSTOM_HERBS_KEY, JSON.stringify(customHerbs));

    // Dispatch update event
    window.dispatchEvent(new Event('herbs-updated'));

    return {
      success: true,
      data: newHerb,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to create herb',
        code: 'CREATE_HERB_ERROR',
      },
    };
  }
}

/**
 * Update an existing herb
 */
export async function updateHerb(
  herbId: string,
  updates: Partial<Herb>
): Promise<ApiResponse<Herb>> {
  try {
    // TODO: Replace with Supabase update
    // const { data, error } = await supabase
    //   .from('herbs')
    //   .update({ ...updates, updatedAt: new Date().toISOString() })
    //   .eq('herb_id', herbId)
    //   .select()
    //   .single();

    // Mock implementation
    const customHerbs = getCustomHerbs();
    const overrides = getSystemHerbsOverrides();

    // Check if it's a custom herb
    const customIndex = customHerbs.findIndex(h => h.herb_id === herbId);
    if (customIndex !== -1) {
      customHerbs[customIndex] = {
        ...customHerbs[customIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(CUSTOM_HERBS_KEY, JSON.stringify(customHerbs));

      window.dispatchEvent(new Event('herbs-updated'));

      return {
        success: true,
        data: customHerbs[customIndex],
      };
    }

    // Check if it's a system herb
    const systemHerb = herbsData.find(h => h.herb_id === herbId);
    if (systemHerb) {
      const updatedHerb: Herb = {
        ...systemHerb,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      overrides[herbId] = updatedHerb;
      localStorage.setItem(SYSTEM_HERBS_OVERRIDES_KEY, JSON.stringify(overrides));

      window.dispatchEvent(new Event('herbs-updated'));

      return {
        success: true,
        data: updatedHerb,
      };
    }

    return {
      success: false,
      error: {
        message: 'Herb not found',
        code: 'HERB_NOT_FOUND',
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to update herb',
        code: 'UPDATE_HERB_ERROR',
      },
    };
  }
}

/**
 * Delete a herb (only custom herbs can be deleted)
 */
export async function deleteHerb(herbId: string): Promise<ApiResponse<void>> {
  try {
    // TODO: Replace with Supabase delete
    // const { error } = await supabase
    //   .from('herbs')
    //   .delete()
    //   .eq('herb_id', herbId);

    // Mock implementation - only delete custom herbs
    const customHerbs = getCustomHerbs();
    const index = customHerbs.findIndex(h => h.herb_id === herbId);

    if (index === -1) {
      return {
        success: false,
        error: {
          message: 'Cannot delete system herbs',
          code: 'DELETE_SYSTEM_HERB_ERROR',
        },
      };
    }

    customHerbs.splice(index, 1);
    localStorage.setItem(CUSTOM_HERBS_KEY, JSON.stringify(customHerbs));

    window.dispatchEvent(new Event('herbs-updated'));

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to delete herb',
        code: 'DELETE_HERB_ERROR',
      },
    };
  }
}

/**
 * Search herbs by name (with normalization)
 */
export async function searchHerbsByName(
  query: string
): Promise<ApiResponse<Herb[]>> {
  try {
    // TODO: Replace with Supabase full-text search
    // const { data, error } = await supabase
    //   .from('herbs')
    //   .select('*')
    //   .or(`pinyin_name.ilike.%${query}%,pharmaceutical_name.ilike.%${query}%,hanzi_name.ilike.%${query}%`);

    return await getAllHerbs({ search: query });
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Search failed',
        code: 'SEARCH_ERROR',
      },
    };
  }
}

/**
 * Get herbs by category
 */
export async function getHerbsByCategory(
  category: string
): Promise<ApiResponse<Herb[]>> {
  try {
    // TODO: Replace with Supabase query
    // const { data, error } = await supabase
    //   .from('herbs')
    //   .select('*')
    //   .eq('category', category);

    return await getAllHerbs({ category: [category] });
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to load herbs by category',
        code: 'FETCH_CATEGORY_ERROR',
      },
    };
  }
}

/**
 * Subscribe to herbs changes
 */
export function onHerbsChange(callback: () => void): () => void {
  // TODO: Replace with Supabase realtime subscription
  // const subscription = supabase
  //   .channel('herbs_changes')
  //   .on('postgres_changes', { event: '*', schema: 'public', table: 'herbs' }, callback)
  //   .subscribe();
  // 
  // return () => supabase.removeChannel(subscription);

  // Mock implementation
  window.addEventListener('herbs-updated', callback);
  return () => window.removeEventListener('herbs-updated', callback);
}
