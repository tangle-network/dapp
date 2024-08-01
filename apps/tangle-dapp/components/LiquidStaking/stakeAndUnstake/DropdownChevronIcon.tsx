import { ChevronDown } from '@webb-tools/icons';
import { FC } from 'react';

export type DropdownChevronIconProps = {
  isLarge?: boolean;
};

const DropdownChevronIcon: FC<DropdownChevronIconProps> = ({
  isLarge = false,
}) => {
  return (
    <div className="p-1 rounded-lg group-hover:dark:bg-mono-160">
      <ChevronDown
        className="fill-mono-200 dark:fill-mono-0"
        size={isLarge ? 'lg' : 'md'}
      />
    </div>
  );
};

export default DropdownChevronIcon;
