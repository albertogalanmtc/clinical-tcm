import { useState, useEffect, useRef, ChangeEvent } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Plus, Trash2, Upload, Move, ChevronDown, ChevronUp, Save } from 'lucide-react';
import { createBanner, updateBanner, type Banner, type BannerDisplayMode, type BannerType, type BannerQuestion, type BannerPriority } from '@/app/data/banners';
import { compressImage } from '@/app/utils/imageCompression';
import { toast } from 'sonner';
import { useLanguage } from '@/app/contexts/LanguageContext';

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
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const displayModeLabel = isSpanish ? (displayMode === 'widget' ? 'widget' : 'modal') : displayMode;
  const ui = {
    description: isSpanish ? 'Editar o crear un banner' : 'Edit or create a banner',
    title: banner ? (isSpanish ? 'Editar banner' : 'Edit Banner') : (isSpanish ? 'Crear banner' : 'Create Banner'),
    enableBanner: isSpanish ? 'Activar banner' : 'Enable Banner',
    enableHelp: isSpanish ? 'Mostrar este banner a los usuarios que aún no han respondido' : "Show this banner to users who haven't responded yet",
    warning: isSpanish ? '⚠️ Activarlo deshabilitará cualquier otro banner activo de {mode}' : '⚠️ Enabling this will disable any other active {mode} banner',
    displayMode: isSpanish ? 'Modo de visualización' : 'Display Mode',
    widget: isSpanish ? 'Widget' : 'Widget',
    widgetDesc: isSpanish ? 'Se muestra como una tarjeta en el panel' : 'Shows as a card in the dashboard',
    modal: isSpanish ? 'Modal' : 'Modal',
    modalDesc: isSpanish ? 'Se abre automáticamente al iniciar la app' : 'Opens automatically on app start',
    bannerType: isSpanish ? 'Tipo de banner' : 'Banner Type',
    survey: isSpanish ? 'Encuesta' : 'Survey',
    surveyDesc: isSpanish ? 'Recoge respuestas con preguntas' : 'Collect responses with questions',
    announcement: isSpanish ? 'Anuncio' : 'Announcement',
    announcementDesc: isSpanish ? 'Muestra un mensaje sencillo' : 'Display a simple message',
    priority: isSpanish ? 'Prioridad' : 'Priority',
    priorityHelp: isSpanish ? 'Alta: puede saltarse los tiempos de espera (úsala con moderación). Normal: prioridad estándar. Baja: se muestra solo cuando no hay otros banners activos.' : 'High: Can bypass cooldowns (use sparingly). Normal: Standard priority. Low: Shown only when no other banners are active.',
    high: isSpanish ? 'Alta' : 'High',
    highDesc: isSpanish ? 'Mensajes críticos' : 'Critical messages',
    normal: isSpanish ? 'Normal' : 'Normal',
    normalDesc: isSpanish ? 'Predeterminada' : 'Default',
    low: isSpanish ? 'Baja' : 'Low',
    lowDesc: isSpanish ? 'Opcional' : 'Nice to have',
    bannerImage: isSpanish ? 'Imagen del banner (opcional)' : 'Banner Image (Optional)',
    currentImage: isSpanish ? 'Imagen actual' : 'Current Image',
    change: isSpanish ? 'Cambiar' : 'Change',
    remove: isSpanish ? 'Eliminar' : 'Remove',
    clickDrag: isSpanish ? 'Haz clic para subir o arrastra y suelta' : 'Click to upload or drag & drop',
    dropHere: isSpanish ? 'Suelta la imagen aquí' : 'Drop image here',
    position: isSpanish ? 'Posición de la imagen' : 'Image Position',
    adjust: isSpanish ? 'Haz clic y arrastra para ajustar' : 'Click and drag to adjust',
    bannerTitle: isSpanish ? 'Título del banner (opcional)' : 'Banner Title (optional)',
    bannerTitlePlaceholder: isSpanish ? 'Cuéntanos qué piensas' : 'Tell us what you think!',
    questions: isSpanish ? 'Preguntas del banner' : 'Banner Questions',
    addQuestion: isSpanish ? 'Añadir pregunta' : 'Add Question',
    question: isSpanish ? 'Pregunta' : 'Question',
    removeQuestion: isSpanish ? 'Eliminar pregunta' : 'Remove question',
    questionText: isSpanish ? 'Texto de la pregunta' : 'Question Text',
    questionTextPlaceholder: isSpanish ? '¿Cómo valorarías tu experiencia?' : 'How would you rate your experience?',
    answerOptions: isSpanish ? 'Opciones de respuesta' : 'Answer Options',
    addOption: isSpanish ? 'Añadir opción' : 'Add Option',
    minMax: isSpanish ? 'Mín. 2 opciones, máx. 6' : 'Min 2 options, max 6',
    allowFreeText: isSpanish ? 'Permitir a los usuarios escribir respuestas personalizadas' : 'Allow users to write custom text responses',
    sequenceHelp: isSpanish ? 'Los usuarios responderán las preguntas una por una en secuencia' : 'Users will answer questions one at a time in sequence',
    announcementMessage: isSpanish ? 'Mensaje' : 'Message',
    announcementHelp: isSpanish ? 'Muestra un mensaje sencillo a tus usuarios. Las URLs serán clicables automáticamente.' : 'Display a simple message to your users. URLs will be automatically clickable.',
    responseMessage: isSpanish ? 'Mensaje de respuesta (opcional)' : 'Response Message (Optional)',
    responseMessagePlaceholder: isSpanish ? '¡Gracias por tu opinión! Mira nuestras novedades en https://example.com' : 'Thank you for your feedback! Check out our new features at https://example.com',
    responseHelp: isSpanish ? 'Se muestra después de que el usuario envíe su respuesta. Las URLs serán clicables automáticamente.' : 'Shown after the user submits their response. URLs will be automatically clickable.',
    celebrationEmoji: isSpanish ? 'Emoji de celebración' : 'Show celebration emoji',
    emojiDisplay: isSpanish ? 'Emoji a mostrar' : 'Emoji to display',
    emojiHelp: isSpanish ? 'Introduce cualquier emoji (por defecto: 🎉)' : 'Enter any emoji (default: 🎉)',
    cancel: isSpanish ? 'Cancelar' : 'Cancel',
    create: isSpanish ? 'Crear banner' : 'Create Banner',
    update: isSpanish ? 'Actualizar banner' : 'Update Banner',
    failedImage: isSpanish ? 'No se ha podido procesar la imagen. Prueba con otro archivo.' : 'Failed to process image. Please try another file.',
    imageFileRequired: isSpanish ? 'Suelta un archivo de imagen (PNG, JPG, etc.)' : 'Please drop an image file (PNG, JPG, etc.)',
    fileSizeTooLarge: isSpanish ? 'El archivo debe pesar menos de 10MB' : 'File size must be less than 10MB',
    maxQuestions: isSpanish ? 'Máximo 10 preguntas permitidas' : 'Maximum 10 questions allowed',
    minQuestion: isSpanish ? 'Se requiere al menos 1 pregunta' : 'Minimum 1 question required',
    maxOptions: isSpanish ? 'Máximo 6 opciones permitidas por pregunta' : 'Maximum 6 options allowed per question',
    minOptions: isSpanish ? 'Se requieren al menos 2 opciones por pregunta' : 'Minimum 2 options required per question',
    questionTextRequired: isSpanish ? 'Introduce texto para la pregunta' : 'Please enter text for question',
    answerOptionsRequired: isSpanish ? 'Proporciona al menos 2 opciones de respuesta' : 'Please provide at least 2 answer options for question',
    announcementRequired: isSpanish ? 'Introduce un mensaje para el anuncio' : 'Please enter a message for the announcement',
    bannerUpdated: isSpanish ? 'Banner actualizado' : 'Banner updated',
    bannerCreated: isSpanish ? 'Banner creado' : 'Banner created',
    saveFailed: isSpanish ? 'No se ha podido guardar el banner' : 'Failed to save banner',
  };

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
        toast.error(ui.failedImage);
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
        toast.error(ui.imageFileRequired);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(ui.fileSizeTooLarge);
        return;
      }

      try {
        const compressedUrl = await compressImage(file);
        setImageUrl(compressedUrl);
        setImagePosition({ x: 50, y: 50 });
      } catch (error) {
        console.error('Image compression failed:', error);
        toast.error(ui.failedImage);
      }
    }
  };

  const handleAddQuestion = () => {
    if (questions.length < 10) {
      const newQuestions = [...questions, { question: '', options: ['', ''], allowFreeText: false }];
      setQuestions(newQuestions);
      setExpandedQuestions({ ...expandedQuestions, [newQuestions.length - 1]: true });
    } else {
      toast.error(ui.maxQuestions);
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
      toast.error(ui.minQuestion);
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
      toast.error(ui.maxOptions);
    }
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].options.length > 2) {
      newQuestions[questionIndex].options = newQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
      setQuestions(newQuestions);
    } else {
      toast.error(ui.minOptions);
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
          toast.error(`${ui.questionTextRequired} ${i + 1}`);
          return;
        }

        const filledOptions = q.options.filter(o => o.trim() !== '');
        if (filledOptions.length < 2) {
          toast.error(`${ui.answerOptionsRequired} ${i + 1}`);
          return;
        }
      }
    } else {
      // Validate message for announcement type
      if (!message.trim()) {
        toast.error(ui.announcementRequired);
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
        toast.success(ui.bannerUpdated);
      } else {
        createBanner(bannerData);
        toast.success(ui.bannerCreated);
      }
      onClose();
    } catch (error) {
      toast.error(ui.saveFailed);
      console.error('Error saving banner:', error);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[70]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:max-w-2xl w-full sm:max-h-[90vh] overflow-hidden z-[80] flex flex-col">
          <Dialog.Description className="sr-only">
            {ui.description}
          </Dialog.Description>

          {/* Header */}
          <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <Dialog.Title className="text-xl font-semibold text-gray-900">
              {ui.title}
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
                  <p className="text-sm font-medium text-gray-700">{ui.enableBanner}</p>
                  <p className="text-xs text-gray-500 mt-1">{ui.enableHelp}</p>
                  {enabled && (
                    <p className="text-xs text-amber-600 mt-1">
                      ⚠️ {ui.warning.replace('{mode}', displayModeLabel)}
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
                  {ui.displayMode} <span className="text-red-500">*</span>
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
                      <span className="font-medium text-gray-900">{ui.widget}</span>
                    </div>
                    <p className="text-xs text-gray-600">{ui.widgetDesc}</p>
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
                      <span className="font-medium text-gray-900">{ui.modal}</span>
                    </div>
                    <p className="text-xs text-gray-600">{ui.modalDesc}</p>
                  </button>
                </div>
              </div>

              {/* Banner Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {ui.bannerType} <span className="text-red-500">*</span>
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
                      <span className="font-medium text-gray-900">{ui.survey}</span>
                    </div>
                    <p className="text-xs text-gray-600">{ui.surveyDesc}</p>
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
                      <span className="font-medium text-gray-900">{ui.announcement}</span>
                    </div>
                    <p className="text-xs text-gray-600">{ui.announcementDesc}</p>
                  </button>
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {ui.priority} <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  {ui.priorityHelp}
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
                      <span className="font-medium text-gray-900">{ui.high}</span>
                    </div>
                    <p className="text-xs text-gray-600">{ui.highDesc}</p>
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
                      <span className="font-medium text-gray-900">{ui.normal}</span>
                    </div>
                    <p className="text-xs text-gray-600">{ui.normalDesc}</p>
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
                      <span className="font-medium text-gray-900">{ui.low}</span>
                    </div>
                    <p className="text-xs text-gray-600">{ui.lowDesc}</p>
                  </button>
                </div>
              </div>

              {/* Image Upload - Only for Modal mode */}
              {displayMode === 'modal' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {ui.bannerImage}
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
                      {isDraggingFile ? ui.dropHere : ui.clickDrag}
                    </span>
                    <span className="text-xs text-gray-400 mt-1">{isSpanish ? 'PNG, JPG hasta 10MB' : 'PNG, JPG up to 10MB'}</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">{ui.currentImage}</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-teal-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          {ui.change}
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageUrl('')}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                          {ui.remove}
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">{ui.position}</span>
                        <span className="text-xs text-gray-500">{ui.adjust}</span>
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
                  {ui.bannerTitle}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={ui.bannerTitlePlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Survey Questions - Only shown for survey type */}
              {type === 'survey' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-gray-700">
                      {ui.questions} <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      disabled={questions.length >= 10}
                      className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                      {ui.addQuestion}
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
                              {ui.question} {qIndex + 1}
                              {q.question.trim() && `: ${q.question.substring(0, 50)}${q.question.length > 50 ? '...' : ''}`}
                            </span>
                          </button>
                          {questions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveQuestion(qIndex)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                                title={ui.removeQuestion}
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
                                {ui.questionText}
                              </label>
                              <textarea
                                value={q.question}
                                onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                                placeholder={ui.questionTextPlaceholder}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
                                rows={2}
                              />
                            </div>

                            {/* Answer Options */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-medium text-gray-600">
                                  {ui.answerOptions}
                                </label>
                                <button
                                  type="button"
                                  onClick={() => handleAddOption(qIndex)}
                                  disabled={q.options.length >= 6}
                                  className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                                >
                                  <Plus className="w-3 h-3" />
                                  {ui.addOption}
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
                                      placeholder={`${isSpanish ? 'Opción' : 'Option'} ${oIndex + 1}`}
                                      className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                    />
                                    {q.options.length > 2 && (
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveOption(qIndex, oIndex)}
                                        className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors flex-shrink-0"
                                        title={isSpanish ? 'Eliminar opción' : 'Remove option'}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{ui.minOptions}</p>
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
                                {ui.allowFreeText}
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{ui.sequenceHelp}</p>
                </div>
              )}

              {/* Announcement Message - Only shown for announcement type */}
              {type === 'announcement' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {ui.announcementMessage} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={isSpanish ? '¡Lanzamos una nueva funcionalidad la semana que viene! Échale un vistazo en https://example.com' : "We're launching a new feature next week! Check it out at https://example.com"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {ui.announcementHelp}
                  </p>
                </div>
              )}

              {/* Feedback Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {ui.responseMessage}
                </label>
                <textarea
                  value={feedbackMessage}
                  onChange={(e) => setFeedbackMessage(e.target.value)}
                  placeholder={ui.responseMessagePlaceholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {ui.responseHelp}
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
                        {ui.celebrationEmoji}
                      </label>
                    </div>

                    {showCelebrationEmoji && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {ui.emojiDisplay}
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
                            {ui.emojiHelp}
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
                {ui.cancel}
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                {banner ? ui.update : ui.create}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
