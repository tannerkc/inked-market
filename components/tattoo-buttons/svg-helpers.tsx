import React from 'react';

// Hand-drawn wobbly border SVG
export const HandDrawnBorder: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    viewBox="0 0 200 60"
    preserveAspectRatio="none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2,3 Q50,1 100,2 T198,4 L197,56 Q150,58 100,57 T3,55 Z"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

// Corner decorations for flash sheet style
export const CornerStars: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    viewBox="0 0 200 60"
    preserveAspectRatio="none"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Top left star */}
    <path d="M8,8 L9,11 L12,11 L10,13 L11,16 L8,14 L5,16 L6,13 L4,11 L7,11 Z" />
    {/* Top right star */}
    <path d="M192,8 L193,11 L196,11 L194,13 L195,16 L192,14 L189,16 L190,13 L188,11 L191,11 Z" />
    {/* Bottom left star */}
    <path d="M8,52 L9,49 L12,49 L10,47 L11,44 L8,46 L5,44 L6,47 L4,49 L7,49 Z" />
    {/* Bottom right star */}
    <path d="M192,52 L193,49 L196,49 L194,47 L195,44 L192,46 L189,44 L190,47 L188,49 L191,49 Z" />
  </svg>
);

// Ribbon banner shape using clip-path coordinates
export const ribbonPath = "polygon(10% 0%, 90% 0%, 100% 20%, 95% 50%, 100% 80%, 90% 100%, 10% 100%, 0% 80%, 5% 50%, 0% 20%)";

// Distressed/stamp effect border
export const DistressedBorder: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    viewBox="0 0 200 60"
    preserveAspectRatio="none"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3,2 L5,1 L8,3 L12,2 L197,3 L198,5 L196,8 L198,12 L197,55 L195,56 L192,58 L8,57 L5,55 L3,52 L2,8 Z"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
      vectorEffect="non-scaling-stroke"
      strokeDasharray="1,1"
      opacity="0.8"
    />
  </svg>
);

// Halftone texture pattern
export const HalftonePattern: React.FC = () => (
  <svg width="0" height="0">
    <defs>
      <pattern id="halftone" x="0" y="0" width="4" height="4" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="0.8" fill="rgba(0,0,0,0.1)" />
      </pattern>
    </defs>
  </svg>
);

// Ink texture filter
export const InkTextureFilter: React.FC = () => (
  <svg width="0" height="0">
    <defs>
      <filter id="ink-texture">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
        <feColorMatrix type="saturate" values="0" />
        <feBlend in="SourceGraphic" mode="multiply" />
      </filter>
    </defs>
  </svg>
);
