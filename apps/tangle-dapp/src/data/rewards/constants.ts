/**
 * Constants for rewards calculations and polling configuration.
 */

/** Precision constants for bigint arithmetic */
export const PRECISION = {
  /** 6 decimal places for share calculations */
  STANDARD: 1_000_000,
  /** For intermediate calculations */
  SCALE: 100,
  /** 10000 = 100% (1.0x) for basis points */
  BASIS_POINTS: 10_000,
} as const;

/** Time constants in seconds */
export const TIME = {
  SECONDS_PER_DAY: 86_400,
  SECONDS_PER_YEAR: 31_536_000,
  /** Minimum epoch length threshold to avoid division by zero */
  MIN_EPOCH_LENGTH_SECONDS: 60,
} as const;

/** Polling intervals in milliseconds */
export const POLLING_INTERVALS = {
  /** Pending rewards refresh interval (30s) */
  PENDING_REWARDS: 30_000,
  /** Delegator positions refresh interval (30s) */
  DELEGATOR_POSITIONS: 30_000,
  /** Vault summaries refresh interval (60s) */
  VAULT_SUMMARIES: 60_000,
  /** Epoch info refresh interval (60s) */
  EPOCH_INFO: 60_000,
} as const;

/** APY display limits */
export const APY_LIMITS = {
  /** Maximum reasonable APY percentage */
  MAX_APY: 10_000,
  /** Minimum APY to display (below this shows "< 0.01%") */
  MIN_DISPLAY_APY: 0.01,
} as const;
