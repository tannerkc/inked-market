import React from 'react';
import { cn } from '@/lib/utils';

interface SketchFillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const SketchFillButton: React.FC<SketchFillButtonProps> = ({
  children,
  variant = 'primary',
  className,
  ...props
}) => {
  const variants = {
    primary: 'border-indigo-600 text-indigo-600 [&_.fill]:bg-indigo-600',
    secondary: 'border-gray-800 text-gray-800 [&_.fill]:bg-gray-800',
  };

  return (
    <button
      className={cn(
        'group relative px-8 py-3 font-medium border-2 transition-all duration-300 overflow-hidden',
        'hover:text-white',
        variants[variant],
        className
      )}
      {...props}
    >
      {/* Animated fill background */}
      <div
        className="fill absolute inset-0 transition-transform duration-500 ease-out transform -translate-x-full group-hover:translate-x-0"
      />

      {/* Animated drawing effect */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ strokeDasharray: 1000, strokeDashoffset: 1000 }}
      >
        <rect
          x="2"
          y="2"
          width="calc(100% - 4px)"
          height="calc(100% - 4px)"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="group-hover:animate-[draw_0.5s_ease-out_forwards]"
        />
      </svg>

      <span className="relative z-10">{children}</span>

      <style jsx>{`
        @keyframes draw {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </button>
  );
};
