import { TokenIcon } from '@webb-tools/icons';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { Typography } from '../../typography';

import { TokenPairIcons } from '../TokenPairIcons';
import { TokenWithAmountProps } from './types';

export const TokenWithAmount = forwardRef<HTMLDivElement, TokenWithAmountProps>(
  ({ amount, className, token1Symbol, token2Symbol, ...props }, ref) => {
    return (
      <div
        {...props}
        className={twMerge('flex items-center space-x-1', className)}
        ref={ref}
      >
        {/** Icon */}
        {token2Symbol ? (
          // Token pair
          <p className="flex items-center space-x-1">
            <TokenPairIcons
              className="shrink-0"
              token1Symbol={token1Symbol}
              token2Symbol={token2Symbol}
            />

            {amount && (
              <Typography variant="h5" fw="bold">
                {amount.toString()}
              </Typography>
            )}

            <Typography
              component="span"
              variant="h5"
              fw="bold"
              className="capitalize truncate"
            >
              {token1Symbol.trim() + '/' + token2Symbol.trim()}
            </Typography>
          </p>
        ) : (
          <TokenIcon className="shrink-0" size="lg" name={token1Symbol} /> // Only one token
        )}

        {/** The amount */}
        {amount && (
          <Typography variant="h5" fw="bold">
            {amount.toString()}
          </Typography>
        )}

        {!token2Symbol && (
          <Typography variant="h5" fw="bold" className="capitalize truncate">
            {token1Symbol}
          </Typography>
        )}
      </div>
    );
  }
);
