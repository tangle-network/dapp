/**
 * Minimum claimable credit amount.
 * Credits in the merkle tree are stored as raw amounts, not wei.
 */
export const MINIMUM_CLAIMABLE_CREDITS = 0.01;

/**
 * Checks if the credit amount meets the minimum claimable threshold.
 */
export const meetsMinimumClaimThreshold = (
  amount: bigint | null | undefined,
): boolean => {
  if (!amount || amount === BigInt(0)) {
    return false;
  }

  return Number(amount) >= MINIMUM_CLAIMABLE_CREDITS;
};

/**
 * Calculates how much more credits are needed to reach the minimum threshold.
 */
export const getCreditsNeededForMinimum = (
  amount: bigint | null | undefined,
): number => {
  if (!amount) {
    return MINIMUM_CLAIMABLE_CREDITS;
  }

  const numAmount = Number(amount);
  if (numAmount >= MINIMUM_CLAIMABLE_CREDITS) {
    return 0;
  }

  return MINIMUM_CLAIMABLE_CREDITS - numAmount;
};
