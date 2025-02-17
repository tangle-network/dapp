import { BN } from '@polkadot/util';
export declare enum AmountFormatStyle {
    /**
     * Show the entire amount with all decimal places.
     *
     * Useful for displaying high precision balances such as the user's balance,
     * transaction amounts, etc.
     */
    EXACT = 0,
    /**
     * Use SI units for large or small values.
     *
     * Useful for displaying balances that don't require high precision,
     * such as TVL, total supply, market cap, etc.
     */
    SI = 1,
    /**
     * Display the full amount, with 4 decimal places at most.
     *
     * Useful for displaying balances in a compact format.
     */
    SHORT = 2
}
/**
 * Format a balance or token amount into a humanly-legible format,
 * with commas and in a certain format style.
 *
 * This should be the preferred, standardized way to format balances
 * for UI display.
 */
export declare const formatDisplayAmount: (amount: BN, decimals: number, style: AmountFormatStyle) => string;
