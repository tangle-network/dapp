import { InformationLine } from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import cx from 'classnames';
import { forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { Tooltip, TooltipBody, TooltipTrigger } from '../Tooltip';
import { TitleWithInfoProps } from './types';

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
  ({ className, info, inheritColor, title, titleComponent = 'span', variant = 'body1', ...props }, ref) => {
    const mergedClsx = useMemo(() => {
      return twMerge('flex items-center space-x-1', className);
    }, [className]);

    return (
      <div {...props} className={mergedClsx} ref={ref}>
        <Typography
          component={titleComponent}
          variant={variant}
          fw='bold'
          className={cx({ '!text-inherit': inheritColor })}
        >
          {title}
        </Typography>
        {info && (
          <Tooltip>
            <TooltipTrigger className='text-center' asChild>
              <span className='cursor-pointer'>
                <InformationLine className='!fill-current pointer-events-none' />
              </span>
            </TooltipTrigger>
            <TooltipBody>{info}</TooltipBody>
          </Tooltip>
        )}
      </div>
    );
  }
);
