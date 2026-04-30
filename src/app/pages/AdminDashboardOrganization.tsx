import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUp,
  ArrowDown,
  Zap,
  LayoutDashboard,
  Users,
  ChevronLeft,
  Settings,
  MessageSquare,
  ImageIcon,
  FileText,
  Loader2,
  ClipboardList
} from 'lucide-react';
import {
  getUnifiedDashboardContentFromSupabase,
  reorderDashboardContentAsync,
  type DashboardContentItem
} from '@/app/data/dashboardContent';
import { QuickActionsModal } from '@/app/components/admin/QuickActionsModal';
import { CommunityCardModal } from '@/app/components/admin/CommunityCardModal';
import { toast } from 'sonner';

// Group items by type for positioning view
// All content types are grouped: Messages, Carousel, Banners, and Surveys
// Always show placeholders for each type even if empty
function groupContentForPositioning(items: DashboardContentItem[]): DashboardContentItem[] {
  const grouped: DashboardContentItem[] = [];

  // Messages: group all messages into ONE item (use first message's order), or placeholder if none
  const messageItems = items.filter(i => i.type === 'message');
  if (messageItems.length > 0) {
    grouped.push(messageItems[0]);
  } else {
    // Add placeholder for Messages
    grouped.push({
      type: 'message' as const,
      data: {
        id: 'placeholder-messages',
        title: 'Messages',
        content: '',
        status: 'inactive',
        order: 0,
        type: 'info',
        priority: 0,
        created_at: '',
        updated_at: ''
      }
    });
  }

  // Slides: group all into ONE carousel item (use first slide's order), or placeholder if none
  const slideItems = items.filter(i => i.type === 'slide');
  if (slideItems.length > 0) {
    grouped.push(slideItems[0]);
  } else {
    // Add placeholder for Carousel
    grouped.push({
      type: 'slide' as const,
      data: {
        id: 'placeholder-carousel',
        linkType: 'none',
        status: 'inactive',
        order: 1,
        internalContent: {
          title: 'Carousel',
          content: ''
        }
      }
    });
  }

  // Banners: group all 'announcement' type banners into ONE item
  const bannerItems = items.filter(i => i.type === 'banner' && (i.data as any).type === 'announcement');
  if (bannerItems.length > 0) {
    grouped.push(bannerItems[0]);
  } else {
    // Add placeholder for Banners
    grouped.push({
      type: 'banner' as const,
      data: {
        id: 'placeholder-banners',
        title: 'Banners',
        type: 'announcement',
        displayMode: 'widget',
        priority: 'normal',
        enabled: false,
        order: 2,
        createdAt: ''
      }
    });
  }

  // Surveys: group all 'survey' type banners into ONE item
  const surveyItems = items.filter(i => i.type === 'banner' && (i.data as any).type === 'survey');
  if (surveyItems.length > 0) {
    grouped.push(surveyItems[0]);
  } else {
    // Add placeholder for Surveys
    grouped.push({
      type: 'banner' as const,
      data: {
        id: 'placeholder-surveys',
        title: 'Surveys',
        type: 'survey',
        displayMode: 'widget',
        priority: 'normal',
        enabled: false,
        order: 3,
        createdAt: ''
      }
    });
  }

  // Quick Actions: single item
  const quickActionsItem = items.find(i => i.type === 'quickActions');
  if (quickActionsItem) {
    grouped.push(quickActionsItem);
  }

  return grouped.sort((a, b) => a.data.order - b.data.order);
}

export default function AdminDashboardOrganization() {
  const [unifiedContent, setUnifiedContent] = useState<DashboardContentItem[]>([]);
  const [isQuickActionsModalOpen, setIsQuickActionsModalOpen] = useState(false);
  const [isCommunityCardModalOpen, setIsCommunityCardModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadContent = async () => {
    setLoading(true);
    const content = await getUnifiedDashboardContentFromSupabase();
    setUnifiedContent(groupContentForPositioning(content.filter(item => item.type !== 'community')));
    setLoading(false);
  };

  useEffect(() => {
    loadContent();

    const handleUpdate = () => {
      loadContent();
    };
    window.addEventListener('dashboard-content-updated', handleUpdate);
    return () => window.removeEventListener('dashboard-content-updated', handleUpdate);
  }, []);

  const handleMoveItemUp = async (index: number) => {
    if (index === 0) return;

    const currentItem = unifiedContent[index];
    const targetItem = unifiedContent[index - 1];

    // Don't allow moving placeholders
    if (currentItem.data.id.startsWith('placeholder-') || targetItem.data.id.startsWith('placeholder-')) {
      return;
    }

    const allItems = await getUnifiedDashboardContentFromSupabase();
    const filteredItems = allItems.filter(item => item.type !== 'community');

    // Special handling for grouped types: move ALL items of that group together
    const isGroupedType = (item: DashboardContentItem) => {
      return item.type === 'message' || item.type === 'slide' || item.type === 'banner';
    };

    if (isGroupedType(currentItem) || isGroupedType(targetItem)) {
      // Get all items in current group
      const getCurrentGroupItems = (item: DashboardContentItem) => {
        if (item.type === 'message') {
          return allItems.filter(i => i.type === 'message');
        } else if (item.type === 'slide') {
          return allItems.filter(i => i.type === 'slide');
        } else if (item.type === 'banner') {
          const isSurvey = (item.data as any).type === 'survey';
          return allItems.filter(i =>
            i.type === 'banner' && ((i.data as any).type === 'survey') === isSurvey
          );
        }
        return [item];
      };

      const currentItems = getCurrentGroupItems(currentItem);
      const targetItems = getCurrentGroupItems(targetItem);
      const otherItems = allItems.filter(i =>
        !currentItems.includes(i) && !targetItems.includes(i)
      );

      // Swap order values
      const minCurrentOrder = Math.min(...currentItems.map(i => i.data.order));
      const minTargetOrder = Math.min(...targetItems.map(i => i.data.order));

      targetItems.forEach(item => {
        item.data.order = item.data.order - minTargetOrder + minCurrentOrder;
      });
      currentItems.forEach(item => {
        item.data.order = item.data.order - minCurrentOrder + minTargetOrder;
      });

      const newContent = [...currentItems, ...targetItems, ...otherItems].sort((a, b) => a.data.order - b.data.order);
      await reorderDashboardContentAsync(newContent);
      setUnifiedContent(groupContentForPositioning(newContent));
    } else {
      // Regular swap for individual items
      const newContent = [...filteredItems];
      const currentIdx = newContent.findIndex(i => i.data.id === currentItem.data.id);
      const targetIdx = newContent.findIndex(i => i.data.id === targetItem.data.id);

      [newContent[currentIdx], newContent[targetIdx]] = [newContent[targetIdx], newContent[currentIdx]];
      [newContent[currentIdx].data.order, newContent[targetIdx].data.order] =
        [newContent[targetIdx].data.order, newContent[currentIdx].data.order];

      await reorderDashboardContentAsync(newContent);
      setUnifiedContent(groupContentForPositioning(newContent));
    }

    toast.success('Content reordered');
  };

  const handleMoveItemDown = async (index: number) => {
    if (index === unifiedContent.length - 1) return;

    const currentItem = unifiedContent[index];
    const targetItem = unifiedContent[index + 1];

    // Don't allow moving placeholders
    if (currentItem.data.id.startsWith('placeholder-') || targetItem.data.id.startsWith('placeholder-')) {
      return;
    }

    const allItems = await getUnifiedDashboardContentFromSupabase();
    const filteredItems = allItems.filter(item => item.type !== 'community');

    // Special handling for grouped types: move ALL items of that group together
    const isGroupedType = (item: DashboardContentItem) => {
      return item.type === 'message' || item.type === 'slide' || item.type === 'banner';
    };

    if (isGroupedType(currentItem) || isGroupedType(targetItem)) {
      // Get all items in current group
      const getCurrentGroupItems = (item: DashboardContentItem) => {
        if (item.type === 'message') {
          return allItems.filter(i => i.type === 'message');
        } else if (item.type === 'slide') {
          return allItems.filter(i => i.type === 'slide');
        } else if (item.type === 'banner') {
          const isSurvey = (item.data as any).type === 'survey';
          return allItems.filter(i =>
            i.type === 'banner' && ((i.data as any).type === 'survey') === isSurvey
          );
        }
        return [item];
      };

      const currentItems = getCurrentGroupItems(currentItem);
      const targetItems = getCurrentGroupItems(targetItem);
      const otherItems = allItems.filter(i =>
        !currentItems.includes(i) && !targetItems.includes(i)
      );

      // Swap order values
      const minCurrentOrder = Math.min(...currentItems.map(i => i.data.order));
      const minTargetOrder = Math.min(...targetItems.map(i => i.data.order));

      targetItems.forEach(item => {
        item.data.order = item.data.order - minTargetOrder + minCurrentOrder;
      });
      currentItems.forEach(item => {
        item.data.order = item.data.order - minCurrentOrder + minTargetOrder;
      });

      const newContent = [...currentItems, ...targetItems, ...otherItems].sort((a, b) => a.data.order - b.data.order);
      await reorderDashboardContentAsync(newContent);
      setUnifiedContent(groupContentForPositioning(newContent));
    } else {
      // Regular swap for individual items
      const newContent = [...filteredItems];
      const currentIdx = newContent.findIndex(i => i.data.id === currentItem.data.id);
      const targetIdx = newContent.findIndex(i => i.data.id === targetItem.data.id);

      [newContent[currentIdx], newContent[targetIdx]] = [newContent[targetIdx], newContent[currentIdx]];
      [newContent[currentIdx].data.order, newContent[targetIdx].data.order] =
        [newContent[targetIdx].data.order, newContent[currentIdx].data.order];

      await reorderDashboardContentAsync(newContent);
      setUnifiedContent(groupContentForPositioning(newContent));
    }

    toast.success('Content reordered');
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Organization</h1>
        </div>
        <p className="text-gray-600">Organize content layout and positioning on the dashboard</p>
      </div>

      {/* Info Box */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <LayoutDashboard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900 mb-1">Content Positioning</h3>
            <p className="text-sm text-blue-700">
              Use the arrows to reorder dashboard content relative to Quick Actions.
              To add new content, go to Dashboard Content and select the type you want to create.
            </p>
          </div>
        </div>
      </div>

      {/* Content Layout & Positioning */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <LayoutDashboard className="w-5 h-5 text-gray-600" />
          <h2 className="text-xl font-semibold text-gray-900">Content Layout & Positioning</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : unifiedContent.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <LayoutDashboard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 mb-4">No content to organize yet.</p>
            <p className="text-sm text-gray-400">
              Add content from <Link to="/admin/dashboard-content" className="text-teal-600 hover:underline">Dashboard Content</Link>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {unifiedContent.map((item, index) => (
              <div
                key={`${item.type}-${item.data.id}`}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Reorder Controls */}
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleMoveItemUp(index)}
                      disabled={index === 0 || item.data.id.startsWith('placeholder-')}
                      className={`p-1.5 rounded transition-colors ${
                        index === 0 || item.data.id.startsWith('placeholder-')
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                      }`}
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveItemDown(index)}
                      disabled={index === unifiedContent.length - 1 || item.data.id.startsWith('placeholder-')}
                      className={`p-1.5 rounded transition-colors ${
                        index === unifiedContent.length - 1 || item.data.id.startsWith('placeholder-')
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

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-teal-600 uppercase">Quick Actions</span>
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                                Fixed Position
                              </span>
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

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setIsQuickActionsModalOpen(true)}
                          className="p-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition-colors"
                          title="Configure Quick Actions"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  ) : item.type === 'message' ? (
                    <>
                      <div className="flex-shrink-0 w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-purple-600 uppercase">Messages</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Dashboard Messages
                        </h3>
                        <p className={`text-sm ${item.data.id === 'placeholder-messages' ? 'text-gray-400 italic' : 'text-gray-600'}`}>
                          {item.data.id === 'placeholder-messages' ? 'No messages created yet' : 'Welcome messages and announcements'}
                        </p>
                      </div>
                      <Link
                        to="/admin/dashboard-content/messages"
                        className="p-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition-colors"
                        title="Edit Messages"
                      >
                        <Settings className="w-4 h-4" />
                      </Link>
                    </>
                  ) : item.type === 'slide' ? (
                    <>
                      <div className="flex-shrink-0 w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-indigo-600 uppercase">Carousel</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          Hero Carousel
                        </h3>
                        <p className={`text-sm ${item.data.id === 'placeholder-carousel' ? 'text-gray-400 italic' : 'text-gray-600'}`}>
                          {item.data.id === 'placeholder-carousel' ? 'No slides created yet' : 'Image carousel slides'}
                        </p>
                      </div>
                      <Link
                        to="/admin/dashboard-content/images"
                        className="p-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition-colors"
                        title="Edit Carousel"
                      >
                        <Settings className="w-4 h-4" />
                      </Link>
                    </>
                  ) : item.type === 'banner' ? (
                    <>
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                        item.data.type === 'survey' ? 'bg-orange-50' : 'bg-green-50'
                      }`}>
                        {item.data.type === 'survey' ? (
                          <ClipboardList className="w-5 h-5 text-orange-600" />
                        ) : (
                          <MessageSquare className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium uppercase ${
                            item.data.type === 'survey' ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {item.data.type === 'survey' ? 'Surveys' : 'Banners'}
                          </span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {item.data.type === 'survey' ? 'User Surveys' : 'Dashboard Banners'}
                        </h3>
                        <p className={`text-sm ${item.data.id.startsWith('placeholder-') ? 'text-gray-400 italic' : 'text-gray-600'}`}>
                          {item.data.id === 'placeholder-banners'
                            ? 'No banners created yet'
                            : item.data.id === 'placeholder-surveys'
                            ? 'No surveys created yet'
                            : (item.data.type === 'survey' ? 'User feedback surveys' : 'Announcement banners')}
                        </p>
                      </div>
                      <Link
                        to="/admin/dashboard-content/banners"
                        className="p-2 border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition-colors"
                        title={item.data.type === 'survey' ? 'Edit Surveys' : 'Edit Banners'}
                      >
                        <Settings className="w-4 h-4" />
                      </Link>
                    </>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Community Card Settings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Community Card</h2>
          </div>
          <button
            onClick={() => setIsCommunityCardModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Settings className="w-4 h-4" />
            Configure Community Card
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600">
            The Community card appears separately in the dashboard. Configure its visibility and settings here.
          </p>
        </div>
      </section>

      {/* Modals */}
      <QuickActionsModal
        isOpen={isQuickActionsModalOpen}
        onClose={() => setIsQuickActionsModalOpen(false)}
        onSave={() => {
          loadContent();
        }}
      />

      <CommunityCardModal
        isOpen={isCommunityCardModalOpen}
        onClose={() => setIsCommunityCardModalOpen(false)}
        onSave={() => {
          loadContent();
        }}
      />
    </>
  );
}
