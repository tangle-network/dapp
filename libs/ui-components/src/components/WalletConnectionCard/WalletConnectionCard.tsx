'use client';

import { Wallet } from '@tangle-network/dapp-config';
import { ArrowRightUp, Spinner, WalletLineIcon } from '@tangle-network/icons';
import { FC, cloneElement, forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { PropsOf } from '../../types';
import { Typography } from '../../typography';
import { ListItem } from '../ListCard/ListItem';
import { Button } from '../buttons';
import { WalletConnectionCardProps } from './types';
import useIsBreakpoint from '../../hooks/useIsBreakpoint';

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
    const isMdOrLess = useIsBreakpoint('md', true);

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

    const showList = !isMdOrLess || (!connectingWallet && !failedWallet);
    const showContent = !isMdOrLess || connectingWallet || failedWallet;

    return (
      <div {...props} className={twMerge('flex w-full', className)} ref={ref}>
        {showList && (
          <div className="flex-grow md:max-w-[220px] md:min-h-[400px] md:border-r border-mono-40 dark:border-mono-160">
            <WalletList wallets={wallets} onWalletSelect={onWalletSelect} />
          </div>
        )}

        {showContent && (
          <div className="flex-grow flex flex-col items-stretch justify-center py-6 md:py-0">
            {/** Content */}
            <WalletContent
              className="flex flex-col gap-2 items-center justify-center flex-grow self-center"
              failedWallet={failedWallet}
              connectingWallet={connectingWallet}
              errorBtnText={errorBtnText}
              errorMessage={errorMessage}
              onTryAgainBtnClick={onTryAgainBtnClick}
              contentDefaultText={contentDefaultText}
              tryAgainBtnProps={tryAgainBtnProps}
            />

            {/** Bottom */}
            <div className="hidden md:flex flex-shrink items-center justify-end">
              <DownloadWallet
                downloadWalletURL={downloadWalletURL}
                getHelpURL={getHelpURL}
                connectingWallet={connectingWallet}
                failedWallet={failedWallet}
              />
            </div>
          </div>
        )}
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
      <div {...props} className={twMerge('max-w-[320px]', className)} ref={ref}>
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
      {wallets.flatMap((wallet) => {
        // Skip disabled wallets.
        if (!wallet.enabled) {
          return [];
        }

        return (
          <ListItem
            key={wallet.id}
            className="cursor-pointer"
            onClick={() => onWalletSelect?.(wallet)}
          >
            <div className="flex items-center gap-2">
              {wallet.Logo}

              <Typography variant="body1" fw="bold">
                {wallet.title}
              </Typography>
            </div>
          </ListItem>
        );
      })}
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
    <div className="flex items-center justify-between w-full px-6 py-4">
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
          rightIcon={
            <ArrowRightUp className="fill-current dark:fill-current" />
          }
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
