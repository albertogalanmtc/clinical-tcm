import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Eye, Users, TrendingUp, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { getContentStatistics, type ContentType } from '@/app/data/contentViews';

interface ContentAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: ContentType;
  contentId: string;
  contentTitle: string;
}

export function ContentAnalyticsModal({
  isOpen,
  onClose,
  contentType,
  contentId,
  contentTitle
}: ContentAnalyticsModalProps) {
  const [showViewedUsers, setShowViewedUsers] = useState(false);
  const [showNotViewedUsers, setShowNotViewedUsers] = useState(false);

  const stats = getContentStatistics(contentType, contentId);

  const contentTypeLabel = {
    course: 'Course',
    promo: 'Promotion',
    news: 'News Article',
    research: 'Research Article'
  }[contentType];

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[70]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:max-w-4xl w-full sm:max-h-[90vh] overflow-hidden z-[80] flex flex-col">
          <Dialog.Description className="sr-only">
            Analytics for {contentTitle}
          </Dialog.Description>

          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-4">
              <Dialog.Title className="text-xl font-bold text-gray-900 truncate">
                Analytics: {contentTitle}
              </Dialog.Title>
              <p className="text-sm text-gray-600 mt-1">{contentTypeLabel}</p>
            </div>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Views */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-900">{stats.totalViews}</p>
                    <p className="text-xs text-blue-700">Total Views</p>
                  </div>
                </div>
              </div>

              {/* Unique Users */}
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-teal-900">{stats.uniqueViews}</p>
                    <p className="text-xs text-teal-700">Unique Users</p>
                  </div>
                </div>
              </div>

              {/* Reach Percentage */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-900">{stats.viewPercentage}%</p>
                    <p className="text-xs text-purple-700">Reach Rate</p>
                  </div>
                </div>
              </div>

              {/* Total Platform Users */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                    <p className="text-xs text-gray-700">Total Users</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown by Plan */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Views by Plan
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-xl font-bold text-gray-900">{stats.byPlan.free}</p>
                  <p className="text-xs text-gray-600">Free Plan</p>
                </div>
                <div className="text-center p-3 bg-teal-50 rounded-lg">
                  <p className="text-xl font-bold text-teal-900">{stats.byPlan.professional}</p>
                  <p className="text-xs text-teal-700">Professional</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-xl font-bold text-purple-900">{stats.byPlan.enterprise}</p>
                  <p className="text-xs text-purple-700">Enterprise</p>
                </div>
              </div>
            </div>

            {/* Users Who Viewed */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowViewedUsers(!showViewedUsers)}
                className="w-full px-4 py-3 flex items-center justify-between bg-teal-50 hover:bg-teal-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-teal-700" />
                  <h3 className="text-sm font-semibold text-teal-900">
                    Users Who Viewed ({stats.viewedUsers.length})
                  </h3>
                </div>
                {showViewedUsers ? (
                  <ChevronUp className="w-4 h-4 text-teal-700" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-teal-700" />
                )}
              </button>
              {showViewedUsers && (
                <div className="max-h-60 overflow-y-auto divide-y divide-gray-200">
                  {stats.viewedUsers.length > 0 ? (
                    stats.viewedUsers.map((user, idx) => (
                      <div key={idx} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{user.userName}</p>
                            <p className="text-xs text-gray-600 truncate">{user.userEmail}</p>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              user.userPlan === 'enterprise'
                                ? 'bg-purple-100 text-purple-700'
                                : user.userPlan === 'professional'
                                ? 'bg-teal-100 text-teal-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {user.userPlan}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(user.viewedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <Eye className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No views yet</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Users Who Haven't Viewed (for Remarketing) */}
            <div className="bg-white border border-amber-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setShowNotViewedUsers(!showNotViewedUsers)}
                className="w-full px-4 py-3 flex items-center justify-between bg-amber-50 hover:bg-amber-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-700" />
                  <h3 className="text-sm font-semibold text-amber-900">
                    Users Who Haven't Viewed ({stats.notViewedUsers.length})
                  </h3>
                </div>
                {showNotViewedUsers ? (
                  <ChevronUp className="w-4 h-4 text-amber-700" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-amber-700" />
                )}
              </button>
              {showNotViewedUsers && (
                <div className="max-h-60 overflow-y-auto divide-y divide-gray-200">
                  {stats.notViewedUsers.length > 0 ? (
                    stats.notViewedUsers.map((user, idx) => (
                      <div key={idx} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{user.userName}</p>
                            <p className="text-xs text-gray-600 truncate">{user.userEmail}</p>
                          </div>
                          <span className={`ml-3 px-2 py-0.5 rounded-full text-xs font-medium ${
                            user.userPlan === 'enterprise'
                              ? 'bg-purple-100 text-purple-700'
                              : user.userPlan === 'professional'
                              ? 'bg-teal-100 text-teal-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {user.userPlan}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">All users have viewed this content!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
