import { useState, useEffect, useRef, ChangeEvent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, Trash2, Upload, Move, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { createBanner, updateBanner, type Banner, type BannerDisplayMode, type BannerType, type BannerQuestion, type BannerPriority } from '@/app/data/banners';
import { compressImage } from '@/app/utils/imageCompression';
import { toast } from 'sonner';

interface BannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  banner?: Banner | null;
}

export function BannerModal({ isOpen, onClose, banner }: BannerModalProps) {
  const [type, setType] = useState<BannerType>('survey');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [questions, setQuestions] = useState<BannerQuestion[]>([{ question: '', options: ['', ''] }]);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({ 0: true });
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showCelebrationEmoji, setShowCelebrationEmoji] = useState(false);
  const [celebrationEmoji, setCelebrationEmoji] = useState('🎉');
  const [displayMode, setDisplayMode] = useState<BannerDisplayMode>('widget');
  const [priority, setPriority] = useState<BannerPriority>('normal');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePosition, setImagePosition] = useState({ x: 50, y: 50 });
  const [enabled, setEnabled] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isDraggingPosition, setIsDraggingPosition] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Emit events for modal state changes
  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('modal-opened'));
    } else {
      window.dispatchEvent(new CustomEvent('modal-closed'));
    }
  }, [isOpen]);

  useEffect(() => {
    if (banner) {
      setType(banner.type || 'survey');
      setTitle(banner.title);
      setMessage(banner.message || '');
      // Ensure all questions have allowFreeText field
      const questionsWithDefaults = banner.questions && banner.questions.length > 0
        ? banner.questions.map(q => ({
            ...q,
            allowFreeText: q.allowFreeText ?? false
          }))
        : [{ question: '', options: ['', ''], allowFreeText: false }];
      setQuestions(questionsWithDefaults);
      const expanded: Record<number, boolean> = {};
      if (banner.questions) {
        banner.questions.forEach((_, index) => {
          expanded[index] = index === 0; // Only expand first question by default
        });
      }
      setExpandedQuestions(expanded);
      setFeedbackMessage(banner.feedbackMessage || '');
      setShowCelebrationEmoji(banner.showCelebrationEmoji || false);
      setCelebrationEmoji(banner.celebrationEmoji || '🎉');
      setDisplayMode(banner.displayMode);
      setPriority(banner.priority || 'normal');
      setImageUrl(banner.imageUrl || '');
      setImagePosition(banner.imagePosition || { x: 50, y: 50 });
      setEnabled(banner.enabled);
    } else {
      setType('survey');
      setTitle('');
      setMessage('');
      setQuestions([{ question: '', options: ['', ''], allowFreeText: false }]);
      setExpandedQuestions({ 0: true });
      setFeedbackMessage('');
      setShowCelebrationEmoji(false);
      setCelebrationEmoji('🎉');
      setDisplayMode('widget');
      setPriority('normal');
      setImageUrl('');
      setImagePosition({ x: 50, y: 50 });
      setEnabled(true); // Default to enabled when creating new banner
    }
  }, [banner, isOpen]);

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedUrl = await compressImage(file);
        setImageUrl(compressedUrl);
        setImagePosition({ x: 50, y: 50 });
      } catch (error) {
        console.error('Image compression failed:', error);
        toast.error('Failed to process image. Please try another file.');
      }
    }
  };

  const handlePositionChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingPosition || !previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setImagePosition({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y))
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDraggingPosition(true);
    handlePositionChange(e);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handlePositionChange(e);
  };

  const handleMouseUp = () => {
    setIsDraggingPosition(false);
  };

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

      if (!file.type.startsWith('image/')) {
        toast.error('Please drop an image file (PNG, JPG, etc.)');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      try {
        const compressedUrl = await compressImage(file);
        setImageUrl(compressedUrl);
        setImagePosition({ x: 50, y: 50 });
      } catch (error) {
        console.error('Image compression failed:', error);
        toast.error('Failed to process image. Please try another file.');
      }
    }
  };

  const handleAddQuestion = () => {
    if (questions.length < 10) {
      const newQuestions = [...questions, { question: '', options: ['', ''], allowFreeText: false }];
      setQuestions(newQuestions);
      setExpandedQuestions({ ...expandedQuestions, [newQuestions.length - 1]: true });
    } else {
      toast.error('Maximum 10 questions allowed');
    }
  };

  const handleRemoveQuestion = (questionIndex: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== questionIndex);
      setQuestions(newQuestions);
      const newExpanded = { ...expandedQuestions };
      delete newExpanded[questionIndex];
      setExpandedQuestions(newExpanded);
    } else {
      toast.error('Minimum 1 question required');
    }
  };

  const handleQuestionChange = (questionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].question = value;
    setQuestions(newQuestions);
  };

  const handleAddOption = (questionIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].options.length < 6) {
      newQuestions[questionIndex].options.push('');
      setQuestions(newQuestions);
    } else {
      toast.error('Maximum 6 options allowed per question');
    }
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].options.length > 2) {
      newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
      setQuestions(newQuestions);
    } else {
      toast.error('Minimum 2 options required per question');
    }
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleToggleFreeText = (questionIndex: number) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].allowFreeText = !newQuestions[questionIndex].allowFreeText;
    setQuestions(newQuestions);
  };

  const toggleQuestion = (questionIndex: number) => {
    setExpandedQuestions({
      ...expandedQuestions,
      [questionIndex]: !expandedQuestions[questionIndex]
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation based on type
    if (type === 'survey') {
      // Validate questions for survey type
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question.trim()) {
          toast.error(`Please enter text for question ${i + 1}`);
          return;
        }

        const filledOptions = q.options.filter(o => o.trim() !== '');
        if (filledOptions.length < 2) {
          toast.error(`Please provide at least 2 answer options for question ${i + 1}`);
          return;
        }
      }
    } else {
      // Validate message for announcement type
      if (!message.trim()) {
        toast.error('Please enter a message for the announcement');
        return;
      }
    }

    // Clean up questions - remove empty options (only for survey)
    const cleanedQuestions: BannerQuestion[] | undefined = type === 'survey'
      ? questions.map(q => ({
          question: q.question.trim(),
          options: q.options.filter(o => o.trim() !== ''),
          allowFreeText: q.allowFreeText || false
        }))
      : undefined;

    const bannerData = {
      type,
      title: title.trim(),
      ...(type === 'survey' ? { questions: cleanedQuestions } : { message: message.trim() }),
      feedbackMessage: feedbackMessage.trim() || undefined,
      showCelebrationEmoji: feedbackMessage.trim() ? showCelebrationEmoji : false,
      celebrationEmoji: feedbackMessage.trim() && showCelebrationEmoji ? celebrationEmoji : undefined,
      displayMode,
      priority,
      enabled,
      backgroundColor: '#F0FDFA', // Teal-50
      textColor: '#115E59', // Teal-800
      // Only include image for modal mode
      imageUrl: displayMode === 'modal' && imageUrl ? imageUrl : undefined,
      imagePosition: displayMode === 'modal' && imageUrl ? imagePosition : undefined
    };

    try {
      if (banner) {
        updateBanner(banner.id, bannerData);
        toast.success('Banner updated');
      } else {
        createBanner(bannerData);
        toast.success('Banner created');
      }
      onClose();
    } catch (error) {
      toast.error('Failed to save banner');
      console.error('Error saving banner:', error);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[70]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:max-w-2xl w-full sm:max-h-[90vh] overflow-hidden z-[80] flex flex-col">
          <Dialog.Description className="sr-only">
            {banner ? 'Edit banner' : 'Create new banner'}
          </Dialog.Description>

          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {banner ? 'Edit Banner' : 'Create Banner'}
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Enabled Toggle */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-700">Enable Banner</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Show this banner to users who haven't responded yet
                  </p>
                  {enabled && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ Enabling this will disable any other active {displayMode} banner
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setEnabled(!enabled)}
                  className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                    enabled ? 'bg-teal-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                      enabled ? 'translate-x-5 sm:translate-x-6' : 'translate-x-0.5 sm:translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Display Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Mode <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDisplayMode('widget');
                      // Clear image when switching to widget mode
                      setImageUrl('');
                      setImagePosition({ x: 50, y: 50 });
                    }}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${
                      displayMode === 'widget'
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        displayMode === 'widget' ? 'border-teal-600' : 'border-gray-300'
                      }`}>
                        {displayMode === 'widget' && (
                          <div className="w-2 h-2 rounded-full bg-teal-600" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">Widget</span>
                    </div>
                    <p className="text-xs text-gray-600">Shows as a card in the dashboard</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDisplayMode('modal')}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${
                      displayMode === 'modal'
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        displayMode === 'modal' ? 'border-teal-600' : 'border-gray-300'
                      }`}>
                        {displayMode === 'modal' && (
                          <div className="w-2 h-2 rounded-full bg-teal-600" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">Modal</span>
                    </div>
                    <p className="text-xs text-gray-600">Opens automatically on app start</p>
                  </button>
                </div>
              </div>

              {/* Banner Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('survey')}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${
                      type === 'survey'
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        type === 'survey' ? 'border-teal-600' : 'border-gray-300'
                      }`}>
                        {type === 'survey' && (
                          <div className="w-2 h-2 rounded-full bg-teal-600" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">Survey</span>
                    </div>
                    <p className="text-xs text-gray-600">Collect responses with questions</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('announcement')}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${
                      type === 'announcement'
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        type === 'announcement' ? 'border-teal-600' : 'border-gray-300'
                      }`}>
                        {type === 'announcement' && (
                          <div className="w-2 h-2 rounded-full bg-teal-600" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">Announcement</span>
                    </div>
                    <p className="text-xs text-gray-600">Display a simple message</p>
                  </button>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  <strong>High:</strong> Can bypass cooldowns (use sparingly). <strong>Normal:</strong> Standard priority. <strong>Low:</strong> Shown only when no other banners are active.
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setPriority('high')}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${
                      priority === 'high'
                        ? 'border-red-600 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        priority === 'high' ? 'border-red-600' : 'border-gray-300'
                      }`}>
                        {priority === 'high' && (
                          <div className="w-2 h-2 rounded-full bg-red-600" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">High</span>
                    </div>
                    <p className="text-xs text-gray-600">Critical messages</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriority('normal')}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${
                      priority === 'normal'
                        ? 'border-teal-600 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        priority === 'normal' ? 'border-teal-600' : 'border-gray-300'
                      }`}>
                        {priority === 'normal' && (
                          <div className="w-2 h-2 rounded-full bg-teal-600" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">Normal</span>
                    </div>
                    <p className="text-xs text-gray-600">Default</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPriority('low')}
                    className={`p-4 border-2 rounded-lg transition-all text-left ${
                      priority === 'low'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        priority === 'low' ? 'border-blue-600' : 'border-gray-300'
                      }`}>
                        {priority === 'low' && (
                          <div className="w-2 h-2 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">Low</span>
                    </div>
                    <p className="text-xs text-gray-600">Nice to have</p>
                  </button>
                </div>
              </div>

              {/* Image Upload - Only for Modal mode */}
              {displayMode === 'modal' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image (Optional)
                </label>
                {!imageUrl ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${
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
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">Current Image</span>
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
                          onClick={() => setImageUrl('')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">
                          Image Position
                        </span>
                        <span className="text-xs text-gray-500">
                          Click and drag to adjust
                        </span>
                      </div>
                      <div
                        ref={previewRef}
                        className={`relative w-full h-48 rounded-lg overflow-hidden border-2 ${
                          isDraggingPosition ? 'border-teal-500' : 'border-gray-300'
                        } cursor-crosshair`}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                      >
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover pointer-events-none"
                          style={{
                            objectPosition: `${imagePosition.x}% ${imagePosition.y}%`
                          }}
                        />
                        <div
                          className="absolute transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                          style={{
                            left: `${imagePosition.x}%`,
                            top: `${imagePosition.y}%`
                          }}
                        >
                          <Move className="w-8 h-8 text-white drop-shadow-lg" />
                        </div>
                      </div>
                    </div>
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
              )}

              {/* Banner Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Title (optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tell us what you think!"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Survey Questions - Only shown for survey type */}
              {type === 'survey' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Banner Questions <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      disabled={questions.length >= 10}
                      className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                      Add Question
                    </button>
                  </div>

                  <div className="space-y-3">
                    {questions.map((q, qIndex) => (
                      <div key={qIndex} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                        {/* Question Header */}
                        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => toggleQuestion(qIndex)}
                            className="flex items-center gap-2 flex-1 text-left"
                          >
                            {expandedQuestions[qIndex] ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                            <span className="text-sm font-medium text-gray-700">
                              Question {qIndex + 1}
                              {q.question.trim() && `: ${q.question.substring(0, 50)}${q.question.length > 50 ? '...' : ''}`}
                            </span>
                          </button>
                          {questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(qIndex)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Remove question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Question Content */}
                        {expandedQuestions[qIndex] && (
                          <div className="p-4 space-y-4">
                            {/* Question Text */}
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Question Text
                              </label>
                              <textarea
                                value={q.question}
                                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                                placeholder="How would you rate your experience?"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
                                rows={2}
                              />
                            </div>

                            {/* Answer Options */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-medium text-gray-600">
                                  Answer Options
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleAddOption(qIndex)}
                                  disabled={q.options.length >= 6}
                                  className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                  <Plus className="w-3 h-3" />
                                  Add Option
                                </button>
                              </div>

                              <div className="space-y-2">
                                {q.options.map((option, oIndex) => (
                                  <div key={oIndex} className="flex items-center gap-2">
                                    <div className="flex items-center justify-center w-4 h-4 rounded-full border-2 border-teal-600 flex-shrink-0">
                                      <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                                    </div>
                                    <input
                                      type="text"
                                      value={option}
                                      onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                      placeholder={`Option ${oIndex + 1}`}
                                      className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                    {q.options.length > 2 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveOption(qIndex, oIndex)}
                                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                                        title="Remove option"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Min 2 options, max 6</p>
                            </div>

                            {/* Allow Free Text Option */}
                            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                              <input
                                type="checkbox"
                                id={`free-text-${qIndex}`}
                                checked={q.allowFreeText || false}
                                onChange={() => handleToggleFreeText(qIndex)}
                                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                              />
                              <label htmlFor={`free-text-${qIndex}`} className="text-xs font-medium text-gray-700">
                                Allow users to write custom text responses
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Users will answer questions one at a time in sequence</p>
                </div>
              )}

              {/* Announcement Message - Only shown for announcement type */}
              {type === 'announcement' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="We're launching a new feature next week! Check it out at https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Display a simple message to your users. URLs will be automatically clickable.
                  </p>
                </div>
              )}

              {/* Feedback Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response Message (Optional)
                </label>
                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder="Thank you for your feedback! Check out our new features at https://example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Shown after the user submits their response. URLs will be automatically clickable.
                </p>

                {/* Celebration Emoji Toggle */}
                {feedbackMessage.trim() && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="celebration-emoji"
                        checked={showCelebrationEmoji}
                        onChange={(e) => setShowCelebrationEmoji(e.target.checked)}
                        className="w-4 h-4 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                      />
                      <label htmlFor="celebration-emoji" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                        Show celebration emoji
                      </label>
                    </div>

                    {showCelebrationEmoji && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Emoji to display
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={celebrationEmoji}
                            onChange={(e) => setCelebrationEmoji(e.target.value)}
                            placeholder="🎉"
                            maxLength={4}
                            className="w-20 px-3 py-2 text-center text-2xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                          <span className="text-xs text-gray-500 flex-1">
                            Enter any emoji (default: 🎉)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer with Actions */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                {banner ? 'Update Banner' : 'Create Banner'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
