import numbro from 'numbro';

/**
 * Return dynamic 0.001 format based on number of digits
 * to display
 * @param {number} digit
 * @returns {number} number of decimals
 */
export function getDecimals(digit: number): number {
  let s = '0.';

  while (--digit) {
    s += '0';
  }

  return parseFloat(s + '1');
}

/**
 *
 * @param num: Represents a number to be formatted
 * @param digits: Represents the number of digits to display
 * @param roundingFunction: Represents the rounding function to use
 * @returns: Returns an abbreviated formatted number (e.g. millions - m, billions b)
 */
export function getRoundedAmountString(
  num: number | undefined,
  digits = 3,
  roundingFunction: numbro.Format['roundingFunction'] = Math.floor
): string {
  if (num === 0) {
    return '0';
  }

  if (!num) {
    return '-';
  }

  if (num < 0) {
    return '< 0';
  }

  const decimals = getDecimals(digits);
  if (num < decimals) {
    return `< ${decimals}`;
  }

  return numbro(num).format({
    average: num > 1000,
    totalLength: num > 1000 ? 3 : 0,
    mantissa: digits,
    optionalMantissa: true,
    trimMantissa: true,
    thousandSeparated: true,
    roundingFunction: roundingFunction,
  });
}
