import { useWebContext } from '@webb-tools/api-provider-environment';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import {
  Button,
  ChainListCard,
  Logo,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuTrigger,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { ChainType } from '@webb-tools/webb-ui-components/components/BridgeInputs/types';
import * as constants from '@webb-tools/webb-ui-components/constants';
import { FC, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { ChainSwitcherButton } from './ChainSwitcherButton';
import { HeaderProps } from './types';
import { WalletButton } from './WalletButton';
import { WalletModal } from './WalletModal';
import { getDefaultConnection } from '../../utils';
/**
 * The statistic `Header` for `Layout` container
 */
export const Header: FC<HeaderProps> = () => {
  const { activeAccount, activeWallet, activeChain, loading, chains } =
    useWebContext();

  const { setMainComponent } = useWebbUI();

  // On connect wallet button click - connect to the default chain(ETH Goerli)
  const onConnectWalletClick = useCallback(() => {
    const { defaultChain, sourceChains } = getDefaultConnection(chains);

    setMainComponent(
      <WalletModal chain={defaultChain} sourceChains={sourceChains} />
    );
  }, [chains, setMainComponent]);

  return (
    <header className="bg-mono-0 dark:bg-mono-180">
      <div className="flex items-center justify-between p-4">
        <NavLink to={constants.logoConfig.path}>
          <Logo />
        </NavLink>

        {/** No wallet is actived */}
        <div className="flex items-center space-x-2">
          {!activeAccount && (
            <Button
              isLoading={loading}
              loadingText="Connecting..."
              onClick={onConnectWalletClick}
            >
              Connect wallet
            </Button>
          )}

          {/** Wallet is actived */}
          {activeAccount && activeWallet && activeChain && !loading && (
            <>
              <ChainSwitcherButton />
              <WalletButton account={activeAccount} wallet={activeWallet} />
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
export type ChainSelectionWrapperProps = {
  sourceChains: ChainType[];
  handleOnClose?: () => void;
};
export const ChainSelectionWrapper: FC<ChainSelectionWrapperProps> = ({
  sourceChains,
  handleOnClose,
}) => {
  const { chains, activeWallet, switchChain } = useWebContext();
  const { setMainComponent } = useWebbUI();

  return (
    <ChainListCard
      className="w-[550px] h-[700px]"
      overrideScrollAreaProps={{ className: 'h-[550px]' }}
      chainType="source"
      chains={sourceChains}
      onChange={async (selectedChain) => {
        const chain = Object.values(chains).find(
          (val) => val.name === selectedChain.name
        );

        if (!chain) {
          throw new Error('Detect unsupported chain is being selected');
        }

        const isSupported =
          activeWallet &&
          activeWallet.supportedChainIds.includes(
            calculateTypedChainId(chain.chainType, chain.chainId)
          );

        // If the selected chain is supported by the active wallet
        if (isSupported) {
          await switchChain(chain, activeWallet);
          setMainComponent(undefined);
          return;
        }

        setMainComponent(
          <WalletModal chain={chain} sourceChains={sourceChains} />
        );
      }}
      onClose={() => {
        setMainComponent(undefined);
        if (handleOnClose) handleOnClose();
      }}
    />
  );
};
