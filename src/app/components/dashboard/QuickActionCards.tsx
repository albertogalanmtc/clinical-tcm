import { Link } from 'react-router-dom';
import { useSectionIcon } from '@/app/hooks/useSectionIcon';
import { ChevronRight } from 'lucide-react';
import { getQuickActionsPublished, type QuickActionItem } from '@/app/data/dashboardContent';
import { useState, useEffect } from 'react';
import { getNotificationCount } from '@/app/data/notificationCounts';

// Color mapping for each section
const sectionColors: Record<string, { icon: string; bg: string }> = {
  'builder': { icon: 'text-purple-600', bg: 'bg-purple-50' },
  'herbs': { icon: 'text-green-600', bg: 'bg-green-50' },
  'formulas': { icon: 'text-emerald-600', bg: 'bg-emerald-50' },
  'prescriptions': { icon: 'text-blue-600', bg: 'bg-blue-50' },
  'promos': { icon: 'text-pink-600', bg: 'bg-pink-50' },
  'research': { icon: 'text-indigo-600', bg: 'bg-indigo-50' },
  'courses': { icon: 'text-violet-600', bg: 'bg-violet-50' },
  'news': { icon: 'text-sky-600', bg: 'bg-sky-50' },
  'community': { icon: 'text-amber-600', bg: 'bg-amber-50' },
};

interface QuickActionCardsProps {
  isAlone?: boolean; // True when no other content (messages/slides) is present
}

export function QuickActionCards({ isAlone = false }: QuickActionCardsProps) {
  const quickActionsData = getQuickActionsPublished();
  const enabledActions = quickActionsData?.actions.filter(action => action.enabled) || [];

  if (enabledActions.length === 0) {
    return null;
  }

  // Grid layout logic:
  // - 4 cards: 2x2 grid (lg:grid-cols-2)
  // - 5+ cards: 3 columns (lg:grid-cols-3)
  // - 1-3 cards: 4 columns (lg:grid-cols-4)
  const gridCols = enabledActions.length === 4
    ? 'lg:grid-cols-2'
    : enabledActions.length > 4
      ? 'lg:grid-cols-3'
      : 'lg:grid-cols-4';

  return (
    <div className="max-w-5xl mx-auto mb-6">
      <div className={`grid grid-cols-1 sm:grid-cols-2 ${gridCols} gap-4`}>
        {enabledActions.map((action) => {
          return <QuickActionCard key={action.id} action={action} />;
        })}
      </div>
    </div>
  );
}

function QuickActionCard({ action }: { action: QuickActionItem }) {
  const { IconComponent, customSvg } = useSectionIcon(action.section);
  const [notificationCount, setNotificationCount] = useState(0);

  // Get colors for this section
  const colors = sectionColors[action.section] || { icon: 'text-teal-600', bg: 'bg-teal-50' };

  useEffect(() => {
    let isMounted = true;

    const updateCount = async () => {
      const count = await getNotificationCount(action.section);
      if (isMounted) {
        setNotificationCount(count);
      }
    };

    void updateCount();

    // Listen for updates
    window.addEventListener('section-visits-updated', updateCount);
    window.addEventListener('community-posts-updated', updateCount);
    window.addEventListener('storage', updateCount);

    return () => {
      isMounted = false;
      window.removeEventListener('section-visits-updated', updateCount);
      window.removeEventListener('community-posts-updated', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, [action.section]);

  return (
    <Link
      to={action.to}
      className="group block bg-white border border-gray-200 rounded-lg p-4 hover:border-teal-500 hover:shadow-md transition-all relative"
    >
      {/* Notification badge */}
      {notificationCount > 0 && (
        <div className="absolute -top-2 -right-2 flex items-center justify-center min-w-[24px] h-6 px-1.5 bg-teal-600 text-white text-xs font-bold rounded-full shadow-md">
          {notificationCount > 99 ? '99+' : notificationCount}
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className={`flex items-center justify-center w-10 h-10 ${colors.bg} rounded-lg group-hover:bg-teal-100 transition-colors`}>
          {customSvg ? (
            <div
              className={`w-5 h-5 ${colors.icon} group-hover:text-teal-600 transition-colors`}
              dangerouslySetInnerHTML={{ __html: customSvg }}
            />
          ) : (
            <IconComponent className={`w-5 h-5 ${colors.icon} group-hover:text-teal-600 transition-colors`} />
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-teal-600 transition-colors" />
      </div>
      <h3 className="font-medium text-gray-900 mb-1 text-[16px]">{action.title}</h3>
      <p className="text-sm text-gray-600">{action.description}</p>
    </Link>
  );
}
