/**
 * Truncate the decimal places of a number without rounding
 * @param value the value to be truncated the decimal places
 * @param fractionDigits the number of digits after the decimal point (default: 2)
 * @returns the truncated value
 */
declare function toFixed(value: number, fractionDigits?: number): number;
export default toFixed;
