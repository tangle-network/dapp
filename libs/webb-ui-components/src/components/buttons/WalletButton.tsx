import { getFlexBasic } from '@webb-tools/icons/utils';
import { cloneElement, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { isHex } from 'viem';
import { Typography } from '../../typography/Typography';
import { shortenHex, shortenString } from '../../utils';
import { WalletButtonProps } from './types';
import { ChevronDown } from '@webb-tools/icons';

const WalletButton = forwardRef<HTMLButtonElement, WalletButtonProps>(
  (
    { accountName, wallet, address, className, addressClassname, ...props },
    ref,
  ) => {
    return (
      <button
        {...props}
        type="button"
        ref={ref}
        className={twMerge(
          'rounded-lg py-2 px-4 max-w-56',
          'bg-mono-0/10 dark:bg-mono-0/5',
          'hover:bg-mono-100/10 dark:hover:bg-mono-0/10',
          'border-2 border-mono-60 dark:border-mono-140',
          className,
        )}
      >
        <div className="flex items-center gap-2">
          {cloneElement(wallet.Logo, {
            ...wallet.Logo.props,
            className: twMerge(
              wallet.Logo.props.className,
              `shrink-0 grow-0 ${getFlexBasic('lg')}`,
            ),
          })}

          <div className="flex items-center">
            <Typography
              variant="body1"
              fw="bold"
              component="p"
              className={twMerge('truncate dark:text-mono-0', addressClassname)}
            >
              {accountName
                ? accountName
                : isHex(address)
                  ? `${shortenHex(address)}`
                  : `${shortenString(address)}`}
            </Typography>

            <ChevronDown size="lg" />
          </div>
        </div>
      </button>
    );
  },
);

export default WalletButton;
