/**
 * Formats a token amount to a given number of decimal places and adds a < symbol if the amount is less than 0.001
 * @param amount The amount to format
 * @param decimalPlaces (Optional) The number of decimal places to format to - defaults to 3
 * @returns The formatted amount
 */
export const formatTokenAmount = (amount: string, decimalPlaces = 3) => {
  const formattedAmount = parseFloat(amount).toFixed(decimalPlaces);
  if (Number(formattedAmount) < 0.001) {
    return `< 0.001`;
  }
  return formattedAmount;
};
