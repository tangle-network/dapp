// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import startImg from '../../assets/star.png';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import startDarkImg from '../../assets/star-dark.png';
import { Typography } from '../../typography';
import cx from 'classnames';
import { forwardRef, MouseEventHandler, useMemo } from 'react';

import { Button } from '../Button';
import { ScrollArea } from '../ScrollArea';
import { TokenPair } from '../TokenPair';
import { ListCardWrapper } from './ListCardWrapper';
import { ListItem } from './ListItem';
import { WithDrawListCardProps } from './types';

export const WithDrawListCard = forwardRef<
  HTMLDivElement,
  WithDrawListCardProps
>(
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
      <ListCardWrapper
        {...props}
        className="max-w-[422px]"
        title={title}
        onClose={onClose}
        ref={ref}
      >
        {/** Token list */}
        {assetPairs && assetPairs.length > 0 && !isDisconnected && (
          <div className="p-2 mt-4">
            <Typography variant="utility" className="uppercase" component="h6">
              Available shielded tokens
            </Typography>
            <ScrollArea className={cx('min-w-[350px] h-[376px]')}>
              <ul className="py-2">
                {assetPairs.map((current, idx) => {
                  return (
                    <ListItem key={`${current.symbol}-${idx}`}>
                      <TokenPair
                        token1Symbol={current.symbol}
                        token2Symbol={current.symbol}
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
          <div className="mt-4">
            <Typography variant="body2" fw="semibold">
              {isDisconnected
                ? 'Connect your wallet to view available assets.'
                : "Looks like you don't have any assets. When you make a deposit, it will show up here."}
            </Typography>

            <div className="w-full mt-4 overflow-hidden">
              <img
                className="block ml-9 dark:hidden"
                src={startImg.src}
                alt="star"
              />

              <img
                className="hidden ml-9 dark:block"
                src={startDarkImg.src}
                alt="star-dark"
              />
            </div>
          </div>
        )}

        {/** Disconnect view */}
        <div
          className={cx(
            'flex flex-col items-center justify-center px-2 py-1 mt-9',
            isDisconnected && 'hidden'
          )}
          hidden={isDisconnected}
        >
          {assetPairs && assetPairs.length > 0 && (
            <>
              <Typography
                variant="utility"
                className="uppercase text-mono-100 dark:text-mono-80"
                ta="center"
              >
                Don't see your asset?
              </Typography>

              <Typography
                variant="utility"
                className="uppercase text-mono-100 dark:text-mono-80"
                ta="center"
              >
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1 text-center"
                  onClick={
                    onSwitchWallet as unknown as MouseEventHandler<HTMLButtonElement>
                  }
                >
                  Switch Wallet
                </Button>
                {' or '}
                <Button
                  variant="link"
                  size="sm"
                  className="mt-1 text-center"
                  onClick={
                    onRecoverWithSecretNote as unknown as MouseEventHandler<HTMLButtonElement>
                  }
                >
                  Recover with secret note
                </Button>
              </Typography>
            </>
          )}

          {(!assetPairs || !assetPairs?.length) && (
            <Button
              variant="link"
              size="sm"
              className="mt-1 text-center"
              onClick={
                onRecoverWithSecretNote as unknown as MouseEventHandler<HTMLButtonElement>
              }
            >
              Recover with secret note
            </Button>
          )}
        </div>

        <div
          className={cx({ hidden: !isDisconnected })}
          hidden={!isDisconnected}
        >
          <Button
            isFullWidth
            className={cx('justify-center')}
            onClick={
              onConnectWallet as unknown as MouseEventHandler<HTMLButtonElement>
            }
          >
            Connect wallet
          </Button>
        </div>
      </ListCardWrapper>
    );
  }
);
