import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Calendar,
  Mail,
  CreditCard,
  MapPin,
  Beaker,
  Leaf,
  FlaskConical,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { Avatar } from '../components/Avatar';
import { useSwipeBack } from '../hooks/useSwipeBack';
import {
  fetchAllAdminUsers,
  formatPlanName,
  getAccountStatus,
  getPlanBadgeClass,
  getStatusBadgeClass,
  getUserDisplayName,
  type AdminUserRecord,
} from '../services/adminUsersService';

// Helper to get avatar color based on email
const avatarColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444', '#14b8a6'];
function getAvatarColor(email: string): string {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

// Mock invoices - will be replaced with Stripe data when connected
const getMockInvoices = (planCode: AdminUserRecord['plan_type']) => {
  if (planCode === 'free') return [];

  const isPractitioner = planCode === 'practitioner' || planCode === 'pro';
  const amount = isPractitioner ? 9 : 19;
  const planName = formatPlanName(planCode);

  return [
    {
      id: 'INV-2026-003',
      date: 'Feb 12, 2026',
      description: `${planName} Plan - Monthly`,
      amount,
      status: 'paid' as const,
    },
    {
      id: 'INV-2026-002',
      date: 'Jan 12, 2026',
      description: `${planName} Plan - Monthly`,
      amount,
      status: 'paid' as const,
    },
  ];
};

function formatDate(dateValue: string | null | undefined): string {
  if (!dateValue) {
    return 'Not available';
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return 'Not available';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function AdminUserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Enable swipe-to-go-back gesture on mobile
  useSwipeBack();

  useEffect(() => {
    let cancelled = false;

    const loadUsers = async () => {
      setLoading(true);
      const data = await fetchAllAdminUsers();

      if (cancelled) {
        return;
      }

      setUsers(data);
      setLoading(false);
    };

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, []);

  const user = users.find(u => u.id === userId || u.email === userId);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-4">User not found</p>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to users
          </Link>
        </div>
      </div>
    );
  }

  const fullName = getUserDisplayName(user);
  const avatarColor = getAvatarColor(user.email);
  const planName = formatPlanName(user.plan_type);
  const status = getAccountStatus(user);
  const invoices = getMockInvoices(user.plan_type);

  // Mock usage stats - will come from database when Supabase is connected
  const usageStats = {
    formulasCreated: { total: 0, thisMonth: 0 },
    herbsAdded: { total: 0, thisMonth: 0 },
    safetyChecks: { total: 0, thisMonth: 0 },
    prescriptionsSaved: { total: 0, thisMonth: 0 },
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header with Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      {/* User Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar name={fullName} size="lg" color={avatarColor} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                {user.role === 'admin' && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                    <ShieldCheck className="w-3 h-3" />
                    Admin
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </div>
                {user.country && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {user.country}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span
              className={`px-3 py-1 text-sm font-medium rounded ${getPlanBadgeClass(user.plan_type)}`}
            >
              {planName}
            </span>
            <span
              className={`px-3 py-1 text-sm font-medium rounded ${getStatusBadgeClass(status)}`}
            >
              {status}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-6 mt-6 pt-6 border-t border-gray-200 text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>
              Joined <span className="text-gray-900">{formatDate(user.created_at)}</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <span>Last active:</span>
            <span className="text-gray-900">{formatDate(user.updated_at)}</span>
          </div>
        </div>
      </div>

      {/* Usage Statistics */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <Beaker className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {usageStats.formulasCreated.total}
                </div>
                <div className="text-sm text-gray-500">Formulas created</div>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {usageStats.formulasCreated.thisMonth} this month
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {usageStats.herbsAdded.total}
                </div>
                <div className="text-sm text-gray-500">Herbs added</div>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {usageStats.herbsAdded.thisMonth} this month
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {usageStats.prescriptionsSaved.total}
                </div>
                <div className="text-sm text-gray-500">Prescriptions saved</div>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {usageStats.prescriptionsSaved.thisMonth} this month
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-900">
                  {usageStats.safetyChecks.total}
                </div>
                <div className="text-sm text-gray-500">Safety checks</div>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {usageStats.safetyChecks.thisMonth} this month
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      {invoices.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h2>
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {invoice.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {invoice.date}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {invoice.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ${invoice.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium rounded bg-green-50 text-green-700">
                          {invoice.status === 'paid' ? 'Paid' : invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Note: Payment history will be automatically synced with Stripe when connected
          </p>
        </div>
      )}

      {/* Account Info */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">First Name</div>
              <div className="text-sm text-gray-900">{user.first_name || 'Not specified'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Last Name</div>
              <div className="text-sm text-gray-900">{user.last_name || 'Not specified'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Email</div>
              <div className="text-sm text-gray-900">{user.email}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Country</div>
              <div className="text-sm text-gray-900">{user.country || 'Not specified'}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Role</div>
              <div className="text-sm text-gray-900 capitalize">{user.role}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Plan Type</div>
              <div className="text-sm text-gray-900">{planName}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
