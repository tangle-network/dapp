import { BN } from '@polkadot/util';

/**
 * When the user inputs an amount in the UI, say using an Input
 * component, the amount needs to be treated as if it were in chain
 * units.
 *
 * For example, this ensures that when he user inputs `1`, they mean
 * `1` token, and not the smallest unit possible.
 *
 * To have the amount be in proper form, it needs to be multiplied by
 * this factor (input amount * 10^18).
 */

const convertChainUnitFactor = (decimals: number) => {
  return new BN(10).pow(new BN(decimals));
};

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
  decimals: number,
  options?: Partial<FormatOptions>,
): string {
  const finalOptions = { ...DEFAULT_FORMAT_OPTIONS, ...options };
  const divisor = convertChainUnitFactor(decimals);
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
    remainderString = remainderString.padStart(decimals, '0');
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
