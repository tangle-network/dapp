import { InformationLine } from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
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
export const TitleWithInfo = forwardRef<HTMLHeadingElement, TitleWithInfoProps>(
  ({ className, info, title, ...props }, ref) => {
    const mergedClsx = useMemo(() => {
      return twMerge('flex items-center space-x-1', className);
    }, [className]);

    return (
      <h6 {...props} className={mergedClsx} ref={ref}>
        <Typography component='span' variant='body1' fw='bold'>
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
      </h6>
    );
  }
);
