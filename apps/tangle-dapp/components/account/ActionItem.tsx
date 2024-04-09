import { StatusIndicator } from '@webb-tools/icons';
import { IconBase } from '@webb-tools/icons/types';
import {
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import Link from 'next/link';
import { ComponentProps, FC, ReactElement, useCallback } from 'react';
import { twMerge } from 'tailwind-merge';

import { InternalPath } from '../../types';

type ActionItemProps = {
  Icon: (props: IconBase) => ReactElement;
  label: string;
  onClick?: () => void;
  isDisabled?: boolean;
  hasNotificationDot?: boolean;
  notificationDotVariant?: ComponentProps<typeof StatusIndicator>['variant'];
  internalHref?: InternalPath;
  tooltip?: ReactElement | string;
};

const ActionItem: FC<ActionItemProps> = ({
  Icon,
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
        isDisabled && 'opacity-50'
      )}
    >
      <div
        onClick={handleClick}
        className={twMerge(
          'inline-flex mx-auto items-center justify-center relative p-2 rounded-lg hover:bg-mono-20 dark:hover:bg-mono-160 text-mono-200 dark:text-mono-0',
          isDisabled ? '!cursor-not-allowed' : 'cursor-pointer'
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

        <Icon size="lg" />
      </div>

      <Typography
        component="span"
        variant="body1"
        className="block text-center dark:text-mono-0"
      >
        {label}
      </Typography>
    </div>
  );

  const withLink =
    internalHref !== undefined ? (
      <Link href={internalHref}>{content}</Link>
    ) : (
      content
    );

  return tooltip !== undefined ? (
    <Tooltip>
      <TooltipBody className="break-normal max-w-[250px] text-center">
        {tooltip}
      </TooltipBody>

      <TooltipTrigger asChild>{withLink}</TooltipTrigger>
    </Tooltip>
  ) : (
    withLink
  );
};

export default ActionItem;
