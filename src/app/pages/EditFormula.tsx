import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { getAllHerbs } from '@/app/data/herbsManager';
import { updateFormula, getAllFormulas } from '@/app/data/formulasManager';
import { Formula } from '@/app/data/formulas';
import { useSwipeBack } from '../hooks/useSwipeBack';
import { ThermalActionSelector } from '@/app/components/ui/ThermalActionSelector';

export default function EditFormula() {
  const navigate = useNavigate();
  const { formulaId } = useParams();
  
  // Enable swipe-to-go-back gesture on mobile
  useSwipeBack();
  
  const herbsData = getAllHerbs();
  
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
    explanation: string;
    add_herbs: string[];
    remove_herbs: string[];
  }>>([{ explanation: '', add_herbs: [], remove_herbs: [] }]);

  // Safety & Alerts
  const [contraindications, setContraindications] = useState<string[]>(['']);
  const [cautions, setCautions] = useState<string[]>(['']);
  const [drugInteractions, setDrugInteractions] = useState<string[]>(['']);
  const [herbInteractions, setHerbInteractions] = useState<string[]>(['']);
  const [toxicology, setToxicology] = useState<string[]>(['']);

  const [herbSuggestions, setHerbSuggestions] = useState<string[]>([]);
  const [activeIngredientIndex, setActiveIngredientIndex] = useState<number | null>(null);

  // Load formula data
  useEffect(() => {
    if (!formulaId) {
      navigate('/formulas');
      return;
    }

    const formulas = getAllFormulas();
    const formula = formulas.find(f => f.formula_id === decodeURIComponent(formulaId));

    if (!formula) {
      toast.error('Formula not found');
      navigate('/formulas');
      return;
    }

    // Set all fields
    setPinyinName(formula.pinyin_name);
    setHanziName(formula.hanzi_name || '');
    setPharmaceuticalName(formula.translated_name || '');
    setAlternativeNames(formula.alternative_names?.join(', ') || '');
    setSource(formula.source || '');
    setThermalAction(formula.thermal_action || '');
    setCategory(formula.category || '');
    setSubcategory(formula.subcategory || '');

    // Parse composition back into ingredients with dosages
    const parsedIngredients = formula.composition.map(comp => {
      if (typeof comp === 'object') {
        return { herb: comp.herb_pinyin, dosage: comp.dosage };
      }
      // Fallback for old string format
      const parts = comp.split(' ');
      if (parts.length > 1) {
        const dosage = parts[parts.length - 1];
        const herb = parts.slice(0, -1).join(' ');
        return { herb, dosage };
      }
      return { herb: comp, dosage: '' };
    });
    setIngredients(parsedIngredients.length > 0 ? parsedIngredients : [{herb: '', dosage: ''}]);

    setDosage(formula.dosage.length > 0 ? formula.dosage : ['']);
    setPreparation(formula.preparation.length > 0 ? formula.preparation : ['']);
    setAdministration(formula.administration.length > 0 ? formula.administration : ['']);
    setTcmActions(formula.tcm_actions.length > 0 ? formula.tcm_actions : ['']);
    setClinicalManifestations(formula.clinical_manifestations.length > 0 ? formula.clinical_manifestations : ['']);
    setClinicalApplications(formula.clinical_applications.length > 0 ? formula.clinical_applications : ['']);
    
    // Parse modifications - support both old (string[]) and new (object[]) formats
    if (formula.modifications && formula.modifications.length > 0) {
      const firstMod = formula.modifications[0];
      if (typeof firstMod === 'string') {
        // Old format: convert to new format
        setModifications(formula.modifications.map(mod => ({
          explanation: mod,
          add_herbs: [],
          remove_herbs: []
        })));
      } else {
        // New format: use as is
        setModifications(formula.modifications);
      }
    } else {
      setModifications([{ explanation: '', add_herbs: [], remove_herbs: [] }]);
    }
    
    setContraindications(formula.contraindications.length > 0 ? formula.contraindications : ['']);
    setCautions(formula.cautions.length > 0 ? formula.cautions : ['']);
    setDrugInteractions(formula.drug_interactions.length > 0 ? formula.drug_interactions : ['']);
    setHerbInteractions(formula.herb_interactions.length > 0 ? formula.herb_interactions : ['']);
    setToxicology(formula.toxicology.length > 0 ? formula.toxicology : ['']);
  }, [formulaId, navigate]);

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

    if (field === 'herb') {
      if (value.length > 0) {
        const suggestions = herbsData
          .filter(h => h.pinyin_name.toLowerCase().includes(value.toLowerCase()))
          .map(h => h.pinyin_name)
          .slice(0, 5);
        setHerbSuggestions(suggestions);
        setActiveIngredientIndex(index);
      } else {
        setHerbSuggestions([]);
        setActiveIngredientIndex(null);
      }
    }
  };

  const selectHerbSuggestion = (index: number, herbName: string) => {
    updateIngredient(index, 'herb', herbName);
    setHerbSuggestions([]);
    setActiveIngredientIndex(null);
  };

  // Modifications helpers
  const addModification = () => {
    setModifications([...modifications, { explanation: '', add_herbs: [], remove_herbs: [] }]);
  };

  const removeModification = (index: number) => {
    setModifications(modifications.filter((_, i) => i !== index));
  };

  const updateModificationExplanation = (index: number, value: string) => {
    const newMods = [...modifications];
    newMods[index].explanation = value;
    setModifications(newMods);
  };

  const toggleAddHerb = (modIndex: number, herbName: string) => {
    const newMods = [...modifications];
    const currentHerbs = newMods[modIndex].add_herbs;
    if (currentHerbs.includes(herbName)) {
      newMods[modIndex].add_herbs = currentHerbs.filter(h => h !== herbName);
    } else {
      newMods[modIndex].add_herbs = [...currentHerbs, herbName];
    }
    setModifications(newMods);
  };

  const toggleRemoveHerb = (modIndex: number, herbName: string) => {
    const newMods = [...modifications];
    const currentHerbs = newMods[modIndex].remove_herbs;
    if (currentHerbs.includes(herbName)) {
      newMods[modIndex].remove_herbs = currentHerbs.filter(h => h !== herbName);
    } else {
      newMods[modIndex].remove_herbs = [...currentHerbs, herbName];
    }
    setModifications(newMods);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pinyinName) {
      toast.error('Please fill in at least the Pinyin name');
      return;
    }

    // Filter out empty values from arrays
    const filterEmpty = (arr: string[]) => arr.filter(item => item.trim() !== '');
    
    // Format composition with dosages in new object format
    const composition = ingredients
      .filter(ing => ing.herb.trim() !== '')
      .map(ing => ({
        herb_pinyin: ing.herb,
        pharmaceutical_name: '', // User will need to fill this in via JSON editor if needed
        dosage: ing.dosage || ''
      }));

    const updatedFormula: Formula = {
      formula_id: formulaId!,
      pinyin_name: pinyinName,
      hanzi_name: hanziName || '',
      translated_name: pharmaceuticalName || '',
      alternative_names: alternativeNames.split(',').map(name => name.trim()).filter(name => name.length > 0),
      category: category || '',
      subcategory: subcategory || '',
      source: source || '',
      thermal_action: thermalAction || undefined,
      composition: composition,
      dosage: filterEmpty(dosage),
      preparation: filterEmpty(preparation),
      administration: filterEmpty(administration),
      tcm_actions: filterEmpty(tcmActions),
      clinical_manifestations: filterEmpty(clinicalManifestations),
      clinical_applications: filterEmpty(clinicalApplications),
      modifications: modifications
        .filter(mod => mod.explanation.trim() || mod.add_herbs.length > 0 || mod.remove_herbs.length > 0)
        .map(mod => ({
          explanation: mod.explanation.trim(),
          add_herbs: mod.add_herbs.map(h => h.trim()).filter(h => h),
          remove_herbs: mod.remove_herbs.map(h => h.trim()).filter(h => h)
        })),
      pharmacological_effects: [],
      biological_mechanisms: [],
      bioactive_compounds: [],
      detoxification: [],
      clinical_studies_and_research: [],
      drug_interactions: filterEmpty(drugInteractions),
      herb_interactions: filterEmpty(herbInteractions),
      allergens: [],
      cautions: filterEmpty(cautions),
      contraindications: filterEmpty(contraindications),
      toxicology: filterEmpty(toxicology),
      notes: [],
      reference: []
    };

    updateFormula(formulaId!, updatedFormula);
    toast.success('Formula updated successfully!');
    navigate(`/formulas/${encodeURIComponent(formulaId!)}`);
  };

  const sections = [
    { id: 'basic', label: 'Basic info' },
    { id: 'composition', label: 'Composition' },
    { id: 'clinical-use', label: 'Clinical use' },
    { id: 'modifications', label: 'Modifications' },
    { id: 'safety', label: 'Safety & alerts' }
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="max-w-5xl mx-auto p-2 sm:p-4">
      <Link 
        to={`/formulas/${encodeURIComponent(formulaId!)}`} 
        className="h-10 w-10 sm:w-11 sm:h-11 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
        title="Back to Formula"
      >
        <ChevronLeft className="w-5 h-5" />
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Formula</h1>
        <p className="hidden sm:block text-gray-600">Update the information below</p>
      </div>

      {/* Jump labels */}
      <div className="flex overflow-x-auto items-center gap-3 mb-8 pb-6 border-b border-gray-200">
        {sections.flatMap((section, index) => {
          const button = (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className="px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors whitespace-nowrap flex-shrink-0"
            >
              {section.label}
            </button>
          );
          
          if (index === 0) {
            return [button];
          }
          
          return [
            <div key={`sep-${section.id}`} className="w-px h-6 bg-gray-300 flex-shrink-0"></div>,
            button
          ];
        })}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <section id="basic" className="mb-12 scroll-mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic information</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hanzi Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={hanziName}
                onChange={(e) => setHanziName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., 桂枝汤"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alternative Names
              </label>
              <input
                type="text"
                value={alternativeNames}
                onChange={(e) => setAlternativeNames(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., Cinnamon Branch Formula, Ramulus Cinnamomi Decoction (comma-separated)"
              />
              <p className="text-xs text-gray-500 mt-1">Separate multiple names with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thermal Action
              </label>
              <ThermalActionSelector
                value={thermalAction}
                onChange={(value) => setThermalAction(value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

        <div className="border-t border-gray-300 my-12"></div>

        {/* Composition */}
        <section id="composition" className="mb-12 scroll-mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Composition</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredients
              </label>
              {ingredients.map((ingredient, index) => (
                <div key={index} className="relative mb-2">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={ingredient.herb}
                        onChange={(e) => updateIngredient(index, 'herb', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Herb name..."
                      />
                      {herbSuggestions.length > 0 && activeIngredientIndex === index && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {herbSuggestions.map((suggestion, sIndex) => (
                            <div
                              key={sIndex}
                              onClick={() => selectHerbSuggestion(index, suggestion)}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      value={ingredient.dosage}
                      onChange={(e) => updateIngredient(index, 'dosage', e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                </div>
              ))}
              <button
                type="button"
                onClick={addIngredient}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                + Add ingredient
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

        <div className="border-t border-gray-300 my-12"></div>

        {/* Clinical Use */}
        <section id="clinical-use" className="mb-12 scroll-mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Clinical use</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

        <div className="border-t border-gray-300 my-12"></div>

        {/* Modifications */}
        <section id="modifications" className="mb-12 scroll-mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Modifications</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            {modifications.map((modification, modIndex) => (
              <div key={modIndex} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex gap-2">
                  <textarea
                    value={modification.explanation}
                    onChange={(e) => updateModificationExplanation(modIndex, e.target.value)}
                    rows={2}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="For internal heat signs..."
                  />
                  {modifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeModification(modIndex)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors self-start"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Add herbs (green chips)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {modification.add_herbs.map((herb, herbIdx) => (
                      <button
                        key={herbIdx}
                        type="button"
                        onClick={() => toggleAddHerb(modIndex, herb)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-lg text-xs font-medium hover:bg-green-200 transition-colors border border-green-300"
                      >
                        {herb}
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        toggleAddHerb(modIndex, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  >
                    <option value="">Select herb to add...</option>
                    {herbsData
                      .filter(h => !modification.add_herbs.includes(h.pinyin_name))
                      .map(h => (
                        <option key={h.herb_id} value={h.pinyin_name}>
                          {h.pinyin_name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remove herbs (red chips)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {modification.remove_herbs.map((herb, herbIdx) => (
                      <button
                        key={herbIdx}
                        type="button"
                        onClick={() => toggleRemoveHerb(modIndex, herb)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-800 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors border border-red-300"
                      >
                        {herb}
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        toggleRemoveHerb(modIndex, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
                  >
                    <option value="">Select herb to remove...</option>
                    {herbsData
                      .filter(h => !modification.remove_herbs.includes(h.pinyin_name))
                      .map(h => (
                        <option key={h.herb_id} value={h.pinyin_name}>
                          {h.pinyin_name}
                        </option>
                      ))}
                  </select>
                </div>
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

        <div className="border-t border-gray-300 my-12"></div>

        {/* Submit buttons */}
        <div className="flex gap-3 justify-end sticky bottom-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
          <Link
            to={`/formulas/${encodeURIComponent(formulaId!)}`}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Update Formula
          </button>
        </div>
      </form>
    </div>
  );
}