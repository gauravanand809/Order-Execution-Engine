export const JOB_STATUSES = {
  PENDING: "PENDING",
  ROUTING: "ROUTING",
  BUILDING: "BUILDING",
  SUBMITTED: "SUBMITTED",
  CONFIRMED: "CONFIRMED",
  FAILED: "FAILED"
} as const;

export const DEX_PROVIDERS = {
  RAYDIUM: "Raydium",
  METEORA: "Meteora"
} as const;

export const DEFAULT_SLIPPAGE_TOLERANCE = 0.01; // 1%