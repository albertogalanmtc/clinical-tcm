import { supabase } from '../lib/supabase';

/**
 * Service to manage dashboard message dismissals in Supabase
 */

// Get dismissed message IDs for current user
export async function getDismissedMessages(): Promise<Set<string>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      // Fallback to localStorage for non-authenticated users
      const stored = localStorage.getItem('dismissed_welcome_messages');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    }

    const { data, error } = await supabase
      .from('message_dismissals')
      .select('message_id')
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error loading dismissed messages from Supabase:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem('dismissed_welcome_messages');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    }

    const dismissedIds = new Set(data.map(d => d.message_id));

    // Also merge with localStorage (for backward compatibility)
    const stored = localStorage.getItem('dismissed_welcome_messages');
    if (stored) {
      const localDismissed = JSON.parse(stored);
      localDismissed.forEach((id: string) => dismissedIds.add(id));
    }

    return dismissedIds;
  } catch (error) {
    console.error('Error in getDismissedMessages:', error);
    // Fallback to localStorage
    const stored = localStorage.getItem('dismissed_welcome_messages');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  }
}

// Dismiss a message for current user
export async function dismissMessage(messageId: string): Promise<boolean> {
  try {
    console.log('📨 Dismissing message:', messageId);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      console.log('⚠️ No user session - saving to localStorage only');
      // Fallback to localStorage for non-authenticated users
      const stored = localStorage.getItem('dismissed_welcome_messages');
      const dismissed = stored ? new Set(JSON.parse(stored)) : new Set();
      dismissed.add(messageId);
      localStorage.setItem('dismissed_welcome_messages', JSON.stringify(Array.from(dismissed)));
      return true;
    }

    console.log('👤 User authenticated, saving to Supabase:', session.user.id);

    // Save to Supabase
    const { data, error } = await supabase
      .from('message_dismissals')
      .insert({
        message_id: messageId,
        user_id: session.user.id
      })
      .select();

    if (error) {
      console.error('❌ Error dismissing message in Supabase:', error);

      // Fallback to localStorage
      const stored = localStorage.getItem('dismissed_welcome_messages');
      const dismissed = stored ? new Set(JSON.parse(stored)) : new Set();
      dismissed.add(messageId);
      localStorage.setItem('dismissed_welcome_messages', JSON.stringify(Array.from(dismissed)));

      return false;
    }

    console.log('✅ Message dismissed in Supabase successfully:', data);

    // Also save to localStorage for offline access
    const stored = localStorage.getItem('dismissed_welcome_messages');
    const dismissed = stored ? new Set(JSON.parse(stored)) : new Set();
    dismissed.add(messageId);
    localStorage.setItem('dismissed_welcome_messages', JSON.stringify(Array.from(dismissed)));

    return true;
  } catch (error) {
    console.error('❌ Error in dismissMessage:', error);
    return false;
  }
}

// Clear all dismissed messages for current user (admin utility)
export async function clearDismissedMessages(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      localStorage.removeItem('dismissed_welcome_messages');
      return true;
    }

    const { error } = await supabase
      .from('message_dismissals')
      .delete()
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error clearing dismissed messages:', error);
      return false;
    }

    // Also clear localStorage
    localStorage.removeItem('dismissed_welcome_messages');

    return true;
  } catch (error) {
    console.error('Error in clearDismissedMessages:', error);
    return false;
  }
}
