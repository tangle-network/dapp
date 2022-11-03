import { useWebContext } from '@webb-tools/api-provider-environment';
import { Chain, currenciesConfig } from '@webb-tools/dapp-config';

import {
  ChainListCard,
  DepositCard,
  DepositConfirm,
  TokenListCard,
  useWebbUI,
  WalletConnectionCard,
} from '@webb-tools/webb-ui-components';
import { useBridgeDeposit, useCurrencies, useCurrencyBalance } from '@webb-tools/react-hooks';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { DepositContainerProps } from './types';
import { AssetType, ChainType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { DepositPayload } from '@webb-tools/abstract-api-provider';
import { TokenType } from '@webb-tools/webb-ui-components/components/BridgeInputs/types';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { useCopyable } from '@webb-tools/ui-hooks';

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
  const { setMainComponent } = useWebbUI();
  const { activeApi, chains, switchChain, activeChain, loading } = useWebContext();
  const { setWrappableCurrency, setGovernedCurrency, generateNote, deposit } = useBridgeDeposit();
  const { governedCurrencies, governedCurrency, wrappableCurrencies, wrappableCurrency } = useCurrencies();
  const webbTokenBalance = useCurrencyBalance(governedCurrency);
  console.log('webb token balance is: ', webbTokenBalance);

  const [depositPayload, setDepositPayload] = useState<DepositPayload | undefined>(undefined);
  const [sourceChain, setSourceChain] = useState<Chain | undefined>(undefined);
  const [destChain, setDestChain] = useState<Chain | undefined>(undefined);
  const [amount, setAmount] = useState<number>(0);

  const parseAndSetAmount = (amount: string | number): void => {
    const parsedAmount = Number(amount);
    if (!isNaN(parsedAmount)) {
      setAmount(parsedAmount);
    }
  };

  // Copy for the deposit confirm
  const { copy } = useCopyable();
  const handleCopy = useCallback((): void => {
    copy(depositPayload.note.serialize() ?? '');
  }, [depositPayload, copy]);

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
    [chains, setDetailedView]
  );

  const selectedSourceChain: ChainType | undefined = useMemo(() => {
    if (!activeChain) {
      return undefined;
    }

    // If the UI State does not show the activeChain, update it.
    if (!sourceChain) {
      setSourceChain(activeChain);
    }

    return {
      name: activeChain.name,
      symbol: currenciesConfig[activeChain.nativeCurrencyId].symbol,
    };
  }, [activeChain, sourceChain]);

  const selectedToken: TokenType | undefined = useMemo(() => {
    if (!activeApi || !activeApi.state.activeBridge) {
      return undefined;
    }

    return {
      symbol: activeApi.state.activeBridge.currency.view.symbol,
    };
  }, [activeApi]);

  const populatedSelectableWebbTokens = useMemo((): AssetType[] => {
    return Object.values(governedCurrencies).map((currency) => {
      return {
        name: currency.view.name,
        symbol: currency.view.symbol,
      };
    });
  }, [governedCurrencies]);

  const handleTokenChange = useCallback(
    async (newToken: AssetType) => {
      const selectedToken = Object.values(governedCurrencies).find(
        (token) => token.view.symbol === newToken.symbol
      );
      setGovernedCurrency(selectedToken);
    },
    [governedCurrencies, setGovernedCurrency]
  );

  return (
    <div>
      <DepositCard
        // The selectedDetailedView alters the global mainComponent for display.
        // Therfore, if the detailed view exists (input selected) then hide the base component.
        style={selectedDetailedView ? { visibility: 'hidden' } : { visibility: 'visible' }}
        sourceChainProps={{
          chain: selectedSourceChain,
          onClick: () => {
            setMainComponent(
              <ChainListCard
                chainType="source"
                chains={sourceChains}
                value={sourceChainInputValue}
                onChange={async (selectedChain) => {
                  setMainComponent(
                    <WalletConnectionCard
                      wallets={Object.values(sourceChain.wallets)}
                      onWalletSelect={async (wallet) => {
                        await switchChain(sourceChain, wallet);
                        setDetailedView(null);
                      }}
                      onClose={() => setDetailedView(null)}
                    />
                  )
                }}
                onClose={() => setDetailedView(null)}
              />
            )
          },
          chainType: 'source',
        }}
        destChainProps={{
          chain: destChainInputValue,
          onClick: () => {
            setMainComponent(
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
            )
          },
          chainType: 'dest',
        }}
        tokenInputProps={{
          onClick: () => {
            if (selectedSourceChain) {
              setMainComponent(
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
          },
          token: selectedToken
        }}
        amountInputProps={{
          onAmountChange: (value) => {
            parseAndSetAmount(value)
          },
        }}
        buttonProps={{
          onClick: async () => {
            if (sourceChain && destChain && selectedToken && amount !== 0) {
              const note = await generateNote(
                activeApi.state.activeBridge.targets[
                  calculateTypedChainId(
                    sourceChain.chainType,
                    sourceChain.chainId
                  )
                ],
                calculateTypedChainId(destChain.chainType, destChain.chainId),
                amount,
                undefined
              );

              setDepositPayload(note);

              setMainComponent(
                <DepositConfirm
                  note={depositPayload.note.serialize()}
                  actionBtnProps={{
                    onClick: async () => {
                      await deposit(depositPayload)
                    }              
                  }}
                  onCopy={handleCopy}
                  amount={amount}
                  fee={0}
                  onClose={
                    () => setDetailedView(null)
                  }
                />
              );
            }
          },
        }}
      />
    </div>
  );
})
