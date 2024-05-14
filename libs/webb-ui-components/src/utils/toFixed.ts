import isScientificNotation from './isScientificNotation.js';
import numberToString from './numberToString.js';

/**
 * Truncate the decimal places of a number without rounding
 * @param value the value to be truncated the decimal places
 * @param fractionDigits the number of digits after the decimal point (default: 2)
 * @returns the truncated value
 */
function toFixed(value: number, fractionDigits = 2): number {
  const valueStr = isScientificNotation(value)
    ? numberToString(value)
    : `${value}`;

  const regex = new RegExp(`^-?\\d+(?:\\.\\d{0,${fractionDigits}})?`);
  const matched = valueStr.match(regex);
  if (!matched || matched[0] == null) {
    return value;
  }

  return parseFloat(matched[0]);
}

export default toFixed;
