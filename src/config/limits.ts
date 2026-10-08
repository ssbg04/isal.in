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
  showMockBannersInDev: true,
};
