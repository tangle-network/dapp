import { Close, WalletLineIcon } from '@webb-dapp/webb-ui-components/icons';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

import { Button } from '../Button';
import { ListItem } from '../ListCard/ListItem';
import { WalletConnectionCardProps } from './types';

export const WalletConnectionCard = forwardRef<HTMLDivElement, WalletConnectionCardProps>(
  (
    {
      className,
      connectingWallet,
      failedWallet,
      onClose,
      onDownloadBtnClick,
      onHelpBtnClick,
      onTryAgainBtnClick,
      wallets,
      ...props
    },
    ref
  ) => {
    return (
      <div {...props} className={twMerge('flex', className)} ref={ref}>
        {/** Wallets list */}
        <div className='w-[288px]'>
          <div className='px-6 py-4'>
            <Typography variant='h5' fw='bold'>
              Connect a Wallet
            </Typography>
          </div>

          <div className='pb-4'>
            <Typography variant='body2' fw='semibold' className='px-6 py-2 text-mono-100 dark:text-mono-40'>
              Select below
            </Typography>

            <ul>
              {wallets.map((wallet) => (
                <ListItem key={wallet.id} className='px-[34px] py-[10px] flex items-center space-x-2 cursor-pointer'>
                  {wallet.logo}

                  <Typography variant='body1' fw='bold'>
                    {wallet.name}
                  </Typography>
                </ListItem>
              ))}
            </ul>
          </div>
        </div>

        {/** Wallet frame */}
        <div className='w-[432px] h-[504px] flex flex-col'>
          {/** Top */}
          <div className='w-full h-[60px] flex justify-end items-center px-4'>
            <button onClick={onClose}>
              <Close size='lg' />
            </button>
          </div>

          {/** Content */}
          <div className='flex items-center justify-center grow'>
            <div className='space-y-4 w-[320px]'>
              <WalletLineIcon size='lg' className='mx-auto' />

              <Typography variant='h5' fw='bold' ta='center'>
                Connect wallet
              </Typography>

              <Typography variant='body2' fw='semibold' ta='center' className='text-mono-120 dark:text-mono-60'>
                Connect your wallet to start bridging your tokens privately across chains
              </Typography>
            </div>
          </div>

          {/** Bottom */}
          <div className='flex items-center justify-between w-full px-6 py-4'>
            <Typography variant='body2' fw='bold' className='text-mono-100 dark:text-mono-40'>
              Don't have a wallet?
            </Typography>

            <Button variant='utility' size='sm' onClick={onDownloadBtnClick}>
              Download now
            </Button>
          </div>
        </div>
      </div>
    );
  }
);
