import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { addHerb, updateHerb } from '@/app/data/herbsManager';
import { Herb, HerbAction, ClinicalApplication } from '@/app/data/herbs';
import { getAllHerbs } from '@/app/data/herbsManager';
import { TCMActionsEditor } from './TCMActionsEditor';

interface NewHerbModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editingHerb?: Herb | null;
}

export function NewHerbModal({ isOpen, onClose, onSuccess, editingHerb = null }: NewHerbModalProps) {
  const allHerbs = getAllHerbs();
  
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
  const [tcmActions, setTcmActions] = useState<HerbAction[]>([
    { title: '', branches: [{ pattern: '', sub_patterns: [], combination: [], formula_example: '' }] }
  ]);
  const [clinicalIndications, setClinicalIndications] = useState<string[]>(['']);
  const [clinicalApplications, setClinicalApplications] = useState<ClinicalApplication[]>([
    { condition: '', pattern: null }
  ]);
  
  // Safety & Alerts
  const [contraindications, setContraindications] = useState<string[]>(['']);
  const [cautions, setCautions] = useState<string[]>(['']);
  const [herbDrugInteractions, setHerbDrugInteractions] = useState<string[]>(['']);
  const [herbHerbInteractions, setHerbHerbInteractions] = useState<string[]>(['']);
  const [allergens, setAllergens] = useState<string[]>(['']);
  
  // Research
  const [pharmacologicalEffects, setPharmacologicalEffects] = useState<string[]>(['']);
  const [biologicalMechanisms, setBiologicalMechanisms] = useState<Array<{ system: string; target_action: string[] }>>([]);
  const [bioactiveCompounds, setBioactiveCompounds] = useState<{ chemical_class: string; compounds: string[] }[]>([]);
  const [detoxification, setDetoxification] = useState<{ toxin_group: string; agents: string[] }[]>([]);
  
  // Notes & References
  const [notes, setNotes] = useState<string[]>(['']);
  const [references, setReferences] = useState<string[]>(['']);

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

  const resetForm = () => {
    setPinyinName('');
    setLatinName('');
    setChineseName('');
    setCategory('');
    setSubcategory('');
    setNature('');
    setFlavors([]);
    setChannels([]);
    setDosage('');
    setToxic('');
    setTcmActions([{ title: '', branches: [{ pattern: '', sub_patterns: [], combination: [], formula_example: '' }] }]);
    setClinicalIndications(['']);
    setClinicalApplications([{ condition: '', pattern: null }]);
    setContraindications(['']);
    setCautions(['']);
    setHerbDrugInteractions(['']);
    setHerbHerbInteractions(['']);
    setAllergens(['']);
    setPharmacologicalEffects(['']);
    setBiologicalMechanisms([]);
    setBioactiveCompounds([]);
    setDetoxification([]);
    setNotes(['']);
    setReferences(['']);
  };

  const handleSave = async () => {
    if (!pinyinName.trim()) {
      toast.error('Please enter a pinyin name');
      return;
    }

    const filterEmpty = (arr: string[]) => arr.filter(item => item.trim());

    const cleanedActions = tcmActions
      .filter(action => action.title.trim() !== '' || action.branches.some(b => b.pattern.trim() !== ''))
      .map(action => ({
        title: action.title,
        branches: action.branches
          .filter(branch => branch.pattern.trim() !== '' || branch.sub_patterns.length > 0)
          .map(branch => ({
            pattern: branch.pattern,
            sub_patterns: branch.sub_patterns.filter(sp => sp.trim() !== ''),
            combination: branch.combination.filter(c => c.trim() !== ''),
            formula_example: branch.formula_example
          }))
      }));

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
      createdBy = {
        userId: 'unknown',
        userName: 'Unknown User',
        userEmail: ''
      };
    }

    const newHerb: Herb = {
      herb_id: editingHerb?.herb_id || `H${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      pinyin_name: pinyinName,
      hanzi_name: chineseName || '',
      pharmaceutical_name: latinName,
      english_name: pinyinName,
      category: category || '',
      subcategory: subcategory || '',
      nature: nature || 'Neutral',
      flavor: flavors,
      channels: channels,
      banned_countries: [],
      actions: cleanedActions,
      indications: filterEmpty(clinicalIndications),
      clinical_applications: clinicalApplications.filter(app => app.condition.trim() !== ''),
      cautions: filterEmpty(cautions),
      contraindications: filterEmpty(contraindications),
      dose: dosage || '',
      toxicology: toxic.trim() ? [toxic.trim()] : [],
      antagonisms: [],
      pharmacological_effects: filterEmpty(pharmacologicalEffects),
      biological_mechanisms: biologicalMechanisms,
      bioactive_compounds: bioactiveCompounds,
      detoxification: detoxification,
      clinical_studies_and_research: [],
      herb_drug_interactions: filterEmpty(herbDrugInteractions),
      herb_herb_interactions: filterEmpty(herbHerbInteractions),
      allergens: filterEmpty(allergens),
      notes: filterEmpty(notes),
      references: filterEmpty(references),
      createdBy: editingHerb?.createdBy || createdBy,
      createdAt: editingHerb?.createdAt || new Date().toISOString()
    };

    if (editingHerb) {
      await updateHerb(editingHerb.herb_id, newHerb);
      toast.success('Herb updated successfully!');
    } else {
      await addHerb(newHerb);
      toast.success('Herb created successfully!');
    }
    resetForm();
    onClose();
    if (onSuccess) onSuccess();
  };

  const sections = [
    { id: 'basic', label: 'Basic info' },
    { id: 'properties', label: 'Properties' },
    { id: 'clinical-use', label: 'Clinical use' },
    { id: 'safety', label: 'Safety & alerts' },
    { id: 'research', label: 'Research' },
    { id: 'notes-refs', label: 'Notes & refs' }
  ];

  const scrollToSection = (id: string) => {
    document.getElementById(`modal-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const natures = [
    { value: 'Very Cold', label: 'Very Cold', unselected: 'bg-blue-800 text-white opacity-60 hover:opacity-80', selected: 'bg-blue-800 text-white ring-2 ring-offset-1 ring-gray-900' },
    { value: 'Cold', label: 'Cold', unselected: 'bg-blue-600 text-white opacity-60 hover:opacity-80', selected: 'bg-blue-600 text-white ring-2 ring-offset-1 ring-gray-900' },
    { value: 'Cool', label: 'Cool', unselected: 'bg-blue-400 text-white opacity-60 hover:opacity-80', selected: 'bg-blue-400 text-white ring-2 ring-offset-1 ring-gray-900' },
    { value: 'Neutral', label: 'Neutral', unselected: 'bg-gray-400 text-white opacity-60 hover:opacity-80', selected: 'bg-gray-400 text-white ring-2 ring-offset-1 ring-gray-900' },
    { value: 'Warm', label: 'Warm', unselected: 'bg-orange-500 text-white opacity-60 hover:opacity-80', selected: 'bg-orange-500 text-white ring-2 ring-offset-1 ring-gray-900' },
    { value: 'Hot', label: 'Hot', unselected: 'bg-red-500 text-white opacity-60 hover:opacity-80', selected: 'bg-red-500 text-white ring-2 ring-offset-1 ring-gray-900' },
    { value: 'Very Hot', label: 'Very Hot', unselected: 'bg-red-700 text-white opacity-60 hover:opacity-80', selected: 'bg-red-700 text-white ring-2 ring-offset-1 ring-gray-900' },
  ];
  const flavorOptions = ['Sweet', 'Sour', 'Bitter', 'Acrid', 'Salty', 'Bland', 'Astringent'];
  const channelOptions = ['Heart', 'Liver', 'Spleen', 'Lung', 'Kidney', 'Pericardium', 'Small Intestine', 'Large Intestine', 'Stomach', 'Gallbladder', 'Bladder', 'Triple Burner'];

  useEffect(() => {
    if (editingHerb) {
      setPinyinName(editingHerb.pinyin_name);
      setLatinName(editingHerb.pharmaceutical_name);
      setChineseName(editingHerb.hanzi_name);
      setCategory(editingHerb.category);
      setSubcategory(editingHerb.subcategory);
      setNature(editingHerb.nature);
      setFlavors(editingHerb.flavor);
      setChannels(editingHerb.channels);
      setDosage(editingHerb.dose);
      setToxic(editingHerb.toxicology?.join(', ') || '');
      setTcmActions(editingHerb.actions);
      setClinicalIndications(editingHerb.indications);
      setClinicalApplications(editingHerb.clinical_applications);
      setContraindications(editingHerb.contraindications);
      setCautions(editingHerb.cautions);
      setHerbDrugInteractions(editingHerb.herb_drug_interactions);
      setHerbHerbInteractions(editingHerb.herb_herb_interactions);
      setAllergens(editingHerb.allergens);
      setPharmacologicalEffects(editingHerb.pharmacological_effects);
      setBiologicalMechanisms(editingHerb.biological_mechanisms);
      setBioactiveCompounds(editingHerb.bioactive_compounds);
      setDetoxification(editingHerb.detoxification);
      setNotes(editingHerb.notes);
      setReferences(editingHerb.references);
    } else {
      resetForm();
    }
  }, [editingHerb]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[70]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 top-[10vh] sm:left-1/2 sm:top-1/2 sm:right-auto sm:bottom-auto sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white sm:rounded-lg sm:max-w-4xl w-full sm:max-h-[90vh] overflow-hidden z-[80] flex flex-col rounded-t-2xl sm:rounded-b-lg">
          <Dialog.Description className="sr-only">
            Create a new herb with basic information, properties, clinical use, safety alerts, research data, and notes
          </Dialog.Description>
          <div className="flex flex-col h-full sm:max-h-[90vh]">
            {/* Header */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <Dialog.Title className="text-lg sm:text-2xl font-bold text-gray-900">
                  {editingHerb ? 'Edit Herb' : 'New Herb'}
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
                      placeholder="e.g., Huang Qi"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Latin/Pharmaceutical Name
                    </label>
                    <input
                      type="text"
                      value={latinName}
                      onChange={(e) => setLatinName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., Radix Astragali"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Chinese Name (Hanzi)
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., Tonify Qi"
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
                      placeholder="e.g., Tonify Spleen and Lung Qi"
                    />
                  </div>
                </div>
              </section>

              <div className="border-t border-gray-300 my-8"></div>

              {/* Properties */}
              <section id="modal-properties" className="mb-8 scroll-mt-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Properties</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nature
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {natures.map(n => (
                        <button
                          key={n.value}
                          type="button"
                          onClick={() => setNature(n.value)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                            nature === n.value
                              ? n.selected
                              : n.unselected
                          }`}
                        >
                          {n.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Flavors (Select multiple)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {flavorOptions.map(f => {
                        const flavorColors: Record<string, { bg: string, border: string, text: string, hover: string }> = {
                          'Sweet': { bg: 'bg-amber-500', border: 'border-amber-500', text: 'text-amber-700', hover: 'hover:bg-amber-50' },
                          'Bitter': { bg: 'bg-red-600', border: 'border-red-600', text: 'text-red-700', hover: 'hover:bg-red-50' },
                          'Acrid': { bg: 'bg-gray-500', border: 'border-gray-500', text: 'text-gray-700', hover: 'hover:bg-gray-50' },
                          'Sour': { bg: 'bg-green-600', border: 'border-green-600', text: 'text-green-700', hover: 'hover:bg-green-50' },
                          'Salty': { bg: 'bg-blue-600', border: 'border-blue-600', text: 'text-blue-700', hover: 'hover:bg-blue-50' },
                          'Bland': { bg: 'bg-purple-600', border: 'border-purple-600', text: 'text-purple-700', hover: 'hover:bg-purple-50' },
                          'Astringent': { bg: 'bg-amber-700', border: 'border-amber-700', text: 'text-amber-800', hover: 'hover:bg-amber-50' },
                        };
                        const colors = flavorColors[f];
                        return (
                          <button
                            key={f}
                            type="button"
                            onClick={() => toggleMultiSelect(flavors, setFlavors, f)}
                            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                              flavors.includes(f)
                                ? `${colors.bg} text-white ${colors.border}`
                                : `bg-white ${colors.text} ${colors.border} ${colors.hover}`
                            }`}
                          >
                            {f}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Channels/Meridians (Select multiple)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {channelOptions.map(c => {
                        const channelData: Record<string, { abbr: string, bg: string, text: string }> = {
                          'Lung': { abbr: 'LU', bg: 'bg-gray-500', text: 'text-white' },
                          'Large Intestine': { abbr: 'LI', bg: 'bg-gray-500', text: 'text-white' },
                          'Stomach': { abbr: 'ST', bg: 'bg-yellow-500', text: 'text-gray-900' },
                          'Spleen': { abbr: 'SP', bg: 'bg-yellow-500', text: 'text-gray-900' },
                          'Heart': { abbr: 'HT', bg: 'bg-red-500', text: 'text-white' },
                          'Small Intestine': { abbr: 'SI', bg: 'bg-red-500', text: 'text-white' },
                          'Pericardium': { abbr: 'PC', bg: 'bg-red-500', text: 'text-white' },
                          'Triple Burner': { abbr: 'SJ', bg: 'bg-red-500', text: 'text-white' },
                          'Bladder': { abbr: 'BL', bg: 'bg-blue-800', text: 'text-white' },
                          'Kidney': { abbr: 'KD', bg: 'bg-blue-800', text: 'text-white' },
                          'Gallbladder': { abbr: 'GB', bg: 'bg-green-600', text: 'text-white' },
                          'Liver': { abbr: 'LV', bg: 'bg-green-600', text: 'text-white' },
                        };
                        const data = channelData[c];
                        const isSelected = channels.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => toggleMultiSelect(channels, setChannels, c)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${data.bg} ${data.text} ${
                              isSelected
                                ? 'ring-2 ring-offset-1 ring-gray-900'
                                : 'opacity-60 hover:opacity-80'
                            }`}
                          >
                            {data.abbr}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Dosage
                    </label>
                    <input
                      type="text"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., 9-30g"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Toxicity Information
                    </label>
                    <input
                      type="text"
                      value={toxic}
                      onChange={(e) => setToxic(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g., Non-toxic or Mildly toxic"
                    />
                  </div>
                </div>
              </section>

              <div className="border-t border-gray-300 my-8"></div>

              {/* Clinical Use */}
              <section id="modal-clinical-use" className="mb-8 scroll-mt-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Clinical use</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      TCM Actions
                    </label>
                    <TCMActionsEditor
                      actions={tcmActions}
                      onChange={setTcmActions}
                      allHerbs={allHerbs}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Clinical Indications
                    </label>
                    {clinicalIndications.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateField(clinicalIndications, setClinicalIndications, index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter clinical indication..."
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
                      + Add indication
                    </button>
                  </div>
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
                      Herb-Drug Interactions
                    </label>
                    {herbDrugInteractions.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateField(herbDrugInteractions, setHerbDrugInteractions, index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter herb-drug interaction..."
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
                      + Add interaction
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Herb-Herb Interactions
                    </label>
                    {herbHerbInteractions.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateField(herbHerbInteractions, setHerbHerbInteractions, index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter herb-herb interaction..."
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
                      + Add interaction
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Allergens
                    </label>
                    {allergens.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateField(allergens, setAllergens, index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter allergen..."
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
                      + Add allergen
                    </button>
                  </div>
                </div>
              </section>

              <div className="border-t border-gray-300 my-8"></div>

              {/* Research */}
              <section id="modal-research" className="mb-8 scroll-mt-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Research</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Pharmacological Effects
                    </label>
                    {pharmacologicalEffects.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateField(pharmacologicalEffects, setPharmacologicalEffects, index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter pharmacological effect..."
                        />
                        {pharmacologicalEffects.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeField(pharmacologicalEffects, setPharmacologicalEffects, index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addField(pharmacologicalEffects, setPharmacologicalEffects)}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      + Add effect
                    </button>
                  </div>
                </div>
              </section>

              <div className="border-t border-gray-300 my-8"></div>

              {/* Notes & References */}
              <section id="modal-notes-refs" className="mb-8 scroll-mt-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Notes & references</h2>
                <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Notes
                    </label>
                    {notes.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateField(notes, setNotes, index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter note..."
                        />
                        {notes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeField(notes, setNotes, index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addField(notes, setNotes)}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      + Add note
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      References
                    </label>
                    {references.map((item, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateField(references, setReferences, index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="Enter reference..."
                        />
                        {references.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeField(references, setReferences, index)}
                            className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addField(references, setReferences)}
                      className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                    >
                      + Add reference
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