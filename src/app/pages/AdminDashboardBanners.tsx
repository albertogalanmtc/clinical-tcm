import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, Trash2, Edit2, MessageSquare, ChevronLeft, Loader2, BarChart3, ChevronUp, ChevronDown } from 'lucide-react';
import { bannersService, type Banner } from '@/app/services/bannersService';
import { BannerModal } from '@/app/components/admin/BannerModal';
import { BannerAnalyticsModal } from '@/app/components/admin/BannerAnalyticsModal';
import { toast } from 'sonner';

export default function AdminDashboardBanners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);
  const [dismissalCounts, setDismissalCounts] = useState<Record<string, number>>({});
  const [analyticsModalOpen, setAnalyticsModalOpen] = useState(false);
  const [selectedBannerForAnalytics, setSelectedBannerForAnalytics] = useState<Banner | null>(null);

  const loadBanners = async () => {
    setLoading(true);
    const data = await bannersService.getAllBanners();
    setBanners(data);

    const counts: Record<string, number> = {};
    for (const banner of data) {
      const count = await bannersService.getBannerDismissalCount(banner.id);
      counts[banner.id] = count;
    }
    setDismissalCounts(counts);

    setLoading(false);
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    const success = await bannersService.deleteBanner(itemToDelete.id);
    if (success) {
      toast.success('Banner deleted successfully');
      loadBanners();
    } else {
      toast.error('Failed to delete banner');
    }

    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleStatusToggle = async (banner: Banner) => {
    const newStatus = banner.status === 'active' ? 'inactive' : 'active';
    const updated = await bannersService.updateBanner(banner.id, { status: newStatus });

    if (updated) {
      toast.success(`Banner ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
      loadBanners();
    } else {
      toast.error('Failed to update banner');
    }
  };

  const moveBanner = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === banners.length - 1)
    ) {
      return;
    }

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[newIndex];
    newBanners[newIndex] = temp;

    // Update display_order for both banners
    await bannersService.updateBannerOrder(newBanners[index].id, index);
    await bannersService.updateBannerOrder(newBanners[newIndex].id, newIndex);

    setBanners(newBanners);
    toast.success('Order updated');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <Link
            to="/admin/dashboard-content"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-gray-300 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="sr-only">Back to Dashboard Content</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Banners</h1>
        </div>
        <p className="text-gray-600">Manage dashboard banners and announcements</p>
      </div>

      <div className="mb-8 flex items-center justify-end">
        <button
          onClick={() => {
            setEditingBanner(null);
            setIsBannerModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Banner
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Banners Yet</h3>
          <p className="text-gray-600 mb-4">Create your first banner to display announcements</p>
          <button
            onClick={() => {
              setEditingBanner(null);
              setIsBannerModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col"
            >
              <div className="flex-1">
                <div className="flex items-start gap-2 mb-2">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveBanner(index, 'up')}
                      disabled={index === 0}
                      className={`p-1 rounded transition-colors ${
                        index === 0
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title="Move up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveBanner(index, 'down')}
                      disabled={index === banners.length - 1}
                      className={`p-1 rounded transition-colors ${
                        index === banners.length - 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                      title="Move down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                    {banner.title}
                  </h3>
                  <button
                    onClick={() => handleStatusToggle(banner)}
                    className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 transition-colors ${
                      banner.status === 'active'
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {banner.status}
                  </button>
                </div>
                {banner.content && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {banner.content}
                  </p>
                )}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    banner.type === 'warning' ? 'bg-amber-100 text-amber-700' :
                    banner.type === 'error' ? 'bg-red-100 text-red-700' :
                    banner.type === 'success' ? 'bg-green-100 text-green-700' :
                    banner.type === 'announcement' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {banner.type}
                  </span>
                  {banner.dismissible && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                      Dismissible
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedBannerForAnalytics(banner);
                    setAnalyticsModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2 py-1.5 bg-teal-50 text-teal-700 text-xs rounded hover:bg-teal-100 transition-colors font-medium mt-2"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  View Analytics ({dismissalCounts[banner.id] || 0})
                </button>
              </div>
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => {
                    setEditingBanner(banner);
                    setIsBannerModalOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setItemToDelete({ id: banner.id, title: banner.title });
                    setDeleteConfirmOpen(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BannerModal
        isOpen={isBannerModalOpen}
        onClose={() => {
          setIsBannerModalOpen(false);
          setEditingBanner(null);
        }}
        banner={editingBanner}
        onSave={loadBanners}
      />

      {selectedBannerForAnalytics && (
        <BannerAnalyticsModal
          banner={selectedBannerForAnalytics}
          isOpen={analyticsModalOpen}
          onClose={() => {
            setAnalyticsModalOpen(false);
            setSelectedBannerForAnalytics(null);
          }}
        />
      )}

      <Dialog.Root open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-[100]">
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Deletion
            </Dialog.Title>
            <Dialog.Description className="text-gray-600 mb-6">
              Are you sure you want to delete "{itemToDelete?.title}"? This action cannot be undone.
            </Dialog.Description>
            <div className="flex gap-3 justify-end">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
