import { BN, formatBalance } from '@polkadot/util';
import { merge } from 'lodash';

import addCommasToNumber from './addCommasToNumber';

/**
 * When the user inputs an amount in the UI, say using an Input
 * component, the amount needs to be treated as if it were in chain
 * units.
 *
 * For example, this ensures that when he user inputs `1`, they mean
 * `1` token, and not the smallest unit possible.
 *
 * To have the amount be in proper form, it needs to be multiplied by
 * this factor (input amount * 10^decimals).
 */
const getChainUnitFactor = (decimals: number) => {
  return new BN(10).pow(new BN(decimals));
};

export type FormatOptions = {
  includeCommas: boolean;
  trimTrailingZeroes: boolean;
  withSi?: boolean;

  /**
   * Leave `undefined` to show the entire fraction part.
   */
  fractionMaxLength?: number;
};

const DEFAULT_FORMAT_OPTIONS: FormatOptions = {
  fractionMaxLength: 4,
  includeCommas: false,
  trimTrailingZeroes: true,
  withSi: false,
};

type State = {
  suffix: string;
  integerPart: string;
  fractionPart: string;
  amount: BN;
  decimals: number;
  options: FormatOptions;
};

type StateTransition = (state: State) => Partial<State> | undefined;

/**
 * Edge case: When the amount is near zero, the integer part
 * is 0, and the fraction part is empty due to the max fractional
 * length being smaller than the total precision, add an indicator
 * that the amount is not actually zero, just really small.
 */
const nearZeroEdgeCase: StateTransition = ({
  suffix,
  integerPart,
  fractionPart,
  amount,
  options,
  decimals,
}) => {
  const isNearZero =
    integerPart === '0' && fractionPart === '' && !amount.isZero();

  if (isNearZero) {
    const nextFractionPart = '0'.repeat(
      (options.fractionMaxLength ?? decimals) - 1,
    );

    return {
      suffix: `${suffix}<`,
      integerPart: '0',
      fractionPart: `${nextFractionPart}1`,
    };
  }
};

/**
 * Check for missing leading zeros in the fraction part. This
 * edge case can happen when the remainder has fewer digits
 * than the specified decimals, resulting in a loss of leading
 * zeros when converting to a string, ex. 0001 -> 1.
 */
const missingLeadingZeroes: StateTransition = ({
  integerPart,
  fractionPart: fractionalPart,
  amount,
}) => {
  const amountStringLength = amount.toString().length;
  const partsLength = integerPart.length + fractionalPart.length;

  if (amountStringLength !== partsLength) {
    const missingZerosCount = amountStringLength - partsLength;

    return {
      integerPart: '0'.repeat(Math.max(missingZerosCount, 0)) + integerPart,
    };
  }
};

/**
 * Pad the end of the fraction part with zeros if applicable,
 * ex. 0.001 -> 0.0010 when the requested fraction length is 4.
 */
const padFractionPart: StateTransition = ({
  fractionPart,
  decimals,
  options,
}) => {
  if (!options.trimTrailingZeroes) {
    return {
      fractionPart: fractionPart.padEnd(
        options.fractionMaxLength ?? decimals,
        '0',
      ),
    };
  }
};

const addCommasToIntegerPart: StateTransition = ({ integerPart, options }) => {
  if (options.includeCommas) {
    return { integerPart: addCommasToNumber(integerPart) };
  }
};

const addPolarity: StateTransition = ({ amount, suffix }) => {
  if (amount.isNeg()) {
    return { suffix: `-${suffix}` };
  }
};

/**
 * Trim the fraction part to the desired length.
 */
const trimFractionPart: StateTransition = ({ fractionPart, options }) => {
  if (options.fractionMaxLength !== undefined) {
    return {
      fractionPart: fractionPart.substring(0, options.fractionMaxLength),
    };
  }
};

const removeTrailingZeroes: StateTransition = ({ fractionPart, options }) => {
  if (options.trimTrailingZeroes) {
    let nextFractionPart = fractionPart;

    while (nextFractionPart.endsWith('0')) {
      nextFractionPart = nextFractionPart.substring(
        0,
        nextFractionPart.length - 1,
      );
    }

    return { fractionPart: nextFractionPart };
  }
};

const applyTransition = (state: State, transition: StateTransition): State => {
  const nextState = transition(state);

  // No transformation occurred.
  if (nextState === undefined) {
    return state;
  }

  return merge(state, nextState);
};

// TODO: Consider using Decimal.js instead of BN for better decimal handling without needing to manually handle the edge cases.
export function formatBn(
  amount: BN,
  decimals: number,
  partialOptions?: Partial<FormatOptions>,
): string {
  const options: FormatOptions = {
    ...DEFAULT_FORMAT_OPTIONS,
    ...partialOptions,
  };

  if (options.withSi) {
    // Replace the space with an empty string to remove the
    // space between the number and the SI unit.
    return formatBalance(amount, {
      decimals,
      withSi: true,
      withUnit: false,
      withZero: false,
    }).replace(' ', '');
  }

  const chainUnitFactorBn = getChainUnitFactor(decimals);

  // There's a weird bug with BN.js, so need to create a new BN
  // instance here for the amount, to avoid a strange error.
  const integerPartBn = new BN(amount.toString()).div(chainUnitFactorBn);

  const remainderBn = amount.mod(chainUnitFactorBn);
  const integerPart = integerPartBn.abs().toString(10);
  const fractionPart = remainderBn.abs().toString(10).padStart(decimals, '0');

  let state: State = {
    suffix: '',
    integerPart,
    fractionPart,
    amount,
    decimals,
    options,
  };

  // Note that order may matter for certain transitions.
  const transitions = [
    missingLeadingZeroes,
    padFractionPart,
    trimFractionPart,
    removeTrailingZeroes,
    addCommasToIntegerPart,
    nearZeroEdgeCase,
    addPolarity,
  ];

  for (const transition of transitions) {
    state = applyTransition(state, transition);
  }

  // Combine the integer and fraction parts. Only include the fraction
  // part if it's available.
  return state.fractionPart !== ''
    ? `${state.suffix}${state.integerPart}.${state.fractionPart}`
    : `${state.suffix}${state.integerPart}`;
}
