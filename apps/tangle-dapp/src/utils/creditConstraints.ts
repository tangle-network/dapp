import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';

/**
 * Minimum claimable credit amount (0.01 tokens).
 */
export const MINIMUM_CLAIMABLE_CREDITS = BigInt(
  Math.pow(10, TANGLE_TOKEN_DECIMALS - 2),
);

/**
 * Checks if the credit amount meets the minimum claimable threshold.
 */
export const meetsMinimumClaimThreshold = (
  amount: bigint | null | undefined,
): boolean => {
  if (!amount || amount === BigInt(0)) {
    return false;
  }

  return amount >= MINIMUM_CLAIMABLE_CREDITS;
};

/**
 * Calculates how much more credits are needed to reach the minimum threshold.
 */
export const getCreditsNeededForMinimum = (
  amount: bigint | null | undefined,
): bigint => {
  if (!amount) {
    return MINIMUM_CLAIMABLE_CREDITS;
  }

  if (amount >= MINIMUM_CLAIMABLE_CREDITS) {
    return BigInt(0);
  }

  return MINIMUM_CLAIMABLE_CREDITS - amount;
};
