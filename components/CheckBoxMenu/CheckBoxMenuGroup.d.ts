export type CheckBoxMenuGroupProps<T> = {
    value: T[] | 'all';
    options: T[];
    onChange: (value: T[] | 'all') => void;
    iconGetter?(value: T): JSX.Element;
    labelGetter(value: T): JSX.Element | string;
    keyGetter(value: T): string;
    className?: string;
    labelClassName?: string;
    showAllLabel?: boolean;
};
/**
 * React component for building toggleable checkbox menu
 *
 * iconGetter - Getter function for the icon
 * keyGetter - Getter for list key
 * labelGetter - Label for the menu item
 * onChange - Change handler for the menu group
 * options - Full list of options available
 * value - selected value
 *
 * */
export declare function CheckBoxMenuGroup<T>({ iconGetter, keyGetter, labelGetter, onChange, options, value, className, labelClassName, showAllLabel, }: CheckBoxMenuGroupProps<T>): import("react/jsx-runtime").JSX.Element;
