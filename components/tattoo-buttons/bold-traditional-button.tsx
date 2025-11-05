import React from 'react';
import { cn } from '@/lib/utils';

interface BoldTraditionalButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'red' | 'green' | 'blue' | 'yellow';
}

export const BoldTraditionalButton: React.FC<BoldTraditionalButtonProps> = ({
  children,
  variant = 'red',
  className,
  ...props
}) => {
  const variants = {
    red: 'bg-red-600 text-white',
    green: 'bg-green-600 text-white',
    blue: 'bg-indigo-600 text-white',
    yellow: 'bg-yellow-500 text-gray-900',
  };

  return (
    <button
      className={cn(
        'relative px-8 py-3 font-bold border-[3px] border-black transition-all duration-200',
        'hover:brightness-110 hover:shadow-lg',
        'shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)]',
        variants[variant],
        className
      )}
      {...props}
    >
      {/* Corner decorations */}
      <div className="absolute top-1 left-1 w-2 h-2 bg-black rounded-full opacity-40" />
      <div className="absolute top-1 right-1 w-2 h-2 bg-black rounded-full opacity-40" />
      <div className="absolute bottom-1 left-1 w-2 h-2 bg-black rounded-full opacity-40" />
      <div className="absolute bottom-1 right-1 w-2 h-2 bg-black rounded-full opacity-40" />

      <span className="relative z-10 tracking-wide">{children}</span>
    </button>
  );
};
