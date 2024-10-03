import { IconBase } from '@webb-tools/icons/types';
import {
  IconButton,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@webb-tools/webb-ui-components';
import { FC, JSX } from 'react';
import { twMerge } from 'tailwind-merge';

export type BlueIconButtonProps = {
  onClick: () => unknown;
  tooltip: string;
  Icon: (props: IconBase) => JSX.Element;
  isDisabled?: boolean;
};

const BlueIconButton: FC<BlueIconButtonProps> = ({
  onClick,
  tooltip,
  Icon,
  isDisabled = false,
}) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconButton
          onClick={onClick}
          className={twMerge(
            'bg-blue-10 hover:bg-blue-10 dark:bg-blue-120 dark:hover:bg-blue-110',
            isDisabled &&
              'opacity-50 cursor-not-allowed dark:hover:bg-blue-120',
          )}
        >
          <Icon className="fill-blue-80 dark:fill-blue-50" size="md" />
        </IconButton>
      </TooltipTrigger>

      <TooltipBody className="break-normal max-w-[250px] text-center">
        {tooltip}
      </TooltipBody>
    </Tooltip>
  );
};

export default BlueIconButton;
