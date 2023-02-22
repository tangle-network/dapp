import { round } from 'lodash';

const generateNumber = (decimalDigits: number) => {
  return parseFloat(
    `0.${Array(decimalDigits - 1)
      .fill(0)
      .join('')}1`
  );
};

/**
 * Formats a token amount to a given number of decimal places and adds a < symbol if the amount is less than 0.001
 * @param amount The amount to format
 * @param decimalPlaces (Optional) The number of decimal places to format to - defaults to 3
 * @returns The formatted amount
 */
export const formatTokenAmount = (amount: string, decimalPlaces = 3) => {
  const number = generateNumber(decimalPlaces);
  if (Number(amount) < number) {
    return `<${number}`;
  }

  return round(Number(amount), decimalPlaces).toLocaleString();
};
