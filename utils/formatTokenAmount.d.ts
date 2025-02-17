/**
 * Formats a token amount to a given number of decimal places and adds a < symbol if the amount is less than 0.001
 * @param amount The amount to format
 * @param decimalPlaces (Optional) The number of decimal places to format to - defaults to 3
 * @returns The formatted amount
 */
export declare const formatTokenAmount: (amount: string, decimalPlaces?: number) => string;
