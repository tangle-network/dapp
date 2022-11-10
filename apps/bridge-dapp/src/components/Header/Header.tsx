import { useWebContext } from '@webb-tools/api-provider-environment';
import { currenciesConfig } from '@webb-tools/dapp-config';
import {
  Button,
  ChainListCard,
  Logo,
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuTrigger,
  Typography,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { ChainType } from '@webb-tools/webb-ui-components/components/BridgeInputs/types';
import * as constants from '@webb-tools/webb-ui-components/constants';
import { FC, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { ChainSwitcherButton } from './ChainSwitcherButton';
import { HeaderButton } from './HeaderButton';
import { HeaderProps } from './types';
import { WalletModal } from './WalletModal';

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
      className="w-[550px] h-[720px]"
      chainType="source"
      chains={sourceChains}
      onChange={(selectedChain) => {
        const chain = Object.values(chains).find(
          (val) => val.name === selectedChain.name
        );
        if (chain) {
          setMainComponent(
            <WalletModal chain={chain} sourceChains={sourceChains} />
          );
        }
      }}
      onClose={() => setMainComponent(undefined)}
    />
  );
};
