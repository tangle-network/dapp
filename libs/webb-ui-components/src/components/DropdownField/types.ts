export type DropdownFieldProps = {
  title: string;
  items: string[];
  className?: string;
  selectedItem: string;
  setSelectedItem: (selectedItem: string) => void;
};
