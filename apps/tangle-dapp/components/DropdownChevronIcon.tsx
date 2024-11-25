import { ChevronDown } from '@webb-tools/icons';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

export type DropdownChevronIconProps = {
  onClick?: () => void;
  isLarge?: boolean;
};

const DropdownChevronIcon: FC<DropdownChevronIconProps> = ({
  onClick,
  isLarge = false,
}) => {
  return (
    <div
      className={twMerge(
        'p-1 rounded-lg group-hover:bg-mono-40 group-hover:dark:bg-mono-160',
        onClick !== undefined && 'cursor-pointer',
      )}
      onClick={onClick}
    >
      <ChevronDown
        className="fill-mono-200 dark:fill-mono-0"
        size={isLarge ? 'lg' : 'md'}
      />
    </div>
  );
};

export default DropdownChevronIcon;
