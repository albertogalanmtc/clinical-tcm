import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { communityService } from '../services/communityService';

export default function DebugCommunityPosts() {
  const [supabasePosts, setSupabasePosts] = useState<any[]>([]);
  const [activePosts, setActivePosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    // Get ALL posts from Supabase (no filters)
    const { data: allPosts } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });

    setSupabasePosts(allPosts || []);

    // Get active posts (what Community page uses)
    const active = await communityService.getActivePosts();
    setActivePosts(active);

    setLoading(false);
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Community Posts</h1>

      <div className="space-y-6">
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            All Posts in Supabase (no filters)
          </h2>
          <p className="text-gray-600 mb-4">Total: {supabasePosts.length}</p>

          {supabasePosts.length === 0 ? (
            <div className="text-gray-500">No posts found in Supabase</div>
          ) : (
            <div className="space-y-4">
              {supabasePosts.map(post => (
                <div key={post.id} className="border border-gray-200 rounded p-4 bg-gray-50">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>ID:</strong> {post.id}</div>
                    <div><strong>Status:</strong> <span className={post.status === 'active' ? 'text-green-600' : 'text-red-600'}>{post.status}</span></div>
                    <div><strong>Title:</strong> {post.title}</div>
                    <div><strong>Category:</strong> {post.category}</div>
                    <div><strong>Author ID:</strong> {post.author_id}</div>
                    <div><strong>Author Name:</strong> {post.author_name}</div>
                    <div><strong>Created:</strong> {new Date(post.created_at).toLocaleString()}</div>
                  </div>
                  <div className="mt-2">
                    <strong className="text-sm">Content:</strong>
                    <p className="text-sm text-gray-700 mt-1">{post.content.substring(0, 200)}...</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Active Posts (what Community page shows)
          </h2>
          <p className="text-gray-600 mb-4">Total: {activePosts.length}</p>

          {activePosts.length === 0 ? (
            <div className="text-gray-500">No active posts (status='active')</div>
          ) : (
            <div className="space-y-4">
              {activePosts.map(post => (
                <div key={post.id} className="border border-gray-200 rounded p-4 bg-green-50">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>Title:</strong> {post.title}</div>
                    <div><strong>Category:</strong> {post.category}</div>
                    <div><strong>Author:</strong> {post.author_name}</div>
                    <div><strong>Created:</strong> {new Date(post.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={loadData}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
        >
          Reload Data
        </button>
      </div>
    </div>
  );
}
