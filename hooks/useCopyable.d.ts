export type UseCopyableReturnType = {
    /**
     * The copy state, determine whether the value has copied or not
     */
    isCopied: boolean;
    /**
     * Copy the `value` string to clipboard
     * @param value Represents the value to copy to clipboard
     */
    copy: (value: string) => void;
    copiedText: string | undefined;
};
/**
 * @param display The display time to reset time copy state in milliseconds (default 3000)
 */
export declare const useCopyable: (display?: number) => UseCopyableReturnType;
