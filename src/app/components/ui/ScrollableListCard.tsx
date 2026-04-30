import { ReactNode } from 'react';

interface ScrollableListCardProps {
  children: ReactNode;
  className?: string;
  dynamic?: boolean; // Para crecimiento dinámico hasta max-height
}

export function ScrollableListCard({ 
  children, 
  className = '',
  dynamic = false
}: ScrollableListCardProps) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${dynamic ? 'flex flex-col max-h-full' : ''} ${dynamic ? className : ''}`}>
      <div className={`overflow-y-auto ${!dynamic ? className : ''}`}>
        {children}
      </div>
    </div>
  );
}