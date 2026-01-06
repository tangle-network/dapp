/**
 * Minimum claimable credit amount (in display units).
 * Credits in the merkle tree are stored as raw amounts, not wei.
 */
export const MINIMUM_CLAIMABLE_CREDITS = 0.01;

/**
 * Scale factor for credit precision (2 decimal places).
 * Used to convert between display amounts and BigInt comparisons.
 */
const CREDIT_SCALE = BigInt(100);

/**
 * Minimum claimable credits as BigInt (scaled by CREDIT_SCALE).
 */
const MINIMUM_CLAIMABLE_CREDITS_SCALED = BigInt(
  Math.round(MINIMUM_CLAIMABLE_CREDITS * Number(CREDIT_SCALE)),
);

/**
 * Checks if the credit amount meets the minimum claimable threshold.
 * Uses BigInt comparison to avoid precision loss with large values.
 */
export const meetsMinimumClaimThreshold = (
  amount: bigint | null | undefined,
): boolean => {
  if (!amount || amount === BigInt(0)) {
    return false;
  }

  // Scale the amount for comparison to avoid floating-point precision issues
  const scaledAmount = amount * CREDIT_SCALE;
  return scaledAmount >= MINIMUM_CLAIMABLE_CREDITS_SCALED;
};

/**
 * Calculates how much more credits are needed to reach the minimum threshold.
 * Returns 0 if the minimum threshold is already met.
 */
export const getCreditsNeededForMinimum = (
  amount: bigint | null | undefined,
): number => {
  if (!amount) {
    return MINIMUM_CLAIMABLE_CREDITS;
  }

  // For display purposes, safe to convert to Number since credit amounts
  // are raw amounts (not wei) and expected to be within safe integer range
  const numAmount = Number(amount);

  if (numAmount >= MINIMUM_CLAIMABLE_CREDITS) {
    return 0;
  }

  // Round to avoid floating-point precision artifacts
  const scale = Number(CREDIT_SCALE);
  return Math.round((MINIMUM_CLAIMABLE_CREDITS - numAmount) * scale) / scale;
};
