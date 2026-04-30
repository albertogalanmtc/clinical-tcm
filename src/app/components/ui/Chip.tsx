import { cn } from "@/lib/utils";

interface ChipProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'primary' | 'secondary' | 'accent' | 'success';
  size?: 'sm' | 'md';
  className?: string;
}

export function Chip({ children, variant = 'neutral', size = 'md', className }: ChipProps) {
  const variants = {
    neutral: 'bg-gray-100 text-gray-700',
    primary: 'bg-blue-100 text-blue-700',
    secondary: 'bg-purple-100 text-purple-700',
    accent: 'bg-teal-100 text-teal-700',
    success: 'bg-green-100 text-green-700'
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm'
  };

  return (
    <span className={cn("inline-flex items-center rounded-full font-medium text-[12px] text-[13px]", variants[variant], sizes[size], className)}>
      {children}
    </span>
  );
}