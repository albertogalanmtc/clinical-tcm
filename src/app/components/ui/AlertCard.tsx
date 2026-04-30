import { AlertCircle, AlertTriangle, Info, Pill, Leaf, Skull, Dna, ShieldAlert } from 'lucide-react';
import { cn } from "@/lib/utils";
import { getPlatformSettings, type DesignSettings } from '@/app/data/platformSettings';
import { findHerbByName, getAllHerbs } from '@/app/data/herbsManager';
import { findFormulaByName, getAllFormulas } from '@/app/data/formulasManager';
import * as LucideIcons from 'lucide-react';
import React from 'react';

// Type for alert icon keys
type AlertIconKey = keyof DesignSettings['alertIcons'];

// Helper function to get icon component by name
const getIconComponent = (iconName: string) => {
  const IconComponent = (LucideIcons as any)[iconName];
  return IconComponent || AlertCircle;
};

// Helper function to get custom SVG or icon component
const getAlertIconOrSvg = (alertType: AlertIconKey) => {
  const settings = getPlatformSettings().designSettings;
  const customSvg = settings.customAlertSvgs?.[alertType];
  if (customSvg) {
    return { type: 'svg' as const, content: customSvg };
  }
  return { type: 'component' as const, content: getIconComponent(settings.alertIcons[alertType]) };
};

// Helper function to get colors
const getAlertColors = (alertType: AlertIconKey) => {
  const settings = getPlatformSettings().designSettings;
  const colors = settings.alertColors[alertType];
  // Return default colors if not found
  if (!colors) {
    return { bg: '#fef2f2', border: '#fecaca', text: '#7f1d1d', icon: '#dc2626' };
  }
  return colors;
};

// Export function to get alert icon for use in Accordion titles
export function getAlertIcon(
  type: 'contraindication' | 'caution' | 'drug-interaction' | 'herb-interaction' | 'allergen' | 'antagonism' | 'incompatibility'
): React.ReactNode | { svg: string; color: string } {
  const typeMap = {
    'contraindication': 'contraindications',
    'caution': 'cautions',
    'drug-interaction': 'drugInteractions',
    'herb-interaction': 'herbInteractions',
    'allergen': 'allergens',
    'antagonism': 'antagonisms',
    'incompatibility': 'incompatibilities'
  } as const;

  const mappedType = typeMap[type];
  const iconData = getAlertIconOrSvg(mappedType);
  const colors = getAlertColors(mappedType);

  if (iconData.type === 'svg') {
    return { svg: iconData.content as string, color: colors.icon };
  } else {
    const Icon = iconData.content as typeof AlertCircle;
    return <Icon style={{ color: colors.icon }} />;
  }
}

// Helper function to get global display settings
const getGlobalSettings = () => {
  try {
    const saved = localStorage.getItem('globalDisplaySettings');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading global settings:', error);
  }
  return {
    herbs: {
      detailViewChipsNature: true,
      detailViewNameOrder: ['pinyin', 'pharmaceutical', 'hanzi'],
      detailViewPinyin: true,
      detailViewPharmaceutical: true,
      detailViewHanzi: true
    },
    formulas: {
      detailViewChipsThermalAction: true,
      detailViewNameOrder: ['pinyin', 'pharmaceutical', 'alternative', 'hanzi'],
      detailViewPinyin: true,
      detailViewPharmaceutical: true,
      detailViewAlternative: true,
      detailViewHanzi: true
    }
  };
};

// Helper function to get nature border color for herb chips
const getNatureBorderColor = (herbName: string): string => {
  const foundHerb = findHerbByName(herbName);
  if (!foundHerb || !foundHerb.nature) return 'border-gray-400';
  
  const nature = foundHerb.nature.toLowerCase();
  
  if (nature.includes('very hot') || nature === 'muy caliente') return 'border-red-700';
  if (nature === 'hot' || nature === 'caliente') return 'border-red-500';
  if (nature === 'warm' || nature === 'templado') return 'border-orange-500';
  if (nature === 'neutral' || nature === 'neutro') return 'border-gray-400';
  if (nature === 'cool' || nature === 'fresca') return 'border-blue-400';
  if (nature === 'cold' || nature === 'fría') return 'border-blue-600';
  if (nature.includes('very cold') || nature === 'muy fría') return 'border-blue-800';
  
  return 'border-gray-400';
};

// Helper function to parse text and identify herbs/formulas
const parseTextWithEntities = (text: string): Array<{ type: 'text' | 'herb' | 'formula', content: string }> => {
  const herbs = getAllHerbs();
  const formulas = getAllFormulas();
  
  // Create a list of all possible entity names (herbs and formulas)
  const entities: Array<{ name: string, type: 'herb' | 'formula' }> = [
    ...herbs.map(h => ({ name: h.pinyin_name, type: 'herb' as const })),
    ...formulas.map(f => ({ name: f.pinyin_name, type: 'formula' as const }))
  ];
  
  // Sort by length (longest first) to match longer names first
  entities.sort((a, b) => b.name.length - a.name.length);
  
  const result: Array<{ type: 'text' | 'herb' | 'formula', content: string }> = [];
  let remainingText = text;
  
  while (remainingText.length > 0) {
    let foundMatch = false;
    
    for (const entity of entities) {
      // Try to find the entity name in the remaining text (case insensitive)
      const regex = new RegExp(`\\b${entity.name}\\b`, 'i');
      const match = remainingText.match(regex);
      
      if (match && match.index !== undefined) {
        // Add text before the match
        if (match.index > 0) {
          result.push({ type: 'text', content: remainingText.substring(0, match.index) });
        }
        
        // Add the matched entity
        result.push({ type: entity.type, content: match[0] });
        
        // Update remaining text
        remainingText = remainingText.substring(match.index + match[0].length);
        foundMatch = true;
        break;
      }
    }
    
    if (!foundMatch) {
      // No more matches, add remaining text
      result.push({ type: 'text', content: remainingText });
      break;
    }
  }
  
  return result;
};

interface AlertCardProps {
  type: 'contraindication' | 'caution' | 'info' | 'interaction' | 'allergen' | 'drug-interaction' | 'herb-interaction' | 'toxicology' | 'antagonism' | 'incompatibility' | 'toxic';
  title: string;
  items?: string[];
  className?: string;
  onHerbClick?: (herbName: string) => void;
  onFormulaClick?: (formulaName: string) => void;
  herbChipsShowNature?: boolean;
}

export function AlertCard({ type, title, items, className, onHerbClick, onFormulaClick, herbChipsShowNature = true }: AlertCardProps) {
  // Get custom icons and colors from settings
  const settings = getPlatformSettings().designSettings;
  const globalSettings = getGlobalSettings();
  
  // Deduplicate items to avoid showing repeated alerts
  const uniqueItems = items ? [...new Set(items)] : [];
  
  // Helper function to get herb chip border color
  const getHerbChipBorderColor = (herbName: string): string => {
    if (!herbChipsShowNature) {
      return 'border-gray-400';
    }
    return getNatureBorderColor(herbName);
  };

  const config = {
    contraindication: {
      iconData: getAlertIconOrSvg('contraindications'),
      colors: getAlertColors('contraindications')
    },
    caution: {
      iconData: getAlertIconOrSvg('cautions'),
      colors: getAlertColors('cautions')
    },
    info: {
      iconData: { type: 'component', content: Info },
      colors: { bg: '#eff6ff', border: '#bfdbfe', text: '#1e3a8a', icon: '#2563eb' }
    },
    interaction: {
      iconData: getAlertIconOrSvg('interactions'),
      colors: getAlertColors('interactions')
    },
    'drug-interaction': {
      iconData: getAlertIconOrSvg('drugInteractions'),
      colors: getAlertColors('drugInteractions')
    },
    'herb-interaction': {
      iconData: getAlertIconOrSvg('herbInteractions'),
      colors: getAlertColors('herbInteractions')
    },
    toxicology: {
      iconData: getAlertIconOrSvg('toxicology'),
      colors: getAlertColors('toxicology')
    },
    toxic: {
      iconData: getAlertIconOrSvg('toxicology'),
      colors: getAlertColors('toxicology')
    },
    allergen: {
      iconData: getAlertIconOrSvg('allergens'),
      colors: getAlertColors('allergens')
    },
    antagonism: {
      iconData: getAlertIconOrSvg('antagonisms'),
      colors: getAlertColors('antagonisms')
    },
    incompatibility: {
      iconData: getAlertIconOrSvg('incompatibilities'),
      colors: getAlertColors('incompatibilities')
    }
  };

  const { iconData, colors } = config[type];

  return (
    <div className={className}>
      {title && (
        <div className="flex gap-2 items-center mb-3">
          {iconData.type === 'svg' ? (
            <div 
              className="w-5 h-5 flex-shrink-0"
              style={{ color: colors.icon }}
              dangerouslySetInnerHTML={{ __html: iconData.content as string }}
            />
          ) : (
            (() => {
              const Icon = iconData.content as typeof AlertCircle;
              return <Icon className="w-5 h-5 flex-shrink-0" style={{ color: colors.icon }} />;
            })()
          )}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      {uniqueItems && uniqueItems.length > 0 && (
        <div
          className="rounded-lg border p-4"
          style={{
            backgroundColor: colors.bg,
            borderColor: colors.bg
          }}
        >
          <div className="space-y-2">
            {uniqueItems.map((item, idx) => {
              const parsedText = parseTextWithEntities(item);
              
              return (
                <div key={idx} className="flex gap-2">
                  <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full self-start mt-2.5" style={{ backgroundColor: colors.icon }}></div>
                  <div className="text-base leading-relaxed flex-1" style={{ color: colors.text }}>
                    {parsedText.map((part, partIdx) => {
                      if (part.type === 'text') {
                        return <span key={partIdx}>{part.content}</span>;
                      } else if (part.type === 'herb') {
                        return onHerbClick ? (
                          <button
                            key={partIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              onHerbClick(part.content);
                            }}
                            className="underline hover:no-underline cursor-pointer font-medium transition-opacity hover:opacity-70"
                            style={{ color: colors.text }}
                          >
                            {part.content}
                          </button>
                        ) : (
                          <span key={partIdx}>{part.content}</span>
                        );
                      } else if (part.type === 'formula') {
                        return onFormulaClick ? (
                          <button
                            key={partIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              onFormulaClick(part.content);
                            }}
                            className="underline hover:no-underline cursor-pointer font-medium transition-opacity hover:opacity-70"
                            style={{ color: colors.text }}
                          >
                            {part.content}
                          </button>
                        ) : (
                          <span key={partIdx}>{part.content}</span>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}