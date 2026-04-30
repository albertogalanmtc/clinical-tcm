import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Users, CreditCard, Calendar, TrendingUp, Beaker, Leaf, FlaskConical, ArrowUp, ArrowDown, ShieldCheck, Shield } from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { TimeRangeSelector, TimeRange } from '../components/TimeRangeSelector';
import { getAllUsers, User } from '../data/usersManager';
import { planService } from '../services/planService';

// Avatar colors for users
const avatarColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444', '#14b8a6'];

// Helper to generate consistent avatar color based on email
function getAvatarColor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

// Helper to format plan name (reads from planService for dynamic names)
function formatPlanName(planType: string): string {
  if (planType === 'free' || planType === 'pro' || planType === 'clinic') {
    return planService.getPlanName(planType as 'free' | 'pro' | 'clinic');
  }
  return planType;
}

// Transform User data to AdminUsers display format
interface AdminUserDisplay {
  id: string;
  name: string;
  email: string;
  country: string;
  avatarColor: string;
  avatarImage: string | null;
  plan: string;
  status: string;
  role: string;
  joinDate: string;
  lastActive: string;
  formulasCreated: number;
  herbsAdded: number;
}

function transformUserToDisplay(user: User, index: number): AdminUserDisplay {
  const fullName = `${user.profile.firstName} ${user.profile.lastName}`;

  return {
    id: user.email, // Using email as unique ID
    name: fullName,
    email: user.email,
    country: user.profile.country || 'N/A',
    avatarColor: getAvatarColor(user.email), // Will use user's custom color when connected to Supabase
    avatarImage: null, // Will show user's uploaded image when connected to Supabase
    plan: formatPlanName(user.planType),
    status: 'Active', // Default to Active (can be extended later)
    role: user.role,
    joinDate: 'N/A', // Will show as N/A for demo users (can be extended later)
    lastActive: 'Active now', // Default value (can be extended later)
    formulasCreated: 0, // Default (can be calculated from prescriptions data)
    herbsAdded: 0, // Default (can be calculated from custom herbs)
  };
}

// Time period type
type TimePeriod = 'week' | 'month' | 'year' | 'lastMonth' | 'lastYear';

// Mock stats by time period (including week, month, year for presets)
const statsByPeriod = {
  week: {
    totalUsers: { value: '5', change: '+0%', trend: 'up' as const },
    activeSubscriptions: { value: '4', change: '+0%', trend: 'up' as const },
    newUsers: { value: '0', change: '+0%', trend: 'up' as const },
    formulasGenerated: { value: '0', change: '+0%', trend: 'up' as const },
    herbsUsed: { value: '0', change: '+0%', trend: 'up' as const },
    formulasUsed: { value: '0', change: '+0%', trend: 'up' as const },
  },
  month: {
    totalUsers: { value: '5', change: '+0%', trend: 'up' as const },
    activeSubscriptions: { value: '4', change: '+0%', trend: 'up' as const },
    newUsers: { value: '0', change: '+0%', trend: 'up' as const },
    formulasGenerated: { value: '0', change: '+0%', trend: 'up' as const },
    herbsUsed: { value: '0', change: '+0%', trend: 'up' as const },
    formulasUsed: { value: '0', change: '+0%', trend: 'up' as const },
  },
  year: {
    totalUsers: { value: '5', change: '+0%', trend: 'up' as const },
    activeSubscriptions: { value: '4', change: '+0%', trend: 'up' as const },
    newUsers: { value: '5', change: '+0%', trend: 'up' as const },
    formulasGenerated: { value: '0', change: '+0%', trend: 'up' as const },
    herbsUsed: { value: '0', change: '+0%', trend: 'up' as const },
    formulasUsed: { value: '0', change: '+0%', trend: 'up' as const },
  },
  lastMonth: {
    totalUsers: { value: '5', change: '+0%', trend: 'up' as const },
    activeSubscriptions: { value: '4', change: '+0%', trend: 'up' as const },
    newUsers: { value: '0', change: '+0%', trend: 'up' as const },
    formulasGenerated: { value: '0', change: '+0%', trend: 'up' as const },
    herbsUsed: { value: '0', change: '+0%', trend: 'up' as const },
    formulasUsed: { value: '0', change: '+0%', trend: 'up' as const },
  },
  lastYear: {
    totalUsers: { value: '5', change: '+0%', trend: 'up' as const },
    activeSubscriptions: { value: '4', change: '+0%', trend: 'up' as const },
    newUsers: { value: '5', change: '+0%', trend: 'up' as const },
    formulasGenerated: { value: '0', change: '+0%', trend: 'up' as const },
    herbsUsed: { value: '0', change: '+0%', trend: 'up' as const },
    formulasUsed: { value: '0', change: '+0%', trend: 'up' as const },
  },
};

export default function AdminUsers() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<'all' | 'Pro' | 'Free' | 'Clinic'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Active' | 'Inactive'>('all');
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin'>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>({
    preset: 'month',
    startDate: null,
    endDate: null,
  });

  // Handle URL query params for role filter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam === 'admin' || roleParam === 'user') {
      setFilterRole(roleParam);
    }
  }, [location.search]);

  // Helper function to build URL with time range params
  const buildStatUrl = (path: string) => {
    const params = new URLSearchParams();
    params.set('preset', timeRange.preset);
    if (timeRange.preset === 'custom' && timeRange.startDate && timeRange.endDate) {
      params.set('startDate', timeRange.startDate);
      params.set('endDate', timeRange.endDate);
    }
    return `${path}?${params.toString()}`;
  };

  // Helper function to get stats based on time range
  const getStatsForTimeRange = (range: TimeRange) => {
    if (range.preset === 'custom' && range.startDate && range.endDate) {
      // For custom range, return mock custom stats
      return {
        totalUsers: { value: '1,189', change: '+8.7%', trend: 'up' },
        activeSubscriptions: { value: '856', change: '+5.4%', trend: 'up' },
        newUsers: { value: '67', change: '+15%', trend: 'up' },
        formulasGenerated: { value: '5,234', change: '+12.3%', trend: 'up' },
        herbsUsed: { value: '312', change: '+7.2%', trend: 'up' },
        formulasUsed: { value: '187', change: '+8.9%', trend: 'up' },
      };
    }
    // Map preset to old format
    return statsByPeriod[range.preset as TimePeriod] || statsByPeriod.month;
  };

  // Get current period stats
  const currentStats = getStatsForTimeRange(timeRange);

  // Get real users from the system and transform to display format
  const allUsers = useMemo(() => {
    const systemUsers = getAllUsers();
    return systemUsers.map((user, index) => transformUserToDisplay(user, index));
  }, []);

  // Build summary stats array with dynamic data
  const summaryStats = [
    {
      label: 'Total users',
      value: currentStats.totalUsers.value,
      change: currentStats.totalUsers.change,
      trend: currentStats.totalUsers.trend,
      icon: Users,
      path: '/admin/stats/total-users'
    },
    {
      label: 'Active subscriptions',
      value: currentStats.activeSubscriptions.value,
      change: currentStats.activeSubscriptions.change,
      trend: currentStats.activeSubscriptions.trend,
      icon: CreditCard,
      path: '/admin/stats/active-subscriptions'
    },
    { 
      label: 'New users', 
      value: currentStats.newUsers.value,
      change: currentStats.newUsers.change,
      trend: currentStats.newUsers.trend,
      icon: TrendingUp,
      path: '/admin/stats/new-users'
    },
    { 
      label: 'Prescriptions generated', 
      value: currentStats.formulasGenerated.value,
      change: currentStats.formulasGenerated.change,
      trend: currentStats.formulasGenerated.trend,
      icon: Beaker,
      path: '/admin/stats/prescriptions-generated'
    },
    { 
      label: 'Herbs used', 
      value: currentStats.herbsUsed.value,
      change: currentStats.herbsUsed.change,
      trend: currentStats.herbsUsed.trend,
      icon: Leaf,
      path: '/admin/stats/herbs-used'
    },
    { 
      label: 'Formulas used', 
      value: currentStats.formulasUsed.value,
      change: currentStats.formulasUsed.change,
      trend: currentStats.formulasUsed.trend,
      icon: FlaskConical,
      path: '/admin/stats/formulas-used'
    },
  ];

  // Filter users based on search and filters
  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlan = filterPlan === 'all' || user.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesRole = filterRole === 'all' || user.role === filterRole;

    return matchesSearch && matchesPlan && matchesStatus && matchesRole;
  });

  // Handler for role toggle
  const handleToggleRole = (email: string) => {
    console.log('Toggle role for user:', email);
    alert('Esta funcionalidad estará disponible cuando conectes con Supabase.\n\nPor ahora, puedes cambiar roles manualmente en Supabase Dashboard:\n1. Ve a Table Editor → profiles\n2. Busca el usuario por email\n3. Cambia el campo "role" de user a admin o viceversa');
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Users</h1>
        <p className="hidden sm:block text-gray-600">Manage user accounts, roles, and view activity metrics</p>
      </div>

      {/* Time Range Selector */}
      <TimeRangeSelector
        value={timeRange}
        onChange={setTimeRange}
        className="mb-6"
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {summaryStats.map((stat) => (
          <Link
            key={stat.label}
            to={buildStatUrl(stat.path)}
            className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:border-gray-300 hover:shadow-sm transition-all relative"
          >
            <div className="flex sm:block items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center flex-shrink-0 mb-0 sm:mb-3">
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0 sm:flex-initial">
                <div className="text-2xl font-semibold text-gray-900 leading-tight mb-0 sm:mb-1">{stat.value}</div>
                <div className="text-sm text-gray-500">
                  {stat.label}
                  {stat.subLabel && <span className="ml-1">({stat.subLabel})</span>}
                </div>
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium flex-shrink-0 sm:absolute sm:top-3 sm:right-3 ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.trend === 'up' ? (
                  <ArrowUp className="w-3 h-3" />
                ) : (
                  <ArrowDown className="w-3 h-3" />
                )}
                {stat.change}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        {/* Plan Filter */}
        <select
          value={filterPlan}
          onChange={(e) => setFilterPlan(e.target.value as any)}
          className="bg-white px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="all">All plans</option>
          <option value="Pro">Pro</option>
          <option value="Free">Free</option>
          <option value="Clinic">Clinic</option>
        </select>

        {/* Status Filter */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          className="bg-white px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="all">All statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        {/* Role Filter */}
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as any)}
          className="bg-white px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
        >
          <option value="all">All roles</option>
          <option value="user">Users</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {/* Users List */}
      {filteredUsers.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last active
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prescriptions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/admin/users/${user.id}`}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                      >
                        <Avatar name={user.name} size="sm" color={user.avatarColor} image={user.avatarImage} />
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.country}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          user.plan === 'Practitioner'
                            ? 'bg-teal-50 text-teal-700'
                            : user.plan === 'Advanced'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {user.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          <ShieldCheck className="w-3 h-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          <Users className="w-3 h-3" />
                          User
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          user.status === 'Active'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {user.joinDate === 'N/A' ? 'N/A' : new Date(user.joinDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{user.lastActive}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        <span className="font-medium text-gray-900">{user.formulasCreated}</span> prescriptions
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleRole(user.email)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-teal-700 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No users found matching your filters</p>
        </div>
      )}

      {/* Info Footer */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Gestión de Roles</p>
            <p>
              Los cambios de roles requieren que el usuario cierre sesión y vuelva a iniciar sesión para que surtan efecto.
              Cuando conectes con Supabase, podrás cambiar roles directamente desde esta interfaz haciendo clic en "Make Admin" o "Revoke Admin".
            </p>
          </div>
        </div>
      </div>
    </>
  );
}