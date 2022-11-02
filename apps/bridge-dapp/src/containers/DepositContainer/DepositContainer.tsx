import { useWebContext } from '@webb-tools/api-provider-environment';
import {
  ChainListCard,
  DepositCard,
  DepositConfirm,
  TokenListCard,
  Typography,
  WalletConnectionCard,
} from '@webb-tools/webb-ui-components';
import { useBridgeDeposit, useCurrencies, useCurrencyBalance } from '@webb-tools/react-hooks';
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { DepositContainerProps } from './types';
import { AssetType, ChainType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { Chain, currenciesConfig } from '@webb-tools/dapp-config';
import { Currency } from '@webb-tools/abstract-api-provider';
import { TokenType } from '@webb-tools/webb-ui-components/components/BridgeInputs/types';
import { calculateTypedChainId } from '@webb-tools/sdk-core';

enum DetailedCardOption {
  SourceChain,
  DestChain,
  Wrap,
  Token,
  Wallet,
  DepositConfirm,
}

export const DepositContainer = forwardRef<
  HTMLDivElement,
  DepositContainerProps
>((props, ref) => {
  const { activeApi, chains, switchChain, activeChain, loading } = useWebContext();
  const { setWrappableCurrency, setGovernedCurrency, generateNote } = useBridgeDeposit();
  const { governedCurrencies, governedCurrency, wrappableCurrencies, wrappableCurrency } = useCurrencies();
  const webbTokenBalance = useCurrencyBalance(governedCurrency);
  console.log('webb token balance is: ', webbTokenBalance);

  const [note, setNote] = useState<string>('');
  const [sourceChain, setSourceChain] = useState<Chain | undefined>(undefined);
  const [destChain, setDestChain] = useState<Chain | undefined>(undefined);
  const [amount, setAmount] = useState<number>(0);

  const parseAndSetAmount = (amount: string | number): void => {
    const parsedAmount = Number(amount);
    if (!isNaN(parsedAmount)) {
      setAmount(parsedAmount);
    }
  };

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

  const handleSourceChainSwitch = useCallback(
    async (newChain: ChainType) => {
      const selectedChain = Object.values(chains).find(
        (chain) => chain.name === newChain.name
      );

      setDetailedView(DetailedCardOption.Wallet);
      setSourceChain(selectedChain);
      return;
    },
    [chains]
  );

  const selectedSourceChain: ChainType | undefined = useMemo(() => {
    if (!activeChain) {
      return undefined;
    }

    if (!sourceChain) {
      setSourceChain(activeChain);
    }
    
    return {
      name: activeChain.name,
      symbol: currenciesConfig[activeChain.nativeCurrencyId].symbol
    }
  }, [activeChain, sourceChain])

  const selectedToken: TokenType | undefined = useMemo(() => {
    if (!activeApi || !activeApi.state.activeBridge) {
      return undefined;
    }

    return {
      symbol: activeApi.state.activeBridge.currency.view.symbol
    }
  }, [activeApi]);

  const populatedSelectableWebbTokens = useMemo((): AssetType[] => {
    return Object.values(governedCurrencies).map((currency) => {
      return {
        name: currency.view.name,
        symbol: currency.view.symbol
      }
    })
  }, [governedCurrencies])

  const handleTokenChange = useCallback(
    async (newToken: AssetType) => {
      const selectedToken = Object.values(governedCurrencies).find(
        (token) => token.view.symbol === newToken.symbol
      )
      setGovernedCurrency(selectedToken);
    }, [governedCurrencies, setGovernedCurrency]
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
              handleSourceChainSwitch(selectedChain);
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
              setDetailedView(null);
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
            onWalletSelect={async (wallet) => {
              await switchChain(sourceChain, wallet)
              setDetailedView(null);
            }}
            onClose={() => setDetailedView(null)}
          />
        );
      }

      case DetailedCardOption.Token: {
        if (!sourceChain) {
          throw new Error('Token should not be selectable without a selected source chain');
        }

        return (
          <TokenListCard
            title={'Select Asset to Deposit'}
            popularTokens={[]}
            selectTokens={populatedSelectableWebbTokens}
            unavailableTokens={[]}
            onChange={(newAsset) => {
              handleTokenChange(newAsset);
              setDetailedView(null);
            }}
            onClose={() => setDetailedView(null)}
          />
        )
      }

      case DetailedCardOption.DepositConfirm: {
        return (
          <DepositConfirm
            note={note}
          />
        )
      }

      default:
        return null;
    }
  }, [chains, destChainInputValue, destChains, handleSourceChainSwitch, handleTokenChange, populatedSelectableWebbTokens, selectedDetailedView, sourceChain, sourceChainInputValue, sourceChains, switchChain]);

  return (
    <div>
      {DetailedView ? (
        DetailedView
      ) : (
        <DepositCard
          sourceChainProps={{
            chain: selectedSourceChain,
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
              if (sourceChain) {
                setDetailedView(DetailedCardOption.Token);
              }
            },
            token: selectedToken
          }}
          amountInputProps={{
            onAmountChange: (value) => {
              parseAndSetAmount(value);
            }
          }}
          buttonProps={{
            onClick: async () => {
              console.log('sourceCHain: ', sourceChain);
              console.log('destChain: ', destChain);
              console.log('selectedToken: ', selectedToken);
              console.log('amount: ', amount);
              if (sourceChain && destChain && selectedToken && amount !== 0) {
                const note = await generateNote(
                  activeApi.state.activeBridge.targets[calculateTypedChainId(sourceChain.chainType, sourceChain.chainId)],
                  destChain.chainId,
                  amount,
                  undefined
                );

                setNote(note.note.serialize());

                setDetailedView(DetailedCardOption.DepositConfirm);
              }
            }
          }}
        />
      )}
    </div>
  );
});
