/**
 * Admin Herbs Usage - Complete List
 * Full list of all herbs used with percentage and total grams
 */
import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Search, Info } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useSwipeBack } from '../hooks/useSwipeBack';

// Mock data - Extended list of all herbs
const allHerbs = [
  { id: 'h1', name: 'Ren Shen', usageCount: 456, percentage: 16.2, totalGrams: 4560 },
  { id: 'h2', name: 'Huang Qi', usageCount: 423, percentage: 15.0, totalGrams: 4230 },
  { id: 'h3', name: 'Dang Gui', usageCount: 389, percentage: 13.8, totalGrams: 3890 },
  { id: 'h4', name: 'Bai Zhu', usageCount: 367, percentage: 13.0, totalGrams: 3670 },
  { id: 'h5', name: 'Fu Ling', usageCount: 345, percentage: 12.2, totalGrams: 3450 },
  { id: 'h6', name: 'Gan Cao', usageCount: 312, percentage: 11.1, totalGrams: 3120 },
  { id: 'h7', name: 'Chen Pi', usageCount: 289, percentage: 10.3, totalGrams: 2890 },
  { id: 'h8', name: 'Sheng Jiang', usageCount: 267, percentage: 9.5, totalGrams: 2670 },
  { id: 'h9', name: 'Da Zao', usageCount: 245, percentage: 8.7, totalGrams: 2450 },
  { id: 'h10', name: 'Bai Shao', usageCount: 234, percentage: 8.3, totalGrams: 2340 },
  { id: 'h11', name: 'Chuan Xiong', usageCount: 223, percentage: 7.9, totalGrams: 2230 },
  { id: 'h12', name: 'Shu Di Huang', usageCount: 212, percentage: 7.5, totalGrams: 2120 },
  { id: 'h13', name: 'Shan Yao', usageCount: 198, percentage: 7.0, totalGrams: 1980 },
  { id: 'h14', name: 'Shan Zhu Yu', usageCount: 187, percentage: 6.6, totalGrams: 1870 },
  { id: 'h15', name: 'Ze Xie', usageCount: 176, percentage: 6.2, totalGrams: 1760 },
  { id: 'h16', name: 'Mu Dan Pi', usageCount: 165, percentage: 5.8, totalGrams: 1650 },
  { id: 'h17', name: 'Chai Hu', usageCount: 154, percentage: 5.5, totalGrams: 1540 },
  { id: 'h18', name: 'Dang Shen', usageCount: 143, percentage: 5.1, totalGrams: 1430 },
  { id: 'h19', name: 'Zhi Ke', usageCount: 132, percentage: 4.7, totalGrams: 1320 },
  { id: 'h20', name: 'Xiang Fu', usageCount: 121, percentage: 4.3, totalGrams: 1210 },
  { id: 'h21', name: 'Yu Jin', usageCount: 110, percentage: 3.9, totalGrams: 1100 },
  { id: 'h22', name: 'He Huan Pi', usageCount: 99, percentage: 3.5, totalGrams: 990 },
  { id: 'h23', name: 'Bai Zi Ren', usageCount: 88, percentage: 3.1, totalGrams: 880 },
  { id: 'h24', name: 'Suan Zao Ren', usageCount: 77, percentage: 2.7, totalGrams: 770 },
  { id: 'h25', name: 'Long Yan Rou', usageCount: 66, percentage: 2.3, totalGrams: 660 },
  { id: 'h26', name: 'Yuan Zhi', usageCount: 55, percentage: 2.0, totalGrams: 550 },
  { id: 'h27', name: 'Shi Chang Pu', usageCount: 44, percentage: 1.6, totalGrams: 440 },
  { id: 'h28', name: 'Tian Ma', usageCount: 33, percentage: 1.2, totalGrams: 330 },
  { id: 'h29', name: 'Gou Teng', usageCount: 22, percentage: 0.8, totalGrams: 220 },
  { id: 'h30', name: 'Ju Hua', usageCount: 11, percentage: 0.4, totalGrams: 110 },
];

export default function AdminHerbsUsage() {
  const navigate = useNavigate();
  
  // Enable swipe-to-go-back gesture on mobile
  useSwipeBack();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHerb, setSelectedHerb] = useState<typeof allHerbs[0] | null>(null);

  // Add original rank to each herb
  const herbsWithRank = allHerbs.map((herb, index) => ({
    ...herb,
    originalRank: index + 1,
  }));

  // Filter herbs based on search term
  const filteredHerbs = herbsWithRank.filter((herb) =>
    herb.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All herbs usage</h1>
          <p className="hidden sm:block text-gray-600">Complete list of herbs with usage statistics</p>
        </div>

        {/* Search and Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search herbs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredHerbs.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{allHerbs.length}</span> herbs
            </div>
          </div>
        </div>

        {/* Herbs Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Rank</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Herb name</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Usage count</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Percentage</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Total grams</th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-gray-900">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHerbs.length > 0 ? (
                  filteredHerbs.map((herb) => (
                    <tr key={herb.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">#{herb.originalRank}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">{herb.name}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-gray-900">{herb.usageCount}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm text-gray-700">{herb.percentage}%</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-sm font-semibold text-teal-600">{herb.totalGrams.toLocaleString()}g</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedHerb(herb)}
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
                      <p className="text-gray-500">No herbs found matching "{searchTerm}"</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Dialog.Root open={!!selectedHerb} onOpenChange={(open) => !open && setSelectedHerb(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto z-50">
            <Dialog.Description className="sr-only">Herb usage details</Dialog.Description>
            <div className="p-6">
              <Dialog.Title className="text-xl font-semibold text-gray-900 mb-4">
                {selectedHerb?.name}
              </Dialog.Title>
              
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Total usage count</div>
                  <div className="text-3xl font-bold text-gray-900">{selectedHerb?.usageCount}</div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Usage percentage</div>
                  <div className="text-3xl font-bold text-teal-600">{selectedHerb?.percentage}%</div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Total grams prescribed</div>
                  <div className="text-3xl font-bold text-gray-900">{selectedHerb?.totalGrams.toLocaleString()}g</div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Appears in formulas</div>
                  <div className="text-3xl font-bold text-gray-900">67</div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Number of users</div>
                  <div className="text-3xl font-bold text-gray-900">89</div>
                </div>
              </div>

              <button
                onClick={() => setSelectedHerb(null)}
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