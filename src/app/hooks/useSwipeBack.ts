/**
 * Custom hook for swipe-to-go-back gesture on mobile
 * Detects right swipe and navigates back
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface SwipeBackOptions {
  minSwipeDistance?: number;
  maxVerticalMovement?: number;
}

export function useSwipeBack(options: SwipeBackOptions = {}) {
  const navigate = useNavigate();
  const { minSwipeDistance = 100, maxVerticalMovement = 75 } = options;

  useEffect(() => {
    // Only enable on mobile/touch devices
    if (!('ontouchstart' in window)) {
      return;
    }

    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;
    let isSwiping = false;

    const handleTouchStart = (e: TouchEvent) => {
      // Only detect swipes that start from the left edge of the screen (within 50px)
      if (e.touches[0].clientX > 50) {
        return;
      }

      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isSwiping = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping) return;

      touchEndX = e.touches[0].clientX;
      touchEndY = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      if (!isSwiping) return;

      const horizontalDistance = touchEndX - touchStartX;
      const verticalDistance = Math.abs(touchEndY - touchStartY);

      // Check if it's a valid right swipe:
      // 1. Swipe distance is greater than minimum threshold
      // 2. Swipe is predominantly horizontal (not vertical scroll)
      if (
        horizontalDistance > minSwipeDistance &&
        verticalDistance < maxVerticalMovement
      ) {
        navigate(-1);
      }

      // Reset
      isSwiping = false;
      touchStartX = 0;
      touchStartY = 0;
      touchEndX = 0;
      touchEndY = 0;
    };

    // Add event listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    // Cleanup
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [navigate, minSwipeDistance, maxVerticalMovement]);
}
