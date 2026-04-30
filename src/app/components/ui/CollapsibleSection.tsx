import { ChevronDown } from 'lucide-react';
import React from 'react';

interface CollapsibleSectionProps {
  title: string | React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  storageKey?: string;
  size?: 'large' | 'small';
  className?: string;
  icon?: React.ReactNode | { svg: string; color: string };
}

export function CollapsibleSection({ title, children, defaultOpen = true, storageKey, size = 'large', className, icon }: CollapsibleSectionProps) {
  // Initialize state from localStorage if storageKey is provided
  const [isOpen, setIsOpen] = React.useState(() => {
    if (storageKey && typeof window !== 'undefined') {
      const stored = localStorage.getItem(storageKey);
      if (stored !== null) {
        return stored === 'true';
      }
    }
    return defaultOpen;
  });

  // Save state to localStorage when it changes
  React.useEffect(() => {
    if (storageKey && typeof window !== 'undefined') {
      localStorage.setItem(storageKey, String(isOpen));
    }
  }, [isOpen, storageKey]);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  // For large accordions: 
  // Mobile: py-6 (24px) for title
  // Desktop: py-5 (20px) for title to match my-5 (20px) on dividers
  // Content: pt-0 so content starts where divider was, pb matches title padding
  // This creates perfect alignment: divider is centered between accordion titles
  // For small accordions: no padding to avoid extra spacing in nested lists
  const paddingClass = size === 'large' ? 'py-6 sm:py-5' : 'py-0';
  const contentPaddingClass = size === 'large' ? 'pt-0 pb-6 sm:pb-5' : 'pt-3';

  return (
    <div className={className}>
      <button
        onClick={toggleOpen}
        className={`w-full flex items-center justify-between ${paddingClass} group hover:opacity-70 transition-opacity`}
        type="button"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {icon && (
            <>
              {typeof icon === 'object' && 'svg' in icon ? (
                <div 
                  className={size === 'large' ? 'w-6 h-6 flex-shrink-0 flex items-center justify-center' : 'w-5 h-5 flex-shrink-0 flex items-center justify-center'}
                  style={{ color: icon.color }}
                  dangerouslySetInnerHTML={{ __html: icon.svg }}
                />
              ) : (
                <div className={size === 'large' ? 'w-6 h-6 flex-shrink-0 flex items-center justify-center' : 'w-5 h-5 flex-shrink-0 flex items-center justify-center'}>
                  {icon}
                </div>
              )}
            </>
          )}
          {typeof title === 'string' ? (
            <span className={size === 'large' ? 'text-2xl font-bold text-gray-900 leading-none' : 'text-lg font-semibold text-gray-900 leading-none'}>{title}</span>
          ) : (
            <div className={size === 'large' ? 'text-2xl font-bold text-gray-900 leading-none' : 'text-lg font-semibold text-gray-900 leading-none'}>{title}</div>
          )}
        </div>
        <ChevronDown
          className={`${size === 'large' ? 'w-6 h-6' : 'w-5 h-5'} text-gray-600 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className={contentPaddingClass}>
          {children}
        </div>
      )}
    </div>
  );
}

// Export with Accordion alias for backward compatibility
export { CollapsibleSection as Accordion };