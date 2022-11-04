import { useWebContext } from '@webb-tools/api-provider-environment';
import { Chain, currenciesConfig } from '@webb-tools/dapp-config';

import { DepositPayload } from '@webb-tools/abstract-api-provider';
import {
  useBridgeDeposit,
  useCurrencies,
  useCurrencyBalance,
} from '@webb-tools/react-hooks';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { useCopyable } from '@webb-tools/ui-hooks';
import {
  ChainListCard,
  DepositCard,
  DepositConfirm,
  TokenListCard,
  useWebbUI,
  WalletConnectionCard,
} from '@webb-tools/webb-ui-components';
import { TokenType } from '@webb-tools/webb-ui-components/components/BridgeInputs/types';
import {
  AssetType,
  ChainType,
} from '@webb-tools/webb-ui-components/components/ListCard/types';
import cx from 'classnames';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { DepositContainerProps } from './types';

export const DepositContainer = forwardRef<
  HTMLDivElement,
  DepositContainerProps
>((props, ref) => {
  const { customMainComponent, setMainComponent } = useWebbUI();
  const { activeApi, chains, switchChain, activeChain } = useWebContext();
  const { setGovernedCurrency, generateNote, deposit } = useBridgeDeposit();
  const { governedCurrencies, governedCurrency } = useCurrencies();
  const webbTokenBalance = useCurrencyBalance(governedCurrency);
  console.log('webb token balance is: ', webbTokenBalance);

  const [depositPayload, setDepositPayload] = useState<
    DepositPayload | undefined
  >(undefined);
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
        sourceChainProps={{
          chain: selectedSourceChain,
          onClick: () => {
            setMainComponent(
              <ChainListCard
                chainType="source"
                chains={sourceChains}
                value={sourceChainInputValue}
                onChange={async (selectedChain) => {
                  const chain = Object.values(chains).find(
                    (val) => val.name === selectedChain.name
                  );

                  setMainComponent(
                    <WalletConnectionCard
                      wallets={Object.values(chain.wallets)}
                      onWalletSelect={async (wallet) => {
                        await switchChain(chain, wallet);
                        setMainComponent(undefined);
                      }}
                      onClose={() => setMainComponent(undefined)}
                    />
                  );
                }}
                onClose={() => setMainComponent(undefined)}
              />
            );
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
                  setMainComponent(undefined);
                }}
                onClose={() => setMainComponent(undefined)}
              />
            );
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
                    setMainComponent(undefined);
                  }}
                  onClose={() => setMainComponent(undefined)}
                />
              );
            }
          },
          token: selectedToken,
        }}
        amountInputProps={{
          onAmountChange: (value) => {
            parseAndSetAmount(value);
          },
        }}
        buttonProps={{
          onClick: async () => {
            if (sourceChain && destChain && selectedToken && amount !== 0) {
              const newDepositPayload = await generateNote(
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

              console.log('new deposit payload: ', newDepositPayload);

              setDepositPayload(newDepositPayload);

              setMainComponent(
                <DepositConfirm
                  note={newDepositPayload.note.serialize()}
                  actionBtnProps={{
                    onClick: async () => {
                      await deposit(newDepositPayload);
                    },
                  }}
                  onCopy={handleCopy}
                  amount={amount}
                  fee={0}
                  onClose={() => setMainComponent(undefined)}
                />
              );
            }
          },
        }}
      />
    </div>
  );
});
