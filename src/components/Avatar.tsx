import React, { useState } from 'react';

interface AvatarProps {
  src: string | null | undefined;
  name: string;
  className?: string;
  active?: boolean;
}

export function Avatar({ src, name, className = "h-10 w-10", active = true }: AvatarProps) {
  const [error, setError] = useState(false);

  // Get initials (up to 2 letters)
  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0 || !parts[0]) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  // Generate a beautiful, deterministic HSL background color based on name string
  const getBackgroundColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash % 360);
    // Use rich, beautiful HSL values with moderate saturation and pleasant brightness
    return `hsl(${h}, 55%, 42%)`;
  };

  const initials = getInitials(name);
  const bgColor = getBackgroundColor(name);

  if (!src || error) {
    return (
      <div 
        className={`rounded-full flex items-center justify-center font-black text-white shadow-sm flex-shrink-0 text-xs border border-white/20 select-none transition-all duration-300
          ${className}
          ${!active ? 'grayscale opacity-60' : ''}
        `}
        style={{ backgroundColor: bgColor }}
        title={name}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setError(true)}
      referrerPolicy="no-referrer"
      className={`rounded-full object-cover flex-shrink-0 transition-all duration-300
        ${className}
        ${!active ? 'grayscale opacity-60' : ''}
      `}
    />
  );
}
