export interface CheckBoxProps {
  label?: string;
  size?: 'medium' | 'small';
  checked: boolean;
  onChange: () => void;
}
