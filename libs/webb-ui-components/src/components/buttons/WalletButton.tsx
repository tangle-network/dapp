import { getFlexBasic } from '@webb-tools/icons/utils';
import { cloneElement, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { isHex } from 'viem';
import { shortenHex, shortenString } from '../../utils';
import { WalletButtonProps } from './types';
import { Typography } from '../../typography/Typography';

const WalletButton = forwardRef<HTMLButtonElement, WalletButtonProps>(
  ({ wallet, address, className, ...props }, ref) => {
    return (
      <button
        {...props}
        type="button"
        ref={ref}
        className={twMerge(
          'rounded-lg border-2 py-2 px-4',
          'bg-mono-0/10 border-mono-60',
          'hover:bg-mono-0/30',
          'dark:bg-mono-0/5 dark:border-mono-140',
          'dark:hover:bg-mono-0/10',
          className
        )}
      >
        <div className="flex items-center gap-2">
          {cloneElement(wallet.Logo, {
            ...wallet.Logo.props,
            className: twMerge(
              wallet.Logo.props.className,
              `shrink-0 grow-0 ${getFlexBasic('lg')}`
            ),
          })}
          <Typography variant="body1" fw="bold" component="p">
            {isHex(address)
              ? `${shortenHex(address)}`
              : `${shortenString(address)})}`}
          </Typography>
        </div>
      </button>
    );
  }
);

export default WalletButton;
