import React from 'react';
import { cn } from '@/lib/utils';

interface FineLineButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const FineLineButton: React.FC<FineLineButtonProps> = ({
  children,
  icon,
  variant = 'primary',
  className,
  ...props
}) => {
  const variants = {
    primary: 'border-indigo-600 text-indigo-600 hover:bg-indigo-50',
    secondary: 'border-gray-800 text-gray-800 hover:bg-gray-50',
  };

  return (
    <button
      className={cn(
        'group relative px-8 py-3 font-medium border transition-all duration-300',
        'hover:shadow-sm tracking-wide',
        'flex items-center gap-2',
        variants[variant],
        className
      )}
      {...props}
    >
      {icon && (
        <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
          {icon}
        </span>
      )}
      <span>{children}</span>
    </button>
  );
};

// Example icon component (small tattoo motif)
export const TattooIcon: React.FC<{ type?: 'star' | 'heart' | 'rose' }> = ({ type = 'star' }) => {
  const icons = {
    star: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 2L9 6L13 6L10 9L11 13L8 10.5L5 13L6 9L3 6L7 6Z" />
      </svg>
    ),
    heart: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 13.5L3 8.5C1.5 7 1.5 4.5 3 3C4.5 1.5 7 1.5 8 3C9 1.5 11.5 1.5 13 3C14.5 4.5 14.5 7 13 8.5L8 13.5Z" />
      </svg>
    ),
    rose: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="7" r="3" />
        <path d="M8 10L8 14M6 12L10 12" />
      </svg>
    ),
  };

  return icons[type];
};
