import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { InfoSlideModal } from './InfoSlideModal';
import { VideoModal } from './VideoModal';
import { getEmbedUrl } from '@/app/utils/videoUtils';
import {
  getCarouselSettingsPublished,
  getHeroSlidesPublished,
  getWelcomeMessagesPublished,
  type HeroSlide,
  type CarouselSettings,
  type WelcomeMessage,
  type CarouselRatio
} from '@/app/data/dashboardContent';

// Re-export types for backward compatibility
export type { CarouselRatio, HeroSlide, CarouselSettings, WelcomeMessage };

// Get user country from profile
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

// Check if content is visible based on country and date filters
function isContentVisible(
  countries?: string[],
  dateRange?: { start: string; end: string }
): boolean {
  const userCountry = getUserCountry();
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time for date-only comparison

  // Check country filter
  if (countries && countries.length > 0) {
    // If countries are specified but user has no country, hide content
    if (!userCountry) {
      console.log('  ❌ Country check failed: User has no country set');
      return false;
    }
    
    // Normalize comparison: trim and uppercase both sides
    const normalizedUserCountry = userCountry.trim().toUpperCase();
    const normalizedCountries = countries.map(c => c.trim().toUpperCase());
    
    console.log('  🔍 Country comparison:', {
      userCountry: normalizedUserCountry,
      allowedCountries: normalizedCountries,
      match: normalizedCountries.includes(normalizedUserCountry)
    });
    
    // If user country is not in the list, hide content
    if (!normalizedCountries.includes(normalizedUserCountry)) {
      console.log('  ❌ Country check failed: User country not in allowed list');
      return false;
    }
    
    console.log('  ✅ Country check passed');
  } else {
    console.log('  ℹ️  No country restriction (Global content)');
  }

  // Check date range filter
  if (dateRange) {
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      startDate.setHours(0, 0, 0, 0);
      if (today < startDate) {
        console.log('  ❌ Date check failed: Content not started yet');
        return false;
      }
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999); // End of day
      if (today > endDate) {
        console.log('  ❌ Date check failed: Content expired');
        return false;
      }
    }
    console.log('  ✅ Date range check passed');
  }

  return true;
}

// Unified content item type
type UnifiedContentItem =
  | { type: 'message'; data: WelcomeMessage }
  | { type: 'slide'; data: HeroSlide };

export function HeroCarousel() {
  const [unifiedContent, setUnifiedContent] = useState<UnifiedContentItem[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | null>(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>('');
  const [globalDesktopRatio, setGlobalDesktopRatio] = useState<CarouselRatio>('16:9');
  const [globalMobileRatio, setGlobalMobileRatio] = useState<CarouselRatio>('9:16');
  const [transitionInterval, setTransitionInterval] = useState<number>(5);
  const [dismissedMessages, setDismissedMessages] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('dismissed_welcome_messages');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    // Get only active slides and carousel settings
    const loadContent = () => {
      const userCountry = getUserCountry();

      console.log('════════════════════════════════════════════════════════');
      console.log('🔍 HeroCarousel - Loading Content');
      console.log('════════════════════════════════════════════════════════');
      console.log('📍 User Country:', userCountry);

      // Load all welcome messages from localStorage
      const allMessages = getWelcomeMessagesPublished();
      console.log('📨 All Welcome Messages from localStorage:', allMessages);

      // Load all slides from localStorage
      const allSlides = getHeroSlidesPublished();
      console.log('🖼️  All Hero Slides from localStorage:', allSlides);

      // Get dismissed messages
      const dismissed = (() => {
        try {
          const stored = localStorage.getItem('dismissed_welcome_messages');
          return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch {
          return new Set();
        }
      })();

      // Filter and map welcome messages
      const visibleMessages = allMessages
        .filter(msg => {
          const isEnabled = msg.enabled;
          const isVisible = isContentVisible(msg.countries, msg.dateRange);
          const isDismissed = dismissed.has(msg.id);
          console.log(`  Message "${msg.title}": enabled=${isEnabled}, countries=${JSON.stringify(msg.countries)}, visible=${isVisible}, dismissed=${isDismissed}`);
          return isEnabled && isVisible && !isDismissed;
        })
        .map(msg => ({ type: 'message' as const, data: msg }));

      // Filter and map active slides
      const activeSlides = allSlides
        .filter(slide => {
          const isActive = slide.status === 'active';
          const isVisible = isContentVisible(slide.countries, slide.dateRange);
          console.log(`  Slide "${slide.id}": active=${isActive}, countries=${JSON.stringify(slide.countries)}, visible=${isVisible}`);
          return isActive && isVisible;
        })
        .map(slide => ({ type: 'slide' as const, data: slide }));

      // Combine and sort by order
      const combined: UnifiedContentItem[] = [...visibleMessages, ...activeSlides];
      combined.sort((a, b) => a.data.order - b.data.order);

      console.log('✅ Unified Content after filtering and sorting:', combined);
      setUnifiedContent(combined);

      const settings = getCarouselSettingsPublished();
      console.log('⚙️  Carousel Settings:', settings);
      setGlobalDesktopRatio(settings.desktopRatio);
      setGlobalMobileRatio(settings.mobileRatio);
      setTransitionInterval(settings.transitionInterval);
      console.log('════════════════════════════════════════════════════════');
    };

    loadContent();

    // Listen for content updates from Admin Panel
    const handleUpdate = () => {
      console.log('🔔 HeroCarousel - Received dashboard-content-updated event');
      loadContent();
    };

    window.addEventListener('dashboard-content-updated', handleUpdate);
    return () => window.removeEventListener('dashboard-content-updated', handleUpdate);
  }, []);

  useEffect(() => {
    // Auto-advance carousel through slides only
    const slideItems = unifiedContent.filter(item => item.type === 'slide');
    if (slideItems.length <= 1) return;

    // Don't auto-advance if modal is open
    if (isModalOpen || isVideoModalOpen) return;

    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slideItems.length);
    }, transitionInterval * 1000);

    return () => clearInterval(interval);
  }, [unifiedContent, transitionInterval, isModalOpen, isVideoModalOpen]);

  const handleSlideClick = (slide: HeroSlide) => {
    if (slide.linkType === 'external' && slide.externalUrl) {
      window.open(slide.externalUrl, '_blank', 'noopener,noreferrer');
    } else if (slide.linkType === 'internal') {
      setSelectedSlide(slide);
      setIsModalOpen(true);
    } else if (slide.linkType === 'video' && slide.videoUrl) {
      setSelectedVideoUrl(getEmbedUrl(slide.videoUrl));
      setIsVideoModalOpen(true);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
  };

  // Separate messages and slides for rendering
  const slideItems = unifiedContent.filter(item => item.type === 'slide').map(item => item.data as HeroSlide);

  // If no content at all, return null
  if (unifiedContent.length === 0) {
    return null;
  }

  console.log('🎨 Rendering HeroCarousel with global ratios - Desktop:', globalDesktopRatio, 'Mobile:', globalMobileRatio);

  const handleMessageClick = (message: WelcomeMessage) => {
    if (message.modalContent) {
      setSelectedSlide({
        id: message.id,
        imageUrl: '',
        linkType: 'internal',
        status: 'active',
        order: message.order,
        internalContent: {
          title: message.modalContent.title,
          content: message.modalContent.content
        }
      });
      setIsModalOpen(true);
    }
  };

  const handleDismissMessage = (messageId: string) => {
    const newDismissed = new Set(dismissedMessages);
    newDismissed.add(messageId);
    setDismissedMessages(newDismissed);

    // Save to localStorage
    try {
      localStorage.setItem('dismissed_welcome_messages', JSON.stringify(Array.from(newDismissed)));
    } catch (error) {
      console.error('Error saving dismissed messages:', error);
    }

    // Update content to remove the dismissed message
    setUnifiedContent(prev => prev.filter(item => item.type !== 'message' || item.data.id !== messageId));
  };

  return (
    <>
      {/* Render content in unified order */}
      <div className="space-y-6 sm:space-y-8">
        {unifiedContent.map((item, index) => {
          if (item.type === 'message') {
            const message = item.data;
            const hasAction = message.link || message.modalContent;
            const MessageContainer = message.link ? 'a' : hasAction ? 'button' : 'div';

            const baseClassName = `rounded-lg border p-6 sm:p-8 lg:p-12 text-center ${
              message.highlighted
                ? 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200'
                : 'bg-white border-gray-200'
            }`;

            const containerProps = message.link
              ? {
                  href: message.link,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                  className: `${baseClassName} transition-transform hover:scale-[1.02] cursor-pointer`
                }
              : message.modalContent
              ? {
                  type: 'button' as const,
                  onClick: () => handleMessageClick(message),
                  className: `${baseClassName} w-full transition-transform hover:scale-[1.02] cursor-pointer`
                }
              : {
                  className: baseClassName
                };

            return (
              <div key={message.id} className={`px-4 lg:px-6 ${index === 0 ? 'pt-4 lg:pt-6' : ''} relative`}>
                <MessageContainer {...containerProps}>
                  {message.title && (
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                      {message.title}
                    </h1>
                  )}
                  {message.content && (
                    <p className={`text-sm sm:text-base lg:text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed ${message.title ? '' : 'mb-0'}`}>
                      {message.content}
                    </p>
                  )}
                </MessageContainer>
                {message.dismissible && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDismissMessage(message.id);
                    }}
                    className="absolute top-6 lg:top-8 right-6 lg:right-8 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Close message"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            );
          } else {
            // For slides: check if this is part of a carousel group
            const slide = item.data;
            // Use slide.id as unique group identifier when carouselGroup is empty/null/undefined
            const currentGroup = slide.carouselGroup || `single-${slide.id}`;

            // Check if this is the first slide in a group or a single slide
            const prevItem = index > 0 ? unifiedContent[index - 1] : null;
            const prevGroup = prevItem?.type === 'slide'
              ? ((prevItem.data as HeroSlide).carouselGroup || `single-${(prevItem.data as HeroSlide).id}`)
              : null;
            const isFirstInGroup = index === 0 || prevItem?.type !== 'slide' || prevGroup !== currentGroup;

            // Only render on the first slide of a group (or single slides)
            if (!isFirstInGroup) return null;

            // Collect all consecutive slides with the same group
            const groupSlides: HeroSlide[] = [];
            for (let i = index; i < unifiedContent.length; i++) {
              const contentItem = unifiedContent[i];
              if (contentItem.type !== 'slide') break;

              const itemSlide = contentItem.data as HeroSlide;
              const itemGroup = itemSlide.carouselGroup || `single-${itemSlide.id}`;
              if (itemGroup !== currentGroup) break;

              groupSlides.push(itemSlide);
            }

            const isSingleImage = groupSlides.length === 1;
            const isRealCarousel = groupSlides.length > 1 && slide.carouselGroup;
            const isPartOfCarousel = slide.carouselGroup && slide.carouselGroup.trim() !== '';

            // Determine container classes based on ratio
            // If part of carousel: use global carousel ratios
            // If single image: use individual slide ratios
            const slideDesktopRatio = isPartOfCarousel
              ? globalDesktopRatio
              : (slide.desktopRatio || slide.ratio || globalDesktopRatio);
            const slideMobileRatio = isPartOfCarousel
              ? globalMobileRatio
              : (slide.mobileRatio || globalMobileRatio);

            // Build responsive aspect ratio classes
            // Note: Tailwind requires full class names, can't use template literals for responsive prefixes
            const getRatioClasses = (mobile: CarouselRatio, desktop: CarouselRatio): string => {
              // If either is fullscreen, return empty string (fullscreen uses margins instead of aspect ratio)
              if (mobile === 'fullscreen' || desktop === 'fullscreen') return '';

              // If same ratio for both, use single class
              if (mobile === desktop) {
                if (mobile === '4:3') return 'aspect-[4/3]';
                if (mobile === '16:9') return 'aspect-[16/9]';
                if (mobile === '21:9') return 'aspect-[21/9]';
                if (mobile === '9:16') return 'aspect-[9/16]';
                if (mobile === '3:4') return 'aspect-[3/4]';
              }

              const key = `${mobile}-${desktop}`;
              const ratioMap: Record<string, string> = {
                // Mobile: 9:16
                '9:16-4:3': 'aspect-[9/16] sm:aspect-[4/3]',
                '9:16-16:9': 'aspect-[9/16] sm:aspect-[16/9]',
                '9:16-21:9': 'aspect-[9/16] sm:aspect-[21/9]',
                // Mobile: 3:4
                '3:4-4:3': 'aspect-[3/4] sm:aspect-[4/3]',
                '3:4-16:9': 'aspect-[3/4] sm:aspect-[16/9]',
                '3:4-21:9': 'aspect-[3/4] sm:aspect-[21/9]',
                // Mobile: 4:3
                '4:3-16:9': 'aspect-[4/3] sm:aspect-[16/9]',
                '4:3-21:9': 'aspect-[4/3] sm:aspect-[21/9]',
              };
              return ratioMap[key] || 'aspect-[9/16] sm:aspect-[16/9]';
            };

            const containerClass = getRatioClasses(slideMobileRatio, slideDesktopRatio);
            const isFullscreen = slideMobileRatio === 'fullscreen' || slideDesktopRatio === 'fullscreen';

            // Dimension classes based on desktop ratio
            let dimensionClasses = '';
            if (slideDesktopRatio === '9:16' || slideDesktopRatio === '3:4') {
              dimensionClasses = 'w-full max-w-md sm:max-w-lg mx-auto';
            } else if (slideDesktopRatio === '4:3') {
              dimensionClasses = 'w-full max-w-full';
            } else {
              dimensionClasses = 'w-full';
            }

            // For real carousels, find index within slideItems
            let slideItemsMap: Map<string, number> | null = null;
            if (isRealCarousel) {
              slideItemsMap = new Map<string, number>();
              slideItems.forEach((s, idx) => {
                slideItemsMap!.set(s.id, idx);
              });
            }

            return (
              <div key={`carousel-group-${currentGroup || slide.id}`} className={isFullscreen ? 'fixed left-0 right-0 top-[56px] sm:top-[64px] bottom-[70px] sm:bottom-0 z-10' : `px-4 lg:px-6 ${index === 0 ? 'pt-4 lg:pt-6' : ''}`}>
                {isFullscreen ? (
                  <div className="h-full flex flex-col p-4 lg:p-6">
                    <div className="relative flex-1 rounded-lg overflow-hidden">
                      {/* Slides */}
                      <div className="relative w-full h-full">
                        {groupSlides.map((slideInGroup) => {
                          const slideIdx = slideItemsMap ? slideItemsMap.get(slideInGroup.id) ?? 0 : 0;
                          const isVisible = isSingleImage || slideIdx === currentSlideIndex;

                          return (
                            <div
                              key={slideInGroup.id}
                              className={`absolute inset-0 ${isRealCarousel ? 'transition-opacity duration-500' : ''} ${
                                isVisible ? 'opacity-100' : 'opacity-0'
                              }`}
                            >
                              {/* Video Slide - Embed directly */}
                              {slideInGroup.linkType === 'video' && slideInGroup.videoUrl ? (
                                <div className="w-full h-full bg-black">
                                  <iframe
                                    src={getEmbedUrl(slideInGroup.videoUrl) || ''}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title="Video slide"
                                  />
                                </div>
                              ) : slideInGroup.linkType === 'none' ? (
                                <div className="w-full h-full">
                                  <img
                                    src={slideInGroup.imageUrl}
                                    alt="Slide"
                                    className="w-full h-full object-cover"
                                    style={
                                      slideInGroup.imagePosition
                                        ? {
                                            objectPosition: `${slideInGroup.imagePosition.x}% ${slideInGroup.imagePosition.y}%`,
                                          }
                                        : undefined
                                    }
                                  />
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleSlideClick(slideInGroup)}
                                  className="w-full h-full cursor-pointer transition-transform hover:scale-[1.02] relative z-10"
                                >
                                  <img
                                    src={slideInGroup.imageUrl}
                                    alt={slideInGroup.linkType === 'internal' ? slideInGroup.internalContent?.title : 'Slide'}
                                    className="w-full h-full object-cover"
                                    style={
                                      slideInGroup.imagePosition
                                        ? {
                                            objectPosition: `${slideInGroup.imagePosition.x}% ${slideInGroup.imagePosition.y}%`,
                                          }
                                        : undefined
                                    }
                                  />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dots Indicator - Only show for real carousels */}
                    {isRealCarousel && slideItemsMap && (
                      <div className="flex justify-center gap-2 mt-3 sm:mt-4">
                        {groupSlides.map((slideInGroup) => {
                          const slideIdx = slideItemsMap.get(slideInGroup.id) ?? 0;
                          return (
                            <button
                              key={slideInGroup.id}
                              onClick={() => goToSlide(slideIdx)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                slideIdx === currentSlideIndex
                                  ? 'bg-teal-600 w-8'
                                  : 'bg-gray-300 hover:bg-gray-400'
                              }`}
                              aria-label={`Go to slide ${slideIdx + 1}`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className={`relative ${containerClass} ${dimensionClasses} mx-auto max-h-[calc(100vh-180px)] sm:max-h-[calc(100vh-200px)] rounded-lg overflow-hidden bg-gray-100 ${isRealCarousel ? 'mb-3 sm:mb-4' : ''}`}>
                      {/* Slides */}
                      <div className="relative w-full h-full">
                        {groupSlides.map((slideInGroup) => {
                          const slideIdx = slideItemsMap ? slideItemsMap.get(slideInGroup.id) ?? 0 : 0;
                          const isVisible = isSingleImage || slideIdx === currentSlideIndex;

                          return (
                            <div
                              key={slideInGroup.id}
                              className={`absolute inset-0 ${isRealCarousel ? 'transition-opacity duration-500' : ''} ${
                                isVisible ? 'opacity-100' : 'opacity-0'
                              }`}
                            >
                              {/* Video Slide - Embed directly */}
                              {slideInGroup.linkType === 'video' && slideInGroup.videoUrl ? (
                                <div className="w-full h-full bg-black">
                                  <iframe
                                    src={getEmbedUrl(slideInGroup.videoUrl) || ''}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title="Video slide"
                                  />
                                </div>
                              ) : slideInGroup.linkType === 'none' ? (
                                <div className="w-full h-full">
                                  <img
                                    src={slideInGroup.imageUrl}
                                    alt="Slide"
                                    className="w-full h-full object-cover"
                                    style={
                                      slideInGroup.imagePosition
                                        ? {
                                            objectPosition: `${slideInGroup.imagePosition.x}% ${slideInGroup.imagePosition.y}%`,
                                          }
                                        : undefined
                                    }
                                  />
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleSlideClick(slideInGroup)}
                                  className="w-full h-full cursor-pointer transition-transform hover:scale-[1.02] relative z-10"
                                >
                                  <img
                                    src={slideInGroup.imageUrl}
                                    alt={slideInGroup.linkType === 'internal' ? slideInGroup.internalContent?.title : 'Slide'}
                                    className="w-full h-full object-cover"
                                    style={
                                      slideInGroup.imagePosition
                                        ? {
                                            objectPosition: `${slideInGroup.imagePosition.x}% ${slideInGroup.imagePosition.y}%`,
                                          }
                                        : undefined
                                    }
                                  />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dots Indicator - Only show for real carousels (multiple slides with same group name) */}
                    {isRealCarousel && slideItemsMap && (
                      <div className="flex justify-center gap-2">
                        {groupSlides.map((slideInGroup) => {
                          const slideIdx = slideItemsMap.get(slideInGroup.id) ?? 0;
                          return (
                            <button
                              key={slideInGroup.id}
                              onClick={() => goToSlide(slideIdx)}
                              className={`w-2 h-2 rounded-full transition-all ${
                                slideIdx === currentSlideIndex
                                  ? 'bg-teal-600 w-8'
                                  : 'bg-gray-300 hover:bg-gray-400'
                              }`}
                              aria-label={`Go to slide ${slideIdx + 1}`}
                            />
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          }
        })}
      </div>

      {/* Info Modal */}
      <InfoSlideModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSlide(null);
        }}
        slide={selectedSlide}
      />

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => {
          setIsVideoModalOpen(false);
          setSelectedVideoUrl('');
        }}
        videoUrl={selectedVideoUrl}
      />
    </>
  );
}