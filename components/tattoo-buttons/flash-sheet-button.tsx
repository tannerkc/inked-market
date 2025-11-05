import React from 'react';
import { cn } from '@/lib/utils';
import { CornerStars } from './svg-helpers';

interface FlashSheetButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const FlashSheetButton: React.FC<FlashSheetButtonProps> = ({
  children,
  variant = 'primary',
  className,
  ...props
}) => {
  const variants = {
    primary: 'bg-amber-50 text-gray-900 hover:bg-amber-100 border-gray-900',
    secondary: 'bg-white text-gray-900 hover:bg-gray-50 border-gray-900',
  };

  return (
    <button
      className={cn(
        'relative px-8 py-3 font-bold border-4 transition-all duration-200',
        'hover:shadow-lg font-sans tracking-wide',
        variants[variant],
        className
      )}
      style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence baseFrequency=\'0.9\' numOctaves=\'3\' /%3E%3CfeColorMatrix values=\'0 0 0 0 0.9 0 0 0 0 0.9 0 0 0 0 0.9 0 0 0 0.02 0\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
      }}
      {...props}
    >
      <CornerStars className="text-gray-900 opacity-60" />
      <span className="relative z-10">{children}</span>
    </button>
  );
};
