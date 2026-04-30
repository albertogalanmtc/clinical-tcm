/**
 * Formulas Service
 * 
 * Handles all formula-related data operations.
 * Currently uses localStorage for mock data.
 * When migrating to Supabase, only this file needs to be updated.
 */

import type { Formula, ApiResponse, PaginationParams, FilterParams } from '@/types';
import { formulasData } from '@/app/data/formulas';

// ============================================================================
// STORAGE KEYS
// ============================================================================

const CUSTOM_FORMULAS_KEY = 'tcm_custom_formulas';
const SYSTEM_FORMULAS_OVERRIDES_KEY = 'tcm_system_formulas_overrides';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCustomFormulas(): Formula[] {
  try {
    const stored = localStorage.getItem(CUSTOM_FORMULAS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading custom formulas:', error);
    return [];
  }
}

function getSystemFormulasOverrides(): Record<string, Formula> {
  try {
    const stored = localStorage.getItem(SYSTEM_FORMULAS_OVERRIDES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading formula overrides:', error);
    return {};
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get all formulas (system + custom)
 */
export async function getAllFormulas(
  filters?: FilterParams,
  pagination?: PaginationParams
): Promise<ApiResponse<Formula[]>> {
  try {
    // TODO: Replace with Supabase query
    // const query = supabase
    //   .from('formulas')
    //   .select('*', { count: 'exact' });

    const customFormulas = getCustomFormulas();
    const overrides = getSystemFormulasOverrides();

    const systemFormulas = formulasData.map(formula =>
      overrides[formula.formula_id] || formula
    );

    const deduped = new Map<string, Formula>();

    systemFormulas.forEach(formula => {
      deduped.set(formula.formula_id, formula);
    });

    customFormulas.forEach(formula => {
      deduped.set(formula.formula_id, formula);
    });

    let allFormulas = Array.from(deduped.values());

    // Apply filters
    if (filters?.category && filters.category.length > 0) {
      allFormulas = allFormulas.filter(f =>
        f.category && filters.category!.includes(f.category)
      );
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      allFormulas = allFormulas.filter(f =>
        f.pinyin_name.toLowerCase().includes(searchLower) ||
        f.hanzi_name?.toLowerCase().includes(searchLower) ||
        f.translated_name?.toLowerCase().includes(searchLower)
      );
    }

    const total = allFormulas.length;
    if (pagination?.limit) {
      const offset = ((pagination.page || 1) - 1) * pagination.limit;
      allFormulas = allFormulas.slice(offset, offset + pagination.limit);
    }

    return {
      success: true,
      data: allFormulas,
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
        message: error.message || 'Failed to load formulas',
        code: 'FETCH_FORMULAS_ERROR',
      },
    };
  }
}

/**
 * Get a single formula by ID
 */
export async function getFormulaById(formulaId: string): Promise<ApiResponse<Formula>> {
  try {
    // TODO: Replace with Supabase query
    // const { data, error } = await supabase
    //   .from('formulas')
    //   .select('*')
    //   .eq('formula_id', formulaId)
    //   .single();

    const result = await getAllFormulas();
    if (!result.success || !result.data) {
      return {
        success: false,
        error: {
          message: 'Formula not found',
          code: 'FORMULA_NOT_FOUND',
        },
      };
    }

    const formula = result.data.find(f => f.formula_id === formulaId);
    if (!formula) {
      return {
        success: false,
        error: {
          message: 'Formula not found',
          code: 'FORMULA_NOT_FOUND',
        },
      };
    }

    return {
      success: true,
      data: formula,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to load formula',
        code: 'FETCH_FORMULA_ERROR',
      },
    };
  }
}

/**
 * Create a new formula
 */
export async function createFormula(
  formula: Omit<Formula, 'createdAt' | 'updatedAt'>
): Promise<ApiResponse<Formula>> {
  try {
    // TODO: Replace with Supabase insert
    // const { data, error } = await supabase
    //   .from('formulas')
    //   .insert([formula])
    //   .select()
    //   .single();

    const customFormulas = getCustomFormulas();

    const newFormula: Formula = {
      ...formula,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    customFormulas.push(newFormula);
    localStorage.setItem(CUSTOM_FORMULAS_KEY, JSON.stringify(customFormulas));

    window.dispatchEvent(new Event('formulas-updated'));

    return {
      success: true,
      data: newFormula,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to create formula',
        code: 'CREATE_FORMULA_ERROR',
      },
    };
  }
}

/**
 * Update an existing formula
 */
export async function updateFormula(
  formulaId: string,
  updates: Partial<Formula>
): Promise<ApiResponse<Formula>> {
  try {
    // TODO: Replace with Supabase update
    // const { data, error } = await supabase
    //   .from('formulas')
    //   .update({ ...updates, updatedAt: new Date().toISOString() })
    //   .eq('formula_id', formulaId)
    //   .select()
    //   .single();

    const customFormulas = getCustomFormulas();
    const overrides = getSystemFormulasOverrides();

    const customIndex = customFormulas.findIndex(f => f.formula_id === formulaId);
    if (customIndex !== -1) {
      customFormulas[customIndex] = {
        ...customFormulas[customIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(CUSTOM_FORMULAS_KEY, JSON.stringify(customFormulas));

      window.dispatchEvent(new Event('formulas-updated'));

      return {
        success: true,
        data: customFormulas[customIndex],
      };
    }

    const systemFormula = formulasData.find(f => f.formula_id === formulaId);
    if (systemFormula) {
      const updatedFormula: Formula = {
        ...systemFormula,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      overrides[formulaId] = updatedFormula;
      localStorage.setItem(SYSTEM_FORMULAS_OVERRIDES_KEY, JSON.stringify(overrides));

      window.dispatchEvent(new Event('formulas-updated'));

      return {
        success: true,
        data: updatedFormula,
      };
    }

    return {
      success: false,
      error: {
        message: 'Formula not found',
        code: 'FORMULA_NOT_FOUND',
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to update formula',
        code: 'UPDATE_FORMULA_ERROR',
      },
    };
  }
}

/**
 * Delete a formula (only custom formulas)
 */
export async function deleteFormula(formulaId: string): Promise<ApiResponse<void>> {
  try {
    // TODO: Replace with Supabase delete
    // const { error } = await supabase
    //   .from('formulas')
    //   .delete()
    //   .eq('formula_id', formulaId);

    const customFormulas = getCustomFormulas();
    const index = customFormulas.findIndex(f => f.formula_id === formulaId);

    if (index === -1) {
      return {
        success: false,
        error: {
          message: 'Cannot delete system formulas',
          code: 'DELETE_SYSTEM_FORMULA_ERROR',
        },
      };
    }

    customFormulas.splice(index, 1);
    localStorage.setItem(CUSTOM_FORMULAS_KEY, JSON.stringify(customFormulas));

    window.dispatchEvent(new Event('formulas-updated'));

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to delete formula',
        code: 'DELETE_FORMULA_ERROR',
      },
    };
  }
}

/**
 * Search formulas by name
 */
export async function searchFormulasByName(
  query: string
): Promise<ApiResponse<Formula[]>> {
  try {
    // TODO: Replace with Supabase full-text search
    return await getAllFormulas({ search: query });
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
 * Get formulas by category
 */
export async function getFormulasByCategory(
  category: string
): Promise<ApiResponse<Formula[]>> {
  try {
    // TODO: Replace with Supabase query
    return await getAllFormulas({ category: [category] });
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to load formulas by category',
        code: 'FETCH_CATEGORY_ERROR',
      },
    };
  }
}

/**
 * Subscribe to formulas changes
 */
export function onFormulasChange(callback: () => void): () => void {
  // TODO: Replace with Supabase realtime subscription
  window.addEventListener('formulas-updated', callback);
  return () => window.removeEventListener('formulas-updated', callback);
}
