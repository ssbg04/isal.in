import React from 'react';

interface AdSlotProps {
  placement: 'header' | 'sidebar' | 'between-content' | 'post-conversion';
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ placement, className = '' }) => {
  const configs = {
    header: {
      type: 'Display Banner',
      dimensions: 'Responsive 728×90 / 320×50',
      containerClass: 'h-20 sm:h-24 w-full max-w-3xl mx-auto',
    },
    sidebar: {
      type: 'Partner Spotlight',
      dimensions: '300×250 Rectangle',
      containerClass: 'w-full h-64',
    },
    'between-content': {
      type: 'Editorial Recommendation',
      dimensions: 'Fluid Feed Unit',
      containerClass: 'h-24 w-full max-w-3xl mx-auto my-8',
    },
    'post-conversion': {
      type: 'Suggested Utility',
      dimensions: 'Non-blocking Card',
      containerClass: 'h-28 w-full max-w-xl mx-auto mt-6',
    },
  };

  const item = configs[placement];

  return (
    <aside
      role="region"
      aria-label="Sponsor"
      className={`relative flex flex-col items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-50/60 dark:border-neutral-800/80 dark:bg-neutral-900/40 p-4 text-center select-none transition-colors ${item.containerClass} ${className}`}
    >
      <span className="absolute top-2 right-2.5 text-[9px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-medium">
        Sponsored
      </span>
      <p className="text-xs font-medium text-neutral-600 dark:text-neutral-300">
        {item.type}
      </p>
      <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
        {item.dimensions}
      </p>
    </aside>
  );
};
