import { TokenIcon } from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { getRoundedAmountString } from '@webb-dapp/webb-ui-components/utils';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { TokenPairProps } from './types';

export const TokenPair = forwardRef<HTMLDivElement, TokenPairProps>(
  ({ balance, className, name, token1Symbol, token2Symbol, ...props }, ref) => {
    return (
      <div className='flex items-center justify-between'>
        <div {...props} className={twMerge('flex items-center space-x-1', className)} ref={ref}>
          <div className='flex items-center -space-x-2'>
            <TokenIcon size='lg' name={token1Symbol.toLowerCase()} />
            <TokenIcon size='lg' name={token2Symbol.toLowerCase()} />
          </div>
          <p>
            <Typography component='span' variant='body1' fw='bold' className='block'>
              {token1Symbol.toUpperCase()}/{token2Symbol.toUpperCase()}
            </Typography>
            {name && (
              <Typography
                component='span'
                variant='utility'
                fw='bold'
                className='uppercase text-mono-100 dark:text-mono-80 block mt-0.5'
              >
                {name.toUpperCase()}
              </Typography>
            )}
          </p>
        </div>

        {balance && (
          <Typography variant='body2' fw='bold' component='p'>
            {getRoundedAmountString(balance)}
          </Typography>
        )}
      </div>
    );
  }
);
