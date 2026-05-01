import { supabase } from '../lib/supabase';

export interface CommunityPost {
  id: string;
  title: string;
  content: string;
  author_id: string;
  author_name: string;
  category?: string;
  tags?: string[];
  upvotes: number;
  view_count: number;
  comment_count: number;
  is_pinned: boolean;
  status: 'active' | 'inactive' | 'flagged';
  created_at: string;
  updated_at: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  content: string;
  upvotes: number;
  parent_comment_id?: string;
  status: 'active' | 'inactive' | 'flagged';
  created_at: string;
  updated_at: string;
}

export const communityService = {
  // Posts
  async getActivePosts(): Promise<CommunityPost[]> {
    console.log('Fetching active community posts from Supabase...');
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .eq('status', 'active')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching active posts:', error);
      return [];
    }

    console.log('Active community posts from Supabase:', data);
    return data || [];
  },

  async getAllPosts(): Promise<CommunityPost[]> {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all posts:', error);
      return [];
    }

    return data || [];
  },

  async getPostById(id: string): Promise<CommunityPost | null> {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching post:', error);
      return null;
    }

    if (!data) {
      console.log(`Post with id ${id} not found`);
      return null;
    }

    // Increment view count
    await supabase
      .from('community_posts')
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq('id', id);

    return data;
  },

  async createPost(post: Omit<CommunityPost, 'id' | 'upvotes' | 'view_count' | 'comment_count' | 'created_at' | 'updated_at'>): Promise<CommunityPost | null> {
    console.log('🔵 communityService.createPost called with:', post);

    const { data, error } = await supabase
      .from('community_posts')
      .insert([{
        ...post,
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating post in Supabase:', error);
      return null;
    }

    console.log('✅ Post created in Supabase successfully:', data);
    return data;
  },

  async updatePost(id: string, updates: Partial<CommunityPost>): Promise<CommunityPost | null> {
    const { data, error } = await supabase
      .from('community_posts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating post:', error);
      return null;
    }

    return data;
  },

  async deletePost(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting post:', error);
      return false;
    }

    return true;
  },

  async upvotePost(id: string, shouldUpvote = true): Promise<boolean> {
    const { data: post } = await supabase
      .from('community_posts')
      .select('upvotes')
      .eq('id', id)
      .single();

    if (!post) return false;

    const nextUpvotes = Math.max(0, (post.upvotes || 0) + (shouldUpvote ? 1 : -1));
    const { error } = await supabase
      .from('community_posts')
      .update({ upvotes: nextUpvotes })
      .eq('id', id);

    return !error;
  },

  // Comments
  async getPostComments(postId: string): Promise<CommunityComment[]> {
    const { data, error } = await supabase
      .from('community_comments')
      .select('*')
      .eq('post_id', postId)
      .eq('status', 'active')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      return [];
    }

    return data || [];
  },

  async createComment(comment: Omit<CommunityComment, 'id' | 'upvotes' | 'created_at' | 'updated_at'>): Promise<CommunityComment | null> {
    console.log('🔵 communityService.createComment called with:', comment);

    const { data, error } = await supabase
      .from('community_comments')
      .insert([{
        ...comment,
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating comment in Supabase:', error);
      return null;
    }

    // Update post comment count
    const { data: post } = await supabase
      .from('community_posts')
      .select('comment_count')
      .eq('id', comment.post_id)
      .single();

    if (post) {
      await supabase
        .from('community_posts')
        .update({ comment_count: (post.comment_count || 0) + 1 })
        .eq('id', comment.post_id);
    }

    return data;
  },

  async deleteComment(id: string, postId: string): Promise<boolean> {
    const { error } = await supabase
      .from('community_comments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting comment:', error);
      return false;
    }

    // Update post comment count
    const { data: post } = await supabase
      .from('community_posts')
      .select('comment_count')
      .eq('id', postId)
      .single();

    if (post) {
      await supabase
        .from('community_posts')
        .update({ comment_count: Math.max(0, (post.comment_count || 0) - 1) })
        .eq('id', postId);
    }

    return true;
  },

  async upvoteComment(id: string, shouldUpvote = true): Promise<boolean> {
    const { data: comment } = await supabase
      .from('community_comments')
      .select('upvotes')
      .eq('id', id)
      .single();

    if (!comment) return false;

    const nextUpvotes = Math.max(0, (comment.upvotes || 0) + (shouldUpvote ? 1 : -1));
    const { error } = await supabase
      .from('community_comments')
      .update({ upvotes: nextUpvotes })
      .eq('id', id);

    return !error;
  },
};
