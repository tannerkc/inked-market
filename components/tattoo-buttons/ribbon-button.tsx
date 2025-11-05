import React from 'react';
import { cn } from '@/lib/utils';
import { ribbonPath } from './svg-helpers';

interface RibbonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const RibbonButton: React.FC<RibbonButtonProps> = ({
  children,
  variant = 'primary',
  className,
  ...props
}) => {
  const variants = {
    primary: 'bg-gradient-to-b from-indigo-500 to-indigo-700 text-white',
    secondary: 'bg-gradient-to-b from-red-500 to-red-700 text-white',
  };

  return (
    <button
      className={cn(
        'relative px-10 py-4 font-bold transition-all duration-200',
        'hover:brightness-110',
        'shadow-md hover:shadow-lg',
        variants[variant],
        className
      )}
      style={{
        clipPath: ribbonPath,
      }}
      {...props}
    >
      <div
        className="absolute inset-0 opacity-30"
        style={{
          clipPath: ribbonPath,
          background: 'linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.3) 50%, transparent 60%)',
        }}
      />
      <span className="relative z-10 drop-shadow-md">{children}</span>
    </button>
  );
};
