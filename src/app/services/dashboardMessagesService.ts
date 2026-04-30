import { supabase } from '../lib/supabase';

export interface DashboardMessage {
  id: string;
  title: string;
  content: string;
  highlighted: boolean;
  closeable: boolean;
  status: 'active' | 'inactive';
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const dashboardMessagesService = {
  async getActiveMessages(): Promise<DashboardMessage[]> {
    console.log('Fetching active dashboard messages from Supabase...');
    const { data, error } = await supabase
      .from('dashboard_messages')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active messages:', error);
      return [];
    }

    console.log('Active dashboard messages from Supabase:', data);
    return data || [];
  },

  async getAllMessages(): Promise<DashboardMessage[]> {
    const { data, error } = await supabase
      .from('dashboard_messages')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all messages:', error);
      return [];
    }

    return data || [];
  },

  async getMessageById(id: string): Promise<DashboardMessage | null> {
    const { data, error } = await supabase
      .from('dashboard_messages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching message:', error);
      return null;
    }

    return data;
  },

  async createMessage(message: Omit<DashboardMessage, 'id' | 'created_at' | 'updated_at'>): Promise<DashboardMessage | null> {
    const { data: { session } } = await supabase.auth.getSession();

    const { data, error } = await supabase
      .from('dashboard_messages')
      .insert([{
        ...message,
        created_by: session?.user?.id,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating message:', error);
      return null;
    }

    return data;
  },

  async updateMessage(id: string, updates: Partial<DashboardMessage>): Promise<DashboardMessage | null> {
    const { data, error } = await supabase
      .from('dashboard_messages')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating message:', error);
      return null;
    }

    return data;
  },

  async deleteMessage(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('dashboard_messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting message:', error);
      return false;
    }

    return true;
  },
};
