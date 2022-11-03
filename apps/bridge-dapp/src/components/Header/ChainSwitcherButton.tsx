import { ChevronDownIcon } from '@radix-ui/react-icons';
import { useWebContext } from '@webb-tools/api-provider-environment';
import { Chain, currenciesConfig, WalletConfig } from '@webb-tools/dapp-config';
import { TokenIcon } from '@webb-tools/icons';
import {
  ChainListCard,
  Typography,
  useWebbUI,
  WalletConnectionCard,
} from '@webb-tools/webb-ui-components';
import { ChainType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import cx from 'classnames';
import { FC, useCallback, useMemo, useState } from 'react';
import { useConnectWallet, WalletState } from '../../hooks';
import { HeaderButton } from './HeaderButton';

/**
 * The ChainSwitcherButton defines the clickable button in the Header,
 * as well as the displayable component passed to the WebbUI's special "customMainComponent"
 */
export const ChainSwitcherButton: FC = () => {

  const { chains, activeChain, switchChain, activeWallet } = useWebContext();
  const { setMainComponent } = useWebbUI();

  // The desiredChain state saves the user selection for reference
  // after the "chain select" main content has unmounted for the "wallet select" main content.
  const [desiredChain, setDesiredChain] = useState<Chain | undefined>(undefined);
  const sourceChains: ChainType[] = useMemo(() => {
    return Object.values(chains).map((val) => {
      return {
        name: val.name,
        symbol: currenciesConfig[val.nativeCurrencyId].symbol,
      };
    });
  }, [chains]);

  const handleSelectChain = useCallback(
    async (newChain: ChainType) => {
      const selectedChain = Object.values(chains).find(
        (chain) => chain.name === newChain.name
      );

      console.log('selectedChain! ', selectedChain);

      setDesiredChain(selectedChain);
      return selectedChain;
    },
    [chains]
  );

  const {
    walletState,
    selectedWallet,
    switchWallet,
    resetState,
  } = useConnectWallet(false);

  const onTryAgainBtnClick = useCallback(async () => {
    resetState();
    await switchChain(desiredChain, selectedWallet);
  }, [desiredChain, resetState, selectedWallet, switchChain]);

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
    <HeaderButton
      className={cx(
        'flex items-center space-x-1 py-2 pr-2 pl-4',
        'border !border-mono-60 rounded-lg'
      )}
      onClick={() =>
        setMainComponent(
          <ChainListCard
            chainType="source"
            chains={sourceChains}
            value={{ name: activeChain.name, symbol: activeChain.name }}
            onClose={() => setMainComponent(undefined)}
            onChange={async (selectedChain) => {
              const chainObj = await handleSelectChain(selectedChain);
              setMainComponent(
                <WalletConnectionCard
                  wallets={Object.values(chainObj.wallets)}
                  connectingWalletId={connectingWalletId}
                  failedWalletId={failedWalletId}
                  onTryAgainBtnClick={onTryAgainBtnClick}
                  onWalletSelect={async (wallet) => {
                    switchWallet(wallet);
                    await switchChain(desiredChain, wallet);

                    // cleanup
                    setDesiredChain(undefined);
                    setMainComponent(undefined);
                  }}
                  onClose={() => setMainComponent(undefined)}
                />
              );
            }}
          />
        )
      }
    >
      <TokenIcon size="lg" name={activeChain ? currenciesConfig[activeChain.nativeCurrencyId].symbol : ''} />

      <Typography variant="body1" fw="bold">
        {activeChain.name}
      </Typography>

      <ChevronDownIcon />
    </HeaderButton>
  )

}

