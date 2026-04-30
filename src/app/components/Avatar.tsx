interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
  image?: string | null;
}

export function Avatar({ name, size = 'md', className = '', color = 'bg-teal-600', image = null }: AvatarProps) {
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-16 h-16 text-xl'
  };

  // Check if color is a hex code or CSS color
  const isCustomColor = color.startsWith('#') || color.startsWith('rgb');

  // If there's a custom image, show it
  if (image) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}
      >
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Otherwise show initials with color
  return (
    <div
      className={`${sizeClasses[size]} ${isCustomColor ? '' : color} rounded-full flex items-center justify-center flex-shrink-0 ${className}`}
      style={isCustomColor ? { backgroundColor: color } : undefined}
    >
      <span className="font-medium text-white">
        {getInitials(name)}
      </span>
    </div>
  );
}