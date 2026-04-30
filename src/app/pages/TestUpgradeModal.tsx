import { useState } from 'react';
import { UpgradePlanModal } from '../components/UpgradePlanModal';

export default function TestUpgradeModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<'free' | 'practitioner' | 'advanced'>('free');

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test Upgrade Modal</h1>

      <div className="mb-8 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Simular plan actual:</label>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPlan('free')}
              className={`px-4 py-2 rounded ${
                currentPlan === 'free'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Free
            </button>
            <button
              onClick={() => setCurrentPlan('practitioner')}
              className={`px-4 py-2 rounded ${
                currentPlan === 'practitioner'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Practitioner
            </button>
            <button
              onClick={() => setCurrentPlan('advanced')}
              className={`px-4 py-2 rounded ${
                currentPlan === 'advanced'
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Advanced
            </button>
          </div>
        </div>

        <div className="pt-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-teal-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-700"
          >
            Abrir Modal de Upgrade
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Plan actual simulado: <strong>{currentPlan}</strong>
          </p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h2 className="font-semibold mb-2">Qué esperar:</h2>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• <strong>Free:</strong> Debería mostrar Practitioner y Advanced</li>
          <li>• <strong>Practitioner:</strong> Debería mostrar solo Advanced</li>
          <li>• <strong>Advanced:</strong> Debería mostrar "You're on the highest plan!"</li>
        </ul>
      </div>

      <UpgradePlanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentPlan={currentPlan}
        suggestedPlan="practitioner"
        autoSelect={false}
      />
    </div>
  );
}
