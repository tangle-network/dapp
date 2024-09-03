import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

export type ToggleableRadioInputProps = {
  isChecked: boolean;
  onToggle: () => void;
};

const ToggleableRadioInput: FC<ToggleableRadioInputProps> = ({
  isChecked,
  onToggle,
}) => {
  return (
    <input
      type="radio"
      checked={isChecked}
      onClick={onToggle}
      className={twMerge(
        'w-[18px] h-[18px] rounded-full bg-mono-0 dark:bg-mono-180 border border-mono-100',
        'enabled:hover:bg-blue-10 enabled:hover:dark:bg-blue-120',
        'enabled:hover:border-blue-40 enabled:hover:dark:border-blue-90',
        'enabled:hover:shadow-[0_0_0_1px_rgba(213,230,255,1)] hover:dark:shadow-none',
        'cursor-pointer',
      )}
    />
  );
};

export default ToggleableRadioInput;
