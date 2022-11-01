import { useWebContext } from '@webb-tools/api-provider-environment';
import { ChainListCard, DepositCard, Typography } from '@webb-tools/webb-ui-components';
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
}

export const DepositContainer = forwardRef<
  HTMLDivElement,
  DepositContainerProps
>((props, ref) => {
  const { activeApi, chains, switchChain, activeWallet } = useWebContext();
  const { setWrappableCurrency, setGovernedCurrency } = useBridgeDeposit();

  const [destChain, setDestChain] = useState<Chain | undefined>(undefined);
  const [selectedDetailedView, setDetailedView] = useState<DetailedCardOption>(DetailedCardOption.SourceChain);
  const [showDetailedView, setShowDetailedView] = useState(false);

  const sourceChains: ChainType[] = useMemo(() => {
    return Object.values(chains).map((val) => {
      return {
        name: val.name,
        symbol: currenciesConfig[val.nativeCurrencyId].symbol
      }
    })
  }, [chains]);

  const destChains: ChainType[] = useMemo(() => {
    if (!activeApi || !activeApi.state.activeBridge) {
      return [];
    }

    return Object.keys(activeApi.state.activeBridge.targets).map((val) => {
      const maybeChain = chains[Number(val)];
      if (maybeChain) {
        return {
          name: chains[Number(val)].name,
          symbol: currenciesConfig[chains[Number(val)].nativeCurrencyId].symbol
        }
      }
    })
  }, [activeApi, chains])


  const handleChainSwitch = useCallback(async (newChain: ChainType) => {
    const selectedChain = Object.values(chains).find((chain) => chain.name === newChain.name);
    await switchChain(selectedChain, activeWallet);
  }, [activeWallet, chains, switchChain])

  const DetailedView = useMemo(() => {
    switch (selectedDetailedView) {
      case (DetailedCardOption.SourceChain):
        return (
          <ChainListCard 
            chainType='source'
            chains={sourceChains}
            onChange={async (selectedChain) => {
              handleChainSwitch(selectedChain);
              setShowDetailedView(false);
            }}
          />
        );
      case (DetailedCardOption.DestChain):
        return (
          <ChainListCard
            chainType='dest'
            chains={destChains}
            onChange={async (selectedChain) => {
              const destChain = Object.values(chains).find((val) => val.name === selectedChain.name);
              setDestChain(destChain);
              setShowDetailedView(false);
            }}
          />
        )
      default:
        return <Typography variant='h1'>Defaulted Detailed View</Typography>
    }
  }, [chains, destChains, handleChainSwitch, selectedDetailedView, sourceChains])
  
  return (
    <div>
      {showDetailedView
      ? DetailedView
      : <DepositCard
        sourceChainProps={{
          onClick: () => {
            setDetailedView(DetailedCardOption.SourceChain);
            setShowDetailedView(true);
          },
          chainType: 'source',
        }}
        destChainProps={{
          onClick: () => {
            setDetailedView(DetailedCardOption.DestChain);
            setShowDetailedView(true);
          },
          chainType: 'dest',
          chain: destChain ? { name: destChain.name, symbol: currenciesConfig[destChain.nativeCurrencyId].symbol } : undefined
        }}
        tokenInputProps={{
          onClick: () => {
            console.log('show the list card for the token')
          }
        }}
      />
    }
    </div>
  );
});
