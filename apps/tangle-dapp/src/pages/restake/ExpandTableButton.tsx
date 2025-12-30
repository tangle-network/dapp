import { DoubleArrowRightIcon } from '@radix-ui/react-icons';
import { TooltipTrigger } from '@radix-ui/react-tooltip';
import IconButton from '@tangle-network/ui-components/components/buttons/IconButton';
import {
  Tooltip,
  TooltipBody,
} from '@tangle-network/ui-components/components/Tooltip';
import type { ComponentProps, FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

enum NotificationVariant {
  PENDING = 'pending',
  SUCCESS = 'success',
}

export type ExpandTableButtonProps = ComponentProps<'button'> & {
  notificationVariant?: NotificationVariant;
  tooltipContent?: ReactNode;
  requestCount?: number;
};

const COLOR_CLASSES = {
  [NotificationVariant.PENDING]: {
    back: twMerge('bg-amber-400'),
    front: twMerge('bg-amber-500'),
  },
  [NotificationVariant.SUCCESS]: {
    back: twMerge('bg-green-400'),
    front: twMerge('bg-green-500'),
  },
} as const satisfies Record<
  NotificationVariant,
  { back: string; front: string }
>;

export const ExpandTableButton: FC<ExpandTableButtonProps> = ({
  notificationVariant,
  tooltipContent,
  requestCount,
  ...props
}) => {
  const showCount = requestCount !== undefined && requestCount > 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconButton {...props}>
          <DoubleArrowRightIcon />

          {showCount && (
            <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold text-white bg-blue-500 rounded-full">
              {requestCount > 99 ? '99+' : requestCount}
            </span>
          )}

          {notificationVariant && !showCount && (
            <span className="absolute top-0 right-0 flex w-2 h-2 -mt-0.5 -mr-0.5">
              <span
                className={twMerge(
                  'absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping',
                  COLOR_CLASSES[notificationVariant].back,
                )}
              />

              <span
                className={twMerge(
                  'relative inline-flex w-2 h-2 rounded-full',
                  COLOR_CLASSES[notificationVariant].front,
                )}
              />
            </span>
          )}
        </IconButton>
      </TooltipTrigger>

      <TooltipBody>{tooltipContent}</TooltipBody>
    </Tooltip>
  );
};
