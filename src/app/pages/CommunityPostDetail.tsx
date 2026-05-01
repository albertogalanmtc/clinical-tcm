import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  User,
  Eye,
  MessageCircle,
  ThumbsUp,
  Star,
  Bell,
  BellOff,
  Trash2,
  Edit2,
  Send,
  MoreVertical
} from 'lucide-react';
import {
  getCommunityPost,
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
  toggleUpvoteComment,
  markCommentAsUseful,
  incrementPostViews,
  toggleFollowPost,
  getCurrentUser,
  getCategoryInfo,
  markPostAsViewed,
  type CommunityComment,
  updateCommunityPost,
  deleteCommunityPost
} from '../data/communityPosts';
import { communityTextToHtml } from '../utils/communityContent';

export default function CommunityPostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState(getCommunityPost(postId!));
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showPostMenu, setShowPostMenu] = useState(false);

  const user = getCurrentUser();

  useEffect(() => {
    if (!post) {
      navigate('/community');
      return;
    }

    incrementPostViews(post.id);
    markPostAsViewed(post.id); // Mark as viewed when opening the post
    loadComments();

    const handleUpdate = () => {
      setPost(getCommunityPost(postId!));
      loadComments();
    };

    window.addEventListener('community-posts-updated', handleUpdate);
    return () => window.removeEventListener('community-posts-updated', handleUpdate);
  }, [postId, navigate]);

  const loadComments = () => {
    const postComments = getPostComments(postId!);
    setComments(postComments);
  };

  const handleSubmitComment = (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();

    const content = parentId ? editContent : newComment;
    if (!content.trim()) return;

    createComment({
      postId: postId!,
      content: content.trim(),
      parentId
    });

    if (parentId) {
      setReplyingTo(null);
      setEditContent('');
    } else {
      setNewComment('');
    }
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
    if (confirm('¿Eliminar este comentario?')) {
      deleteComment(commentId);
    }
  };

  const handleToggleFollow = () => {
    toggleFollowPost(post!.id);
    setPost(getCommunityPost(postId!));
  };

  const handleToggleResolved = () => {
    updateCommunityPost(post!.id, { resolved: !post!.resolved });
    setPost(getCommunityPost(postId!));
  };

  const handleDeletePost = () => {
    if (confirm('¿Eliminar este caso permanentemente?')) {
      deleteCommunityPost(post!.id);
      navigate('/community');
    }
  };

  if (!post) return null;

  const categoryInfo = getCategoryInfo(post.category);
  const timeAgo = getTimeAgo(new Date(post.createdAt));
  const isFollowing = post.followedBy.includes(user.id);
  const isAuthor = post.authorId === user.id;

  // Organize comments in tree structure
  const topLevelComments = comments.filter(c => !c.parentId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={() => navigate('/community')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 line-clamp-1">{post.title}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleFollow}
                className={`p-2 rounded-lg transition-colors ${
                  isFollowing ? 'bg-teal-100 text-teal-700' : 'hover:bg-gray-100'
                }`}
                title={isFollowing ? 'Dejar de seguir' : 'Seguir caso'}
              >
                {isFollowing ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              </button>
              {isAuthor && (
                <div className="relative">
                  <button
                    onClick={() => setShowPostMenu(!showPostMenu)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </button>
                  {showPostMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                      <button
                        onClick={() => {
                          handleToggleResolved();
                          setShowPostMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                      >
                        {post.resolved ? 'Marcar como no resuelto' : 'Marcar como resuelto'}
                      </button>
                      <button
                        onClick={() => {
                          handleDeletePost();
                          setShowPostMenu(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Eliminar caso
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Post card */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6">
          {/* Category and status */}
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border ${categoryInfo.color}`}>
              <span>{categoryInfo.emoji}</span>
              <span>{categoryInfo.label}</span>
            </span>
            {post.resolved && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700 border border-green-200">
                ✓ Resuelto
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{post.title}</h2>

          {/* Symptoms */}
          {post.symptoms && post.symptoms.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.symptoms.map((symptom, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-teal-50 text-teal-700 text-sm rounded-full border border-teal-200"
                >
                  {symptom}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="prose prose-sm max-w-none mb-6">
            <div
              className="whitespace-pre-wrap text-gray-700"
              dangerouslySetInnerHTML={{ __html: communityTextToHtml(post.content) }}
            />
          </div>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span className="font-medium">{post.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{timeAgo}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>{post.views} vistas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4" />
              <span>{post.commentCount} {post.commentCount === 1 ? 'respuesta' : 'respuestas'}</span>
            </div>
          </div>
        </div>

        {/* Comments section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Respuestas ({comments.length})
          </h3>

          {/* New comment form */}
          <form onSubmit={(e) => handleSubmitComment(e)} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Comparte tu experiencia o sugerencias..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[100px] text-sm"
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Responder
              </button>
            </div>
          </form>

          {/* Comments list */}
          <div className="space-y-4">
            {topLevelComments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                Aún no hay respuestas. ¡Sé el primero en comentar!
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
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
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
  level = 0
}: CommentItemProps) {
  const user = getCurrentUser();
  const isAuthor = comment.authorId === user.id;
  const isPostAuthor = comment.authorId === postAuthorId;
  const hasUpvoted = comment.upvotedBy.includes(user.id);
  const canMarkUseful = user.id === postAuthorId && !comment.markedAsUseful;
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
                Autor
              </span>
            )}
            <span className="text-sm text-gray-500">{timeAgo}</span>
            {comment.editedAt && (
              <span className="text-xs text-gray-400">(editado)</span>
            )}
          </div>
          {comment.markedAsUseful && (
            <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
              <Star className="w-3.5 h-3.5 fill-current" />
              Útil
            </div>
          )}
        </div>

        {/* Comment content */}
        {editingComment === comment.id ? (
          <div className="mb-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[80px] text-sm"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => onSaveEdit(comment.id)}
                className="px-3 py-1.5 bg-teal-600 text-white rounded-md text-sm hover:bg-teal-700 transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={onCancelEdit}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors"
              >
                Cancelar
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
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={() => onUpvote(comment.id)}
            className={`flex items-center gap-1.5 hover:text-teal-600 transition-colors ${
              hasUpvoted ? 'text-teal-600 font-medium' : 'text-gray-600'
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${hasUpvoted ? 'fill-current' : ''}`} />
            <span>{comment.upvotes > 0 ? comment.upvotes : 'Me gusta'}</span>
          </button>

          <button
            onClick={() => onReply(comment.id)}
            className="flex items-center gap-1.5 text-gray-600 hover:text-teal-600 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            Responder
          </button>

          {canMarkUseful && (
            <button
              onClick={() => onMarkUseful(comment.id)}
              className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 transition-colors"
            >
              <Star className="w-4 h-4" />
              Marcar útil
            </button>
          )}

          {isAuthor && (
            <>
              <button
                onClick={() => onEdit(comment.id)}
                className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
              <button
                onClick={() => onDelete(comment.id)}
                className="flex items-center gap-1.5 text-gray-600 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </>
          )}
        </div>

        {/* Reply form */}
        {replyingTo === comment.id && (
          <form onSubmit={(e) => onSubmitReply(e, comment.id)} className="mt-4">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Escribe tu respuesta..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[80px] text-sm"
              autoFocus
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                disabled={!editContent.trim()}
                className="px-3 py-1.5 bg-teal-600 text-white rounded-md text-sm hover:bg-teal-700 transition-colors disabled:opacity-50"
              >
                Enviar
              </button>
              <button
                type="button"
                onClick={onCancelReply}
                className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50 transition-colors"
              >
                Cancelar
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

  if (diffMins < 1) return 'ahora';
  if (diffMins < 60) return `hace ${diffMins}m`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays < 7) return `hace ${diffDays}d`;
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}
