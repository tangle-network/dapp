import { ChainIcon, TokenIcon } from '@webb-tools/icons';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { IconWithTooltip } from '../IconWithTooltip';
import { TokenPairIconsProps } from './types';

export const TokenPairIcons = forwardRef<HTMLDivElement, TokenPairIconsProps>(
  ({ token1Symbol, token2Symbol, chainName, className, ...props }, ref) => {
    return (
      <div
        {...props}
        className={twMerge(
          'flex items-center group/token relative',
          chainName ? 'mr-1' : '',
          className
        )}
        ref={ref}
      >
        <IconWithTooltip
          icon={<TokenIcon size="lg" name={token1Symbol.toLowerCase()} />}
          content={token1Symbol.toUpperCase()}
        />
        <IconWithTooltip
          icon={<TokenIcon size="lg" name={token2Symbol.toLowerCase()} />}
          content={token2Symbol.toUpperCase()}
          overrideTooltipTriggerProps={{
            className: '-ml-2 transition-all group-hover/token:ml-1',
          }}
        />

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
