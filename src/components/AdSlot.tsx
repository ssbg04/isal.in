import React, { useEffect, useRef } from 'react';
import { AD_CONFIG } from '../config/limits';

declare global {
  interface Window {
    ethicalads?: {
      load: () => void;
      wait?: Promise<void>;
      reload?: () => void;
    };
  }
}

interface AdSlotProps {
  placement: 'header' | 'sidebar' | 'between-content' | 'post-conversion';
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ placement, className = '' }) => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  const isPrimary = placement === AD_CONFIG.primaryPlacement;

  const configs = {
    header: {
      type: 'Display Banner',
      dimensions: 'Responsive 728×90 / 320×50',
      containerClass: 'min-h-[80px] sm:min-h-[96px] w-full max-w-3xl mx-auto',
    },
    sidebar: {
      type: 'Partner Spotlight',
      dimensions: '300×250 Rectangle',
      containerClass: 'w-full min-h-[250px]',
    },
    'between-content': {
      type: 'Editorial Recommendation',
      dimensions: 'Fluid Feed Unit',
      containerClass: 'min-h-[96px] w-full max-w-3xl mx-auto my-8',
    },
    'post-conversion': {
      type: 'Suggested Utility',
      dimensions: 'Non-blocking Card',
      containerClass: 'min-h-[112px] w-full max-w-xl mx-auto mt-6',
    },
  };

  const item = configs[placement];

  useEffect(() => {
    if (AD_CONFIG.enabled && isPrimary && typeof window !== 'undefined') {
      try {
        if (window.ethicalads) {
          window.ethicalads.load();
        }
      } catch (err) {
        console.warn('EthicalAds loading error:', err);
      }
    }
  }, [isPrimary]);

  return (
    <aside
      role="region"
      aria-label="Sponsor"
      className={`relative flex flex-col items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-50/60 dark:border-neutral-800/80 dark:bg-neutral-900/40 p-3 text-center transition-colors ${item.containerClass} ${className}`}
    >
      {/* If EthicalAds is active on this placement, render the data-ea-publisher container */}
      {AD_CONFIG.enabled && isPrimary ? (
        <div className="w-full flex flex-col items-center justify-center">
          <div
            ref={adContainerRef}
            id={`ea-${placement}`}
            data-ea-publisher={AD_CONFIG.ethicalAdsPublisher}
            data-ea-type="image"
            data-ea-style="fixedfont"
            className="adaptive w-full flex justify-center text-xs"
          />
        </div>
      ) : (
        /* Secondary / fallback placeholder */
        <>
          <span className="absolute top-2 right-2.5 text-[9px] uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-medium">
            Sponsored
          </span>
          <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
            {item.type}
          </p>
          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
            {item.dimensions}
          </p>
        </>
      )}
    </aside>
  );
};
