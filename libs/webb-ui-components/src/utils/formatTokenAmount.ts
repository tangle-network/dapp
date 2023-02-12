/**
 * Format token amount to 3 decimal places and add `<` if amount is less than 0.001
 * @param amount The amount to format
 * @returns The formatted amount
 */
export const formatTokenAmount = (amount: string) => {
  const formattedAmount = parseFloat(amount).toFixed(2);
  if (Number(formattedAmount) < 0.01) {
    return `< 0.01`;
  }
  return formattedAmount;
};
