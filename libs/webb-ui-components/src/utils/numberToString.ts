/**
 * Converts a number to a string without scientific notation
 * @param num the number to be converted to string
 * @returns the string representation of the number
 */
function numberToString(num: number): string {
  let str = String(num);

  // Check if the number is in scientific notation
  if (str.indexOf('e') !== -1) {
    const exponent = parseInt(str.split('-')[1], 10);
    str = num.toFixed(exponent);
  }

  return str;
}

export default numberToString;
