import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, Trash2, Edit2, MessageSquare, ChevronLeft, GripVertical, Calendar, BarChart3, RefreshCw, AlertCircle } from 'lucide-react';
import {
  getBanners,
  deleteBanner,
  updateBanner,
  getBannerStatistics,
  reorderBanners,
  publishBanners,
  hasUnpublishedBannersChanges,
  type Banner
} from '@/app/data/banners';
import { BannerModal } from '@/app/components/admin/BannerModal';
import { BannerDetailModal } from '@/app/components/admin/BannerDetailModal';
import { BannerAnalyticsModal } from '@/app/components/admin/BannerAnalyticsModal';
import { toast } from 'sonner';

export default function AdminDashboardBanners() {
  const [banners, setBanners] = useState<Banner[]>(getBanners().sort((a, b) => (a.order || 0) - (b.order || 0)));
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [isBannerDetailModalOpen, setIsSurveyDetailModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [analyticsBanner, setAnalyticsBanner] = useState<Banner | null>(null);
  const [hasBannersChanges, setHasBannersChanges] = useState(hasUnpublishedBannersChanges());

  useEffect(() => {
    const handleBannersUpdate = () => {
      setBanners(getBanners().sort((a, b) => (a.order || 0) - (b.order || 0)));
      setHasBannersChanges(hasUnpublishedBannersChanges());
    };
    window.addEventListener('banners-updated', handleBannersUpdate);
    return () => window.removeEventListener('banners-updated', handleBannersUpdate);
  }, []);

  useEffect(() => {
    setHasBannersChanges(hasUnpublishedBannersChanges());
  }, [banners]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newBanners = [...banners];
    const draggedItem = newBanners[draggedIndex];
    newBanners.splice(draggedIndex, 1);
    newBanners.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    setBanners(newBanners);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null) {
      reorderBanners(banners);
    }
    setDraggedIndex(null);
  };

  const getBannerStatus = (banner: Banner): 'active' | 'scheduled' | 'expired' | 'inactive' => {
    if (!banner.enabled) return 'inactive';

    const now = new Date();
    if (banner.startDate && new Date(banner.startDate) > now) return 'scheduled';
    if (banner.endDate && new Date(banner.endDate) < now) return 'expired';

    return 'active';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;
    deleteBanner(itemToDelete.id);
    setBanners(getBanners());
    setHasBannersChanges(hasUnpublishedBannersChanges());
    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  return (
    <>
      {/* Back Button + Header */}
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
        <p className="text-gray-600">
          Create banners to collect feedback from users. Only one banner per type (modal/widget) can be active at a time.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {hasBannersChanges && (
            <span className="text-sm text-amber-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Unpublished changes
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              publishBanners();
              setHasBannersChanges(false);
              toast.success('Banners published successfully');
            }}
            disabled={!hasBannersChanges}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium ${
              hasBannersChanges
                ? 'bg-teal-600 text-white hover:bg-teal-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Publish Banners
          </button>
          <button
            onClick={() => {
              setEditingBanner(null);
              setIsBannerModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Create Banner
          </button>
        </div>
      </div>

      {/* Banners Grid */}
      {banners.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Banners Yet</h3>
          <p className="text-gray-600 mb-4">Create your first banner to start collecting user feedback</p>
          <button
            onClick={() => {
              setEditingBanner(null);
              setIsBannerModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Create Banner
          </button>
        </div>
      ) : (
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {banners.map((banner, index) => {
            const stats = getBannerStatistics(banner.id);
            const status = getBannerStatus(banner);
            const statusStyles = {
              active: 'bg-green-100 text-green-700',
              scheduled: 'bg-blue-100 text-blue-700',
              expired: 'bg-orange-100 text-orange-700',
              inactive: 'bg-gray-100 text-gray-600'
            };
            return (
              <div
                key={banner.id}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md hover:border-teal-300 transition-all ${
                  draggedIndex === index ? 'opacity-50' : ''
                }`}
              >
                {/* Image preview (if exists) */}
                {banner.imageUrl && (
                  <div
                    onClick={() => {
                      setSelectedBanner(banner);
                      setIsSurveyDetailModalOpen(true);
                    }}
                    className="w-full h-32 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={banner.imageUrl}
                      alt="Banner preview"
                      className="w-full h-full object-cover"
                      style={
                        banner.imagePosition
                          ? { objectPosition: `${banner.imagePosition.x}% ${banner.imagePosition.y}%` }
                          : undefined
                      }
                    />
                  </div>
                )}

                <div
                  onClick={() => {
                    setSelectedBanner(banner);
                    setIsSurveyDetailModalOpen(true);
                  }}
                  className="p-4 space-y-3 cursor-pointer"
                >
                  {/* Drag handle + Title */}
                  <div className="flex items-start gap-2">
                    <GripVertical
                      onMouseDown={(e) => e.stopPropagation()}
                      className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5 cursor-move"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {banner.title}
                      </h3>
                      {banner.type === 'survey' && banner.questions && banner.questions.length > 0 && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {banner.questions.length} question{banner.questions.length > 1 ? 's' : ''}
                        </p>
                      )}
                      {banner.type === 'announcement' && (
                        <p className="text-xs text-gray-500 mt-0.5">Announcement</p>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusStyles[status]}`}>
                      {status}
                    </span>
                  </div>

                  {/* Date Range (if scheduled) */}
                  {(banner.startDate || banner.endDate) && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {banner.startDate && formatDate(banner.startDate)}
                        {banner.startDate && banner.endDate && ' - '}
                        {banner.endDate && formatDate(banner.endDate)}
                      </span>
                    </div>
                  )}

                  {/* Display Mode Badge */}
                  <div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      banner.displayMode === 'modal'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {banner.displayMode === 'modal' ? 'Modal' : 'Widget'}
                    </span>
                  </div>

                  {/* View Analytics Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setAnalyticsBanner(banner);
                      setAnalyticsOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    View Analytics
                  </button>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingBanner(banner);
                        setIsBannerModalOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setItemToDelete({
                          id: banner.id,
                          title: `"${banner.title.substring(0, 50)}${banner.title.length > 50 ? '...' : ''}"`
                        });
                        setDeleteConfirmOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-white border border-red-200 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <BannerModal
        isOpen={isBannerModalOpen}
        onClose={() => {
          setIsBannerModalOpen(false);
          setEditingBanner(null);
        }}
        banner={editingBanner}
      />

      {selectedBanner && (
        <BannerDetailModal
          banner={selectedBanner}
          isOpen={isBannerDetailModalOpen}
          onClose={() => {
            setIsSurveyDetailModalOpen(false);
            setSelectedBanner(null);
          }}
          onEdit={() => {
            setEditingBanner(selectedBanner);
            setIsSurveyDetailModalOpen(false);
            setIsBannerModalOpen(true);
          }}
          onDelete={() => {
            setItemToDelete({ id: selectedBanner.id, title: `"${selectedBanner.title}"` });
            setIsSurveyDetailModalOpen(false);
            setDeleteConfirmOpen(true);
          }}
        />
      )}

      {/* Analytics Modal */}
      {analyticsBanner && (
        <BannerAnalyticsModal
          banner={analyticsBanner}
          isOpen={analyticsOpen}
          onClose={() => {
            setAnalyticsOpen(false);
            setAnalyticsBanner(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <Dialog.Root open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-[100]">
            <Dialog.Title className="text-lg font-semibold text-gray-900 mb-2">
              Confirmar eliminación
            </Dialog.Title>
            <Dialog.Description className="text-gray-600 mb-6">
              ¿Estás seguro de que quieres eliminar {itemToDelete?.title}? Esta acción no se puede deshacer.
            </Dialog.Description>
            <div className="flex gap-3 justify-end">
              <Dialog.Close asChild>
                <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
