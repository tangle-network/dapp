import addCommasToNumber from './addCommasToNumber';

/**
 * Pure-`bigint` formatting utilities. This module does **not** import from
 * `@polkadot/*`, so it can be safely used on EVM-only routes without pulling
 * in the polkadot vendor chunk.
 *
 * `formatBn` (BN-based) lives in a separate module so substrate-only flows
 * still work, but the eager-load path goes through `formatBigInt`.
 */

export type FormatBigIntOptions = {
  includeCommas: boolean;
  trimTrailingZeroes: boolean;
  withSi?: boolean;

  /**
   * Leave `undefined` to show the entire fraction part.
   */
  fractionMaxLength?: number;
};

const DEFAULT_FORMAT_OPTIONS: FormatBigIntOptions = {
  fractionMaxLength: 4,
  includeCommas: false,
  trimTrailingZeroes: true,
  withSi: false,
};

// `tsconfig.base.json` targets ES6, so bigint literals (`10n`) cannot be
// used. We construct the constants via `BigInt(...)` instead. The runtime
// requires `bigint` support (ES2020+), which is covered by Vite's
// `target: 'es2022'` build setting and all currently-supported browsers.
const ZERO = BigInt(0);
const TEN = BigInt(10);

type SiUnit = { power: bigint; suffix: string };

const SI_UNITS: ReadonlyArray<SiUnit> = [
  { power: BigInt(24), suffix: 'Y' },
  { power: BigInt(21), suffix: 'Z' },
  { power: BigInt(18), suffix: 'E' },
  { power: BigInt(15), suffix: 'P' },
  { power: BigInt(12), suffix: 'T' },
  { power: BigInt(9), suffix: 'G' },
  { power: BigInt(6), suffix: 'M' },
  { power: BigInt(3), suffix: 'k' },
  { power: ZERO, suffix: '' },
  { power: BigInt(-3), suffix: 'm' },
  { power: BigInt(-6), suffix: 'µ' },
  { power: BigInt(-9), suffix: 'n' },
  { power: BigInt(-12), suffix: 'p' },
  { power: BigInt(-15), suffix: 'f' },
];

const pow10 = (n: bigint): bigint => {
  // bigint exponentiation isn't available at ES6 target via the `**`
  // operator on bigint. Multiply iteratively instead. `n` here is always a
  // small magnitude (token decimals + SI power, typically <= 30), so this
  // stays cheap.
  if (n < ZERO) {
    throw new Error(`pow10: exponent must be non-negative, got ${n}`);
  }

  let result = BigInt(1);
  let remaining = n;
  while (remaining > ZERO) {
    result = result * TEN;
    remaining = remaining - BigInt(1);
  }
  return result;
};

const splitIntoIntegerAndFraction = (
  amount: bigint,
  decimals: number,
): { integerPart: string; fractionPart: string; isNegative: boolean } => {
  const isNegative = amount < ZERO;
  const absAmount = isNegative ? -amount : amount;
  const factor = pow10(BigInt(decimals));

  const integerBn = absAmount / factor;
  const remainderBn = absAmount % factor;
  const integerPart = integerBn.toString();

  // Pad with leading zeros so the fractional part has `decimals` digits.
  const fractionPart = remainderBn.toString().padStart(decimals, '0');

  return { integerPart, fractionPart, isNegative };
};

const trimFraction = (
  fractionPart: string,
  options: FormatBigIntOptions,
  decimals: number,
): string => {
  let next = fractionPart;

  if (options.fractionMaxLength !== undefined) {
    next = next.substring(0, options.fractionMaxLength);
  }

  if (options.trimTrailingZeroes) {
    while (next.endsWith('0')) {
      next = next.substring(0, next.length - 1);
    }
  } else {
    next = next.padEnd(options.fractionMaxLength ?? decimals, '0');
  }

  return next;
};

const formatSiBigInt = (
  amount: bigint,
  decimals: number,
  options: FormatBigIntOptions,
): string => {
  const isNegative = amount < ZERO;
  const absAmount = isNegative ? -amount : amount;

  if (absAmount === ZERO) {
    return '0';
  }

  // Determine the "natural" base-10 magnitude of the value (i.e. how many
  // digits are to the left of the decimal point given `decimals`).
  const decimalsBig = BigInt(decimals);
  const valueDigits = BigInt(absAmount.toString().length);
  const magnitude = valueDigits - decimalsBig - BigInt(1);

  // Pick the largest SI unit whose power <= magnitude (and >= 0 if the value
  // is >= 1, else allow negative powers for sub-unit values).
  const unit =
    SI_UNITS.find((u) => u.power <= magnitude && u.power >= ZERO) ??
    SI_UNITS.find((u) => u.power <= magnitude) ??
    SI_UNITS[SI_UNITS.length - 1];

  // Shift the value so the integer part is in the chosen SI unit.
  // value_in_unit = absAmount / 10^(decimals + unit.power)
  const shift = decimalsBig + unit.power;
  let integerPart: string;
  let fractionPart: string;

  if (shift >= ZERO) {
    const factor = pow10(shift);
    integerPart = (absAmount / factor).toString();
    fractionPart = (absAmount % factor).toString().padStart(Number(shift), '0');
  } else {
    // unit.power is more negative than -decimals — shouldn't normally happen,
    // but handle defensively by multiplying.
    const factor = pow10(-shift);
    integerPart = (absAmount * factor).toString();
    fractionPart = '';
  }

  fractionPart = trimFraction(fractionPart, options, decimals);

  let result =
    fractionPart === '' ? integerPart : `${integerPart}.${fractionPart}`;

  if (options.includeCommas) {
    const dotIdx = result.indexOf('.');
    const intPart = dotIdx === -1 ? result : result.substring(0, dotIdx);
    const fracPart = dotIdx === -1 ? '' : result.substring(dotIdx);
    result = addCommasToNumber(intPart) + fracPart;
  }

  if (isNegative) {
    result = `-${result}`;
  }

  return unit.suffix === '' ? result : `${result} ${unit.suffix}`;
};

/**
 * Format a `bigint` chain-units value into a human-readable string.
 *
 * Equivalent to {@link formatBn} but operates purely on `bigint`, so it does
 * not import from `@polkadot/util`.
 */
export function formatBigInt(
  amount: bigint,
  decimals: number,
  partialOptions?: Partial<FormatBigIntOptions>,
): string {
  const options: FormatBigIntOptions = {
    ...DEFAULT_FORMAT_OPTIONS,
    ...partialOptions,
  };

  if (options.withSi) {
    return formatSiBigInt(amount, decimals, options);
  }

  const { integerPart, fractionPart, isNegative } = splitIntoIntegerAndFraction(
    amount,
    decimals,
  );

  let trimmedFraction = trimFraction(fractionPart, options, decimals);

  // Near-zero edge case: integer is 0, fraction got truncated to empty,
  // but the original amount is non-zero. Indicate "<0.0001" style.
  let prefix = '';
  if (
    integerPart === '0' &&
    trimmedFraction === '' &&
    amount !== ZERO &&
    options.fractionMaxLength !== undefined
  ) {
    const len = options.fractionMaxLength ?? decimals;
    if (len > 0) {
      const padding = '0'.repeat(Math.max(len - 1, 0));
      trimmedFraction = `${padding}1`;
      prefix = '<';
    }
  }

  let formattedInteger = integerPart;
  if (options.includeCommas) {
    formattedInteger = addCommasToNumber(integerPart);
  }

  if (isNegative) {
    prefix = `-${prefix}`;
  }

  return trimmedFraction !== ''
    ? `${prefix}${formattedInteger}.${trimmedFraction}`
    : `${prefix}${formattedInteger}`;
}
