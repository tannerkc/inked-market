import React from 'react';
import { cn } from '@/lib/utils';
import { HandDrawnBorder, InkTextureFilter } from './svg-helpers';

interface HandDrawnButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const HandDrawnButton: React.FC<HandDrawnButtonProps> = ({
  children,
  variant = 'primary',
  className,
  ...props
}) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'bg-transparent text-indigo-600 hover:bg-indigo-50',
  };

  return (
    <>
      <InkTextureFilter />
      <button
        className={cn(
          'relative px-8 py-3 font-medium transition-all duration-200',
          'hover:scale-105',
          variants[variant],
          className
        )}
        style={{ filter: 'url(#ink-texture)' }}
        {...props}
      >
        <HandDrawnBorder className="text-current opacity-80" />
        <span className="relative z-10">{children}</span>
      </button>
    </>
  );
};
