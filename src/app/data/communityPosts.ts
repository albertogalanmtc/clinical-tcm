// Community Posts Management - Types and Storage
import { communityService } from '../services/communityService';
import { supabase } from '../lib/supabase';

export type PostCategory = 'help' | 'success' | 'question' | 'discussion';

export interface CommunityComment {
  id: string;
  postId: string;
  parentId?: string; // For nested replies
  author: string;
  authorId: string; // User ID
  content: string;
  createdAt: string;
  editedAt?: string;
  upvotes: number;
  upvotedBy: string[]; // User IDs who upvoted
  markedAsUseful?: boolean; // Only post author can mark
}

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: PostCategory;
  symptoms?: string[]; // Optional symptom chips for filtering
  author: string;
  authorId: string; // User ID
  createdAt: string;
  editedAt?: string;
  views: number;
  commentCount: number;
  followedBy: string[]; // User IDs following this post
  resolved?: boolean; // Mark as resolved
}

// Storage keys
const POSTS_KEY = 'community_posts';
const COMMENTS_KEY = 'community_comments';

// Get current user from localStorage
// NOTE: For creating posts/comments, components should pass user from UserContext
// This is a fallback for other functions
export function getCurrentUser() {
  try {
    const profileStr = localStorage.getItem('userProfile');
    const profile = profileStr ? JSON.parse(profileStr) : null;
    const userRole = localStorage.getItem('userRole') || 'user';

    const firstName = profile?.firstName || 'User';
    const lastName = profile?.lastName || '';
    const title = profile?.title || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const displayName = title ? `${title} ${fullName}` : fullName;

    return {
      id: 'user-demo',
      name: displayName || 'User',
      isAdmin: userRole === 'admin'
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return {
      id: 'user-demo',
      name: 'User',
      isAdmin: false
    };
  }
}

// User interactions with posts (view, hide, etc.)
const USER_POST_INTERACTIONS_KEY = 'community_user_interactions';

interface UserPostInteraction {
  userId: string;
  postId: string;
  viewed?: boolean;
  hidden?: boolean;
  viewedAt?: string;
}

function getUserInteractions(): UserPostInteraction[] {
  try {
    const stored = localStorage.getItem(USER_POST_INTERACTIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading user interactions:', error);
  }
  return [];
}

function saveUserInteractions(interactions: UserPostInteraction[]): void {
  localStorage.setItem(USER_POST_INTERACTIONS_KEY, JSON.stringify(interactions));
  window.dispatchEvent(new CustomEvent('community-posts-updated'));
}

export function markPostAsViewed(postId: string): void {
  const interactions = getUserInteractions();
  const user = getCurrentUser();
  const existingIndex = interactions.findIndex(i => i.userId === user.id && i.postId === postId);

  if (existingIndex !== -1) {
    interactions[existingIndex].viewed = true;
    interactions[existingIndex].viewedAt = new Date().toISOString();
  } else {
    interactions.push({
      userId: user.id,
      postId,
      viewed: true,
      viewedAt: new Date().toISOString()
    });
  }

  saveUserInteractions(interactions);
}

export function toggleHidePost(postId: string): void {
  const interactions = getUserInteractions();
  const user = getCurrentUser();
  const existingIndex = interactions.findIndex(i => i.userId === user.id && i.postId === postId);

  if (existingIndex !== -1) {
    interactions[existingIndex].hidden = !interactions[existingIndex].hidden;
  } else {
    interactions.push({
      userId: user.id,
      postId,
      hidden: true
    });
  }

  saveUserInteractions(interactions);
}

export function isPostViewed(postId: string): boolean {
  const interactions = getUserInteractions();
  const user = getCurrentUser();
  const interaction = interactions.find(i => i.userId === user.id && i.postId === postId);
  return interaction?.viewed || false;
}

export function isPostHidden(postId: string): boolean {
  const interactions = getUserInteractions();
  const user = getCurrentUser();
  const interaction = interactions.find(i => i.userId === user.id && i.postId === postId);
  return interaction?.hidden || false;
}

// Posts CRUD
export function getCommunityPosts(): CommunityPost[] {
  try {
    const stored = localStorage.getItem(POSTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading community posts:', error);
  }
  return [];
}

export function getCommunityPost(id: string): CommunityPost | null {
  const posts = getCommunityPosts();
  return posts.find(p => p.id === id) || null;
}

// ID counter management with random component to ensure uniqueness
const POST_COUNTER_KEY = 'community_post_counter';
const COMMENT_COUNTER_KEY = 'community_comment_counter';

function getPostCounter(): number {
  const stored = localStorage.getItem(POST_COUNTER_KEY);
  return stored ? parseInt(stored, 10) : 0;
}

function incrementPostCounter(): number {
  const counter = getPostCounter() + 1;
  localStorage.setItem(POST_COUNTER_KEY, counter.toString());
  return counter;
}

function getCommentCounter(): number {
  const stored = localStorage.getItem(COMMENT_COUNTER_KEY);
  return stored ? parseInt(stored, 10) : 0;
}

function incrementCommentCounter(): number {
  const counter = getCommentCounter() + 1;
  localStorage.setItem(COMMENT_COUNTER_KEY, counter.toString());
  return counter;
}

// Generate truly unique ID with random component
function generateUniqueId(prefix: string): string {
  const timestamp = Date.now();
  const counter = prefix === 'post' ? incrementPostCounter() : incrementCommentCounter();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${counter}-${random}`;
}

async function triggerCommunityNotification(payload: Record<string, unknown>): Promise<void> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return;

    const { error } = await supabase.functions.invoke('send-community-notification', {
      body: payload
    });

    if (error) {
      console.error('❌ Failed to trigger community notification:', error);
    }
  } catch (error) {
    console.error('❌ Error triggering community notification:', error);
  }
}

export function createCommunityPost(
  post: Omit<CommunityPost, 'id' | 'createdAt' | 'views' | 'commentCount' | 'followedBy' | 'authorId' | 'author'>,
  userOverride?: { id: string; name: string; isAdmin: boolean }
): CommunityPost {
  const posts = getCommunityPosts();
  const user = userOverride || getCurrentUser();

  // Generate unique ID using timestamp + counter + random
  const uniqueId = generateUniqueId('post');

  const newPost: CommunityPost = {
    ...post,
    id: uniqueId,
    author: user.name,
    authorId: user.id,
    createdAt: new Date().toISOString(),
    views: 0,
    commentCount: 0,
    followedBy: [user.id] // Auto-follow own posts
  };

  posts.unshift(newPost);
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));

  // Also save to Supabase if user has a real Supabase ID
  console.log('📝 Creating post - User ID:', user.id, 'Name:', user.name);
  if (user.id && !user.id.startsWith('user-demo')) {
    console.log('🔄 Saving post to Supabase...');
    communityService.createPost({
      title: post.title,
      content: post.content,
      author_id: user.id,
      author_name: user.name,
      category: post.category,
      tags: post.symptoms,
      is_pinned: false,
      status: 'active'
    }).then(result => {
      if (result) {
        console.log('✅ Post saved to Supabase successfully:', result);
      } else {
        console.error('❌ Post save returned null');
      }
      if (result) {
        triggerCommunityNotification({
          type: 'new_post',
          postId: result.id,
          postTitle: result.title,
          actorId: user.id,
          actorName: user.name
        });
      }
      // Dispatch event to refresh the list
      window.dispatchEvent(new CustomEvent('community-posts-updated'));
    }).catch(err => {
      console.error('❌ Failed to save post to Supabase:', err);
    });
  } else {
    console.log('⚠️ Not saving to Supabase - User ID:', user.id);
  }

  // Dispatch event immediately for localStorage
  window.dispatchEvent(new CustomEvent('community-posts-updated'));

  return newPost;
}

export function updateCommunityPost(id: string, updates: Partial<CommunityPost>): void {
  const posts = getCommunityPosts();
  const index = posts.findIndex(p => p.id === id);

  if (index !== -1) {
    posts[index] = {
      ...posts[index],
      ...updates,
      editedAt: new Date().toISOString()
    };
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    window.dispatchEvent(new CustomEvent('community-posts-updated'));
  }
}

export function deleteCommunityPost(id: string): void {
  const posts = getCommunityPosts().filter(p => p.id !== id);
  localStorage.setItem(POSTS_KEY, JSON.stringify(posts));

  // Also delete all comments for this post
  const comments = getCommunityComments().filter(c => c.postId !== id);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));

  // Also delete from Supabase
  console.log('🗑️ Deleting post from Supabase:', id);
  communityService.deletePost(id).then(success => {
    if (success) {
      console.log('✅ Post deleted from Supabase successfully');
    } else {
      console.error('❌ Failed to delete post from Supabase');
    }
  }).catch(err => {
    console.error('❌ Error deleting post from Supabase:', err);
  });

  window.dispatchEvent(new CustomEvent('community-posts-updated'));
}

export function incrementPostViews(id: string): void {
  const posts = getCommunityPosts();
  const index = posts.findIndex(p => p.id === id);

  if (index !== -1) {
    posts[index].views += 1;
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }
}

export function toggleFollowPost(postId: string): void {
  const posts = getCommunityPosts();
  const index = posts.findIndex(p => p.id === postId);
  const user = getCurrentUser();

  if (index !== -1) {
    const post = posts[index];
    const isFollowing = post.followedBy.includes(user.id);

    if (isFollowing) {
      post.followedBy = post.followedBy.filter(id => id !== user.id);
    } else {
      post.followedBy.push(user.id);
    }

    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    window.dispatchEvent(new CustomEvent('community-posts-updated'));
  }
}

// Comments CRUD
export function getCommunityComments(): CommunityComment[] {
  try {
    const stored = localStorage.getItem(COMMENTS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading community comments:', error);
  }
  return [];
}

export function getPostComments(postId: string): CommunityComment[] {
  const allComments = getCommunityComments();
  return allComments.filter(c => c.postId === postId);
}

export function createComment(
  comment: Omit<CommunityComment, 'id' | 'createdAt' | 'upvotes' | 'upvotedBy' | 'authorId' | 'author'>,
  userOverride?: { id: string; name: string; isAdmin: boolean }
): void {
  const comments = getCommunityComments();
  const user = userOverride || getCurrentUser();

  // Generate unique ID using timestamp + counter + random
  const uniqueId = generateUniqueId('comment');

  const newComment: CommunityComment = {
    ...comment,
    id: uniqueId,
    author: user.name,
    authorId: user.id,
    createdAt: new Date().toISOString(),
    upvotes: 0,
    upvotedBy: []
  };

  comments.push(newComment);
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));

  // Update post comment count
  const posts = getCommunityPosts();
  const postIndex = posts.findIndex(p => p.id === comment.postId);
  if (postIndex !== -1) {
    posts[postIndex].commentCount += 1;
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }

  // Also save to Supabase if user has a real Supabase ID
  console.log('💬 Creating comment - User ID:', user.id, 'Name:', user.name);
  if (user.id && !user.id.startsWith('user-demo')) {
    console.log('🔄 Saving comment to Supabase...');
    communityService.createComment({
      post_id: comment.postId,
      author_id: user.id,
      author_name: user.name,
      content: comment.content,
      parent_comment_id: comment.parentId,
      status: 'active'
    }).then(result => {
      if (result) {
        console.log('✅ Comment saved to Supabase successfully:', result);
      } else {
        console.error('❌ Comment save returned null');
      }
      if (result) {
        triggerCommunityNotification({
          type: 'reply_to_post',
          postId: comment.postId,
          commentId: result.id,
          actorId: user.id,
          actorName: user.name,
          commentContent: comment.content,
          parentCommentId: comment.parentId || null
        });
      }
      // Dispatch event to refresh the list
      window.dispatchEvent(new CustomEvent('community-posts-updated'));
    }).catch(err => {
      console.error('❌ Failed to save comment to Supabase:', err);
    });
  } else {
    console.log('⚠️ Not saving comment to Supabase - User ID:', user.id);
  }

  // Dispatch event immediately for localStorage
  window.dispatchEvent(new CustomEvent('community-posts-updated'));
}

export function updateComment(id: string, content: string): void {
  const comments = getCommunityComments();
  const index = comments.findIndex(c => c.id === id);

  if (index !== -1) {
    comments[index].content = content;
    comments[index].editedAt = new Date().toISOString();
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
    window.dispatchEvent(new CustomEvent('community-posts-updated'));
  }
}

export function deleteComment(id: string): void {
  const comments = getCommunityComments();
  const comment = comments.find(c => c.id === id);

  if (comment) {
    // Delete comment and all its replies
    const toDelete = [id];
    const findReplies = (parentId: string) => {
      comments
        .filter(c => c.parentId === parentId)
        .forEach(c => {
          toDelete.push(c.id);
          findReplies(c.id);
        });
    };
    findReplies(id);

    const filtered = comments.filter(c => !toDelete.includes(c.id));
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(filtered));

    // Update post comment count
    const posts = getCommunityPosts();
    const postIndex = posts.findIndex(p => p.id === comment.postId);
    if (postIndex !== -1) {
      posts[postIndex].commentCount -= toDelete.length;
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    }

    // Also delete from Supabase
    console.log('🗑️ Deleting comment from Supabase:', id);
    communityService.deleteComment(id, comment.postId).then(success => {
      if (success) {
        console.log('✅ Comment deleted from Supabase successfully');
      } else {
        console.error('❌ Failed to delete comment from Supabase');
      }
    }).catch(err => {
      console.error('❌ Error deleting comment from Supabase:', err);
    });

    window.dispatchEvent(new CustomEvent('community-posts-updated'));
  }
}

export function toggleUpvoteComment(
  commentId: string,
  userOverride?: { id: string; name: string; isAdmin: boolean }
): void {
  const comments = getCommunityComments();
  const index = comments.findIndex(c => c.id === commentId);
  const user = userOverride || getCurrentUser();

  if (index !== -1) {
    const comment = comments[index];
    const hasUpvoted = comment.upvotedBy.includes(user.id);

    if (hasUpvoted) {
      comment.upvotedBy = comment.upvotedBy.filter(id => id !== user.id);
      comment.upvotes -= 1;
    } else {
      comment.upvotedBy.push(user.id);
      comment.upvotes += 1;
    }

    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
    window.dispatchEvent(new CustomEvent('community-posts-updated'));
  }
}

export function markCommentAsUseful(commentId: string, postId: string): void {
  const comments = getCommunityComments();
  const posts = getCommunityPosts();

  const postIndex = posts.findIndex(p => p.id === postId);
  const user = getCurrentUser();

  // Only post author can mark comments as useful
  if (postIndex !== -1 && posts[postIndex].authorId === user.id) {
    // Toggle useful mark on the specific comment
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      comment.markedAsUseful = !comment.markedAsUseful;
    }

    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
    window.dispatchEvent(new CustomEvent('community-posts-updated'));
  }
}

// Helper: Get category info
export function getCategoryInfo(category: PostCategory): { label: string; emoji: string; color: string } {
  const categories = {
    help: { label: 'Need Help', emoji: '🆘', color: 'bg-red-100 text-red-700 border-red-200' },
    success: { label: 'Success Story', emoji: '✅', color: 'bg-green-100 text-green-700 border-green-200' },
    question: { label: 'Question', emoji: '💬', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    discussion: { label: 'Discussion', emoji: '💡', color: 'bg-purple-100 text-purple-700 border-purple-200' }
  };

  return categories[category];
}
