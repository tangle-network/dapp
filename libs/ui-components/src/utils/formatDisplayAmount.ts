import type { BN } from '@polkadot/util';
import { formatBigInt } from './formatBigInt';

type FormatDisplayAmountOptions = {
  fractionMaxLength?: number;
};

export enum AmountFormatStyle {
  /**
   * Show the entire amount with all decimal places.
   *
   * Useful for displaying high precision balances such as the user's balance,
   * transaction amounts, etc.
   */
  EXACT,

  /**
   * Use SI units for large or small values.
   *
   * Useful for displaying balances that don't require high precision,
   * such as TVL, total supply, market cap, etc.
   */
  SI,

  /**
   * Display the full amount, with 4 decimal places at most.
   *
   * Useful for displaying balances in a compact format.
   */
  SHORT,
}

/**
 * Coerce a `BN`-like value (anything with a `.toString()` returning a numeric
 * string) into a `bigint` without importing the `BN` runtime.
 *
 * This lets `formatDisplayAmount` accept `BN` callers without statically
 * pulling `@polkadot/util` (which would yank the polkadot vendor chunk into
 * the eager bundle for EVM-only consumers).
 */
const toBigIntFromBnOrBigInt = (amount: BN | bigint): bigint => {
  if (typeof amount === 'bigint') {
    return amount;
  }

  // BN.toString() returns a base-10 numeric string, including a leading `-`
  // for negative values, which `BigInt(...)` parses correctly.
  return BigInt(amount.toString());
};

/**
 * Format a balance or token amount into a humanly-legible format,
 * with commas and in a certain format style.
 *
 * This should be the preferred, standardized way to format balances
 * for UI display.
 *
 * @remarks
 * Internally always uses `bigint` arithmetic so this function does not
 * import from `@polkadot/*`. `BN` inputs are converted via `.toString()`
 * (the `BN` import here is type-only and erased at build time).
 */
export const formatDisplayAmount = (
  amount: BN | bigint,
  decimals: number,
  style: AmountFormatStyle,
  options?: FormatDisplayAmountOptions,
): string => {
  const value = toBigIntFromBnOrBigInt(amount);

  return formatBigInt(value, decimals, {
    includeCommas: true,
    withSi: style === AmountFormatStyle.SI ? true : undefined,
    fractionMaxLength:
      style === AmountFormatStyle.SHORT
        ? (options?.fractionMaxLength ?? 4)
        : options?.fractionMaxLength,
  });
};
