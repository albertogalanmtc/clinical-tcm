import { useEffect, useState } from 'react';
import { getPlatformSettings } from '@/app/data/platformSettings';
import { getIconComponent } from '@/app/utils/iconMapping';

type SectionType = 'herbs' | 'formulas' | 'prescriptions' | 'builder' | 'promos' | 'research' | 'courses' | 'news' | 'community';

/**
 * Hook to get the dynamic icon for a section based on Design Settings
 * Returns both the icon component and custom SVG if available
 */
export function useSectionIcon(section: SectionType) {
  const [iconData, setIconData] = useState<{
    IconComponent: React.ComponentType<{ className?: string }>;
    customSvg?: string;
  }>(() => {
    const settings = getPlatformSettings();
    const iconName = settings.designSettings.navigationIcons[section];
    const customSvg = settings.designSettings.customSvgs?.[section];
    
    return {
      IconComponent: getIconComponent(iconName),
      customSvg
    };
  });

  useEffect(() => {
    const updateIcon = () => {
      const settings = getPlatformSettings();
      const iconName = settings.designSettings.navigationIcons[section];
      const customSvg = settings.designSettings.customSvgs?.[section];
      
      setIconData({
        IconComponent: getIconComponent(iconName),
        customSvg
      });
    };

    // Listen for platform settings updates
    window.addEventListener('storage', updateIcon);
    window.addEventListener('platformSettingsUpdated', updateIcon);

    return () => {
      window.removeEventListener('storage', updateIcon);
      window.removeEventListener('platformSettingsUpdated', updateIcon);
    };
  }, [section]);

  return iconData;
}
