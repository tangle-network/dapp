import { TokenIcon } from '@webb-tools/icons';
import { Typography } from '../../typography';
import { getRoundedAmountString } from '../../utils';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { TokenPairProps } from './types';

export const TokenPair = forwardRef<HTMLDivElement, TokenPairProps>(
  ({ balance, className, name, token1Symbol, token2Symbol, ...props }, ref) => {
    return (
      <div className="flex items-center justify-between">
        <div
          {...props}
          className={twMerge('flex items-center space-x-1', className)}
          ref={ref}
        >
          <div className="flex items-center -space-x-2">
            <TokenIcon size="lg" name={token1Symbol} />
            <TokenIcon size="lg" name={token2Symbol} />
          </div>
          <p>
            <Typography
              component="span"
              variant="body1"
              fw="bold"
              className="block"
            >
              {token1Symbol}/{token2Symbol}
            </Typography>
            {name && (
              <Typography
                component="span"
                variant="utility"
                fw="bold"
                className="text-mono-100 dark:text-mono-80 block mt-0.5"
              >
                {name}
              </Typography>
            )}
          </p>
        </div>

        {balance && (
          <Typography variant="body2" fw="bold" component="p">
            {getRoundedAmountString(balance)}
          </Typography>
        )}
      </div>
    );
  }
);
