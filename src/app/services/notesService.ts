import { supabase } from '../lib/supabase';

const NOTES_STORAGE_KEY = 'tcm_floating_notes';

/**
 * Service to manage user clinical notes in Supabase
 */

// Get notes for current user
export async function getNotes(): Promise<string> {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      console.log('📝 Notes - No user session, using localStorage');
      // Fallback to localStorage for non-authenticated users
      return localStorage.getItem(NOTES_STORAGE_KEY) || '';
    }

    console.log('📝 Notes - Loading from Supabase for user:', session.user.id);

    const { data, error } = await supabase
      .from('user_notes')
      .select('content')
      .eq('user_id', session.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No notes found, return empty
        console.log('📝 Notes - No notes found in Supabase');
        return '';
      }
      console.error('❌ Error loading notes from Supabase:', error);
      // Fallback to localStorage
      return localStorage.getItem(NOTES_STORAGE_KEY) || '';
    }

    console.log('✅ Notes - Loaded from Supabase successfully');

    // Also save to localStorage for offline access
    if (data?.content) {
      localStorage.setItem(NOTES_STORAGE_KEY, data.content);
    }

    return data?.content || '';
  } catch (error) {
    console.error('❌ Error in getNotes:', error);
    // Fallback to localStorage
    return localStorage.getItem(NOTES_STORAGE_KEY) || '';
  }
}

// Save notes for current user
export async function saveNotes(content: string): Promise<boolean> {
  try {
    console.log('📝 Notes - Saving notes, length:', content.length);

    // Always save to localStorage first (immediate feedback)
    localStorage.setItem(NOTES_STORAGE_KEY, content);

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      console.log('⚠️ Notes - No user session, saved to localStorage only');
      return true;
    }

    console.log('📝 Notes - Saving to Supabase for user:', session.user.id);

    // Upsert to Supabase (insert or update)
    const { error } = await supabase
      .from('user_notes')
      .upsert({
        user_id: session.user.id,
        content: content
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error('❌ Error saving notes to Supabase:', error);
      return false;
    }

    console.log('✅ Notes - Saved to Supabase successfully');
    return true;
  } catch (error) {
    console.error('❌ Error in saveNotes:', error);
    return false;
  }
}

// Clear notes for current user
export async function clearNotes(): Promise<boolean> {
  try {
    localStorage.removeItem(NOTES_STORAGE_KEY);

    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return true;
    }

    const { error } = await supabase
      .from('user_notes')
      .delete()
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error clearing notes:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in clearNotes:', error);
    return false;
  }
}
