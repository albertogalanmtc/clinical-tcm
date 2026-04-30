// Notification badge counts for dashboard cards

import { getNewsPublished } from './newsContent';
import { getCommunityPosts, isPostViewed, isPostHidden, getCurrentUser } from './communityPosts';
import { isItemViewed } from './itemTracking';

// News section
export function getNewsNotificationCount(): number {
  const news = getNewsPublished();
  const enabledNews = news.filter(n => n.enabled);
  return enabledNews.filter(n => !isItemViewed('news', n.id)).length;
}

// Community section - count unread posts
export function getCommunityNotificationCount(): number {
  const posts = getCommunityPosts();
  const user = getCurrentUser();

  // Count posts that are:
  // - Not viewed by current user
  // - Not hidden by current user
  // - Not authored by current user
  return posts.filter(post =>
    !isPostViewed(post.id) &&
    !isPostHidden(post.id) &&
    post.authorId !== user.id
  ).length;
}

// Get notification count for any section
export function getNotificationCount(section: string): number {
  switch (section) {
    case 'news':
      return getNewsNotificationCount();
    case 'community':
      return getCommunityNotificationCount();
    default:
      return 0;
  }
}
