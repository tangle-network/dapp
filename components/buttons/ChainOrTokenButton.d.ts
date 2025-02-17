declare const ChainOrTokenButton: import('../../../../../node_modules/react').ForwardRefExoticComponent<Omit<import('../../../../../node_modules/react').DetailedHTMLProps<import('../../../../../node_modules/react').ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>, "ref"> & {
    placeholder?: string;
    iconClassName?: string;
    iconType: "chain" | "token";
    displayValue?: string;
    showChevron?: boolean;
    value?: string;
    status?: import('../../../../icons/src/StatusIndicator/types').StatusIndicatorProps["variant"];
    textClassName?: string;
    dropdownClassName?: string;
} & import('../../../../../node_modules/react').RefAttributes<HTMLButtonElement>>;
export default ChainOrTokenButton;
