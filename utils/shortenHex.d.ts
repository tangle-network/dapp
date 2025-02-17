/**
 * shorten the a hex string and concatenate `0x` at the beginning of the string if not yet
 * @param hexStr the hex string to shorten
 * @param chars first and last number of characters to display (default: 4)
 * @returns the shortened hex string
 */
export declare const shortenHex: (hexStr: string, chars?: number) => string;
