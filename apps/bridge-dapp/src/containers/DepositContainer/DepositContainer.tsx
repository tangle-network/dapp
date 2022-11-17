import { useWebContext } from '@webb-tools/api-provider-environment';
import { Chain, currenciesConfig } from '@webb-tools/dapp-config';
import {
  useBridge,
  useBridgeDeposit,
  useCurrencies,
  useCurrenciesBalances,
  useCurrencyBalance,
} from '@webb-tools/react-hooks';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import { useModal } from '@webb-tools/ui-hooks';
import {
  ChainListCard,
  DepositCard,
  TokenListCard,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { TokenType } from '@webb-tools/webb-ui-components/components/BridgeInputs/types';
import {
  AssetType,
  ChainType,
} from '@webb-tools/webb-ui-components/components/ListCard/types';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { ChainSelectionWrapper, WalletModal } from '../../components';
import { CreateAccountModal } from '../CreateAccountModal';
import { DepositConfirmContainer } from './DepositConfirmContainer';
import { DepositContainerProps } from './types';

export const DepositContainer = forwardRef<
  HTMLDivElement,
  DepositContainerProps
>(({ setTxPayload, ...props }, ref) => {
  const { setMainComponent } = useWebbUI();
  const { activeApi, chains, activeChain, activeWallet, loading, noteManager } =
    useWebContext();

  const { generateNote } = useBridgeDeposit();
  const { setGovernedCurrency } = useBridge();
  const { governedCurrencies , wrappableCurrencies  } = useCurrencies();

  // The seleted token balance
  const selectedTokenBalance = useCurrencyBalance(
    activeApi?.state.activeBridge?.currency
  );

  const { status: isNoteAccountModalOpen, update: setNoteAccountModalOpen } =
    useModal(false);

  // Other supported tokens balances
  const balances = useCurrenciesBalances(governedCurrencies.concat(wrappableCurrencies));

  const [isGeneratingNote, setIsGeneratingNote] = useState(false);
  const [sourceChain, setSourceChain] = useState<Chain | undefined>(undefined);
  const [destChain, setDestChain] = useState<Chain | undefined>(undefined);
  const [amount, setAmount] = useState<number>(0);

  const parseAndSetAmount = (amount: string | number): void => {
    const parsedAmount = Number(amount);
    if (!isNaN(parsedAmount)) {
      setAmount(parsedAmount);
    }
  };

  const sourceChains: ChainType[] = useMemo(() => {
    return Object.values(chains).map((val) => {
      return {
        name: val.name,
        symbol: currenciesConfig[val.nativeCurrencyId].symbol,
      };
    });
  }, [chains]);

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
      balance: balances[activeApi.state.activeBridge.currency.id] ?? 0,
    };
  }, [activeApi, balances]);

  const populatedSelectableWebbTokens = useMemo((): AssetType[] => {
    return Object.values(governedCurrencies).map((currency) => {
      return {
        name: currency.view.name,
        symbol: currency.view.symbol,
        balance: balances[currency.id],
      };
    });
  }, [governedCurrencies, balances]);

  const isWalletConnected = useMemo(
    () => activeChain && activeWallet && !loading,
    [activeChain, activeWallet, loading]
  );

  const hasNoteAccount = useMemo(() => Boolean(noteManager), [noteManager]);

  const isDisabledDepositButton = useMemo(() => {
    return [
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
  ]);

  const handleTokenChange = useCallback(
    async (newToken: AssetType) => {
      const selectedToken = Object.values(governedCurrencies).find(
        (token) => token.view.symbol === newToken.symbol
      );
      if (selectedToken) {
        setGovernedCurrency(selectedToken);
      }
    },
    [governedCurrencies, setGovernedCurrency]
  );

  const sourceChainInputOnClick = useCallback(() => {
    setMainComponent(
      <ChainListCard
        className="w-[550px] h-[720px]"
        chainType="source"
        chains={sourceChains}
        value={selectedSourceChain}
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

          if (chain) {
            setMainComponent(
              <WalletModal chain={chain} sourceChains={sourceChains} />
            );
          }
        }}
        onClose={() => setMainComponent(undefined)}
      />
    );
  }, [chains, selectedSourceChain, setMainComponent, sourceChains]);

  const onMaxBtnClick = useCallback(() => {
    setAmount(selectedTokenBalance ?? 0);
  }, [selectedTokenBalance]);

  // Main action on click
  const actionOnClick = useCallback(async () => {
    // No wallet connected
    if (!isWalletConnected) {
      const sourceChains: ChainType[] = Object.values(chains).map((val) => {
        return {
          name: val.name,
          symbol: currenciesConfig[val.nativeCurrencyId].symbol,
        };
      });

      setMainComponent(<ChainSelectionWrapper sourceChains={sourceChains} />);
      return;
    }

    // No note account exists
    if (!hasNoteAccount) {
      setNoteAccountModalOpen(true);
      return;
    }

    if (sourceChain && destChain && selectedToken && amount !== 0  && activeApi?.state.activeBridge) {
      setIsGeneratingNote(true);
      const newDepositPayload = await generateNote(
        activeApi.state.activeBridge.targets[
          calculateTypedChainId(sourceChain.chainType, sourceChain.chainId)
        ],
        calculateTypedChainId(destChain.chainType, destChain.chainId),
        amount,
        undefined
      );
      setIsGeneratingNote(false);

      setMainComponent(
        <DepositConfirmContainer
          setTxPayload={setTxPayload}
          amount={amount}
          token={selectedToken}
          sourceChain={selectedSourceChain}
          destChain={destChainInputValue}
          depositPayload={newDepositPayload}
        />
      );
    }
  }, [
    isWalletConnected,
    hasNoteAccount,
    sourceChain,
    destChain,
    selectedToken,
    amount,
    chains,
    setMainComponent,
    setNoteAccountModalOpen,
    generateNote,
    activeApi?.state.activeBridge?.targets,
    setTxPayload,
    selectedSourceChain,
    destChainInputValue,
  ]);

  // Only disable button when the wallet is connected and exists a note account
  const isDisabled = useMemo(
    () => isWalletConnected && hasNoteAccount && isDisabledDepositButton,
    [hasNoteAccount, isDisabledDepositButton, isWalletConnected]
  );

  const buttonText = useMemo(() => {
    if (isWalletConnected && hasNoteAccount) {
      return 'Deposit';
    }

    if (isWalletConnected) {
      return 'Create Note Account';
    }

    return 'Connect wallet';
  }, [hasNoteAccount, isWalletConnected]);

  return (
    <>
      <div {...props} ref={ref}>
        <DepositCard
          className="h-[700px]"
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
                  className="w-[550px] h-[720px]"
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
                    className="w-[550px] h-[720px]"
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
            onMaxBtnClick,
          }}
          buttonProps={{
            onClick: actionOnClick,
            isLoading: loading || isGeneratingNote,
            loadingText: loading ? 'Connecting...' : 'Generating Note...',
            isDisabled,
            children: buttonText,
          }}
          token={selectedToken?.symbol}
        />
      </div>

      <CreateAccountModal
        isOpen={isNoteAccountModalOpen}
        onOpenChange={(open) => setNoteAccountModalOpen(open)}
      />
    </>
  );
});
