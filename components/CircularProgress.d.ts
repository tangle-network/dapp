import { FC } from '../../../../node_modules/react';
type Size = 'md';
export type CircularProgressProps = {
    /**
     * Progress value between 0 and 1.
     *
     * @example
     * 0.5 // 50%
     * 1 // 100%
     * 0 // 0%
     * 0.75 // 75%
     * 0.123 // 12.3%
     */
    progress: number;
    size?: Size;
    tooltip?: string;
};
export declare const CircularProgress: FC<CircularProgressProps>;
export {};
