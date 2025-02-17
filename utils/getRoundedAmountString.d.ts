import { default as numbro } from 'numbro';
export interface RoundedAmountFormatOptions extends numbro.Format {
    /**
     * The default placeholder to use when formatting a value with no value
     * @default '-'
     */
    defaultPlaceholder?: string;
}
/**
 * Return dynamic 0.001 format based on number of digits
 * to display
 * @param {number} digit
 * @returns {number} number of decimals
 */
export declare function getDecimals(digit: number): number;
/**
 *
 * @param num: Represents a number to be formatted
 * @param digits: Represents the number of digits to display
 * @param roundingFunction: Represents the rounding function to use
 * @returns: Returns an abbreviated formatted number (e.g. millions - m, billions b)
 */
export declare function getRoundedAmountString(num: number | undefined, digits?: number, formatOption?: RoundedAmountFormatOptions): string;
