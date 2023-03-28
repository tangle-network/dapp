import numbro from 'numbro';

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

  if (num < 0.001) {
    return '< 0.001';
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
