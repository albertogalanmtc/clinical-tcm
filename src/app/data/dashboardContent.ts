// Dashboard Content Management - Types and Storage

import { getBanners, getBannersPublished, type Banner } from './banners';
import { dashboardMessagesService, type DashboardMessage } from '../services/dashboardMessagesService';

export type CarouselRatio = '16:9' | '9:16' | 'fullscreen';

export interface CarouselSettings {
  ratio?: CarouselRatio; // Deprecated - kept for backward compatibility
  desktopRatio: CarouselRatio;
  mobileRatio: CarouselRatio;
  transitionInterval: number; // Time in seconds (3, 5, 7, 10)
}

export interface HeroSlide {
  id: string;
  title?: string; // Optional title for admin display
  description?: string; // Optional description for admin
  image?: string; // Image URL
  imageUrl?: string; // Alternative field name (deprecated, use image)
  linkType: 'external' | 'internal' | 'video' | 'none';
  externalUrl?: string; // For external links
  videoUrl?: string; // For YouTube/Vimeo videos
  internalContent?: {
    title: string;
    content: string;
  }; // For internal information
  ctaText?: string; // Call to action text
  visible: boolean; // Show/hide in dashboard
  status: 'active' | 'inactive';
  order: number;
  imagePosition?: {
    x: number; // Percentage 0-100
    y: number; // Percentage 0-100
  };
  ratio?: CarouselRatio; // Ratio used when positioning this slide (deprecated - use desktopRatio/mobileRatio)
  desktopRatio?: CarouselRatio; // Ratio for desktop view
  mobileRatio?: CarouselRatio; // Ratio for mobile view
  carouselGroup?: string | null; // Group ID for carousel grouping. null or undefined = single image
  // Visibility settings
  countries?: string[]; // ISO-2 codes, empty = global
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface WelcomeMessage {
  id: string;
  title: string;
  content: string;
  enabled: boolean; // Show welcome message even when carousel is active
  order: number;
  highlighted?: boolean; // Show with green background
  dismissible?: boolean; // Allow users to close/dismiss the message
  link?: string; // Optional external link
  // Internal modal content
  modalContent?: {
    title: string;
    content: string;
  };
  // Visibility settings
  countries?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  to: string;
  section: 'builder' | 'herbs' | 'formulas' | 'prescriptions' | 'news' | 'community';
  enabled: boolean;
}

export interface QuickActions {
  id: string;
  enabled: boolean;
  order: number;
  actions: QuickActionItem[];
}

export interface CommunityCard {
  id: string;
  enabled: boolean;
  order: number;
  title: string;
  description: string;
  buttonText: string;
  externalUrl?: string; // For Patreon link
}

// Unified content item
export type DashboardContentItem =
  | { type: 'message'; data: WelcomeMessage | DashboardMessage }
  | { type: 'slide'; data: HeroSlide }
  | { type: 'quickActions'; data: QuickActions }
  | { type: 'community'; data: CommunityCard }
  | { type: 'banner'; data: Banner };

// Storage keys
const HERO_SLIDES_KEY = 'admin_hero_slides';
const HERO_SLIDES_PUBLISHED_KEY = 'admin_hero_slides_published';
const CAROUSEL_SETTINGS_KEY = 'admin_carousel_settings';
const CAROUSEL_SETTINGS_PUBLISHED_KEY = 'admin_carousel_settings_published';
const WELCOME_MESSAGES_KEY = 'admin_welcome_messages';
const WELCOME_MESSAGES_PUBLISHED_KEY = 'admin_welcome_messages_published';
const QUICK_ACTIONS_KEY = 'admin_quick_actions';
const QUICK_ACTIONS_PUBLISHED_KEY = 'admin_quick_actions_published';
const COMMUNITY_CARD_KEY = 'admin_community_card';
const COMMUNITY_CARD_PUBLISHED_KEY = 'admin_community_card_published';

const DEFAULT_WELCOME_MESSAGE: WelcomeMessage = {
  id: '1',
  title: 'Welcome to Clinical TCM',
  content: 'Your comprehensive platform for Traditional Chinese Medicine clinical practice. Access our extensive herb library, formula database, and prescription builder with built-in safety protocols.',
  enabled: true,
  order: 0
};

// Get unified content list sorted by order (draft/admin view)
export function getUnifiedDashboardContent(): DashboardContentItem[] {
  const messages = getWelcomeMessages();
  const slides = getHeroSlides();
  const quickActions = getQuickActions();
  const communityCard = getCommunityCard();
  const banners = getBanners();

  const items: DashboardContentItem[] = [
    ...messages.map(m => ({ type: 'message' as const, data: m })),
    ...slides.map(s => ({ type: 'slide' as const, data: s })),
    ...(quickActions ? [{ type: 'quickActions' as const, data: quickActions }] : []),
    ...(communityCard ? [{ type: 'community' as const, data: communityCard }] : []),
    ...banners.map(b => ({ type: 'banner' as const, data: b }))
  ];

  return items.sort((a, b) => a.data.order - b.data.order);
}

// Get unified PUBLISHED content list sorted by order (user view)
export function getUnifiedDashboardContentPublished(): DashboardContentItem[] {
  const messages = getWelcomeMessagesPublished();
  const slides = getHeroSlidesPublished();
  const quickActions = getQuickActionsPublished();
  const communityCard = getCommunityCardPublished();
  const banners = getBannersPublished();

  console.log('📦 getUnifiedDashboardContentPublished - Raw data:');
  console.log('  Messages published:', messages);
  console.log('  Slides published:', slides);
  console.log('  Quick actions published:', quickActions);
  console.log('  Community card published:', communityCard);
  console.log('  Banners published:', banners);

  const items: DashboardContentItem[] = [
    ...messages.map(m => ({ type: 'message' as const, data: m })),
    ...slides.map(s => ({ type: 'slide' as const, data: s })),
    ...(quickActions ? [{ type: 'quickActions' as const, data: quickActions }] : []),
    ...(communityCard ? [{ type: 'community' as const, data: communityCard }] : []),
    ...banners.map(b => ({ type: 'banner' as const, data: b }))
  ];

  return items.sort((a, b) => a.data.order - b.data.order);
}

// Get unified content from Supabase (async) - for Dashboard Organization
export async function getUnifiedDashboardContentFromSupabase(): Promise<DashboardContentItem[]> {
  const messages = await dashboardMessagesService.getAllMessages();
  const slides = getHeroSlides();
  const quickActions = getQuickActions();
  const communityCard = getCommunityCard();
  const banners = getBanners();

  const items: DashboardContentItem[] = [
    ...messages.map(m => ({ type: 'message' as const, data: m })),
    ...slides.map(s => ({ type: 'slide' as const, data: s })),
    ...(quickActions ? [{ type: 'quickActions' as const, data: quickActions }] : []),
    ...(communityCard ? [{ type: 'community' as const, data: communityCard }] : []),
    ...banners.map(b => ({ type: 'banner' as const, data: b }))
  ];

  return items.sort((a, b) => a.data.order - b.data.order);
}

// Update order for all items (async version for Supabase)
export async function reorderDashboardContentAsync(items: DashboardContentItem[]): Promise<void> {
  // Import updateBanner locally to avoid circular dependency
  const { updateBanner } = require('./banners');

  // Update orders
  items.forEach((item, index) => {
    item.data.order = index;
  });

  // Separate items
  const messageItems = items.filter(i => i.type === 'message');
  const slides = items.filter(i => i.type === 'slide').map(i => i.data) as HeroSlide[];
  const quickActionsItem = items.find(i => i.type === 'quickActions');
  const communityCardItem = items.find(i => i.type === 'community');
  const bannerItems = items.filter(i => i.type === 'banner').map(i => i.data) as Banner[];

  // Update messages in Supabase
  for (const item of messageItems) {
    await dashboardMessagesService.updateMessage(item.data.id, { order: item.data.order });
  }

  // Update slides in localStorage
  localStorage.setItem(HERO_SLIDES_KEY, JSON.stringify(slides));

  // Update Quick Actions in localStorage
  if (quickActionsItem) {
    localStorage.setItem(QUICK_ACTIONS_KEY, JSON.stringify(quickActionsItem.data));
  }

  // Update Community Card in localStorage
  if (communityCardItem) {
    localStorage.setItem(COMMUNITY_CARD_KEY, JSON.stringify(communityCardItem.data));
  }

  // Update each banner's order
  bannerItems.forEach(banner => {
    updateBanner(banner.id, { order: banner.order });
  });

  window.dispatchEvent(new CustomEvent('dashboard-content-updated'));
}

// Update order for all items (legacy sync version - kept for compatibility)
export function reorderDashboardContent(items: DashboardContentItem[]): void {
  // Import updateBanner locally to avoid circular dependency
  const { updateBanner } = require('./banners');

  // Update orders
  items.forEach((item, index) => {
    item.data.order = index;
  });

  // Separate and save
  const messages = items.filter(i => i.type === 'message').map(i => i.data) as WelcomeMessage[];
  const slides = items.filter(i => i.type === 'slide').map(i => i.data) as HeroSlide[];
  const quickActionsItem = items.find(i => i.type === 'quickActions');
  const communityCardItem = items.find(i => i.type === 'community');
  const bannerItems = items.filter(i => i.type === 'banner').map(i => i.data) as Banner[];

  localStorage.setItem(WELCOME_MESSAGES_KEY, JSON.stringify(messages));
  localStorage.setItem(HERO_SLIDES_KEY, JSON.stringify(slides));
  if (quickActionsItem) {
    localStorage.setItem(QUICK_ACTIONS_KEY, JSON.stringify(quickActionsItem.data));
  }
  if (communityCardItem) {
    localStorage.setItem(COMMUNITY_CARD_KEY, JSON.stringify(communityCardItem.data));
  }

  // Update each banner's order
  bannerItems.forEach(banner => {
    updateBanner(banner.id, { order: banner.order });
  });

  window.dispatchEvent(new CustomEvent('dashboard-content-updated'));
}

// Hero Slides
export function getHeroSlides(): HeroSlide[] {
  try {
    const stored = localStorage.getItem(HERO_SLIDES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading hero slides:', error);
  }
  return [];
}

export function getHeroSlidesPublished(): HeroSlide[] {
  try {
    const stored = localStorage.getItem(HERO_SLIDES_PUBLISHED_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading published hero slides:', error);
  }
  return [];
}

export function addHeroSlide(slide: Omit<HeroSlide, 'id' | 'order'>): void {
  const slides = getHeroSlides();
  const newSlide: HeroSlide = {
    ...slide,
    id: Date.now().toString(),
    order: slides.length,
  };
  slides.push(newSlide);
  localStorage.setItem(HERO_SLIDES_KEY, JSON.stringify(slides));
  window.dispatchEvent(new CustomEvent('dashboard-content-updated'));
}

export function updateHeroSlide(id: string, updates: Partial<HeroSlide>): void {
  const slides = getHeroSlides();
  const index = slides.findIndex(s => s.id === id);
  if (index !== -1) {
    slides[index] = { ...slides[index], ...updates };
    localStorage.setItem(HERO_SLIDES_KEY, JSON.stringify(slides));
    // Auto-publish changes
    localStorage.setItem(HERO_SLIDES_PUBLISHED_KEY, JSON.stringify(slides));
    window.dispatchEvent(new CustomEvent('dashboard-content-updated'));
  }
}

export function deleteHeroSlide(id: string): void {
  const slides = getHeroSlides().filter(s => s.id !== id);
  localStorage.setItem(HERO_SLIDES_KEY, JSON.stringify(slides));
  window.dispatchEvent(new CustomEvent('dashboard-content-updated'));
}

export function publishHeroSlides(): void {
  const draft = getHeroSlides();
  localStorage.setItem(HERO_SLIDES_PUBLISHED_KEY, JSON.stringify(draft));
  window.dispatchEvent(new CustomEvent('dashboard-content-updated'));
}

// Carousel Settings
export function getCarouselSettings(): CarouselSettings {
  try {
    const stored = localStorage.getItem(CAROUSEL_SETTINGS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Backward compatibility: if only 'ratio' exists, use it for both
      return {
        desktopRatio: parsed.desktopRatio || parsed.ratio || '16:9',
        mobileRatio: parsed.mobileRatio || '9:16',
        transitionInterval: parsed.transitionInterval || 5
      };
    }
  } catch (error) {
    console.error('Error loading carousel settings:', error);
  }
  return { desktopRatio: '16:9', mobileRatio: '9:16', transitionInterval: 5 };
}

export function getCarouselSettingsPublished(): CarouselSettings {
  try {
    const stored = localStorage.getItem(CAROUSEL_SETTINGS_PUBLISHED_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Backward compatibility: if only 'ratio' exists, use it for both
      return {
        desktopRatio: parsed.desktopRatio || parsed.ratio || '16:9',
        mobileRatio: parsed.mobileRatio || '9:16',
        transitionInterval: parsed.transitionInterval || 5
      };
    }
  } catch (error) {
    console.error('Error loading published carousel settings:', error);
  }
  return { desktopRatio: '16:9', mobileRatio: '9:16', transitionInterval: 5 };
}

export function saveCarouselSettings(settings: CarouselSettings): void {
  localStorage.setItem(CAROUSEL_SETTINGS_KEY, JSON.stringify(settings));
}

export function publishCarouselSettings(): void {
  const draftSettings = getCarouselSettings();
  localStorage.setItem(CAROUSEL_SETTINGS_PUBLISHED_KEY, JSON.stringify(draftSettings));
  window.dispatchEvent(new CustomEvent('dashboard-content-updated'));
}

// Publish all carousel changes (slides + settings)
export function publishCarouselChanges(): void {
  publishHeroSlides();
  publishCarouselSettings();
  publishWelcomeMessages();
  publishQuickActions();
  publishCommunityCard();
}

// Check if there are unpublished carousel changes
export function hasUnpublishedCarouselChanges(): boolean {
  const draft = getHeroSlides();
  const published = getHeroSlidesPublished();
  const draftSettings = getCarouselSettings();
  const publishedSettings = getCarouselSettingsPublished();
  const draftMessages = getWelcomeMessages();
  const publishedMessages = getWelcomeMessagesPublished();
  const draftQuickActions = getQuickActions();
  const publishedQuickActions = getQuickActionsPublished();
  const draftCommunityCard = getCommunityCard();
  const publishedCommunityCard = getCommunityCardPublished();

  return JSON.stringify(draft) !== JSON.stringify(published) ||
         JSON.stringify(draftSettings) !== JSON.stringify(publishedSettings) ||
         JSON.stringify(draftMessages) !== JSON.stringify(publishedMessages) ||
         JSON.stringify(draftQuickActions) !== JSON.stringify(publishedQuickActions) ||
         JSON.stringify(draftCommunityCard) !== JSON.stringify(publishedCommunityCard);
}

// Welcome Messages (Multiple)
export function getWelcomeMessages(): WelcomeMessage[] {
  try {
    const stored = localStorage.getItem(WELCOME_MESSAGES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading welcome messages:', error);
  }
  return [];
}

export function getWelcomeMessagesPublished(): WelcomeMessage[] {
  try {
    const stored = localStorage.getItem(WELCOME_MESSAGES_PUBLISHED_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading published welcome messages:', error);
  }
  return [];
}

export function addWelcomeMessage(message: Omit<WelcomeMessage, 'id' | 'order'>): void {
  const messages = getWelcomeMessages();
  const newMessage: WelcomeMessage = {
    ...message,
    id: Date.now().toString(),
    order: messages.length,
  };
  messages.push(newMessage);
  localStorage.setItem(WELCOME_MESSAGES_KEY, JSON.stringify(messages));
  window.dispatchEvent(new CustomEvent('dashboard-content-updated'));
}

export function updateWelcomeMessage(id: string, updates: Partial<WelcomeMessage>): void {
  const messages = getWelcomeMessages();
  const index = messages.findIndex(m => m.id === id);
  if (index !== -1) {
    messages[index] = { ...messages[index], ...updates };
    localStorage.setItem(WELCOME_MESSAGES_KEY, JSON.stringify(messages));
    window.dispatchEvent(new CustomEvent('dashboard-content-updated'));
  }
}

export function deleteWelcomeMessage(id: string): void {
  const messages = getWelcomeMessages().filter(m => m.id !== id);
  localStorage.setItem(WELCOME_MESSAGES_KEY, JSON.stringify(messages));
  window.dispatchEvent(new CustomEvent('dashboard-content-updated'));
}

export function publishWelcomeMessages(): void {
  const draft = getWelcomeMessages();
  localStorage.setItem(WELCOME_MESSAGES_PUBLISHED_KEY, JSON.stringify(draft));
  window.dispatchEvent(new CustomEvent('dashboard-content-updated'));
}

// Check if there are unpublished welcome message changes
export function hasUnpublishedWelcomeMessageChanges(): boolean {
  const draft = getWelcomeMessages();
  const published = getWelcomeMessagesPublished();

  return JSON.stringify(draft) !== JSON.stringify(published);
}

// Quick Actions - Default configuration
const DEFAULT_QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: 'builder',
    title: 'Build Prescription',
    description: 'Create a new custom prescription',
    to: '/builder',
    section: 'builder',
    enabled: true
  },
  {
    id: 'herbs',
    title: 'Browse Herbs',
    description: 'Explore our herb database',
    to: '/herbs',
    section: 'herbs',
    enabled: true
  },
  {
    id: 'formulas',
    title: 'Browse Formulas',
    description: 'View available formulas',
    to: '/formulas',
    section: 'formulas',
    enabled: true
  },
  {
    id: 'prescriptions',
    title: 'My Prescriptions',
    description: 'Access your saved prescriptions',
    to: '/prescriptions',
    section: 'prescriptions',
    enabled: true
  },
  {
    id: 'news',
    title: 'News',
    description: 'Latest updates and announcements',
    to: '/news',
    section: 'news',
    enabled: true
  },
  {
    id: 'community',
    title: 'Community',
    description: 'Connect with fellow practitioners and support Clinical TCM',
    to: '/community',
    section: 'community',
    enabled: true
  }
];

export function getQuickActions(): QuickActions | null {
  try {
    const stored = localStorage.getItem(QUICK_ACTIONS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure all default actions exist (for backward compatibility)
      if (!parsed.actions) {
        parsed.actions = DEFAULT_QUICK_ACTIONS;
      } else {
        // Remove deleted actions (promos, research, courses)
        const validIds = new Set(DEFAULT_QUICK_ACTIONS.map(da => da.id));
        parsed.actions = parsed.actions.filter((a: QuickActionItem) => validIds.has(a.id));

        // Merge with default actions to add any new ones
        const existingIds = new Set(parsed.actions.map((a: QuickActionItem) => a.id));
        const newActions = DEFAULT_QUICK_ACTIONS.filter(da => !existingIds.has(da.id));
        if (newActions.length > 0) {
          parsed.actions = [...parsed.actions, ...newActions];
        }
      }
      return parsed;
    }
  } catch (error) {
    console.error('Error loading quick actions:', error);
  }
  // Return default quick actions enabled at position 0
  return { id: 'quick-actions', enabled: true, order: 0, actions: DEFAULT_QUICK_ACTIONS };
}

export function getQuickActionsPublished(): QuickActions | null {
  try {
    const stored = localStorage.getItem(QUICK_ACTIONS_PUBLISHED_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure all default actions exist
      if (!parsed.actions) {
        parsed.actions = DEFAULT_QUICK_ACTIONS;
      } else {
        // Remove deleted actions (promos, research, courses)
        const validIds = new Set(DEFAULT_QUICK_ACTIONS.map(da => da.id));
        parsed.actions = parsed.actions.filter((a: QuickActionItem) => validIds.has(a.id));

        // Merge with default actions to add any new ones
        const existingIds = new Set(parsed.actions.map((a: QuickActionItem) => a.id));
        const newActions = DEFAULT_QUICK_ACTIONS.filter(da => !existingIds.has(da.id));
        if (newActions.length > 0) {
          parsed.actions = [...parsed.actions, ...newActions];
        }
      }
      return parsed;
    }
  } catch (error) {
    console.error('Error loading published quick actions:', error);
  }
  return { id: 'quick-actions', enabled: true, order: 0, actions: DEFAULT_QUICK_ACTIONS };
}

export function updateQuickActions(updates: Partial<QuickActions>): void {
  const current = getQuickActions() || { id: 'quick-actions', enabled: true, order: 0, actions: DEFAULT_QUICK_ACTIONS };
  const updated = { ...current, ...updates };
  localStorage.setItem(QUICK_ACTIONS_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('dashboard-content-updated'));
}

export function publishQuickActions(): void {
  const draft = getQuickActions();
  if (draft) {
    localStorage.setItem(QUICK_ACTIONS_PUBLISHED_KEY, JSON.stringify(draft));
  }
  window.dispatchEvent(new CustomEvent('dashboard-content-updated'));
}

// Community Card - Default configuration
const DEFAULT_COMMUNITY_CARD: CommunityCard = {
  id: 'community-card',
  enabled: true,
  order: 0,
  title: 'Community',
  description: 'Connect with fellow practitioners, share experiences, and support the development of Clinical TCM.',
  buttonText: 'Join on Patreon',
  externalUrl: ''
};

export function getCommunityCard(): CommunityCard | null {
  try {
    const stored = localStorage.getItem(COMMUNITY_CARD_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading community card:', error);
  }
  return DEFAULT_COMMUNITY_CARD;
}

export function getCommunityCardPublished(): CommunityCard | null {
  try {
    const stored = localStorage.getItem(COMMUNITY_CARD_PUBLISHED_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading published community card:', error);
  }
  return DEFAULT_COMMUNITY_CARD;
}

export function updateCommunityCard(updates: Partial<CommunityCard>): void {
  const current = getCommunityCard() || DEFAULT_COMMUNITY_CARD;
  const updated = { ...current, ...updates };
  localStorage.setItem(COMMUNITY_CARD_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('dashboard-content-updated'));
}

export function publishCommunityCard(): void {
  const draft = getCommunityCard();
  if (draft) {
    localStorage.setItem(COMMUNITY_CARD_PUBLISHED_KEY, JSON.stringify(draft));
  }
  window.dispatchEvent(new CustomEvent('dashboard-content-updated'));
}