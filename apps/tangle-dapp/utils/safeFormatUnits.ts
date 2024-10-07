import { DEFAULT_DECIMALS } from '@webb-tools/dapp-config/constants';
import { formatUnits } from 'viem';

import ensureError from './ensureError';

/**
 * A safe version of formatUnits that returns an error message instead of throwing
 * @param value the value to format
 * @param decimals the decimals to use (@default DEFAULT_DECIMALS)
 * @returns either the formatted value or an error message
 */
export default function safeFormatUnits(
  value: bigint,
  decimals: number = DEFAULT_DECIMALS,
):
  | {
      success: true;
      value: string;
    }
  | {
      success: false;
      error: string;
    } {
  try {
    const formatted = formatUnits(value, decimals);

    return {
      success: true,
      value: formatted,
    };
  } catch (error) {
    return {
      success: false,
      error: ensureError(error).message,
    };
  }
}
