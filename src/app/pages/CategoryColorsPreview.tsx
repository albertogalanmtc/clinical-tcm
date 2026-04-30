import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllHerbCategories, getAllFormulaCategories } from '../../lib/categoryColors';

export default function CategoryColorsPreview() {
  const navigate = useNavigate();
  
  const herbCategories = getAllHerbCategories();
  const formulaCategories = getAllFormulaCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Category Colors System
          </h1>
          <p className="text-gray-600 mt-2">
            Color palette based on Traditional Chinese Medicine philosophy and thermal properties
          </p>
        </div>

        {/* Herbs Categories */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Herb Categories ({herbCategories.length} categories)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {herbCategories.map(({ name, colors }) => (
              <div key={name} className="flex flex-col gap-2">
                <span
                  className={`${colors.bg} ${colors.text} px-3 py-2 rounded-md text-sm font-medium`}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Formulas Categories */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Formula Categories ({formulaCategories.length} categories)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formulaCategories.map(({ name, colors }) => (
              <div key={name} className="flex flex-col gap-2">
                <span
                  className={`${colors.bg} ${colors.text} px-3 py-2 rounded-md text-sm font-medium`}
                >
                  {name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Color Logic:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>🧊 <strong>Blue/Cyan</strong>: Cold, cooling, exterior-releasing</li>
            <li>🔥 <strong>Orange/Red</strong>: Heat, movement, blood</li>
            <li>🌿 <strong>Green</strong>: Tonification, nourishment</li>
            <li>💧 <strong>Yellow/Lime</strong>: Dampness, transformation</li>
            <li>🧘 <strong>Purple/Violet</strong>: Shen, spirit, calm, phlegm</li>
            <li>🌸 <strong>Pink/Rose</strong>: Opening orifices, blood-regulating</li>
            <li>⚪ <strong>Gray/Slate/Stone</strong>: Astringent, external, fixation</li>
          </ul>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Hierarchy:</strong> Categories use -100 (bg) / -800 (text) intensities. 
              Important categories (Tonic, Antiparasitic, etc.) use -200 / -900 for emphasis. 
              Subcategories use -50 / -700 for a more subtle appearance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
