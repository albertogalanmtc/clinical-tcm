import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, TrendingUp } from 'lucide-react';
import { useSwipeBack } from '../hooks/useSwipeBack';
import { planService } from '../services/planService';

export default function AdminNewUsers() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Enable swipe-to-go-back gesture on mobile
  useSwipeBack();
  const preset = searchParams.get('preset') || 'month';
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  // Helper to get readable time range
  const getTimeRangeLabel = () => {
    if (preset === 'custom' && startDate && endDate) {
      return `${startDate} - ${endDate}`;
    }
    const labels: Record<string, string> = {
      week: 'This week',
      month: 'This month',
      year: 'This year',
    };
    return labels[preset] || 'This month';
  };

  // Mock data - in production this would be fetched based on time range
  const mockNewUsers = [
    {
      id: '2',
      name: 'Maria Lopez',
      email: 'maria.lopez@example.com',
      planCode: 'free' as const,
      status: 'Active',
      joinDate: '2024-02-03',
    },
    {
      id: '6',
      name: 'David Wong',
      email: 'david.wong@example.com',
      planCode: 'free' as const,
      status: 'Active',
      joinDate: '2024-02-01',
    },
    {
      id: '4',
      name: 'Michael Johnson',
      email: 'michael.j@example.com',
      planCode: 'free' as const,
      status: 'Active',
      joinDate: '2024-01-28',
    },
  ];

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors flex-shrink-0"
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">New users</h1>
        </div>
        <p className="hidden sm:block text-gray-600">
          Users who joined during the selected period
        </p>
      </div>

      {/* New Users List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Join date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockNewUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        user.planCode === 'pro'
                          ? 'bg-teal-50 text-teal-700'
                          : user.planCode === 'clinic'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {planService.getPlanName(user.planCode)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
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
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {new Date(user.joinDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}