import { TokenIcon } from '@webb-tools/icons';
import { Typography } from '../../typography';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { TokenPair } from '../TokenPair';
import { TokenWithAmountProps } from './types';
import { TokenPairIcons } from '../TokenPairIcons';

export const TokenWithAmount = forwardRef<HTMLDivElement, TokenWithAmountProps>(
  ({ amount, className, token1Symbol, token2Symbol, ...props }, ref) => {
    return (
      <div
        {...props}
        className={twMerge('flex items-center space-x-1', className)}
        ref={ref}
      >
        {/** The amount */}
        {amount && (
          <Typography variant="body1" fw="bold">
            {amount.toString()}
          </Typography>
        )}

        {/** Icon */}
        {token2Symbol ? (
          // Token pair
          <p className="flex items-center space-x-1">
            <TokenPairIcons
              token1Symbol={token1Symbol}
              token2Symbol={token2Symbol}
            />
            <Typography component="span" variant="body1" fw="bold">
              {token1Symbol.trim() + '/' + token2Symbol.trim()}
            </Typography>
          </p>
        ) : (
          <TokenIcon size="lg" name={token1Symbol} /> // Only one token
        )}

        {!token2Symbol && (
          <Typography variant="body1" fw="bold">
            {token1Symbol}
          </Typography>
        )}
      </div>
    );
  }
);
