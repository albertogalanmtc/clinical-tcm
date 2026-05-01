import { useState, useEffect } from 'react';
import { Plus, MessageCircle, Eye, Calendar, User, Filter, Star, EyeOff, Loader2, ThumbsUp } from 'lucide-react';
import { communityService, type CommunityPost } from '../services/communityService';
import { getCurrentUser } from '../data/communityPosts';
import { NewPostModal } from '../components/community/NewPostModal';
import { PostDetailModal } from '../components/community/PostDetailModal';
import { markSectionAsVisited } from '../data/sectionVisits';
import { useUser } from '../contexts/UserContext';
import { hasUnreadContent } from '../data/postVisits';
import { communityTextToHtml } from '../utils/communityContent';

type FilterType = 'all' | 'myPosts';

export default function Community() {
  const userContext = useUser();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const currentUserId = userContext.userId || getCurrentUser().id;

  useEffect(() => {
    markSectionAsVisited('community');
    loadPosts();

    // Listen for new posts
    const handlePostsUpdated = () => {
      console.log('🔄 Posts updated event received, reloading...');
      loadPosts();
    };

    window.addEventListener('community-posts-updated', handlePostsUpdated);
    return () => window.removeEventListener('community-posts-updated', handlePostsUpdated);
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    const allPosts = await communityService.getActivePosts();
    setPosts(allPosts);
    setLoading(false);
  };

  const filteredPosts = posts.filter(post => {
    // Apply filter
    if (filter === 'myPosts' && post.author_id !== currentUserId) return false;

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        (post.tags && post.tags.some(t => t.toLowerCase().includes(query)))
      );
    }

    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-0">
        {/* Search and filters */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="text"
            placeholder="Search by title, content, or symptoms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-2 h-10 sm:h-11 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          {/* Mobile New Post Button - Icon only */}
          <button
            onClick={() => setShowNewPostModal(true)}
            className="sm:hidden flex items-center justify-center gap-2 w-10 h-10 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap flex-shrink-0"
            title="New Post"
          >
            <Plus className="w-[18px] h-[18px]" />
          </button>

          {/* Desktop New Post Button */}
          <button
            onClick={() => setShowNewPostModal(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 h-11 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium whitespace-nowrap flex-shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>New Post</span>
          </button>
        </div>

        {/* Filter toggle */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4">
          <div className="inline-flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
            <FilterButton
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              label="All"
              count={posts.length}
            />
            <FilterButton
              active={filter === 'myPosts'}
              onClick={() => setFilter('myPosts')}
              label="My Posts"
              count={posts.filter(p => p.author_id === currentUserId).length}
            />
          </div>
        </div>
      </div>

      {/* Posts list */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'No posts found' : 'No posts published yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? 'Try different search terms'
                : 'Be the first to share a post'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowNewPostModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Post
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onOpenPost={setSelectedPostId}
                isAdmin={userContext.isAdmin}
                userId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <NewPostModal
        isOpen={showNewPostModal}
        onClose={() => setShowNewPostModal(false)}
      />
      <PostDetailModal
        isOpen={selectedPostId !== null}
        onClose={() => {
          setSelectedPostId(null);
          // Force re-render to update unread status
          setPosts([...posts]);
        }}
        postId={selectedPostId}
      />
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  label,
  count
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`whitespace-nowrap px-4 py-2 text-sm font-medium rounded-md transition-colors flex-shrink-0 ${
        active
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {label} {count > 0 && `(${count})`}
    </button>
  );
}

function PostCard({ post, onOpenPost, isAdmin, userId }: { post: CommunityPost; onOpenPost: (id: string) => void; isAdmin: boolean; userId: string }) {
  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  };

  const timeAgo = getTimeAgo(new Date(post.created_at));
  const user = getCurrentUser();
  const hasUnread = hasUnreadContent(post.id, userId, post.comment_count);

  return (
    <div className="relative">
      {post.is_pinned && (
        <div className="absolute top-3 right-3 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full border border-yellow-200">
            ⭐ Pinned
          </span>
        </div>
      )}

      <div
        onClick={() => onOpenPost(post.id)}
        className={`block bg-white rounded-lg p-4 sm:p-6 border hover:shadow-md transition-all cursor-pointer ${
          hasUnread
            ? 'border-teal-500 hover:border-teal-600'
            : 'border-gray-200 hover:border-teal-500'
        }`}
      >
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{post.title}</h3>

        {/* Content preview */}
        <div
          className="text-gray-600 text-sm mb-4 line-clamp-2 whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: communityTextToHtml(post.content) }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 5).map((tag, idx) => (
              <span
                key={`${post.id}-tag-${idx}`}
                className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200"
              >
                {tag}
              </span>
            ))}
            {post.tags.length > 5 && (
              <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full border border-gray-200">
                +{post.tags.length - 5} more
              </span>
            )}
          </div>
        )}

        {/* Meta info */}
        <div className="space-y-2">
          {/* Author and date */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>{post.author_name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{timeAgo}</span>
            </div>
          </div>
          {/* Likes, comments, views */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <ThumbsUp className="w-4 h-4" />
              <span>{post.upvotes}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4" />
              <span>{post.comment_count} {post.comment_count === 1 ? 'reply' : 'replies'}</span>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4" />
                <span>{post.view_count} views</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
