/**
 * A function to calculate the percentage change between two numbers
 * @param value1
 * @param value2
 * @returns the percentage change
 */
const getChangeRate = (
  value1: number | undefined,
  value2: number | undefined,
) => {
  return value1 && value2 ? ((value1 - value2) / value2) * 100 : undefined;
};

export default getChangeRate;
