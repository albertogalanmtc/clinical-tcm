import { supabase } from '../lib/supabase';
import { fetchAllAdminUsers, getUserDisplayName } from './adminUsersService';
import { dashboardMessagesService, type DashboardMessage } from './dashboardMessagesService';
import { surveysService, type Survey } from './surveysService';
import { bannersService, type Banner } from './bannersService';
import { communityService, type CommunityPost } from './communityService';

export type AdminActivityType =
  | 'user'
  | 'message'
  | 'survey'
  | 'response'
  | 'banner'
  | 'post'
  | 'prescription'
  | 'herb'
  | 'formula';

export interface AdminActivityItem {
  event: string;
  detail: string;
  user?: string;
  time: Date;
  type: AdminActivityType;
  clickable?: boolean;
  data?: any;
}

function truncateText(value: string, maxLength: number): string {
  const cleanValue = value.trim();
  if (cleanValue.length <= maxLength) {
    return cleanValue;
  }

  return `${cleanValue.slice(0, maxLength - 1).trim()}…`;
}

function resolveActivityTime(createdAt: string, updatedAt?: string | null): Date {
  const baseDate = updatedAt && updatedAt !== createdAt ? updatedAt : createdAt;
  return new Date(baseDate);
}

function resolveActivityEvent(
  baseLabel: string,
  createdAt: string,
  updatedAt?: string | null
): string {
  if (updatedAt && updatedAt !== createdAt) {
    return `${baseLabel} updated`;
  }

  return `${baseLabel} created`;
}

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime());
}

export async function fetchRecentAdminActivity(limit = 10): Promise<AdminActivityItem[]> {
  const [users, messages, surveys, banners, posts, responsesResult] = await Promise.all([
    fetchAllAdminUsers(),
    dashboardMessagesService.getAllMessages(),
    surveysService.getAllSurveys(),
    bannersService.getAllBanners(),
    communityService.getAllPosts(),
    supabase
      .from('survey_responses')
      .select('*')
      .order('created_at', { ascending: false }),
  ]);

  const surveyResponses = responsesResult.error ? [] : (responsesResult.data || []);
  const userNameById = new Map<string, string>();
  const userEmailById = new Map<string, string>();

  users.forEach(user => {
    const displayName = getUserDisplayName(user);
    userNameById.set(user.id, displayName);
    userEmailById.set(user.id, user.email);
  });

  const surveyTitleById = new Map<string, Survey['title']>();
  surveys.forEach(survey => {
    surveyTitleById.set(survey.id, survey.title);
  });

  const activities: AdminActivityItem[] = [];

  users.forEach(user => {
    const createdAt = new Date(user.created_at);
    if (!isValidDate(createdAt)) {
      return;
    }

    activities.push({
      event: 'New user registered',
      detail: getUserDisplayName(user),
      user: user.email,
      time: createdAt,
      type: 'user',
    });
  });

  messages.forEach((message: DashboardMessage) => {
    const time = resolveActivityTime(message.created_at, message.updated_at);
    if (!isValidDate(time)) {
      return;
    }

    const creatorName = message.created_by
      ? userNameById.get(message.created_by) || userEmailById.get(message.created_by) || 'Admin'
      : 'Admin';

    activities.push({
      event: resolveActivityEvent('Dashboard message', message.created_at, message.updated_at),
      detail: truncateText(message.title || message.content || 'Dashboard message', 90),
      user: creatorName,
      time,
      type: 'message',
    });
  });

  surveys.forEach(survey => {
    const time = resolveActivityTime(survey.created_at, survey.updated_at);
    if (!isValidDate(time)) {
      return;
    }

    const creatorName = survey.created_by
      ? userNameById.get(survey.created_by) || userEmailById.get(survey.created_by) || 'Admin'
      : 'Admin';

    activities.push({
      event: resolveActivityEvent('Survey', survey.created_at, survey.updated_at),
      detail: truncateText(survey.title, 90),
      user: creatorName,
      time,
      type: 'survey',
    });
  });

  banners.forEach((banner: Banner) => {
    const time = resolveActivityTime(banner.created_at, banner.updated_at);
    if (!isValidDate(time)) {
      return;
    }

    const creatorName = banner.created_by
      ? userNameById.get(banner.created_by) || userEmailById.get(banner.created_by) || 'Admin'
      : 'Admin';

    activities.push({
      event: resolveActivityEvent('Banner', banner.created_at, banner.updated_at),
      detail: truncateText(banner.title, 90),
      user: creatorName,
      time,
      type: 'banner',
    });
  });

  posts.forEach((post: CommunityPost) => {
    const time = resolveActivityTime(post.created_at, post.updated_at);
    if (!isValidDate(time)) {
      return;
    }

    activities.push({
      event: resolveActivityEvent('Community post', post.created_at, post.updated_at),
      detail: truncateText(post.title || post.content || 'Community post', 90),
      user: post.author_name || userNameById.get(post.author_id) || 'Community user',
      time,
      type: 'post',
    });
  });

  surveyResponses.forEach((response: any) => {
    const time = new Date(response.created_at);
    if (!isValidDate(time)) {
      return;
    }

    const responderName =
      userNameById.get(response.user_id) ||
      userEmailById.get(response.user_id) ||
      'User';

    const surveyTitle = surveyTitleById.get(response.survey_id) || 'Survey response';

    activities.push({
      event: 'Survey response submitted',
      detail: truncateText(surveyTitle, 90),
      user: responderName,
      time,
      type: 'response',
    });
  });

  return activities
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, limit);
}
