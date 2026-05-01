import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, CreditCard } from 'lucide-react';
import { useSwipeBack } from '../hooks/useSwipeBack';

function formatPlanName(planCode: string): string {
  switch (planCode) {
    case 'free':
      return 'Free';
    case 'practitioner':
    case 'pro':
      return 'Practitioner';
    case 'advanced':
    case 'clinic':
      return 'Advanced';
    default:
      return planCode;
  }
}

export default function AdminActiveSubscriptions() {
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
  const mockSubscriptions = [
    {
      id: '1',
      userName: 'Dr. James Kim',
      email: 'dr.james.kim@example.com',
      planCode: 'pro' as const,
      startDate: '2024-01-15',
      status: 'Active',
    },
    {
      id: '2',
      userName: 'Dr. Alberto Galán',
      email: 'admin@tcm.com',
      planCode: 'pro' as const,
      startDate: '2023-11-20',
      status: 'Active',
    },
    {
      id: '3',
      userName: 'Dr. Anna Martinez',
      email: 'anna.martinez@example.com',
      planCode: 'pro' as const,
      startDate: '2023-09-12',
      status: 'Active',
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
          <h1 className="text-3xl font-bold text-gray-900">Active subscriptions</h1>
        </div>
        <p className="hidden sm:block text-gray-600">
          Users with active Pro subscriptions
        </p>
      </div>

      {/* Subscriptions List */}
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
                  Start date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockSubscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{sub.userName}</div>
                      <div className="text-sm text-gray-500">{sub.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        sub.planCode === 'pro'
                          ? 'bg-teal-50 text-teal-700'
                          : sub.planCode === 'clinic'
                          ? 'bg-purple-50 text-purple-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {formatPlanName(sub.planCode)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded bg-green-50 text-green-700">
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {new Date(sub.startDate).toLocaleDateString('en-US', {
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
