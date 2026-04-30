// Post Visit Tracking for unread indicators

const POST_VISITS_KEY = 'community_post_visits';

interface PostVisit {
  postId: string;
  userId: string;
  lastViewedAt: string;
  commentCountAtView: number;
}

function getPostVisits(): PostVisit[] {
  try {
    const stored = localStorage.getItem(POST_VISITS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading post visits:', error);
  }
  return [];
}

function savePostVisits(visits: PostVisit[]): void {
  try {
    localStorage.setItem(POST_VISITS_KEY, JSON.stringify(visits));
  } catch (error) {
    console.error('Error saving post visits:', error);
  }
}

// Mark a post as viewed with current comment count
export function markPostAsRead(postId: string, userId: string, commentCount: number): void {
  const visits = getPostVisits();

  // Remove existing visit for this post+user
  const filtered = visits.filter(v => !(v.postId === postId && v.userId === userId));

  // Add new visit record
  filtered.push({
    postId,
    userId,
    lastViewedAt: new Date().toISOString(),
    commentCountAtView: commentCount
  });

  savePostVisits(filtered);
}

// Check if a post has unread content (new comments since last view)
export function hasUnreadContent(postId: string, userId: string, currentCommentCount: number): boolean {
  const visits = getPostVisits();
  const visit = visits.find(v => v.postId === postId && v.userId === userId);

  // If never visited, it's unread
  if (!visit) {
    return true;
  }

  // If comment count increased, there's new content
  return currentCommentCount > visit.commentCountAtView;
}

// Get last view info for a post
export function getPostVisit(postId: string, userId: string): PostVisit | null {
  const visits = getPostVisits();
  return visits.find(v => v.postId === postId && v.userId === userId) || null;
}
