/**
 * Prescriptions Service
 *
 * Handles all prescription-related data operations.
 * Uses Supabase for authenticated users, localStorage as fallback.
 */

import type { Prescription, ApiResponse, PaginationParams, FilterParams } from '@/types';
import { supabase } from '@/app/lib/supabase';

// ============================================================================
// STORAGE KEYS
// ============================================================================

const PRESCRIPTIONS_KEY = 'tcm_prescriptions';
const USER_ID_KEY = 'tcm_user_id';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get or create a persistent user ID
 */
function getPersistentUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

/**
 * Get current user ID (Supabase user ID, email if logged in, or persistent browser ID)
 */
async function getCurrentUserId(): Promise<string> {
  try {
    // Check for Supabase session first
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      return session.user.id;
    }

    // Fallback to userProfile email for demo users
    const userProfile = localStorage.getItem('userProfile');
    if (userProfile) {
      const profile = JSON.parse(userProfile);
      return profile.email;
    }
  } catch (error) {
    console.error('Error getting user ID:', error);
  }
  return getPersistentUserId();
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get all prescriptions for the current user
 */
export async function getAllPrescriptions(
  filters?: FilterParams,
  pagination?: PaginationParams
): Promise<ApiResponse<Prescription[]>> {
  try {
    console.log('💉 getAllPrescriptions called');

    const stored = localStorage.getItem(PRESCRIPTIONS_KEY);
    let prescriptions: Prescription[] = [];

    if (stored) {
      prescriptions = JSON.parse(stored).map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
      }));
    }

    // Filter by current user
    const currentUserId = await getCurrentUserId();
    prescriptions = prescriptions.filter(
      p => p.createdBy?.userId === currentUserId || p.createdBy?.userEmail === currentUserId
    );

    // Apply search filter
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      prescriptions = prescriptions.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.comments.toLowerCase().includes(searchLower)
      );
    }

    // Sort by date (newest first)
    prescriptions.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA;
    });

    const total = prescriptions.length;

    // Apply pagination
    if (pagination?.limit) {
      const offset = ((pagination.page || 1) - 1) * pagination.limit;
      prescriptions = prescriptions.slice(offset, offset + pagination.limit);
    }

    return {
      success: true,
      data: prescriptions,
      meta: {
        total,
        page: pagination?.page || 1,
        limit: pagination?.limit || total,
      },
    };
  } catch (error: any) {
    console.error('❌ Error getting prescriptions:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Failed to load prescriptions',
        code: 'FETCH_PRESCRIPTIONS_ERROR',
      },
    };
  }
}

/**
 * Get a single prescription by ID
 */
export async function getPrescriptionById(
  prescriptionId: string
): Promise<ApiResponse<Prescription>> {
  try {
    // TODO: Replace with Supabase query
    // const { data, error } = await supabase
    //   .from('prescriptions')
    //   .select('*')
    //   .eq('id', prescriptionId)
    //   .single();

    const result = await getAllPrescriptions();
    if (!result.success || !result.data) {
      return {
        success: false,
        error: {
          message: 'Prescription not found',
          code: 'PRESCRIPTION_NOT_FOUND',
        },
      };
    }

    const prescription = result.data.find(p => p.id === prescriptionId);
    if (!prescription) {
      return {
        success: false,
        error: {
          message: 'Prescription not found',
          code: 'PRESCRIPTION_NOT_FOUND',
        },
      };
    }

    return {
      success: true,
      data: prescription,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        message: error.message || 'Failed to load prescription',
        code: 'FETCH_PRESCRIPTION_ERROR',
      },
    };
  }
}

/**
 * Create a new prescription
 */
export async function createPrescription(
  prescription: Omit<Prescription, 'id' | 'createdAt'>
): Promise<ApiResponse<Prescription>> {
  try {
    console.log('💉 createPrescription called');

    const { data: { session } } = await supabase.auth.getSession();
    const currentUserId = await getCurrentUserId();
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');

    const prescriptionId = `rx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const createdAt = new Date();

    const newPrescription: Prescription = {
      ...prescription,
      id: prescriptionId,
      createdAt,
      createdBy: {
        userId: currentUserId,
        userName: `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim() || 'User',
        userEmail: userProfile.email || currentUserId,
      },
    };

    // Save to Supabase if user is authenticated
    if (session?.user) {
      console.log('💉 Attempting to save to Supabase...');

      const { data, error } = await supabase
        .from('prescriptions')
        .insert({
          prescription_id: prescriptionId,
          name: prescription.name,
          patient_name: prescription.patientName,
          patient_age: prescription.patientAge,
          patient_gender: prescription.patientGender,
          diagnosis: prescription.diagnosis,
          herbs: prescription.herbs,
          instructions: prescription.instructions,
          comments: prescription.comments,
          user_id: session.user.id,
          created_at: createdAt.toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error saving prescription to Supabase:', error);
      } else {
        console.log('✅ Prescription saved to Supabase successfully:', data);
      }
    } else {
      console.log('⚠️ No Supabase session - saving only to localStorage');
    }

    // Save to localStorage
    const stored = localStorage.getItem(PRESCRIPTIONS_KEY);
    const prescriptions: Prescription[] = stored ? JSON.parse(stored) : [];
    prescriptions.push(newPrescription);
    localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(prescriptions));
    console.log('✅ Prescription saved to localStorage');

    window.dispatchEvent(new Event('prescriptions-updated'));

    return {
      success: true,
      data: newPrescription,
    };
  } catch (error: any) {
    console.error('❌ Error creating prescription:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Failed to create prescription',
        code: 'CREATE_PRESCRIPTION_ERROR',
      },
    };
  }
}

/**
 * Update an existing prescription
 */
export async function updatePrescription(
  prescriptionId: string,
  updates: Partial<Prescription>
): Promise<ApiResponse<Prescription>> {
  try {
    console.log('💉 updatePrescription called with:', prescriptionId);

    const { data: { session } } = await supabase.auth.getSession();

    // Update in Supabase if user is authenticated
    if (session?.user) {
      console.log('💉 Attempting to update in Supabase...');

      const supabaseUpdates: any = {};
      if (updates.name !== undefined) supabaseUpdates.name = updates.name;
      if (updates.patientName !== undefined) supabaseUpdates.patient_name = updates.patientName;
      if (updates.patientAge !== undefined) supabaseUpdates.patient_age = updates.patientAge;
      if (updates.patientGender !== undefined) supabaseUpdates.patient_gender = updates.patientGender;
      if (updates.diagnosis !== undefined) supabaseUpdates.diagnosis = updates.diagnosis;
      if (updates.herbs !== undefined) supabaseUpdates.herbs = updates.herbs;
      if (updates.instructions !== undefined) supabaseUpdates.instructions = updates.instructions;
      if (updates.comments !== undefined) supabaseUpdates.comments = updates.comments;

      const { data, error } = await supabase
        .from('prescriptions')
        .update(supabaseUpdates)
        .eq('prescription_id', prescriptionId)
        .eq('user_id', session.user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating prescription in Supabase:', error);
      } else {
        console.log('✅ Prescription updated in Supabase successfully:', data);
      }
    }

    // Update in localStorage
    const stored = localStorage.getItem(PRESCRIPTIONS_KEY);
    if (!stored) {
      return {
        success: false,
        error: {
          message: 'Prescription not found',
          code: 'PRESCRIPTION_NOT_FOUND',
        },
      };
    }

    const prescriptions: Prescription[] = JSON.parse(stored);
    const index = prescriptions.findIndex(p => p.id === prescriptionId);

    if (index === -1) {
      return {
        success: false,
        error: {
          message: 'Prescription not found',
          code: 'PRESCRIPTION_NOT_FOUND',
        },
      };
    }

    prescriptions[index] = {
      ...prescriptions[index],
      ...updates,
      id: prescriptionId, // Ensure ID doesn't change
    };

    localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(prescriptions));
    console.log('✅ Prescription updated in localStorage');

    window.dispatchEvent(new Event('prescriptions-updated'));

    return {
      success: true,
      data: prescriptions[index],
    };
  } catch (error: any) {
    console.error('❌ Error updating prescription:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Failed to update prescription',
        code: 'UPDATE_PRESCRIPTION_ERROR',
      },
    };
  }
}

/**
 * Delete a prescription
 */
export async function deletePrescription(
  prescriptionId: string
): Promise<ApiResponse<void>> {
  try {
    console.log('💉 deletePrescription called with:', prescriptionId);

    const { data: { session } } = await supabase.auth.getSession();

    // Delete from Supabase if user is authenticated
    if (session?.user) {
      console.log('💉 Attempting to delete from Supabase...');

      const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('prescription_id', prescriptionId)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('❌ Error deleting prescription from Supabase:', error);
      } else {
        console.log('✅ Prescription deleted from Supabase successfully');
      }
    }

    // Delete from localStorage
    const stored = localStorage.getItem(PRESCRIPTIONS_KEY);
    if (!stored) {
      return {
        success: false,
        error: {
          message: 'Prescription not found',
          code: 'PRESCRIPTION_NOT_FOUND',
        },
      };
    }

    const prescriptions: Prescription[] = JSON.parse(stored);
    const index = prescriptions.findIndex(p => p.id === prescriptionId);

    if (index === -1) {
      return {
        success: false,
        error: {
          message: 'Prescription not found',
          code: 'PRESCRIPTION_NOT_FOUND',
        },
      };
    }

    prescriptions.splice(index, 1);
    localStorage.setItem(PRESCRIPTIONS_KEY, JSON.stringify(prescriptions));
    console.log('✅ Prescription deleted from localStorage');

    window.dispatchEvent(new Event('prescriptions-updated'));

    return {
      success: true,
    };
  } catch (error: any) {
    console.error('❌ Error deleting prescription:', error);
    return {
      success: false,
      error: {
        message: error.message || 'Failed to delete prescription',
        code: 'DELETE_PRESCRIPTION_ERROR',
      },
    };
  }
}

/**
 * Search prescriptions
 */
export async function searchPrescriptions(
  query: string
): Promise<ApiResponse<Prescription[]>> {
  try {
    // TODO: Replace with Supabase full-text search
    return await getAllPrescriptions({ search: query });
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
 * Subscribe to prescriptions changes
 */
export function onPrescriptionsChange(callback: () => void): () => void {
  // TODO: Replace with Supabase realtime subscription
  window.addEventListener('prescriptions-updated', callback);
  return () => window.removeEventListener('prescriptions-updated', callback);
}
