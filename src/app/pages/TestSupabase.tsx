import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function TestSupabase() {
  const [message, setMessage] = useState('');
  const [herbs, setHerbs] = useState<any[]>([]);

  // Create herb (directo con Supabase)
  const handleCreateHerb = async () => {
    try {
      const testHerb = {
        herb_id: `test_herb_${Date.now()}`,
        pinyin_name: 'Test Herb',
        hanzi_name: '测试草药',
        category: 'Tonifying',
        subcategory: 'Qi Tonics',
        nature: 'Neutral',
        flavor: ['Sweet'],
        channels: ['SP', 'LU'],
        dose: '9-15g',
        is_system_item: false,
        user_id: '00000000-0000-0000-0000-000000000000', // Dummy user ID
      };

      console.log('Creating herb:', testHerb);

      const { data, error } = await supabase
        .from('herbs')
        .insert(testHerb)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        setMessage(`❌ Error: ${error.message}`);
        return;
      }

      console.log('Herb created:', data);
      setMessage(`✅ Hierba creada: ${data.pinyin_name}`);
    } catch (error: any) {
      console.error('Full error:', error);
      setMessage(`❌ Exception: ${error.message || 'Unknown error'}`);
    }
  };

  // Get herbs (directo con Supabase)
  const handleGetHerbs = async () => {
    try {
      const { data, error } = await supabase
        .from('herbs')
        .select('*');

      if (error) {
        console.error('Supabase error:', error);
        setMessage(`❌ Error: ${error.message}`);
        return;
      }

      setHerbs(data || []);
      setMessage(`✅ ${data?.length || 0} hierbas encontradas`);
    } catch (error: any) {
      setMessage(`❌ Exception: ${error.message}`);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Supabase Integration</h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Nota:</strong> Autenticación desactivada temporalmente. Todas las operaciones son públicas por ahora.
        </p>
      </div>

      {/* Herbs Testing */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Test Herbs Database</h2>

        <div className="flex gap-2 mb-4">
          <button
            onClick={handleCreateHerb}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            Create Test Herb
          </button>
          <button
            onClick={handleGetHerbs}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Get My Herbs
          </button>
        </div>

        {herbs.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-medium">Your Herbs:</h3>
            {herbs.map((herb) => (
              <div key={herb.id} className="p-3 bg-gray-50 rounded border">
                <div className="font-medium">{herb.pinyin_name}</div>
                <div className="text-sm text-gray-600">{herb.hanzi_name}</div>
                <div className="text-xs text-gray-500">
                  {herb.category} - {herb.subcategory}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Display */}
      {message && (
        <div className="bg-gray-100 rounded-lg p-4">
          <div className="font-mono text-sm">{message}</div>
        </div>
      )}
    </div>
  );
}
