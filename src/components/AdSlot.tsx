import React, { useEffect, useRef } from 'react';
import { AD_CONFIG } from '../config/limits';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdSlotProps {
  placement: 'header' | 'sidebar' | 'between-content' | 'post-conversion';
  className?: string;
}

const configs = {
  header: { type: 'Display Banner', dimensions: 'Responsive 728×90 / 320×50', containerClass: 'min-h-[80px] sm:min-h-[96px] w-full max-w-3xl mx-auto' },
  sidebar: { type: 'Partner Spotlight', dimensions: '300×250 Rectangle', containerClass: 'w-full min-h-[250px]' },
  'between-content': { type: 'Editorial Recommendation', dimensions: 'Fluid Feed Unit', containerClass: 'min-h-[96px] w-full max-w-3xl mx-auto my-8' },
  'post-conversion': { type: 'Suggested Utility', dimensions: 'Non-blocking Card', containerClass: 'min-h-[112px] w-full max-w-xl mx-auto mt-6' },
};

export const AdSlot: React.FC<AdSlotProps> = ({ placement, className = '' }) => {
  const adRef = useRef<HTMLModElement>(null);
  const item = configs[placement];
  const canRenderAd = AD_CONFIG.enabled && AD_CONFIG.googleClient && AD_CONFIG.googleSlot;

  useEffect(() => {
    if (!canRenderAd || !adRef.current || typeof window === 'undefined') return;

    const SCRIPT_ID = 'google-adsense-script';
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${AD_CONFIG.googleClient}`;
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    const pushAd = () => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        return;
      }
    };

    if (window.adsbygoogle) {
      pushAd();
    } else {
      script.addEventListener('load', pushAd, { once: true });
      window.setTimeout(pushAd, 300);
    }
  }, [canRenderAd]);

  return (
    <aside role="region" aria-label="Advertisement" className={`relative flex flex-col items-center justify-center rounded-xl border border-border bg-muted/40 p-3 text-center ${item.containerClass} ${className}`}>
      {canRenderAd ? (
        <ins
          ref={adRef}
          className="adsbygoogle block w-full"
          style={{ display: 'block', minHeight: 90 }}
          data-ad-client={AD_CONFIG.googleClient}
          data-ad-slot={AD_CONFIG.googleSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <>
          <span className="absolute top-2 right-2.5 text-[9px] uppercase tracking-wider text-muted-foreground">Sponsored</span>
          <p className="text-xs font-medium text-muted-foreground">{item.type}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{item.dimensions}</p>
        </>
      )}
    </aside>
  );
};
