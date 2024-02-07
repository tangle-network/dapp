import { IconBase } from '@webb-tools/icons/types';
import {
  IconButton,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@webb-tools/webb-ui-components';
import { FC, JSX, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

const BalanceAction: FC<{
  tooltip: string | ReactNode;
  onClick: () => void;
  Icon: (props: IconBase) => JSX.Element;
  isDisabled?: boolean;
}> = ({ tooltip, Icon, onClick, isDisabled = false }) => {
  const isDisabledClass = isDisabled
    ? 'opacity-50 cursor-not-allowed dark:hover:bg-blue-120'
    : '';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconButton
          className={twMerge(
            'bg-blue-10 hover:bg-blue-10 dark:bg-blue-120 dark:hover:bg-blue-110',
            isDisabledClass
          )}
          disabled={isDisabled}
          onClick={onClick}
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

export default BalanceAction;
