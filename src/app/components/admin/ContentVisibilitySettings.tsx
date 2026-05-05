import { CountryMultiSelect } from './CountryMultiSelect';
import { Calendar } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

export interface VisibilitySettings {
  countries: string[];
  dateRange?: {
    start: string;
    end: string;
  };
}

interface ContentVisibilitySettingsProps {
  settings: VisibilitySettings;
  onChange: (settings: VisibilitySettings) => void;
  showDateRange?: boolean;
}

export function ContentVisibilitySettings({
  settings,
  onChange,
  showDateRange = true,
}: ContentVisibilitySettingsProps) {
  const { language } = useLanguage();
  const isSpanish = language === 'es';

  const handleCountriesChange = (countries: string[]) => {
    onChange({ ...settings, countries });
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    onChange({
      ...settings,
      dateRange: {
        start: field === 'start' ? value : settings.dateRange?.start || '',
        end: field === 'end' ? value : settings.dateRange?.end || '',
      },
    });
  };

  const clearDateRange = () => {
    const { dateRange, ...rest } = settings;
    onChange(rest);
  };

  return (
    <div className="space-y-6">
      {/* Country Selection */}
      <CountryMultiSelect
        selectedCountries={settings.countries}
        onChange={handleCountriesChange}
        label={isSpanish ? 'Países objetivo' : 'Target Countries'}
        placeholder={isSpanish ? 'Global (todos los países)' : 'Global (all countries)'}
      />

      {/* Date Range (Optional) */}
      {showDateRange && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              {isSpanish ? 'Rango de fechas de publicación' : 'Publication Date Range'}
              <span className="ml-2 text-xs text-gray-500">
                {isSpanish ? '(Opcional)' : '(Optional)'}
              </span>
            </label>
            {settings.dateRange && (
              <button
                type="button"
                onClick={clearDateRange}
                className="text-xs text-teal-600 hover:text-teal-700"
              >
                {isSpanish ? 'Borrar' : 'Clear'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                {isSpanish ? 'Fecha de inicio' : 'Start Date'}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={settings.dateRange?.start || ''}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">
                {isSpanish ? 'Fecha de fin' : 'End Date'}
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={settings.dateRange?.end || ''}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  min={settings.dateRange?.start || undefined}
                  className="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Date Range Info */}
          {settings.dateRange?.start || settings.dateRange?.end ? (
            <p className="mt-2 text-xs text-gray-500">
              {settings.dateRange.start && settings.dateRange.end
                ? (isSpanish
                    ? `Visible desde ${new Date(settings.dateRange.start).toLocaleDateString()} hasta ${new Date(settings.dateRange.end).toLocaleDateString()}`
                    : `Visible from ${new Date(settings.dateRange.start).toLocaleDateString()} to ${new Date(settings.dateRange.end).toLocaleDateString()}`)
                : settings.dateRange.start
                ? (isSpanish
                    ? `Visible desde ${new Date(settings.dateRange.start).toLocaleDateString()} en adelante`
                    : `Visible from ${new Date(settings.dateRange.start).toLocaleDateString()} onwards`)
                : (isSpanish
                    ? `Visible hasta ${new Date(settings.dateRange.end).toLocaleDateString()}`
                    : `Visible until ${new Date(settings.dateRange.end).toLocaleDateString()}`)}
            </p>
          ) : null}
        </div>
      )}

      {/* Visibility Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          {isSpanish ? 'Resumen de visibilidad' : 'Visibility Summary'}
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            <strong>{isSpanish ? 'Geográfico:' : 'Geographic:'}</strong>{' '}
            {settings.countries.length === 0
              ? (isSpanish ? 'Global (todos los países)' : 'Global (all countries)')
              : `${settings.countries.length} ${settings.countries.length === 1 ? (isSpanish ? 'país' : 'country') : (isSpanish ? 'países' : 'countries')}`}
          </li>
          <li>
            <strong>{isSpanish ? 'Temporal:' : 'Temporal:'}</strong>{' '}
            {!settings.dateRange || (!settings.dateRange.start && !settings.dateRange.end)
              ? (isSpanish ? 'Siempre activo' : 'Always active')
              : settings.dateRange.start && settings.dateRange.end
              ? `${new Date(settings.dateRange.start).toLocaleDateString()} - ${new Date(settings.dateRange.end).toLocaleDateString()}`
              : settings.dateRange.start
              ? (isSpanish ? `Desde ${new Date(settings.dateRange.start).toLocaleDateString()}` : `From ${new Date(settings.dateRange.start).toLocaleDateString()}`)
              : (isSpanish ? `Hasta ${new Date(settings.dateRange.end).toLocaleDateString()}` : `Until ${new Date(settings.dateRange.end).toLocaleDateString()}`)}
          </li>
        </ul>
      </div>
    </div>
  );
}
