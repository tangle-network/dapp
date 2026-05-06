import addCommasToNumber from './addCommasToNumber';

/**
 * Formats a percentage value with commas every 3 digits.
 *
 * @param percentage - The percentage value to format, between 0 and 1.
 */
const formatPercentage = (percentage: number): `${string}%` => {
  const fmtPercentage = (percentage * 100).toFixed(2);

  // If the percentage is 0, display '<0.01' instead of '0.00'.
  // This helps avoid confusing the user to believe that the value is 0.
  if (fmtPercentage === '0.00' && percentage !== 0) {
    return '<0.01%';
  }

  const [whole, decimal] = fmtPercentage.split('.');
  const wholeWithCommas = addCommasToNumber(whole);

  return `${wholeWithCommas}.${decimal}%`;
};

export default formatPercentage;
