import { IconBase } from '@webb-tools/icons/types';
import {
  Button,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@webb-tools/webb-ui-components';
import { FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export type IconButtonProps = {
  tooltip: string;
  Icon: (props: IconBase) => ReactNode;
  className?: string;
  onClick: () => void;
};

const IconButton: FC<IconButtonProps> = ({
  tooltip,
  Icon,
  className,
  onClick,
}) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Button
          onClick={onClick}
          size="sm"
          variant="utility"
          className={twMerge('', className)}
        >
          <Icon className="fill-blue-80 dark:fill-blue-50" size="md" />
        </Button>
      </TooltipTrigger>

      <TooltipBody>{tooltip}</TooltipBody>
    </Tooltip>
  );
};

export default IconButton;
