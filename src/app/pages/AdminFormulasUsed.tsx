import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, FlaskConical } from 'lucide-react';
import { useSwipeBack } from '../hooks/useSwipeBack';

export default function AdminFormulasUsed() {
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
  const mockFormulas = [
    {
      id: 'f1',
      name: 'Si Jun Zi Tang (Four Gentlemen Decoction)',
      category: 'Qi Tonifying',
      usageCount: 23,
      ingredients: 4,
    },
    {
      id: 'f2',
      name: 'Liu Jun Zi Tang (Six Gentlemen Decoction)',
      category: 'Qi Tonifying',
      usageCount: 18,
      ingredients: 6,
    },
    {
      id: 'f3',
      name: 'Xiao Yao San (Free and Easy Wanderer)',
      category: 'Liver Harmonizing',
      usageCount: 34,
      ingredients: 8,
    },
    {
      id: 'f4',
      name: 'Bu Zhong Yi Qi Tang (Tonify Center, Boost Qi)',
      category: 'Qi Tonifying',
      usageCount: 15,
      ingredients: 8,
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
          <h1 className="text-3xl font-bold text-gray-900">Formulas used</h1>
        </div>
        <p className="hidden sm:block text-gray-600">
          Formulas used as compounds in prescriptions during the selected period
        </p>
      </div>

      {/* Formulas List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Formula name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingredients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage count
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockFormulas.map((formula) => (
                <tr key={formula.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{formula.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{formula.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{formula.ingredients} herbs</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">{formula.usageCount}</span>
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