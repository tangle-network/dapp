import { useWebContext } from '@webb-tools/api-provider-environment';
import { Chain, currenciesConfig } from '@webb-tools/dapp-config';
import {
  Button,
  ChainListCard,
  Logo,
  Modal,
  ModalContent,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuTrigger,
  Typography,
  useWebbUI,
  WalletConnectionCard,
} from '@webb-tools/webb-ui-components';
import { ChainType } from '@webb-tools/webb-ui-components/components/BridgeInputs/types';
import * as constants from '@webb-tools/webb-ui-components/constants';
import { FC, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useConnectWallet } from '../../hooks';
import { ChainSwitcherButton } from './ChainSwitcherButton';
import { HeaderButton } from './HeaderButton';
import { HeaderProps } from './types';

/**
 * The statistic `Header` for `Layout` container
 */
export const Header: FC<HeaderProps> = () => {
  const { activeWallet, activeChain, loading, chains } = useWebContext();

  const { setMainComponent } = useWebbUI();

  const onConnectWalletClick = useCallback(() => {
    const sourceChains: ChainType[] = Object.values(chains).map((val) => {
      return {
        name: val.name,
        symbol: currenciesConfig[val.nativeCurrencyId].symbol,
      };
    });

    setMainComponent(<ComponentWrapper sourceChains={sourceChains} />);
  }, [chains, setMainComponent]);

  return (
    <header className="bg-mono-0 dark:bg-mono-180">
      <div className="flex items-center justify-between p-4">
        <NavLink to={constants.logoConfig.path}>
          <Logo />
        </NavLink>

        {/** No wallet is actived */}
        <div className="flex items-center space-x-2">
          {!activeWallet && (
            <Button
              isLoading={loading}
              loadingText="Connecting..."
              onClick={onConnectWalletClick}
            >
              Connect Wallet
            </Button>
          )}

          {/** Wallet is actived */}
          {activeWallet && activeChain && !loading && (
            <>
              <ChainSwitcherButton />
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

const ComponentWrapper: FC<{
  sourceChains: ChainType[];
}> = ({ sourceChains }) => {
  const { chains } = useWebContext();
  const { setMainComponent } = useWebbUI();

  return (
    <ChainListCard
      chainType="source"
      chains={sourceChains}
      onChange={async (selectedChain) => {
        const chain = Object.values(chains).find(
          (val) => val.name === selectedChain.name
        );

        setMainComponent(
          <WalletModal chain={chain} sourceChains={sourceChains} />
        );
      }}
      onClose={() => setMainComponent(undefined)}
    />
  );
};

export const WalletModal: FC<{
  sourceChains: ChainType[];
  chain: Chain;
}> = ({ chain, sourceChains }) => {
  const { setMainComponent } = useWebbUI();
  const {
    isModalOpen,
    toggleModal,
    switchWallet,
    connectingWalletId,
    failedWalletId,
    selectedWallet,
  } = useConnectWallet(true);

  return (
    <>
      <ChainListCard chainType="source" chains={sourceChains} />
      <Modal open={isModalOpen} onOpenChange={(open) => toggleModal(open)}>
        <ModalContent isOpen={isModalOpen} isCenter>
          <WalletConnectionCard
            wallets={Object.values(chain.wallets)}
            onWalletSelect={async (wallet) => {
              await switchWallet(chain, wallet);
            }}
            onClose={() => setMainComponent(undefined)}
            connectingWalletId={connectingWalletId}
            failedWalletId={failedWalletId}
            onTryAgainBtnClick={async () => {
              if (!selectedWallet) {
                throw new Error(
                  'There is not selected wallet in try again function'
                );
              }
              await switchWallet(chain, selectedWallet);
            }}
          />
        </ModalContent>
      </Modal>
    </>
  );
};
