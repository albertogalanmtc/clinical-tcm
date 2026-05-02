import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import { fetchAdminUserIdentities } from '@/app/services/adminUserLookupService';
import { fetchAllAdminUsers } from '@/app/services/adminUsersService';
import { getUserDisplayName } from '@/app/services/adminUsersService';
import type { Banner } from '@/app/services/bannersService';

interface BannerAnalyticsModalProps {
  banner: Banner;
  isOpen: boolean;
  onClose: () => void;
}

interface DismissalData {
  user_id: string;
  dismissed_at: string;
  user_name?: string;
  user_email?: string;
}

export function BannerAnalyticsModal({ banner, isOpen, onClose }: BannerAnalyticsModalProps) {
  const [dismissals, setDismissals] = useState<DismissalData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadDismissals();
    }
  }, [isOpen, banner.id]);

  const loadDismissals = async () => {
    setLoading(true);
    try {
      const { data, error} = await supabase
        .from('banner_dismissals')
        .select('user_id, dismissed_at')
        .eq('banner_id', banner.id)
        .order('dismissed_at', { ascending: false });

      if (error) {
        console.error('Error loading dismissals:', error);
        setDismissals([]);
      } else {
        const rawDismissals = data || [];
        let users = [];
        try {
          users = await fetchAdminUserIdentities(rawDismissals.map(dismissal => dismissal.user_id));
        } catch (lookupError) {
          console.error('Error loading banner user details via function:', lookupError);
          users = await fetchAllAdminUsers();
        }

        const userMap = new Map(users.map(user => [user.id, user]));

        setDismissals(rawDismissals.map(dismissal => {
          const user = userMap.get(dismissal.user_id);

          return {
            ...dismissal,
            user_name: user ? getUserDisplayName(user) : dismissal.user_id,
            user_email: user?.email || '',
          };
        }));
      }
    } catch (error) {
      console.error('Error loading dismissals:', error);
      setDismissals([]);
    }
    setLoading(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:max-w-3xl w-full sm:max-h-[90vh] overflow-hidden z-[110] flex flex-col">
          <Dialog.Description className="sr-only">
            Banner analytics and statistics
          </Dialog.Description>

          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              Banner Analytics
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Banner Info */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-2">{banner.title}</h3>
              {banner.content && (
                <p className="text-sm text-gray-600">{banner.content}</p>
              )}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                <p className="text-sm text-teal-700 font-medium mb-1">Total Dismissals</p>
                <p className="text-2xl font-bold text-teal-900">{dismissals.length}</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-sm text-blue-700 font-medium mb-1">Status</p>
                <p className="text-2xl font-bold text-blue-900 capitalize">{banner.status}</p>
              </div>
            </div>

            {/* Dismissals List */}
            <div>
              <h3 className="text-base font-semibold text-gray-900 mb-3">
                Dismissal History ({dismissals.length})
              </h3>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                </div>
              ) : dismissals.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-8 text-center border border-gray-200">
                  <p className="text-gray-500">No dismissals yet</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {dismissals.map((dismissal, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg p-4 border border-gray-200 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          <span className="font-semibold">{dismissal.user_name || 'Unknown user'}</span>
                          {dismissal.user_email ? (
                            <span className="text-gray-500"> · {dismissal.user_email}</span>
                          ) : (
                            <span className="text-gray-500 font-mono"> · {dismissal.user_id.substring(0, 8)}...</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {new Date(dismissal.dismissed_at).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(dismissal.dismissed_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 px-6 py-4 flex justify-end bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
