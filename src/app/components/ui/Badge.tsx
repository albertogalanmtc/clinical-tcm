import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'danger' | 'warning' | 'info' | 'success';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700 border-gray-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-green-50 text-green-700 border-green-200'
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
