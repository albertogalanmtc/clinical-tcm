import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { bannersService, type Banner } from '@/app/services/bannersService';
import { useUser } from '@/app/contexts/UserContext';
import { toast } from 'sonner';

export function BannerWidget() {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [temporarilyDismissed, setTemporarilyDismissed] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    loadBanner();
  }, []);

  const loadBanner = async () => {
    setLoading(true);
    const banners = await bannersService.getActiveBanners();

    if (banners.length > 0) {
      // Get the most recent banner
      const activeBanner = banners[0];

      // Check if user has permanently dismissed this banner
      if (user?.id) {
        try {
          const hasDismissed = await bannersService.hasUserDismissedBanner(activeBanner.id, user.id);
          if (hasDismissed) {
            console.log(`Banner ${activeBanner.id} already dismissed`);
            setBanner(null);
            setLoading(false);
            return;
          }
        } catch (error) {
          console.log('Banner dismissals check failed:', error);
        }
      }

      setBanner(activeBanner);
    } else {
      setBanner(null);
    }
    setLoading(false);
  };

  const handleTemporaryDismiss = () => {
    setTemporarilyDismissed(true);
  };

  const handlePermanentDismiss = async () => {
    if (banner && user?.id) {
      try {
        const success = await bannersService.dismissBanner(banner.id, user.id);
        if (success) {
          console.log('✅ Banner dismissed and saved');
          toast.success('Got it! You won\'t see this banner again');
          setBanner(null);
        } else {
          toast.error('Failed to save. Please try again.');
        }
      } catch (error) {
        console.error('Could not save dismissal:', error);
        toast.error('Failed to save. Please try again.');
      }
    }
  };

  if (loading) {
    return null;
  }

  if (!banner) {
    return null;
  }

  // Don't show if temporarily dismissed
  if (temporarilyDismissed) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto mb-6">
      <div className="bg-white border border-gray-200 rounded-lg p-4 relative animate-in fade-in slide-in-from-top-4 duration-500">
        {banner.dismissible && (
          <button
            onClick={handleTemporaryDismiss}
            className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-full transition-colors z-10"
            title="Close temporarily"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        )}

        <div className="pr-8">
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2">
              {banner.title}
            </h3>
            {banner.content && (
              <p className="text-sm text-gray-700 mb-3">
                {banner.content}
              </p>
            )}
            {banner.link_url && banner.link_text && (
              <a
                href={banner.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-700"
              >
                {banner.link_text}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
          {banner.dismissible && (
            <div className="flex justify-end">
              <button
                onClick={handlePermanentDismiss}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Got it
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
