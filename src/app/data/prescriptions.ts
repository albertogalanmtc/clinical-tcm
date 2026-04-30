import { supabase } from '../lib/supabase';

export interface PrescriptionComponent {
  type: 'herb' | 'formula';
  name: string;
  dosage: string;
  subComponents?: { name: string; dosage: string }[]; // For compound formulas
}

export interface Prescription {
  id: string;
  name: string;
  components: PrescriptionComponent[];
  comments: string;
  alertMode?: 'all' | 'filtered';
  patientSafetyProfile?: {
    pregnancy?: boolean;
    breastfeeding?: boolean;
    insomnia?: boolean;
    epilepsy?: boolean;
    bleeding_disorders?: boolean;
    liver_disease?: boolean;
    kidney_disease?: boolean;
    anticoagulants?: boolean;
    antihypertensives?: boolean;
    hypoglycemics?: boolean;
    immunosuppressants?: boolean;
    antidepressants?: boolean;
    antiplatelets?: boolean;
    beta_blockers?: boolean;
    diuretics?: boolean;
    corticosteroids?: boolean;
    sedatives?: boolean;
    shellfish?: boolean;
    gluten?: boolean;
    nuts?: boolean;
    dairy?: boolean;
    soy?: boolean;
    asteraceae?: boolean;
    apiaceae?: boolean;
  };
  safetyFilters?: any;
  createdAt: Date;
  createdBy?: {
    userId: string;
    userName: string;
    userEmail: string;
  };
}

// Store prescriptions in localStorage (fallback/cache)
const STORAGE_KEY = 'tcm_prescriptions';
const USER_ID_KEY = 'tcm_user_id';

// Get or create a persistent user ID for this browser
function getPersistentUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    // Generate a unique ID for this browser session
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

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
  return getPersistentUserId();
}

export async function getPrescriptions(): Promise<Prescription[]> {
  console.log('💉 getPrescriptions called');

  try {
    // Try to load from Supabase first
    const { data: { session } } = await supabase.auth.getSession();

    console.log('💉 Session user:', session?.user?.email || 'No session');

    if (session?.user) {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading prescriptions from Supabase:', error);
        // Fallback to localStorage
      } else if (data) {
        console.log('✅ Loaded from Supabase:', data.length, 'prescriptions');
        console.log('📋 Raw Supabase data:', data);

        // Convert Supabase data to Prescription format
        const prescriptions = data.map((p: any) => ({
          id: p.id,
          name: p.patient_name || 'Untitled Prescription',
          components: [
            ...(p.herbs || []),
            ...(p.formulas || [])
          ],
          comments: p.notes || '',
          patientSafetyProfile: p.patient_safety_profile || undefined,
          createdAt: new Date(p.created_at),
          createdBy: {
            userId: p.user_id,
            userName: 'User',
            userEmail: session.user.email || ''
          }
        }));

        console.log('📋 Converted prescriptions:', prescriptions);

        // Update localStorage cache
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prescriptions));

        return prescriptions;
      }
    } else {
      console.log('⚠️ No Supabase session - loading from localStorage only');
    }
  } catch (error) {
    console.error('❌ Exception loading prescriptions from Supabase:', error);
  }

  // Fallback to localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const prescriptions = JSON.parse(stored);
      console.log('📋 Loaded from localStorage:', prescriptions.length, 'prescriptions');
      return prescriptions.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt)
      }));
    }
  } catch (error) {
    console.error('❌ Error loading prescriptions from localStorage:', error);
  }

  console.log('⚠️ No prescriptions found');
  return [];
}

// Synchronous version for compatibility (loads from localStorage only)
export function getPrescriptionsSync(): Prescription[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const prescriptions = JSON.parse(stored);
      return prescriptions.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt)
      }));
    }
  } catch (error) {
    console.error('Error loading prescriptions:', error);
  }
  return [];
}

export async function savePrescription(prescription: Omit<Prescription, 'id' | 'createdAt'>): Promise<Prescription> {
  console.log('💉 savePrescription called');
  const prescriptions = await getPrescriptions();

  // Get current user ID (now async)
  async function getCurrentUserIdAsync(): Promise<string> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        return session.user.id;
      }
      const userProfile = localStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        return profile.email;
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
    }
    return getPersistentUserId();
  }

  const currentUserId = await getCurrentUserIdAsync();

  // Get current user info from localStorage
  let createdBy: { userId: string; userName: string; userEmail: string };
  try {
    const userProfile = localStorage.getItem('userProfile');
    const userRole = localStorage.getItem('userRole');

    if (userProfile) {
      const profile = JSON.parse(userProfile);
      createdBy = {
        userId: currentUserId, // Use the consistent user ID
        userName: `${profile.firstName} ${profile.lastName}`.trim() || profile.email,
        userEmail: profile.email
      };
    } else if (userRole) {
      // Fallback if no profile but role exists
      createdBy = {
        userId: currentUserId,
        userName: userRole === 'admin' ? 'Admin User' : 'User',
        userEmail: ''
      };
    } else {
      // If no user is logged in, use persistent browser ID
      createdBy = {
        userId: currentUserId,
        userName: 'Local User',
        userEmail: ''
      };
    }
  } catch (error) {
    console.error('Error getting user info:', error);
    // Create default user on error
    createdBy = {
      userId: currentUserId,
      userName: 'Local User',
      userEmail: ''
    };
  }

  const newPrescription: Prescription = {
    ...prescription,
    id: Date.now().toString(),
    createdAt: new Date(),
    createdBy // Add createdBy info automatically
  };

  // Save to localStorage (for offline/fallback)
  prescriptions.push(newPrescription);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prescriptions));

  // Save to Supabase if user is authenticated
  try {
    const { data: { session } } = await supabase.auth.getSession();

    console.log('💉 Session user:', session?.user?.email || 'No session');

    if (session?.user) {
      console.log('💉 Attempting to save to Supabase...');

      const supabaseData = {
        user_id: session.user.id,
        patient_name: newPrescription.name,
        herbs: prescription.components.filter(c => c.type === 'herb'),
        formulas: prescription.components.filter(c => c.type === 'formula'),
        notes: prescription.comments,
        patient_safety_profile: prescription.patientSafetyProfile || null,
      };

      console.log('💉 Data to insert:', supabaseData);

      const { data, error } = await supabase
        .from('prescriptions')
        .insert(supabaseData)
        .select();

      if (error) {
        console.error('❌ Error saving prescription to Supabase:', error);
        console.error('❌ Error details:', error.message, error.details, error.hint);
        // Don't block the flow, prescription is still saved in localStorage
      } else {
        console.log('✅ Prescription saved to Supabase successfully:', data);
        // Update newPrescription.id with the Supabase UUID
        if (data && data[0]) {
          newPrescription.id = data[0].id;
        }
      }
    } else {
      console.log('⚠️ No Supabase session - saving only to localStorage');
    }
  } catch (error) {
    console.error('❌ Exception saving prescription to Supabase:', error);
    // Don't block the flow
  }

  // Dispatch custom event to notify other components
  window.dispatchEvent(new CustomEvent('prescriptions-updated'));

  return newPrescription;
}

export async function updatePrescription(id: string, updates: Omit<Prescription, 'id' | 'createdAt'>): Promise<Prescription | null> {
  console.log('💉 updatePrescription called with:', id);

  const prescriptions = getPrescriptionsSync();
  const index = prescriptions.findIndex(p => p.id === id);

  if (index === -1) {
    return null;
  }

  const updatedPrescription: Prescription = {
    ...prescriptions[index],
    ...updates,
    id, // Keep the same ID
    createdAt: prescriptions[index].createdAt, // Keep original creation date
    createdBy: prescriptions[index].createdBy // Keep original creator info
  };

  // Update localStorage
  prescriptions[index] = updatedPrescription;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prescriptions));
  console.log('✅ Prescription updated in localStorage');

  // Update Supabase if user is authenticated
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      console.log('💉 Attempting to update in Supabase...');

      const { data, error } = await supabase
        .from('prescriptions')
        .update({
          patient_name: updatedPrescription.name,
          herbs: updates.components.filter(c => c.type === 'herb'),
          formulas: updates.components.filter(c => c.type === 'formula'),
          notes: updates.comments,
          patient_safety_profile: updates.patientSafetyProfile || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', session.user.id)
        .select();

      if (error) {
        console.error('❌ Error updating prescription in Supabase:', error);
      } else {
        console.log('✅ Prescription updated in Supabase successfully:', data);
      }
    } else {
      console.log('⚠️ No Supabase session - updated only in localStorage');
    }
  } catch (error) {
    console.error('❌ Exception updating prescription in Supabase:', error);
  }

  // Dispatch custom event to notify other components
  window.dispatchEvent(new CustomEvent('prescriptions-updated'));

  return updatedPrescription;
}

export async function deletePrescription(id: string): Promise<void> {
  console.log('💉 deletePrescription called with:', id);

  // Delete from localStorage
  const prescriptions = getPrescriptionsSync().filter(p => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prescriptions));
  console.log('✅ Prescription deleted from localStorage');

  // Delete from Supabase if user is authenticated
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      console.log('💉 Attempting to delete from Supabase...');

      const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', session.user.id);

      if (error) {
        console.error('❌ Error deleting prescription from Supabase:', error);
      } else {
        console.log('✅ Prescription deleted from Supabase successfully');
      }
    } else {
      console.log('⚠️ No Supabase session - deleted only from localStorage');
    }
  } catch (error) {
    console.error('❌ Exception deleting prescription from Supabase:', error);
  }

  // Dispatch custom event to notify other components
  window.dispatchEvent(new CustomEvent('prescriptions-updated'));
}

export function getPrescriptionText(prescription: Prescription): string {
  let text = `${prescription.name}\\n\\n`;
  text += 'Components:\\n';
  prescription.components.forEach(comp => {
    text += `- ${comp.name} (${comp.dosage})\\n`;
    if (comp.subComponents) {
      comp.subComponents.forEach(subComp => {
        text += `  - ${subComp.name} (${subComp.dosage})\\n`;
      });
    }
  });
  if (prescription.comments) {
    text += `\\nComments:\\n${prescription.comments}`;
  }
  return text;
}

// Migration function to fix prescriptions with old userId format
export function migratePrescriptionsToCurrentUser(): number {
  const prescriptions = getPrescriptionsSync();
  const currentUserId = getCurrentUserId();
  let migratedCount = 0;

  // Find prescriptions that don't have a proper userId or have the old default user
  const needsMigration = prescriptions.filter(p =>
    !p.createdBy ||
    p.createdBy.userId === 'default-user' ||
    p.createdBy.userId === 'admin' ||
    p.createdBy.userId === 'user' ||
    p.createdBy.userEmail === 'default@local'
  );

  if (needsMigration.length > 0) {
    // Update these prescriptions to use current user ID
    const updatedPrescriptions = prescriptions.map(p => {
      if (needsMigration.includes(p)) {
        migratedCount++;
        return {
          ...p,
          createdBy: {
            userId: currentUserId,
            userName: p.createdBy?.userName || 'Local User',
            userEmail: p.createdBy?.userEmail || ''
          }
        };
      }
      return p;
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPrescriptions));
    window.dispatchEvent(new CustomEvent('prescriptions-updated'));
  }

  return migratedCount;
}