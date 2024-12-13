import { ZERO_BIG_INT } from '@webb-tools/dapp-config/constants';
import safeParseUnits from '@webb-tools/tangle-shared-ui/utils/safeParseUnits';
import Decimal from 'decimal.js';

/**
 * Get the shared amount validation for react-hook-form
 * amount input.
 *
 * @param step the input step value
 * @param minFormatted the minimum amount formatted
 * @param min the minimum amount raw in bigint
 * @param max the maximum amount raw in bigint
 * @param assetDecimals the asset decimals
 * @param assetSymbol the asset symbol
 * @returns the amount validation object for react-hook-form
 * amount input
 */
export function getAmountValidation(
  step: string,
  minFormatted?: string,
  min?: bigint,
  max?: bigint,
  assetDecimals?: number,
  assetSymbol?: string,
) {
  return {
    // Check amount with asset denomination
    shouldDivisibleWithDecimals: (value: string) => {
      return (
        Decimal.mod(value, step).isZero() ||
        `Amount must be divisible by ${step} ${assetDecimals !== null && assetSymbol !== null ? `, as ${assetSymbol} has ${assetDecimals} decimals` : ''}`.trim()
      );
    },
    shouldNotBeZero: (value: string) => {
      const parsed = safeParseUnits(value, assetDecimals);
      if (!parsed.sucess) return true;

      return (
        parsed.value !== ZERO_BIG_INT || 'Amount must be greater than zero'
      );
    },
    shouldNotLessThanMin: (value: string) => {
      if (typeof min !== 'bigint') return true;

      const parsed = safeParseUnits(value, assetDecimals);
      if (!parsed.sucess) return true;

      return (
        parsed.value >= min ||
        `Amount must be at least ${minFormatted} ${assetSymbol ?? ''}`.trim()
      );
    },
    shouldNotExceedMax: (value: string) => {
      if (typeof max !== 'bigint') return true;

      const parsed = safeParseUnits(value, assetDecimals);
      if (!parsed.sucess) return true;

      return parsed.value <= max || 'Amount exceeds balance';
    },
  };
}
