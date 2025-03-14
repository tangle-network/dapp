import { IconBase } from '@tangle-network/icons/types';
import {
  IconButton,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@tangle-network/ui-components';
import { Link } from 'react-router';
import { FC, JSX, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import { InternalPath } from '../../types';

const BalanceAction: FC<{
  tooltip: string | ReactNode;
  internalHref?: InternalPath;
  onClick?: () => void;
  Icon: (props: IconBase) => JSX.Element;
  isDisabled?: boolean;
}> = ({ tooltip, Icon, onClick, internalHref, isDisabled = false }) => {
  if (internalHref !== undefined && onClick !== undefined) {
    throw new Error('Cannot have both href and click handler');
  }

  const isDisabledClass = isDisabled
    ? 'opacity-50 cursor-not-allowed dark:hover:bg-blue-120'
    : '';

  const iconButton = (
    <IconButton
      className={twMerge(
        'bg-blue-10 hover:bg-blue-20 dark:bg-blue-120 dark:hover:bg-blue-110',
        isDisabledClass,
      )}
      disabled={isDisabled}
      onClick={onClick}
    >
      <Icon className="fill-blue-80 dark:fill-blue-50" size="md" />
    </IconButton>
  );

  const trigger =
    internalHref !== undefined ? (
      <Link to={internalHref}>{iconButton}</Link>
    ) : (
      iconButton
    );

  return (
    <Tooltip>
      <TooltipTrigger asChild>{trigger}</TooltipTrigger>

      <TooltipBody>{tooltip}</TooltipBody>
    </Tooltip>
  );
};

export default BalanceAction;
