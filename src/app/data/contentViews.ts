// Content Views Tracking - Track who views courses, promos, news, research

export type ContentType = 'course' | 'promo' | 'news' | 'research';

export interface ContentView {
  userId: string;
  userName: string;
  userEmail: string;
  userPlan: 'free' | 'professional' | 'enterprise';
  contentType: ContentType;
  contentId: string;
  viewedAt: string;
}

const CONTENT_VIEWS_KEY = 'content_views';

// Get all content views
export function getContentViews(): ContentView[] {
  try {
    const stored = localStorage.getItem(CONTENT_VIEWS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading content views:', error);
  }
  return [];
}

// Track a content view
export function trackContentView(
  userId: string,
  userName: string,
  userEmail: string,
  userPlan: 'free' | 'professional' | 'enterprise',
  contentType: ContentType,
  contentId: string
): void {
  const views = getContentViews();

  // Check if user already viewed this content
  const existingView = views.find(
    v => v.userId === userId && v.contentType === contentType && v.contentId === contentId
  );

  if (existingView) {
    // Update timestamp
    existingView.viewedAt = new Date().toISOString();
  } else {
    // Add new view
    const newView: ContentView = {
      userId,
      userName,
      userEmail,
      userPlan,
      contentType,
      contentId,
      viewedAt: new Date().toISOString()
    };
    views.push(newView);
  }

  localStorage.setItem(CONTENT_VIEWS_KEY, JSON.stringify(views));
}

// Get statistics for specific content
export function getContentStatistics(contentType: ContentType, contentId: string) {
  const views = getContentViews();
  const contentViews = views.filter(
    v => v.contentType === contentType && v.contentId === contentId
  );

  // Get unique users who viewed this content
  const uniqueUserIds = new Set(contentViews.map(v => v.userId));
  const uniqueViews = uniqueUserIds.size;

  // Total views (including repeat views)
  const totalViews = contentViews.length;

  // Get total registered users (from admin_users)
  const usersKey = 'admin_users';
  let totalUsers = 0;
  let allUsers: any[] = [];
  try {
    const stored = localStorage.getItem(usersKey);
    if (stored) {
      allUsers = JSON.parse(stored);
      totalUsers = allUsers.length;
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }

  // Calculate percentage of users who viewed
  const viewPercentage = totalUsers > 0 ? (uniqueViews / totalUsers) * 100 : 0;

  // Users who viewed (with details)
  const viewedUsers = contentViews.map(v => ({
    userId: v.userId,
    userName: v.userName,
    userEmail: v.userEmail,
    userPlan: v.userPlan,
    viewedAt: v.viewedAt
  }));

  // Users who have NOT viewed (for remarketing)
  const viewedUserIds = new Set(contentViews.map(v => v.userId));
  const notViewedUsers = allUsers
    .filter(u => !viewedUserIds.has(u.id))
    .map(u => ({
      userId: u.id,
      userName: u.name,
      userEmail: u.email,
      userPlan: u.plan || 'free'
    }));

  // Breakdown by plan
  const byPlan = {
    free: contentViews.filter(v => v.userPlan === 'free').length,
    professional: contentViews.filter(v => v.userPlan === 'professional').length,
    enterprise: contentViews.filter(v => v.userPlan === 'enterprise').length
  };

  return {
    totalViews,
    uniqueViews,
    totalUsers,
    viewPercentage: Math.round(viewPercentage * 10) / 10,
    viewedUsers,
    notViewedUsers,
    byPlan
  };
}

// Get recent viewers
export function getRecentViewers(
  contentType: ContentType,
  contentId: string,
  limit: number = 10
): ContentView[] {
  const views = getContentViews();
  const contentViews = views.filter(
    v => v.contentType === contentType && v.contentId === contentId
  );

  // Sort by most recent and return limited results
  return contentViews
    .sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime())
    .slice(0, limit);
}
