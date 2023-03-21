import { useWebContext } from '@webb-tools/api-provider-environment';
import { Chain, getNativeCurrencyFromConfig } from '@webb-tools/dapp-config';
import {
  useCurrencies,
  useCurrenciesBalances,
  useNoteAccount,
} from '@webb-tools/react-hooks';
import { calculateTypedChainId } from '@webb-tools/sdk-core';
import {
  DepositCard,
  TokenListCard,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { TokenType } from '@webb-tools/webb-ui-components/components/BridgeInputs/types';
import {
  AssetType,
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

import { ChainListCardWrapper } from '../../components';
import { ChainListCardWrapperProps } from '../../components/ChainListCardWrapper/types';
import { WalletState, useAddCurrency, useConnectWallet } from '../../hooks';
import { DepositConfirmContainer } from './DepositConfirmContainer';
import { DepositConfirmContainerProps, DepositContainerProps } from './types';
import { CurrencyType } from '@webb-tools/dapp-types';
import { useEducationCardStep } from '../../hooks/useEducationCardStep';

interface MainComponentProposVariants {
  ['source-chain-list-card']: ChainListCardWrapperProps;
  ['dest-chain-list-card']: ChainListCardWrapperProps;
  ['token-deposit-list-card']: TokenListCardProps;
  ['token-wrap-and-deposit-list-card']: TokenListCardProps;
  ['chain-selection-wrapper']: ChainListCardWrapperProps;
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

    const { toggleModal, isWalletConnected, walletState } = useConnectWallet();

    const [mainComponentName, setMainComponentName] = useState<
      MainComponentVariants | undefined
    >(undefined);

    const resetMainComponent = useCallback(() => {
      setMainComponentName(undefined);
    }, [setMainComponentName]);

    const {
      activeApi,
      chains,
      switchChain,
      activeChain,
      activeWallet,
      loading,
      noteManager,
      apiConfig: { currencies },
      txQueue,
    } = useWebContext();

    const {
      fungibleCurrency,
      fungibleCurrencies,
      setFungibleCurrency,
      wrappableCurrency,
      wrappableCurrencies,
      setWrappableCurrency,
      getPossibleFungibleCurrencies,
    } = useCurrencies();

    const addCurrency = useAddCurrency();

    const allTokens = useMemo(
      () => fungibleCurrencies.concat(wrappableCurrencies),
      [fungibleCurrencies, wrappableCurrencies]
    );

    const balances = useCurrenciesBalances(allTokens);

    const { hasNoteAccount, setOpenNoteAccountModal } = useNoteAccount();

    const { setEducationCardStep } = useEducationCardStep();

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

    const destChains: ChainType[] = useMemo(() => {
      if (!activeApi?.state.activeBridge?.targets) {
        return [];
      }

      return Object.keys(activeApi.state.activeBridge.targets)
        .map((val) => {
          const maybeChain = chains[Number(val)];
          if (maybeChain) {
            const currency = getNativeCurrencyFromConfig(
              currencies,
              calculateTypedChainId(maybeChain.chainType, maybeChain.chainId)
            );

            return {
              name: maybeChain.name,
              tag: maybeChain.tag,
              symbol: currency?.symbol ?? 'Unknown',
            } as ChainType;
          }
          return undefined;
        })
        .filter((chain): chain is ChainType => !!chain);
    }, [activeApi?.state.activeBridge?.targets, chains, currencies]);

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

      const currency = getNativeCurrencyFromConfig(
        currencies,
        calculateTypedChainId(activeChain.chainType, activeChain.chainId)
      );

      return {
        name: activeChain.name,
        tag: activeChain.tag,
        symbol: currency?.symbol ?? 'Unknown',
      };
    }, [activeChain, currencies, sourceChain]);

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
          onTokenClick: () => addCurrency(bridgeWrappableCurrency.currency),
          balanceType: 'wallet',
        };
      }

      if (!bridgeFungibleCurrency) {
        return undefined;
      }

      // Deposit flow
      return {
        symbol: bridgeFungibleCurrency.currency.view.symbol,
        balance: bridgeFungibleCurrency.balance,
        onTokenClick: () => addCurrency(bridgeFungibleCurrency.currency),
        balanceType: 'wallet',
      };
    }, [bridgeFungibleCurrency, bridgeWrappableCurrency, addCurrency]);

    const populatedSelectableWebbTokens = useMemo((): AssetType[] => {
      return Object.values(fungibleCurrencies.concat(wrappableCurrencies)).map(
        (currency) => {
          return {
            name: currency.view.name,
            symbol: currency.view.symbol,
            balance: balances[currency.id],
            onTokenClick: () => addCurrency(currency),
          };
        }
      );
    }, [addCurrency, balances, fungibleCurrencies, wrappableCurrencies]);

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

    const handleResetState = useCallback(() => {
      setAmount(0);
      setDestChain(undefined);
      setMainComponentName(undefined);
    }, []);

    // Main action on click
    const handleDepositButtonClick = useCallback(async () => {
      // Dismiss all the completed and failed txns in the queue before starting a new txn
      const txns = txQueue.txPayloads.filter(
        (tx) =>
          tx.txStatus.status === 'warning' || tx.txStatus.status === 'completed'
      );
      txns.map((tx) => tx.onDismiss());

      // No wallet connected
      if (!isWalletConnected) {
        toggleModal(true);
        return;
      }

      // No note account exists
      if (!hasNoteAccount) {
        setOpenNoteAccountModal(true);
        return;
      }

      if (
        !sourceChain ||
        !destChain ||
        amount === 0 ||
        !activeApi?.state?.activeBridge ||
        !activeChain ||
        !noteManager ||
        !fungibleCurrency
      ) {
        return;
      }

      setIsGeneratingNote(true);

      const sourceTypedChainId = calculateTypedChainId(
        activeChain.chainType,
        activeChain.chainId
      );

      const destTypedChainId = calculateTypedChainId(
        destChain.chainType,
        destChain.chainId
      );

      const newNote = await noteManager.generateNote(
        sourceTypedChainId,
        destTypedChainId,
        fungibleCurrency.view.symbol,
        fungibleCurrency.getDecimals(),
        amount
      );

      setIsGeneratingNote(false);

      setDepositContainerProps({
        fungibleTokenId: fungibleCurrency.id,
        wrappableTokenId: wrappableCurrency?.id,
        amount,
        sourceChain: {
          type: activeChain.base,
          name: activeChain.name,
        },
        destChain: {
          type: destChain.base,
          name: destChain.name,
        },
        note: newNote,
        resetMainComponent: resetMainComponent,
        onResetState: handleResetState,
      });

      setMainComponentName('deposit-confirm-container');
    }, [
      txQueue.txPayloads,
      isWalletConnected,
      hasNoteAccount,
      sourceChain,
      destChain,
      amount,
      activeApi?.state?.activeBridge,
      activeChain,
      noteManager,
      fungibleCurrency,
      wrappableCurrency?.id,
      resetMainComponent,
      handleResetState,
      toggleModal,
      setOpenNoteAccountModal,
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
        return 'Create note account';
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
          onTokenClick: () => addCurrency(bridgeFungibleCurrency.currency),
          balanceType: 'wallet',
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
      addCurrency,
      selectedSourceChain,
    ]);

    const handleMaxBtnClick = useCallback(() => {
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
        className: 'min-w-[550px] h-[700px]',
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
          onTokenClick: () => addCurrency(currency),
        })
      );

      return {
        className: 'min-w-[550px] h-[700px]',
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
      addCurrency,
      chains,
    ]);

    const destChainListCardProps = useMemo<ChainListCardWrapperProps>(() => {
      return {
        chainType: 'dest',
        onlyCategory: activeChain?.tag,
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
    }, [activeChain?.tag, destChains, destChainInputValue, chains]);

    const sourceChainListCardProps = useMemo<ChainListCardWrapperProps>(() => {
      return {
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

          toggleModal(true, chain);
        },
        onClose: () => setMainComponentName(undefined),
      };
    }, [selectedSourceChain, chains, activeWallet, toggleModal, switchChain]);

    const chainSelectionWrapperProps =
      useMemo<ChainListCardWrapperProps>(() => {
        return {
          onClose: () => setMainComponentName(undefined),
        };
      }, []);

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
            ChainListCardWrapper,
            {
              'source-chain-list-card': sourceChainListCardProps,
            },
          ];

        case 'dest-chain-list-card':
          return [
            ChainListCardWrapper,
            {
              'dest-chain-list-card': destChainListCardProps,
            },
          ];

        case 'chain-selection-wrapper':
          return [
            ChainListCardWrapper,
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

    // Effect reset the main component when
    // the `walletState` failed or succeed
    useEffect(() => {
      if (
        walletState === WalletState.FAILED ||
        walletState === WalletState.SUCCESS
      ) {
        setMainComponentName(undefined);
      }
    }, [walletState]);

    // Side effect to auto set the wrappable currency if user has no balance of fungible currency
    useEffect(() => {
      // If the user has no balance of the fungible currency
      if (
        fungibleCurrency &&
        balances[fungibleCurrency.id] === 0 &&
        !wrappableCurrency &&
        wrappableCurrencies.length > 0
      ) {
        const native = wrappableCurrencies.find(
          (currency) => currency.view.type === CurrencyType.NATIVE
        );
        setWrappableCurrency(native ?? wrappableCurrencies[0]); // Fallback to the first one if no native currency
      }
    }, [
      balances,
      fungibleCurrency,
      setWrappableCurrency,
      wrappableCurrencies,
      wrappableCurrency,
    ]);

    // Side effect to set the education card step
    useEffect(() => {
      if (!hasNoteAccount) {
        setEducationCardStep(1);
        return;
      }

      // If not exit the `wrappableCurrency` and `fungibleCurrency` at the same time
      // or only exit the `fungibleCurrency`
      if (!((wrappableCurrency && fungibleCurrency) || fungibleCurrency)) {
        setEducationCardStep(2);
        return;
      }

      // If not destination chain is selected
      if (!destChain || !amount) {
        setEducationCardStep(3);
        return;
      }

      // Otherwise
      setEducationCardStep(4);
    }, [
      hasNoteAccount,
      setEducationCardStep,
      destChain,
      wrappableCurrency,
      fungibleCurrency,
      amount,
    ]);

    return (
      <div {...props} ref={ref} className="h-[628px]">
        <DepositCard
          className="max-w-none"
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
            onMaxBtnClick: handleMaxBtnClick,
            isDisabled: !selectedToken || !destChain,
            errorMessage: amountErrorMessage,
          }}
          buttonProps={{
            onClick: handleDepositButtonClick,
            isLoading:
              loading ||
              isGeneratingNote ||
              walletState === WalletState.CONNECTING,
            loadingText: loading ? 'Connecting...' : 'Generating Note...',
            isDisabled,
            children: buttonText,
          }}
          token={selectedToken?.symbol}
        />
      </div>
    );
  }
);
