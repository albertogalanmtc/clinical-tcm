import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, X, HelpCircle } from 'lucide-react';
import { createCommunityPost, getCategoryInfo, type PostCategory } from '../data/communityPosts';

const TEMPLATE = `**Contexto:** [edad/género, medicación actual, duración]

**Síntomas principales:**
-

**Diagnóstico TCM:**


**Tratamiento aplicado:**


**Evolución/Resultado:**


**Pregunta/Duda:**
`;

export default function CommunityNewPost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<PostCategory>('question');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState('');
  const [showTemplate, setShowTemplate] = useState(false);

  const handleUseTemplate = () => {
    setContent(TEMPLATE);
    setShowTemplate(false);
  };

  const handleAddSymptom = () => {
    if (symptomInput.trim() && !symptoms.includes(symptomInput.trim())) {
      setSymptoms([...symptoms, symptomInput.trim()]);
      setSymptomInput('');
    }
  };

  const handleRemoveSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter(s => s !== symptom));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('Por favor completa el título y el contenido');
      return;
    }

    const newPost = createCommunityPost({
      title: title.trim(),
      content: content.trim(),
      category,
      symptoms: symptoms.length > 0 ? symptoms : undefined
    });

    navigate(`/community/post/${newPost.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/community')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Nuevo caso</h1>
              <p className="text-sm text-gray-600 hidden sm:block">
                Comparte tu experiencia o pide consejo a la comunidad
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 space-y-6">
          {/* Category selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Categoría
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(['help', 'success', 'question', 'discussion'] as PostCategory[]).map(cat => {
                const info = getCategoryInfo(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      category === cat
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{info.emoji}</div>
                    <div className="text-xs font-medium text-gray-900">{info.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del caso <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Dolor menstrual + distensión abdominal"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Descripción del caso <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowTemplate(!showTemplate)}
                className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <HelpCircle className="w-4 h-4" />
                Usar plantilla
              </button>
            </div>

            {showTemplate && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900 mb-2">
                  ¿Quieres usar una plantilla sugerida? Puedes modificarla o escribir libremente.
                </p>
                <button
                  type="button"
                  onClick={handleUseTemplate}
                  className="text-sm px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Insertar plantilla
                </button>
              </div>
            )}

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Describe el caso: contexto del paciente, síntomas, diagnóstico TCM, tratamiento aplicado, evolución, dudas o preguntas..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[300px] font-mono text-sm"
              required
            />
            <p className="text-xs text-gray-500 mt-2">
              Puedes usar formato Markdown: **negrita**, *cursiva*, - lista
            </p>
          </div>

          {/* Symptoms (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Síntomas principales (opcional)
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Añade etiquetas para facilitar la búsqueda y filtrado
            </p>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSymptom();
                  }
                }}
                placeholder="Ej: Dolor menstrual"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="button"
                onClick={handleAddSymptom}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Añadir
              </button>
            </div>

            {symptoms.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {symptoms.map((symptom, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-teal-50 text-teal-700 rounded-full border border-teal-200"
                  >
                    <span className="text-sm">{symptom}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSymptom(symptom)}
                      className="hover:bg-teal-100 rounded-full p-0.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/community')}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              Publicar caso
            </button>
          </div>
        </div>

        {/* Info box */}
        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Nota:</strong> Al publicar tu caso, otros profesionales podrán leerlo y responder con sus
            sugerencias. Asegúrate de no incluir información que pueda identificar a tu paciente.
          </p>
        </div>
      </form>
    </div>
  );
}
