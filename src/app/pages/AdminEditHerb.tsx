/**
 * Admin Edit Herb Page
 * Edit herb information with the same design as NewHerb
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { useSwipeBack } from '../hooks/useSwipeBack';
import { getAllHerbs } from '@/app/data/herbsManager';
import { updateHerb } from '@/app/data/herbsManager';
import { Herb } from '@/app/data/herbs';

export default function AdminEditHerb() {
  const { herbId } = useParams<{ herbId: string }>();
  const navigate = useNavigate();
  
  // Enable swipe-to-go-back gesture on mobile
  useSwipeBack();
  
  // Loading state
  const [loading, setLoading] = useState(true);
  const [herbNotFound, setHerbNotFound] = useState(false);
  
  // Basic info - Admin only
  const [herbIdField, setHerbIdField] = useState('');
  const [pinyinName, setPinyinName] = useState('');
  const [hanziName, setHanziName] = useState('');
  const [latinName, setLatinName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  
  // Properties
  const [nature, setNature] = useState('');
  const [flavors, setFlavors] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [dosage, setDosage] = useState('');
  
  // Clinical Use
  const [tcmActions, setTcmActions] = useState<string[]>(['']);
  const [clinicalIndications, setClinicalIndications] = useState<string[]>(['']);
  
  // Safety & Alerts
  const [contraindications, setContraindications] = useState<string[]>(['']);
  const [cautions, setCautions] = useState<string[]>(['']);

  // Load herb data from herbsManager
  useEffect(() => {
    if (herbId) {
      const allHerbs = getAllHerbs();
      const herb = allHerbs.find(h => h.herb_id === herbId);
      
      if (herb) {
        setHerbIdField(herb.herb_id);
        setPinyinName(herb.pinyin_name);
        setHanziName(herb.hanzi_name || '');
        setLatinName(herb.pharmaceutical_name);
        setEnglishName(herb.english_name || '');
        setCategory(herb.category || '');
        setSubcategory(herb.subcategory || '');
        setNature(herb.nature || '');
        setFlavors(herb.flavor || []);
        setChannels(herb.channels || []);
        setDosage(herb.dose || '');
        setTcmActions(herb.actions && herb.actions.length > 0 ? herb.actions : ['']);
        setClinicalIndications(herb.indications && herb.indications.length > 0 ? herb.indications : ['']);
        setContraindications(herb.contraindications && herb.contraindications.length > 0 ? herb.contraindications : ['']);
        setCautions(herb.cautions && herb.cautions.length > 0 ? herb.cautions : ['']);
        setLoading(false);
      } else {
        setHerbNotFound(true);
        setLoading(false);
      }
    }
  }, [herbId]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pinyinName || !latinName) {
      toast.error('Please fill in at least Pinyin and Pharmaceutical names');
      return;
    }

    // Filter out empty values
    const filterEmpty = (arr: string[]) => arr.filter(item => item.trim() !== '');

    // Get the original herb to preserve fields we're not editing
    const allHerbs = getAllHerbs();
    const originalHerb = allHerbs.find(h => h.herb_id === herbIdField);

    if (!originalHerb) {
      toast.error('Herb not found');
      return;
    }

    // Update herb with edited values, preserving other fields
    const updatedHerb: Herb = {
      ...originalHerb,
      herb_id: herbIdField,
      pinyin_name: pinyinName,
      hanzi_name: hanziName,
      pharmaceutical_name: latinName,
      english_name: englishName,
      category: category,
      subcategory: subcategory,
      nature: nature,
      flavor: flavors,
      channels: channels,
      dose: dosage,
      actions: filterEmpty(tcmActions),
      indications: filterEmpty(clinicalIndications),
      contraindications: filterEmpty(contraindications),
      cautions: filterEmpty(cautions),
    };
    
    updateHerb(herbIdField, updatedHerb);
    toast.success('Herb updated successfully!');
    navigate('/admin/content');
  };

  const sections = [
    { id: 'basic', label: 'Basic info' },
    { id: 'properties', label: 'Properties' },
    { id: 'clinical-use', label: 'Clinical use' },
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
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Herb</h1>
        <p className="hidden sm:block text-gray-600">Update herb information in the library</p>
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
                Herb ID <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={herbIdField}
                onChange={(e) => setHerbIdField(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., h1"
                required
              />
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
                placeholder="e.g., Huang Qi"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pharmaceutical Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={latinName}
                onChange={(e) => setLatinName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., Astragali Radix"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chinese Characters
              </label>
              <input
                type="text"
                value={hanziName}
                onChange={(e) => setHanziName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., 黄芪"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                English Name
              </label>
              <input
                type="text"
                value={englishName}
                onChange={(e) => setEnglishName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="e.g., Astragalus"
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
                placeholder="e.g., Tonify Qi"
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
                placeholder="e.g., Tonify Qi and strengthen exterior"
              />
            </div>
          </div>
        </section>

        <div className="border-t border-gray-300 my-12"></div>

        {/* Properties */}
        <section id="properties" className="mb-12 scroll-mt-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Properties</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nature
              </label>
              <select
                value={nature}
                onChange={(e) => setNature(e.target.value)}
                className="w-full bg-white px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select nature...</option>
                <option value="Very Hot">Very Hot</option>
                <option value="Hot">Hot</option>
                <option value="Warm">Warm</option>
                <option value="Neutral">Neutral</option>
                <option value="Cool">Cool</option>
                <option value="Cold">Cold</option>
                <option value="Very Cold">Very Cold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flavors
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Channels
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                Clinical Indications
              </label>
              {clinicalIndications.map((indication, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={indication}
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