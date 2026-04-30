/**
 * Admin Edit Formula Page
 * Edit formula information with the same design as NewFormula
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { useSwipeBack } from '../hooks/useSwipeBack';

// Mock data - would come from a database
const mockFormulasData = {
  f1: {
    id: 'f1',
    formula: 'Si Jun Zi Tang',
    literal_name: 'Four Gentlemen Decoction',
    source: 'Tai Ping Hui Min He Ji Ju Fang (1078-1085)',
    ingredients: [
      { herb: 'Ren Shen', dosage: '9g' },
      { herb: 'Bai Zhu', dosage: '9g' },
      { herb: 'Fu Ling', dosage: '9g' },
      { herb: 'Gan Cao', dosage: '6g' },
    ],
    preparation: ['Decoction'],
    administration: ['Drink warm'],
    tcm_actions: ['Tonifies Qi', 'Strengthens Spleen and Stomach'],
    clinical_manifestations: ['Pale complexion', 'Low and soft voice', 'Reduced appetite'],
    clinical_applications: ['Chronic gastritis', 'Gastric and duodenal ulcers'],
    modifications: ['For significant qi deficiency: increase Ren Shen dosage'],
    contraindications: ['Yin deficiency with heat'],
    cautions: [],
  },
  f2: {
    id: 'f2',
    formula: 'Liu Wei Di Huang Wan',
    literal_name: 'Six Ingredient Pill with Rehmannia',
    source: 'Xiao Er Yao Zheng Zhi Jue (1119)',
    ingredients: [
      { herb: 'Shu Di Huang', dosage: '24g' },
      { herb: 'Shan Zhu Yu', dosage: '12g' },
      { herb: 'Shan Yao', dosage: '12g' },
      { herb: 'Fu Ling', dosage: '9g' },
      { herb: 'Ze Xie', dosage: '9g' },
      { herb: 'Mu Dan Pi', dosage: '9g' },
    ],
    preparation: ['Pill or decoction'],
    administration: ['Take with warm water'],
    tcm_actions: ['Nourishes Kidney and Liver Yin'],
    clinical_manifestations: ['Soreness and weakness of lower back', 'Dizziness', 'Tinnitus'],
    clinical_applications: ['Chronic nephritis', 'Diabetes mellitus', 'Hypertension'],
    modifications: ['For eye problems: add Gou Qi Zi and Ju Hua'],
    contraindications: ['Spleen deficiency with dampness'],
    cautions: ['May cause loose stools in some patients'],
  },
  f3: {
    id: 'f3',
    formula: 'Xiao Yao San',
    literal_name: 'Free and Easy Wanderer Powder',
    source: 'Tai Ping Hui Min He Ji Ju Fang (1078-1085)',
    ingredients: [
      { herb: 'Chai Hu', dosage: '9g' },
      { herb: 'Dang Gui', dosage: '9g' },
      { herb: 'Bai Shao', dosage: '9g' },
      { herb: 'Bai Zhu', dosage: '9g' },
      { herb: 'Fu Ling', dosage: '9g' },
      { herb: 'Gan Cao', dosage: '6g' },
      { herb: 'Sheng Jiang', dosage: '3g' },
      { herb: 'Bo He', dosage: '3g' },
    ],
    preparation: ['Decoction'],
    administration: ['Drink warm between meals'],
    tcm_actions: ['Spreads Liver Qi', 'Strengthens Spleen', 'Nourishes Blood'],
    clinical_manifestations: ['Hypochondriac pain', 'Headache', 'Dizziness', 'Irregular menstruation'],
    clinical_applications: ['Chronic hepatitis', 'Premenstrual syndrome', 'Depression'],
    modifications: ['For heat signs: add Mu Dan Pi and Zhi Zi (Jia Wei Xiao Yao San)'],
    contraindications: ['Liver Yang rising'],
    cautions: [],
  },
  f4: {
    id: 'f4',
    formula: 'Bu Zhong Yi Qi Tang',
    literal_name: 'Tonify the Middle and Augment the Qi Decoction',
    source: 'Pi Wei Lun (1249)',
    ingredients: [
      { herb: 'Huang Qi', dosage: '15g' },
      { herb: 'Ren Shen', dosage: '9g' },
      { herb: 'Bai Zhu', dosage: '9g' },
      { herb: 'Dang Gui', dosage: '6g' },
      { herb: 'Chen Pi', dosage: '6g' },
      { herb: 'Sheng Ma', dosage: '3g' },
      { herb: 'Chai Hu', dosage: '3g' },
      { herb: 'Gan Cao', dosage: '6g' },
    ],
    preparation: ['Decoction'],
    administration: ['Drink warm'],
    tcm_actions: ['Tonifies Middle Jiao Qi', 'Raises Yang', 'Lifts sunken Qi'],
    clinical_manifestations: ['Fatigue', 'Organ prolapse', 'Shortness of breath'],
    clinical_applications: ['Chronic diarrhea', 'Uterine prolapse', 'Chronic fatigue syndrome'],
    modifications: ['For severe prolapse: increase Sheng Ma and add Huang Jing'],
    contraindications: ['Excess conditions'],
    cautions: [],
  },
  uf1: {
    id: 'uf1',
    formula: 'Modified Si Jun Zi Tang',
    literal_name: 'Modified Four Gentlemen Decoction',
    source: 'Custom modification',
    ingredients: [
      { herb: 'Ren Shen', dosage: '9g' },
      { herb: 'Bai Zhu', dosage: '12g' },
      { herb: 'Fu Ling', dosage: '9g' },
      { herb: 'Gan Cao', dosage: '6g' },
      { herb: 'Chen Pi', dosage: '6g' },
    ],
    preparation: ['Decoction'],
    administration: ['Drink warm before meals'],
    tcm_actions: ['Tonifies Qi with enhanced digestive support'],
    clinical_manifestations: ['Poor digestion', 'Weak appetite', 'Bloating'],
    clinical_applications: ['Chronic digestive weakness'],
    modifications: [],
    contraindications: ['Heat patterns'],
    cautions: [],
  },
  uf2: {
    id: 'uf2',
    formula: 'Custom Liver Support',
    literal_name: 'Custom Hepatic Support Formula',
    source: 'Personal formulation',
    ingredients: [
      { herb: 'Chai Hu', dosage: '9g' },
      { herb: 'Bai Shao', dosage: '9g' },
      { herb: 'Mu Dan Pi', dosage: '9g' },
      { herb: 'Zhi Zi', dosage: '6g' },
    ],
    preparation: ['Decoction'],
    administration: ['Drink warm'],
    tcm_actions: ['Soothes Liver', 'Clears heat'],
    clinical_manifestations: ['Irritability', 'Red eyes', 'Bitter taste'],
    clinical_applications: ['Liver Qi stagnation with heat'],
    modifications: [],
    contraindications: ['Spleen deficiency'],
    cautions: [],
  },
  uf3: {
    id: 'uf3',
    formula: 'Digestive Support Formula',
    literal_name: 'Custom Digestive Support',
    source: 'Clinical experience',
    ingredients: [
      { herb: 'Bai Zhu', dosage: '9g' },
      { herb: 'Fu Ling', dosage: '9g' },
      { herb: 'Chen Pi', dosage: '6g' },
      { herb: 'Shan Zha', dosage: '9g' },
    ],
    preparation: ['Decoction'],
    administration: ['Drink after meals'],
    tcm_actions: ['Strengthens digestion', 'Regulates Qi', 'Resolves food stagnation'],
    clinical_manifestations: ['Food stagnation', 'Bloating', 'Poor appetite'],
    clinical_applications: ['Chronic digestive issues'],
    modifications: [],
    contraindications: ['Yin deficiency'],
    cautions: [],
  },
};

export default function AdminEditFormula() {
  const { formulaId } = useParams<{ formulaId: string }>();
  const navigate = useNavigate();
  
  // Enable swipe-to-go-back gesture on mobile
  useSwipeBack();
  
  // Basic info
  const [formulaIdDisplay, setFormulaIdDisplay] = useState('');
  const [pinyinName, setPinyinName] = useState('');
  const [hanziName, setHanziName] = useState('');
  const [pharmaceuticalName, setPharmaceuticalName] = useState('');
  const [alternativeNames, setAlternativeNames] = useState('');
  const [source, setSource] = useState('');
  
  // Composition
  const [ingredients, setIngredients] = useState<Array<{herb: string, dosage: string}>>([{herb: '', dosage: ''}]);
  const [preparation, setPreparation] = useState<string[]>(['']);
  const [administration, setAdministration] = useState<string[]>(['']);
  
  // Clinical Use
  const [tcmActions, setTcmActions] = useState<string[]>(['']);
  const [clinicalManifestations, setClinicalManifestations] = useState<string[]>(['']);
  const [clinicalApplications, setClinicalApplications] = useState<string[]>(['']);
  
  // Modifications
  const [modifications, setModifications] = useState<string[]>(['']);
  
  // Safety & Alerts
  const [contraindications, setContraindications] = useState<string[]>(['']);
  const [cautions, setCautions] = useState<string[]>(['']);

  // Load formula data
  useEffect(() => {
    if (formulaId && mockFormulasData[formulaId as keyof typeof mockFormulasData]) {
      const formula = mockFormulasData[formulaId as keyof typeof mockFormulasData];
      setFormulaIdDisplay(formula.id);
      setPinyinName(formula.formula);
      setHanziName(formula.formula); // Assuming the formula name is in Hanzi
      setPharmaceuticalName(formula.literal_name);
      setAlternativeNames(''); // No alternative names in mock data
      setSource(formula.source);
      setIngredients(formula.ingredients.length > 0 ? formula.ingredients : [{herb: '', dosage: ''}]);
      setPreparation(formula.preparation.length > 0 ? formula.preparation : ['']);
      setAdministration(formula.administration.length > 0 ? formula.administration : ['']);
      setTcmActions(formula.tcm_actions.length > 0 ? formula.tcm_actions : ['']);
      setClinicalManifestations(formula.clinical_manifestations.length > 0 ? formula.clinical_manifestations : ['']);
      setClinicalApplications(formula.clinical_applications.length > 0 ? formula.clinical_applications : ['']);
      setModifications(formula.modifications.length > 0 ? formula.modifications : ['']);
      setContraindications(formula.contraindications.length > 0 ? formula.contraindications : ['']);
      setCautions(formula.cautions.length > 0 ? formula.cautions : ['']);
    }
  }, [formulaId]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pinyinName) {
      toast.error('Please fill in at least the Pinyin name');
      return;
    }

    // In a real app, this would save to the database
    console.log('Saving formula:', {
      pinyinName,
      hanziName,
      pharmaceuticalName,
      alternativeNames,
      source,
      ingredients,
      preparation,
      administration,
      tcmActions,
      clinicalManifestations,
      clinicalApplications,
      modifications,
      contraindications,
      cautions,
    });
    
    toast.success('Formula updated successfully!');
    navigate('/admin/content');
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
    <div className="max-w-5xl mx-auto p-2 sm:p-4 pb-20 sm:pb-4">
      <Link 
        to="/admin/content" 
        className="h-10 w-10 sm:w-11 sm:h-11 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
        title="Back to Content Management"
      >
        <ChevronLeft className="w-5 h-5" />
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Formula</h1>
        <p className="hidden sm:block text-gray-600">Update formula information in the library</p>
      </div>

      {/* Jump labels */}
      <div className="flex flex-wrap items-center gap-3 mb-8 pb-6 border-b border-gray-200">
        {sections.flatMap((section, index) => {
          const button = (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className="px-4 py-2 text-sm font-medium text-teal-700 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
            >
              {section.label}
            </button>
          );
          
          if (index === 0) {
            return [button];
          }
          
          return [
            <div key={`sep-${section.id}`} className="w-px h-6 bg-gray-300"></div>,
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
                Formula ID <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formulaIdDisplay}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                placeholder="Auto-generated ID"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">This ID is automatically assigned and cannot be modified</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pinyin Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={pinyinName}
                onChange={(e) => setPinyinName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., Si Jun Zi Tang"
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
                placeholder="e.g., 四君子汤"
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
                placeholder="e.g., Four Gentlemen Decoction"
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
                placeholder="e.g., Four Gentlemen Formula, Four Nobles Decoction (comma-separated)"
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
                placeholder="e.g., Tai Ping Hui Min He Ji Ju Fang"
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
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={ingredient.herb}
                    onChange={(e) => updateIngredient(index, 'herb', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Herb name"
                  />
                  <input
                    type="text"
                    value={ingredient.dosage}
                    onChange={(e) => updateIngredient(index, 'dosage', e.target.value)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Dosage"
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
                + Add preparation
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
                + Add administration
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Formula Modifications
              </label>
              {modifications.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateField(modifications, setModifications, index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Enter modification..."
                  />
                  {modifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField(modifications, setModifications, index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addField(modifications, setModifications)}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                + Add modification
              </button>
            </div>
          </div>
        </section>

        <div className="border-t border-gray-300 my-12"></div>

        {/* Safety & Alerts */}
        <section id="safety" className="mb-12 scroll-mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Safety & alerts</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6">
          <Link
            to="/admin/content"
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}