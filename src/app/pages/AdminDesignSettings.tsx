import { useState, useEffect } from 'react';
import { Save, Check, Type, Navigation2, RefreshCw, Upload, X, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  getPlatformSettings, 
  updateDesignSettings,
  type DesignSettings 
} from '../data/platformSettings';
import * as LucideIcons from 'lucide-react';
import { AlertIconEditor } from '../components/AlertIconEditor';

// Lista de iconos comunes de Lucide para selección
const ICON_OPTIONS = [
  { value: 'Leaf', label: 'Leaf (Hoja)', component: LucideIcons.Leaf },
  { value: 'Flower', label: 'Flower (Flor)', component: LucideIcons.Flower },
  { value: 'Flower2', label: 'Flower 2', component: LucideIcons.Flower2 },
  { value: 'Sprout', label: 'Sprout (Brote)', component: LucideIcons.Sprout },
  { value: 'Trees', label: 'Trees (Árboles)', component: LucideIcons.Trees },
  { value: 'Pill', label: 'Pill (Píldora)', component: LucideIcons.Pill },
  { value: 'Tablets', label: 'Tablets (Tabletas)', component: LucideIcons.Tablets },
  { value: 'Beaker', label: 'Beaker (Vaso)', component: LucideIcons.Beaker },
  { value: 'FlaskConical', label: 'Flask (Matraz)', component: LucideIcons.FlaskConical },
  { value: 'TestTube', label: 'Test Tube (Tubo)', component: LucideIcons.TestTube },
  { value: 'FileText', label: 'File Text (Archivo)', component: LucideIcons.FileText },
  { value: 'File', label: 'File (Archivo)', component: LucideIcons.File },
  { value: 'Files', label: 'Files (Archivos)', component: LucideIcons.Files },
  { value: 'BookOpen', label: 'Book Open (Libro)', component: LucideIcons.BookOpen },
  { value: 'Book', label: 'Book (Libro)', component: LucideIcons.Book },
  { value: 'Library', label: 'Library (Biblioteca)', component: LucideIcons.Library },
  { value: 'ScrollText', label: 'Scroll (Pergamino)', component: LucideIcons.ScrollText },
  { value: 'Scroll', label: 'Scroll Simple', component: LucideIcons.Scroll },
  { value: 'Stethoscope', label: 'Stethoscope (Estetoscopio)', component: LucideIcons.Stethoscope },
  { value: 'Heart', label: 'Heart (Corazón)', component: LucideIcons.Heart },
  { value: 'Activity', label: 'Activity (Actividad)', component: LucideIcons.Activity },
  { value: 'Zap', label: 'Zap (Rayo)', component: LucideIcons.Zap },
  { value: 'Plus', label: 'Plus (+)', component: LucideIcons.Plus },
  { value: 'PlusCircle', label: 'Plus Circle', component: LucideIcons.PlusCircle },
  { value: 'Settings', label: 'Settings (Configuración)', component: LucideIcons.Settings },
  { value: 'Tag', label: 'Tag (Etiqueta)', component: LucideIcons.Tag },
  { value: 'Microscope', label: 'Microscope (Microscopio)', component: LucideIcons.Microscope },
  { value: 'GraduationCap', label: 'Graduation Cap', component: LucideIcons.GraduationCap },
  { value: 'Newspaper', label: 'Newspaper (Periódico)', component: LucideIcons.Newspaper },
  { value: 'Users', label: 'Users (Usuarios)', component: LucideIcons.Users },
  { value: 'UserCircle', label: 'User Circle', component: LucideIcons.UserCircle },
  { value: 'Users2', label: 'Users 2', component: LucideIcons.Users2 },
  { value: 'UsersRound', label: 'Users Round', component: LucideIcons.UsersRound },
  // Alert icons
  { value: 'AlertCircle', label: 'Alert Circle', component: LucideIcons.AlertCircle },
  { value: 'AlertTriangle', label: 'Alert Triangle', component: LucideIcons.AlertTriangle },
  { value: 'ShieldAlert', label: 'Shield Alert', component: LucideIcons.ShieldAlert },
  { value: 'Skull', label: 'Skull (Calavera)', component: LucideIcons.Skull },
  { value: 'Baby', label: 'Baby (Bebé)', component: LucideIcons.Baby },
  { value: 'Milk', label: 'Milk (Leche)', component: LucideIcons.Milk },
  { value: 'Dna', label: 'DNA (ADN)', component: LucideIcons.Dna },
  { value: 'ShieldX', label: 'Shield X', component: LucideIcons.ShieldX },
  { value: 'ShieldBan', label: 'Shield Ban', component: LucideIcons.ShieldBan },
  { value: 'Ban', label: 'Ban (Prohibido)', component: LucideIcons.Ban },
  { value: 'XCircle', label: 'X Circle', component: LucideIcons.XCircle },
  { value: 'OctagonAlert', label: 'Octagon Alert', component: LucideIcons.OctagonAlert },
  { value: 'TriangleAlert', label: 'Triangle Alert', component: LucideIcons.TriangleAlert },
  { value: 'Info', label: 'Info', component: LucideIcons.Info },
];

export default function AdminDesignSettings() {
  const [designSettings, setDesignSettings] = useState<DesignSettings>(() => 
    getPlatformSettings().designSettings
  );
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [activeTab, setActiveTab] = useState<'navigation' | 'alerts' | 'typography'>('navigation');

  // Actualizar cuando cambian los settings en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const newSettings = getPlatformSettings().designSettings;
      setDesignSettings(newSettings);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('platformSettingsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('platformSettingsUpdated', handleStorageChange);
    };
  }, []);

  const handleSave = () => {
    setSaveStatus('saving');
    updateDesignSettings(designSettings);
    
    setSaveStatus('saved');
    setTimeout(() => {
      setSaveStatus('idle');
    }, 2000);
  };

  const handleIconChange = (section: keyof DesignSettings['navigationIcons'], value: string) => {
    setDesignSettings({
      ...designSettings,
      navigationIcons: {
        ...designSettings.navigationIcons,
        [section]: value
      }
    });
  };

  const handleAlertIconChange = (section: keyof DesignSettings['alertIcons'], value: string) => {
    setDesignSettings({
      ...designSettings,
      alertIcons: {
        ...designSettings.alertIcons,
        [section]: value
      }
    });
  };

  const handleFontChange = (type: 'primaryFont' | 'hanziFont', value: DesignSettings['fonts']['primaryFont'] | DesignSettings['fonts']['hanziFont']) => {
    setDesignSettings({
      ...designSettings,
      fonts: {
        ...designSettings.fonts,
        [type]: value
      }
    });
  };

  const handleResetDefaults = () => {
    const confirmReset = window.confirm('¿Estás seguro de que quieres restablecer todos los ajustes de diseño a sus valores predeterminados?');
    
    if (confirmReset) {
      const defaultSettings: DesignSettings = {
        navigationIcons: {
          herbs: 'Leaf',
          formulas: 'Pill',
          prescriptions: 'FileText',
          builder: 'Beaker'
        },
        alertIcons: {
          pregnancy: 'Baby',
          lactation: 'Milk',
          cautions: 'AlertTriangle',
          contraindications: 'AlertCircle',
          interactions: 'AlertTriangle',
          drugInteractions: 'Pill',
          herbInteractions: 'Leaf',
          toxicology: 'Skull',
          antagonisms: 'ShieldAlert',
          incompatibilities: 'ShieldAlert',
          allergens: 'Dna',
          herbDrugInteractions: 'Pill',
          herbHerbInteractions: 'Leaf',
          pregnancyWarning: 'AlertCircle'
        },
        fonts: {
          primaryFont: 'system',
          hanziFont: 'system'
        }
      };
      
      setDesignSettings(defaultSettings);
      updateDesignSettings(defaultSettings);
      setSaveStatus('saved');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }
  };

  // Función para eliminar un SVG personalizado
  const handleRemoveCustomSvg = (section: keyof DesignSettings['navigationIcons']) => {
    setDesignSettings({
      ...designSettings,
      customSvgs: {
        ...designSettings.customSvgs,
        [section]: undefined
      }
    });
  };

  // Función para manejar la carga de archivos SVG
  const handleSvgUpload = async (section: keyof DesignSettings['navigationIcons'], file: File) => {
    // Validar que sea un archivo SVG
    if (!file.type.includes('svg')) {
      alert('Por favor, selecciona solo archivos SVG');
      return;
    }

    // Validar tamaño (máximo 100KB)
    if (file.size > 100 * 1024) {
      alert('El archivo SVG es demasiado grande. Tamaño máximo: 100KB');
      return;
    }

    try {
      const svgContent = await file.text();
      
      // Validar que el contenido sea un SVG válido
      if (!svgContent.trim().startsWith('<svg')) {
        alert('El archivo no parece ser un SVG válido');
        return;
      }

      // Guardar el SVG en el estado
      setDesignSettings({
        ...designSettings,
        customSvgs: {
          ...designSettings.customSvgs,
          [section]: svgContent
        }
      });
    } catch (error) {
      console.error('Error reading SVG file:', error);
      alert('Error al leer el archivo SVG');
    }
  };

  // Función para eliminar un SVG personalizado de alertas
  const handleRemoveAlertCustomSvg = (alertType: keyof DesignSettings['alertIcons']) => {
    setDesignSettings({
      ...designSettings,
      customAlertSvgs: {
        ...designSettings.customAlertSvgs,
        [alertType]: undefined
      }
    });
  };

  // Función para manejar la carga de archivos SVG de alertas
  const handleAlertSvgUpload = async (alertType: keyof DesignSettings['alertIcons'], file: File) => {
    // Validar que sea un archivo SVG
    if (!file.type.includes('svg')) {
      alert('Por favor, selecciona solo archivos SVG');
      return;
    }

    // Validar tamaño (máximo 100KB)
    if (file.size > 100 * 1024) {
      alert('El archivo SVG es demasiado grande. Tamaño máximo: 100KB');
      return;
    }

    try {
      const svgContent = await file.text();
      
      // Validar que el contenido sea un SVG válido
      if (!svgContent.trim().startsWith('<svg')) {
        alert('El archivo no parece ser un SVG válido');
        return;
      }

      // Guardar el SVG en el estado
      setDesignSettings({
        ...designSettings,
        customAlertSvgs: {
          ...designSettings.customAlertSvgs,
          [alertType]: svgContent
        }
      });
    } catch (error) {
      console.error('Error reading SVG file:', error);
      alert('Error al leer el archivo SVG');
    }
  };

  // Función para manejar cambios de color de alertas
  const handleAlertColorChange = (
    alertType: keyof DesignSettings['alertIcons'],
    colorType: 'bg' | 'border' | 'text' | 'icon',
    color: string
  ) => {
    setDesignSettings({
      ...designSettings,
      alertColors: {
        ...designSettings.alertColors,
        [alertType]: {
          ...designSettings.alertColors[alertType],
          [colorType]: color
        }
      }
    });
  };

  // Función para obtener el componente de icono
  const getIconComponent = (iconName: string) => {
    const icon = ICON_OPTIONS.find(opt => opt.value === iconName);
    return icon ? icon.component : LucideIcons.HelpCircle;
  };

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Design Settings</h1>
        <p className="hidden sm:block text-gray-600">Customize icons and visual elements</p>
      </div>

      {/* Save Button Section */}
      <div className="mb-8">
        <div className="flex items-center justify-start gap-3">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset to Defaults</span>
          </button>
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {saveStatus === 'saved' ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Section Toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('navigation')}
              className={`min-w-[140px] sm:flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'navigation'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Navigation Icons
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`min-w-[160px] sm:flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'alerts'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Alert Icons & Colors
            </button>
            <button
              onClick={() => setActiveTab('typography')}
              className={`min-w-[110px] sm:flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === 'typography'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Typography
            </button>
          </div>

        {/* Navigation Icons Section */}
        {activeTab === 'navigation' && (
        <>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Navigation Icons</h2>
            <p className="text-sm text-gray-600 mb-6">
              Customize the icons displayed in the main navigation header
            </p>
          </div>
          
          <div className="space-y-6">
            {/* Herbs Icon */}
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr_auto_80px] gap-4 items-center">
              <label className="font-medium text-gray-700">
                Herbs Icon
              </label>
              <select
                value={designSettings.navigationIcons.herbs}
                onChange={(e) => handleIconChange('herbs', e.target.value)}
                className="bg-white px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={!!designSettings.customSvgs?.herbs}
              >
                {ICON_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {designSettings.customSvgs?.herbs ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg whitespace-nowrap">
                  <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span className="text-sm text-teal-700">Custom SVG</span>
                  <button
                    onClick={() => handleRemoveCustomSvg('herbs')}
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
                      if (file) handleSvgUpload('herbs', file);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
              <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg border border-gray-200">
                {designSettings.customSvgs?.herbs ? (
                  <div 
                    className="w-6 h-6" 
                    dangerouslySetInnerHTML={{ __html: designSettings.customSvgs.herbs }}
                  />
                ) : (
                  (() => {
                    const IconComponent = getIconComponent(designSettings.navigationIcons.herbs);
                    return <IconComponent className="w-6 h-6 text-gray-700" />;
                  })()
                )}
              </div>
            </div>

            {/* Formulas Icon */}
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr_auto_80px] gap-4 items-center">
              <label className="font-medium text-gray-700">
                Formulas Icon
              </label>
              <select
                value={designSettings.navigationIcons.formulas}
                onChange={(e) => handleIconChange('formulas', e.target.value)}
                className="bg-white px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={!!designSettings.customSvgs?.formulas}
              >
                {ICON_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {designSettings.customSvgs?.formulas ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg whitespace-nowrap">
                  <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span className="text-sm text-teal-700">Custom SVG</span>
                  <button
                    onClick={() => handleRemoveCustomSvg('formulas')}
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
                      if (file) handleSvgUpload('formulas', file);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
              <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg border border-gray-200">
                {designSettings.customSvgs?.formulas ? (
                  <div 
                    className="w-6 h-6" 
                    dangerouslySetInnerHTML={{ __html: designSettings.customSvgs.formulas }}
                  />
                ) : (
                  (() => {
                    const IconComponent = getIconComponent(designSettings.navigationIcons.formulas);
                    return <IconComponent className="w-6 h-6 text-gray-700" />;
                  })()
                )}
              </div>
            </div>

            {/* Prescriptions Icon */}
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr_auto_80px] gap-4 items-center">
              <label className="font-medium text-gray-700">
                Prescriptions Icon
              </label>
              <select
                value={designSettings.navigationIcons.prescriptions}
                onChange={(e) => handleIconChange('prescriptions', e.target.value)}
                className="bg-white px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={!!designSettings.customSvgs?.prescriptions}
              >
                {ICON_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {designSettings.customSvgs?.prescriptions ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg whitespace-nowrap">
                  <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span className="text-sm text-teal-700">Custom SVG</span>
                  <button
                    onClick={() => handleRemoveCustomSvg('prescriptions')}
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
                      if (file) handleSvgUpload('prescriptions', file);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
              <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg border border-gray-200">
                {designSettings.customSvgs?.prescriptions ? (
                  <div 
                    className="w-6 h-6" 
                    dangerouslySetInnerHTML={{ __html: designSettings.customSvgs.prescriptions }}
                  />
                ) : (
                  (() => {
                    const IconComponent = getIconComponent(designSettings.navigationIcons.prescriptions);
                    return <IconComponent className="w-6 h-6 text-gray-700" />;
                  })()
                )}
              </div>
            </div>

            {/* Builder Icon */}
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr_auto_80px] gap-4 items-center">
              <label className="font-medium text-gray-700">
                Builder Icon
              </label>
              <select
                value={designSettings.navigationIcons.builder}
                onChange={(e) => handleIconChange('builder', e.target.value)}
                className="bg-white px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={!!designSettings.customSvgs?.builder}
              >
                {ICON_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {designSettings.customSvgs?.builder ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg whitespace-nowrap">
                  <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span className="text-sm text-teal-700">Custom SVG</span>
                  <button
                    onClick={() => handleRemoveCustomSvg('builder')}
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
                      if (file) handleSvgUpload('builder', file);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
              <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg border border-gray-200">
                {designSettings.customSvgs?.builder ? (
                  <div 
                    className="w-6 h-6" 
                    dangerouslySetInnerHTML={{ __html: designSettings.customSvgs.builder }}
                  />
                ) : (
                  (() => {
                    const IconComponent = getIconComponent(designSettings.navigationIcons.builder);
                    return <IconComponent className="w-6 h-6 text-gray-700" />;
                  })()
                )}
              </div>
            </div>

            {/* Promos Icon */}
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr_auto_80px] gap-4 items-center">
              <label className="font-medium text-gray-700">
                Promos Icon
              </label>
              <select
                value={designSettings.navigationIcons.promos || 'Tag'}
                onChange={(e) => handleIconChange('promos', e.target.value)}
                className="bg-white px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={!!designSettings.customSvgs?.promos}
              >
                {ICON_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {designSettings.customSvgs?.promos ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg whitespace-nowrap">
                  <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span className="text-sm text-teal-700">Custom SVG</span>
                  <button
                    onClick={() => handleRemoveCustomSvg('promos')}
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
                      if (file) handleSvgUpload('promos', file);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
              <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg border border-gray-200">
                {designSettings.customSvgs?.promos ? (
                  <div
                    className="w-6 h-6"
                    dangerouslySetInnerHTML={{ __html: designSettings.customSvgs.promos }}
                  />
                ) : (
                  (() => {
                    const IconComponent = getIconComponent(designSettings.navigationIcons.promos || 'Tag');
                    return <IconComponent className="w-6 h-6 text-gray-700" />;
                  })()
                )}
              </div>
            </div>

            {/* Research Icon */}
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr_auto_80px] gap-4 items-center">
              <label className="font-medium text-gray-700">
                Research Icon
              </label>
              <select
                value={designSettings.navigationIcons.research || 'Microscope'}
                onChange={(e) => handleIconChange('research', e.target.value)}
                className="bg-white px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={!!designSettings.customSvgs?.research}
              >
                {ICON_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {designSettings.customSvgs?.research ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg whitespace-nowrap">
                  <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span className="text-sm text-teal-700">Custom SVG</span>
                  <button
                    onClick={() => handleRemoveCustomSvg('research')}
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
                      if (file) handleSvgUpload('research', file);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
              <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg border border-gray-200">
                {designSettings.customSvgs?.research ? (
                  <div
                    className="w-6 h-6"
                    dangerouslySetInnerHTML={{ __html: designSettings.customSvgs.research }}
                  />
                ) : (
                  (() => {
                    const IconComponent = getIconComponent(designSettings.navigationIcons.research || 'Microscope');
                    return <IconComponent className="w-6 h-6 text-gray-700" />;
                  })()
                )}
              </div>
            </div>

            {/* Courses Icon */}
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr_auto_80px] gap-4 items-center">
              <label className="font-medium text-gray-700">
                Courses Icon
              </label>
              <select
                value={designSettings.navigationIcons.courses || 'GraduationCap'}
                onChange={(e) => handleIconChange('courses', e.target.value)}
                className="bg-white px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={!!designSettings.customSvgs?.courses}
              >
                {ICON_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {designSettings.customSvgs?.courses ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg whitespace-nowrap">
                  <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span className="text-sm text-teal-700">Custom SVG</span>
                  <button
                    onClick={() => handleRemoveCustomSvg('courses')}
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
                      if (file) handleSvgUpload('courses', file);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
              <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg border border-gray-200">
                {designSettings.customSvgs?.courses ? (
                  <div
                    className="w-6 h-6"
                    dangerouslySetInnerHTML={{ __html: designSettings.customSvgs.courses }}
                  />
                ) : (
                  (() => {
                    const IconComponent = getIconComponent(designSettings.navigationIcons.courses || 'GraduationCap');
                    return <IconComponent className="w-6 h-6 text-gray-700" />;
                  })()
                )}
              </div>
            </div>

            {/* News Icon */}
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr_auto_80px] gap-4 items-center">
              <label className="font-medium text-gray-700">
                News Icon
              </label>
              <select
                value={designSettings.navigationIcons.news || 'Newspaper'}
                onChange={(e) => handleIconChange('news', e.target.value)}
                className="bg-white px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={!!designSettings.customSvgs?.news}
              >
                {ICON_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {designSettings.customSvgs?.news ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg whitespace-nowrap">
                  <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span className="text-sm text-teal-700">Custom SVG</span>
                  <button
                    onClick={() => handleRemoveCustomSvg('news')}
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
                      if (file) handleSvgUpload('news', file);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
              <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg border border-gray-200">
                {designSettings.customSvgs?.news ? (
                  <div
                    className="w-6 h-6"
                    dangerouslySetInnerHTML={{ __html: designSettings.customSvgs.news }}
                  />
                ) : (
                  (() => {
                    const IconComponent = getIconComponent(designSettings.navigationIcons.news || 'Newspaper');
                    return <IconComponent className="w-6 h-6 text-gray-700" />;
                  })()
                )}
              </div>
            </div>

            {/* Community Icon */}
            <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr_auto_80px] gap-4 items-center">
              <label className="font-medium text-gray-700">
                Community Icon
              </label>
              <select
                value={designSettings.navigationIcons.community || 'Users'}
                onChange={(e) => handleIconChange('community', e.target.value)}
                className="bg-white px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={!!designSettings.customSvgs?.community}
              >
                {ICON_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {designSettings.customSvgs?.community ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-lg whitespace-nowrap">
                  <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                  <span className="text-sm text-teal-700">Custom SVG</span>
                  <button
                    onClick={() => handleRemoveCustomSvg('community')}
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
                      if (file) handleSvgUpload('community', file);
                      e.target.value = '';
                    }}
                  />
                </label>
              )}
              <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg border border-gray-200">
                {designSettings.customSvgs?.community ? (
                  <div
                    className="w-6 h-6"
                    dangerouslySetInnerHTML={{ __html: designSettings.customSvgs.community }}
                  />
                ) : (
                  (() => {
                    const IconComponent = getIconComponent(designSettings.navigationIcons.community || 'Users');
                    return <IconComponent className="w-6 h-6 text-gray-700" />;
                  })()
                )}
              </div>
            </div>

            {/* Info Box for Custom SVGs */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-amber-800">
                <strong>Custom SVG Icons:</strong> Upload your own SVG files (max 100KB). 
                When a custom SVG is uploaded, it will override the selected Lucide icon. 
                Remove the custom SVG to return to the dropdown selection.
              </p>
            </div>
          </div>
        </>
        )}

        {/* Alert Icons Section */}
        {activeTab === 'alerts' && (
        <>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Alert Icons & Colors</h2>
            <p className="text-sm text-gray-600 mb-6">
              Customize icons and colors for safety alerts
            </p>
          </div>
          
          <div className="space-y-6">
            <AlertIconEditor
              label="Cautions"
              alertType="cautions"
              iconValue={designSettings.alertIcons.cautions}
              customSvg={designSettings.customAlertSvgs?.cautions}
              colors={designSettings.alertColors.cautions}
              iconOptions={ICON_OPTIONS}
              onIconChange={handleAlertIconChange}
              onSvgUpload={handleAlertSvgUpload}
              onSvgRemove={handleRemoveAlertCustomSvg}
              onColorChange={handleAlertColorChange}
            />

            <AlertIconEditor
              label="Contraindications"
              alertType="contraindications"
              iconValue={designSettings.alertIcons.contraindications}
              customSvg={designSettings.customAlertSvgs?.contraindications}
              colors={designSettings.alertColors.contraindications}
              iconOptions={ICON_OPTIONS}
              onIconChange={handleAlertIconChange}
              onSvgUpload={handleAlertSvgUpload}
              onSvgRemove={handleRemoveAlertCustomSvg}
              onColorChange={handleAlertColorChange}
            />

            <AlertIconEditor
              label="Interactions (Builder)"
              alertType="interactions"
              iconValue={designSettings.alertIcons.interactions}
              customSvg={designSettings.customAlertSvgs?.interactions}
              colors={designSettings.alertColors.interactions}
              iconOptions={ICON_OPTIONS}
              onIconChange={handleAlertIconChange}
              onSvgUpload={handleAlertSvgUpload}
              onSvgRemove={handleRemoveAlertCustomSvg}
              onColorChange={handleAlertColorChange}
            />

            <AlertIconEditor
              label="Drug Interactions"
              alertType="drugInteractions"
              iconValue={designSettings.alertIcons.drugInteractions}
              customSvg={designSettings.customAlertSvgs?.drugInteractions}
              colors={designSettings.alertColors.drugInteractions}
              iconOptions={ICON_OPTIONS}
              onIconChange={handleAlertIconChange}
              onSvgUpload={handleAlertSvgUpload}
              onSvgRemove={handleRemoveAlertCustomSvg}
              onColorChange={handleAlertColorChange}
            />

            <AlertIconEditor
              label="Herb Interactions"
              alertType="herbInteractions"
              iconValue={designSettings.alertIcons.herbInteractions}
              customSvg={designSettings.customAlertSvgs?.herbInteractions}
              colors={designSettings.alertColors.herbInteractions}
              iconOptions={ICON_OPTIONS}
              onIconChange={handleAlertIconChange}
              onSvgUpload={handleAlertSvgUpload}
              onSvgRemove={handleRemoveAlertCustomSvg}
              onColorChange={handleAlertColorChange}
            />

            <AlertIconEditor
              label="Toxicology"
              alertType="toxicology"
              iconValue={designSettings.alertIcons.toxicology}
              customSvg={designSettings.customAlertSvgs?.toxicology}
              colors={designSettings.alertColors.toxicology}
              iconOptions={ICON_OPTIONS}
              onIconChange={handleAlertIconChange}
              onSvgUpload={handleAlertSvgUpload}
              onSvgRemove={handleRemoveAlertCustomSvg}
              onColorChange={handleAlertColorChange}
            />

            <AlertIconEditor
              label="Antagonisms"
              alertType="antagonisms"
              iconValue={designSettings.alertIcons.antagonisms}
              customSvg={designSettings.customAlertSvgs?.antagonisms}
              colors={designSettings.alertColors.antagonisms}
              iconOptions={ICON_OPTIONS}
              onIconChange={handleAlertIconChange}
              onSvgUpload={handleAlertSvgUpload}
              onSvgRemove={handleRemoveAlertCustomSvg}
              onColorChange={handleAlertColorChange}
            />

            <AlertIconEditor
              label="Incompatibilities"
              alertType="incompatibilities"
              iconValue={designSettings.alertIcons.incompatibilities}
              customSvg={designSettings.customAlertSvgs?.incompatibilities}
              colors={designSettings.alertColors.incompatibilities}
              iconOptions={ICON_OPTIONS}
              onIconChange={handleAlertIconChange}
              onSvgUpload={handleAlertSvgUpload}
              onSvgRemove={handleRemoveAlertCustomSvg}
              onColorChange={handleAlertColorChange}
            />

            <AlertIconEditor
              label="Allergens"
              alertType="allergens"
              iconValue={designSettings.alertIcons.allergens}
              customSvg={designSettings.customAlertSvgs?.allergens}
              colors={designSettings.alertColors.allergens}
              iconOptions={ICON_OPTIONS}
              onIconChange={handleAlertIconChange}
              onSvgUpload={handleAlertSvgUpload}
              onSvgRemove={handleRemoveAlertCustomSvg}
              onColorChange={handleAlertColorChange}
            />

            {/* Info Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <p className="text-sm text-amber-800">
                <strong>Custom Icons & Colors:</strong> Upload your own SVG files (max 100KB) and customize the colors for each alert type.
                Colors apply to the background, border, text, and icon of alert cards throughout the application.
              </p>
            </div>
          </div>
        </>
        )}

        {/* Typography Section */}
        {activeTab === 'typography' && (
        <>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Typography</h2>
            <p className="text-sm text-gray-600 mb-6">
              Choose font families for different language contexts
            </p>
          </div>
          
          <div className="space-y-6">
            {/* Primary Font (Latin/English) */}
            <div className="space-y-2">
              <label className="block font-medium text-gray-700">
                Primary Font (Latin/English text)
              </label>
              <p className="text-sm text-gray-500">
                Used for English text, labels, and interface elements
              </p>
              <select
                value={designSettings.fonts.primaryFont}
                onChange={(e) => handleFontChange('primaryFont', e.target.value as DesignSettings['fonts']['primaryFont'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="inter">Inter (Modern, clean UI font)</option>
                <option value="system">System Default (SF Pro/Segoe UI)</option>
                <option value="noto-sans">Noto Sans (Google's universal sans)</option>
                <option value="noto-serif">Noto Serif (Traditional, formal)</option>
              </select>
              <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Preview:</p>
                <p 
                  className="text-base"
                  style={{ 
                    fontFamily: designSettings.fonts.primaryFont === 'inter' ? "'Inter', sans-serif" :
                                designSettings.fonts.primaryFont === 'noto-sans' ? "'Noto Sans', sans-serif" :
                                designSettings.fonts.primaryFont === 'noto-serif' ? "'Noto Serif', serif" :
                                'system-ui, -apple-system, sans-serif'
                  }}
                >
                  The quick brown fox jumps over the lazy dog. <br />
                  <span className="font-semibold">Herbs • Formulas • Prescriptions</span>
                </p>
              </div>
            </div>

            {/* Hanzi Font (Chinese Characters) */}
            <div className="space-y-2">
              <label className="block font-medium text-gray-700">
                Hanzi Font (Chinese characters)
              </label>
              <p className="text-sm text-gray-500">
                Used for displaying Chinese herbal names and traditional characters (汉字)
              </p>
              <select
                value={designSettings.fonts.hanziFont}
                onChange={(e) => handleFontChange('hanziFont', e.target.value as DesignSettings['fonts']['hanziFont'])}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="system">System Default (Simplified Chinese)</option>
                <option value="noto-sans-sc">Noto Sans SC (Clean, modern)</option>
                <option value="noto-serif-sc">Noto Serif SC (Traditional, formal)</option>
              </select>
              <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500 mb-2">Preview:</p>
                <p
                  className="text-base"
                  style={{
                    fontFamily: designSettings.fonts.hanziFont === 'noto-sans-sc' ? "'Noto Sans SC', sans-serif" :
                               designSettings.fonts.hanziFont === 'noto-serif-sc' ? "'Noto Serif SC', serif" :
                               'system-ui, -apple-system, sans-serif'
                  }}
                >
                  人参 • 当归 • 黄芪 • 甘草 <br />
                  <span className="font-semibold">中医临床处方系统</span>
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Font Loading:</strong> Google Fonts (Noto Sans/Serif) are loaded dynamically. Changes take effect immediately but may require a brief moment for initial font download.
              </p>
            </div>
          </div>
        </>
        )}
      </div>
    </>
  );
}