import { AmountFormatStyle } from '@tangle-network/ui-components';
import { formatUnits } from 'viem';

type FormatTokenAmountOptions = {
  fractionMaxLength?: number;
};

const addCommas = (value: string): string => {
  const sign = value.startsWith('-') ? '-' : '';
  const unsigned = sign ? value.slice(1) : value;
  const [integerPart, fractionPart] = unsigned.split('.');
  const withCommas = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return fractionPart === undefined
    ? `${sign}${withCommas}`
    : `${sign}${withCommas}.${fractionPart}`;
};

const trimFraction = (
  fraction: string,
  maxLength: number | undefined,
): string => {
  const trimmedToMax =
    maxLength === undefined ? fraction : fraction.slice(0, maxLength);
  return trimmedToMax.replace(/0+$/, '');
};

export const formatTokenAmount = (
  amount: bigint,
  decimals: number,
  style: AmountFormatStyle,
  options?: FormatTokenAmountOptions,
): string => {
  if (style === AmountFormatStyle.SI) {
    const asUnits = formatUnits(amount, decimals);
    const asNumber = Number(asUnits);
    if (Number.isFinite(asNumber)) {
      return new Intl.NumberFormat('en-US', {
        notation: 'compact',
        compactDisplay: 'short',
        maximumFractionDigits: 2,
      }).format(asNumber);
    }
    return addCommas(asUnits);
  }

  const value = formatUnits(amount, decimals);
  const [integerPart, fractionPart = ''] = value.split('.');

  const maxFraction =
    style === AmountFormatStyle.SHORT
      ? (options?.fractionMaxLength ?? 4)
      : options?.fractionMaxLength;
  const normalizedFraction = trimFraction(fractionPart, maxFraction);

  if (
    style === AmountFormatStyle.SHORT &&
    amount !== BigInt(0) &&
    integerPart === '0' &&
    normalizedFraction.length === 0 &&
    (options?.fractionMaxLength ?? 4) > 0
  ) {
    const nearZero = `${'0'.repeat((options?.fractionMaxLength ?? 4) - 1)}1`;
    return `<0.${nearZero}`;
  }

  const integerWithCommas = addCommas(integerPart);
  return normalizedFraction.length > 0
    ? `${integerWithCommas}.${normalizedFraction}`
    : integerWithCommas;
};
