import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { getAllHerbs } from '@/app/data/herbsManager';
import { getAllFormulas, addFormula, updateFormula } from '@/app/data/formulasManager';
import { Formula } from '@/app/data/formulas';
import { ThermalActionSelector } from '@/app/components/ui/ThermalActionSelector';
import { IngredientSelector } from '@/app/components/IngredientSelector';
import { HerbChipSelector } from '@/app/components/HerbChipSelector';

interface NewFormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingFormula?: Formula;
}

export function NewFormulaModal({ isOpen, onClose, onSuccess, editingFormula }: NewFormulaModalProps) {
  const herbsData = getAllHerbs();
  const formulasData = getAllFormulas();
  
  // Basic info
  const [pinyinName, setPinyinName] = useState('');
  const [hanziName, setHanziName] = useState('');
  const [pharmaceuticalName, setPharmaceuticalName] = useState('');
  const [alternativeNames, setAlternativeNames] = useState('');
  const [source, setSource] = useState('');
  const [thermalAction, setThermalAction] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  
  // Composition
  const [ingredients, setIngredients] = useState<Array<{herb: string, dosage: string}>>([{herb: '', dosage: ''}]);
  const [dosage, setDosage] = useState<string[]>(['']);
  const [preparation, setPreparation] = useState<string[]>(['']);
  const [administration, setAdministration] = useState<string[]>(['']);
  
  // Clinical Use
  const [tcmActions, setTcmActions] = useState<string[]>(['']);
  const [clinicalManifestations, setClinicalManifestations] = useState<string[]>(['']);
  const [clinicalApplications, setClinicalApplications] = useState<string[]>(['']);
  
  // Modifications
  const [modifications, setModifications] = useState<Array<{
    pattern: string;
    add: string[];
    remove: string[];
  }>>([{ pattern: '', add: [], remove: [] }]);
  
  // Safety & Alerts
  const [contraindications, setContraindications] = useState<string[]>(['']);
  const [cautions, setCautions] = useState<string[]>(['']);
  const [drugInteractions, setDrugInteractions] = useState<string[]>(['']);
  const [herbInteractions, setHerbInteractions] = useState<string[]>(['']);
  const [toxicology, setToxicology] = useState<string[]>(['']);

  // Pre-fill form when editing
  useEffect(() => {
    if (editingFormula) {
      setPinyinName(editingFormula.pinyin_name || '');
      setHanziName(editingFormula.hanzi_name || '');
      setPharmaceuticalName(editingFormula.translated_name || '');
      setAlternativeNames(editingFormula.alternative_names?.join(', ') || '');
      setSource(editingFormula.source || '');
      setThermalAction(editingFormula.thermal_action || '');
      setCategory(editingFormula.category || '');
      setSubcategory(editingFormula.subcategory || '');

      // Composition
      const formattedIngredients = editingFormula.composition?.map(comp => ({
        herb: typeof comp === 'string' ? comp : comp.herb_pinyin || '',
        dosage: typeof comp === 'string' ? '' : comp.dosage || ''
      })) || [];
      setIngredients(formattedIngredients.length > 0 ? formattedIngredients : [{herb: '', dosage: ''}]);

      setDosage(editingFormula.dosage && editingFormula.dosage.length > 0 ? editingFormula.dosage : ['']);
      setPreparation(editingFormula.preparation && editingFormula.preparation.length > 0 ? editingFormula.preparation : ['']);
      setAdministration(editingFormula.administration && editingFormula.administration.length > 0 ? editingFormula.administration : ['']);

      // Clinical Use
      setTcmActions(editingFormula.tcm_actions && editingFormula.tcm_actions.length > 0 ? editingFormula.tcm_actions : ['']);
      setClinicalManifestations(editingFormula.clinical_manifestations && editingFormula.clinical_manifestations.length > 0 ? editingFormula.clinical_manifestations : ['']);

      const formattedClinicalApps = editingFormula.clinical_applications?.map(app =>
        typeof app === 'string' ? app : (app.condition + (app.pattern ? ` • ${app.pattern}` : ''))
      ) || [];
      setClinicalApplications(formattedClinicalApps.length > 0 ? formattedClinicalApps : ['']);

      // Modifications
      const formattedMods = editingFormula.modifications?.map(mod => ({
        pattern: mod.pattern || '',
        add: mod.add || [],
        remove: mod.remove || []
      })) || [];
      setModifications(formattedMods.length > 0 ? formattedMods : [{ pattern: '', add: [], remove: [] }]);

      // Safety
      setContraindications(editingFormula.contraindications && editingFormula.contraindications.length > 0 ? editingFormula.contraindications : ['']);
      setCautions(editingFormula.cautions && editingFormula.cautions.length > 0 ? editingFormula.cautions : ['']);
      setDrugInteractions(editingFormula.drug_interactions && editingFormula.drug_interactions.length > 0 ? editingFormula.drug_interactions : ['']);
      setHerbInteractions(editingFormula.herb_interactions && editingFormula.herb_interactions.length > 0 ? editingFormula.herb_interactions : ['']);
      setToxicology(editingFormula.toxicology && editingFormula.toxicology.length > 0 ? editingFormula.toxicology : ['']);
    } else {
      resetForm();
    }
  }, [editingFormula, isOpen]);

  const addField = (arr: string[], setArr: (val: string[]) => void) => {
    setArr([...arr, '']);
  };

  const removeField = (arr: string[], setArr: (val: string[]) => void, index: number) => {
    setArr(arr.filter((_, i) => i !== index));
  };

  const updateField = (arr: string[], setArr: (val: string[]) => void, index: number, value: string) => {
    const newArr = [...arr];
    newArr[index] = value;
    setArr(newArr);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, {herb: '', dosage: ''}]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: 'herb' | 'dosage', value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index][field] = value;
    setIngredients(newIngredients);
  };

  // Modifications helpers
  const addModification = () => {
    setModifications([...modifications, { pattern: '', add: [], remove: [] }]);
  };

  const removeModification = (index: number) => {
    setModifications(modifications.filter((_, i) => i !== index));
  };

  const updateModificationPattern = (index: number, value: string) => {
    const newMods = [...modifications];
    newMods[index].pattern = value;
    setModifications(newMods);
  };

  const toggleAddItem = (modIndex: number, itemName: string) => {
    const newMods = [...modifications];
    const currentItems = newMods[modIndex].add;
    if (currentItems.includes(itemName)) {
      newMods[modIndex].add = currentItems.filter(h => h !== itemName);
    } else {
      newMods[modIndex].add = [...currentItems, itemName];
    }
    setModifications(newMods);
  };

  const toggleRemoveItem = (modIndex: number, itemName: string) => {
    const newMods = [...modifications];
    const currentItems = newMods[modIndex].remove;
    if (currentItems.includes(itemName)) {
      newMods[modIndex].remove = currentItems.filter(h => h !== itemName);
    } else {
      newMods[modIndex].remove = [...currentItems, itemName];
    }
    setModifications(newMods);
  };

  const resetForm = () => {
    setPinyinName('');
    setHanziName('');
    setPharmaceuticalName('');
    setAlternativeNames('');
    setSource('');
    setThermalAction('');
    setCategory('');
    setSubcategory('');
    setIngredients([{herb: '', dosage: ''}]);
    setDosage(['']);
    setPreparation(['']);
    setAdministration(['']);
    setTcmActions(['']);
    setClinicalManifestations(['']);
    setClinicalApplications(['']);
    setModifications([{ pattern: '', add: [], remove: [] }]);
    setContraindications(['']);
    setCautions(['']);
    setDrugInteractions(['']);
    setHerbInteractions(['']);
    setToxicology(['']);
  };

  const handleSave = async () => {
    if (!pinyinName.trim()) {
      toast.error('Please enter a pinyin name');
      return;
    }

    const filterEmpty = (arr: string[]) => arr.filter(item => item.trim());

    // Get current user info for createdBy field
    let createdBy: { userId: string; userName: string; userEmail: string } | undefined;
    try {
      const userProfile = localStorage.getItem('userProfile');
      if (userProfile) {
        const profile = JSON.parse(userProfile);
        createdBy = {
          userId: profile.email,
          userName: `${profile.firstName} ${profile.lastName}`.trim() || profile.email,
          userEmail: profile.email
        };
      } else {
        // Fallback to userRole if no profile
        const userRole = localStorage.getItem('user_role');
        createdBy = {
          userId: userRole || 'unknown',
          userName: userRole === 'admin' ? 'Admin User' : 'User',
          userEmail: ''
        };
      }
    } catch (error) {
      console.error('Error getting user info:', error);
      // Default createdBy
      createdBy = {
        userId: 'unknown',
        userName: 'Unknown User',
        userEmail: ''
      };
    }

    const formulaData: Formula = {
      formula_id: editingFormula?.formula_id || `F${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      pinyin_name: pinyinName.trim(),
      hanzi_name: hanziName.trim(),
      translated_name: pharmaceuticalName.trim(),
      alternative_names: alternativeNames ? alternativeNames.split(',').map(n => n.trim()).filter(n => n) : [],
      category: category.trim(),
      subcategory: subcategory.trim(),
      source: source.trim(),
      thermal_action: thermalAction || undefined,
      composition: ingredients.map(ing => ({
        herb_pinyin: ing.herb.trim(),
        pharmaceutical_name: '',
        dosage: ing.dosage.trim()
      })),
      dosage: filterEmpty(dosage),
      preparation: filterEmpty(preparation),
      administration: filterEmpty(administration),
      tcm_actions: filterEmpty(tcmActions),
      clinical_manifestations: filterEmpty(clinicalManifestations),
      clinical_applications: filterEmpty(clinicalApplications),
      modifications: modifications
        .filter(mod => mod.pattern.trim() || mod.add.length > 0 || mod.remove.length > 0)
        .map(mod => ({
          pattern: mod.pattern.trim(),
          add: mod.add.map(h => h.trim()).filter(h => h),
          remove: mod.remove.map(h => h.trim()).filter(h => h)
        })),
      contraindications: filterEmpty(contraindications),
      cautions: filterEmpty(cautions),
      drug_interactions: filterEmpty(drugInteractions),
      herb_interactions: filterEmpty(herbInteractions),
      toxicology: filterEmpty(toxicology),
      pharmacological_effects: editingFormula?.pharmacological_effects || [],
      biological_mechanisms: editingFormula?.biological_mechanisms || [],
      bioactive_compounds: editingFormula?.bioactive_compounds || [],
      detoxification: editingFormula?.detoxification || [],
      clinical_studies_and_research: editingFormula?.clinical_studies_and_research || [],
      allergens: editingFormula?.allergens || [],
      notes: editingFormula?.notes || [],
      reference: editingFormula?.reference || [],
      createdBy: editingFormula?.createdBy || createdBy,
      createdAt: editingFormula?.createdAt || new Date().toISOString()
    };

    if (editingFormula) {
      await updateFormula(editingFormula.formula_id, formulaData);
      toast.success('Formula updated successfully!');
    } else {
      await addFormula(formulaData);
      toast.success('Formula created successfully!');
    }
    resetForm();
    onClose();
    if (onSuccess) onSuccess();
  };

  const sections = [
    { id: 'basic', label: 'Basic info' },
    { id: 'composition', label: 'Composition' },
    { id: 'clinical-use', label: 'Clinical use' },
    { id: 'modifications', label: 'Modifications' },
    { id: 'safety', label: 'Safety & alerts' }
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(`modal-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[70]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white sm:rounded-lg sm:max-w-4xl w-full sm:max-h-[90vh] overflow-hidden z-[80] flex flex-col rounded-t-2xl sm:rounded-b-lg">
          <Dialog.Description className="sr-only">
            Create a new formula with basic information, composition, clinical use, modifications, and safety alerts
          </Dialog.Description>
          <div className="flex flex-col h-full sm:max-h-[90vh]">
            {/* Header */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <Dialog.Title className="text-lg sm:text-2xl font-bold text-gray-900">
                  {editingFormula ? 'Edit Formula' : 'New Formula'}
                </Dialog.Title>
                <div className="flex items-center gap-2">
                  <Dialog.Close className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg flex items-center justify-center">
                    <X className="w-5 h-5" />
                  </Dialog.Close>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6 min-h-0">
              {/* Basic Info */}
              <section id="modal-basic" className="mb-8 scroll-mt-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Basic information</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pinyin Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={pinyinName}
                      onChange={(e) => setPinyinName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., Gui Zhi Tang"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Hanzi Name
                    </label>
                    <input
                      type="text"
                      value={hanziName}
                      onChange={(e) => setHanziName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., 桂枝汤"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pharmaceutical Name
                    </label>
                    <input
                      type="text"
                      value={pharmaceuticalName}
                      onChange={(e) => setPharmaceuticalName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., Cinnamon Twig Decoction"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Alternative Names
                    </label>
                    <input
                      type="text"
                      value={alternativeNames}
                      onChange={(e) => setAlternativeNames(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., Cinnamon Branch Formula, Ramulus Cinnamomi Decoction"
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate multiple names with commas</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Source
                    </label>
                    <input
                      type="text"
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., Shang Han Lun"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Thermal Action
                    </label>
                    <ThermalActionSelector
                      value={thermalAction}
                      onChange={(value) => setThermalAction(value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., Cardiovascular"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subcategory
                    </label>
                    <input
                      type="text"
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., Hypertension"
                    />
                  </div>
                </div>
              </section>

              <div className="border-t border-gray-300 my-8"></div>

              {/* Composition */}
              <section id="modal-composition" className="mb-8 scroll-mt-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Composition</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Ingredients
                    </label>
                    <div className="space-y-3 mb-4">
                      {ingredients.map((ingredient, index) => {
                        const excludedIngredients = ingredients
                          .filter((_, i) => i !== index)
                          .map(ing => ing.herb)
                          .filter(herb => herb.trim() !== '');
                        
                        return (
                          <div key={index} className="flex gap-2">
                            <div className="flex-1">
                              <IngredientSelector
                                herbs={herbsData}
                                formulas={formulasData}
                                value={ingredient.herb}
                                onChange={(value) => updateIngredient(index, 'herb', value)}
                                placeholder="Select or type herb/formula name..."
                                excludeIngredients={excludedIngredients}
                              />
                            </div>
                            <input
                              type="text"
                              value={ingredient.dosage}
                              onChange={(e) => updateIngredient(index, 'dosage', e.target.value)}
                              className="w-16 sm:w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                              placeholder="9g"
                            />
                            {ingredients.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeIngredient(index)}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={addIngredient}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      + Add ingredient
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Dosage Instructions
                    </label>
                    {dosage.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateField(dosage, setDosage, index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter dosage instruction..."
                        />
                        {dosage.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeField(dosage, setDosage, index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addField(dosage, setDosage)}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      + Add dosage instruction
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Preparation
                    </label>
                    {preparation.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateField(preparation, setPreparation, index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter preparation method..."
                        />
                        {preparation.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeField(preparation, setPreparation, index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addField(preparation, setPreparation)}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      + Add preparation method
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Administration
                    </label>
                    {administration.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateField(administration, setAdministration, index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter administration method..."
                        />
                        {administration.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeField(administration, setAdministration, index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addField(administration, setAdministration)}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      + Add administration method
                    </button>
                  </div>
                </div>
              </section>

              <div className="border-t border-gray-300 my-8"></div>

              {/* Clinical Use */}
              <section id="modal-clinical-use" className="mb-8 scroll-mt-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Clinical use</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      TCM Actions
                    </label>
                    {tcmActions.map((action, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={action}
                          onChange={(e) => updateField(tcmActions, setTcmActions, index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter TCM action..."
                        />
                        {tcmActions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeField(tcmActions, setTcmActions, index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addField(tcmActions, setTcmActions)}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      + Add action
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Clinical Manifestations
                    </label>
                    {clinicalManifestations.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateField(clinicalManifestations, setClinicalManifestations, index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter clinical manifestation..."
                        />
                        {clinicalManifestations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeField(clinicalManifestations, setClinicalManifestations, index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addField(clinicalManifestations, setClinicalManifestations)}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      + Add manifestation
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Clinical Applications
                    </label>
                    {clinicalApplications.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateField(clinicalApplications, setClinicalApplications, index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter clinical application..."
                        />
                        {clinicalApplications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeField(clinicalApplications, setClinicalApplications, index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addField(clinicalApplications, setClinicalApplications)}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      + Add application
                    </button>
                  </div>
                </div>
              </section>

              <div className="border-t border-gray-300 my-8"></div>

              {/* Modifications */}
              <section id="modal-modifications" className="mb-8 scroll-mt-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Modifications</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-6">
                  {modifications.map((modification, modIndex) => (
                    <div key={modIndex} className="border border-gray-200 rounded-lg p-4 space-y-4">
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={modification.pattern}
                          onChange={(e) => updateModificationPattern(modIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="For internal heat signs..."
                        />
                        {modifications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeModification(modIndex)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <HerbChipSelector
                        herbs={herbsData}
                        selectedHerbs={modification.add}
                        onToggleHerb={(herbName) => toggleAddItem(modIndex, herbName)}
                        chipColor="green"
                        label="Add (herbs/formulas)"
                        items={[
                          ...herbsData.map(h => ({ id: h.herb_id, name: h.pinyin_name })),
                          ...formulasData.map(f => ({ id: f.formula_id, name: f.pinyin_name }))
                        ]}
                      />

                      <HerbChipSelector
                        herbs={herbsData}
                        selectedHerbs={modification.remove}
                        onToggleHerb={(herbName) => toggleRemoveItem(modIndex, herbName)}
                        chipColor="red"
                        label="Remove (herbs/formulas)"
                        allowCustomInput={false}
                        items={[
                          ...herbsData
                            .filter(h => ingredients.some(ing => ing.herb === h.pinyin_name))
                            .map(h => ({ id: h.herb_id, name: h.pinyin_name })),
                          ...formulasData
                            .filter(f => ingredients.some(ing => ing.herb === f.pinyin_name))
                            .map(f => ({ id: f.formula_id, name: f.pinyin_name }))
                        ]}
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addModification}
                    className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                  >
                    + Add modification
                  </button>
                </div>
              </section>

              <div className="border-t border-gray-300 my-8"></div>

              {/* Safety & Alerts */}
              <section id="modal-safety" className="mb-8 scroll-mt-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Safety & alerts</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contraindications
                    </label>
                    {contraindications.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateField(contraindications, setContraindications, index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter contraindication..."
                        />
                        {contraindications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeField(contraindications, setContraindications, index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addField(contraindications, setContraindications)}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      + Add contraindication
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Cautions
                    </label>
                    {cautions.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateField(cautions, setCautions, index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter caution..."
                        />
                        {cautions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeField(cautions, setCautions, index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addField(cautions, setCautions)}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      + Add caution
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Drug Interactions
                    </label>
                    {drugInteractions.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateField(drugInteractions, setDrugInteractions, index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter drug interaction..."
                        />
                        {drugInteractions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeField(drugInteractions, setDrugInteractions, index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addField(drugInteractions, setDrugInteractions)}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      + Add drug interaction
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Herb Interactions
                    </label>
                    {herbInteractions.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateField(herbInteractions, setHerbInteractions, index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter herb interaction..."
                        />
                        {herbInteractions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeField(herbInteractions, setHerbInteractions, index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addField(herbInteractions, setHerbInteractions)}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      + Add herb interaction
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Toxicology
                    </label>
                    {toxicology.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateField(toxicology, setToxicology, index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter toxicology note..."
                        />
                        {toxicology.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeField(toxicology, setToxicology, index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addField(toxicology, setToxicology)}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      + Add toxicology note
                    </button>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer with Buttons */}
            <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-4 py-4">
              <div className="flex items-center gap-2">
                <Dialog.Close asChild>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg bg-white hover:bg-gray-50 transition-colors font-medium">
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}