import React, { useEffect, useState } from 'react';

interface LoadingScreenProps {
  isVisible: boolean;
  message?: string;
  subMessage?: string;
  onFinished?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  isVisible,
  message = 'Isalin ang lahat. Convert anything.',
  subMessage = 'Initializing 100% private sandbox...',
  onFinished,
}) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
      setIsFadingOut(false);
    } else {
      setIsFadingOut(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        if (onFinished) onFinished();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onFinished]);

  if (!shouldRender) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Isal.in Multi-Converter"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none bg-[#fafafa] dark:bg-[#0c0e14] transition-all duration-500 ease-out ${
        isFadingOut
          ? 'opacity-0 scale-105 blur-xs pointer-events-none'
          : 'opacity-100 scale-100 blur-none'
      }`}
    >
      {/* Ambient Radial Mesh Lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] sm:w-[520px] h-[380px] sm:h-[520px] bg-gradient-to-tr from-amber-500/15 via-amber-400/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-[280px] h-[280px] bg-blue-600/10 dark:bg-blue-600/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-[240px] h-[240px] bg-rose-600/10 dark:bg-rose-600/15 rounded-full blur-3xl" />
      </div>

      {/* Main Container Card */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 py-8 max-w-sm w-full mx-auto">
        {/* Spinning Logo Showcase */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-6">
          {/* Subtle Ambient Pulsing Glow Circle */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-amber-400/25 to-blue-500/20 blur-md animate-[isal-pulse-ambient_2.4s_ease-in-out_infinite]" />

          {/* Decorative Outer Dashed Orbit Ring (Slow reverse spin) */}
          <svg
            className="absolute inset-0 w-full h-full animate-[isal-spin-reverse_16s_linear_infinite] opacity-40 dark:opacity-50"
            viewBox="0 0 128 128"
            fill="none"
          >
            <circle
              cx="64"
              cy="64"
              r="60"
              stroke="url(#orbit_gradient)"
              strokeWidth="1.5"
              strokeDasharray="6 8"
              strokeLinecap="round"
            />
            <circle cx="64" cy="4" r="3" fill="#F5B800" />
            <defs>
              <linearGradient id="orbit_gradient" x1="0" y1="0" x2="128" y2="128">
                <stop offset="0%" stopColor="#0038A8" />
                <stop offset="50%" stopColor="#F5B800" />
                <stop offset="100%" stopColor="#CE1126" />
              </linearGradient>
            </defs>
          </svg>

          {/* The Spinning Isal.in Logo (Continuous smooth 360-degree rotation) */}
          <div className="relative z-10 w-20 h-20 flex items-center justify-center">
            <svg
              className="w-full h-full drop-shadow-[0_8px_20px_rgba(245,184,0,0.4)] animate-[isal-spin-smooth_2.8s_linear_infinite]"
              viewBox="256 124 512 512"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Isal.in Spinning Logo"
            >
              <defs>
                <clipPath id="ls_disc">
                  <circle r="128" />
                </clipPath>
                <linearGradient id="ls_sun" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#FFD83A" />
                  <stop offset="1" stopColor="#F5B800" />
                </linearGradient>
                <filter id="ls_soft" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0b1f5c" floodOpacity="0.3" />
                </filter>
              </defs>

              <g transform="translate(512 380)">
                {/* 16-point Philippine Sun Rays */}
                <g fill="url(#ls_sun)" filter="url(#ls_soft)">
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
                <g clipPath="url(#ls_disc)">
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
          </div>
        </div>

        {/* Brand Name Typography */}
        <div className="flex flex-col items-center mb-3">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-2xl text-[#0038A8] dark:text-[#60A5FA]">
              isal
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#F5B800] inline-block shadow-xs animate-ping" />
            <span className="font-extrabold tracking-tight text-2xl text-[#CE1126] dark:text-[#F87171]">
              in
            </span>
          </div>
          <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-neutral-500 dark:text-neutral-400 font-semibold mt-1">
            MULTI-CONVERTER
          </span>
        </div>

        {/* Tagline */}
        <p className="text-xs italic font-medium text-amber-600 dark:text-amber-400 mb-5">
          "{message}"
        </p>

        {/* Sleek Animated Progress Bar */}
        <div className="w-48 h-1 rounded-full bg-neutral-200/80 dark:bg-neutral-800 overflow-hidden relative mb-3">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500 to-transparent w-full animate-[isal-progress-sweep_1.6s_ease-in-out_infinite]" />
        </div>

        {/* Security / Sub-status note */}
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{subMessage}</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
