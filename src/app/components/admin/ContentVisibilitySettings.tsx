import { CountryMultiSelect } from './CountryMultiSelect';
import { Calendar } from 'lucide-react';

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
        label="Target Countries"
        placeholder="Global (all countries)"
      />

      {/* Date Range (Optional) */}
      {showDateRange && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Publication Date Range
              <span className="ml-2 text-xs text-gray-500">(Optional)</span>
            </label>
            {settings.dateRange && (
              <button
                type="button"
                onClick={clearDateRange}
                className="text-xs text-teal-600 hover:text-teal-700"
              >
                Clear
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-xs text-gray-600 mb-1">Start Date</label>
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
              <label className="block text-xs text-gray-600 mb-1">End Date</label>
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
                ? `Visible from ${new Date(settings.dateRange.start).toLocaleDateString()} to ${new Date(settings.dateRange.end).toLocaleDateString()}`
                : settings.dateRange.start
                ? `Visible from ${new Date(settings.dateRange.start).toLocaleDateString()} onwards`
                : `Visible until ${new Date(settings.dateRange.end).toLocaleDateString()}`}
            </p>
          ) : null}
        </div>
      )}

      {/* Visibility Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Visibility Summary</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>
            <strong>Geographic:</strong>{' '}
            {settings.countries.length === 0
              ? 'Global (all countries)'
              : `${settings.countries.length} ${settings.countries.length === 1 ? 'country' : 'countries'}`}
          </li>
          <li>
            <strong>Temporal:</strong>{' '}
            {!settings.dateRange || (!settings.dateRange.start && !settings.dateRange.end)
              ? 'Always active'
              : settings.dateRange.start && settings.dateRange.end
              ? `${new Date(settings.dateRange.start).toLocaleDateString()} - ${new Date(settings.dateRange.end).toLocaleDateString()}`
              : settings.dateRange.start
              ? `From ${new Date(settings.dateRange.start).toLocaleDateString()}`
              : `Until ${new Date(settings.dateRange.end).toLocaleDateString()}`}
          </li>
        </ul>
      </div>
    </div>
  );
}
