import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | number;
  showWordmark?: boolean;
  showMotto?: boolean;
  className?: string;
  isSpinning?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showWordmark = true,
  showMotto = false,
  className = '',
  isSpinning = false,
}) => {
  let iconSize = 36;
  if (typeof size === 'number') {
    iconSize = size;
  } else if (size === 'sm') {
    iconSize = 28;
  } else if (size === 'lg') {
    iconSize = 48;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Philippine Sun & Converter Swap Disc */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="256 124 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Isal.in Multi-Converter Logo"
        className={`shrink-0 drop-shadow-xs transition-transform duration-200 hover:scale-105 ${
          isSpinning ? 'animate-[isal-spin-smooth_2.8s_linear_infinite]' : ''
        }`}
      >
        <title>Isal.in Multi-Converter</title>
        <defs>
          <clipPath id="bl_disc">
            <circle r="128" />
          </clipPath>
          <linearGradient id="bl_sun" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFD83A" />
            <stop offset="1" stopColor="#F5B800" />
          </linearGradient>
          <filter id="bl_soft" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0b1f5c" floodOpacity="0.25" />
          </filter>
        </defs>

        <g transform="translate(512 380)">
          {/* 16-point Philippine Sun Rays */}
          <g fill="url(#bl_sun)" filter="url(#bl_soft)">
            <polygon points="-29.1,-147.1 0.0,-232.0 29.1,-147.1" />
            <polygon points="35.5,-145.7 76.5,-184.8 77.9,-128.2" />
            <polygon points="83.4,-124.6 164.0,-164.0 124.6,-83.4" />
            <polygon points="128.2,-77.9 184.8,-76.5 145.7,-35.5" />
            <polygon points="147.1,-29.1 232.0,0.0 147.1,29.1" />
            <polygon points="145.7,35.5 184.8,76.5 128.2,77.9" />
            <polygon points="124.6,83.4 164.0,164.0 83.4,124.6" />
            <polygon points="77.9,128.2 76.5,184.8 35.5,145.7" />
            <polygon points="29.1,147.1 0.0,232.0 -29.1,147.1" />
            <polygon points="-35.5,145.7 -76.5,184.8 -77.9,128.2" />
            <polygon points="-83.4,124.6 -164.0,164.0 -124.6,83.4" />
            <polygon points="-128.2,77.9 -184.8,76.5 -145.7,35.5" />
            <polygon points="-147.1,29.1 -232.0,0.0 -147.1,-29.1" />
            <polygon points="-145.7,-35.5 -184.8,-76.5 -128.2,-77.9" />
            <polygon points="-124.6,-83.4 -164.0,-164.0 -83.4,-124.6" />
            <polygon points="-77.9,-128.2 -76.5,-184.8 -35.5,-145.7" />
          </g>

          {/* Golden Rim */}
          <circle r="146" fill="#FCD116" />

          {/* Philippine Flag Two-Tone Core (Blue & Red) */}
          <g clipPath="url(#bl_disc)">
            <rect x="-130" y="-130" width="260" height="260" fill="#0038A8" />
            <polygon points="130,-130 130,130 -130,130" fill="#CE1126" />
          </g>

          {/* Inner Accent Ring */}
          <circle r="128" fill="none" stroke="#fff" strokeWidth="5" opacity="0.9" />

          {/* Bidirectional Swap Arcs */}
          <g fill="none" stroke="#fff" strokeWidth="17" strokeLinecap="round">
            <path d="M-62.0 -22.6 A66 66 0 0 1 37.9 -54.1" />
            <path d="M62.0 22.6 A66 66 0 0 1 -37.9 54.1" />
          </g>

          {/* Swap Arrow Heads */}
          <g fill="#fff" stroke="#fff" strokeWidth="4" strokeLinejoin="round">
            <polygon points="24.1,-34.4 62.4,-36.9 51.6,-73.7" />
            <polygon points="-24.1,34.4 -62.4,36.9 -51.6,73.7" />
          </g>
        </g>
      </svg>

      {/* Brand Wordmark matching the Philippine flag theme */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <div className="flex items-center gap-1">
            <span className="font-extrabold tracking-tight text-base sm:text-lg text-[#0038A8] dark:text-[#60A5FA]">
              isal
            </span>
            <span className="w-2 h-2 rounded-full bg-[#F5B800] inline-block shadow-xs" />
            <span className="font-extrabold tracking-tight text-base sm:text-lg text-[#CE1126] dark:text-[#F87171]">
              in
            </span>
          </div>
          <span className="text-[9px] font-mono tracking-widest uppercase text-neutral-500 dark:text-neutral-400 font-medium">
            Multi-Converter
          </span>
          {showMotto && (
            <span className="text-[10px] italic font-semibold text-amber-600 dark:text-amber-400 mt-1 tracking-tight">
              Isalin ang lahat. Convert anything.
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
