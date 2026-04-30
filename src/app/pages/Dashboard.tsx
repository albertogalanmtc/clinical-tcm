import { useState, useEffect } from 'react';
import { QuickActionCards } from '../components/dashboard/QuickActionCards';
import { CommunityCard } from '../components/dashboard/CommunityCard';
import { WelcomeMessageBanner } from '../components/dashboard/WelcomeMessageBanner';
import { CarouselSlider } from '../components/dashboard/CarouselSlider';
import { BannersAndSurveysWidget } from '../components/dashboard/BannersAndSurveysWidget';
import { DashboardMessages } from '../components/dashboard/DashboardMessages';
import { BannerModalDisplay } from '../components/dashboard/BannerModalDisplay';
import {
  getUnifiedDashboardContentPublished,
  getCarouselSettingsPublished,
  type HeroSlide,
  type DashboardContentItem
} from '../data/dashboardContent';
import { getActiveBanner, hasUserResponded, recordModalShown, type Banner } from '../data/banners';
import { getCurrentUser } from '../data/communityPosts';
import { getDismissedMessages, dismissMessage } from '../services/messageDismissalsService';

interface DashboardProps {
  variant?: 'default' | 'fullscreen';
}

// Helper to check if content is visible
function getUserCountry(): string | null {
  try {
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      const parsed = JSON.parse(profile);
      return parsed.country || null;
    }
  } catch (error) {
    console.error('Error loading user profile:', error);
  }
  return null;
}

function isContentVisible(countries?: string[], dateRange?: { start: string; end: string }): boolean {
  const userCountry = getUserCountry();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check country filter
  if (countries && countries.length > 0) {
    if (!userCountry) return false;
    const normalizedUserCountry = userCountry.trim().toUpperCase();
    const normalizedCountries = countries.map(c => c.trim().toUpperCase());
    if (!normalizedCountries.includes(normalizedUserCountry)) return false;
  }

  // Check date range filter
  if (dateRange) {
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);
      if (today < startDate) return false;
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      if (today > endDate) return false;
    }
  }

  return true;
}

export default function Dashboard({ variant = 'default' }: DashboardProps) {
  const [renderedContent, setRenderedContent] = useState<Array<{ type: string; key: string; element: React.ReactNode }>>([]);
  const [dismissedMessages, setDismissedMessages] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [modalBanner, setModalBanner] = useState<Banner | null>(null);

  // Load dismissed messages from Supabase
  useEffect(() => {
    const loadDismissedMessages = async () => {
      const dismissed = await getDismissedMessages();
      setDismissedMessages(dismissed);
    };
    loadDismissedMessages();
  }, []);

  useEffect(() => {
    const updateContent = async () => {
      const allContent = getUnifiedDashboardContentPublished();
      const settings = getCarouselSettingsPublished();

      console.log('🔍 Dashboard - All published content:', allContent);
      console.log('⚙️ Dashboard - Carousel settings:', settings);

      // Check for modal survey banner
      const user = getCurrentUser();
      const modalBanner = getActiveBanner('modal', user.id);

      if (modalBanner) {
        const alreadyResponded = hasUserResponded(modalBanner.id, user.id);

        if (!alreadyResponded) {
          // Record that we're showing a modal to this user today
          recordModalShown(user.id);
          setModalBanner(modalBanner);
          setShowModal(true);
        }
      }

      // Get dismissed messages from Supabase
      const dismissed = await getDismissedMessages();

      // Filter and prepare content
      const visibleContent: DashboardContentItem[] = [];

      for (const item of allContent) {
        if (item.type === 'quickActions') {
          console.log('  ⚡ Quick Actions:', item.data.enabled ? 'enabled' : 'disabled');
          if (item.data.enabled) {
            visibleContent.push(item);
          }
        } else if (item.type === 'message') {
          const isDismissed = dismissed.has(item.data.id);
          const isVisible = isContentVisible(item.data.countries, item.data.dateRange);
          console.log(`  📨 Message "${item.data.title}": enabled=${item.data.enabled}, dismissed=${isDismissed}, visible=${isVisible}`);
          if (item.data.enabled && !isDismissed && isVisible) {
            visibleContent.push(item);
          }
        } else if (item.type === 'slide') {
          const slide = item.data as any;
          const isVisible = isContentVisible(slide.countries, slide.dateRange);
          if (slide.visible && isVisible) {
            visibleContent.push(item);
          }
        }
      }

      console.log('✅ Visible content after filtering:', visibleContent);

      // Group slides by carousel and render everything in order
      const rendered: Array<{ type: string; key: string; element: React.ReactNode }> = [];
      const processedCarousels = new Set<string>();

      // First pass: collect all content without quick actions and community
      const nonQuickActionsContent = visibleContent.filter(item => item.type !== 'quickActions' && item.type !== 'community');

      visibleContent.forEach((item, index) => {
        if (item.type === 'quickActions') {
          // Quick actions are alone if there's no other content (messages/slides)
          const isAlone = nonQuickActionsContent.length === 0;
          rendered.push({
            type: 'quickActions',
            key: `quick-actions-${item.data.id}`,
            element: <QuickActionCards key={item.data.id} isAlone={isAlone} />
          });
        } else if (item.type === 'community') {
          // Community card is alone if there's no other content (messages/slides)
          const isAlone = nonQuickActionsContent.length === 0;
          rendered.push({
            type: 'community',
            key: `community-${item.data.id}`,
            element: <CommunityCard key={item.data.id} isAlone={isAlone} />
          });
        } else if (item.type === 'message') {
          rendered.push({
            type: 'message',
            key: `message-${item.data.id}`,
            element: (
              <WelcomeMessageBanner
                key={item.data.id}
                message={item.data}
                onDismiss={handleDismissMessage}
              />
            )
          });
        } else if (item.type === 'slide') {
          const slide = item.data;
          const carouselGroup = slide.carouselGroup || `single-${slide.id}`;

          // Skip if we already processed this carousel group
          if (processedCarousels.has(carouselGroup)) return;
          processedCarousels.add(carouselGroup);

          // Collect all slides in this carousel group
          const carouselSlides = visibleContent
            .filter(c => c.type === 'slide' && ((c.data as HeroSlide).carouselGroup || `single-${c.data.id}`) === carouselGroup)
            .map(c => c.data as HeroSlide);

          rendered.push({
            type: 'carousel',
            key: `carousel-${carouselGroup}`,
            element: (
              <CarouselSlider
                key={carouselGroup}
                slides={carouselSlides}
                desktopRatio={settings.desktopRatio}
                mobileRatio={settings.mobileRatio}
                transitionInterval={settings.transitionInterval}
              />
            )
          });
        }
      });

      console.log('🎨 Final rendered content:', rendered);
      setRenderedContent(rendered);
    };

    updateContent();

    // Listen for content updates
    window.addEventListener('dashboard-content-updated', updateContent);
    window.addEventListener('storage', updateContent);
    window.addEventListener('banners-updated', updateContent);

    return () => {
      window.removeEventListener('dashboard-content-updated', updateContent);
      window.removeEventListener('storage', updateContent);
      window.removeEventListener('banners-updated', updateContent);
    };
  }, []);

  const handleDismissMessage = async (messageId: string) => {
    // Optimistically update UI
    const newDismissed = new Set(dismissedMessages);
    newDismissed.add(messageId);
    setDismissedMessages(newDismissed);

    // Save to Supabase (and localStorage as fallback)
    await dismissMessage(messageId);

    // Force re-render
    window.dispatchEvent(new Event('storage'));
  };

  const containerClasses = variant === 'fullscreen'
    ? 'px-4 lg:px-6 pt-4 lg:pt-6 pb-20 sm:pb-4 lg:pb-6'
    : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 pt-4 sm:pt-6 lg:pt-6 pb-20 sm:pb-6 lg:pb-8';

  return (
    <>
      <div className={containerClasses}>
        {/* Banners and Surveys - ordered by creation date */}
        <BannersAndSurveysWidget />

        {/* Dashboard Messages from Supabase */}
        <DashboardMessages />

        {renderedContent.map(item => item.element)}
      </div>

      {/*  Banner Modal - opens automatically if display mode is modal */}
      {showModal && modalBanner && (
        <BannerModalDisplay
          banner={modalBanner}
          onClose={() => {
            setShowModal(false);
            setModalBanner(null);
          }}
        />
      )}
    </>
  );
}