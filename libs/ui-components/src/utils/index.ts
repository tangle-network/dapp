import numbro from 'numbro';

export const randomID = (): string => {
  return Math.random().toString(16).slice(3);
};

export function getInputShadow(noBorder: boolean, error: boolean, focused: boolean): string {
  if (noBorder) {
    return 'none';
  }

  if (error) {
    return '0 0 2px 2px var(--input-shadow-error)';
  }

  if (focused) {
    return '0 0 2px 2px var(--input-shadow)';
  }

  return 'none';
}

export function getInputBorder(noBorder: boolean, error: boolean): string {
  if (noBorder) {
    return 'none';
  }

  if (error) {
    return '1px solid var(--input-border-color-error)';
  }

  return '1px solid var(--input-border-color)';
}

/**
 *
 * @param num: Represents a number to be formatted
 * @param digits: Represents the number of digits to display
 * @returns: Returns an abbreviated formatted number (e.g. millions - m, billions b)
 */
export function getRoundedAmountString(num: number | undefined, digits = 3): string {
  if (num === 0) {
    return '0';
  }

  if (!num) {
    return '-';
  }

  if (num < 0.001) {
    return '<0.001';
  }
  return numbro(num).format({
    average: num > 1000,
    totalLength: num > 1000 ? 3 : 0,
    mantissa: digits,
    optionalMantissa: true,
    trimMantissa: true,
    thousandSeparated: true,
    roundingFunction: Math.floor,
  });
}
