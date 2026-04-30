import { type Prescription } from '../data/prescriptions';
import { Calendar, User, Mail, FileText } from 'lucide-react';

interface PrescriptionViewProps {
  prescription: Prescription;
}

export function PrescriptionView({ prescription }: PrescriptionViewProps) {
  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            {prescription.name || 'Untitled Prescription'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {prescription.createdBy && (
            <>
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>{prescription.createdBy.userName}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{prescription.createdBy.userEmail}</span>
              </div>
            </>
          )}
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(prescription.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Components */}
      <div>
        <h4 className="text-base font-semibold text-gray-900 mb-3">Components</h4>
        <div className="space-y-2">
          {prescription.components.map((component, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-baseline justify-between gap-4">
                <div className="flex-1">
                  <span className="font-medium text-gray-900">{component.name}</span>
                  {component.type === 'formula' && (
                    <span className="ml-2 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                      Formula
                    </span>
                  )}
                  {component.type === 'herb' && (
                    <span className="ml-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">
                      Herb
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 font-medium">{component.dosage}</div>
              </div>

              {/* Sub-components for compound formulas */}
              {component.subComponents && component.subComponents.length > 0 && (
                <div className="mt-2 ml-4 space-y-1 border-l-2 border-purple-200 pl-3">
                  {component.subComponents.map((sub, subIdx) => (
                    <div key={subIdx} className="flex items-baseline justify-between gap-4 text-sm">
                      <span className="text-gray-700">{sub.name}</span>
                      <span className="text-gray-500">{sub.dosage}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Comments */}
      {prescription.comments && prescription.comments.trim() && (
        <div>
          <h4 className="text-base font-semibold text-gray-900 mb-3">Comments</h4>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{prescription.comments}</p>
          </div>
        </div>
      )}

      {/* Safety Profile (if exists) */}
      {prescription.patientSafetyProfile && Object.values(prescription.patientSafetyProfile).some(v => v === true) && (
        <div>
          <h4 className="text-base font-semibold text-gray-900 mb-3">Patient Safety Profile</h4>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex flex-wrap gap-2">
              {Object.entries(prescription.patientSafetyProfile)
                .filter(([_, value]) => value === true)
                .map(([key, _]) => (
                  <span
                    key={key}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-300"
                  >
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Alert Mode */}
      {prescription.alertMode && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">Alert Mode:</span>{' '}
          <span className="capitalize">{prescription.alertMode}</span>
        </div>
      )}
    </div>
  );
}
