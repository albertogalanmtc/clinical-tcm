import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { X, Upload, Link as LinkIcon, FileText, Move, ImageIcon, Video, Save } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { addHeroSlide, updateHeroSlide, getCarouselSettings, type HeroSlide, type CarouselRatio } from '@/app/data/dashboardContent';
import { isValidVideoUrl } from '@/app/utils/videoUtils';
import { ContentVisibilitySettings, type VisibilitySettings } from './ContentVisibilitySettings';
import { compressImage } from '@/app/utils/imageCompression';
import { toast } from 'sonner';

interface HeroSlideModalProps {
  isOpen: boolean;
  onClose: () => void;
  slide?: HeroSlide | null;
  onSave: () => void;
}

// Helper to get aspect ratio number from string
const getRatioValue = (ratio: CarouselRatio) => {
  switch (ratio) {
    case '16:9': return 16 / 9;
    case '9:16': return 9 / 16;
    case 'fullscreen': return 16 / 9; // Default preview ratio for fullscreen
    default: return 16 / 9;
  }
};

export function HeroSlideModal({ isOpen, onClose, slide, onSave }: HeroSlideModalProps) {
  const [imageUrl, setImageUrl] = useState(slide?.imageUrl || '');
  const [linkType, setLinkType] = useState<'external' | 'internal' | 'video' | 'none'>(slide?.linkType || 'none');
  const [externalUrl, setExternalUrl] = useState(slide?.externalUrl || '');
  const [videoUrl, setVideoUrl] = useState(slide?.videoUrl || '');
  const [internalTitle, setInternalTitle] = useState(slide?.internalContent?.title || '');
  const [internalContent, setInternalContent] = useState(slide?.internalContent?.content || '');
  const [status, setStatus] = useState<'active' | 'inactive'>(slide?.status || 'active');
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 });
  const [desktopRatio, setDesktopRatio] = useState<CarouselRatio>('16:9');
  const [mobileRatio, setMobileRatio] = useState<CarouselRatio>('9:16');
  const [previewRatio, setPreviewRatio] = useState<CarouselRatio>('16:9'); // For positioning preview
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop'); // Toggle between desktop/mobile preview
  const [carouselGroup, setCarouselGroup] = useState<string>(slide?.carouselGroup || '');
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [visibilitySettings, setVisibilitySettings] = useState<VisibilitySettings>({
    countries: slide?.countries || [],
    dateRange: slide?.dateRange
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load current carousel ratio as defaults
    const settings = getCarouselSettings();
    const defaultRatio = settings.desktopRatio || settings.ratio || '16:9';
    // Ensure desktop ratio is horizontal (16:9 or fullscreen)
    const defaultDesktopRatio: CarouselRatio = ['16:9', 'fullscreen'].includes(defaultRatio) ? defaultRatio : '16:9';
    // Mobile defaults to 9:16 (vertical)
    const defaultMobileRatio: CarouselRatio = settings.mobileRatio || '9:16';
    setDesktopRatio(defaultDesktopRatio);
    setMobileRatio(defaultMobileRatio);
    // Set initial preview based on mode
    const initialRatio = previewMode === 'desktop' ? defaultDesktopRatio : defaultMobileRatio;
    setPreviewRatio(initialRatio === 'fullscreen' ? '16:9' : initialRatio);
  }, []);

  // Update preview ratio when preview mode or ratios change
  useEffect(() => {
    const currentRatio = previewMode === 'desktop' ? desktopRatio : mobileRatio;
    // Fullscreen uses 16:9 for desktop, 9:16 for mobile preview
    if (currentRatio === 'fullscreen') {
      setPreviewRatio(previewMode === 'desktop' ? '16:9' : '9:16');
    } else {
      setPreviewRatio(currentRatio);
    }
  }, [previewMode, desktopRatio, mobileRatio]);

  // Reset all states when modal opens/closes or slide changes
  useEffect(() => {
    if (isOpen) {
      if (slide) {
        // Editing existing slide
        setImageUrl(slide.imageUrl || '');
        setLinkType(slide.linkType || 'none');
        setExternalUrl(slide.externalUrl || '');
        setVideoUrl(slide.videoUrl || '');
        setInternalTitle(slide.internalContent?.title || '');
        setInternalContent(slide.internalContent?.content || '');
        setStatus(slide.status || 'active');
        setImagePosition(slide.imagePosition || { x: 50, y: 50 });
        const defaultSettings = getCarouselSettings();
        // Ensure desktop ratio is valid
        const slideDesktop = slide.desktopRatio || slide.ratio || defaultSettings.ratio;
        const validDesktop: CarouselRatio = ['4:3', '16:9', '21:9', 'fullscreen'].includes(slideDesktop) ? slideDesktop : '16:9';
        // Ensure mobile ratio is valid
        const slideMobile = slide.mobileRatio || '9:16';
        const validMobile: CarouselRatio = ['9:16', 'fullscreen'].includes(slideMobile) ? slideMobile : '9:16';
        setDesktopRatio(validDesktop);
        setMobileRatio(validMobile);
        // Set preview based on current preview mode
        const initialRatio = previewMode === 'desktop' ? validDesktop : validMobile;
        setPreviewRatio(initialRatio === 'fullscreen' ? (previewMode === 'desktop' ? '16:9' : '9:16') : initialRatio);
        setCarouselGroup(slide.carouselGroup || '');
        setVisibilitySettings({
          countries: slide.countries || [],
          dateRange: slide.dateRange
        });
      } else {
        // Creating new slide - reset to defaults
        setImageUrl('');
        setLinkType('none');
        setExternalUrl('');
        setVideoUrl('');
        setInternalTitle('');
        setInternalContent('');
        setStatus('active');
        setImagePosition({ x: 50, y: 50 });
        const defaultSettings = getCarouselSettings();
        const validDesktop: CarouselRatio = ['4:3', '16:9', '21:9', 'fullscreen'].includes(defaultSettings.desktopRatio || defaultSettings.ratio) ? (defaultSettings.desktopRatio || defaultSettings.ratio) : '16:9';
        const validMobile: CarouselRatio = defaultSettings.mobileRatio || '9:16';
        setDesktopRatio(validDesktop);
        setMobileRatio(validMobile);
        // Set preview based on current mode
        const initialRatio = previewMode === 'desktop' ? validDesktop : validMobile;
        setPreviewRatio(initialRatio === 'fullscreen' ? (previewMode === 'desktop' ? '16:9' : '9:16') : initialRatio);
        setCarouselGroup('');
        setVisibilitySettings({
          countries: [],
          dateRange: undefined
        });
      }
    }
  }, [isOpen, slide]);

  useEffect(() => {
    // Load existing position and ratio if editing
    if (slide?.imagePosition) {
      setImagePosition(slide.imagePosition);
    } else {
      setImagePosition({ x: 50, y: 50 });
    }

    // Load slide's ratios or use current global setting
    const settings = getCarouselSettings();

    // Ensure desktop ratio is valid
    const slideDesktop = slide?.desktopRatio || slide?.ratio || settings.ratio;
    const validDesktop: CarouselRatio = ['4:3', '16:9', '21:9', 'fullscreen'].includes(slideDesktop) ? slideDesktop : '16:9';
    setDesktopRatio(validDesktop);
    setPreviewRatio(validDesktop === 'fullscreen' ? '16:9' : validDesktop);

    // Ensure mobile ratio is valid
    const slideMobile = slide?.mobileRatio || '9:16';
    const validMobile: CarouselRatio = ['9:16', 'fullscreen'].includes(slideMobile) ? slideMobile : '9:16';
    setMobileRatio(validMobile);
  }, [slide]);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedUrl = await compressImage(file);
        setImageUrl(compressedUrl);
        // Reset position when uploading new image
        setImagePosition({ x: 50, y: 50 });
      } catch (error) {
        console.error('Image compression failed:', error);
        toast.error('Failed to process image. Please try another file.');
      }
    }
  };

  const handlePositionChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setImagePosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handlePositionChange(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handlePositionChange(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Drag & Drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please drop an image file (PNG, JPG, etc.)');
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      try {
        const compressedUrl = await compressImage(file);
        setImageUrl(compressedUrl);
        // Reset position when uploading new image
        setImagePosition({ x: 50, y: 50 });
      } catch (error) {
        console.error('Image compression failed:', error);
        toast.error('Failed to process image. Please try another file.');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Image is only required for non-video slides
    if (linkType !== 'video' && !imageUrl) {
      toast.error('Please upload an image');
      return;
    }

    if (linkType === 'external' && !externalUrl) {
      toast.error('Please enter an external URL');
      return;
    }

    if (linkType === 'video' && !videoUrl) {
      toast.error('Please enter a video URL');
      return;
    }

    if (linkType === 'video' && !isValidVideoUrl(videoUrl)) {
      toast.error('Please enter a valid YouTube or Vimeo video URL');
      return;
    }

    if (linkType === 'internal' && (!internalTitle || !internalContent)) {
      toast.error('Please enter both title and content for internal information');
      return;
    }

    const slideData: Omit<HeroSlide, 'id' | 'order'> = {
      linkType,
      status,
      carouselGroup: carouselGroup || null,
      ...(linkType !== 'video' && imageUrl ? { imageUrl, imagePosition, desktopRatio, mobileRatio } : {}),
      ...(linkType === 'external'
        ? { externalUrl }
        : linkType === 'video'
        ? { videoUrl }
        : linkType === 'internal'
        ? {
            internalContent: {
              title: internalTitle,
              content: internalContent
            }
          }
        : {} // No additional data for 'none' type
      ),
      ...visibilitySettings
    };

    if (slide) {
      updateHeroSlide(slide.id, slideData);
    } else {
      addHeroSlide(slideData);
    }

    onSave();
    handleClose();
  };

  const handleClose = () => {
    setImageUrl('');
    setLinkType('none');
    setExternalUrl('');
    setVideoUrl('');
    setInternalTitle('');
    setInternalContent('');
    setStatus('active');
    setImagePosition({ x: 50, y: 50 });
    onClose();
  };

  // Emit events for modal state changes (for hiding layout footers)
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('modal-opened'));
    } else {
      window.dispatchEvent(new CustomEvent('modal-closed'));
    }
  }, [isOpen]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[70]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:max-w-4xl w-full sm:max-h-[90vh] overflow-hidden z-[80] flex flex-col">
          <Dialog.Description className="sr-only">
            {slide ? 'Edit hero slide' : 'Add new hero slide'}
          </Dialog.Description>
          {/* Header */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-gray-200">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {slide ? 'Edit Hero Slide' : 'Add Hero Slide'}
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* Form */}
          <form id="hero-slide-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
            {/* Display Slide Toggle */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-700">Display Slide</p>
                <p className="text-xs text-gray-500 mt-1">
                  Show this slide on dashboard
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStatus(status === 'active' ? 'inactive' : 'active')}
                className={`chip-compact relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                  status === 'active' ? 'bg-teal-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                    status === 'active' ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Image Upload and Positioning (Hidden for video type) */}
            {linkType !== 'video' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slide Image *
                  </label>
                  {!imageUrl ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`w-full h-64 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${
                        isDraggingFile
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-300 hover:border-teal-500 hover:bg-teal-50'
                      }`}
                    >
                      <Upload className={`w-8 h-8 mb-2 ${
                        isDraggingFile ? 'text-teal-600' : 'text-gray-400'
                      }`} />
                      <span className={`text-sm font-medium ${
                        isDraggingFile ? 'text-teal-700' : 'text-gray-600'
                      }`}>
                        {isDraggingFile ? 'Drop image here' : 'Click to upload or drag & drop'}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</span>
                    </button>
                  ) : (
                    <div className="space-y-3">
                      {/* Header with Change/Remove buttons */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-700">
                          Current Image
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setImageUrl('');
                              setImagePosition({ x: 50, y: 50 });
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        </div>
                      </div>

                      {/* Preview with Positioning */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium text-gray-600">
                            Preview: {previewMode === 'desktop' ? `Desktop (${desktopRatio})` : `Mobile (${mobileRatio})`}
                          </span>

                          {/* Desktop/Mobile Toggle */}
                          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                            <button
                              type="button"
                              onClick={() => setPreviewMode('desktop')}
                              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                                previewMode === 'desktop'
                                  ? 'bg-white text-gray-900 shadow-sm'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              Desktop
                            </button>
                            <button
                              type="button"
                              onClick={() => setPreviewMode('mobile')}
                              className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                                previewMode === 'mobile'
                                  ? 'bg-white text-gray-900 shadow-sm'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              Mobile
                            </button>
                          </div>
                        </div>
                        <div className={previewMode === 'mobile' ? 'mx-auto' : 'w-full'} style={previewMode === 'mobile' ? { width: '240px', height: `${240 / getRatioValue(previewRatio)}px` } : {}}>
                          <div
                            ref={previewRef}
                            className={`relative w-full h-full rounded-lg overflow-hidden border-2 ${
                              isDragging ? 'border-teal-500' : 'border-gray-300'
                            } cursor-crosshair ${previewMode === 'mobile' ? 'shadow-xl' : ''}`}
                            style={previewMode === 'desktop' ? { aspectRatio: getRatioValue(previewRatio).toString() } : {}}
                              onMouseDown={handleMouseDown}
                              onMouseMove={handleMouseMove}
                              onMouseUp={handleMouseUp}
                              onMouseLeave={handleMouseUp}
                              onDragEnter={handleDragEnter}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                            >
                              <img
                                src={imageUrl}
                                alt="Preview"
                                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                                style={{
                                  objectPosition: `${imagePosition.x}% ${imagePosition.y}%`
                                }}
                              />
                              {/* Crosshair indicator */}
                              <div
                                className="absolute w-8 h-8 pointer-events-none"
                                style={{
                                  left: `${imagePosition.x}%`,
                                  top: `${imagePosition.y}%`,
                                  transform: 'translate(-50%, -50%)'
                                }}
                              >
                                <Move className="w-8 h-8 text-white drop-shadow-lg" />
                              </div>
                            </div>
                          </div>
                        <p className="text-xs text-gray-500 mt-2">
                          <Move className="w-3 h-3 inline mr-1" />
                          Click and drag to position the image focus point
                        </p>
                      </div>

                      {/* Position Controls - REMOVED */}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* Other Settings */}
            <div className="space-y-4">
              {/* Aspect Ratio Selectors - Hidden for video type */}
              {linkType !== 'video' && (
                <div className="space-y-4">
                  {/* Desktop Ratio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Desktop Ratio
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['16:9', 'fullscreen'] as CarouselRatio[]).map((ratio) => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => {
                            setDesktopRatio(ratio);
                            setPreviewMode('desktop');
                          }}
                          className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                            desktopRatio === ratio
                              ? 'border-teal-500 bg-teal-50 text-teal-700'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {ratio === 'fullscreen' ? 'Fullscreen' : ratio}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mobile Ratio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Ratio
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['9:16', 'fullscreen'] as CarouselRatio[]).map((ratio) => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => {
                            setMobileRatio(ratio);
                            setPreviewMode('mobile');
                          }}
                          className={`px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                            mobileRatio === ratio
                              ? 'border-teal-500 bg-teal-50 text-teal-700'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          {ratio === 'fullscreen' ? 'Fullscreen' : ratio}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Use the Desktop/Mobile toggle in the preview to see how your image looks on different devices.
                    </p>
                  </div>
                </div>
              )}

              {/* Link Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLinkType('none')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      linkType === 'none'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <ImageIcon className={`w-5 h-5 mx-auto mb-1 ${
                      linkType === 'none' ? 'text-teal-600' : 'text-gray-400'
                    }`} />
                    <div className="text-xs font-medium text-gray-900">None</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkType('external')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      linkType === 'external'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <LinkIcon className={`w-5 h-5 mx-auto mb-1 ${
                      linkType === 'external' ? 'text-teal-600' : 'text-gray-400'
                    }`} />
                    <div className="text-xs font-medium text-gray-900">External</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkType('video')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      linkType === 'video'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Video className={`w-5 h-5 mx-auto mb-1 ${
                      linkType === 'video' ? 'text-teal-600' : 'text-gray-400'
                    }`} />
                    <div className="text-xs font-medium text-gray-900">Video</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkType('internal')}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      linkType === 'internal'
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FileText className={`w-5 h-5 mx-auto mb-1 ${
                      linkType === 'internal' ? 'text-teal-600' : 'text-gray-400'
                    }`} />
                    <div className="text-xs font-medium text-gray-900">Modal</div>
                  </button>
                </div>
              </div>

              {/* Conditional Fields based on Link Type */}
              {linkType === 'external' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    External URL *
                  </label>
                  <input
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>
              ) : linkType === 'video' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Video URL (YouTube or Vimeo) *
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Paste a YouTube or Vimeo link
                  </p>
                </div>
              ) : linkType === 'internal' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Information Title *
                    </label>
                    <input
                      type="text"
                      value={internalTitle}
                      onChange={(e) => setInternalTitle(e.target.value)}
                      placeholder="Enter title..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Content *
                    </label>
                    <textarea
                      value={internalContent}
                      onChange={(e) => setInternalContent(e.target.value)}
                      placeholder="Enter content..."
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none text-sm"
                    />
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm text-gray-600 text-center">
                    <ImageIcon className="w-5 h-5 inline-block mr-2 text-gray-400" />
                    This slide will display as a non-clickable image
                  </p>
                </div>
              )}

              {/* Carousel Group */}
              <div className="pb-4 border-b border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carousel Group (Optional)
                </label>
                <input
                  type="text"
                  value={carouselGroup}
                  onChange={(e) => setCarouselGroup(e.target.value)}
                  placeholder="Leave empty for single image"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Images with the same group name will form a carousel. Leave empty to display as a single image.
                </p>
              </div>

              {/* Visibility Settings */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Visibility Settings</h4>
                <ContentVisibilitySettings
                  settings={visibilitySettings}
                  onChange={setVisibilitySettings}
                />
              </div>
            </div>
          </div>
          </form>

          {/* Footer with Actions */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3">
            <Dialog.Close asChild>
              <button
                type="button"
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </Dialog.Close>
            <button
              type="submit"
              form="hero-slide-form"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              {slide ? 'Update Slide' : 'Add Slide'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}