import { Wallet } from '@webb-tools/dapp-config';
import { Close, Spinner, WalletLineIcon } from '@webb-tools/icons';
import { FC, cloneElement, forwardRef, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { PropsOf } from '../../types';
import { Typography } from '../../typography';
import { Button } from '../buttons';
import { ListItem } from '../ListCard/ListItem';
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
      errorMessage = 'Connection Failed! Please try again.',
      failedWalletId,
      onWalletSelect,
      onClose,
      downloadWalletURL,
      getHelpURL,
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
          'flex max-w-max rounded-lg bg-mono-0 dark:bg-mono-190',
          className
        )}
        ref={ref}
      >
        <WalletList wallets={wallets} onWalletSelect={onWalletSelect} />

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
              errorBtnText={errorBtnText}
              errorMessage={errorMessage}
              onTryAgainBtnClick={onTryAgainBtnClick}
            />
          </div>

          {/** Bottom */}
          {downloadWalletURL || getHelpURL ? (
            <div className="flex items-center justify-between w-full px-6 py-4">
              <Typography
                variant="body2"
                fw="bold"
                className="text-mono-100 dark:text-mono-40"
              >
                Don't have a wallet?
              </Typography>
              {downloadWalletURL ? (
                <Button
                  variant="utility"
                  size="sm"
                  target="_blank"
                  href={downloadWalletURL.toString()}
                >
                  Download{' '}
                  {connectingWallet?.name ?? failedWallet?.name ?? 'Wallet'}
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
          ) : null}
        </div>
      </div>
    );
  }
);

/***********************
 * Internal components *
 ***********************/

type PickedKeys = 'onTryAgainBtnClick' | 'errorBtnText' | 'errorMessage';

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
      onTryAgainBtnClick,
      ...props
    },
    ref
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

            <Button className="mx-auto" onClick={onTryAgainBtnClick}>
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

const WalletList: FC<
  Pick<WalletConnectionCardProps, 'wallets' | 'onWalletSelect'>
> = ({ wallets, onWalletSelect }) => {
  return (
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
              className="cursor-pointer"
              onClick={() => onWalletSelect?.(wallet)}
            >
              <div className="flex items-center gap-2">
                {wallet.Logo}

                <Typography variant="body1" fw="bold" className="capitalize">
                  {wallet.title}
                </Typography>
              </div>
            </ListItem>
          ))}
        </ul>
      </div>
    </div>
  );
};
