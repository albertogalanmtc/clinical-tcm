// Banners - For collecting user feedback or displaying announcements

import { getCurrentUser } from './communityPosts';
import { getPlatformSettings } from './platformSettings';

export type BannerDisplayMode = 'widget' | 'modal';
export type BannerType = 'survey' | 'announcement';
export type BannerPriority = 'high' | 'normal' | 'low';

export interface BannerQuestion {
  question: string;
  options: string[]; // Array of answer options
  allowFreeText?: boolean; // Allow users to write custom text responses
}

export interface Banner {
  id: string;
  type: BannerType; // Type of banner: survey (with questions) or announcement (simple message)
  title: string; // Header title
  questions?: BannerQuestion[]; // Array of questions (required if type === 'survey')
  message?: string; // Simple message (required if type === 'announcement')
  feedbackMessage?: string; // Message shown after user responds (optional)
  showCelebrationEmoji?: boolean; // Show celebration emoji with feedback message
  celebrationEmoji?: string; // Custom emoji to show (default: 🎉)
  displayMode: BannerDisplayMode; // How to display: widget in dashboard or modal on app load
  priority: BannerPriority; // Priority: high (can bypass cooldown), normal (default), low
  enabled: boolean;
  order: number; // Display order within same priority (lower numbers first)
  createdAt: string;
  // Scheduling (optional)
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  // Image (optional)
  imageUrl?: string;
  imagePosition?: { x: number; y: number };
  // Styling (fixed colors)
  backgroundColor?: string;
  textColor?: string;
}

export interface BannerResponse {
  bannerId: string;
  userId: string;
  userName: string;
  userCountry?: string;
  answers: string[]; // Array of answers (one per question)
  answeredAt: string;
}

// User cooldown tracking
export interface UserBannerCooldown {
  userId: string;
  lastInteraction?: {
    bannerId: string;
    date: string; // ISO date string
    action: 'answered' | 'dismissed';
  };
  lastModalShownDate?: string; // ISO date string (YYYY-MM-DD) of last modal shown
  dismissedToday?: {
    [bannerId: string]: string; // bannerId -> date (YYYY-MM-DD)
  };
  weeklyImpacts: {
    weekStart: string; // ISO date string for start of week
    count: number;
  };
}

const BANNERS_KEY = 'survey_banners';
const BANNERS_PUBLISHED_KEY = 'survey_banners_published';
const RESPONSES_KEY = 'survey_responses';
const COOLDOWN_KEY = 'banner_cooldowns';

// Get all banners
export function getBanners(): Banner[] {
  try {
    const stored = localStorage.getItem(BANNERS_KEY);
    if (stored) {
      const banners = JSON.parse(stored);

      // Migrate old format to new format if needed
      let needsMigration = false;
      const migratedBanners = banners.map((banner: any) => {
        let migrated = { ...banner };
        let changed = false;

        // Check if this is old format (has 'question' instead of 'questions')
        if (banner.question && !banner.questions) {
          migrated = {
            ...migrated,
            questions: [{
              question: banner.question,
              options: banner.options || [],
              allowFreeText: false
            }],
            // Remove old fields
            question: undefined,
            options: undefined
          };
          changed = true;
        }

        // Ensure all questions have allowFreeText field
        if (migrated.questions && Array.isArray(migrated.questions)) {
          migrated.questions = migrated.questions.map((q: any) => ({
            ...q,
            allowFreeText: q.allowFreeText ?? false
          }));
        }

        // Add type field if missing (default to 'survey' for existing banners)
        if (!banner.type) {
          migrated.type = 'survey';
          changed = true;
        }

        // Add priority field if missing (default to 'normal')
        if (!banner.priority) {
          migrated.priority = 'normal';
          changed = true;
        }

        if (changed) {
          needsMigration = true;
        }

        return migrated;
      });

      // Save migrated data back to localStorage
      if (needsMigration) {
        localStorage.setItem(BANNERS_KEY, JSON.stringify(migratedBanners));
      }

      return migratedBanners;
    }
  } catch (error) {
    console.error('Error loading banners:', error);
  }
  return [];
}

// Get active banner by mode (can have one widget AND one modal active at the same time)
// Returns the first enabled banner considering priority, cooldown, and fatigue rules
export function getActiveBanner(mode?: BannerDisplayMode, userId?: string): Banner | null {
  const banners = getBannersPublished();
  const now = new Date();
  const user = userId || getCurrentUser().id;

  // RULE 1: Check if modal was already shown today (only for modals)
  if (mode === 'modal' && !canShowModalToday(user)) {
    return null;
  }

  // RULE 2: Check if user is in cooldown or reached weekly limit
  const inCooldown = isUserInCooldown(user, false);
  const reachedWeeklyLimit = hasReachedWeeklyLimit(user);

  // If in cooldown or reached limit, only allow HIGH priority banners
  const onlyHighPriority = inCooldown || reachedWeeklyLimit;

  // Filter banners by mode, enabled status, dates, and priority rules
  const eligibleBanners = banners
    .filter(b => {
      if (!b.enabled) return false;
      if (mode && b.displayMode !== mode) return false;

      // Check date range if dates are set
      if (b.startDate && new Date(b.startDate) > now) return false;
      if (b.endDate && new Date(b.endDate) < now) return false;

      // RULE 3: Don't show if user dismissed this banner today
      if (hasDismissedToday(b.id, user)) return false;

      // If only high priority allowed, filter out others
      if (onlyHighPriority && b.priority !== 'high') return false;

      return true;
    })
    // Sort by priority (high → normal → low) then by order
    .sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      const aPriority = priorityOrder[a.priority || 'normal'];
      const bPriority = priorityOrder[b.priority || 'normal'];

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return (a.order || 0) - (b.order || 0);
    });

  return eligibleBanners[0] || null;
}

// Create banner
export function createBanner(
  banner: Omit<Banner, 'id' | 'createdAt' | 'order'>
): Banner {
  const banners = getBanners();

  // Auto-assign order (highest order + 1)
  const maxOrder = banners.length > 0 ? Math.max(...banners.map(b => b.order || 0)) : 0;

  // If this banner is enabled, disable all others of the SAME displayMode
  if (banner.enabled) {
    banners.forEach(b => {
      if (b.displayMode === banner.displayMode) {
        b.enabled = false;
      }
    });
  }

  const newBanner: Banner = {
    ...banner,
    id: `banner-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    order: maxOrder + 1,
    createdAt: new Date().toISOString()
  };

  banners.push(newBanner);
  localStorage.setItem(BANNERS_KEY, JSON.stringify(banners));
  window.dispatchEvent(new CustomEvent('banners-updated'));

  return newBanner;
}

// Update banner
export function updateBanner(id: string, updates: Partial<Banner>): void {
  const banners = getBanners();
  const index = banners.findIndex(b => b.id === id);

  if (index !== -1) {
    // If enabling this banner, disable all others of the SAME displayMode
    if (updates.enabled === true) {
      const displayMode = updates.displayMode || banners[index].displayMode;
      banners.forEach((b, i) => {
        if (i !== index && b.displayMode === displayMode) {
          b.enabled = false;
        }
      });
    }

    banners[index] = { ...banners[index], ...updates };
    localStorage.setItem(BANNERS_KEY, JSON.stringify(banners));
    window.dispatchEvent(new CustomEvent('banners-updated'));
  }
}

// Delete banner
export function deleteBanner(id: string): void {
  const banners = getBanners().filter(b => b.id !== id);
  localStorage.setItem(BANNERS_KEY, JSON.stringify(banners));

  // Also delete all responses for this banner
  const responses = getBannerResponses().filter(r => r.bannerId !== id);
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(responses));

  window.dispatchEvent(new CustomEvent('banners-updated'));
}

// Reorder banners
export function reorderBanners(bannersWithNewOrder: Banner[]): void {
  // Update orders based on array position
  const updatedBanners = bannersWithNewOrder.map((banner, index) => ({
    ...banner,
    order: index
  }));

  localStorage.setItem(BANNERS_KEY, JSON.stringify(updatedBanners));
  window.dispatchEvent(new CustomEvent('banners-updated'));
}

// Get all responses
export function getBannerResponses(): BannerResponse[] {
  try {
    const stored = localStorage.getItem(RESPONSES_KEY);
    if (stored) {
      const responses = JSON.parse(stored);

      // Migrate old format to new format if needed
      let needsMigration = false;
      const migratedResponses = responses.map((response: any) => {
        // Check if this is old format (has 'answer' instead of 'answers')
        if (response.answer && !response.answers) {
          needsMigration = true;
          return {
            ...response,
            answers: [response.answer], // Convert single answer to array
            answer: undefined // Remove old field
          };
        }
        return response;
      });

      // Save migrated data back to localStorage
      if (needsMigration) {
        localStorage.setItem(RESPONSES_KEY, JSON.stringify(migratedResponses));
      }

      return migratedResponses;
    }
  } catch (error) {
    console.error('Error loading banner responses:', error);
  }
  return [];
}

// Get responses for a specific banner (by ID)
export function getResponsesForBanner(bannerId: string): BannerResponse[] {
  return getBannerResponses().filter(r => r.bannerId === bannerId);
}

// Check if user has responded to a banner (ONLY counts actual answers, NOT dismissed)
export function hasUserResponded(bannerId: string, userId: string): boolean {
  const responses = getBannerResponses();
  // Only return true if the user actually answered (not just dismissed)
  return responses.some(r => {
    if (r.bannerId !== bannerId || r.userId !== userId) return false;
    // If answers is ['dismissed'], it's not a real response
    if (r.answers.length === 1 && r.answers[0] === 'dismissed') return false;
    return true;
  });
}

// Check if user dismissed a banner today
export function hasDismissedToday(bannerId: string, userId: string): boolean {
  const cooldown = getUserCooldown(userId);
  if (!cooldown || !cooldown.dismissedToday) {
    return false;
  }

  const today = getTodayDateString();
  const dismissedDate = cooldown.dismissedToday[bannerId];

  return dismissedDate === today;
}

// Record that user dismissed a banner today
export function recordBannerDismissed(bannerId: string, userId: string): void {
  let cooldown = getUserCooldown(userId) || {
    userId,
    weeklyImpacts: { weekStart: getWeekStart(), count: 0 }
  };

  if (!cooldown.dismissedToday) {
    cooldown.dismissedToday = {};
  }

  cooldown.dismissedToday[bannerId] = getTodayDateString();
  saveUserCooldown(cooldown);
}

// Submit banner response
export function submitBannerResponse(bannerId: string, userId: string, answers: string[]): void {
  const responses = getBannerResponses();
  const user = getCurrentUser();

  // Get user country from profile
  let userCountry: string | undefined;
  try {
    const profileStr = localStorage.getItem('userProfile');
    if (profileStr) {
      const profile = JSON.parse(profileStr);
      userCountry = profile.country;
    }
  } catch (error) {
    console.error('Error getting user country:', error);
  }

  // Check if user already responded
  const existingIndex = responses.findIndex(
    r => r.bannerId === bannerId && r.userId === userId
  );

  const newResponse: BannerResponse = {
    bannerId,
    userId,
    userName: user.name,
    userCountry,
    answers,
    answeredAt: new Date().toISOString()
  };

  if (existingIndex !== -1) {
    // Update existing response
    responses[existingIndex] = newResponse;
  } else {
    // Add new response
    responses.push(newResponse);
  }

  localStorage.setItem(RESPONSES_KEY, JSON.stringify(responses));

  // Record interaction for cooldown system (always as 'answered' since dismissed is handled separately)
  recordBannerInteraction(userId, bannerId, 'answered');

  window.dispatchEvent(new CustomEvent('banners-updated'));
}

// Get response statistics for a specific question in a banner
export function getBannerStatistics(bannerId: string, questionIndex: number = 0): {
  totalResponses: number;
  answerCounts: Record<string, number>;
  answerPercentages: Record<string, number>;
} {
  const responses = getResponsesForBanner(bannerId);
  const totalResponses = responses.length;

  const answerCounts: Record<string, number> = {};
  responses.forEach(r => {
    // Handle both old format (answer: string) and new format (answers: string[])
    const answer = Array.isArray(r.answers)
      ? r.answers[questionIndex]
      : (r as any).answer; // Old format compatibility

    if (answer) {
      answerCounts[answer] = (answerCounts[answer] || 0) + 1;
    }
  });

  const answerPercentages: Record<string, number> = {};
  Object.keys(answerCounts).forEach(answer => {
    answerPercentages[answer] = totalResponses > 0
      ? Math.round((answerCounts[answer] / totalResponses) * 100)
      : 0;
  });

  return {
    totalResponses,
    answerCounts,
    answerPercentages
  };
}

// Get responses grouped by answer for a specific question with user info
export function getResponsesByAnswer(bannerId: string, questionIndex: number = 0): Record<string, BannerResponse[]> {
  const responses = getResponsesForBanner(bannerId);
  const grouped: Record<string, BannerResponse[]> = {};

  responses.forEach(response => {
    // Handle both old format (answer: string) and new format (answers: string[])
    const answer = Array.isArray(response.answers)
      ? response.answers[questionIndex]
      : (response as any).answer; // Old format compatibility

    if (answer) {
      if (!grouped[answer]) {
        grouped[answer] = [];
      }
      grouped[answer].push(response);
    }
  });

  return grouped;
}

// ===== COOLDOWN SYSTEM =====

// Get user cooldown data
function getUserCooldown(userId: string): UserBannerCooldown | null {
  try {
    const stored = localStorage.getItem(COOLDOWN_KEY);
    if (stored) {
      const cooldowns: UserBannerCooldown[] = JSON.parse(stored);
      return cooldowns.find(c => c.userId === userId) || null;
    }
  } catch (error) {
    console.error('Error loading user cooldown:', error);
  }
  return null;
}

// Save user cooldown data
function saveUserCooldown(cooldown: UserBannerCooldown): void {
  try {
    const stored = localStorage.getItem(COOLDOWN_KEY);
    let cooldowns: UserBannerCooldown[] = stored ? JSON.parse(stored) : [];

    const index = cooldowns.findIndex(c => c.userId === cooldown.userId);
    if (index !== -1) {
      cooldowns[index] = cooldown;
    } else {
      cooldowns.push(cooldown);
    }

    localStorage.setItem(COOLDOWN_KEY, JSON.stringify(cooldowns));
  } catch (error) {
    console.error('Error saving user cooldown:', error);
  }
}

// Get today's date as YYYY-MM-DD string
function getTodayDateString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// Get start of current week (Monday) as ISO string
function getWeekStart(): string {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust for Monday start
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString();
}

// Check if user can see a modal today
export function canShowModalToday(userId: string): boolean {
  const cooldown = getUserCooldown(userId);
  if (!cooldown || !cooldown.lastModalShownDate) {
    return true;
  }

  const today = getTodayDateString();
  return cooldown.lastModalShownDate !== today;
}

// Record that a modal was shown to user
export function recordModalShown(userId: string): void {
  let cooldown = getUserCooldown(userId) || {
    userId,
    weeklyImpacts: { weekStart: getWeekStart(), count: 0 }
  };

  cooldown.lastModalShownDate = getTodayDateString();
  saveUserCooldown(cooldown);
}

// Check if user is in cooldown period
export function isUserInCooldown(userId: string, allowHighPriority: boolean = false): boolean {
  const cooldown = getUserCooldown(userId);
  if (!cooldown || !cooldown.lastInteraction) {
    return false;
  }

  // High priority banners can bypass cooldown
  if (allowHighPriority) {
    return false;
  }

  // Get cooldown period from settings (only applies to 'answered' now)
  const settings = getPlatformSettings();
  const cooldownDays = settings.bannerSettings.cooldownDaysAnswered;

  // If cooldown is 0 days, no cooldown applies
  if (cooldownDays === 0) {
    return false;
  }

  const lastInteractionDate = new Date(cooldown.lastInteraction.date);
  const now = new Date();
  const daysSince = Math.floor((now.getTime() - lastInteractionDate.getTime()) / (1000 * 60 * 60 * 24));

  return daysSince < cooldownDays;
}

// Record user interaction with banner
export function recordBannerInteraction(userId: string, bannerId: string, action: 'answered' | 'dismissed'): void {
  let cooldown = getUserCooldown(userId) || {
    userId,
    weeklyImpacts: { weekStart: getWeekStart(), count: 0 }
  };

  cooldown.lastInteraction = {
    bannerId,
    date: new Date().toISOString(),
    action
  };

  // Update weekly impacts
  const currentWeekStart = getWeekStart();
  if (cooldown.weeklyImpacts.weekStart !== currentWeekStart) {
    // New week, reset counter
    cooldown.weeklyImpacts = {
      weekStart: currentWeekStart,
      count: 1
    };
  } else {
    cooldown.weeklyImpacts.count++;
  }

  saveUserCooldown(cooldown);
}

// Check if user has reached weekly impact limit
export function hasReachedWeeklyLimit(userId: string): boolean {
  const cooldown = getUserCooldown(userId);
  if (!cooldown) {
    return false;
  }

  // Get max impacts from settings
  const settings = getPlatformSettings();

  // If max impacts is 0, no limit applies
  if (settings.bannerSettings.maxWeeklyImpacts === 0) {
    return false;
  }

  const currentWeekStart = getWeekStart();
  if (cooldown.weeklyImpacts.weekStart !== currentWeekStart) {
    // Different week, no limit reached
    return false;
  }

  return cooldown.weeklyImpacts.count >= settings.bannerSettings.maxWeeklyImpacts;
}

// ===== PUBLISH / DRAFT SYSTEM =====

// Get published banners (user view)
export function getBannersPublished(): Banner[] {
  try {
    const stored = localStorage.getItem(BANNERS_PUBLISHED_KEY);
    if (stored) {
      const banners = JSON.parse(stored);

      // Ensure all questions have allowFreeText field for compatibility
      return banners.map((banner: Banner) => {
        if (banner.questions && Array.isArray(banner.questions)) {
          return {
            ...banner,
            questions: banner.questions.map(q => ({
              ...q,
              allowFreeText: q.allowFreeText ?? false
            }))
          };
        }
        return banner;
      });
    }
  } catch (error) {
    console.error('Error loading published banners:', error);
  }
  return [];
}

// Publish banners
export function publishBanners(): void {
  const draft = getBanners();
  localStorage.setItem(BANNERS_PUBLISHED_KEY, JSON.stringify(draft));
  window.dispatchEvent(new CustomEvent('banners-updated'));
}

// Check if there are unpublished changes
export function hasUnpublishedBannersChanges(): boolean {
  const draft = getBanners();
  const published = getBannersPublished();
  return JSON.stringify(draft) !== JSON.stringify(published);
}
