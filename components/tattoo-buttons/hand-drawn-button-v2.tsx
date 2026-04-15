import React from 'react';
import { cn } from '@/lib/utils';
import { Caveat } from 'next/font/google';

const caveat = Caveat({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

// Animated border that redraws on hover like tattoo stencil being traced
const AnimatedBorder: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    viewBox="0 0 200 60"
    preserveAspectRatio="none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Border path that animates on hover */}
    <path
      d="M3,4 Q25,2.5 50,3 T100,3.5 Q150,3 175,3.5 T197,4.5 L197,55.5 Q175,57 150,56.5 T100,56 Q50,56.5 25,57 T3,55.5 Z"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      className="transition-all duration-500 group-hover:stroke-[3] group-hover:animate-[redraw_0.8s_ease-out]"
      style={{
        strokeDasharray: '600',
        strokeDashoffset: '0',
      }}
    />
  </svg>
);

// Scribble fill effect - diagonal hatching that appears on hover
const ScribbleFill: React.FC = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-[0.08] transition-opacity duration-700"
    viewBox="0 0 200 60"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Diagonal scribble lines - like tattoo shading */}
    <defs>
      <pattern id="scribble" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
        <path d="M0,8 L8,0 M-2,2 L2,-2 M6,10 L10,6" stroke="currentColor" strokeWidth="0.5" opacity="0.8" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#scribble)" />
  </svg>
);

// Subtle paper texture overlay
const PaperTexture: React.FC = () => (
  <div
    className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-lg"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
);

interface HandDrawnButtonV2Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'dark';
}

export const HandDrawnButtonV2: React.FC<HandDrawnButtonV2Props> = ({
  children,
  variant = 'primary',
  className,
  ...props
}) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-700',
    secondary: 'bg-white text-gray-900 hover:bg-gray-50 border-gray-900',
    outline: 'bg-transparent text-indigo-600 hover:bg-indigo-50 border-indigo-600',
    dark: 'bg-gray-900 text-white hover:bg-gray-800 border-gray-700',
  };

  return (
    <button
      className={cn(
        'relative px-8 py-3.5 text-lg font-semibold transition-all duration-300 overflow-hidden',
        'hover:shadow-lg',
        'group tracking-wide',
        caveat.className,
        variants[variant],
        className
      )}
      {...props}
    >
      {/* Paper texture */}
      <PaperTexture />

      {/* Scribble fill that appears on hover - like tattoo shading */}
      <ScribbleFill />

      {/* Animated border that redraws on hover */}
      <AnimatedBorder className="text-current" />

      {/* Ink spread effect - darkens background slightly on hover */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-500 rounded-lg pointer-events-none" />

      {/* Button text with slight lift on hover */}
      <span className="relative z-10 inline-block transition-transform duration-300 group-hover:-translate-y-[1px]">
        {children}
      </span>

      {/* Border redraw animation — keyframes defined in globals.css */}
    </button>
  );
};
