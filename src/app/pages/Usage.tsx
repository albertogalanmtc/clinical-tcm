import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getPrescriptionsSync, Prescription } from '../data/prescriptions';
import { Link } from 'react-router-dom';
import { usePlanFeatures } from '../hooks/usePlanFeatures';
import { UpgradePrompt } from '../components/UpgradePrompt';
import { useLanguage } from '../contexts/LanguageContext';

type Period = 'week' | 'month' | 'year' | 'all';
type AppLanguage = 'en' | 'es';

interface ChartDataPoint {
  period: string;
  count: number;
}

interface HerbUsage {
  name: string;
  grams: number;
}

interface FormulaUsage {
  name: string;
  grams: number;
}

// Hook to detect mobile view
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// Calculate chart data based on prescriptions and selected period
function calculateChartData(prescriptions: Prescription[], period: Period, language: AppLanguage): ChartDataPoint[] {
  const isSpanish = language === 'es';
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  if (period === 'week') {
    // This week: show days
    const days = isSpanish ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data: ChartDataPoint[] = days.map(day => ({ period: day, count: 0 }));

    // Get start of current week (Monday)
    const currentDay = now.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // Adjust when Sunday (0)
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);

    prescriptions.forEach(prescription => {
      const date = new Date(prescription.createdAt);
      const timeDiff = date.getTime() - weekStart.getTime();
      const dayDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      if (dayDiff >= 0 && dayDiff < 7) {
        data[dayDiff].count++;
      }
    });

    return data;
  } else if (period === 'month') {
    // This month: show weeks
    const weeks = isSpanish ? ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'] : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const data: ChartDataPoint[] = weeks.map(week => ({ period: week, count: 0 }));

    prescriptions.forEach(prescription => {
      const date = new Date(prescription.createdAt);
      if (date.getFullYear() === currentYear && date.getMonth() === currentMonth) {
        const weekIndex = Math.min(Math.floor((date.getDate() - 1) / 7), 3);
        data[weekIndex].count++;
      }
    });

    return data;
  } else if (period === 'year') {
    // This year: show months
    const months = isSpanish ? ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'] : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data: ChartDataPoint[] = months.map(month => ({ period: month, count: 0 }));

    prescriptions.forEach(prescription => {
      const date = new Date(prescription.createdAt);
      if (date.getFullYear() === currentYear) {
        data[date.getMonth()].count++;
      }
    });

    return data;
  } else {
    // All time: show years
    const years = new Set<number>();
    prescriptions.forEach(prescription => {
      const date = new Date(prescription.createdAt);
      years.add(date.getFullYear());
    });

    const sortedYears = Array.from(years).sort();
    const data: ChartDataPoint[] = sortedYears.map(year => ({ period: year.toString(), count: 0 }));

    prescriptions.forEach(prescription => {
      const date = new Date(prescription.createdAt);
      const yearIndex = sortedYears.indexOf(date.getFullYear());
      if (yearIndex !== -1) {
        data[yearIndex].count++;
      }
    });

    return data;
  }
}

// Helper function to parse dosage string to grams
function parseDosage(dosage: string): number {
  // Extract numeric value from strings like "16g", "100g", "6-9g", etc.
  const match = dosage.match(/(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
}

// Filter prescriptions by period
function filterPrescriptionsByPeriod(prescriptions: Prescription[], period: Period): Prescription[] {
  if (period === 'all') return prescriptions;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  if (period === 'week') {
    // Get start of current week (Monday)
    const currentDay = now.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);

    return prescriptions.filter(p => {
      const date = new Date(p.createdAt);
      return date >= weekStart;
    });
  } else if (period === 'month') {
    return prescriptions.filter(p => {
      const date = new Date(p.createdAt);
      return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
    });
  } else if (period === 'year') {
    return prescriptions.filter(p => {
      const date = new Date(p.createdAt);
      return date.getFullYear() === currentYear;
    });
  }

  return prescriptions;
}

// Calculate herb usage from real prescription data
function calculateHerbUsage(prescriptions: Prescription[], period: Period): HerbUsage[] {
  const filtered = filterPrescriptionsByPeriod(prescriptions, period);
  const herbMap = new Map<string, number>();

  filtered.forEach(prescription => {
    prescription.components.forEach(component => {
      if (component.type === 'herb') {
        const grams = parseDosage(component.dosage);
        const current = herbMap.get(component.name) || 0;
        herbMap.set(component.name, current + grams);
      }
    });
  });

  // Convert to array and sort by grams (descending)
  const result = Array.from(herbMap.entries())
    .map(([name, grams]) => ({ name, grams }))
    .sort((a, b) => b.grams - a.grams)
    .slice(0, 10); // Top 10

  return result;
}

// Calculate formula usage from real prescription data
function calculateFormulaUsage(prescriptions: Prescription[], period: Period): FormulaUsage[] {
  const filtered = filterPrescriptionsByPeriod(prescriptions, period);
  const formulaMap = new Map<string, number>();

  filtered.forEach(prescription => {
    prescription.components.forEach(component => {
      if (component.type === 'formula') {
        const grams = parseDosage(component.dosage);
        const current = formulaMap.get(component.name) || 0;
        formulaMap.set(component.name, current + grams);
      }
    });
  });

  // Convert to array and sort by grams (descending)
  const result = Array.from(formulaMap.entries())
    .map(([name, grams]) => ({ name, grams }))
    .sort((a, b) => b.grams - a.grams);

  return result;
}

export default function Usage() {
  const { language } = useLanguage();
  const isSpanish = language === 'es';
  const { hasFeature } = usePlanFeatures();
  
  // Check if user has access to Statistics
  if (!hasFeature('statistics')) {
    return (
      <div className="flex-1 p-6 overflow-y-auto">
        <UpgradePrompt
          feature={isSpanish ? 'Analíticas de uso' : 'Usage Analytics'}
          description={isSpanish
            ? 'Haz seguimiento del uso de tus hierbas y fórmulas a lo largo del tiempo. Obtén información sobre tus patrones de prescripción y optimiza tu práctica.'
            : 'Track your herb and formula usage over time. Gain insights into your prescribing patterns and optimize your practice.'}
          requiredPlan="practitioner"
        />
      </div>
    );
  }
  
  const [selectedPeriodChart, setSelectedPeriodChart] = useState<Period>('month');
  const [selectedPeriodHerbs, setSelectedPeriodHerbs] = useState<Period>('month');
  const [selectedPeriodFormulas, setSelectedPeriodFormulas] = useState<Period>('month');
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const isMobile = useIsMobile();
  const { isPro } = usePlanFeatures();

  useEffect(() => {
    const loadPrescriptions = () => {
      const data = getPrescriptionsSync();
      setPrescriptions(data);
    };
    
    loadPrescriptions();

    // Listen for prescription updates
    const handleUpdate = () => loadPrescriptions();
    window.addEventListener('prescriptions-updated', handleUpdate);
    
    return () => window.removeEventListener('prescriptions-updated', handleUpdate);
  }, []);

  const herbsData = calculateHerbUsage(prescriptions, selectedPeriodHerbs);
  const formulasData = calculateFormulaUsage(prescriptions, selectedPeriodFormulas);
  const chartData = calculateChartData(prescriptions, selectedPeriodChart, language);
  const hasData = prescriptions.length > 0;

  // Calculate max value for bar scaling
  const maxHerbUsage = herbsData.length > 0 ? Math.max(...herbsData.map(h => h.grams)) : 1;

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{isSpanish ? 'Uso y analíticas' : 'Usage & Analytics'}</h1>
        <p className="text-gray-600">{isSpanish ? 'Desglose detallado del uso de tus fórmulas y hierbas' : 'Detailed breakdown of your formula and herb usage'}</p>
      </div>

      <div className="space-y-6">
        {/* Formulas Generated Chart - First Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">{isSpanish ? 'Fórmulas generadas' : 'Formulas generated'}</h2>
            
            {/* Period Selector for Chart */}
            {hasData && (
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setSelectedPeriodChart('week')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    selectedPeriodChart === 'week'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {isSpanish ? 'Semana' : 'Week'}
                </button>
                <button
                  onClick={() => setSelectedPeriodChart('month')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    selectedPeriodChart === 'month'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {isSpanish ? 'Mes' : 'Month'}
                </button>
                <button
                  onClick={() => setSelectedPeriodChart('year')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    selectedPeriodChart === 'year'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {isSpanish ? 'Año' : 'Year'}
                </button>
                <button
                  onClick={() => setSelectedPeriodChart('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    selectedPeriodChart === 'all'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {isSpanish ? 'Todo' : 'All time'}
                </button>
              </div>
            )}
          </div>
          
          {hasData ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: isMobile ? -20 : 0, bottom: 5 }}>
                  <CartesianGrid key="chart-grid" strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    key="chart-xaxis"
                    dataKey="period" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis 
                    key="chart-yaxis"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#e5e7eb' }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    key="chart-tooltip"
                    contentStyle={{ 
                      backgroundColor: '#ffffff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '13px',
                      padding: '10px 14px'
                    }}
                    labelStyle={{ color: '#111827', fontWeight: 500, marginBottom: '4px' }}
                    itemStyle={{ color: '#0d9488' }}
                  />
                  <Line 
                    key="formulas-line"
                    type="monotone" 
                    dataKey="count" 
                    stroke="#0d9488" 
                    strokeWidth={2.5}
                    dot={{ fill: '#0d9488', r: 4 }}
                    activeDot={{ r: 6 }}
                    name={isSpanish ? 'Fórmulas' : 'Formulas'}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-sm text-gray-600 mb-3">{isSpanish ? 'Todavía no se han creado fórmulas' : 'No formulas created yet'}</p>
              <Link 
                to="/builder"
                className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
              >
                {isSpanish ? 'Crea tu primera fórmula' : 'Create your first formula'}
              </Link>
            </div>
          )}
        </div>

        {/* Top Herbs Used Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{isSpanish ? 'Hierbas usadas' : 'Herbs used'}</h2>
            
            {/* Period Selector for Herbs */}
            {hasData && (
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setSelectedPeriodHerbs('week')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    selectedPeriodHerbs === 'week'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {isSpanish ? 'Semana' : 'Week'}
                </button>
                <button
                  onClick={() => setSelectedPeriodHerbs('month')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    selectedPeriodHerbs === 'month'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {isSpanish ? 'Mes' : 'Month'}
                </button>
                <button
                  onClick={() => setSelectedPeriodHerbs('year')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    selectedPeriodHerbs === 'year'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {isSpanish ? 'Año' : 'Year'}
                </button>
                <button
                  onClick={() => setSelectedPeriodHerbs('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    selectedPeriodHerbs === 'all'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {isSpanish ? 'Todo' : 'All time'}
                </button>
              </div>
            )}
          </div>
          {herbsData.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {herbsData.map((herb, index) => (
                <div key={herb.name} className="px-6 py-3 flex items-center gap-4">
                  <div className="flex-shrink-0 w-6 text-right text-sm text-gray-400">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 mb-1">{herb.name}</div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-teal-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${(herb.grams / maxHerbUsage) * 100}%` }}
                        />
                      </div>
                      <div className="flex-shrink-0 w-16 text-right text-sm font-medium text-gray-900">
                        {herb.grams}g
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-500">{isSpanish ? 'Todavía no se han usado hierbas' : 'No herbs used yet'}</p>
            </div>
          )}
        </div>

        {/* Formulas Used Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">{isSpanish ? 'Fórmulas usadas' : 'Formulas used'}</h2>
            
            {/* Period Selector for Formulas */}
            {hasData && (
              <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setSelectedPeriodFormulas('week')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    selectedPeriodFormulas === 'week'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {isSpanish ? 'Semana' : 'Week'}
                </button>
                <button
                  onClick={() => setSelectedPeriodFormulas('month')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    selectedPeriodFormulas === 'month'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {isSpanish ? 'Mes' : 'Month'}
                </button>
                <button
                  onClick={() => setSelectedPeriodFormulas('year')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    selectedPeriodFormulas === 'year'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {isSpanish ? 'Año' : 'Year'}
                </button>
                <button
                  onClick={() => setSelectedPeriodFormulas('all')}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    selectedPeriodFormulas === 'all'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {isSpanish ? 'Todo' : 'All time'}
                </button>
              </div>
            )}
          </div>
          {formulasData.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {formulasData.map((formula, index) => (
                <div key={formula.name} className="px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0 w-6 text-right text-sm text-gray-400">
                      {index + 1}
                    </div>
                    <div className="text-sm font-medium text-gray-900">{formula.name}</div>
                  </div>
                  <div className="flex-shrink-0 text-sm font-medium text-gray-900">
                    {formula.grams}g
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-12 text-center">
              <p className="text-sm text-gray-500">{isSpanish ? 'Todavía no se han usado fórmulas' : 'No formulas used yet'}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
