// Utility functions for getting customized alert icons from Design Settings

import { getPlatformSettings } from '@/app/data/platformSettings';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

type AlertIconType = 
  | 'pregnancy'
  | 'lactation'
  | 'cautions'
  | 'contraindications'
  | 'drugInteractions'
  | 'herbInteractions'
  | 'toxicology'
  | 'antagonisms'
  | 'incompatibilities'
  | 'allergens';

type IconResult = 
  | { type: 'component'; component: LucideIcon }
  | { type: 'svg'; svg: string };

/**
 * Get the icon (component or SVG) for a specific alert type
 * @param type - The alert icon type
 * @returns Icon result with type indicator
 */
export function getAlertIcon(type: AlertIconType): IconResult {
  const settings = getPlatformSettings().designSettings;
  
  // Check if there's a custom SVG first
  const customSvg = settings.customAlertSvgs?.[type];
  if (customSvg) {
    return { type: 'svg', svg: customSvg };
  }
  
  // Otherwise get the Lucide icon
  const iconName = settings.alertIcons[type];
  const IconComponent = (LucideIcons as any)[iconName];
  
  // Fallback to default icon if not found
  if (!IconComponent) {
    console.warn(`Alert icon "${iconName}" not found for type "${type}", using fallback`);
    return { type: 'component', component: LucideIcons.AlertCircle };
  }
  
  return { type: 'component', component: IconComponent };
}

/**
 * Get the icon component for a specific alert type (legacy - only returns components, not SVGs)
 * @param type - The alert icon type
 * @returns Lucide icon component
 * @deprecated Use getAlertIcon instead for SVG support
 */
export function getAlertIconComponent(type: AlertIconType): LucideIcon {
  const result = getAlertIcon(type);
  if (result.type === 'component') {
    return result.component;
  }
  // If it's a custom SVG, return a fallback icon
  return LucideIcons.AlertCircle;
}

/**
 * Get all alert icons
 * @returns Object with all alert icon results
 */
export function getAllAlertIcons() {
  return {
    pregnancy: getAlertIcon('pregnancy'),
    lactation: getAlertIcon('lactation'),
    cautions: getAlertIcon('cautions'),
    contraindications: getAlertIcon('contraindications'),
    drugInteractions: getAlertIcon('drugInteractions'),
    herbInteractions: getAlertIcon('herbInteractions'),
    toxicology: getAlertIcon('toxicology'),
    antagonisms: getAlertIcon('antagonisms'),
    incompatibilities: getAlertIcon('incompatibilities'),
    allergens: getAlertIcon('allergens'),
  };
}