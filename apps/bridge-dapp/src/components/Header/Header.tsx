import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { WalletConfig } from '@webb-tools/dapp-config';
import { TokenIcon } from '@webb-tools/icons';
import {
  Button,
  Logo,
  Modal,
  ModalContent,
  ModalTrigger,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuTrigger,
  Typography,
  WalletConnectionCard,
} from '@webb-tools/webb-ui-components';
import * as constants from '@webb-tools/webb-ui-components/constants';
import { PropsOf } from '@webb-tools/webb-ui-components/types';
import cx from 'classnames';
import { FC, forwardRef, useCallback, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';
import { useConnectWallet, WalletState } from '../../hooks';
import { HeaderProps } from './types';

/**
 * The statistic `Header` for `Layout` container
 */
export const Header: FC<HeaderProps> = () => {
  const {
    wallets,
    activeWallet,
    activeChain,
    loading,
    apiConfig: { currencies },
  } = useWebContext();

  const {
    isModalOpen,
    toggleModal,
    switchWallet,
    walletState,
    selectedWallet,
    resetState,
  } = useConnectWallet(false);

  const onWalletSelect = useCallback(
    async (wallet: WalletConfig) => {
      try {
        await switchWallet(wallet);
      } catch (error) {
        console.log(error);
      }
    },
    [switchWallet]
  );

  const onTryAgainBtnClick = useCallback(async () => {
    resetState();
    await switchWallet(selectedWallet);
  }, [resetState, selectedWallet, switchWallet]);

  const connectingWalletId = useMemo<number | undefined>(
    () =>
      walletState === WalletState.CONNECTING ? selectedWallet?.id : undefined,
    [selectedWallet?.id, walletState]
  );

  const failedWalletId = useMemo<number | undefined>(
    () => (walletState === WalletState.FAILED ? selectedWallet?.id : undefined),
    [selectedWallet?.id, walletState]
  );

  const nativeCurrencySymbol = useMemo(() => {
    if (!activeChain) {
      return '';
    }

    return currencies[activeChain.nativeCurrencyId].symbol;
  }, [activeChain, currencies]);

  return (
    <header className="bg-mono-0 dark:bg-mono-180">
      <div className="flex items-center justify-between p-4">
        <NavLink to={constants.logoConfig.path}>
          <Logo />
        </NavLink>

        {/** No wallet is actived */}
        <div className="flex items-center space-x-2">
          {!activeWallet && (
            <Modal
              open={isModalOpen}
              onOpenChange={(open) => toggleModal(open)}
            >
              <ModalTrigger asChild>
                <Button
                  isLoading={loading}
                  loadingText="Connecting..."
                  onClick={() => toggleModal(true)}
                >
                  Connect wallet
                </Button>
              </ModalTrigger>

              <ModalContent isOpen={isModalOpen} isCenter>
                <WalletConnectionCard
                  onWalletSelect={onWalletSelect}
                  wallets={Object.values(wallets)}
                  connectingWalletId={connectingWalletId}
                  failedWalletId={failedWalletId}
                  onTryAgainBtnClick={onTryAgainBtnClick}
                  onClose={() => toggleModal(false)}
                />
              </ModalContent>
            </Modal>
          )}

          {/** Wallet is actived */}
          {activeWallet && activeChain && !loading && (
            <>
              <HeaderButton
                className={cx(
                  'flex items-center space-x-1 py-2 pr-2 pl-4',
                  'border !border-mono-60 rounded-lg'
                )}
              >
                <TokenIcon size="lg" name={nativeCurrencySymbol} />

                <Typography variant="body1" fw="bold">
                  {activeChain.name}
                </Typography>

                <ChevronDownIcon />
              </HeaderButton>
              <HeaderButton className="capitalize rounded-full">
                {activeWallet.Logo}

                <Typography variant="body1" fw="bold">
                  {activeWallet.name}
                </Typography>
              </HeaderButton>
            </>
          )}

          <NavigationMenu>
            <NavigationMenuTrigger />
            {/** TODO: Refactor these links into a config file and make the menu items dynamically based on the config */}
            <NavigationMenuContent
              onTestnetClick={() =>
                window.open(
                  'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Farana-alpha-1.webb.tools#/explorer',
                  '_blank'
                )
              }
              onHelpCenterClick={() =>
                window.open('https://t.me/webbprotocol', '_blank')
              }
              onRequestFeaturesClick={() =>
                window.open(
                  'https://github.com/webb-tools/webb-dapp/issues/new?assignees=&labels=&template=feature_request.md&title=',
                  '_blank'
                )
              }
              onAboutClick={() =>
                window.open('https://www.webb.tools/', '_blank')
              }
            />
          </NavigationMenu>
        </div>
      </div>
    </header>
  );
};

/***********************
 * Internal components *
 ***********************/

const HeaderButton = forwardRef<HTMLButtonElement, PropsOf<'button'>>(
  ({ className, ...props }, ref) => (
    <button
      {...props}
      className={twMerge(
        'flex items-center space-x-2 py-2 px-4',
        'border !border-mono-60 rounded-lg',
        className
      )}
      ref={ref}
    />
  )
);
