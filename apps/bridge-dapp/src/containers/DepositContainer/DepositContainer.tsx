import { useWebContext } from '@webb-tools/api-provider-environment';
import { Chain, currenciesConfig } from '@webb-tools/dapp-config';

import { DepositPayload } from '@webb-tools/abstract-api-provider';
import { downloadString } from '@webb-tools/browser-utils';
import { useBridgeDeposit, useCurrencies } from '@webb-tools/react-hooks';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { useCopyable } from '@webb-tools/ui-hooks';
import {
  ChainListCard,
  DepositCard,
  DepositConfirm,
  getTokenRingValue,
  TokenListCard,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { TokenType } from '@webb-tools/webb-ui-components/components/BridgeInputs/types';
import {
  AssetType,
  ChainType,
} from '@webb-tools/webb-ui-components/components/ListCard/types';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { WalletModal } from '../../components';
import { DepositContainerProps } from './types';

export const DepositContainer = forwardRef<
  HTMLDivElement,
  DepositContainerProps
>((props, ref) => {
  const { setMainComponent } = useWebbUI();
  const { activeApi, chains, switchChain, activeChain } = useWebContext();
  const { setGovernedCurrency, generateNote, deposit } = useBridgeDeposit();
  const { governedCurrencies } = useCurrencies();

  const [sourceChain, setSourceChain] = useState<Chain | undefined>(undefined);
  const [destChain, setDestChain] = useState<Chain | undefined>(undefined);
  const [amount, setAmount] = useState<number>(0);

  const [walletModalOpen, setWalletModalOpen] = useState(true);

  const parseAndSetAmount = (amount: string | number): void => {
    const parsedAmount = Number(amount);
    if (!isNaN(parsedAmount)) {
      setAmount(parsedAmount);
    }
  };

  // Copy for the deposit confirm
  const { copy } = useCopyable();
  const handleCopy = useCallback(
    (depositPayload: DepositPayload): void => {
      copy(depositPayload.note.serialize() ?? '');
    },
    [copy]
  );

  // Download for the deposit confirm
  const downloadNote = useCallback((depositPayload: DepositPayload) => {
    const note = depositPayload?.note?.serialize() ?? '';
    downloadString(note, note.slice(-note.length - 10) + '.txt');
  }, []);

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

  const isDisabledDepositButton = useMemo(() => {
    return [
      sourceChainInputValue,
      selectedSourceChain,
      selectedToken,
      destChainInputValue,
      amount,
    ].some((val) => Boolean(val) === false);
  }, [
    amount,
    destChainInputValue,
    selectedSourceChain,
    selectedToken,
    sourceChainInputValue,
  ]);

  const handleTokenChange = useCallback(
    async (newToken: AssetType) => {
      const selectedToken = Object.values(governedCurrencies).find(
        (token) => token.view.symbol === newToken.symbol
      );
      setGovernedCurrency(selectedToken);
    },
    [governedCurrencies, setGovernedCurrency]
  );

  const DepositConfirmWrapper = useMemo(
    () =>
      forwardRef<HTMLDivElement, { depositPayload: DepositPayload }>(
        ({ depositPayload }, ref) => {
          const [checked, setChecked] = useState(false);
          const [isDepositing, setIsDepositing] = useState(false);

          return (
            <DepositConfirm
              ref={ref}
              note={depositPayload.note.serialize()}
              actionBtnProps={{
                isDisabled: !checked,
                isLoading: isDepositing,
                loadingText: 'Depositing...',
                onClick: async () => {
                  setIsDepositing(true);
                  downloadNote(depositPayload);
                  await deposit(depositPayload);
                  setIsDepositing(false);
                  setMainComponent(undefined);
                },
              }}
              checkboxProps={{
                isChecked: checked,
                onChange: () => setChecked((prev) => !prev),
              }}
              onCopy={() => handleCopy(depositPayload)}
              onDownload={() => downloadNote(depositPayload)}
              amount={amount}
              token1Symbol={selectedToken?.symbol}
              sourceChain={getTokenRingValue(selectedSourceChain.symbol)}
              destChain={getTokenRingValue(destChainInputValue.symbol)}
              fee={0}
              onClose={() => setMainComponent(undefined)}
            />
          );
        }
      ),
    [
      amount,
      deposit,
      destChainInputValue?.symbol,
      downloadNote,
      handleCopy,
      selectedSourceChain?.symbol,
      selectedToken?.symbol,
      setMainComponent,
    ]
  );

  const sourceChainInputOnClick = useCallback(() => {
    setMainComponent(
      <ChainListCard
        chainType="source"
        chains={sourceChains}
        value={sourceChainInputValue}
        onChange={async (selectedChain) => {
          const chain = Object.values(chains).find(
            (val) => val.name === selectedChain.name
          );

          const sourceChains: ChainType[] = Object.values(chains).map((val) => {
            return {
              name: val.name,
              symbol: currenciesConfig[val.nativeCurrencyId].symbol,
            };
          });

          setMainComponent(
            <WalletModal chain={chain} sourceChains={sourceChains} />
          );
        }}
        onClose={() => setMainComponent(undefined)}
      />
    );
  }, [chains, setMainComponent, sourceChainInputValue, sourceChains]);

  return (
    <div>
      <DepositCard
        sourceChainProps={{
          chain: selectedSourceChain,
          onClick: sourceChainInputOnClick,
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
          amount: amount ? amount.toString() : undefined,
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

              setMainComponent(
                <DepositConfirmWrapper depositPayload={newDepositPayload} />
              );
            }
          },
          isDisabled: isDisabledDepositButton,
        }}
        token={selectedToken?.symbol}
      />
    </div>
  );
});
