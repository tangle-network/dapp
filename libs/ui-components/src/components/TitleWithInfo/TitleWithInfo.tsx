import { InformationLine } from '@tangle-network/icons';
import { Typography } from '../../typography';
import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { Tooltip, TooltipBody, TooltipTrigger } from '../Tooltip';
import { TitleWithInfoProps } from './types';
import isPrimitive from '@tangle-network/dapp-types/utils/isPrimitive';

/**
 * The re-useable title component with small info in a popup tooltip
 *
 * @example
 *
 * ```jsx
 *  <TitleWithInfo title='Active key' info='This is the active key card' />
 * ```
 */
export const TitleWithInfo = forwardRef<HTMLDivElement, TitleWithInfoProps>(
  (
    {
      className,
      info,
      title,
      titleClassName,
      titleComponent = 'span',
      variant = 'body1',
      isCenterInfo,
      ...props
    },
    ref,
  ) => {
    const mergedClsx = useMemo(() => {
      return twMerge(
        'flex items-center space-x-1 text-mono-180 dark:text-mono-0',
        className,
      );
    }, [className]);

    return (
      <div {...props} className={mergedClsx} ref={ref}>
        <Typography
          component={titleComponent}
          variant={variant}
          fw="bold"
          className={titleClassName}
        >
          {title}
        </Typography>
        {info && (
          <Tooltip>
            <TooltipTrigger className="text-center" asChild>
              <span className="cursor-pointer !text-inherit">
                <InformationLine className="!fill-current pointer-events-none" />
              </span>
            </TooltipTrigger>

            <TooltipBody className="max-w-[200px]">
              {isPrimitive(info) && info !== null && info !== undefined ? (
                <Typography
                  ta={isCenterInfo ? 'center' : 'left'}
                  variant="body3"
                  className="break-normal"
                >
                  {info}
                </Typography>
              ) : (
                info
              )}
            </TooltipBody>
          </Tooltip>
        )}
      </div>
    );
  },
);
