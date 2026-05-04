import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { updateHerb, getAllHerbs } from '@/app/data/herbsManager';
import { Herb } from '@/app/data/herbs';
import { useSwipeBack } from '../hooks/useSwipeBack';
import { useLanguage } from '../contexts/LanguageContext';

export default function EditHerb() {
  const navigate = useNavigate();
  const { herbName } = useParams();
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const ui = {
    back: isSpanish ? 'Volver a la hierba' : 'Back to Herb',
    pageTitle: isSpanish ? 'Editar hierba' : 'Edit Herb',
    pageDescription: isSpanish ? 'Actualiza la información a continuación' : 'Update the information below',
    basicInformation: isSpanish ? 'Información básica' : 'Basic information',
    basicInfo: isSpanish ? 'Información básica' : 'Basic info',
    properties: isSpanish ? 'Propiedades' : 'Properties',
    clinicalUse: isSpanish ? 'Uso clínico' : 'Clinical use',
    safetyAlerts: isSpanish ? 'Seguridad y alertas' : 'Safety & alerts',
    research: isSpanish ? 'Investigación' : 'Research',
    save: isSpanish ? 'Guardar cambios' : 'Save Changes',
    cancel: isSpanish ? 'Cancelar' : 'Cancel',
    pinyinName: isSpanish ? 'Nombre en pinyin' : 'Pinyin Name',
    pharmaceuticalName: isSpanish ? 'Nombre farmacéutico' : 'Pharmaceutical Name',
    chineseCharacters: isSpanish ? 'Caracteres chinos' : 'Chinese Characters',
    category: isSpanish ? 'Categoría' : 'Category',
    subcategory: isSpanish ? 'Subcategoría' : 'Subcategory',
    nature: isSpanish ? 'Naturaleza' : 'Nature',
    selectNature: isSpanish ? 'Selecciona la naturaleza...' : 'Select nature...',
    flavors: isSpanish ? 'Sabores' : 'Flavors',
    channels: isSpanish ? 'Canales' : 'Channels',
    dosage: isSpanish ? 'Dosis' : 'Dosage',
    toxicity: isSpanish ? 'Toxicidad' : 'Toxicity',
    tcmActions: isSpanish ? 'Acciones TCM' : 'TCM Actions',
    clinicalIndications: isSpanish ? 'Indicaciones clínicas' : 'Clinical Indications',
    contraindications: isSpanish ? 'Contraindicaciones' : 'Contraindications',
    cautions: isSpanish ? 'Precauciones' : 'Cautions',
    toxicology: isSpanish ? 'Toxicología' : 'Toxicology',
    herbDrugInteractions: isSpanish ? 'Interacciones hierba-fármaco' : 'Herb-Drug Interactions',
    herbHerbInteractions: isSpanish ? 'Interacciones hierba-hierba' : 'Herb-Herb Interactions',
    allergens: isSpanish ? 'Alérgenos' : 'Allergens',
    pharmacologicalEffects: isSpanish ? 'Efectos farmacológicos' : 'Pharmacological Effects',
    biologicalMechanisms: isSpanish ? 'Mecanismos biológicos' : 'Biological Mechanisms',
    bioactiveCompounds: isSpanish ? 'Compuestos bioactivos' : 'Bioactive Compounds',
    detoxification: isSpanish ? 'Desintoxicación' : 'Detoxification',
    sectionName: isSpanish ? 'Nombre de la sección' : 'Section name',
    effect: isSpanish ? 'Efecto' : 'Effect',
    system: isSpanish ? 'Sistema' : 'System',
    targetAction: isSpanish ? 'Acción objetivo' : 'Target action',
    chemicalClass: isSpanish ? 'Clase química' : 'Chemical class',
    compound: isSpanish ? 'Compuesto' : 'Compound',
    toxinGroup: isSpanish ? 'Grupo tóxico' : 'Toxin group',
    agent: isSpanish ? 'Agente' : 'Agent',
    addAction: isSpanish ? '+ Añadir acción' : '+ Add action',
    addIndication: isSpanish ? '+ Añadir indicación' : '+ Add indication',
    addContraindication: isSpanish ? '+ Añadir contraindicación' : '+ Add contraindication',
    addCaution: isSpanish ? '+ Añadir precaución' : '+ Add caution',
    addToxicology: isSpanish ? '+ Añadir toxicología' : '+ Add toxicology info',
    addInteraction: isSpanish ? '+ Añadir interacción' : '+ Add interaction',
    addAllergen: isSpanish ? '+ Añadir alérgeno' : '+ Add allergen',
    addSection: isSpanish ? '+ Añadir sección' : '+ Add section',
    addEffect: isSpanish ? '+ Añadir efecto' : '+ Add effect',
    addTargetAction: isSpanish ? '+ Añadir acción objetivo' : '+ Add target action',
    addCompound: isSpanish ? '+ Añadir compuesto' : '+ Add compound',
    addAgent: isSpanish ? '+ Añadir agente' : '+ Add agent',
    update: isSpanish ? 'Actualizar hierba' : 'Update Herb',
  };
  
  // Enable swipe-to-go-back gesture on mobile
  useSwipeBack();
  
  // Basic info
  const [pinyinName, setPinyinName] = useState('');
  const [latinName, setLatinName] = useState('');
  const [chineseName, setChineseName] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  
  // Properties
  const [nature, setNature] = useState('');
  const [flavors, setFlavors] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [dosage, setDosage] = useState('');
  const [toxic, setToxic] = useState('');
  
  // Clinical Use
  const [tcmActions, setTcmActions] = useState<string[]>(['']);
  const [clinicalIndications, setClinicalIndications] = useState<string[]>(['']);
  
  // Safety & Alerts
  const [contraindications, setContraindications] = useState<string[]>(['']);
  const [cautions, setCautions] = useState<string[]>(['']);
  const [toxicology, setToxicology] = useState<string[]>(['']);
  const [herbDrugInteractions, setHerbDrugInteractions] = useState<string[]>(['']);
  const [herbHerbInteractions, setHerbHerbInteractions] = useState<string[]>(['']);
  const [allergens, setAllergens] = useState<string[]>(['']);
  
  // Research
  const [pharmacologicalEffects, setPharmacologicalEffects] = useState<Array<{ section: string; effects: string[] }>>([
    { section: '', effects: [''] }
  ]);
  const [biologicalEffects, setBiologicalEffects] = useState<Array<{ system: string; target_actions: string[] }>>([
    { system: '', target_actions: [''] }
  ]);
  const [bioactiveCompounds, setBioactiveCompounds] = useState<Array<{ chemical_class: string; compounds: string[] }>>([
    { chemical_class: '', compounds: [''] }
  ]);
  const [detoxification, setDetoxification] = useState<Array<{ toxin_group: string; agents: string[] }>>([
    { toxin_group: '', agents: [''] }
  ]);
  const [expandedSections, setExpandedSections] = useState<{ [key: number]: boolean }>({});

  // Load herb data
  useEffect(() => {
    if (!herbName) {
      navigate('/herbs');
      return;
    }

    const herbs = getAllHerbs();
    const herb = herbs.find(h => h.pinyin_name === decodeURIComponent(herbName));

    if (!herb) {
      toast.error(isSpanish ? 'Hierba no encontrada' : 'Herb not found');
      navigate('/herbs');
      return;
    }

    // Set all fields
    setPinyinName(herb.pinyin_name);
    setLatinName(herb.pharmaceutical_name || '');
    setChineseName(herb.hanzi_name || '');
    setCategory(herb.category || '');
    setSubcategory(herb.subcategory || '');
    setNature(herb.nature || 'Neutral');
    setFlavors(herb.flavor || []);
    setChannels(herb.channels || []);
    setDosage(herb.dose || '');
    
    setTcmActions(herb.actions && herb.actions.length > 0 ? herb.actions : ['']);
    setClinicalIndications(herb.indications && herb.indications.length > 0 ? herb.indications : ['']);
    setContraindications(herb.contraindications && herb.contraindications.length > 0 ? herb.contraindications : ['']);
    setCautions(herb.cautions && herb.cautions.length > 0 ? herb.cautions : ['']);
    setToxicology(herb.toxicology && herb.toxicology.length > 0 ? herb.toxicology : ['']);
    setHerbDrugInteractions(herb.herb_drug_interactions && herb.herb_drug_interactions.length > 0 ? herb.herb_drug_interactions : ['']);
    setHerbHerbInteractions(herb.herb_herb_interactions && herb.herb_herb_interactions.length > 0 ? herb.herb_herb_interactions : ['']);
    setAllergens(herb.allergens && herb.allergens.length > 0 ? herb.allergens : ['']);
    setPharmacologicalEffects(
      herb.pharmacological_effects && herb.pharmacological_effects.length > 0 
        ? herb.pharmacological_effects 
        : [{ section: '', effects: [''] }]
    );
    setBiologicalEffects(
      herb.biological_mechanisms && herb.biological_mechanisms.length > 0 
        ? herb.biological_mechanisms 
        : [{ system: '', target_actions: [''] }]
    );
    setBioactiveCompounds(
      herb.bioactive_compounds && herb.bioactive_compounds.length > 0 
        ? herb.bioactive_compounds 
        : [{ chemical_class: '', compounds: [''] }]
    );
    setDetoxification(
      herb.detoxification && herb.detoxification.length > 0 
        ? herb.detoxification 
        : [{ toxin_group: '', agents: [''] }]
    );
  }, [herbName, navigate]);

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

  const toggleMultiSelect = (arr: string[], setArr: (val: string[]) => void, value: string) => {
    if (arr.includes(value)) {
      setArr(arr.filter(item => item !== value));
    } else {
      setArr([...arr, value]);
    }
  };

  // Pharmacological Effects helpers
  const addPharmacologicalSection = () => {
    setPharmacologicalEffects([...pharmacologicalEffects, { section: '', effects: [''] }]);
  };

  const removePharmacologicalSection = (index: number) => {
    setPharmacologicalEffects(pharmacologicalEffects.filter((_, i) => i !== index));
  };

  const updatePharmacologicalSection = (index: number, value: string) => {
    const newEffects = [...pharmacologicalEffects];
    newEffects[index].section = value;
    setPharmacologicalEffects(newEffects);
  };

  const addPharmacologicalEffect = (sectionIndex: number) => {
    const newEffects = [...pharmacologicalEffects];
    newEffects[sectionIndex].effects.push('');
    setPharmacologicalEffects(newEffects);
  };

  const removePharmacologicalEffect = (sectionIndex: number, effectIndex: number) => {
    const newEffects = [...pharmacologicalEffects];
    newEffects[sectionIndex].effects = newEffects[sectionIndex].effects.filter((_, i) => i !== effectIndex);
    setPharmacologicalEffects(newEffects);
  };

  const updatePharmacologicalEffect = (sectionIndex: number, effectIndex: number, value: string) => {
    const newEffects = [...pharmacologicalEffects];
    newEffects[sectionIndex].effects[effectIndex] = value;
    setPharmacologicalEffects(newEffects);
  };

  // Biological Mechanisms helpers
  const addBiologicalMechanism = () => {
    setBiologicalEffects([...biologicalEffects, { system: '', target_actions: [''] }]);
  };

  const removeBiologicalMechanism = (index: number) => {
    setBiologicalEffects(biologicalEffects.filter((_, i) => i !== index));
  };

  const updateBiologicalSystem = (index: number, value: string) => {
    const newMechanisms = [...biologicalEffects];
    newMechanisms[index].system = value;
    setBiologicalEffects(newMechanisms);
  };

  const addBiologicalTargetAction = (systemIndex: number) => {
    const newMechanisms = [...biologicalEffects];
    newMechanisms[systemIndex].target_actions.push('');
    setBiologicalEffects(newMechanisms);
  };

  const removeBiologicalTargetAction = (systemIndex: number, actionIndex: number) => {
    const newMechanisms = [...biologicalEffects];
    newMechanisms[systemIndex].target_actions = newMechanisms[systemIndex].target_actions.filter((_, i) => i !== actionIndex);
    setBiologicalEffects(newMechanisms);
  };

  const updateBiologicalTargetAction = (systemIndex: number, actionIndex: number, value: string) => {
    const newMechanisms = [...biologicalEffects];
    newMechanisms[systemIndex].target_actions[actionIndex] = value;
    setBiologicalEffects(newMechanisms);
  };

  // Bioactive Compounds helpers
  const addBioactiveCompoundSection = () => {
    setBioactiveCompounds([...bioactiveCompounds, { chemical_class: '', compounds: [''] }]);
  };

  const removeBioactiveCompoundSection = (index: number) => {
    setBioactiveCompounds(bioactiveCompounds.filter((_, i) => i !== index));
  };

  const updateBioactiveCompoundSection = (index: number, value: string) => {
    const newCompounds = [...bioactiveCompounds];
    newCompounds[index].chemical_class = value;
    setBioactiveCompounds(newCompounds);
  };

  const addBioactiveCompound = (sectionIndex: number) => {
    const newCompounds = [...bioactiveCompounds];
    newCompounds[sectionIndex].compounds.push('');
    setBioactiveCompounds(newCompounds);
  };

  const removeBioactiveCompound = (sectionIndex: number, compoundIndex: number) => {
    const newCompounds = [...bioactiveCompounds];
    newCompounds[sectionIndex].compounds = newCompounds[sectionIndex].compounds.filter((_, i) => i !== compoundIndex);
    setBioactiveCompounds(newCompounds);
  };

  const updateBioactiveCompound = (sectionIndex: number, compoundIndex: number, value: string) => {
    const newCompounds = [...bioactiveCompounds];
    newCompounds[sectionIndex].compounds[compoundIndex] = value;
    setBioactiveCompounds(newCompounds);
  };

  // Detoxification helpers
  const addDetoxificationSection = () => {
    setDetoxification([...detoxification, { toxin_group: '', agents: [''] }]);
  };

  const removeDetoxificationSection = (index: number) => {
    setDetoxification(detoxification.filter((_, i) => i !== index));
  };

  const updateDetoxificationSection = (index: number, value: string) => {
    const newAgents = [...detoxification];
    newAgents[index].toxin_group = value;
    setDetoxification(newAgents);
  };

  const addDetoxificationAgent = (sectionIndex: number) => {
    const newAgents = [...detoxification];
    newAgents[sectionIndex].agents.push('');
    setDetoxification(newAgents);
  };

  const removeDetoxificationAgent = (sectionIndex: number, agentIndex: number) => {
    const newAgents = [...detoxification];
    newAgents[sectionIndex].agents = newAgents[sectionIndex].agents.filter((_, i) => i !== agentIndex);
    setDetoxification(newAgents);
  };

  const updateDetoxificationAgent = (sectionIndex: number, agentIndex: number, value: string) => {
    const newAgents = [...detoxification];
    newAgents[sectionIndex].agents[agentIndex] = value;
    setDetoxification(newAgents);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!pinyinName || !latinName) {
      toast.error(isSpanish ? 'Rellena al menos el nombre en pinyin y el nombre farmacéutico' : 'Please fill in at least Pinyin and Pharmaceutical names');
      return;
    }

    // Get the original herb to preserve all fields
    const herbs = getAllHerbs();
    const originalHerb = herbs.find(h => h.pinyin_name === decodeURIComponent(herbName!));

    if (!originalHerb) {
      toast.error(isSpanish ? 'Hierba no encontrada' : 'Herb not found');
      return;
    }

    // Filter out empty values from arrays
    const filterEmpty = (arr: string[]) => arr.filter(item => item.trim() !== '');

    // Filter pharmacological effects
    const filteredPharmaEffects = pharmacologicalEffects
      .filter(pe => pe.section.trim() !== '' && pe.effects.some(e => e.trim() !== ''))
      .map(pe => ({
        section: pe.section,
        effects: filterEmpty(pe.effects)
      }));

    // Filter biological mechanisms
    const filteredBioMechanisms = biologicalEffects
      .filter(be => be.system.trim() !== '' || be.target_actions.some(ta => ta.trim() !== ''))
      .map(be => ({
        system: be.system,
        target_actions: filterEmpty(be.target_actions)
      }));

    // Filter bioactive compounds
    const filteredBioactiveCompounds = bioactiveCompounds
      .filter(bc => bc.chemical_class.trim() !== '' || bc.compounds.some(c => c.trim() !== ''))
      .map(bc => ({
        chemical_class: bc.chemical_class,
        compounds: filterEmpty(bc.compounds)
      }));

    // Filter detoxification
    const filteredDetoxification = detoxification
      .filter(d => d.toxin_group.trim() !== '' || d.agents.some(a => a.trim() !== ''))
      .map(d => ({
        toxin_group: d.toxin_group,
        agents: filterEmpty(d.agents)
      }));

    const updatedHerb: Herb = {
      ...originalHerb,
      pinyin_name: pinyinName,
      hanzi_name: chineseName || '',
      pharmaceutical_name: latinName,
      english_name: pinyinName, // Use pinyin as fallback
      category: category || '',
      subcategory: subcategory || '',
      nature: nature || 'Neutral',
      flavor: flavors,
      channels: channels,
      dose: dosage || '',
      actions: filterEmpty(tcmActions),
      indications: filterEmpty(clinicalIndications),
      cautions: filterEmpty(cautions),
      contraindications: filterEmpty(contraindications),
      pharmacological_effects: filteredPharmaEffects,
      biological_mechanisms: filteredBioMechanisms,
      herb_drug_interactions: filterEmpty(herbDrugInteractions),
      herb_herb_interactions: filterEmpty(herbHerbInteractions),
      allergens: filterEmpty(allergens),
      bioactive_compounds: filteredBioactiveCompounds,
      detoxification: filteredDetoxification
    };

    updateHerb(originalHerb.herb_id, updatedHerb);
    toast.success(isSpanish ? 'Hierba actualizada correctamente' : 'Herb updated successfully!');
    navigate(`/herbs/${encodeURIComponent(pinyinName)}`);
  };

  const sections = [
    { id: 'basic', label: ui.basicInfo },
    { id: 'properties', label: ui.properties },
    { id: 'clinical-use', label: ui.clinicalUse },
    { id: 'safety', label: ui.safetyAlerts },
    { id: 'research', label: ui.research }
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="max-w-5xl mx-auto p-2 sm:p-4">
      <Link 
        to={`/herbs/${encodeURIComponent(herbName)}`} 
        className="h-10 w-10 sm:w-11 sm:h-11 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
        title={ui.back}
      >
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{ui.pageTitle}</h1>
        <p className="hidden sm:block text-gray-600">{ui.pageDescription}</p>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{ui.basicInformation}</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {ui.pinyinName} <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={pinyinName}
                onChange={(e) => setPinyinName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder={isSpanish ? 'p. ej., Huang Qi' : 'e.g., Huang Qi'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {ui.pharmaceuticalName} <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={latinName}
                onChange={(e) => setLatinName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder={isSpanish ? 'p. ej., Astragali Radix' : 'e.g., Astragali Radix'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {ui.chineseCharacters}
              </label>
              <input
                type="text"
                value={chineseName}
                onChange={(e) => setChineseName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., 黄芪"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {ui.category}
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder={isSpanish ? 'p. ej., Tonificar Qi' : 'e.g., Tonify Qi'}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {ui.subcategory}
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder={isSpanish ? 'p. ej., Tonificar Qi y fortalecer el exterior' : 'e.g., Tonify Qi and strengthen exterior'}
              />
            </div>
          </div>
        </section>

        <div className="border-t border-gray-300 my-12"></div>

        {/* Properties */}
        <section id="properties" className="mb-12 scroll-mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{ui.properties}</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {ui.nature}
              </label>
              <select
                value={nature}
                onChange={(e) => setNature(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">{ui.selectNature}</option>
                <option value="Very Hot">{isSpanish ? 'Muy caliente' : 'Very Hot'}</option>
                <option value="Hot">{isSpanish ? 'Caliente' : 'Hot'}</option>
                <option value="Warm">{isSpanish ? 'Templado' : 'Warm'}</option>
                <option value="Neutral">{isSpanish ? 'Neutra' : 'Neutral'}</option>
                <option value="Cool">{isSpanish ? 'Fresca' : 'Cool'}</option>
                <option value="Cold">{isSpanish ? 'Fría' : 'Cold'}</option>
                <option value="Very Cold">{isSpanish ? 'Muy fría' : 'Very Cold'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {ui.flavors}
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Sweet', unselected: 'border-amber-500 text-amber-700 bg-white hover:bg-amber-50', selected: 'border-amber-500 bg-amber-500 text-white' },
                  { name: 'Bitter', unselected: 'border-red-600 text-red-700 bg-white hover:bg-red-50', selected: 'border-red-600 bg-red-600 text-white' },
                  { name: 'Acrid', unselected: 'border-gray-500 text-gray-700 bg-white hover:bg-gray-50', selected: 'border-gray-500 bg-gray-500 text-white' },
                  { name: 'Sour', unselected: 'border-green-600 text-green-700 bg-white hover:bg-green-50', selected: 'border-green-600 bg-green-600 text-white' },
                  { name: 'Salty', unselected: 'border-blue-600 text-blue-700 bg-white hover:bg-blue-50', selected: 'border-blue-600 bg-blue-600 text-white' },
                  { name: 'Bland', unselected: 'border-purple-600 text-purple-700 bg-white hover:bg-purple-50', selected: 'border-purple-600 bg-purple-600 text-white' },
                  { name: 'Aromatic', unselected: 'border-amber-700 text-amber-800 bg-white hover:bg-amber-50', selected: 'border-amber-700 bg-amber-700 text-white' }
                ].map(flavor => (
                  <button
                    key={flavor.name}
                    type="button"
                    onClick={() => toggleMultiSelect(flavors, setFlavors, flavor.name)}
                    className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                      flavors.includes(flavor.name)
                        ? flavor.selected
                        : flavor.unselected
                    }`}
                  >
                    {flavor.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {ui.channels}
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: 'Lung', abbr: 'LU', unselected: 'bg-gray-500 text-white opacity-60 hover:opacity-80', selected: 'bg-gray-500 text-white ring-2 ring-offset-1 ring-gray-900' },
                  { name: 'Large Intestine', abbr: 'LI', unselected: 'bg-gray-500 text-white opacity-60 hover:opacity-80', selected: 'bg-gray-500 text-white ring-2 ring-offset-1 ring-gray-900' },
                  { name: 'Stomach', abbr: 'ST', unselected: 'bg-yellow-500 text-gray-900 opacity-60 hover:opacity-80', selected: 'bg-yellow-500 text-gray-900 ring-2 ring-offset-1 ring-gray-900' },
                  { name: 'Spleen', abbr: 'SP', unselected: 'bg-yellow-500 text-gray-900 opacity-60 hover:opacity-80', selected: 'bg-yellow-500 text-gray-900 ring-2 ring-offset-1 ring-gray-900' },
                  { name: 'Heart', abbr: 'HT', unselected: 'bg-red-500 text-white opacity-60 hover:opacity-80', selected: 'bg-red-500 text-white ring-2 ring-offset-1 ring-gray-900' },
                  { name: 'Small Intestine', abbr: 'SI', unselected: 'bg-red-500 text-white opacity-60 hover:opacity-80', selected: 'bg-red-500 text-white ring-2 ring-offset-1 ring-gray-900' },
                  { name: 'Bladder', abbr: 'BL', unselected: 'bg-blue-800 text-white opacity-60 hover:opacity-80', selected: 'bg-blue-800 text-white ring-2 ring-offset-1 ring-gray-900' },
                  { name: 'Kidney', abbr: 'KD', unselected: 'bg-blue-800 text-white opacity-60 hover:opacity-80', selected: 'bg-blue-800 text-white ring-2 ring-offset-1 ring-gray-900' },
                  { name: 'Pericardium', abbr: 'PC', unselected: 'bg-red-500 text-white opacity-60 hover:opacity-80', selected: 'bg-red-500 text-white ring-2 ring-offset-1 ring-gray-900' },
                  { name: 'San Jiao', abbr: 'SJ', unselected: 'bg-red-500 text-white opacity-60 hover:opacity-80', selected: 'bg-red-500 text-white ring-2 ring-offset-1 ring-gray-900' },
                  { name: 'Gallbladder', abbr: 'GB', unselected: 'bg-green-600 text-white opacity-60 hover:opacity-80', selected: 'bg-green-600 text-white ring-2 ring-offset-1 ring-gray-900' },
                  { name: 'Liver', abbr: 'LV', unselected: 'bg-green-600 text-white opacity-60 hover:opacity-80', selected: 'bg-green-600 text-white ring-2 ring-offset-1 ring-gray-900' }
                ].map(channel => (
                  <button
                    key={channel.name}
                    type="button"
                    onClick={() => toggleMultiSelect(channels, setChannels, channel.name)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      channels.includes(channel.name)
                        ? channel.selected
                        : channel.unselected
                    }`}
                  >
                    {channel.abbr}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {ui.dosage}
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder={isSpanish ? 'p. ej., 9-30g' : 'e.g., 9-30g'}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {ui.toxicity}
              </label>
              <input
                type="text"
                value={toxic}
                onChange={(e) => setToxic(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder={isSpanish ? 'p. ej., No tóxica' : 'e.g., Non-toxic'}
              />
            </div>
          </div>
        </section>

        <div className="border-t border-gray-300 my-12"></div>

        {/* Clinical Use */}
        <section id="clinical-use" className="mb-12 scroll-mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{ui.clinicalUse}</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {ui.tcmActions}
              </label>
              {tcmActions.map((action, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={action}
                    onChange={(e) => updateField(tcmActions, setTcmActions, index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder={isSpanish ? 'Introduce una acción TCM...' : 'Enter TCM action...'}
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
                {ui.addAction}
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {ui.clinicalIndications}
              </label>
              {clinicalIndications.map((indication, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={indication}
                    onChange={(e) => updateField(clinicalIndications, setClinicalIndications, index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder={isSpanish ? 'Introduce una indicación clínica...' : 'Enter clinical indication...'}
                  />
                  {clinicalIndications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField(clinicalIndications, setClinicalIndications, index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addField(clinicalIndications, setClinicalIndications)}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                {ui.addIndication}
              </button>
            </div>
          </div>
        </section>

        <div className="border-t border-gray-300 my-12"></div>

        {/* Safety & Alerts */}
        <section id="safety" className="mb-12 scroll-mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{ui.safetyAlerts}</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {ui.contraindications}
              </label>
              {contraindications.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateField(contraindications, setContraindications, index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder={isSpanish ? 'Introduce una contraindicación...' : 'Enter contraindication...'}
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
                {ui.addContraindication}
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {ui.cautions}
              </label>
              {cautions.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateField(cautions, setCautions, index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder={isSpanish ? 'Introduce una precaución...' : 'Enter caution...'}
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
                {ui.addCaution}
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {ui.toxicology}
              </label>
              {toxicology.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateField(toxicology, setToxicology, index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder={isSpanish ? 'Introduce información toxicológica...' : 'Enter toxicology information...'}
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
                {ui.addToxicology}
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {ui.herbDrugInteractions}
              </label>
              {herbDrugInteractions.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateField(herbDrugInteractions, setHerbDrugInteractions, index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder={isSpanish ? 'Introduce una interacción hierba-fármaco...' : 'Enter herb-drug interaction...'}
                  />
                  {herbDrugInteractions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField(herbDrugInteractions, setHerbDrugInteractions, index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addField(herbDrugInteractions, setHerbDrugInteractions)}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                {ui.addInteraction}
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {ui.herbHerbInteractions}
              </label>
              {herbHerbInteractions.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateField(herbHerbInteractions, setHerbHerbInteractions, index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder={isSpanish ? 'Introduce una interacción hierba-hierba...' : 'Enter herb-herb interaction...'}
                  />
                  {herbHerbInteractions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField(herbHerbInteractions, setHerbHerbInteractions, index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addField(herbHerbInteractions, setHerbHerbInteractions)}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                {ui.addInteraction}
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                {ui.allergens}
              </label>
              {allergens.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateField(allergens, setAllergens, index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder={isSpanish ? 'Introduce un alérgeno...' : 'Enter allergen...'}
                  />
                  {allergens.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeField(allergens, setAllergens, index)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addField(allergens, setAllergens)}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                {ui.addAllergen}
              </button>
            </div>
          </div>
        </section>

        <div className="border-t border-gray-300 my-12"></div>

        {/* Research */}
        <section id="research" className="mb-12 scroll-mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{ui.research}</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                {ui.pharmacologicalEffects}
              </label>
              {pharmacologicalEffects.map((pharmaSection, sectionIndex) => (
                <div key={sectionIndex} className="space-y-4 mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={pharmaSection.section}
                      onChange={(e) => updatePharmacologicalSection(sectionIndex, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder={isSpanish ? 'Introduce el nombre de la sección (p. ej., sistema cardiovascular)...' : 'Enter section name (e.g., Cardiovascular system)...'}
                    />
                    {pharmacologicalEffects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePharmacologicalSection(sectionIndex)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {pharmaSection.effects && pharmaSection.effects.map((effect, effectIndex) => (
                      <div key={effectIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={effect}
                          onChange={(e) => updatePharmacologicalEffect(sectionIndex, effectIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder={isSpanish ? 'Introduce un efecto...' : 'Enter effect...'}
                        />
                        {pharmaSection.effects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePharmacologicalEffect(sectionIndex, effectIndex)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addPharmacologicalEffect(sectionIndex)}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      {ui.addEffect}
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addPharmacologicalSection}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                {ui.addSection}
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                {ui.biologicalMechanisms}
              </label>
              {biologicalEffects.map((bioMechanism, systemIndex) => (
                <div key={systemIndex} className="space-y-4 mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={bioMechanism.system}
                      onChange={(e) => updateBiologicalSystem(systemIndex, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder={isSpanish ? 'Introduce un sistema (p. ej., sistema inmune)...' : 'Enter system (e.g., Immune system)...'}
                    />
                    {biologicalEffects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBiologicalMechanism(systemIndex)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {bioMechanism.target_actions && bioMechanism.target_actions.map((action, actionIndex) => (
                      <div key={actionIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={action}
                          onChange={(e) => updateBiologicalTargetAction(systemIndex, actionIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder={isSpanish ? 'Introduce una acción objetivo...' : 'Enter target action...'}
                        />
                        {bioMechanism.target_actions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBiologicalTargetAction(systemIndex, actionIndex)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addBiologicalTargetAction(systemIndex)}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      {ui.addTargetAction}
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addBiologicalMechanism}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                {ui.addSection}
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                {ui.bioactiveCompounds}
              </label>
              {bioactiveCompounds.map((bioCompound, sectionIndex) => (
                <div key={sectionIndex} className="space-y-4 mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={bioCompound.chemical_class}
                      onChange={(e) => updateBioactiveCompoundSection(sectionIndex, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder={isSpanish ? 'Introduce una clase química (p. ej., flavonoides)...' : 'Enter chemical class (e.g., Flavonoids)...'}
                    />
                    {bioactiveCompounds.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBioactiveCompoundSection(sectionIndex)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {bioCompound.compounds && bioCompound.compounds.map((compound, compoundIndex) => (
                      <div key={compoundIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={compound}
                          onChange={(e) => updateBioactiveCompound(sectionIndex, compoundIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder={isSpanish ? 'Introduce un compuesto...' : 'Enter compound...'}
                        />
                        {bioCompound.compounds.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeBioactiveCompound(sectionIndex, compoundIndex)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addBioactiveCompound(sectionIndex)}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      {ui.addCompound}
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addBioactiveCompoundSection}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                {ui.addSection}
              </button>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                {ui.detoxification}
              </label>
              {detoxification.map((detoxSection, sectionIndex) => (
                <div key={sectionIndex} className="space-y-4 mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={detoxSection.toxin_group}
                      onChange={(e) => updateDetoxificationSection(sectionIndex, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder={isSpanish ? 'Introduce un grupo tóxico (p. ej., micotoxinas)...' : 'Enter toxin group (e.g., Mycotoxins)...'}
                    />
                    {detoxification.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDetoxificationSection(sectionIndex)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    {detoxSection.agents && detoxSection.agents.map((agent, agentIndex) => (
                      <div key={agentIndex} className="flex gap-2">
                        <input
                          type="text"
                          value={agent}
                          onChange={(e) => updateDetoxificationAgent(sectionIndex, agentIndex, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder={isSpanish ? 'Introduce un agente...' : 'Enter agent...'}
                        />
                        {detoxSection.agents.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDetoxificationAgent(sectionIndex, agentIndex)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addDetoxificationAgent(sectionIndex)}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      {ui.addAgent}
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addDetoxificationSection}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                {ui.addSection}
              </button>
            </div>
          </div>
        </section>

        {/* Submit buttons */}
        <div className="flex gap-3 justify-end sticky bottom-4 bg-white border border-gray-200 rounded-lg p-4 shadow-lg">
          <Link
            to={`/herbs/${encodeURIComponent(herbName!)}`}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {ui.cancel}
          </Link>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            {ui.update}
          </button>
        </div>
      </form>
    </div>
  );
}
