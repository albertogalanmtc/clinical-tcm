import { Check, X, Upload, Palette } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { DesignSettings } from '../data/platformSettings';

interface AlertIconEditorProps {
  label: string;
  alertType: keyof DesignSettings['alertIcons'];
  iconValue: string;
  customSvg?: string;
  colors: {
    bg: string;
    border: string;
    text: string;
    icon: string;
  };
  iconOptions: Array<{ value: string; label: string; component: any }>;
  onIconChange: (alertType: keyof DesignSettings['alertIcons'], value: string) => void;
  onSvgUpload: (alertType: keyof DesignSettings['alertIcons'], file: File) => void;
  onSvgRemove: (alertType: keyof DesignSettings['alertIcons']) => void;
  onColorChange: (
    alertType: keyof DesignSettings['alertIcons'],
    colorType: 'bg' | 'border' | 'text' | 'icon',
    color: string
  ) => void;
}

export function AlertIconEditor({
  label,
  alertType,
  iconValue,
  customSvg,
  colors,
  iconOptions,
  onIconChange,
  onSvgUpload,
  onSvgRemove,
  onColorChange
}: AlertIconEditorProps) {
  const getIconComponent = (iconName: string) => {
    const icon = iconOptions.find(opt => opt.value === iconName);
    return icon ? icon.component : LucideIcons.HelpCircle;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr_auto_80px] gap-4 items-center">
        <label className="font-medium text-gray-700">
          {label}
        </label>
        <select
          value={iconValue}
          onChange={(e) => onIconChange(alertType, e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          disabled={!!customSvg}
        >
          {iconOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {customSvg ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg whitespace-nowrap">
            <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span className="text-sm text-teal-700">Custom SVG</span>
            <button
              onClick={() => onSvgRemove(alertType)}
              className="p-1 hover:bg-teal-100 rounded transition-colors"
              title="Remove custom SVG"
            >
              <X className="w-4 h-4 text-teal-700" />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors cursor-pointer whitespace-nowrap">
            <Upload className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-600">Upload SVG</span>
            <input
              type="file"
              accept=".svg,image/svg+xml"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onSvgUpload(alertType, file);
                e.target.value = '';
              }}
            />
          </label>
        )}
        <div 
          className="flex items-center justify-center w-12 h-12 rounded-lg border"
          style={{ 
            backgroundColor: colors.bg,
            borderColor: colors.border
          }}
        >
          {customSvg ? (
            <div 
              className="w-6 h-6" 
              style={{ color: colors.icon }}
              dangerouslySetInnerHTML={{ __html: customSvg }}
            />
          ) : (
            (() => {
              const IconComponent = getIconComponent(iconValue);
              return <IconComponent className="w-6 h-6" style={{ color: colors.icon }} />;
            })()
          )}
        </div>
      </div>
      
      {/* Color Pickers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pl-0 sm:pl-[200px]">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600 flex items-center gap-1">
            <Palette className="w-3 h-3" />
            Background
          </label>
          <input
            type="color"
            value={colors.bg}
            onChange={(e) => onColorChange(alertType, 'bg', e.target.value)}
            className="w-full h-8 rounded border border-gray-300 cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600 flex items-center gap-1">
            <Palette className="w-3 h-3" />
            Border
          </label>
          <input
            type="color"
            value={colors.border}
            onChange={(e) => onColorChange(alertType, 'border', e.target.value)}
            className="w-full h-8 rounded border border-gray-300 cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600 flex items-center gap-1">
            <Palette className="w-3 h-3" />
            Text
          </label>
          <input
            type="color"
            value={colors.text}
            onChange={(e) => onColorChange(alertType, 'text', e.target.value)}
            className="w-full h-8 rounded border border-gray-300 cursor-pointer"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-600 flex items-center gap-1">
            <Palette className="w-3 h-3" />
            Icon
          </label>
          <input
            type="color"
            value={colors.icon}
            onChange={(e) => onColorChange(alertType, 'icon', e.target.value)}
            className="w-full h-8 rounded border border-gray-300 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
