import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Leaf } from 'lucide-react';
import { useSwipeBack } from '../hooks/useSwipeBack';

export default function AdminHerbsUsed() {
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
  const mockHerbs = [
    {
      id: 'h1',
      name: 'Bai Zhu (White Atractylodes)',
      pharmaceuticalName: 'Atractylodes macrocephala',
      category: 'Qi Tonifying',
      usageCount: 45,
    },
    {
      id: 'h2',
      name: 'Dang Shen (Codonopsis)',
      pharmaceuticalName: 'Codonopsis pilosula',
      category: 'Qi Tonifying',
      usageCount: 38,
    },
    {
      id: 'h3',
      name: 'Fu Ling (Poria)',
      pharmaceuticalName: 'Poria cocos',
      category: 'Dampness Draining',
      usageCount: 52,
    },
    {
      id: 'h4',
      name: 'Gan Cao (Licorice)',
      pharmaceuticalName: 'Glycyrrhiza uralensis',
      category: 'Qi Tonifying',
      usageCount: 67,
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
          <h1 className="text-3xl font-bold text-gray-900">Herbs used</h1>
        </div>
        <p className="hidden sm:block text-gray-600">
          Unique herbs used in prescriptions during the selected period
        </p>
      </div>

      {/* Herbs List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Herb name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pharmaceutical name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage count
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockHerbs.map((herb) => (
                <tr key={herb.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{herb.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{herb.pharmaceuticalName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{herb.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{herb.usageCount}</span>
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