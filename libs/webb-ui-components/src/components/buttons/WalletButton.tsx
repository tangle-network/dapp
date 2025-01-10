import { getFlexBasic } from '@webb-tools/icons/utils';
import { cloneElement, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { isHex } from 'viem';
import { Typography } from '../../typography/Typography';
import { shortenHex, shortenString } from '../../utils';
import { WalletButtonProps } from './types';

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
          'max-w-56 rounded-full border-2 py-2 px-4',
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
        </div>
      </button>
    );
  },
);

export default WalletButton;
