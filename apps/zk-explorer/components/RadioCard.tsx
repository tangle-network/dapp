import { InfoCircledIcon } from '@radix-ui/react-icons';
import { IconProps } from '@radix-ui/react-icons/dist/types';
import { Typography } from '@webb-tools/webb-ui-components';
import { ComponentType, FC, useCallback, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

export type RadioCardProps = {
  id: string;
  title: string;
  tooltip?: string;
  description?: string;
  Icon?: ComponentType<IconProps>;
  selectedRadioItem: string | null;
  setSelectedRadioItem: (id: string) => void;
};

export const RadioCard: FC<RadioCardProps> = ({
  id,
  setSelectedRadioItem,
  selectedRadioItem,
  title,
  tooltip,
  description,
  Icon,
}) => {
  const isChecked = selectedRadioItem === id;

  const handleOnChange = useCallback(() => {
    {
      if (selectedRadioItem === id) {
        return;
      }

      setSelectedRadioItem(id);
    }
  }, [id, selectedRadioItem, setSelectedRadioItem]);

  const isCheckedClass = isChecked
    ? 'border-mono-180 border-2 dark:bg-mono-0'
    : 'border-mono-100 dark:bg-mono-180';

  const radioButtonClass = useMemo(
    () =>
      twMerge(
        'self-center w-6 h-5 rounded-full border flex-grow',
        isCheckedClass
      ),
    [isCheckedClass]
  );

  return (
    <div
      onClick={handleOnChange}
      className="flex gap-2 dark:bg-mono-160 dark:hover:bg-mono-140 px-4 py-2 rounded-[8px] cursor-pointer transition-colors"
    >
      {Icon && (
        <Icon className="w-6 h-6 dark:fill-mono-100 dark:text-mono-100" />
      )}

      <div className="flex flex-col gap-2">
        <div className="flex gap-1 items-center">
          <Typography variant="body1" fw="bold" className="dark:text-mono-40">
            {title}
          </Typography>

          {tooltip !== undefined && (
            // TODO: Use `Tooltip` component.
            <div title={tooltip}>
              <InfoCircledIcon className="w-4 h-4" />
            </div>
          )}
        </div>

        <Typography variant="body1" className="dark:text-mono-40">
          {description}
        </Typography>
      </div>

      {/* Radio button */}
      <div className={radioButtonClass} />
    </div>
  );
};
