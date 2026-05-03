// Notification badge counts for dashboard cards

import { getNewsPublished } from './newsContent';
import { isPostHidden, getCurrentUser } from './communityPosts';
import { isItemViewed } from './itemTracking';
import { communityService } from '../services/communityService';
import { getLastVisit } from './sectionVisits';

// News section
export function getNewsNotificationCount(): number {
  const news = getNewsPublished();
  const enabledNews = news.filter(n => n.enabled);
  return enabledNews.filter(n => !isItemViewed('news', n.id)).length;
}

// Community section - count new posts or new comments since last visit
export async function getCommunityNotificationCount(): Promise<number> {
  const posts = await communityService.getActivePosts();
  const user = getCurrentUser();
  const lastVisit = getLastVisit('community');

  if (!lastVisit) {
    return posts.filter(post =>
      !isPostHidden(post.id) &&
      post.author_id !== user.id
    ).length;
  }

  let unreadCount = 0;

  for (const post of posts) {
    if (isPostHidden(post.id) || post.author_id === user.id) {
      continue;
    }

    const postCreatedAt = post.created_at ? new Date(post.created_at) : null;
    const postUpdatedAt = post.updated_at ? new Date(post.updated_at) : null;

    if ((postCreatedAt && postCreatedAt > lastVisit) || (postUpdatedAt && postUpdatedAt > lastVisit)) {
      unreadCount += 1;
      continue;
    }

    const comments = await communityService.getPostComments(post.id);
    const hasNewComment = comments.some(comment => {
      const commentDate = comment.created_at ? new Date(comment.created_at) : null;
      return Boolean(commentDate && commentDate > lastVisit && comment.author_id !== user.id);
    });

    if (hasNewComment) {
      unreadCount += 1;
    }
  }

  return unreadCount;
}

// Get notification count for any section
export function getNotificationCount(section: string): number | Promise<number> {
  switch (section) {
    case 'news':
      return getNewsNotificationCount();
    case 'community':
      return getCommunityNotificationCount();
    default:
      return 0;
  }
}
