/**
 * Admin Formulas Usage - Complete List
 * Full list of all formulas used with percentage and usage statistics
 */
import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Search, Info } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useSwipeBack } from '../hooks/useSwipeBack';

// Mock data - Extended list of all formulas
const allFormulas = [
  { id: 'f1', name: 'Si Jun Zi Tang', usageCount: 234, percentage: 18.5, type: 'Standard' },
  { id: 'f2', name: 'Liu Wei Di Huang Wan', usageCount: 198, percentage: 15.6, type: 'Standard' },
  { id: 'f3', name: 'Xiao Yao San', usageCount: 176, percentage: 13.9, type: 'Standard' },
  { id: 'f4', name: 'Bu Zhong Yi Qi Tang', usageCount: 154, percentage: 12.2, type: 'Standard' },
  { id: 'f5', name: 'Modified Si Jun Zi Tang', usageCount: 143, percentage: 11.3, type: 'Custom' },
  { id: 'f6', name: 'Ba Zhen Tang', usageCount: 132, percentage: 10.4, type: 'Standard' },
  { id: 'f7', name: 'Gui Pi Tang', usageCount: 121, percentage: 9.6, type: 'Standard' },
  { id: 'f8', name: 'Custom Spleen Support', usageCount: 110, percentage: 8.7, type: 'Custom' },
  { id: 'f9', name: 'Shen Ling Bai Zhu San', usageCount: 99, percentage: 7.8, type: 'Standard' },
  { id: 'f10', name: 'Modified Xiao Yao San', usageCount: 88, percentage: 7.0, type: 'Custom' },
  { id: 'f11', name: 'Er Chen Tang', usageCount: 77, percentage: 6.1, type: 'Standard' },
  { id: 'f12', name: 'Liu Jun Zi Tang', usageCount: 66, percentage: 5.2, type: 'Standard' },
  { id: 'f13', name: 'Custom Qi Tonic', usageCount: 55, percentage: 4.4, type: 'Custom' },
  { id: 'f14', name: 'Wen Dan Tang', usageCount: 44, percentage: 3.5, type: 'Standard' },
  { id: 'f15', name: 'Gui Zhi Tang', usageCount: 33, percentage: 2.6, type: 'Standard' },
  { id: 'f16', name: 'Modified Liu Wei Di Huang', usageCount: 29, percentage: 2.3, type: 'Custom' },
  { id: 'f17', name: 'Sheng Mai San', usageCount: 25, percentage: 2.0, type: 'Standard' },
  { id: 'f18', name: 'Tian Wang Bu Xin Dan', usageCount: 21, percentage: 1.7, type: 'Standard' },
  { id: 'f19', name: 'Custom Blood Tonic', usageCount: 18, percentage: 1.4, type: 'Custom' },
  { id: 'f20', name: 'Zhi Gan Cao Tang', usageCount: 15, percentage: 1.2, type: 'Standard' },
  { id: 'f21', name: 'Modified Bu Zhong Yi Qi', usageCount: 12, percentage: 0.9, type: 'Custom' },
  { id: 'f22', name: 'Suan Zao Ren Tang', usageCount: 9, percentage: 0.7, type: 'Standard' },
  { id: 'f23', name: 'Custom Sleep Formula', usageCount: 6, percentage: 0.5, type: 'Custom' },
  { id: 'f24', name: 'Gan Mai Da Zao Tang', usageCount: 3, percentage: 0.2, type: 'Standard' },
];

export default function AdminFormulasUsageList() {
  const navigate = useNavigate();
  
  // Enable swipe-to-go-back gesture on mobile
  useSwipeBack();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'standard' | 'custom'>('all');
  const [selectedFormula, setSelectedFormula] = useState<typeof allFormulas[0] | null>(null);

  // Add original rank to each formula
  const formulasWithRank = allFormulas.map((formula, index) => ({
    ...formula,
    originalRank: index + 1,
  }));

  // Filter formulas based on search term and type
  const filteredFormulas = formulasWithRank.filter((formula) => {
    const matchesSearch = formula.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === 'all' ||
      (filterType === 'standard' && formula.type === 'Standard') ||
      (filterType === 'custom' && formula.type === 'Custom');
    return matchesSearch && matchesType;
  });

  return (
    <>
      <div className="max-w-7xl mx-auto p-2 sm:p-4 pb-20 sm:pb-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/usage"
            className="h-10 w-10 sm:w-11 sm:h-11 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
            title="Back to Usage Analytics"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All formulas usage</h1>
          <p className="hidden sm:block text-gray-600">Complete list of formulas with usage statistics</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search formulas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filterType === 'all'
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType('standard')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filterType === 'standard'
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setFilterType('custom')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  filterType === 'custom'
                    ? 'bg-teal-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                Custom
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredFormulas.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{allFormulas.length}</span> formulas
          </div>
        </div>

        {/* Formulas Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Rank</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Formula name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Type</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Usage count</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Percentage</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredFormulas.length > 0 ? (
                  filteredFormulas.map((formula) => (
                    <tr key={formula.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">#{formula.originalRank}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">{formula.name}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            formula.type === 'Standard'
                              ? 'bg-teal-100 text-teal-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {formula.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-gray-900">{formula.usageCount}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-gray-700">{formula.percentage}%</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedFormula(formula)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-teal-600 transition-colors"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-gray-500">No formulas found matching your criteria</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog.Root open={!!selectedFormula} onOpenChange={(open) => !open && setSelectedFormula(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto z-50">
            <Dialog.Description className="sr-only">Formula usage details</Dialog.Description>
            <div className="p-6">
              <Dialog.Title className="text-xl font-semibold text-gray-900 mb-4">
                {selectedFormula?.name}
              </Dialog.Title>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Formula type</div>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      selectedFormula?.type === 'Standard'
                        ? 'bg-teal-100 text-teal-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {selectedFormula?.type}
                  </span>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Usage frequency</div>
                  <div className="text-3xl font-bold text-gray-900">{selectedFormula?.usageCount}</div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Usage percentage</div>
                  <div className="text-3xl font-bold text-teal-600">{selectedFormula?.percentage}%</div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-3">Most common herbs</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Ren Shen</span>
                      <span className="font-medium text-gray-900">94%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Bai Zhu</span>
                      <span className="font-medium text-gray-900">89%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Fu Ling</span>
                      <span className="font-medium text-gray-900">87%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">Gan Cao</span>
                      <span className="font-medium text-gray-900">82%</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedFormula(null)}
                className="w-full mt-6 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}