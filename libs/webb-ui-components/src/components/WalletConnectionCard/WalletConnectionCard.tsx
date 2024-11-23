'use client';

import { Wallet } from '@webb-tools/dapp-config';
import { Spinner, WalletLineIcon } from '@webb-tools/icons';
import { FC, cloneElement, forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { PropsOf } from '../../types';
import { Typography } from '../../typography';
import { ListItem } from '../ListCard/ListItem';
import { Button } from '../buttons';
import { WalletConnectionCardProps } from './types';

export const WalletConnectionCard = forwardRef<
  HTMLDivElement,
  WalletConnectionCardProps
>(
  (
    {
      className,
      connectingWalletId,
      errorBtnText = 'Try Again',
      errorMessage = 'Connection failed, please try again.',
      failedWalletId,
      onWalletSelect,
      onClose,
      downloadWalletURL,
      getHelpURL,
      onTryAgainBtnClick,
      tryAgainBtnProps,
      wallets,
      contentDefaultText,
      ...props
    },
    ref,
  ) => {
    const connectingWallet = useMemo(() => {
      if (!connectingWalletId) {
        return;
      }

      return wallets.find((wallet) => wallet.id === connectingWalletId);
    }, [wallets, connectingWalletId]);

    const failedWallet = useMemo(() => {
      if (!failedWalletId) {
        return;
      }

      return wallets.find((wallet) => wallet.id === failedWalletId);
    }, [failedWalletId, wallets]);

    return (
      <div
        {...props}
        className={twMerge(
          'flex w-full rounded-lg bg-mono-0 dark:bg-mono-180',
          className,
        )}
        ref={ref}
      >
        <div className="min-w-[250px] md:border-r border-mono-40 dark:border-mono-160">
          <WalletList wallets={wallets} onWalletSelect={onWalletSelect} />
        </div>

        {/** Wallet frame */}
        <div className="w-full flex flex-col items-center justify-center">
          {/** Content */}
          <WalletContent
            failedWallet={failedWallet}
            connectingWallet={connectingWallet}
            errorBtnText={errorBtnText}
            errorMessage={errorMessage}
            onTryAgainBtnClick={onTryAgainBtnClick}
            contentDefaultText={contentDefaultText}
            tryAgainBtnProps={tryAgainBtnProps}
          />

          {/** Bottom */}
          <DownloadWallet
            downloadWalletURL={downloadWalletURL}
            getHelpURL={getHelpURL}
            connectingWallet={connectingWallet}
            failedWallet={failedWallet}
          />
        </div>
      </div>
    );
  },
);

/***********************
 * Internal components *
 ***********************/

type PickedKeys =
  | 'onTryAgainBtnClick'
  | 'errorBtnText'
  | 'errorMessage'
  | 'contentDefaultText'
  | 'tryAgainBtnProps';

const WalletContent = forwardRef<
  HTMLDivElement,
  Pick<WalletConnectionCardProps, PickedKeys> &
    PropsOf<'div'> & {
      connectingWallet?: Wallet;
      failedWallet?: Wallet;
    }
>(
  (
    {
      className,
      connectingWallet,
      errorBtnText,
      errorMessage,
      failedWallet,
      contentDefaultText,
      onTryAgainBtnClick,
      tryAgainBtnProps,
      ...props
    },
    ref,
  ) => {
    return (
      <div
        {...props}
        className={twMerge('space-y-2 w-[320px]', className)}
        ref={ref}
      >
        {/** Display failed wallet */}
        {failedWallet && (
          <>
            {cloneElement(failedWallet.Logo, {
              ...failedWallet.Logo.props,
              size: 'xl',
              className: 'mx-auto',
            })}

            <Typography variant="h5" fw="bold" ta="center">
              {failedWallet.title ?? failedWallet.name}
            </Typography>

            <Typography
              variant="body2"
              className="text-red-70 dark:text-red-70"
              ta="center"
            >
              {errorMessage}
            </Typography>

            <Button
              onClick={onTryAgainBtnClick}
              {...tryAgainBtnProps}
              className={twMerge('mx-auto', tryAgainBtnProps?.className)}
            >
              {errorBtnText}
            </Button>
          </>
        )}

        {!failedWallet && connectingWallet && (
          <>
            {cloneElement(connectingWallet.Logo, {
              ...connectingWallet.Logo.props,
              size: 'xl',
              className: 'mx-auto',
            })}

            <Typography variant="h5" fw="bold" ta="center">
              {connectingWallet.title ?? connectingWallet.name}
            </Typography>

            <Typography
              variant="body2"
              fw="semibold"
              className="!text-mono-120 flex items-center justify-center"
            >
              <Spinner size="md" className="!fill-current mr-2" />
              Waiting for connection
            </Typography>
          </>
        )}

        {/** Not failed and not connecting */}
        {!failedWallet && !connectingWallet && (
          <>
            <WalletLineIcon size="lg" className="mx-auto" />

            <Typography variant="h5" fw="bold" ta="center">
              Connect wallet
            </Typography>

            {contentDefaultText && (
              <Typography
                variant="body2"
                fw="semibold"
                ta="center"
                className="text-mono-120 dark:text-mono-60"
              >
                {contentDefaultText}
              </Typography>
            )}
          </>
        )}
      </div>
    );
  },
);

const WalletList: FC<
  Pick<WalletConnectionCardProps, 'wallets' | 'onWalletSelect'> & {
    className?: string;
  }
> = ({ wallets, onWalletSelect, className }) => {
  return (
    <ul className={twMerge('pt-4', className)}>
      {wallets.map((wallet) => (
        <ListItem
          key={wallet.id}
          className="cursor-pointer bg-mono-0 dark:bg-mono-180"
          onClick={() => onWalletSelect?.(wallet)}
        >
          <div className="flex items-center gap-2">
            {wallet.Logo}

            <Typography variant="body1" fw="bold">
              {wallet.title}
            </Typography>
          </div>
        </ListItem>
      ))}
    </ul>
  );
};

const DownloadWallet: FC<
  Pick<WalletConnectionCardProps, 'downloadWalletURL' | 'getHelpURL'> & {
    connectingWallet?: Wallet;
    failedWallet?: Wallet;
  }
> = ({ downloadWalletURL, getHelpURL, connectingWallet, failedWallet }) => {
  return downloadWalletURL || getHelpURL ? (
    <div className="hidden md:flex items-center justify-between w-full px-6 py-4">
      <Typography
        variant="body2"
        fw="bold"
        className="text-mono-100 dark:text-mono-40"
      >
        Don't have{' '}
        {connectingWallet?.title ?? failedWallet?.title ?? 'the wallet'}?
      </Typography>
      {downloadWalletURL ? (
        <Button
          variant="utility"
          size="sm"
          target="_blank"
          href={downloadWalletURL.toString()}
        >
          Download
        </Button>
      ) : getHelpURL ? (
        <Button
          variant="utility"
          size="sm"
          target="_blank"
          href={getHelpURL.toString()}
        >
          Help
        </Button>
      ) : null}
    </div>
  ) : null;
};
