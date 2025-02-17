export type DropdownFieldProps = {
    title: string;
    items: string[];
    className?: string;
    selectedItem: string;
    setSelectedItem: (selectedItem: string) => void;
    dropdownBodyClassName?: string;
};
export declare const DropdownField: ({ title, items, selectedItem, setSelectedItem, className, dropdownBodyClassName, }: DropdownFieldProps) => import("react/jsx-runtime").JSX.Element;
