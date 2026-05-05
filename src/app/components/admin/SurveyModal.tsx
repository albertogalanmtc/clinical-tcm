import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Save, Loader2, Plus, Trash2 } from 'lucide-react';
import { surveysService, type Survey, type SurveyQuestion } from '@/app/services/surveysService';
import { toast } from 'sonner';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface SurveyModalProps {
  isOpen: boolean;
  onClose: () => void;
  survey?: Survey | null;
  onSave: () => void;
}

export function SurveyModal({ isOpen, onClose, survey, onSave }: SurveyModalProps) {
  const [questions, setQuestions] = useState<SurveyQuestion[]>(survey?.questions || [{ question: '', options: [''], allowFreeText: false }]);
  const [status, setStatus] = useState<'active' | 'inactive' | 'draft'>(survey?.status || 'draft');
  const [startDate, setStartDate] = useState(survey?.start_date ? new Date(survey.start_date).toISOString().split('T')[0] : '');
  const [endDate, setEndDate] = useState(survey?.end_date ? new Date(survey.end_date).toISOString().split('T')[0] : '');
  const [showResults, setShowResults] = useState(survey?.show_results ?? false);
  const [thankYouMessage, setThankYouMessage] = useState(survey?.thank_you_message || '');
  const [thankYouEmoji, setThankYouEmoji] = useState(survey?.thank_you_emoji || '🎉');
  const [showThankYouEmoji, setShowThankYouEmoji] = useState(survey?.show_thank_you_emoji ?? true);
  const [saving, setSaving] = useState(false);
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const ui = {
    description: isSpanish ? 'Editar o crear una encuesta' : 'Edit or create a survey',
    title: survey ? (isSpanish ? 'Editar encuesta' : 'Edit Survey') : (isSpanish ? 'Crear encuesta' : 'Create Survey'),
    addQuestion: isSpanish ? 'Añadir pregunta' : 'Add Question',
    questions: isSpanish ? 'Preguntas' : 'Questions',
    settings: isSpanish ? 'Ajustes' : 'Settings',
    status: isSpanish ? 'Estado' : 'Status',
    draft: isSpanish ? 'Borrador' : 'Draft',
    active: isSpanish ? 'Activo' : 'Active',
    inactive: isSpanish ? 'Inactivo' : 'Inactive',
    questionLabel: (n: number) => (isSpanish ? `Pregunta ${n}` : `Question ${n}`),
    questionPlaceholder: isSpanish ? 'Introduce tu pregunta' : 'Enter your question',
    options: isSpanish ? 'Opciones' : 'Options',
    addOption: isSpanish ? 'Añadir opción' : '+ Add Option',
    allowFreeText: isSpanish ? 'Permitir respuesta de texto libre' : 'Allow free text response',
    startDate: isSpanish ? 'Fecha de inicio (opcional)' : 'Start Date (Optional)',
    endDate: isSpanish ? 'Fecha de fin (opcional)' : 'End Date (Optional)',
    showResults: isSpanish ? 'Mostrar resultados a los usuarios después de enviar' : 'Show results to users after submission',
    thankYouMessage: isSpanish ? 'Mensaje de agradecimiento (opcional)' : 'Thank You Message (Optional)',
    thankYouPlaceholder: isSpanish ? '¡Gracias por completar esta encuesta!' : 'Thank you for completing this survey!',
    showEmoji: isSpanish ? 'Mostrar emoji en el mensaje de agradecimiento' : 'Show emoji in thank you message',
    emoji: isSpanish ? 'Emoji (pegar aquí)' : 'Emoji (paste here)',
    cancel: isSpanish ? 'Cancelar' : 'Cancel',
    saving: isSpanish ? 'Guardando...' : 'Saving...',
    update: isSpanish ? 'Actualizar encuesta' : 'Update Survey',
    create: isSpanish ? 'Crear encuesta' : 'Create Survey',
    addAtLeastOne: isSpanish ? 'Por favor añade al menos una pregunta' : 'Please add at least one question',
    ensureQuestions: isSpanish ? 'Asegúrate de que las preguntas tengan texto y al menos una opción' : 'Please ensure questions have text and at least one option',
    updated: isSpanish ? 'Encuesta actualizada correctamente' : 'Survey updated successfully',
    created: isSpanish ? 'Encuesta creada correctamente' : 'Survey created successfully',
    failed: isSpanish ? 'No se pudo guardar la encuesta' : 'Failed to save survey',
    minOne: isSpanish ? 'Mínimo 1 pregunta requerida' : 'Minimum 1 question required',
    maxQuestions: isSpanish ? 'Máximo 10 preguntas permitidas' : 'Maximum 10 questions allowed',
    maxOptions: isSpanish ? 'Máximo 6 opciones permitidas por pregunta' : 'Maximum 6 options allowed per question',
    minOptions: isSpanish ? 'Mínimo 2 opciones requeridas por pregunta' : 'Minimum 2 options required per question',
  };

  useEffect(() => {
    if (isOpen) {
      window.dispatchEvent(new CustomEvent('modal-opened'));
    } else {
      window.dispatchEvent(new CustomEvent('modal-closed'));
    }
  }, [isOpen]);

  useEffect(() => {
    if (survey) {
      setQuestions(survey.questions.length > 0 ? survey.questions : [{ question: '', options: [''], allowFreeText: false }]);
      setStatus(survey.status);
      setStartDate(survey.start_date ? new Date(survey.start_date).toISOString().split('T')[0] : '');
      setEndDate(survey.end_date ? new Date(survey.end_date).toISOString().split('T')[0] : '');
      setShowResults(survey.show_results);
      setThankYouMessage(survey.thank_you_message || '');
      setThankYouEmoji(survey.thank_you_emoji || '🎉');
      setShowThankYouEmoji(survey.show_thank_you_emoji ?? true);
    } else {
      setQuestions([{ question: '', options: [''], allowFreeText: false }]);
      setStatus('draft');
      setStartDate('');
      setEndDate('');
      setShowResults(false);
      setThankYouMessage('');
      setThankYouEmoji('🎉');
      setShowThankYouEmoji(true);
    }
  }, [survey, isOpen]);

  const addQuestion = () => {
    setQuestions([...questions, { question: '', options: [''], allowFreeText: false }]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof SurveyQuestion, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options.push('');
    setQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options = updated[questionIndex].options.filter((_, i) => i !== optionIndex);
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (questions.length === 0) {
        toast.error(ui.addAtLeastOne);
        setSaving(false);
        return;
      }

      const validQuestions = questions.filter(q =>
        q.question.trim() && q.options.filter(o => o.trim()).length > 0
      );

      if (validQuestions.length === 0) {
        toast.error(ui.ensureQuestions);
        setSaving(false);
        return;
      }

      const cleanedQuestions = validQuestions.map(q => ({
        question: q.question.trim(),
        options: q.options.filter(o => o.trim()).map(o => o.trim()),
        allowFreeText: q.allowFreeText
      }));

      // Use first question as title
      const title = cleanedQuestions[0].question;

      const surveyData = {
        title,
        description: undefined,
        questions: cleanedQuestions,
        status,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        show_results: showResults,
        thank_you_message: thankYouMessage.trim() || undefined,
        thank_you_emoji: thankYouEmoji,
        show_thank_you_emoji: showThankYouEmoji
      };

      console.log('SurveyModal: Saving survey with data:', surveyData);

      if (survey) {
        const result = await surveysService.updateSurvey(survey.id, surveyData);
        console.log('SurveyModal: Update result:', result);
        toast.success(ui.updated);
      } else {
        const result = await surveysService.createSurvey(surveyData);
        console.log('SurveyModal: Create result:', result);
        toast.success(ui.created);
      }

      onSave();
      onClose();
    } catch (error) {
      toast.error(ui.failed);
      console.error('Error saving survey:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[70]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:max-w-3xl w-full sm:max-h-[90vh] overflow-hidden z-[80] flex flex-col">
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
              {/* Status */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {ui.status}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'active' | 'inactive' | 'draft')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="draft">{ui.draft}</option>
                    <option value="active">{ui.active}</option>
                    <option value="inactive">{ui.inactive}</option>
                  </select>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Questions</h3>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    {ui.addQuestion}
                  </button>
                </div>

                {questions.map((q, qIndex) => (
                  <div key={qIndex} className="p-4 border border-gray-200 rounded-lg space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <label className="block font-medium text-gray-900 mb-2">
                          {ui.questionLabel(qIndex + 1)} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => updateQuestion(qIndex, 'question', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder={ui.questionPlaceholder}
                        />
                      </div>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(qIndex)}
                          className="mt-8 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Options */}
                    <div className="ml-4 space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {ui.options}
                      </label>
                      {q.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                            placeholder={`Option ${oIndex + 1}`}
                          />
                          {q.options.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeOption(qIndex, oIndex)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addOption(qIndex)}
                        className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        {ui.addOption}
                      </button>
                    </div>

                    {/* Allow Free Text */}
                    <div className="flex items-center gap-2 ml-4">
                      <input
                        type="checkbox"
                        id={`freetext-${qIndex}`}
                        checked={q.allowFreeText}
                        onChange={(e) => updateQuestion(qIndex, 'allowFreeText', e.target.checked)}
                        className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                      />
                      <label htmlFor={`freetext-${qIndex}`} className="text-sm text-gray-700">
                        {ui.allowFreeText}
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Settings */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">{ui.settings}</h3>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {ui.startDate}
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {ui.endDate}
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Show Results */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="showResults"
                    checked={showResults}
                    onChange={(e) => setShowResults(e.target.checked)}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <label htmlFor="showResults" className="text-sm font-medium text-gray-700">
                    {ui.showResults}
                  </label>
                </div>

                {/* Thank You Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    {ui.thankYouMessage}
                    </label>
                  <textarea
                    value={thankYouMessage}
                    onChange={(e) => setThankYouMessage(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                    placeholder={ui.thankYouPlaceholder}
                  />
                </div>

                {/* Thank You Emoji */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <input
                      type="checkbox"
                      id="showEmoji"
                      checked={showThankYouEmoji}
                      onChange={(e) => setShowThankYouEmoji(e.target.checked)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <label htmlFor="showEmoji" className="text-sm font-medium text-gray-700">
                      {ui.showEmoji}
                    </label>
                  </div>
                  {showThankYouEmoji && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {ui.emoji}
                      </label>
                      <input
                        type="text"
                        value={thankYouEmoji}
                        onChange={(e) => setThankYouEmoji(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-2xl"
                        placeholder="🎉"
                        maxLength={10}
                      />
                    </div>
                  )}
                </div>
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
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? ui.saving : (survey ? ui.update : ui.create)}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
