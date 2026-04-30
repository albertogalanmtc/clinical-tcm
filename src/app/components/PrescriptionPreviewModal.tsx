import * as Dialog from '@radix-ui/react-dialog';
import { X, Ban } from 'lucide-react';
import type { Prescription } from '../data/prescriptions';
import { getAllHerbs, findHerbByName } from '../data/herbsManager';
import { getAllFormulas } from '../data/formulasManager';
import { useHerbBannedStatus } from '../hooks/useHerbBannedStatus';
import { useState, useEffect } from 'react';

export function PrescriptionPreviewModal({ 
  prescription, 
  onClose 
}: { 
  prescription: Prescription; 
  onClose: () => void;
}) {
  const { isHerbBanned } = useHerbBannedStatus();
  const herbsData = getAllHerbs();
  const formulasData = getAllFormulas();

  // Display configuration from localStorage
  const [displayConfig] = useState(() => {
    try {
      const savedConfig = localStorage.getItem('prescriptionDisplayConfig');
      if (savedConfig) {
        return JSON.parse(savedConfig);
      }
    } catch (error) {
      console.error('Error loading display config from localStorage:', error);
    }
    
    // Default configuration
    return {
      herbs: {
        pinyin: true,
        pharmaceutical: true,
        hanzi: true,
        order: ['pinyin', 'pharmaceutical', 'hanzi'],
      },
      formulas: {
        pinyin: true,
        pharmaceutical: true,
        hanzi: true,
        order: ['pinyin', 'pharmaceutical', 'hanzi'],
      },
    };
  });

  // Helper function to get subcomponents for compound formulas
  const getSubComponents = (componentName: string, dosage: string) => {
    const formula = formulasData.find(f => f.pinyin_name === componentName);
    if (!formula || !formula.composition) return null;

    const totalDosage = parseInt(dosage.replace(/[^0-9]/g, '')) || 0;
    const herbCount = formula.composition.length;
    const dosagePerHerb = Math.round((totalDosage / herbCount) * 10) / 10;

    return formula.composition.map(comp => {
      // Extract herb name - handle both object and string format
      const herbName = typeof comp === 'object' ? comp.herb_pinyin : comp.replace(/\s+\d+(\.\d+)?g?$/i, '').trim();
      return {
        name: herbName,
        dosage: `${dosagePerHerb}g`
      };
    });
  };

  // Get active safety profile filters
  const activeSafetyFilters = prescription.patientSafetyProfile 
    ? Object.entries(prescription.patientSafetyProfile)
        .filter(([_, value]) => value === true)
        .map(([key, _]) => formatSafetyLabel(key))
    : [];

  return (
    <Dialog.Root open={true} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[70]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white rounded-t-2xl sm:rounded-lg sm:max-w-3xl w-full sm:max-h-[90vh] overflow-hidden z-[80] flex flex-col">
          <Dialog.Description className="sr-only">
            Detailed preview of prescription {prescription.prescription_id}
          </Dialog.Description>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <Dialog.Title className="text-xl font-bold text-gray-900">
                    Prescription Preview
                  </Dialog.Title>
                  <Dialog.Description className="text-sm text-gray-600 mt-1">
                    View complete prescription details
                  </Dialog.Description>
                </div>
                <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
                  <X className="w-5 h-5" />
                </Dialog.Close>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Prescription Info */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{prescription.name}</h1>
                <p className="text-sm text-gray-500">
                  Created on {new Date(prescription.createdAt).toLocaleDateString()}
                </p>
                {prescription.createdBy && (
                  <p className="text-sm text-gray-600 mt-1">
                    by {prescription.createdBy.userName}
                  </p>
                )}
              </div>

              {/* Components */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Components</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <table className="w-full">
                    <tbody>
                      {prescription.components.map((component, idx) => {
                        const subComponents = component.type === 'formula' 
                          ? getSubComponents(component.name, component.dosage) 
                          : null;
                        const herb = component.type === 'herb' ? findHerbByName(component.name) : null;

                        return (
                          <tr key={idx} className="border-b border-gray-100 last:border-0">
                            <td className="py-3 pr-8">
                              <div className="flex flex-col gap-0.5">
                                {/* Herb display */}
                                {component.type === 'herb' && herb && (() => {
                                  const visibleNames = displayConfig.herbs.order.filter(nameType => {
                                    if (nameType === 'pinyin') return displayConfig.herbs.pinyin;
                                    if (nameType === 'latin') return displayConfig.herbs.latin && herb.pharmaceutical_name;
                                    if (nameType === 'hanzi') return displayConfig.herbs.hanzi && herb.hanzi_name;
                                    return false;
                                  });
                                  const firstVisibleName = visibleNames[0];
                                  
                                  return (
                                    <>
                                      {displayConfig.herbs.order.map((nameType) => {
                                        const isFirst = nameType === firstVisibleName;
                                        if (nameType === 'pinyin' && displayConfig.herbs.pinyin) {
                                          return (
                                            <div key={nameType} className={isFirst ? "font-bold text-gray-900 text-[16px] flex items-center gap-2" : "text-sm text-gray-600"}>
                                              <span>{component.name}</span>
                                              {isFirst && isHerbBanned(herb) && (
                                                <Ban className="w-4 h-4 text-red-600" />
                                              )}
                                            </div>
                                          );
                                        }
                                        if (nameType === 'latin' && displayConfig.herbs.latin && herb.pharmaceutical_name) {
                                          return (
                                            <div key={nameType} className={isFirst ? "font-bold text-gray-900 text-[16px] flex items-center gap-2" : "text-sm text-gray-600"}>
                                              <span>{herb.pharmaceutical_name}</span>
                                              {isFirst && isHerbBanned(herb) && (
                                                <Ban className="w-4 h-4 text-red-600" />
                                              )}
                                            </div>
                                          );
                                        }
                                        if (nameType === 'hanzi' && displayConfig.herbs.hanzi && herb.chinese) {
                                          return (
                                            <div key={nameType} className={isFirst ? "font-bold text-gray-900 text-[16px] flex items-center gap-2" : "text-sm text-gray-600"}>
                                              <span className="font-hanzi">{herb.chinese}</span>
                                              {isFirst && isHerbBanned(herb) && (
                                                <Ban className="w-4 h-4 text-red-600" />
                                              )}
                                            </div>
                                          );
                                        }
                                        return null;
                                      })}
                                    </>
                                  );
                                })()}
                                
                                {/* Formula display */}
                                {component.type === 'formula' && (() => {
                                  const formula = formulasData.find(f => f.pinyin_name === component.name);
                                  const visibleNames = displayConfig.formulas.order.filter(nameType => {
                                    if (nameType === 'pinyin') return displayConfig.formulas.pinyin;
                                    if (nameType === 'pharmaceutical') return displayConfig.formulas.pharmaceutical && formula?.pharmaceutical_name;
                                    if (nameType === 'hanzi') return displayConfig.formulas.hanzi && formula?.hanzi_name;
                                    return false;
                                  });
                                  const firstVisibleName = visibleNames[0];
                                  
                                  return (
                                    <>
                                      {displayConfig.formulas.order.map((nameType) => {
                                        const isFirst = nameType === firstVisibleName;
                                        if (nameType === 'pinyin' && displayConfig.formulas.pinyin) {
                                          return <span key={nameType} className={isFirst ? "font-bold text-gray-900 text-[16px]" : "text-sm text-gray-600"}>{component.name}</span>;
                                        }
                                        if (nameType === 'pharmaceutical' && displayConfig.formulas.pharmaceutical && formula?.translated_name) {
                                          return <span key={nameType} className={isFirst ? "font-bold text-gray-900 text-[16px]" : "text-sm text-gray-600"}>{formula.translated_name}</span>;
                                        }
                                        if (nameType === 'hanzi' && displayConfig.formulas.hanzi && formula?.hanzi_name) {
                                          return <span key={nameType} className={`${isFirst ? "font-bold text-gray-900 text-[16px]" : "text-sm text-gray-600"} font-hanzi`}>{formula.hanzi_name}</span>;
                                        }
                                        return null;
                                      })}
                                    </>
                                  );
                                })()}
                              </div>
                              {subComponents && subComponents.length > 0 && (
                                <div className="ml-4 mt-2 space-y-1">
                                  {subComponents.map((sub, subIdx) => {
                                    const subHerb = findHerbByName(sub.name);
                                    return (
                                      <div 
                                        key={subIdx} 
                                        className="bg-white border-l-2 border-teal-300 pl-3 py-1.5 flex items-start justify-between gap-2"
                                      >
                                        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                                          {(() => {
                                            const visibleNames = displayConfig.herbs.order.filter(nameType => {
                                              if (nameType === 'pinyin') return displayConfig.herbs.pinyin;
                                              if (nameType === 'latin') return displayConfig.herbs.latin && subHerb?.pharmaceutical_name;
                                              if (nameType === 'hanzi') return displayConfig.herbs.hanzi && subHerb?.hanzi_name;
                                              return false;
                                            });
                                            const firstVisibleName = visibleNames[0];
                                            
                                            return displayConfig.herbs.order.map((nameType) => {
                                              const isFirst = nameType === firstVisibleName;
                                              if (nameType === 'pinyin' && displayConfig.herbs.pinyin) {
                                                return (
                                                  <div key={nameType} className={isFirst ? "text-xs font-bold text-gray-900 flex items-center gap-1.5" : "text-xs text-gray-500"}>
                                                    <span>{sub.name}</span>
                                                    {isFirst && subHerb && isHerbBanned(subHerb) && (
                                                      <Ban className="w-3 h-3 text-red-600" />
                                                    )}
                                                  </div>
                                                );
                                              }
                                              if (nameType === 'latin' && displayConfig.herbs.latin && subHerb?.pharmaceutical_name) {
                                                return (
                                                  <div key={nameType} className={isFirst ? "text-xs font-bold text-gray-900 flex items-center gap-1.5" : "text-xs text-gray-500"}>
                                                    <span>{subHerb.pharmaceutical_name}</span>
                                                    {isFirst && isHerbBanned(subHerb) && (
                                                      <Ban className="w-3 h-3 text-red-600" />
                                                    )}
                                                  </div>
                                                );
                                              }
                                              if (nameType === 'hanzi' && displayConfig.herbs.hanzi && subHerb?.hanzi_name) {
                                                return (
                                                  <div key={nameType} className={isFirst ? "text-xs font-bold text-gray-900 flex items-center gap-1.5" : "text-xs text-gray-500"}>
                                                    <span>{subHerb.hanzi_name}</span>
                                                    {isFirst && isHerbBanned(subHerb) && (
                                                      <Ban className="w-3 h-3 text-red-600" />
                                                    )}
                                                  </div>
                                                );
                                              }
                                              return null;
                                            });
                                          })()}
                                        </div>
                                        <div className="text-xs text-gray-600 shrink-0">{sub.dosage}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </td>
                            <td className="py-3 text-right text-gray-900 whitespace-nowrap align-top">{component.dosage}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Patient Safety Profile */}
              {prescription.alertMode === 'filtered' && activeSafetyFilters.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Patient Safety Profile</h2>
                  <div className="bg-amber-50 rounded-lg border border-amber-200 p-4">
                    <div className="flex flex-wrap gap-2">
                      {activeSafetyFilters.map((filter, index) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300"
                        >
                          {filter}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Comments */}
              {prescription.comments && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Comments</h2>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{prescription.comments}</p>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {prescription.components.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No components in this prescription</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Helper function to format safety profile keys
function formatSafetyLabel(key: string): string {
  const labels: Record<string, string> = {
    breastfeeding: 'Breastfeeding',
    insomnia: 'Insomnia',
    epilepsy: 'Epilepsy',
    bleeding_disorders: 'Bleeding Disorders',
    liver_disease: 'Liver Disease',
    kidney_disease: 'Kidney Disease',
    anticoagulants: 'Anticoagulants',
    antihypertensives: 'Antihypertensives',
    hypoglycemics: 'Hypoglycemics',
    immunosuppressants: 'Immunosuppressants',
    antidepressants: 'Antidepressants',
    antiplatelets: 'Antiplatelets',
    beta_blockers: 'Beta Blockers',
    diuretics: 'Diuretics',
    corticosteroids: 'Corticosteroids',
    sedatives: 'Sedatives',
    shellfish: 'Shellfish Allergy',
    gluten: 'Gluten Allergy',
    nuts: 'Nuts Allergy',
    dairy: 'Dairy Allergy',
    soy: 'Soy Allergy',
    asteraceae: 'Asteraceae Allergy',
    apiaceae: 'Apiaceae Allergy',
  };
  
  return labels[key] || key;
}