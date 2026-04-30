import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import {
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Globe,
  RefreshCw,
  Check,
  AlertCircle,
  FileText,
  ImageIcon,
  ExternalLink,
  Zap,
  LayoutDashboard,
  ChevronLeft
} from 'lucide-react';
import {
  getHeroSlides,
  deleteHeroSlide,
  updateHeroSlide,
  getCarouselSettings,
  saveCarouselSettings,
  hasUnpublishedCarouselChanges,
  publishCarouselChanges,
  getWelcomeMessages,
  deleteWelcomeMessage,
  updateWelcomeMessage,
  getUnifiedDashboardContent,
  reorderDashboardContent,
  updateQuickActions,
  type HeroSlide,
  type CarouselRatio,
  type WelcomeMessage,
  type QuickActions,
  type DashboardContentItem
} from '@/app/data/dashboardContent';
import { HeroSlideModal } from '@/app/components/admin/HeroSlideModal';
import { WelcomeMessageModal } from '@/app/components/admin/WelcomeMessageModal';
import { QuickActionsModal } from '@/app/components/admin/QuickActionsModal';
import { CarouselSettingsModal } from '@/app/components/admin/CarouselSettingsModal';
import { COUNTRIES } from '@/app/components/admin/CountryMultiSelect';
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

export default function AdminDashboardMessages() {
  const [unifiedContent, setUnifiedContent] = useState<DashboardContentItem[]>(
    getUnifiedDashboardContent().filter(item => item.type !== 'community')
  );
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const settings = getCarouselSettings();
  const [desktopRatio, setDesktopRatio] = useState<CarouselRatio>(settings.desktopRatio);
  const [mobileRatio, setMobileRatio] = useState<CarouselRatio>(settings.mobileRatio);
  const [transitionInterval, setTransitionInterval] = useState<number>(settings.transitionInterval);
  const [hasChanges, setHasChanges] = useState(hasUnpublishedCarouselChanges());
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [editingMessage, setEditingMessage] = useState<WelcomeMessage | null>(null);
  const [isQuickActionsModalOpen, setIsQuickActionsModalOpen] = useState(false);
  const [isCarouselSettingsModalOpen, setIsCarouselSettingsModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'slide' | 'message'; title: string } | null>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setUnifiedContent(getUnifiedDashboardContent().filter(item => item.type !== 'community'));
      setHasChanges(hasUnpublishedCarouselChanges());
    };
    window.addEventListener('dashboard-content-updated', handleUpdate);
    return () => window.removeEventListener('dashboard-content-updated', handleUpdate);
  }, []);

  useEffect(() => {
    setHasChanges(hasUnpublishedCarouselChanges());
  }, [unifiedContent, desktopRatio, mobileRatio]);

  const handleDeleteHeroSlide = (id: string, title: string = 'this slide') => {
    setItemToDelete({ id, type: 'slide', title });
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'slide') {
      deleteHeroSlide(itemToDelete.id);
      setUnifiedContent(getUnifiedDashboardContent().filter(item => item.type !== 'community'));
      setHasChanges(hasUnpublishedCarouselChanges());
    } else if (itemToDelete.type === 'message') {
      deleteWelcomeMessage(itemToDelete.id);
      setUnifiedContent(getUnifiedDashboardContent().filter(item => item.type !== 'community'));
      setHasChanges(hasUnpublishedCarouselChanges());
    }

    setDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleToggleHeroSlide = (slide: HeroSlide) => {
    const newStatus = slide.status === 'active' ? 'inactive' : 'active';
    updateHeroSlide(slide.id, { status: newStatus });
    setUnifiedContent(getUnifiedDashboardContent().filter(item => item.type !== 'community'));
    setHasChanges(hasUnpublishedCarouselChanges());
  };

  const handleDeleteWelcomeMessage = (id: string, title: string = 'this message') => {
    setItemToDelete({ id, type: 'message', title });
    setDeleteConfirmOpen(true);
  };

  const handleToggleWelcomeMessage = (message: WelcomeMessage) => {
    const newEnabled = !message.enabled;
    updateWelcomeMessage(message.id, { enabled: newEnabled });
    setUnifiedContent(getUnifiedDashboardContent().filter(item => item.type !== 'community'));
    setHasChanges(hasUnpublishedCarouselChanges());
  };

  const handleToggleQuickActions = (quickActions: QuickActions) => {
    const newEnabled = !quickActions.enabled;
    updateQuickActions({ enabled: newEnabled });
    setUnifiedContent(getUnifiedDashboardContent().filter(item => item.type !== 'community'));
    setHasChanges(hasUnpublishedCarouselChanges());
  };

  const handleMoveItemUp = (index: number) => {
    if (index > 0) {
      const newContent = [...unifiedContent];
      [newContent[index], newContent[index - 1]] = [newContent[index - 1], newContent[index]];
      reorderDashboardContent(newContent);
      setUnifiedContent(getUnifiedDashboardContent().filter(item => item.type !== 'community'));
      setHasChanges(hasUnpublishedCarouselChanges());
    }
  };

  const handleMoveItemDown = (index: number) => {
    if (index < unifiedContent.length - 1) {
      const newContent = [...unifiedContent];
      [newContent[index], newContent[index + 1]] = [newContent[index + 1], newContent[index]];
      reorderDashboardContent(newContent);
      setUnifiedContent(getUnifiedDashboardContent().filter(item => item.type !== 'community'));
      setHasChanges(hasUnpublishedCarouselChanges());
    }
  };

  const getCountryNames = (codes: string[] = []) => {
    if (codes.length === 0) return 'Global';
    if (codes.length <= 3) {
      return codes.map(code => COUNTRIES.find(c => c.code === code)?.name || code).join(', ');
    }
    return `${codes.length} countries`;
  };

  const handleSave = () => {
    setSaveStatus('saving');
    publishCarouselChanges();

    setTimeout(() => {
      setSaveStatus('saved');
      setHasChanges(false);
      toast.success('Dashboard content published successfully!');

      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }, 500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Are you sure you want to reset all dashboard content to defaults? This will remove all custom slides and messages.')) {
      localStorage.removeItem('admin_hero_slides');
      localStorage.removeItem('admin_welcome_messages');
      localStorage.removeItem('admin_carousel_settings');
      localStorage.removeItem('admin_hero_slides_published');
      localStorage.removeItem('admin_welcome_messages_published');
      localStorage.removeItem('admin_carousel_settings_published');
      localStorage.removeItem('admin_quick_actions');
      localStorage.removeItem('admin_quick_actions_published');

      setUnifiedContent(getUnifiedDashboardContent().filter(item => item.type !== 'community'));
      setDesktopRatio('16:9');
      setMobileRatio('9:16');
      setTransitionInterval(5);
      setHasChanges(false);
      setSaveStatus('idle');

      window.dispatchEvent(new Event('dashboard-content-updated'));
      toast.success('Dashboard content reset to defaults');
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Messages & Carousel</h1>
        </div>
        <p className="hidden sm:block text-gray-600">
          Manage welcome messages and hero carousel displayed on user dashboards
        </p>
      </div>

      {/* Info Banner */}
      <div className="mb-8 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          Content managed here is segmented by country. Users will only see content targeted to their country or global content.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-sm text-amber-600 font-medium flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              Unpublished changes
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset to Defaults</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving' || !hasChanges}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {saveStatus === 'saved' ? (
              <>
                <Check className="w-4 h-4" />
                <span>Published</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Publish Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Unified Dashboard Content Manager */}
      <section className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Dashboard Content</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingMessage(null);
                setIsMessageModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <FileText className="w-4 h-4" />
              Message
            </button>
            <button
              onClick={() => {
                setEditingSlide(null);
                setIsSlideModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              <ImageIcon className="w-4 h-4" />
              Slide
            </button>
          </div>
        </div>

        {unifiedContent.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="flex items-center justify-center gap-4 mb-3">
              <FileText className="w-12 h-12 text-gray-300" />
              <ImageIcon className="w-12 h-12 text-gray-300" />
            </div>
            <p className="text-gray-500 mb-4">No content yet. Add messages or slides to get started.</p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setEditingMessage(null);
                  setIsMessageModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Message
              </button>
              <button
                onClick={() => {
                  setEditingSlide(null);
                  setIsSlideModalOpen(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Slide
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {unifiedContent.map((item, index) => (
              <div
                key={`${item.type}-${item.data.id}`}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-4 overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0">
                  {/* Reorder Controls */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleMoveItemUp(index)}
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
                      onClick={() => handleMoveItemDown(index)}
                      disabled={index === unifiedContent.length - 1}
                      className={`p-1.5 rounded transition-colors ${
                        index === unifiedContent.length - 1
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                      }`}
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Content Preview */}
                  {item.type === 'quickActions' ? (
                    <>
                      <div className="flex-shrink-0 w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-teal-600" />
                      </div>

                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs font-medium text-teal-600 uppercase">Quick Actions</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              Quick Action Cards
                            </h3>
                            <p className="text-sm text-gray-600">
                              Build Prescription • Browse Herbs • Browse Formulas • My Prescriptions
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0 min-w-fit">
                        <button
                          onClick={() => handleToggleQuickActions(item.data)}
                          className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 transition-colors ${
                            item.data.enabled
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={item.data.enabled ? 'Click to disable' : 'Click to enable'}
                        >
                          {item.data.enabled ? 'active' : 'inactive'}
                        </button>
                        <button
                          onClick={() => setIsQuickActionsModalOpen(true)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-colors"
                          title="Edit Quick Actions"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : item.type === 'slide' ? (
                    <>
                      <div className={`relative ${getRatioClasses(item.data.desktopRatio || item.data.ratio || desktopRatio)} w-32 bg-gray-100 rounded border border-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden`}>
                        {item.data.imageUrl ? (
                          <img
                            src={item.data.imageUrl}
                            alt="Slide preview"
                            className="w-full h-full object-cover"
                            style={
                              item.data.imagePosition
                                ? { objectPosition: `${item.data.imagePosition.x}% ${item.data.imagePosition.y}%` }
                                : undefined
                            }
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              {item.data.linkType === 'external' ? (
                                <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              ) : item.data.linkType === 'internal' ? (
                                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              ) : (
                                <ImageIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              )}
                              <span className="text-xs font-medium text-teal-600 uppercase">
                                {item.data.carouselGroup ? `Carousel: ${item.data.carouselGroup}` : 'Single Image'}
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="text-xs font-medium text-gray-500 uppercase">
                                {item.data.linkType === 'external' ? 'External Link' : item.data.linkType === 'internal' ? 'Internal Info' : 'No Link'}
                              </span>
                            </div>
                            {item.data.linkType === 'external' && item.data.externalUrl && (
                              <a
                                href={item.data.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-teal-600 hover:text-teal-700 font-medium truncate block mb-1"
                              >
                                {item.data.externalUrl}
                              </a>
                            )}
                            {item.data.linkType === 'internal' && item.data.internalContent && (
                              <h3 className="font-semibold text-gray-900 truncate mb-1">
                                {item.data.internalContent.title}
                              </h3>
                            )}
                            <div className="flex items-center gap-2 text-xs">
                              <Globe className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-500">
                                {getCountryNames(item.data.countries)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0 min-w-fit">
                        <button
                          onClick={() => handleToggleHeroSlide(item.data)}
                          className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 transition-colors ${
                            item.data.status === 'active'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={item.data.status === 'active' ? 'Click to disable' : 'Click to enable'}
                        >
                          {item.data.status}
                        </button>
                        <button
                          onClick={() => {
                            setEditingSlide(item.data);
                            setIsSlideModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const title = item.data.linkType === 'internal' && item.data.internalContent
                              ? `"${item.data.internalContent.title}"`
                              : item.data.carouselGroup
                              ? `la imagen del carousel "${item.data.carouselGroup}"`
                              : 'esta imagen';
                            handleDeleteHeroSlide(item.data.id, title);
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>

                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-xs font-medium text-blue-600 uppercase">Welcome Message</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 truncate mb-1">
                              {item.data.title}
                            </h3>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {item.data.content}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <Globe className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-500">
                                {getCountryNames(item.data.countries)}
                              </span>
                              {item.data.dateRange?.start || item.data.dateRange?.end ? (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-gray-500">
                                    {item.data.dateRange.start && item.data.dateRange.end
                                      ? `${new Date(item.data.dateRange.start).toLocaleDateString()} - ${new Date(item.data.dateRange.end).toLocaleDateString()}`
                                      : item.data.dateRange.start
                                      ? `From ${new Date(item.data.dateRange.start).toLocaleDateString()}`
                                      : `Until ${new Date(item.data.dateRange.end).toLocaleDateString()}`}
                                  </span>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0 min-w-fit">
                        <button
                          onClick={() => handleToggleWelcomeMessage(item.data)}
                          className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 transition-colors ${
                            item.data.enabled
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                          title={item.data.enabled ? 'Click to disable' : 'Click to enable'}
                        >
                          {item.data.enabled ? 'active' : 'inactive'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingMessage(item.data);
                            setIsMessageModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWelcomeMessage(item.data.id, `"${item.data.title}"`)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Carousel Settings */}
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <ImageIcon className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Carousel Settings</h2>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-1">Aspect Ratios & Transition Time</h3>
              <p className="text-sm text-gray-600">
                Desktop: <span className="font-medium">{desktopRatio === 'fullscreen' ? 'Fullscreen' : desktopRatio}</span> •
                Mobile: <span className="font-medium"> {mobileRatio === 'fullscreen' ? 'Fullscreen' : mobileRatio}</span> •
                Transition: <span className="font-medium"> {transitionInterval}s</span>
              </p>
            </div>
            <button
              onClick={() => setIsCarouselSettingsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              <Edit2 className="w-4 h-4" />
              Configure
            </button>
          </div>
        </div>
      </section>

      {/* Modals */}
      <HeroSlideModal
        isOpen={isSlideModalOpen}
        onClose={() => {
          setIsSlideModalOpen(false);
          setEditingSlide(null);
        }}
        slide={editingSlide}
        onSave={() => {
          setUnifiedContent(getUnifiedDashboardContent().filter(item => item.type !== 'community'));
          setHasChanges(hasUnpublishedCarouselChanges());
        }}
      />

      <WelcomeMessageModal
        isOpen={isMessageModalOpen}
        onClose={() => {
          setIsMessageModalOpen(false);
          setEditingMessage(null);
        }}
        message={editingMessage}
        onSave={() => {
          setUnifiedContent(getUnifiedDashboardContent().filter(item => item.type !== 'community'));
          setHasChanges(hasUnpublishedCarouselChanges());
        }}
      />

      <QuickActionsModal
        isOpen={isQuickActionsModalOpen}
        onClose={() => setIsQuickActionsModalOpen(false)}
        onSave={() => {
          setUnifiedContent(getUnifiedDashboardContent().filter(item => item.type !== 'community'));
          setHasChanges(hasUnpublishedCarouselChanges());
        }}
      />

      <CarouselSettingsModal
        isOpen={isCarouselSettingsModalOpen}
        onClose={() => setIsCarouselSettingsModalOpen(false)}
        currentDesktopRatio={desktopRatio}
        currentMobileRatio={mobileRatio}
        currentTransitionInterval={transitionInterval}
        onSave={(newDesktopRatio, newMobileRatio, newTransitionInterval) => {
          setDesktopRatio(newDesktopRatio);
          setMobileRatio(newMobileRatio);
          setTransitionInterval(newTransitionInterval);
          saveCarouselSettings({
            desktopRatio: newDesktopRatio,
            mobileRatio: newMobileRatio,
            transitionInterval: newTransitionInterval
          });
          setHasChanges(hasUnpublishedCarouselChanges());
        }}
      />

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
                <button
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
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
