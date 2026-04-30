import { useState } from 'react';
import { Calendar } from 'lucide-react';

export type TimePreset = 'week' | 'month' | 'year' | 'custom';

export interface TimeRange {
  preset: TimePreset;
  startDate: string | null;
  endDate: string | null;
}

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
  className?: string;
}

const presetButtons = [
  { id: 'week' as TimePreset, label: 'This week' },
  { id: 'month' as TimePreset, label: 'This month' },
  { id: 'year' as TimePreset, label: 'This year' },
];

export function TimeRangeSelector({ value, onChange, className = '' }: TimeRangeSelectorProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);

  const handlePresetClick = (preset: TimePreset) => {
    if (preset === 'custom') {
      setShowCustomPicker(!showCustomPicker);
      if (!showCustomPicker) {
        // Initialize with current date if opening custom picker
        const today = new Date().toISOString().split('T')[0];
        onChange({
          preset: 'custom',
          startDate: today,
          endDate: today,
        });
      }
    } else {
      setShowCustomPicker(false);
      onChange({
        preset,
        startDate: null,
        endDate: null,
      });
    }
  };

  const handleDateChange = (field: 'startDate' | 'endDate', dateValue: string) => {
    onChange({
      ...value,
      preset: 'custom',
      [field]: dateValue,
    });
  };

  return (
    <div className={className}>
      {/* Preset Buttons */}
      <div className="inline-flex items-center gap-1 bg-gray-100 rounded-lg p-1 mb-3 overflow-x-auto scrollbar-hide max-w-full">
        {presetButtons.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetClick(preset.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap flex-shrink-0 ${
              value.preset === preset.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {preset.label}
          </button>
        ))}

        {/* Custom Range Button */}
        <button
          onClick={() => handlePresetClick('custom')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${
            value.preset === 'custom'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Custom range
        </button>
      </div>

      {/* Custom Date Picker */}
      {showCustomPicker && value.preset === 'custom' && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Start date
              </label>
              <input
                type="date"
                value={value.startDate || ''}
                onChange={(e) => handleDateChange('startDate', e.target.value)}
                max={value.endDate || undefined}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                End date
              </label>
              <input
                type="date"
                value={value.endDate || ''}
                onChange={(e) => handleDateChange('endDate', e.target.value)}
                min={value.startDate || undefined}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {value.startDate && value.endDate && (
            <div className="mt-3 text-xs text-gray-500">
              Showing data from <span className="font-medium text-gray-900">
                {new Date(value.startDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span> to <span className="font-medium text-gray-900">
                {new Date(value.endDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}