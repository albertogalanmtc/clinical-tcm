import { supabase } from '../lib/supabase';

export interface NewsArticle {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  author?: string;
  image_url?: string;
  category?: string;
  tags?: string[];
  status: 'active' | 'inactive' | 'draft';
  published_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const newsService = {
  async getActiveNews(): Promise<NewsArticle[]> {
    console.log('Fetching active news from Supabase...');
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('status', 'active')
      .order('published_at', { ascending: false });

    if (error) {
      console.error('Error fetching active news:', error);
      return [];
    }

    console.log('Active news from Supabase:', data);
    return data || [];
  },

  async getAllNews(): Promise<NewsArticle[]> {
    console.log('Fetching ALL news from Supabase (admin)...');
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all news:', error);
      return [];
    }

    console.log('All news from Supabase (admin):', data);
    return data || [];
  },

  async getNewsById(id: string): Promise<NewsArticle | null> {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching news:', error);
      return null;
    }

    return data;
  },

  async createNews(news: Omit<NewsArticle, 'id' | 'created_at' | 'updated_at'>): Promise<NewsArticle | null> {
    const { data: { session } } = await supabase.auth.getSession();

    const { data, error } = await supabase
      .from('news')
      .insert([{
        ...news,
        created_by: session?.user?.id,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating news:', error);
      return null;
    }

    return data;
  },

  async updateNews(id: string, updates: Partial<NewsArticle>): Promise<NewsArticle | null> {
    const { data, error } = await supabase
      .from('news')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating news:', error);
      return null;
    }

    return data;
  },

  async deleteNews(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('news')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting news:', error);
      return false;
    }

    return true;
  },
};
