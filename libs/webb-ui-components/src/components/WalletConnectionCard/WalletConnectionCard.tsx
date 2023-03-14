import { Close, Spinner, WalletLineIcon } from '@webb-tools/icons';
import { PropsOf } from '../../types';
import { Typography } from '../../typography';
import { cloneElement, forwardRef, useEffect, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { Button } from '../Button';
import { ListItem } from '../ListCard/ListItem';
import { WalletConnectionCardProps } from './types';
import { Wallet } from '@webb-tools/dapp-config';
import { getPlatformMetaData } from '@webb-tools/browser-utils/platform/get-platform-metadata';

export const WalletConnectionCard = forwardRef<
  HTMLDivElement,
  WalletConnectionCardProps
>(
  (
    {
      className,
      connectingWalletId,
      failedWalletId,
      onWalletSelect,
      onClose,
      onDownloadBtnClick,
      onHelpBtnClick,
      onTryAgainBtnClick,
      wallets,
      ...props
    },
    ref
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
          'flex max-w-max rounded-lg bg-mono-0 dark:bg-mono-180',
          className
        )}
        ref={ref}
      >
        {/** Wallets list */}
        <div className="w-[288px] border-r border-r-mono-40 dark:border-r-mono-160">
          <div className="px-6 py-4">
            <Typography variant="h5" fw="bold">
              Connect a Wallet
            </Typography>
          </div>

          <div className="pb-4">
            <Typography
              variant="body2"
              fw="semibold"
              className="px-6 py-2 text-mono-100 dark:text-mono-40"
            >
              Select below
            </Typography>

            <ul>
              {wallets.map((wallet) => (
                <ListItem
                  key={wallet.id}
                  className="px-[34px] py-[10px] flex items-center space-x-2 cursor-pointer"
                  onClick={() => onWalletSelect?.(wallet)}
                >
                  {wallet.Logo}

                  <Typography variant="body1" fw="bold" className="capitalize">
                    {wallet.title}
                  </Typography>
                </ListItem>
              ))}
            </ul>
          </div>
        </div>

        {/** Wallet frame */}
        <div className="w-[432px] h-[504px] flex flex-col">
          {/** Top */}
          <div className="w-full h-[60px] flex justify-end items-center px-4">
            <button onClick={onClose}>
              <Close size="lg" />
            </button>
          </div>

          {/** Content */}
          <div className="flex items-center justify-center grow">
            <WalletContent
              failedWallet={failedWallet}
              connectingWallet={connectingWallet}
              onTryAgainBtnClick={onTryAgainBtnClick}
            />
          </div>

          {/** Bottom */}
          <div className="flex items-center justify-between w-full px-6 py-4">
            <Typography
              variant="body2"
              fw="bold"
              className="text-mono-100 dark:text-mono-40"
            >
              Don't have a wallet?
            </Typography>

            {!failedWallet && !connectingWallet ? (
              <Button variant="utility" size="sm" onClick={onDownloadBtnClick}>
                Download metamask
              </Button>
            ) : (
              <Button variant="utility" size="sm" onClick={onHelpBtnClick}>
                Help
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

/***********************
 * Internal components *
 ***********************/

const WalletContent = forwardRef<
  HTMLDivElement,
  Pick<WalletConnectionCardProps, 'onTryAgainBtnClick'> &
    PropsOf<'div'> & {
      connectingWallet?: Wallet;
      failedWallet?: Wallet;
    }
>(
  (
    { className, connectingWallet, failedWallet, onTryAgainBtnClick, ...props },
    ref
  ) => {
    useEffect(() => {
      if (
        failedWallet &&
        failedWallet.installLinks &&
        Object.keys(failedWallet.installLinks).length > 0
      ) {
        const { id } = getPlatformMetaData();

        window.open(failedWallet.installLinks[id], '_blank');
      }
    }, [failedWallet]);

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
              Connection Failed! Please check if your wallet is installed and
              try again.
            </Typography>

            <Button className="mx-auto" onClick={onTryAgainBtnClick}>
              Try Again
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

            <Typography
              variant="body2"
              fw="semibold"
              ta="center"
              className="text-mono-120 dark:text-mono-60"
            >
              Connect your wallet to start bridging your tokens privately across
              chains
            </Typography>
          </>
        )}
      </div>
    );
  }
);
