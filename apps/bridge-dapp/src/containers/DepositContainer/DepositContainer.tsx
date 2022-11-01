import { useWebContext } from '@webb-tools/api-provider-environment';
import {
  ChainListCard,
  DepositCard,
  Typography,
  WalletConnectionCard,
} from '@webb-tools/webb-ui-components';
import { useBridgeDeposit } from '@webb-tools/react-hooks';
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { DepositContainerProps } from './types';
import { ChainType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { Chain, currenciesConfig } from '@webb-tools/dapp-config';

enum DetailedCardOption {
  SourceChain,
  DestChain,
  Wrap,
  Token,
  Relayer,
  Withdraw,
  Wallet,
}

export const DepositContainer = forwardRef<
  HTMLDivElement,
  DepositContainerProps
>((props, ref) => {
  const { activeApi, chains, switchChain, activeWallet } = useWebContext();
  const { setWrappableCurrency, setGovernedCurrency } = useBridgeDeposit();

  const [sourceChain, setSourceChain] = useState<Chain | undefined>(undefined);
  const [destChain, setDestChain] = useState<Chain | undefined>(undefined);

  const [selectedDetailedView, setDetailedView] =
    useState<DetailedCardOption | null>(null);

  const sourceChains: ChainType[] = useMemo(() => {
    return Object.values(chains).map((val) => {
      return {
        name: val.name,
        symbol: currenciesConfig[val.nativeCurrencyId].symbol,
      };
    });
  }, [chains]);

  const sourceChainInputValue = useMemo(
    () => sourceChains.find((chain) => chain.name === sourceChain?.name),
    [sourceChain?.name, sourceChains]
  );

  const destChains: ChainType[] = useMemo(() => {
    if (!activeApi || !activeApi.state.activeBridge) {
      return [];
    }

    return Object.keys(activeApi.state.activeBridge.targets)
      .map((val) => {
        const maybeChain = chains[Number(val)];
        if (maybeChain) {
          return {
            name: chains[Number(val)].name,
            symbol:
              currenciesConfig[chains[Number(val)].nativeCurrencyId].symbol,
          };
        }
        return undefined;
      })
      .filter((chain): chain is ChainType => !!chain);
  }, [activeApi, chains]);

  const destChainInputValue = useMemo(
    () => destChains.find((chain) => chain.name === destChain?.name),
    [destChain?.name, destChains]
  );

  const handleChainSwitch = useCallback(
    async (newChain: ChainType) => {
      const selectedChain = Object.values(chains).find(
        (chain) => chain.name === newChain.name
      );

      if (!activeWallet) {
        setDetailedView(DetailedCardOption.Wallet);
        setSourceChain(selectedChain);
        return;
      }

      setDetailedView(null);
      setSourceChain(selectedChain);

      await switchChain(selectedChain, activeWallet);
    },
    [activeWallet, chains, switchChain]
  );

  const DetailedView = useMemo(() => {
    switch (selectedDetailedView) {
      case DetailedCardOption.SourceChain:
        return (
          <ChainListCard
            chainType="source"
            chains={sourceChains}
            value={sourceChainInputValue}
            onChange={async (selectedChain) => {
              handleChainSwitch(selectedChain);
            }}
            onClose={() => setDetailedView(null)}
          />
        );

      case DetailedCardOption.DestChain:
        return (
          <ChainListCard
            chainType="dest"
            chains={destChains}
            value={destChainInputValue}
            onChange={async (selectedChain) => {
              const destChain = Object.values(chains).find(
                (val) => val.name === selectedChain.name
              );
              setDestChain(destChain);
            }}
            onClose={() => setDetailedView(null)}
          />
        );

      case DetailedCardOption.Wallet: {
        if (!sourceChain) {
          throw new Error('Source chain is undefiend when wallet view render');
        }

        return (
          <WalletConnectionCard
            wallets={Object.values(sourceChain.wallets)}
            onClose={() => setDetailedView(null)}
          />
        );
      }
      default:
        return null;
    }
  }, [
    chains,
    destChainInputValue,
    destChains,
    handleChainSwitch,
    selectedDetailedView,
    sourceChain,
    sourceChainInputValue,
    sourceChains,
  ]);

  return (
    <div>
      {DetailedView ? (
        DetailedView
      ) : (
        <DepositCard
          sourceChainProps={{
            chain: sourceChainInputValue,
            onClick: () => {
              setDetailedView(DetailedCardOption.SourceChain);
            },
            chainType: 'source',
          }}
          destChainProps={{
            chain: destChainInputValue,
            onClick: () => {
              setDetailedView(DetailedCardOption.DestChain);
            },
            chainType: 'dest',
          }}
          tokenInputProps={{
            onClick: () => {
              console.log('show the list card for the token');
            },
          }}
        />
      )}
    </div>
  );
});
