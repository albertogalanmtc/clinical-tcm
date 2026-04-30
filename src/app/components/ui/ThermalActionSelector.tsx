interface ThermalActionSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const thermalActions = [
  { 
    value: 'Very Cold', 
    label: 'Very Cold',
    unselected: 'bg-blue-800 text-white opacity-60 hover:opacity-80',
    selected: 'bg-blue-800 text-white ring-2 ring-offset-1 ring-gray-900'
  },
  { 
    value: 'Cold', 
    label: 'Cold',
    unselected: 'bg-blue-600 text-white opacity-60 hover:opacity-80',
    selected: 'bg-blue-600 text-white ring-2 ring-offset-1 ring-gray-900'
  },
  { 
    value: 'Cool', 
    label: 'Cool',
    unselected: 'bg-blue-400 text-white opacity-60 hover:opacity-80',
    selected: 'bg-blue-400 text-white ring-2 ring-offset-1 ring-gray-900'
  },
  { 
    value: 'Neutral', 
    label: 'Neutral',
    unselected: 'bg-gray-400 text-white opacity-60 hover:opacity-80',
    selected: 'bg-gray-400 text-white ring-2 ring-offset-1 ring-gray-900'
  },
  { 
    value: 'Warm', 
    label: 'Warm',
    unselected: 'bg-orange-500 text-white opacity-60 hover:opacity-80',
    selected: 'bg-orange-500 text-white ring-2 ring-offset-1 ring-gray-900'
  },
  { 
    value: 'Hot', 
    label: 'Hot',
    unselected: 'bg-red-500 text-white opacity-60 hover:opacity-80',
    selected: 'bg-red-500 text-white ring-2 ring-offset-1 ring-gray-900'
  },
  { 
    value: 'Very Hot', 
    label: 'Very Hot',
    unselected: 'bg-red-700 text-white opacity-60 hover:opacity-80',
    selected: 'bg-red-700 text-white ring-2 ring-offset-1 ring-gray-900'
  },
];

export function ThermalActionSelector({ value, onChange }: ThermalActionSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {thermalActions.map((action) => {
        const isSelected = value === action.value;
        return (
          <button
            key={action.value}
            type="button"
            onClick={() => onChange(action.value)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              isSelected ? action.selected : action.unselected
            }`}
          >
            {action.label}
          </button>
        );
      })}
    </div>
  );
}