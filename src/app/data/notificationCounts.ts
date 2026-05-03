// Notification badge counts for dashboard cards

import { getNewsPublished } from './newsContent';
import { isPostHidden, getCurrentUser } from './communityPosts';
import { isItemViewed } from './itemTracking';
import { communityService } from '../services/communityService';
import { hasUnreadContent } from './postVisits';

// News section
export function getNewsNotificationCount(): number {
  const news = getNewsPublished();
  const enabledNews = news.filter(n => n.enabled);
  return enabledNews.filter(n => !isItemViewed('news', n.id)).length;
}

// Community section - count unread posts or posts with new comments since last view
export async function getCommunityNotificationCount(userId?: string): Promise<number> {
  const posts = await communityService.getActivePosts();
  const user = userId ? { id: userId } : getCurrentUser();
  let unreadCount = 0;

  for (const post of posts) {
    if (isPostHidden(post.id) || post.author_id === user.id) {
      continue;
    }

    if (hasUnreadContent(post.id, user.id, post.comment_count)) {
      unreadCount += 1;
    }
  }

  return unreadCount;
}

// Get notification count for any section
export function getNotificationCount(section: string, userId?: string): number | Promise<number> {
  switch (section) {
    case 'news':
      return getNewsNotificationCount();
    case 'community':
      return getCommunityNotificationCount(userId);
    default:
      return 0;
  }
}
