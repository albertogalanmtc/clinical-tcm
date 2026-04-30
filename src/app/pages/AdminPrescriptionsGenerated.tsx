import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Beaker } from 'lucide-react';
import { useSwipeBack } from '../hooks/useSwipeBack';

export default function AdminPrescriptionsGenerated() {
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
  const mockPrescriptions = [
    {
      id: 'p1',
      userName: 'Dr. James Kim',
      prescriptionName: 'Modified Si Jun Zi Tang',
      createdDate: '2024-02-05',
      ingredients: 12,
    },
    {
      id: 'p2',
      userName: 'Dr. Alberto Galán',
      prescriptionName: 'Liver Support Formula',
      createdDate: '2024-02-04',
      ingredients: 8,
    },
    {
      id: 'p3',
      userName: 'Maria Lopez',
      prescriptionName: 'Digestive Aid',
      createdDate: '2024-02-03',
      ingredients: 10,
    },
    {
      id: 'p4',
      userName: 'Dr. James Kim',
      prescriptionName: 'Sleep Enhancement',
      createdDate: '2024-02-02',
      ingredients: 9,
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
          <h1 className="text-3xl font-bold text-gray-900">Prescriptions generated</h1>
        </div>
        <p className="hidden sm:block text-gray-600">
          All prescriptions created during the selected period
        </p>
      </div>

      {/* Prescriptions List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prescription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created by
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ingredients
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mockPrescriptions.map((prescription) => (
                <tr key={prescription.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {prescription.prescriptionName}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500">{prescription.userName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{prescription.ingredients} herbs</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">
                      {new Date(prescription.createdDate).toLocaleDateString('en-US', {
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