import { DoubleArrowRightIcon } from '@radix-ui/react-icons';
import { TooltipTrigger } from '@radix-ui/react-tooltip';
import IconButton from '@webb-tools/webb-ui-components/components/buttons/IconButton';
import {
  Tooltip,
  TooltipBody,
} from '@webb-tools/webb-ui-components/components/Tooltip';
import type { ComponentProps, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export enum NotificationVariant {
  PENDING = 'pending',
  SUCCESS = 'success',
}

export type ExpandTableButtonProps = ComponentProps<'button'> & {
  notificationVariant?: NotificationVariant;
  tooltipContent?: ReactNode;
};

const colorClasses = {
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

export function ExpandTableButton({
  notificationVariant,
  tooltipContent,
  ...props
}: ExpandTableButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconButton {...props}>
          <DoubleArrowRightIcon />

          {notificationVariant && (
            <>
              <span className="absolute top-0 right-0 flex w-2 h-2 -mt-0.5 -mr-0.5">
                <span
                  className={twMerge(
                    'absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping',
                    colorClasses[notificationVariant].back,
                  )}
                />
                <span
                  className={twMerge(
                    'relative inline-flex w-2 h-2 rounded-full',
                    colorClasses[notificationVariant].front,
                  )}
                />
              </span>
            </>
          )}
        </IconButton>
      </TooltipTrigger>

      <TooltipBody>{tooltipContent}</TooltipBody>
    </Tooltip>
  );
}
