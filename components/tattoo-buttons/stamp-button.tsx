import React from 'react';
import { cn } from '@/lib/utils';
import { DistressedBorder } from './svg-helpers';

interface StampButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const StampButton: React.FC<StampButtonProps> = ({
  children,
  variant = 'primary',
  className,
  ...props
}) => {
  const variants = {
    primary: 'bg-indigo-600/90 text-white hover:bg-indigo-700/90',
    secondary: 'bg-gray-800/90 text-white hover:bg-gray-900/90',
  };

  return (
    <button
      className={cn(
        'relative px-8 py-3 font-medium transition-all duration-200',
        'hover:scale-[0.98] active:scale-95',
        'transform rotate-[-1deg]',
        variants[variant],
        className
      )}
      style={{
        filter: 'contrast(1.1)',
      }}
      {...props}
    >
      <DistressedBorder className="text-current" />
      <span className="relative z-10">{children}</span>
    </button>
  );
};
