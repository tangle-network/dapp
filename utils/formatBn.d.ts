import { BN } from '@polkadot/util';
export type FormatOptions = {
    includeCommas: boolean;
    trimTrailingZeroes: boolean;
    withSi?: boolean;
    /**
     * Leave `undefined` to show the entire fraction part.
     */
    fractionMaxLength?: number;
};
export declare function formatBn(amount: BN, decimals: number, partialOptions?: Partial<FormatOptions>): string;
