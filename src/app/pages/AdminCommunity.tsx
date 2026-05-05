import { useState, useEffect } from 'react';
import { Users, MessageCircle, ThumbsUp, TrendingUp, Award, Search } from 'lucide-react';
import { getCommunityPosts, getCommunityComments, type CommunityPost, type CommunityComment } from '../data/communityPosts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

interface UserStats {
  userId: string;
  userName: string;
  postsCreated: number;
  commentsCreated: number;
  likesReceived: number;
  usefulMarks: number;
  points: number;
  level: 'Amateur' | 'Contribuidor' | 'Experto' | 'Autoridad';
  rank: number;
}

const LEVEL_THRESHOLDS = {
  Amateur: 0,
  Contribuidor: 10,
  Experto: 50,
  Autoridad: 150
};

const LEVEL_COLORS = {
  Amateur: 'bg-gray-100 text-gray-700 border-gray-300',
  Contribuidor: 'bg-blue-100 text-blue-700 border-blue-300',
  Experto: 'bg-purple-100 text-purple-700 border-purple-300',
  Autoridad: 'bg-yellow-100 text-yellow-700 border-yellow-300'
};

const LEVEL_ICONS = {
  Amateur: '🌱',
  Contribuidor: '⭐',
  Experto: '🏆',
  Autoridad: '👑'
};

function calculateLevel(points: number): 'Amateur' | 'Contribuidor' | 'Experto' | 'Autoridad' {
  if (points >= LEVEL_THRESHOLDS.Autoridad) return 'Autoridad';
  if (points >= LEVEL_THRESHOLDS.Experto) return 'Experto';
  if (points >= LEVEL_THRESHOLDS.Contribuidor) return 'Contribuidor';
  return 'Amateur';
}

function calculatePoints(stats: Pick<UserStats, 'commentsCreated' | 'likesReceived' | 'usefulMarks'>): number {
  // 2 points per comment created
  // 1 point per like received
  // 5 points per useful mark
  return (stats.commentsCreated * 2) + (stats.likesReceived * 1) + (stats.usefulMarks * 5);
}

export default function AdminCommunity() {
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'points' | 'posts' | 'comments' | 'likes'>('points');

  useEffect(() => {
    loadStats();

    const handleUpdate = () => loadStats();
    window.addEventListener('community-posts-updated', handleUpdate);

    return () => {
      window.removeEventListener('community-posts-updated', handleUpdate);
    };
  }, []);

  const loadStats = () => {
    const posts = getCommunityPosts();
    const comments = getCommunityComments();

    // Build user stats map
    const statsMap = new Map<string, UserStats>();

    // Count posts
    posts.forEach(post => {
      if (!statsMap.has(post.authorId)) {
        statsMap.set(post.authorId, {
          userId: post.authorId,
          userName: post.author,
          postsCreated: 0,
          commentsCreated: 0,
          likesReceived: 0,
          usefulMarks: 0,
          points: 0,
          level: 'Amateur',
          rank: 0
        });
      }
      const stats = statsMap.get(post.authorId)!;
      stats.postsCreated += 1;
    });

    // Count comments and likes
    comments.forEach(comment => {
      if (!statsMap.has(comment.authorId)) {
        statsMap.set(comment.authorId, {
          userId: comment.authorId,
          userName: comment.author,
          postsCreated: 0,
          commentsCreated: 0,
          likesReceived: 0,
          usefulMarks: 0,
          points: 0,
          level: 'Amateur',
          rank: 0
        });
      }
      const stats = statsMap.get(comment.authorId)!;
      stats.commentsCreated += 1;
      stats.likesReceived += comment.upvotes;
      if (comment.markedAsUseful) {
        stats.usefulMarks += 1;
      }
    });

    // Calculate points and levels
    const usersArray = Array.from(statsMap.values()).map(stats => {
      const points = calculatePoints(stats);
      const level = calculateLevel(points);
      return { ...stats, points, level };
    });

    // Sort by points and assign ranks
    usersArray.sort((a, b) => b.points - a.points);
    usersArray.forEach((user, index) => {
      user.rank = index + 1;
    });

    setUserStats(usersArray);
  };

  // Filter and sort
  const filteredUsers = userStats
    .filter(user => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        user.userName.toLowerCase().includes(query) ||
        user.level.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'points':
          return b.points - a.points;
        case 'posts':
          return b.postsCreated - a.postsCreated;
        case 'comments':
          return b.commentsCreated - a.commentsCreated;
        case 'likes':
          return b.likesReceived - a.likesReceived;
        default:
          return 0;
      }
    });

  // Overall stats
  const totalUsers = userStats.length;
  const totalPosts = userStats.reduce((sum, u) => sum + u.postsCreated, 0);
  const totalComments = userStats.reduce((sum, u) => sum + u.commentsCreated, 0);
  const totalLikes = userStats.reduce((sum, u) => sum + u.likesReceived, 0);

  // Level distribution
  const levelDistribution = [
    { id: 'level-amateur', name: 'Amateur', value: userStats.filter(u => u.level === 'Amateur').length, color: '#9CA3AF' },
    { id: 'level-contribuidor', name: 'Contribuidor', value: userStats.filter(u => u.level === 'Contribuidor').length, color: '#3B82F6' },
    { id: 'level-experto', name: 'Experto', value: userStats.filter(u => u.level === 'Experto').length, color: '#A855F7' },
    { id: 'level-autoridad', name: 'Autoridad', value: userStats.filter(u => u.level === 'Autoridad').length, color: '#F59E0B' }
  ];

  // Top contributors chart data
  const topContributors = userStats.slice(0, 10).map((user, index) => ({
    id: `contributor-${user.userId}-${index}`,
    name: user.userName.length > 15 ? user.userName.substring(0, 15) + '...' : user.userName,
    points: user.points
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {isSpanish ? 'Estadísticas de la comunidad' : 'Community Statistics'}
        </h1>
        <p className="text-gray-600">
          {isSpanish ? 'Monitoriza la participación y la interacción de los usuarios en la comunidad' : 'Monitor user participation and engagement in the community'}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label={isSpanish ? 'Usuarios activos' : 'Active Users'}
          value={totalUsers}
          color="text-blue-600"
          bgColor="bg-blue-50"
        />
        <StatCard
          icon={MessageCircle}
          label={isSpanish ? 'Total de publicaciones' : 'Total Posts'}
          value={totalPosts}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
        <StatCard
          icon={MessageCircle}
          label={isSpanish ? 'Total de comentarios' : 'Total Comments'}
          value={totalComments}
          color="text-green-600"
          bgColor="bg-green-50"
        />
        <StatCard
          icon={ThumbsUp}
          label={isSpanish ? 'Total de me gusta' : 'Total Likes'}
          value={totalLikes}
          color="text-yellow-600"
          bgColor="bg-yellow-50"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Level Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {isSpanish ? 'Distribución por nivel' : 'Level Distribution'}
          </h2>
          {totalUsers > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={levelDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {levelDistribution.map((entry) => (
                    <Cell key={entry.id} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No data available
            </div>
          )}
        </div>

        {/* Top Contributors */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {isSpanish ? 'Top 10 colaboradores' : 'Top 10 Contributors'}
          </h2>
          {topContributors.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topContributors} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={120} />
                <Tooltip />
                <Bar dataKey="points" fill="#14B8A6" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Level System Explanation */}
      <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border border-teal-200 p-6">
        <div className="flex items-start gap-3 mb-4">
          <Award className="w-6 h-6 text-teal-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Authority Level System</h3>
            <p className="text-gray-700 mb-4">Users earn points through community participation and progress through levels:</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <LevelCard level="Amateur" threshold="0-9 points" icon="🌱" />
          <LevelCard level="Contribuidor" threshold="10-49 points" icon="⭐" />
          <LevelCard level="Experto" threshold="50-149 points" icon="🏆" />
          <LevelCard level="Autoridad" threshold="150+ points" icon="👑" />
        </div>

        <div className="mt-4 pt-4 border-t border-teal-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Point System:</p>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Comment created: <span className="font-semibold text-gray-900">2 points</span></li>
            <li>• Like received: <span className="font-semibold text-gray-900">1 point</span></li>
            <li>• Comment marked as useful: <span className="font-semibold text-gray-900">5 points</span></li>
          </ul>
        </div>
      </div>

      {/* User Rankings Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">User Rankings</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-64"
                />
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="points">Sort by Points</option>
                <option value="posts">Sort by Posts</option>
                <option value="comments">Sort by Comments</option>
                <option value="likes">Sort by Likes</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comments</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Likes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Useful</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {searchQuery ? 'No users found' : 'No community activity yet'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user, index) => (
                  <tr key={user.userId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {user.rank <= 3 && (
                          <span className="text-lg">
                            {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        )}
                        <span className="text-sm font-medium text-gray-900">#{user.rank}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.userName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${LEVEL_COLORS[user.level]}`}>
                        <span>{LEVEL_ICONS[user.level]}</span>
                        <span>{user.level}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-teal-600" />
                        <span className="text-sm font-semibold text-gray-900">{user.points}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.postsCreated}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.commentsCreated}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.likesReceived}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.usefulMarks}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bgColor
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-1">{label}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function LevelCard({ level, threshold, icon }: { level: string; threshold: string; icon: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm font-semibold text-gray-900">{level}</span>
      </div>
      <p className="text-xs text-gray-600">{threshold}</p>
    </div>
  );
}
