const NUMBER_REGEX = new RegExp('(\\d+?)(?=(\\d{3})+(?!\\d)|$)', 'g');

/**
 * @name formatDecimal
 * @description Formats a number into string format with thousand separators.
 *
 * @example
 * formatDecimal('1000000') => '1,000,000'
 * formatDecimal('1000000', '.') => '1.000.000'
 * formatDecimal('-500000') => '-500,000'
 * formatDecimal('123') => '123'
 */
export const formatDecimal = (value: string, separator = ','): string => {
  const isNegative = value[0].startsWith('-');
  const matched = isNegative
    ? value.substring(1).match(NUMBER_REGEX)
    : value.match(NUMBER_REGEX);

  return matched ? `${isNegative ? '-' : ''}${matched.join(separator)}` : value;
};

