import { useWebContext } from '@webb-tools/api-provider-environment';
import { WalletConfig } from '@webb-tools/dapp-config';
import {
  Button,
  Logo,
  Modal,
  ModalContent,
  ModalTrigger,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuTrigger,
  WalletConnectionCard,
} from '@webb-tools/webb-ui-components';
import * as constants from '@webb-tools/webb-ui-components/constants';
import { FC, useCallback, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useConnectWallet, WalletState } from '../../hooks';
import { HeaderProps } from './types';

/**
 * The statistic `Header` for `Layout` container
 */
export const Header: FC<HeaderProps> = () => {
  const { wallets, activeWallet, loading } = useWebContext();

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

  return (
    <header className="bg-mono-0 dark:bg-mono-180">
      <div className="flex items-center justify-between p-4">
        <NavLink to={constants.logoConfig.path}>
          <Logo />
        </NavLink>

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

          {activeWallet && !loading && (
            <Button
              leftIcon={activeWallet.Logo}
              className="capitalize pointer-events-none"
            >
              {activeWallet.name}
            </Button>
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
