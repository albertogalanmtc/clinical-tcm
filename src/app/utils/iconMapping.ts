import * as LucideIcons from 'lucide-react';

/**
 * Helper function to get a Lucide icon component by its name
 * @param iconName - String name of the Lucide icon (e.g., 'Leaf', 'Pill')
 * @returns The icon component or HelpCircle as fallback
 */
export const getIconComponent = (iconName: string) => {
  const LucideIconsAny = LucideIcons as any;
  return LucideIconsAny[iconName] || LucideIcons.HelpCircle;
};
