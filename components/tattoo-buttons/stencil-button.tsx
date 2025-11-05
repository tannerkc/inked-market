import React from 'react';
import { cn } from '@/lib/utils';
import { HalftonePattern } from './svg-helpers';

interface StencilButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'purple' | 'blue';
}

export const StencilButton: React.FC<StencilButtonProps> = ({
  children,
  variant = 'purple',
  className,
  ...props
}) => {
  const variants = {
    purple: 'bg-purple-600/70 hover:bg-purple-600/80',
    blue: 'bg-indigo-600/70 hover:bg-indigo-600/80',
  };

  return (
    <>
      <HalftonePattern />
      <button
        className={cn(
          'relative px-8 py-3 font-bold text-white transition-all duration-200',
          'border-2 border-current',
          'hover:shadow-md',
          variants[variant],
          className
        )}
        style={{
          backgroundImage: 'url(#halftone)',
          backdropFilter: 'blur(0.5px)',
        }}
        {...props}
      >
        <div
          className="absolute inset-0 opacity-20 mix-blend-multiply"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence baseFrequency=\'0.65\' numOctaves=\'3\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
          }}
        />
        <span className="relative z-10 tracking-wider">{children}</span>
      </button>
    </>
  );
};
