import { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  User,
  Eye,
  MessageCircle,
  ThumbsUp,
  Star,
  Trash2,
  Edit2,
  Send,
  MoreVertical
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  getCommunityPost,
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
  toggleUpvoteComment,
  markCommentAsUseful,
  toggleFollowPost,
  getCurrentUser,
  markPostAsViewed,
  type CommunityComment,
  updateCommunityPost,
  deleteCommunityPost
} from '@/app/data/communityPosts';
import { TextEditor } from './TextEditor';
import { useUser } from '@/app/contexts/UserContext';
import { communityService } from '@/app/services/communityService';
import { markPostAsRead } from '../../data/postVisits';
import { supabase } from '@/app/lib/supabase';
import { communityTextToHtml } from '@/app/utils/communityContent';

interface PostDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string | null;
}

export function PostDetailModal({ isOpen, onClose, postId }: PostDetailModalProps) {
  const userContext = useUser();
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showPostMenu, setShowPostMenu] = useState(false);
  const [editingPost, setEditingPost] = useState(false);
  const [editPostContent, setEditPostContent] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteCommentConfirmOpen, setDeleteCommentConfirmOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [postUpvotes, setPostUpvotes] = useState(0);
  const [hasUpvotedPost, setHasUpvotedPost] = useState(false);

  const user = getCurrentUser();

  useEffect(() => {
    if (!postId || !isOpen) return;

    const loadPostData = async () => {
      setLoading(true);

      // Try to load from Supabase first
      const supabasePost = await communityService.getPostById(postId);

      if (supabasePost) {
        // Map Supabase fields to local format
        const mappedPost = {
          id: supabasePost.id,
          title: supabasePost.title,
          content: supabasePost.content,
          category: supabasePost.category,
          symptoms: supabasePost.tags || [],
          author: supabasePost.author_name,
          authorId: supabasePost.author_id,
          createdAt: supabasePost.created_at,
          editedAt: supabasePost.updated_at !== supabasePost.created_at ? supabasePost.updated_at : undefined,
          views: supabasePost.view_count || 0,
          commentCount: supabasePost.comment_count || 0,
          followedBy: [], // Not tracked in Supabase yet
          resolved: false // Not tracked in Supabase yet
        };
        setPost(mappedPost);
        setPostUpvotes(supabasePost.upvotes || 0);

        // Check if user has upvoted this post
        const upvotedPosts = JSON.parse(localStorage.getItem('upvoted_posts') || '[]');
        setHasUpvotedPost(upvotedPosts.includes(postId));

        // View count incremented by getPostById automatically
      } else {
        // Fallback to localStorage
        const localPost = getCommunityPost(postId);
        setPost(localPost);
        if (localPost) {
          markPostAsViewed(localPost.id);
          setPostUpvotes(0); // Local posts don't track upvotes
        }
      }

      await loadComments();
      setLoading(false);
    };

    loadPostData();

    const handleUpdate = () => {
      loadPostData();
    };

    window.addEventListener('community-posts-updated', handleUpdate);
    return () => window.removeEventListener('community-posts-updated', handleUpdate);
  }, [postId, isOpen]);

  // Mark post as read when loaded
  useEffect(() => {
    if (post && postId && !loading) {
      const userId = userContext.userId || getCurrentUser().id;
      markPostAsRead(postId, userId, post.commentCount || 0);
    }
  }, [post, postId, loading, userContext.userId]);

  const loadComments = async () => {
    if (!postId) return;

    // Try to load from Supabase first
    const supabaseComments = await communityService.getPostComments(postId);

    if (supabaseComments && supabaseComments.length > 0) {
      // Map Supabase comments to local format
      const mappedComments = supabaseComments.map(c => ({
        id: c.id,
        postId: c.post_id,
        parentId: c.parent_comment_id,
        author: c.author_name,
        authorId: c.author_id,
        content: c.content,
        createdAt: c.created_at,
        editedAt: c.updated_at !== c.created_at ? c.updated_at : undefined,
        upvotes: c.upvotes || 0,
        upvotedBy: [], // Not tracked yet
        markedAsUseful: false // Not tracked yet
      }));
      setComments(mappedComments);
    } else {
      // Fallback to localStorage
      const localComments = getPostComments(postId);
      setComments(localComments);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();

    const content = parentId ? editContent : newComment;
    if (!content.trim() || !postId) return;

    // Get user from UserContext or directly from Supabase session
    let userForComment = userContext.userId ? {
      id: userContext.userId,
      name: userContext.name,
      isAdmin: userContext.isAdmin
    } : undefined;

    // If userContext.userId is null, try to get it from Supabase session directly
    if (!userForComment) {
      console.log('⚠️ UserContext.userId is null for comment, checking Supabase session...');
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        console.log('✅ Found Supabase session for comment:', session.user.id);

        // Get user name from users table
        const { data: userProfile } = await supabase
          .from('users')
          .select('first_name, last_name, role')
          .eq('id', session.user.id)
          .single();

        if (userProfile) {
          userForComment = {
            id: session.user.id,
            name: `${userProfile.first_name} ${userProfile.last_name}`.trim(),
            isAdmin: userProfile.role === 'admin'
          };
          console.log('✅ Got user from Supabase for comment:', userForComment);
        }
      }
    }

    createComment({
      postId,
      content: content.trim(),
      parentId
    }, userForComment);

    if (parentId) {
      setReplyingTo(null);
      setEditContent('');
    } else {
      setNewComment('');
    }

    // Reload comments to show the new one
    setTimeout(() => loadComments(), 500);
  };

  const handleEditComment = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setEditingComment(commentId);
      setEditContent(comment.content);
    }
  };

  const handleSaveEdit = (commentId: string) => {
    if (editContent.trim()) {
      updateComment(commentId, editContent.trim());
      setEditingComment(null);
      setEditContent('');
    }
  };

  const handleDeleteComment = (commentId: string) => {
    setCommentToDelete(commentId);
    setDeleteCommentConfirmOpen(true);
  };

  const confirmDeleteComment = () => {
    if (commentToDelete) {
      deleteComment(commentToDelete);
      setCommentToDelete(null);
      setDeleteCommentConfirmOpen(false);
    }
  };

  const handleToggleFollow = () => {
    if (post) {
      toggleFollowPost(post.id);
      setPost(getCommunityPost(postId!));
    }
  };

  const handleToggleResolved = () => {
    if (post) {
      updateCommunityPost(post.id, { resolved: !post.resolved });
      setPost(getCommunityPost(postId!));
    }
  };

  const handleDeletePost = () => {
    setShowPostMenu(false);
    setDeleteConfirmOpen(true);
  };

  const confirmDeletePost = () => {
    if (post) {
      deleteCommunityPost(post.id);
      setDeleteConfirmOpen(false);
      onClose();
    }
  };

  const handleEditPost = () => {
    if (post) {
      setEditPostContent(post.content);
      setEditingPost(true);
      setShowPostMenu(false);
    }
  };

  const handleSavePost = () => {
    if (post && editPostContent.trim()) {
      updateCommunityPost(post.id, { content: editPostContent.trim() });
      setEditingPost(false);
      setPost(getCommunityPost(postId!));
    }
  };

  const handleCancelEditPost = () => {
    setEditingPost(false);
    setEditPostContent('');
  };

  const handleUpvotePost = async () => {
    if (!postId || hasUpvotedPost) return;

    // Update Supabase
    const success = await communityService.upvotePost(postId);

    if (success) {
      // Update local state
      setPostUpvotes(prev => prev + 1);
      setHasUpvotedPost(true);

      // Save to localStorage
      const upvotedPosts = JSON.parse(localStorage.getItem('upvoted_posts') || '[]');
      upvotedPosts.push(postId);
      localStorage.setItem('upvoted_posts', JSON.stringify(upvotedPosts));
    }
  };

  const handleCloseModal = (open: boolean) => {
    if (!open) {
      // Reset editing state when modal closes
      setEditingPost(false);
      setEditPostContent('');
    }
    onClose();
  };

  if (loading || !post) {
    return (
      <Dialog.Root open={isOpen} onOpenChange={handleCloseModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[70]" />
          <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:max-w-4xl w-full sm:max-h-[90vh] overflow-hidden z-[80] flex items-center justify-center" aria-describedby="loading-description">
            <Dialog.Title className="sr-only">Loading</Dialog.Title>
            <Dialog.Description id="loading-description" className="sr-only">
              Loading case details
            </Dialog.Description>
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <p className="mt-4 text-gray-600">Loading case...</p>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }

  const timeAgo = getTimeAgo(new Date(post.createdAt));
  const isFollowing = post.followedBy?.includes(user.id) || false;
  const isAuthor = post.authorId === user.id || post.authorId === userContext.userId;

  // Organize comments in tree structure
  const topLevelComments = comments.filter(c => !c.parentId);

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleCloseModal}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[70]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:max-w-4xl w-full sm:max-h-[90vh] overflow-hidden z-[80] flex flex-col" aria-describedby="post-detail-description">
          <Dialog.Description id="post-detail-description" className="sr-only">
            Clinical case detail
          </Dialog.Description>

          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <Dialog.Title className="flex-1 text-2xl font-bold text-gray-900 line-clamp-1">
                {post.title}
              </Dialog.Title>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleFollow}
                  className="p-2 rounded-lg transition-colors hover:bg-gray-100"
                  title={isFollowing ? 'Unfollow' : 'Follow case'}
                >
                  <Star className={`w-5 h-5 ${isFollowing ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                </button>
                {(isAuthor || userContext.isAdmin) && (
                  <div className="relative">
                    <button
                      onClick={() => setShowPostMenu(!showPostMenu)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {showPostMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        {isAuthor && (
                          <>
                            <button
                              onClick={handleEditPost}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit post
                            </button>
                            <button
                              onClick={() => {
                                handleToggleResolved();
                                setShowPostMenu(false);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                            >
                              {post.resolved ? 'Mark as unresolved' : 'Mark as resolved'}
                            </button>
                          </>
                        )}
                        <button
                          onClick={handleDeletePost}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete post
                        </button>
                      </div>
                    )}
                  </div>
                )}
                <Dialog.Close className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </Dialog.Close>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Post content */}
            <div className="mb-6">
              {/* Status */}
              {post.resolved && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700 border border-green-200">
                    ✓ Resolved
                  </span>
                </div>
              )}

              {/* Symptoms */}
              {post.symptoms && post.symptoms.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.symptoms.map((symptom, idx) => (
                    <span
                      key={`${post.id}-symptom-${idx}`}
                      className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs rounded-full border border-amber-200"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              )}

              {/* Content */}
              {editingPost ? (
                <div className="mb-6">
                  <TextEditor
                    value={editPostContent}
                    onChange={setEditPostContent}
                    placeholder="Edit case description..."
                    minHeight="300px"
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={handleSavePost}
                      className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={handleCancelEditPost}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none mb-6">
                  <div
                    className="whitespace-pre-wrap text-gray-700"
                    dangerouslySetInnerHTML={{ __html: communityTextToHtml(post.content) }}
                  />
                </div>
              )}

              {/* Meta */}
              <div className="space-y-2 pt-4 border-t border-gray-200">
                {/* Author and date */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>{timeAgo}</span>
                  </div>
                </div>
                {/* Likes, comments, views */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <button
                    onClick={handleUpvotePost}
                    disabled={hasUpvotedPost}
                    className={`flex items-center gap-1.5 transition-colors ${
                      hasUpvotedPost
                        ? 'text-teal-600 cursor-default'
                        : 'hover:text-teal-600 cursor-pointer'
                    }`}
                    title={hasUpvotedPost ? 'Already upvoted' : 'Upvote'}
                  >
                    <ThumbsUp className={`w-4 h-4 ${hasUpvotedPost ? 'fill-current' : ''}`} />
                    <span>{postUpvotes}</span>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.commentCount} {post.commentCount === 1 ? 'reply' : 'replies'}</span>
                  </div>
                  {userContext.isAdmin && (
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>{post.views} views</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Comments section */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Replies ({comments.length})
              </h3>

              {/* New comment form */}
              <form onSubmit={(e) => handleSubmitComment(e)} className="mb-6">
                <TextEditor
                  value={newComment}
                  onChange={setNewComment}
                  placeholder="Share your experience or suggestions..."
                  minHeight="100px"
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!newComment.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    Reply
                  </button>
                </div>
              </form>

              {/* Comments list */}
              <div className="space-y-4">
                {topLevelComments.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No replies yet. Be the first to comment!
                  </p>
                ) : (
                  topLevelComments.map(comment => (
                    <CommentItem
                      key={comment.id}
                      comment={comment}
                      allComments={comments}
                      postAuthorId={post.authorId}
                      onReply={(id) => {
                        setReplyingTo(id);
                        setEditContent('');
                      }}
                      onEdit={handleEditComment}
                      onDelete={handleDeleteComment}
                      onSaveEdit={handleSaveEdit}
                      onCancelEdit={() => {
                        setEditingComment(null);
                        setEditContent('');
                      }}
                      onUpvote={toggleUpvoteComment}
                      onMarkUseful={(commentId) => markCommentAsUseful(commentId, post.id)}
                      replyingTo={replyingTo}
                      editingComment={editingComment}
                      editContent={editContent}
                      setEditContent={setEditContent}
                      onSubmitReply={handleSubmitComment}
                      onCancelReply={() => {
                        setReplyingTo(null);
                        setEditContent('');
                      }}
                      isAdmin={userContext.isAdmin}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>

      {/* Delete Post Confirmation Modal */}
      <Dialog.Root open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-[100]" aria-describedby="delete-post-description">
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
              Confirmar eliminación
            </Dialog.Title>
            <Dialog.Description id="delete-post-description" className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar este post? Esta acción no se puede deshacer.
            </Dialog.Description>
            <div className="flex gap-3 justify-end">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                onClick={confirmDeletePost}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Comment Confirmation Modal */}
      <Dialog.Root open={deleteCommentConfirmOpen} onOpenChange={setDeleteCommentConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-[100]" aria-describedby="delete-comment-description">
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
              Confirmar eliminación
            </Dialog.Title>
            <Dialog.Description id="delete-comment-description" className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.
            </Dialog.Description>
            <div className="flex gap-3 justify-end">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                onClick={confirmDeleteComment}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Dialog.Root>
  );
}

interface CommentItemProps {
  comment: CommunityComment;
  allComments: CommunityComment[];
  postAuthorId: string;
  onReply: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onUpvote: (id: string) => void;
  onMarkUseful: (id: string) => void;
  replyingTo: string | null;
  editingComment: string | null;
  editContent: string;
  setEditContent: (content: string) => void;
  onSubmitReply: (e: React.FormEvent, parentId: string) => void;
  onCancelReply: () => void;
  level?: number;
  isAdmin?: boolean;
}

function CommentItem({
  comment,
  allComments,
  postAuthorId,
  onReply,
  onEdit,
  onDelete,
  onSaveEdit,
  onCancelEdit,
  onUpvote,
  onMarkUseful,
  replyingTo,
  editingComment,
  editContent,
  setEditContent,
  onSubmitReply,
  onCancelReply,
  level = 0,
  isAdmin = false
}: CommentItemProps) {
  const user = getCurrentUser();
  const isAuthor = comment.authorId === user.id;
  const isPostAuthor = comment.authorId === postAuthorId;
  const hasUpvoted = comment.upvotedBy.includes(user.id);
  const canMarkUseful = user.id === postAuthorId; // Author can always mark/unmark
  const isMarkedUseful = comment.markedAsUseful;
  const timeAgo = getTimeAgo(new Date(comment.createdAt));

  const replies = allComments.filter(c => c.parentId === comment.id);

  return (
    <div className={`${level > 0 ? 'ml-8 sm:ml-12 pl-4 border-l-2 border-gray-200' : ''}`}>
      <div className="bg-gray-50 rounded-lg p-4">
        {/* Comment header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900">{comment.author}</span>
            {isPostAuthor && (
              <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs rounded-full border border-teal-200">
                Author
              </span>
            )}
            <span className="text-sm text-gray-500">{timeAgo}</span>
            {comment.editedAt && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
          </div>
          {comment.markedAsUseful && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
              <Star className="w-3.5 h-3.5 fill-current" />
              Useful
            </div>
          )}
        </div>

        {/* Comment content */}
        {editingComment === comment.id ? (
          <div className="mb-3">
            <TextEditor
              value={editContent}
              onChange={setEditContent}
              placeholder="Edit comment..."
              minHeight="80px"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onSaveEdit(comment.id)}
                className="px-3 py-1.5 bg-teal-600 text-white rounded-md text-sm hover:bg-teal-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={onCancelEdit}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p
            className="text-gray-700 text-sm mb-3 whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: communityTextToHtml(comment.content) }}
          />
        )}

        {/* Comment actions */}
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={() => onUpvote(comment.id)}
            className={`flex items-center gap-1 hover:text-teal-600 transition-colors ${
              hasUpvoted ? 'text-teal-600 font-medium' : 'text-gray-600'
            }`}
            title="Like"
          >
            <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-current' : ''}`} />
            {comment.upvotes > 0 && <span>{comment.upvotes}</span>}
          </button>

          <button
            onClick={() => onReply(comment.id)}
            className="text-gray-600 hover:text-teal-600 transition-colors"
            title="Reply"
          >
            <MessageCircle className="w-4 h-4" />
          </button>

          {canMarkUseful && (
            <button
              onClick={() => onMarkUseful(comment.id)}
              className={`flex items-center gap-1 transition-colors ${
                isMarkedUseful
                  ? 'text-amber-600 hover:text-amber-700 font-medium'
                  : 'text-gray-600 hover:text-amber-600'
              }`}
              title={isMarkedUseful ? "Unmark as useful" : "Mark as useful"}
            >
              <Star className={`w-4 h-4 ${isMarkedUseful ? 'fill-current' : ''}`} />
            </button>
          )}

          {isAuthor && (
            <button
              onClick={() => onEdit(comment.id)}
              className="text-gray-600 hover:text-blue-600 transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}

          {(isAuthor || isAdmin) && (
            <button
              onClick={() => onDelete(comment.id)}
              className="text-gray-600 hover:text-red-600 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Reply form */}
        {replyingTo === comment.id && (
          <form onSubmit={(e) => onSubmitReply(e, comment.id)} className="mt-4">
            <TextEditor
              value={editContent}
              onChange={setEditContent}
              placeholder="Write your reply..."
              minHeight="80px"
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                disabled={!editContent.trim()}
                className="px-3 py-1.5 bg-teal-600 text-white rounded-md text-sm hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                Send
              </button>
              <button
                type="button"
                onClick={onCancelReply}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Nested replies */}
      {replies.length > 0 && level < 3 && (
        <div className="mt-4 space-y-4">
          {replies.map(reply => (
            <CommentItem
              key={reply.id}
              comment={reply}
              allComments={allComments}
              postAuthorId={postAuthorId}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onSaveEdit={onSaveEdit}
              onCancelEdit={onCancelEdit}
              onUpvote={onUpvote}
              onMarkUseful={onMarkUseful}
              replyingTo={replyingTo}
              editingComment={editingComment}
              editContent={editContent}
              setEditContent={setEditContent}
              onSubmitReply={onSubmitReply}
              onCancelReply={onCancelReply}
              level={level + 1}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
}
