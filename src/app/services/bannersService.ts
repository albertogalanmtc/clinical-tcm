import { supabase } from '../lib/supabase';

export interface Banner {
  id: string;
  title: string;
  content?: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'announcement';
  link_url?: string;
  link_text?: string;
  start_date?: string;
  end_date?: string;
  status: 'active' | 'inactive';
  dismissible: boolean;
  display_order?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const bannersService = {
  async getActiveBanners(): Promise<Banner[]> {
    console.log('Fetching active banners from Supabase...');
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('status', 'active')
      .or(`start_date.is.null,start_date.lte.${now}`)
      .or(`end_date.is.null,end_date.gte.${now}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active banners:', error);
      return [];
    }

    console.log('Active banners from Supabase:', data);
    return data || [];
  },

  async getAllBanners(): Promise<Banner[]> {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false});

    if (error) {
      console.error('Error fetching all banners:', error);
      return [];
    }

    return data || [];
  },

  async getBannerById(id: string): Promise<Banner | null> {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching banner:', error);
      return null;
    }

    return data;
  },

  async createBanner(banner: Omit<Banner, 'id' | 'created_at' | 'updated_at'>): Promise<Banner | null> {
    const { data: { session } } = await supabase.auth.getSession();

    const { data, error } = await supabase
      .from('banners')
      .insert([{
        ...banner,
        created_by: session?.user?.id,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating banner:', error);
      return null;
    }

    return data;
  },

  async updateBanner(id: string, updates: Partial<Banner>): Promise<Banner | null> {
    const { data, error } = await supabase
      .from('banners')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating banner:', error);
      return null;
    }

    return data;
  },

  async deleteBanner(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting banner:', error);
      return false;
    }

    return true;
  },

  async updateBannerOrder(bannerId: string, newOrder: number): Promise<boolean> {
    const { error } = await supabase
      .from('banners')
      .update({ display_order: newOrder })
      .eq('id', bannerId);

    if (error) {
      console.error('Error updating banner order:', error);
      return false;
    }

    return true;
  },

  async hasUserDismissedBanner(bannerId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('banner_dismissals')
      .select('id')
      .eq('banner_id', bannerId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking banner dismissal:', error);
      return false;
    }

    return !!data;
  },

  async dismissBanner(bannerId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('banner_dismissals')
      .insert([{
        banner_id: bannerId,
        user_id: userId,
        dismissed_at: new Date().toISOString(),
      }]);

    if (error) {
      console.error('Error dismissing banner:', error);
      return false;
    }

    return true;
  },

  async getBannerDismissalCount(bannerId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('banner_dismissals')
        .select('*', { count: 'exact', head: true })
        .eq('banner_id', bannerId);

      if (error) {
        console.error('Error getting dismissal count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error getting dismissal count:', error);
      return 0;
    }
  },
};
