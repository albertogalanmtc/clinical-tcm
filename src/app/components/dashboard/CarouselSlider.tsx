import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { InfoSlideModal } from './InfoSlideModal';
import { VideoModal } from './VideoModal';
import { getEmbedUrl } from '@/app/utils/videoUtils';
import { type HeroSlide, type CarouselRatio } from '@/app/data/dashboardContent';

interface CarouselSliderProps {
  slides: HeroSlide[];
  desktopRatio: CarouselRatio;
  mobileRatio: CarouselRatio;
  transitionInterval: number;
}

// Helper to get aspect ratio classes
const getRatioClasses = (ratio: CarouselRatio, isMobile: boolean = false) => {
  switch (ratio) {
    case '16:9': return 'aspect-[16/9]';
    case '9:16': return 'aspect-[9/16]';
    case 'fullscreen':
      // Fullscreen with aspect ratio to maintain proper sizing
      // Uses 16:9 for desktop, 9:16 for mobile, with max height to prevent scroll
      return isMobile ? 'aspect-[9/16] max-h-[calc(100vh-182px)]' : 'aspect-[16/9] max-h-[calc(100vh-200px)]';
    default: return 'aspect-[16/9]';
  }
};

export function CarouselSlider({ slides, desktopRatio, mobileRatio, transitionInterval }: CarouselSliderProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<HeroSlide | null>(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string>('');

  // Auto-advance carousel
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, transitionInterval * 1000);

    return () => clearInterval(timer);
  }, [slides.length, transitionInterval]);

  const goToNextSlide = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const goToPrevSlide = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlideIndex(index);
  };

  const handleSlideClick = (slide: HeroSlide) => {
    if (slide.linkType === 'external' && slide.externalUrl) {
      window.open(slide.externalUrl, '_blank', 'noopener,noreferrer');
    } else if (slide.linkType === 'video' && slide.videoUrl) {
      const embedUrl = getEmbedUrl(slide.videoUrl);
      if (embedUrl) {
        setSelectedVideoUrl(embedUrl);
        setIsVideoModalOpen(true);
      }
    } else if (slide.linkType === 'internal' && slide.internalContent) {
      setSelectedSlide(slide);
      setIsModalOpen(true);
    }
  };

  if (slides.length === 0) return null;

  const currentSlide = slides[currentSlideIndex];
  const currentDesktopRatio = currentSlide.desktopRatio || desktopRatio;
  const currentMobileRatio = currentSlide.mobileRatio || mobileRatio;
  const isFullscreen = currentDesktopRatio === 'fullscreen' || currentMobileRatio === 'fullscreen';
  const desktopRatioClass = getRatioClasses(currentDesktopRatio, false);
  const mobileRatioClass = getRatioClasses(currentMobileRatio, true);

  return (
    <>
      <div className="max-w-5xl mx-auto relative w-full mb-6">
        {/* Main Carousel */}
        <div className="relative w-full overflow-hidden rounded-lg">
          <div
            className={`relative w-full ${mobileRatioClass} sm:${desktopRatioClass} bg-gray-100 ${
              currentSlide.linkType !== 'none' ? 'cursor-pointer' : ''
            }`}
            onClick={() => handleSlideClick(currentSlide)}
          >
            {((currentSlide as any).image || currentSlide.imageUrl) ? (
              <img
                src={(currentSlide as any).image || currentSlide.imageUrl}
                alt={`Slide ${currentSlideIndex + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
                style={
                  currentSlide.imagePosition
                    ? { objectPosition: `${currentSlide.imagePosition.x}% ${currentSlide.imagePosition.y}%` }
                    : undefined
                }
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                No image
              </div>
            )}

            {/* Video Play Button Overlay */}
            {currentSlide.linkType === 'video' && currentSlide.videoUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 text-gray-900 ml-1" />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={goToPrevSlide}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
              </button>
              <button
                onClick={goToNextSlide}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-900" />
              </button>
            </>
          )}

          {/* Dots Indicator - Absolute position for fullscreen */}
          {slides.length > 1 && isFullscreen && (
            <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 z-10">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlideIndex
                      ? 'bg-white w-8 shadow-lg'
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Dots Indicator - Below carousel for normal ratios */}
        {slides.length > 1 && !isFullscreen && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlideIndex
                    ? 'bg-teal-600 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedSlide?.internalContent && (
        <InfoSlideModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedSlide.internalContent.title}
          content={selectedSlide.internalContent.content}
        />
      )}

      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoUrl={selectedVideoUrl}
      />
    </>
  );
}
