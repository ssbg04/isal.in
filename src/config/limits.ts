export interface UsageLimits {
  maxSingleFileMB: number;
  maxBatchTotalMB: number;
  maxBatchCount: number;
  maxConcurrent: number;
}

export const APP_LIMITS: { free: UsageLimits; pro: UsageLimits } = {
  free: {
    maxSingleFileMB: 25,
    maxBatchTotalMB: 50,
    maxBatchCount: 5,
    maxConcurrent: 2,
  },
  pro: {
    maxSingleFileMB: 500,
    maxBatchTotalMB: 2000,
    maxBatchCount: 100,
    maxConcurrent: 10,
  },
};

export const AD_CONFIG = {
  enabled: true,
  // Official EthicalAds demo publisher is 'ethicalads' (shows live test ads).
  // Once your site is approved by EthicalAds, replace 'ethicalads' with your custom Publisher ID.
  ethicalAdsPublisher: 'ethicalads',
  // EthicalAds recommends 1 prominent placement per page view (e.g. 'sidebar' or 'header')
  primaryPlacement: 'sidebar' as 'header' | 'sidebar' | 'between-content' | 'post-conversion',
  // Show clean mock banner card if ads are blocked or loading
  showMockFallback: true,
};
