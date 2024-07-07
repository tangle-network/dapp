import { DEFAULT_DECIMALS } from '@webb-tools/dapp-config/constants';

/**
 * Convert decimals to input step
 * 18 decimals -> 0.000000000000000001
 *
 * @param decimals the number of decimals to convert to step
 * @returns the step value
 */
export default function decimalsToStep(decimals = DEFAULT_DECIMALS) {
  if (decimals === 0) return '1';

  return `0.${'0'.repeat(decimals - 1)}1`;
}
