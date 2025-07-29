import { BN } from '@polkadot/util';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';

/**
 * Minimum claimable credit amount (0.01 tokens).
 */
export const MINIMUM_CLAIMABLE_CREDITS = new BN(10).pow(new BN(TANGLE_TOKEN_DECIMALS - 2));

/**
 * Checks if the credit amount meets the minimum claimable threshold.
 */
export const meetsMinimumClaimThreshold = (amount: BN | null | undefined): boolean => {
  if (!amount || amount.isZero()) {
    return false;
  }
  
  return amount.gte(MINIMUM_CLAIMABLE_CREDITS);
};

/**
 * Calculates how much more credits are needed to reach the minimum threshold.
 */
export const getCreditsNeededForMinimum = (amount: BN | null | undefined): BN => {
  if (!amount) {
    return MINIMUM_CLAIMABLE_CREDITS;
  }
  
  if (amount.gte(MINIMUM_CLAIMABLE_CREDITS)) {
    return new BN(0);
  }
  
  return MINIMUM_CLAIMABLE_CREDITS.sub(amount);
};
