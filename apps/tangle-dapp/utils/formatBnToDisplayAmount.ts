import { BN } from '@polkadot/util';
import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config/constants/tangle';

/**
 * When the user inputs an amount in the UI, say using an Input
 * component, the amount needs to be treated as if it were in chain
 * units (18 decimals).
 *
 * For example, this ensures that when he user inputs `1`, they mean
 * `1` token, and not the smallest unit possible.
 *
 * To have the amount be in proper form, it needs to be multiplied by
 * this factor (input amount * 10^18).
 */
export const CHAIN_UNIT_CONVERSION_FACTOR = new BN(10).pow(
  new BN(TANGLE_TOKEN_DECIMALS)
);

export type FormatOptions = {
  includeCommas: boolean;
  fractionLength?: number;
  padZerosInFraction: boolean;
};

const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  fractionLength: 4,
  includeCommas: true,
  padZerosInFraction: false,
};

function formatBnToDisplayAmount(
  amount: BN,
  options?: Partial<FormatOptions>
): string {
  const finalOptions = { ...DEFAULT_FORMAT_OPTIONS, ...options };
  const divisor = CHAIN_UNIT_CONVERSION_FACTOR;
  const divided = amount.div(divisor);
  const remainder = amount.mod(divisor);

  let integerPart = divided.toString(10);

  // Convert remainder to a string and pad with zeros if necessary.
  let remainderString = remainder.toString(10);

  // There is a case when the decimals part has leading 0s, so that the remaining
  // string can missing those 0s when we use `mod` method.
  // Solution: Try to construct the string again and check the length,
  // if the length is not the same, we can say that the remainder string is missing
  // leading 0s, so we try to prepend those 0s to the remainder string
  if (amount.toString().length !== (integerPart + remainderString).length) {
    const missing0sCount =
      amount.toString().length - (integerPart + remainderString).length;

    remainderString =
      Array.from({ length: missing0sCount })
        .map(() => '0')
        .join('') + remainderString;
  }

  if (finalOptions.padZerosInFraction) {
    remainderString = remainderString.padStart(TANGLE_TOKEN_DECIMALS, '0');
  }

  remainderString = remainderString.substring(0, finalOptions.fractionLength);

  // Remove trailing 0s.
  while (remainderString.endsWith('0')) {
    remainderString = remainderString.substring(0, remainderString.length - 1);
  }

  // Insert commas in the integer part if requested.
  if (finalOptions.includeCommas) {
    // TODO: Avoid using regex, it's confusing.
    integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // TODO: Make the condition explicit. Is it checking for an empty string?
  // Combine the integer and decimal parts.
  return remainderString ? `${integerPart}.${remainderString}` : integerPart;
}

export default formatBnToDisplayAmount;
