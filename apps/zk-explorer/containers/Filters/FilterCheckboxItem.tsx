import { CheckBox } from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import SmallChip from '../../components/SmallChip';

export type FilterCheckboxItemProps = {
  category: string;
  label: string;
  isChecked: boolean;
  amount: number;
  handleChange: (isChecked: boolean, category: string, label: string) => void;
};

export const FilterCheckboxItem: FC<FilterCheckboxItemProps> = ({
  category,
  label,
  isChecked,
  amount,
  handleChange,
}) => {
  return (
    <div key={label} className="flex">
      <CheckBox
        isChecked={isChecked}
        wrapperClassName="items-center"
        spacingClassName="ml-2"
        onChange={(e) => handleChange(e.target.checked, category, label)}
      >
        {label}
      </CheckBox>

      <SmallChip className="ml-auto">{amount}</SmallChip>
    </div>
  );
};
