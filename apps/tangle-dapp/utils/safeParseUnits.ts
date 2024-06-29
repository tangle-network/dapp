import { DEFAULT_DECIMALS } from '@webb-tools/dapp-config/constants';
import { parseUnits } from 'viem';

import ensureError from './ensureError';

/**
 * A safe version of parseUnits that returns an error message instead of throwing
 * @param value the value to parse
 * @param decimals the decimals to use (@default DEFAULT_DECIMALS)
 * @returns either the parsed value or an error message
 */
export default function safeParseUnits(
  value: string,
  decimals: number = DEFAULT_DECIMALS,
):
  | {
      sucess: true;
      value: bigint;
    }
  | {
      sucess: false;
      error: string;
    } {
  try {
    const parsed = parseUnits(value, decimals);

    return {
      sucess: true,
      value: parsed,
    };
  } catch (error) {
    return {
      sucess: false,
      error: ensureError(error).message,
    };
  }
}
