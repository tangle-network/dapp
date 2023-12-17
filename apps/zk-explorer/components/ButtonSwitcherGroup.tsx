import { Button, ButtonProps } from '@webb-tools/webb-ui-components';
import { FC, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export type ButtonSwitcherGroupProps = ButtonProps & {
  buttonLabels: string[];
  initiallySelectedIndex?: number;
  onSelectionChange: (selectedIndex: number) => void;
};

export const ButtonSwitcherGroup: FC<ButtonSwitcherGroupProps> = (props) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(
    props.initiallySelectedIndex ?? 0
  );

  return (
    <div className="flex gap-2">
      {props.buttonLabels.map((label, index) => {
        const isSelected = index === selectedIndex;

        return (
          <Button
            className={twMerge(
              'px-4 py-2 rounded-full font-bold dark:hover:text-mono-200',
              isSelected
                ? ''
                : 'dark:bg-transparent border-none dark:text-mono-0'
            )}
            {...props}
            key={index}
            onClick={() => {
              setSelectedIndex(index);
              props.onSelectionChange(index);
            }}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
};
