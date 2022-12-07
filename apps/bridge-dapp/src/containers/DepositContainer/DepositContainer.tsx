import { useWebContext } from '@webb-tools/api-provider-environment';
import { Chain, currenciesConfig } from '@webb-tools/dapp-config';
import {
  useBridge,
  useBridgeDeposit,
  useCurrencies,
  useCurrenciesBalances,
  useCurrencyBalance,
  useNoteAccount,
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
import { DepositCardProps } from '@webb-tools/webb-ui-components/containers/DepositCard/types';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { ChainSelectionWrapper, WalletModal } from '../../components';
import { CreateAccountModal } from '../CreateAccountModal';
import { DepositConfirmContainer } from './DepositConfirmContainer';
import { DepositContainerProps } from './types';

export const DepositContainer = forwardRef<
  HTMLDivElement,
  DepositContainerProps
>(
  (
    {
      defaultDestinationChain,
      defaultGovernedCurrency,
      onTryAnotherWallet,
      ...props
    },
    ref
  ) => {
    const { setMainComponent } = useWebbUI();

    const {
      activeApi,
      chains,
      switchChain,
      activeChain,
      activeWallet,
      loading,
      noteManager,
      apiConfig: { currencies },
    } = useWebContext();

    const { generateNote } = useBridgeDeposit();

    const {
      setGovernedCurrency,
      setWrappableCurrency,
      wrappableCurrency,
      governedCurrency,
    } = useBridge();

    const {
      governedCurrencies,
      wrappableCurrencies,
      getPossibleGovernedCurrencies,
    } = useCurrencies();

    const { status: isNoteAccountModalOpen, update: setNoteAccountModalOpen } =
      useModal(false);

    // Other supported tokens balances
    const balances = useCurrenciesBalances(
      governedCurrencies.concat(wrappableCurrencies)
    );

    const { syncNotes } = useNoteAccount();

    // State for note account creation success
    const [isNoteAccountCreated, setIsNoteAccountCreated] = useState(false);

    const [isGeneratingNote, setIsGeneratingNote] = useState(false);
    const [sourceChain, setSourceChain] = useState<Chain | undefined>(
      undefined
    );
    const [destChain, setDestChain] = useState<Chain | undefined>(
      () => defaultDestinationChain
    );

    const [amount, setAmount] = useState<number>(0);

    const onAmountChange = useCallback((amount: string): void => {
      const parsedAmount = Number(amount);
      if (!isNaN(parsedAmount)) {
        setAmount(parsedAmount);
      }
    }, []);

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

    const bridgeGovernedCurrency = useMemo(() => {
      if (!governedCurrency) {
        return undefined;
      }
      return {
        currency: governedCurrency,
        balance: balances[governedCurrency.id] ?? 0,
      };
    }, [governedCurrency, balances]);

    const bridgeWrappableCurrency = useMemo(() => {
      if (!wrappableCurrency) {
        return undefined;
      }
      return {
        currency: wrappableCurrency,
        balance: balances[wrappableCurrency.id] ?? 0,
      };
    }, [wrappableCurrency, balances]);

    const selectedToken: TokenType | undefined = useMemo(() => {
      // Wrap and deposit flow
      if (bridgeWrappableCurrency) {
        return {
          symbol: bridgeWrappableCurrency.currency.view.symbol,
          balance: bridgeWrappableCurrency.balance,
        };
      }
      if (!bridgeGovernedCurrency) {
        return undefined;
      }
      // Deposit flow
      return {
        symbol: bridgeGovernedCurrency.currency.view.symbol,
        balance: bridgeGovernedCurrency.balance,
      };
    }, [bridgeGovernedCurrency, bridgeWrappableCurrency]);

    const populatedSelectableWebbTokens = useMemo((): AssetType[] => {
      return Object.values(governedCurrencies.concat(wrappableCurrencies)).map(
        (currency) => {
          return {
            name: currency.view.name,
            symbol: currency.view.symbol,
            balance: balances[currency.id],
          };
        }
      );
    }, [governedCurrencies, wrappableCurrencies, balances]);

    const populatedAllTokens = useMemo((): AssetType[] => {
      // Filter currencies that are not in the populated selectable tokens
      const filteredCurrencies = Object.values(currencies).filter(
        (currency) =>
          !populatedSelectableWebbTokens.find(
            (token) =>
              token.symbol === currency.symbol && token.name === currency.name
          )
      );

      return Object.values(filteredCurrencies).map((currency) => {
        return {
          name: currency.name,
          symbol: currency.symbol,
          balance: balances[currency.id],
        };
      });
    }, [currencies, populatedSelectableWebbTokens, balances]);

    const isWalletConnected = useMemo(
      () => activeChain && activeWallet && !loading,
      [activeChain, activeWallet, loading]
    );

    const hasNoteAccount = useMemo(() => Boolean(noteManager), [noteManager]);

    const isWrapFlow = useMemo(
      () => Boolean(bridgeGovernedCurrency) && Boolean(bridgeWrappableCurrency),
      [bridgeGovernedCurrency, bridgeWrappableCurrency]
    );

    const isDisabledDepositButton = useMemo(() => {
      const selectedTokenBalance = selectedToken?.balance
        ? Number(selectedToken.balance)
        : 0;

      return [
        selectedSourceChain,
        selectedToken,
        destChainInputValue,
        amount,
        selectedTokenBalance >= amount,
      ].some((val) => Boolean(val) === false);
    }, [amount, destChainInputValue, selectedSourceChain, selectedToken]);

    const handleTokenChange = useCallback(
      async (newToken: AssetType) => {
        const selectedToken = Object.values(governedCurrencies).find(
          (token) => token.view.symbol === newToken.symbol
        );
        if (selectedToken) {
          // unset the wrappable currency
          await setWrappableCurrency(null);
          // Set the Governable currency
          await setGovernedCurrency(selectedToken);
          setMainComponent(undefined);
          return;
        }

        // Case when wrappable token is being selected
        const selectedWrappableToken = Object.values(wrappableCurrencies).find(
          (token) => token.view.symbol === newToken.symbol
        );
        if (selectedWrappableToken) {
          const tokens = getPossibleGovernedCurrencies(
            selectedWrappableToken.id
          );
          await setGovernedCurrency(tokens[0]);
          await setWrappableCurrency(selectedWrappableToken);
          setMainComponent(undefined);
        }
      },
      [
        governedCurrencies,
        setGovernedCurrency,
        setMainComponent,
        setWrappableCurrency,
        wrappableCurrencies,
        getPossibleGovernedCurrencies,
      ]
    );

    const sourceChainInputOnClick = useCallback(() => {
      setMainComponent(
        <ChainListCard
          className="w-[550px] h-[700px]"
          overrideScrollAreaProps={{ className: 'h-[550px]' }}
          chainType="source"
          chains={sourceChains}
          value={selectedSourceChain}
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

            // Otherwise pop up the wallet modal to choose another wallet to connect
            const sourceChains: ChainType[] = Object.values(chains).map(
              (val) => {
                return {
                  name: val.name,
                  symbol: currenciesConfig[val.nativeCurrencyId].symbol,
                };
              }
            );

            setMainComponent(
              <WalletModal chain={chain} sourceChains={sourceChains} />
            );
          }}
          onClose={() => setMainComponent(undefined)}
        />
      );
    }, [
      activeWallet,
      chains,
      selectedSourceChain,
      setMainComponent,
      sourceChains,
      switchChain,
    ]);

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

      if (
        sourceChain &&
        destChain &&
        selectedToken &&
        amount !== 0 &&
        activeApi?.state?.activeBridge &&
        activeChain
      ) {
        setIsGeneratingNote(true);
        const chainId = calculateTypedChainId(
          activeChain.chainType,
          activeChain.chainId
        );
        const wrappbleTokenAddress =
          wrappableCurrency?.getAddress(chainId) ?? undefined;
        const newDepositPayload = await generateNote(
          activeApi.state.activeBridge.targets[
            calculateTypedChainId(sourceChain.chainType, sourceChain.chainId)
          ],
          calculateTypedChainId(destChain.chainType, destChain.chainId),
          amount,
          wrappbleTokenAddress
        );
        setIsGeneratingNote(false);
        setMainComponent(
          <DepositConfirmContainer
            wrappingFlow={Boolean(wrappbleTokenAddress)}
            wrappableTokenSymbol={governedCurrency?.view.symbol}
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
      activeApi?.state?.activeBridge,
      activeChain,
      chains,
      setMainComponent,
      setNoteAccountModalOpen,
      generateNote,
      selectedSourceChain,
      destChainInputValue,
      wrappableCurrency,
      governedCurrency,
    ]);

    // Only disable button when the wallet is connected and exists a note account
    const isDisabled = useMemo(
      () => isWalletConnected && hasNoteAccount && isDisabledDepositButton,
      [hasNoteAccount, isDisabledDepositButton, isWalletConnected]
    );

    const buttonText = useMemo(() => {
      if (isWalletConnected && hasNoteAccount) {
        if (isWrapFlow) {
          return 'Wrap and Deposit';
        }
        return 'Deposit';
      }

      if (isWalletConnected) {
        return 'Create Note Account';
      }

      return 'Connect wallet';
    }, [hasNoteAccount, isWalletConnected, isWrapFlow]);

    const amountErrorMessage = useMemo(() => {
      if (!selectedToken?.balance) {
        return undefined;
      }
      return Number(selectedToken.balance) >= amount
        ? undefined
        : 'Insufficient balance';
    }, [amount, selectedToken]);

    const bridgingTokenProps = useMemo<
      DepositCardProps['bridgingTokenProps']
    >(() => {
      if (!wrappableCurrency || !bridgeGovernedCurrency) {
        return undefined;
      }
      const targetSymbol = bridgeGovernedCurrency.currency.view.symbol;

      const tokens = getPossibleGovernedCurrencies(wrappableCurrency.id).map(
        (currency): AssetType => ({
          name: currency.view.name,
          balance: balances[currency.id] ?? 0,

          symbol: currency.view.symbol,
        })
      );

      return {
        token: {
          symbol: targetSymbol,
          balance: bridgeGovernedCurrency.balance,
        },
        onClick: () => {
          if (selectedSourceChain) {
            setMainComponent(
              <TokenListCard
                className="w-[550px] h-[700px]"
                title={'Select Asset to Wrap and Deposit'}
                popularTokens={[]}
                selectTokens={tokens}
                unavailableTokens={populatedAllTokens}
                onChange={handleTokenChange}
                onClose={() => setMainComponent(undefined)}
                onConnect={onTryAnotherWallet}
              />
            );
          }
        },
      };
    }, [
      wrappableCurrency,
      bridgeGovernedCurrency,
      getPossibleGovernedCurrencies,
      balances,
      selectedSourceChain,
      setMainComponent,
      populatedAllTokens,
      handleTokenChange,
      onTryAnotherWallet,
    ]);

    const handleOpenChange = useCallback(
      async (nextOpen: boolean) => {
        setNoteAccountModalOpen(nextOpen);

        // If the modal close and the user has a note account
        // then we will sync the notes
        if (!nextOpen && isNoteAccountCreated) {
          try {
            await syncNotes();
          } catch (error) {
            console.log('Error while syncing notes', error);
          }
        }
      },
      [isNoteAccountCreated, setNoteAccountModalOpen, syncNotes]
    );

    const onMaxBtnClick = useCallback(() => {
      const balance = selectedToken?.balance ?? '0';
      setAmount(Number(balance));
    }, [selectedToken]);

    // Effect to update the default governed currency
    useEffect(() => {
      async function updateDefaultGovernedCurrency() {
        if (!defaultGovernedCurrency) {
          return;
        }

        // unset the wrappable currency
        await setWrappableCurrency(null);
        // Set the Governable currency
        await setGovernedCurrency(defaultGovernedCurrency);
      }

      updateDefaultGovernedCurrency();
    }, [defaultGovernedCurrency, setGovernedCurrency, setWrappableCurrency]);

    // Effect to update the default destination chain
    useEffect(() => {
      setDestChain(defaultDestinationChain);
    }, [defaultDestinationChain]);

    return (
      <>
        <div {...props} ref={ref}>
          <DepositCard
            className="h-[615px]"
            sourceChainProps={{
              chain: selectedSourceChain,
              onClick: sourceChainInputOnClick,
              chainType: 'source',
            }}
            bridgingTokenProps={bridgingTokenProps}
            destChainProps={{
              chain: destChainInputValue,
              onClick: () => {
                setMainComponent(
                  <ChainListCard
                    className="w-[550px] h-[700px]"
                    overrideScrollAreaProps={{ className: 'h-[550px]' }}
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
                      className="w-[550px] h-[700px]"
                      title={'Select Asset to Deposit'}
                      popularTokens={[]}
                      selectTokens={populatedSelectableWebbTokens}
                      unavailableTokens={populatedAllTokens}
                      onChange={handleTokenChange}
                      onClose={() => setMainComponent(undefined)}
                      onConnect={onTryAnotherWallet}
                    />
                  );
                }
              },
              token: selectedToken,
            }}
            amountInputProps={{
              amount: amount ? amount.toString() : undefined,
              onAmountChange,
              onMaxBtnClick,
              isDisabled: !selectedToken,
              errorMessage: amountErrorMessage,
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
          onOpenChange={handleOpenChange}
          isSuccess={isNoteAccountCreated}
          onIsSuccessChange={(success) => setIsNoteAccountCreated(success)}
        />
      </>
    );
  }
);
