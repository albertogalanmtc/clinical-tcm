import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { Plus, Trash2, Edit2, ImageIcon, ChevronLeft, Loader2, Settings, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import {
  getHeroSlides,
  deleteHeroSlide,
  updateHeroSlide,
  getCarouselSettings,
  type HeroSlide,
  type CarouselRatio
} from '@/app/data/dashboardContent';
import { HeroSlideModal } from '@/app/components/admin/HeroSlideModal';
import { CarouselSettingsModal } from '@/app/components/admin/CarouselSettingsModal';
import { toast } from 'sonner';

// Helper function to get aspect ratio classes
const getRatioClasses = (ratio: CarouselRatio) => {
  switch (ratio) {
    case '16:9':
      return 'aspect-[16/9]';
    case '9:16':
      return 'aspect-[9/16]';
    case 'fullscreen':
      return ''; // Fullscreen doesn't use aspect ratio
    default:
      return 'aspect-[16/9]';
  }
};

export default function AdminDashboardImages() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [isCarouselSettingsModalOpen, setIsCarouselSettingsModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);
  const settings = getCarouselSettings();

  const loadSlides = () => {
    setLoading(true);
    const data = getHeroSlides();
    setSlides(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSlides();

    const handleUpdate = () => {
      loadSlides();
    };

    window.addEventListener('dashboard-content-updated', handleUpdate);
    return () => window.removeEventListener('dashboard-content-updated', handleUpdate);
  }, []);

  const confirmDelete = () => {
    if (!itemToDelete) return;

    deleteHeroSlide(itemToDelete.id);
    toast.success('Slide deleted successfully');
    loadSlides();

    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleToggleVisibility = (slide: HeroSlide) => {
    updateHeroSlide(slide.id, {
      visible: !slide.visible
    });
    toast.success(`Slide ${!slide.visible ? 'shown' : 'hidden'}`);
    loadSlides();
  };

  const handleReorder = (slide: HeroSlide, direction: 'up' | 'down') => {
    const currentIndex = slides.findIndex(s => s.id === slide.id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === slides.length - 1)
    ) {
      return;
    }

    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    [newSlides[currentIndex], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[currentIndex]];

    // Update order property
    newSlides.forEach((s, index) => {
      updateHeroSlide(s.id, {
        order: index
      });
    });

    toast.success('Slide reordered');
    loadSlides();
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Carousel</h1>
        </div>
        <p className="text-gray-600">Manage carousel images and settings</p>
      </div>

      {/* Action Buttons */}
      <div className="mb-8 flex items-center justify-between">
        <button
          onClick={() => setIsCarouselSettingsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          <Settings className="w-4 h-4" />
          Carousel Settings
        </button>

        <button
          onClick={() => {
            setEditingSlide(null);
            setIsSlideModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Slide
        </button>
      </div>

      {/* Carousel Preview Info */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <ImageIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900 mb-1">Current Settings</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• Desktop Ratio: <strong>{settings.desktopRatio}</strong></p>
              <p>• Mobile Ratio: <strong>{settings.mobileRatio}</strong></p>
              <p>• Transition Interval: <strong>{settings.transitionInterval}ms</strong></p>
            </div>
          </div>
        </div>
      </div>

      {/* Slides List */}
      {slides.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Slides Yet</h3>
          <p className="text-gray-600 mb-4">Create your first carousel slide</p>
          <button
            onClick={() => {
              setEditingSlide(null);
              setIsSlideModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Slide
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start gap-4">
                {/* Reorder Controls */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleReorder(slide, 'up')}
                    disabled={index === 0}
                    className={`p-1.5 rounded transition-colors ${
                      index === 0
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReorder(slide, 'down')}
                    disabled={index === slides.length - 1}
                    className={`p-1.5 rounded transition-colors ${
                      index === slides.length - 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Slide Preview */}
                <div className={`w-32 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 ${getRatioClasses(settings.desktopRatio)}`}>
                  {slide.image ? (
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Slide Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 truncate pr-2">
                      {slide.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleToggleVisibility(slide)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          slide.visible
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {slide.visible ? 'Visible' : 'Hidden'}
                      </button>
                    </div>
                  </div>
                  {slide.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {slide.description}
                    </p>
                  )}
                  {slide.ctaText && (
                    <div className="text-xs text-gray-500">
                      CTA: <span className="font-medium">{slide.ctaText}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => {
                      setEditingSlide(slide);
                      setIsSlideModalOpen(true);
                    }}
                    className="p-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setItemToDelete({ id: slide.id, title: slide.title });
                      setDeleteConfirmOpen(true);
                    }}
                    className="p-2 border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <HeroSlideModal
        isOpen={isSlideModalOpen}
        onClose={() => {
          setIsSlideModalOpen(false);
          setEditingSlide(null);
        }}
        slide={editingSlide}
        onSave={loadSlides}
      />

      <CarouselSettingsModal
        isOpen={isCarouselSettingsModalOpen}
        onClose={() => setIsCarouselSettingsModalOpen(false)}
        onSave={loadSlides}
      />

      {/* Delete Confirmation Modal */}
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
