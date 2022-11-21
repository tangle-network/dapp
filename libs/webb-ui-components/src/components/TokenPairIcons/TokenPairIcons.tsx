import { ChainIcon, TokenIcon } from '@webb-tools/icons';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { TokenPairIconsProps } from './types';

export const TokenPairIcons = forwardRef<HTMLDivElement, TokenPairIconsProps>(
  ({ token1Symbol, token2Symbol, chainName, className, ...props }, ref) => {
    return (
      <div
        {...props}
        className={twMerge(
          'flex items-center -space-x-2 relative',
          chainName ? 'mr-1' : '',
          className
        )}
        ref={ref}
      >
        <TokenIcon size="lg" name={token1Symbol.toLowerCase()} />
        <TokenIcon size="lg" name={token2Symbol.toLowerCase()} />

        {chainName && (
          <ChainIcon
            name={chainName}
            className="absolute top-0 -right-1"
            width="12"
            height="12"
          />
        )}
      </div>
    );
  }
);
