import { supabase } from '../lib/supabase';
import type { DashboardContentItem, CarouselSettings, WelcomeMessage, HeroSlide, QuickActions, CommunityCard } from '../data/dashboardContent';

const CONTENT_STORAGE_KEY = 'dashboard_content';
const CAROUSEL_STORAGE_KEY = 'carousel_settings';

/**
 * Service to sync dashboard content with Supabase
 */

// Load all dashboard content from Supabase
export async function loadDashboardContentFromSupabase(): Promise<DashboardContentItem[] | null> {
  try {
    console.log('📊 Dashboard Content - Loading from Supabase...');

    const { data, error } = await supabase
      .from('admin_dashboard_content')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      console.error('❌ Dashboard Content - Supabase error:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log('⚠️ Dashboard Content - No content in Supabase');
      return null;
    }

    // Convert Supabase rows to DashboardContentItem
    const content: DashboardContentItem[] = data.map(row => ({
      type: row.content_type as any,
      data: row.content_data
    }));

    console.log('✅ Dashboard Content - Loaded from Supabase:', content.length, 'items');
    return content;
  } catch (error) {
    console.error('❌ Dashboard Content - Error loading from Supabase:', error);
    return null;
  }
}

// Save dashboard content to Supabase
export async function saveDashboardContentToSupabase(content: DashboardContentItem[]): Promise<boolean> {
  try {
    console.log('💾 Dashboard Content - Saving to Supabase...');

    // Delete all existing content first
    const { error: deleteError } = await supabase
      .from('admin_dashboard_content')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

    if (deleteError) {
      console.error('❌ Dashboard Content - Error deleting old content:', deleteError);
      throw deleteError;
    }

    // Insert new content
    const rows = content.map((item, index) => {
      let contentId = '';
      let title = '';

      // Extract ID and title based on content type
      if (item.type === 'message') {
        const msg = item.data as WelcomeMessage;
        contentId = msg.id;
        title = msg.title;
      } else if (item.type === 'slide') {
        const slide = item.data as HeroSlide;
        contentId = slide.id;
        title = slide.title || '';
      } else if (item.type === 'quickActions') {
        const qa = item.data as QuickActions;
        contentId = qa.id;
        title = 'Quick Actions';
      } else if (item.type === 'community') {
        const cc = item.data as CommunityCard;
        contentId = cc.id;
        title = cc.title;
      }

      return {
        content_id: contentId,
        content_type: item.type,
        title: title,
        content_data: item.data,
        display_order: index,
        enabled: (item.data as any).enabled ?? true,
      };
    });

    const { error: insertError } = await supabase
      .from('admin_dashboard_content')
      .insert(rows);

    if (insertError) {
      console.error('❌ Dashboard Content - Error inserting content:', insertError);
      throw insertError;
    }

    console.log('✅ Dashboard Content - Saved to Supabase successfully');
    return true;
  } catch (error) {
    console.error('❌ Dashboard Content - Error saving to Supabase:', error);
    return false;
  }
}

// Load carousel settings from Supabase
export async function loadCarouselSettingsFromSupabase(): Promise<CarouselSettings | null> {
  try {
    console.log('🎠 Carousel Settings - Loading from Supabase...');

    const { data, error } = await supabase
      .from('admin_carousel_settings')
      .select('*')
      .single();

    if (error) {
      console.error('❌ Carousel Settings - Supabase error:', error);
      return null;
    }

    if (!data) {
      console.log('⚠️ Carousel Settings - No settings in Supabase');
      return null;
    }

    const settings: CarouselSettings = {
      desktopRatio: data.desktop_ratio as any,
      mobileRatio: data.mobile_ratio as any,
      transitionInterval: data.transition_interval,
    };

    console.log('✅ Carousel Settings - Loaded from Supabase');
    return settings;
  } catch (error) {
    console.error('❌ Carousel Settings - Error loading from Supabase:', error);
    return null;
  }
}

// Save carousel settings to Supabase
export async function saveCarouselSettingsToSupabase(settings: CarouselSettings): Promise<boolean> {
  try {
    console.log('💾 Carousel Settings - Saving to Supabase...');

    // Get existing row ID (should only be one)
    const { data: existing } = await supabase
      .from('admin_carousel_settings')
      .select('id')
      .limit(1)
      .single();

    if (existing) {
      // Update existing
      const { error } = await supabase
        .from('admin_carousel_settings')
        .update({
          desktop_ratio: settings.desktopRatio,
          mobile_ratio: settings.mobileRatio,
          transition_interval: settings.transitionInterval,
        })
        .eq('id', existing.id);

      if (error) {
        console.error('❌ Carousel Settings - Error updating:', error);
        throw error;
      }
    } else {
      // Insert new
      const { error } = await supabase
        .from('admin_carousel_settings')
        .insert({
          desktop_ratio: settings.desktopRatio,
          mobile_ratio: settings.mobileRatio,
          transition_interval: settings.transitionInterval,
        });

      if (error) {
        console.error('❌ Carousel Settings - Error inserting:', error);
        throw error;
      }
    }

    console.log('✅ Carousel Settings - Saved to Supabase successfully');
    return true;
  } catch (error) {
    console.error('❌ Carousel Settings - Error saving to Supabase:', error);
    return false;
  }
}

// Initialize dashboard content from Supabase on app load
export async function initializeDashboardContent(): Promise<void> {
  const content = await loadDashboardContentFromSupabase();
  const carouselSettings = await loadCarouselSettingsFromSupabase();

  if (content) {
    // Save to localStorage for sync access
    localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(content));
    window.dispatchEvent(new Event('dashboard-content-updated'));
  }

  if (carouselSettings) {
    localStorage.setItem(CAROUSEL_STORAGE_KEY, JSON.stringify(carouselSettings));
  }
}
