import { StatusIndicator } from '@tangle-network/icons';
import { IconBase } from '@tangle-network/icons/types';
import {
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@tangle-network/ui-components';
import { Link } from 'react-router';
import { ComponentProps, FC, ReactElement, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

import { InternalPath } from '../../types';

type ActionItemProps = {
  Icon: (props: IconBase) => ReactElement;
  iconSize?: IconBase['size'];
  label?: string;
  onClick?: () => void;
  isDisabled?: boolean;
  hasNotificationDot?: boolean;
  notificationDotVariant?: ComponentProps<typeof StatusIndicator>['variant'];
  internalHref?: InternalPath;
  tooltip?: ReactElement | string;
};

const ActionItem: FC<ActionItemProps> = ({
  Icon,
  iconSize = 'lg',
  label,
  onClick,
  internalHref,
  tooltip,
  isDisabled = false,
  hasNotificationDot = false,
  notificationDotVariant = 'success',
}) => {
  const handleClick = useCallback(() => {
    if (isDisabled || onClick === undefined) {
      return;
    }

    onClick();
  }, [isDisabled, onClick]);

  const content = (
    <div
      className={twMerge(
        'inline-flex flex-col justify-center items-center gap-2',
        isDisabled && 'opacity-50',
      )}
    >
      <div
        onClick={handleClick}
        className={twMerge(
          'inline-flex mx-auto items-center justify-center relative p-2 rounded-lg',
          'hover:bg-mono-60 dark:hover:bg-mono-160',
          'text-mono-200 dark:text-mono-0',
          isDisabled ? '!cursor-not-allowed' : 'cursor-pointer',
        )}
      >
        {/* Notification dot */}
        {hasNotificationDot && (
          <StatusIndicator
            variant={notificationDotVariant}
            size={12}
            className="absolute top-0 right-0"
          />
        )}

        <Icon size={iconSize} />
      </div>

      {label && (
        <Typography
          component="span"
          variant="body1"
          className="block text-center dark:text-mono-0"
        >
          {label}
        </Typography>
      )}
    </div>
  );

  const withLink =
    internalHref !== undefined ? (
      <Link to={internalHref}>{content}</Link>
    ) : (
      content
    );

  return tooltip !== undefined ? (
    <Tooltip>
      <TooltipBody>{tooltip}</TooltipBody>

      <TooltipTrigger asChild>{withLink}</TooltipTrigger>
    </Tooltip>
  ) : (
    withLink
  );
};

export default ActionItem;
