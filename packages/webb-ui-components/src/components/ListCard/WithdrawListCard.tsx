// @ts-ignore
import startImg from '@webb-dapp/webb-ui-components/assets/star.png';
// @ts-ignore
import startDarkImg from '@webb-dapp/webb-ui-components/assets/star-dark.png';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import cx from 'classnames';
import { forwardRef, useMemo } from 'react';

import { Button } from '../Button';
import { ScrollArea } from '../ScrollArea';
import { TokenPair } from '../TokenPair';
import { ListCardWrapper } from './ListCardWrapper';
import { ListItem } from './ListItem';
import { WithDrawListCardProps } from './types';

export const WithDrawListCard = forwardRef<HTMLDivElement, WithDrawListCardProps>(
  (
    {
      assetPairs,
      isDisconnected,
      onChange,
      onClose,
      onConnectWallet,
      onRecoverWithSecretNote,
      onSwitchWallet,
      title = 'Select Asset to Withdraw',
      value,
      ...props
    },
    ref
  ) => {
    return (
      <ListCardWrapper {...props} className='max-w-[422px]' title={title} onClose={onClose} ref={ref}>
        {/** Token list */}
        {assetPairs && assetPairs.length > 0 && !isDisconnected && (
          <div className='p-2 mt-4'>
            <Typography variant='utility' className='uppercase' component='h6'>
              Available shielded tokens
            </Typography>
            <ScrollArea className={cx('min-w-[350px] h-[376px]')}>
              <ul className='py-2'>
                {assetPairs.map((current, idx) => {
                  return (
                    <ListItem key={`${current.asset1Symbol}-${current.asset2Symbol}-${idx}`}>
                      <TokenPair
                        token1Symbol={current.asset1Symbol}
                        token2Symbol={current.asset2Symbol}
                        balance={current.balance}
                        name={current.name}
                      />
                    </ListItem>
                  );
                })}
              </ul>
            </ScrollArea>
          </div>
        )}

        {(!assetPairs || !assetPairs.length) && (
          <div className='mt-4'>
            <Typography variant='body2' fw='semibold'>
              {isDisconnected
                ? 'Connect your wallet to view available assets.'
                : "Looks like you don't have any assets. When you make a deposit, it will show up here."}
            </Typography>

            <div className='w-full mt-4 overflow-hidden'>
              <img className='block ml-9 dark:hidden' src={startImg} alt='star' />

              <img className='hidden ml-9 dark:block' src={startDarkImg} alt='star-dark' />
            </div>
          </div>
        )}

        {/** Disconnect view */}
        <div
          className={cx('flex flex-col items-center justify-center px-2 py-1 mt-9', isDisconnected && 'hidden')}
          hidden={isDisconnected}
        >
          {assetPairs && assetPairs.length > 0 && (
            <>
              <Typography variant='utility' className='uppercase text-mono-100 dark:text-mono-80' ta='center'>
                Don't see your asset?
              </Typography>

              <Typography variant='utility' className='uppercase text-mono-100 dark:text-mono-80' ta='center'>
                <Button variant='link' size='sm' className='mt-1 text-center' onClick={onSwitchWallet}>
                  Switch Wallet
                </Button>
                {' or '}
                <Button variant='link' size='sm' className='mt-1 text-center' onClick={onRecoverWithSecretNote}>
                  Recover with secret note
                </Button>
              </Typography>
            </>
          )}

          {(!assetPairs || !assetPairs?.length) && (
            <Button variant='link' size='sm' className='mt-1 text-center' onClick={onRecoverWithSecretNote}>
              Recover with secret note
            </Button>
          )}
        </div>

        <div className={cx({ hidden: !isDisconnected })} hidden={!isDisconnected}>
          <Button isFullWidth className={cx('justify-center')} onClick={onConnectWallet}>
            Connect Wallet
          </Button>
        </div>
      </ListCardWrapper>
    );
  }
);
