import { useWebContext } from '@webb-tools/api-provider-environment';
import { Chain, currenciesConfig } from '@webb-tools/dapp-config';
import {
  useBridgeDeposit,
  useCurrencies,
  useCurrenciesBalances,
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
  ChainListCardProps,
  ChainType,
  TokenListCardProps,
} from '@webb-tools/webb-ui-components/components/ListCard/types';
import { DepositCardProps } from '@webb-tools/webb-ui-components/containers/DepositCard/types';
import {
  ElementType,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ChainSelectionWrapper,
  ChainSelectionWrapperProps,
  WalletModal,
  WalletModalProps,
} from '../../components';
import { getDefaultConnection } from '../../utils';
import { CreateAccountModal } from '../CreateAccountModal';
import { DepositConfirmContainer } from './DepositConfirmContainer';
import { DepositConfirmContainerProps, DepositContainerProps } from './types';

interface MainComponentProposVariants {
  ['source-chain-list-card']: ChainListCardProps;
  ['dest-chain-list-card']: ChainListCardProps;
  ['token-deposit-list-card']: TokenListCardProps;
  ['token-wrap-and-deposit-list-card']: TokenListCardProps;
  ['wallet-modal']: WalletModalProps;
  ['chain-selection-wrapper']: ChainSelectionWrapperProps;
  ['deposit-confirm-container']: DepositConfirmContainerProps;
}

type MainComponentVariants = keyof MainComponentProposVariants;

export const DepositContainer = forwardRef<
  HTMLDivElement,
  DepositContainerProps
>(
  (
    {
      defaultDestinationChain,
      defaultFungibleCurrency,
      onTryAnotherWallet,
      ...props
    },
    ref
  ) => {
    const { setMainComponent } = useWebbUI();
    const [mainComponentName, setMainComponentName] = useState<
      MainComponentVariants | undefined
    >(undefined);

    const setMainComponentHandler = (component: string | undefined) => {
      setMainComponentName(component as MainComponentVariants);
    };

    const {
      activeApi,
      chains,
      switchChain,
      activeChain,
      activeWallet,
      activeAccount,
      loading,
      noteManager,
      apiConfig: { currencies },
      txQueue,
    } = useWebContext();

    const { generateNote } = useBridgeDeposit();

    const [selectedChain, setSelectedChain] = useState<Chain | undefined>(
      undefined
    );

    const {
      fungibleCurrency,
      fungibleCurrencies,
      setFungibleCurrency,
      wrappableCurrency,
      wrappableCurrencies,
      setWrappableCurrency,
      getPossibleFungibleCurrencies,
    } = useCurrencies();

    const allTokens = useMemo(
      () => fungibleCurrencies.concat(wrappableCurrencies),
      [fungibleCurrencies, wrappableCurrencies]
    );

    const balances = useCurrenciesBalances(allTokens);

    const { status: isNoteAccountModalOpen, update: setNoteAccountModalOpen } =
      useModal(false);

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
      if (!activeApi?.state.activeBridge?.targets) {
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
    }, [activeApi?.state?.activeBridge?.targets, chains]);

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

    const bridgeFungibleCurrency = useMemo(() => {
      if (!fungibleCurrency) {
        return undefined;
      }
      return {
        currency: fungibleCurrency,
        balance: balances[fungibleCurrency.id] ?? 0,
      };
    }, [fungibleCurrency, balances]);

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
      if (!bridgeFungibleCurrency) {
        return undefined;
      }
      // Deposit flow
      return {
        symbol: bridgeFungibleCurrency.currency.view.symbol,
        balance: bridgeFungibleCurrency.balance,
      };
    }, [bridgeFungibleCurrency, bridgeWrappableCurrency]);

    const populatedSelectableWebbTokens = useMemo((): AssetType[] => {
      return Object.values(fungibleCurrencies.concat(wrappableCurrencies)).map(
        (currency) => {
          return {
            name: currency.view.name,
            symbol: currency.view.symbol,
            balance: balances[currency.id],
          };
        }
      );
    }, [fungibleCurrencies, wrappableCurrencies, balances]);

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

    const isWalletConnected = useMemo(() => {
      return (
        activeChain && activeWallet && (activeAccount ?? undefined) && !loading
      );
    }, [activeChain, activeWallet, activeAccount, loading]);

    const hasNoteAccount = useMemo(() => Boolean(noteManager), [noteManager]);

    const isWrapFlow = useMemo(
      () => Boolean(bridgeFungibleCurrency) && Boolean(bridgeWrappableCurrency),
      [bridgeFungibleCurrency, bridgeWrappableCurrency]
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
      ].some((val) => !val);
    }, [amount, destChainInputValue, selectedSourceChain, selectedToken]);

    const handleTokenChange = useCallback(
      async (newToken: AssetType) => {
        const selectedToken = Object.values(fungibleCurrencies).find(
          (token) => token.view.symbol === newToken.symbol
        );
        if (selectedToken) {
          // unset the wrappable currency
          await setWrappableCurrency(null);
          // Set the Governable currency
          await setFungibleCurrency(selectedToken);
          setMainComponentName(undefined);
          return;
        }

        // Case when wrappable token is being selected
        const selectedWrappableToken = Object.values(wrappableCurrencies).find(
          (token) => token.view.symbol === newToken.symbol
        );
        if (selectedWrappableToken) {
          const tokens = getPossibleFungibleCurrencies(
            selectedWrappableToken.id
          );
          await setFungibleCurrency(tokens[0]);
          await setWrappableCurrency(selectedWrappableToken);
          setMainComponentName(undefined);
        }
      },
      [
        fungibleCurrencies,
        setFungibleCurrency,
        setMainComponentName,
        setWrappableCurrency,
        wrappableCurrencies,
        getPossibleFungibleCurrencies,
      ]
    );

    const sourceChainInputOnClick = useCallback(() => {
      setMainComponentName('source-chain-list-card');
    }, [setMainComponentName]);

    // Main action on click
    const actionOnClick = useCallback(async () => {
      // Dismiss all the completed and failed txns in the queue before starting a new txn
      const txns = txQueue.txPayloads.filter(
        (tx) =>
          tx.txStatus.status === 'warning' || tx.txStatus.status === 'completed'
      );
      txns.map((tx) => tx.onDismiss());

      // No wallet connected
      if (!isWalletConnected) {
        const { defaultChain, sourceChains } = getDefaultConnection(chains);
        setMainComponent(
          <WalletModal chain={defaultChain} sourceChains={sourceChains} />
        );
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
        setDepositContainerProps({
          wrappingFlow: Boolean(wrappbleTokenAddress),
          wrappableTokenSymbol: fungibleCurrency?.view.symbol,
          amount,
          token: selectedToken,
          sourceChain: selectedSourceChain,
          destChain: destChainInputValue,
          depositPayload: newDepositPayload,
          setMainComponentHandler: setMainComponentHandler,
        });
        setMainComponentName('deposit-confirm-container');
      }
    }, [
      chains,
      setMainComponent,
      isWalletConnected,
      hasNoteAccount,
      sourceChain,
      destChain,
      selectedToken,
      amount,
      activeApi?.state?.activeBridge,
      activeChain,
      setMainComponentName,
      setNoteAccountModalOpen,
      generateNote,
      selectedSourceChain,
      destChainInputValue,
      wrappableCurrency,
      fungibleCurrency,
      txQueue,
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
      if (!wrappableCurrency || !bridgeFungibleCurrency) {
        return undefined;
      }
      const targetSymbol = bridgeFungibleCurrency.currency.view.symbol;

      return {
        token: {
          symbol: targetSymbol,
          balance: bridgeFungibleCurrency.balance,
          tokenComposition: [selectedToken?.symbol, targetSymbol],
        },
        onClick: () => {
          if (selectedSourceChain) {
            setMainComponentName('token-wrap-and-deposit-list-card');
          }
        },
      };
    }, [
      wrappableCurrency,
      bridgeFungibleCurrency,
      selectedSourceChain,
      setMainComponentName,
      selectedToken,
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
      async function updateDefaultFungibleCurrency() {
        if (!defaultFungibleCurrency) {
          return;
        }

        // unset the wrappable currency
        await setWrappableCurrency(null);
        // Set the Governable currency
        await setFungibleCurrency(defaultFungibleCurrency);
      }

      updateDefaultFungibleCurrency().catch((e) => {
        console.log(e);
      });
    }, [defaultFungibleCurrency, setFungibleCurrency, setWrappableCurrency]);

    // Effect to update the default destination chain
    useEffect(() => {
      setDestChain(defaultDestinationChain);
    }, [defaultDestinationChain]);

    const tokenListDepositProps = useMemo<TokenListCardProps>(() => {
      return {
        className: 'w-[550px] h-[700px]',
        title: `Select a token from ${selectedSourceChain?.name}`,
        popularTokens: [],
        selectTokens: populatedSelectableWebbTokens,
        unavailableTokens: populatedAllTokens,
        onChange: handleTokenChange,
        onClose: () => setMainComponentName(undefined),
        onConnect: onTryAnotherWallet,
      };
    }, [
      populatedSelectableWebbTokens,
      populatedAllTokens,
      handleTokenChange,
      setMainComponentName,
      onTryAnotherWallet,
      selectedSourceChain,
    ]);

    const tokenListWrapAndDepositProps = useMemo<
      TokenListCardProps | undefined
    >(() => {
      if (!wrappableCurrency || !bridgeFungibleCurrency) {
        return undefined;
      }

      const tokens = getPossibleFungibleCurrencies(wrappableCurrency.id).map(
        (currency): AssetType => ({
          name: currency.view.name,
          balance: balances[currency.id] ?? 0,

          symbol: currency.view.symbol,
        })
      );

      return {
        className: 'w-[550px] h-[700px]',
        selectTokens: tokens,
        value: destChainInputValue,
        title: 'Select Asset to Deposit',
        popularTokens: [],
        unavailableTokens: populatedAllTokens,
        onChange: (selectedChain) => {
          const destChain = Object.values(chains).find(
            (val) => val.name === selectedChain.name
          );
          setDestChain(destChain);
          setMainComponentName(undefined);
        },
        onClose: () => setMainComponentName(undefined),
      };
    }, [
      wrappableCurrency,
      bridgeFungibleCurrency,
      getPossibleFungibleCurrencies,
      destChainInputValue,
      populatedAllTokens,
      balances,
      chains,
    ]);

    const destChainListCardProps = useMemo<ChainListCardProps>(() => {
      return {
        className: 'w-[550px] h-[700px]',
        overrideScrollAreaProps: { className: 'h-[550px]' },
        chainType: 'dest',
        chains: destChains,
        value: destChainInputValue,
        onChange: async (selectedChain) => {
          const destChain = Object.values(chains).find(
            (val) => val.name === selectedChain.name
          );
          setDestChain(destChain);
          setMainComponentName(undefined);
        },
        onClose: () => setMainComponentName(undefined),
      };
    }, [
      chains,
      destChains,
      destChainInputValue,
      setDestChain,
      setMainComponentName,
    ]);

    const sourceChainListCardProps = useMemo<ChainListCardProps>(() => {
      return {
        className: 'w-[550px] h-[700px]',
        overrideScrollAreaProps: { className: 'h-[550px]' },
        chainType: 'source',
        chains: sourceChains,
        value: selectedSourceChain,
        onChange: async (selectedChain) => {
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
            setMainComponentName(undefined);
            return;
          }

          setSelectedChain(chain);
          setMainComponentName('wallet-modal');
        },
        onClose: () => setMainComponentName(undefined),
      };
    }, [
      switchChain,
      selectedSourceChain,
      sourceChains,
      chains,
      activeWallet,
      setMainComponentName,
      setSelectedChain,
    ]);

    const walletModalProps = useMemo<WalletModalProps | undefined>(() => {
      if (!selectedChain) {
        return undefined;
      }
      return {
        chain: selectedChain,
        sourceChains,
      };
    }, [selectedChain, sourceChains]);

    const chainSelectionWrapperProps =
      useMemo<ChainSelectionWrapperProps>(() => {
        return {
          sourceChains,
          handleOnClose: () => setMainComponentName(undefined),
        };
      }, [sourceChains]);

    const [depositConfirmContainerProps, setDepositContainerProps] = useState<
      DepositConfirmContainerProps | undefined
    >(undefined);

    const setMainComponentArgs = useMemo<
      [ElementType, Partial<MainComponentProposVariants>] | undefined
    >(() => {
      switch (mainComponentName) {
        case 'token-wrap-and-deposit-list-card':
          return [
            TokenListCard,
            {
              'token-wrap-and-deposit-list-card': tokenListWrapAndDepositProps,
            },
          ];

        case 'token-deposit-list-card':
          return [
            TokenListCard,
            {
              'token-wrap-and-deposit-list-card': tokenListDepositProps,
            },
          ];

        case 'source-chain-list-card':
          return [
            ChainListCard,
            {
              'source-chain-list-card': sourceChainListCardProps,
            },
          ];

        case 'dest-chain-list-card':
          return [
            ChainListCard,
            {
              'dest-chain-list-card': destChainListCardProps,
            },
          ];

        case 'wallet-modal':
          return walletModalProps
            ? [
                WalletModal,
                {
                  'wallet-modal': walletModalProps,
                },
              ]
            : undefined;

        case 'chain-selection-wrapper':
          return [
            ChainSelectionWrapper,
            {
              'chain-selection-wrapper': chainSelectionWrapperProps,
            },
          ];

        case 'deposit-confirm-container':
          return depositConfirmContainerProps
            ? [
                DepositConfirmContainer,
                {
                  'deposit-confirm-container': depositConfirmContainerProps,
                },
              ]
            : undefined;
      }

      return undefined;
    }, [
      mainComponentName,
      depositConfirmContainerProps,
      chainSelectionWrapperProps,
      sourceChainListCardProps,
      destChainListCardProps,
      walletModalProps,
      tokenListWrapAndDepositProps,
      tokenListDepositProps,
    ]);

    useEffect(() => {
      const isExistAndFullArgs =
        setMainComponentArgs !== undefined &&
        Object.values(setMainComponentArgs[1]).length > 0;

      if (isExistAndFullArgs) {
        const Component = setMainComponentArgs[0];
        const props = Object.values(setMainComponentArgs[1])[0] as any;
        setMainComponent(<Component {...props} />);
      } else {
        setMainComponent(undefined);
      }
    }, [setMainComponentArgs, setMainComponent]);

    return (
      <>
        <div {...props} ref={ref}>
          <DepositCard
            className="h-[615px]"
            sourceChainProps={{
              chain: selectedSourceChain,
              onClick: sourceChainInputOnClick,
              chainType: 'source',
              info: 'Source chain',
            }}
            bridgingTokenProps={bridgingTokenProps}
            destChainProps={{
              chain: destChainInputValue,
              onClick: () => {
                setMainComponentName('dest-chain-list-card');
              },
              chainType: 'dest',
              info: 'Destination chain',
            }}
            tokenInputProps={{
              onClick: () => {
                if (selectedSourceChain) {
                  setMainComponentName('token-deposit-list-card');
                }
              },
              token: selectedToken,
            }}
            amountInputProps={{
              amount: amount ? amount.toString() : undefined,
              onAmountChange,
              onMaxBtnClick,
              isDisabled: !selectedToken || !destChain,
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
