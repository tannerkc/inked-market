import React from 'react';
import { cn } from '@/lib/utils';
import { Caveat } from 'next/font/google';

const caveat = Caveat({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

// Cleaner, more professional hand-drawn border with hover thickening
const CleanHandDrawnBorder: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    viewBox="0 0 200 60"
    preserveAspectRatio="none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Smoother, more controlled organic path - thickens on hover like fresh ink */}
    <path
      d="M3,4 Q25,2.5 50,3 T100,3.5 Q150,3 175,3.5 T197,4.5 L197,55.5 Q175,57 150,56.5 T100,56 Q50,56.5 25,57 T3,55.5 Z"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      className="transition-all duration-300 group-hover:stroke-[3.5]"
    />
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
        'relative px-8 py-3.5 text-lg font-semibold transition-all duration-300',
        // Tattoo machine buzz effect on hover
        'hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:animate-[tattoo-buzz_0.15s_ease-in-out_infinite]',
        'active:shadow-[0_0_10px_rgba(99,102,241,0.2)]',
        'group tracking-wide',
        caveat.className,
        variants[variant],
        className
      )}
      {...props}
    >
      {/* Paper texture */}
      <PaperTexture />

      {/* Hand-drawn border - thickens on hover like fresh ink application */}
      <CleanHandDrawnBorder className="text-current opacity-90 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Fresh ink glow effect - mimics the shine of fresh tattoo ink */}
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300 rounded-lg pointer-events-none" />

      {/* Radial glow that sweeps across like fresh ink catching light */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-lg overflow-hidden"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Button text */}
      <span className="relative z-10 inline-block group-hover:drop-shadow-sm">{children}</span>

      {/* Tattoo machine buzz animation */}
      <style jsx>{`
        @keyframes tattoo-buzz {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(-0.5px, 0.5px); }
          50% { transform: translate(0.5px, -0.5px); }
          75% { transform: translate(-0.5px, -0.5px); }
        }
      `}</style>
    </button>
  );
};
