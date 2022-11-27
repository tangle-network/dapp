import { useWebContext } from '@webb-tools/api-provider-environment';
import { NoteManager } from '@webb-tools/note-manager';
import {
  useBridge,
  useBridgeDeposit,
  useCurrencies,
  useNoteAccount,
  useRelayers,
} from '@webb-tools/react-hooks';
import { calculateTypedChainId, ChainType, Note } from '@webb-tools/sdk-core';
import {
  getRoundedAmountString,
  RelayerListCard,
  TokenListCard,
  useWebbUI,
  WithdrawCard,
} from '@webb-tools/webb-ui-components';
import { AssetType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { BigNumber, ethers } from 'ethers';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { WithdrawContainerProps } from './types';
import { WithdrawConfirmContainer } from './WithdrawConfirmContainer';

export const WithdrawContainer = forwardRef<
  HTMLDivElement,
  WithdrawContainerProps
>(({ setTxPayload }, ref) => {
  // State for unwrap checkbox
  const [isUnwrap, setIsUnwrap] = useState(false);

  const [recipient, setRecipient] = useState<string>('');

  const [amount, setAmount] = useState<number>(0);

  // State for error message when user input amount is invalid
  const [amountError, setAmountError] = useState<string>('');

  const { setMainComponent } = useWebbUI();

  const { activeApi, activeChain } = useWebContext();

  const {
    governedCurrency,
    wrappableCurrency,
    setGovernedCurrency,
    setWrappableCurrency,
  } = useBridge();

  const { generateNote } = useBridgeDeposit();

  const { governedCurrencies, wrappableCurrencies } = useCurrencies();

  const currentTypedChainId = useMemo(() => {
    if (!activeChain) {
      return null;
    }
    return calculateTypedChainId(activeChain.chainType, activeChain.chainId);
  }, [activeChain]);

  // Given the user inputs above, fetch relayers state
  const {
    relayersState: { activeRelayer, relayers },
    setRelayer,
  } = useRelayers({
    typedChainId: currentTypedChainId ?? undefined,
    target:
      activeApi?.state.activeBridge && currentTypedChainId
        ? activeApi.state.activeBridge.targets[currentTypedChainId]
        : undefined,
  });

  const { allNotes } = useNoteAccount();

  // Retrieve the notes from the note manager for the currently selected chain.
  // and filter out the notes that are not for the currently selected governed currency.
  const availableNotesFromManager = useMemo<Note[] | null>(() => {
    if (!currentTypedChainId) {
      return null;
    }

    // Get the notes of the currently selected chain.
    const notes = allNotes
      .get(currentTypedChainId.toString())
      ?.filter(
        (note) => note.note.tokenSymbol === governedCurrency?.view?.symbol
      );

    return notes ?? null;
  }, [allNotes, currentTypedChainId, governedCurrency]);

  const availableAmount: number = useMemo(() => {
    if (!availableNotesFromManager) {
      return 0;
    }
    return availableNotesFromManager.reduce<number>(
      (accumulatedBalance, newNote) => {
        return (
          accumulatedBalance +
          Number(
            ethers.utils.formatUnits(
              newNote.note.amount,
              newNote.note.denomination
            )
          )
        );
      },
      0
    );
  }, [availableNotesFromManager]);

  const selectedGovernedToken = useMemo<AssetType | undefined>(() => {
    if (!governedCurrency) {
      return undefined;
    }
    return {
      symbol: governedCurrency.view.symbol,
      name: governedCurrency.view.name,
      balance: availableAmount,
    };
  }, [availableAmount, governedCurrency]);

  const governedTokens = useMemo((): AssetType[] => {
    return Object.values(governedCurrencies).map((currency) => {
      return {
        name: currency.view.name,
        symbol: currency.view.symbol,
      };
    });
  }, [governedCurrencies]);

  const selectedUnwrapToken = useMemo<AssetType | undefined>(() => {
    if (!wrappableCurrency) {
      return undefined;
    }
    return {
      symbol: wrappableCurrency.view.symbol,
      name: wrappableCurrency.view.name,
    };
  }, [wrappableCurrency]);

  const wrappableTokens = useMemo((): AssetType[] => {
    return wrappableCurrencies.map((currency) => {
      return {
        name: currency.view.name,
        symbol: currency.view.symbol,
      };
    });
  }, [wrappableCurrencies]);

  const parseUserAmount = useCallback(
    (amount: string | number): void => {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        setAmountError('Invalid amount');
        return;
      }

      if (parsedAmount > availableAmount) {
        setAmountError('Insufficient balance');
        return;
      }

      setAmount(parsedAmount);
      setAmountError('');
    },
    [availableAmount]
  );

  const handleGovernedTokenChange = useCallback(
    async (newToken: AssetType) => {
      const selectedToken = Object.values(governedCurrencies).find(
        (currency) => currency.view.symbol === newToken.symbol
      );
      if (selectedToken) {
        setGovernedCurrency(selectedToken);
      }
    },
    [governedCurrencies, setGovernedCurrency]
  );

  const handleWrappableTokenChange = useCallback(
    async (newToken: AssetType) => {
      const selectedToken = Object.values(wrappableCurrencies).find(
        (currency) => currency.view.symbol === newToken.symbol
      );
      if (selectedToken) {
        setWrappableCurrency(selectedToken);
      }
    },
    [wrappableCurrencies, setWrappableCurrency]
  );

  const isValidAmount = useMemo(() => {
    return amount > 0 && amount <= availableAmount;
  }, [amount, availableAmount]);

  const isDisabledWithdraw = useMemo(() => {
    return [
      Boolean(governedCurrency), // No governed currency selected
      isUnwrap ? Boolean(wrappableCurrency) : true, // No unwrappable currency selected when unwrapping
      Boolean(isValidAmount), // Amount is greater than available amount
      Boolean(recipient), // No recipient address
    ].some((value) => value === false);
  }, [governedCurrency, isUnwrap, isValidAmount, recipient, wrappableCurrency]);

  // Calculate the info for UI display
  const infoCalculated = useMemo(() => {
    const receivingAmount = isValidAmount
      ? getRoundedAmountString(amount)
      : undefined;
    const remainderAmount = isValidAmount
      ? getRoundedAmountString(availableAmount - amount)
      : undefined;

    const receivingTokenSymbol = isUnwrap
      ? wrappableCurrency?.view.symbol ?? ''
      : governedCurrency?.view.symbol ?? '';

    const remainderTokenSymbol = governedCurrency?.view.symbol;

    return {
      receivingAmount,
      remainderAmount,
      receivingTokenSymbol,
      remainderTokenSymbol,
    };
  }, [
    amount,
    availableAmount,
    governedCurrency?.view.symbol,
    isUnwrap,
    isValidAmount,
    wrappableCurrency?.view.symbol,
  ]);

  return (
    <div>
      <WithdrawCard
        tokenInputProps={{
          onClick: () => {
            if (activeApi) {
              setMainComponent(
                <TokenListCard
                  className="w-[550px] h-[720px]"
                  title={'Select Asset to Withdraw'}
                  popularTokens={[]}
                  selectTokens={governedTokens}
                  unavailableTokens={[]}
                  onChange={(newAsset) => {
                    handleGovernedTokenChange(newAsset);
                    setMainComponent(undefined);
                  }}
                  onClose={() => setMainComponent(undefined)}
                />
              );
            }
          },
          token: selectedGovernedToken,
        }}
        unwrappingAssetInputProps={{
          onClick: () => {
            if (activeApi) {
              setMainComponent(
                <TokenListCard
                  className="w-[550px] h-[720px]"
                  title={'Select Asset to Unwrap into'}
                  popularTokens={[]}
                  selectTokens={wrappableTokens}
                  unavailableTokens={[]}
                  onChange={(newAsset) => {
                    handleWrappableTokenChange(newAsset);
                    setMainComponent(undefined);
                  }}
                  onClose={() => setMainComponent(undefined)}
                />
              );
            }
          },
          token: selectedUnwrapToken,
        }}
        fixedAmountInputProps={{
          onChange: parseUserAmount,
          values: [0.1, 0.25, 0.5, 1.0],
        }}
        customAmountInputProps={{
          onAmountChange: parseUserAmount,
          amount: isNaN(amount) ? '' : amount.toString(),
          onMaxBtnClick: () => parseUserAmount(availableAmount),
          errorMessage: amountError,
        }}
        unwrapSwitcherProps={{
          checked: isUnwrap,
          onCheckedChange: (nextVal) => setIsUnwrap(nextVal),
        }}
        relayerInputProps={{
          relayerAddress: activeRelayer?.beneficiary,
          iconTheme: activeChain
            ? activeChain.chainType === ChainType.EVM
              ? 'ethereum'
              : 'substrate'
            : undefined,
          onClick: () => {
            if (!activeApi || !activeChain) {
              return;
            }

            setMainComponent(
              <RelayerListCard
                className="w-[550px] h-[720px]"
                relayers={relayers
                  .map((relayer) => {
                    const relayerData = relayer.capabilities.supportedChains[
                      activeChain.chainType === ChainType.EVM
                        ? 'evm'
                        : 'substrate'
                    ].get(
                      calculateTypedChainId(
                        activeChain.chainType,
                        activeChain.chainId
                      )
                    );

                    const theme =
                      activeChain.chainType === ChainType.EVM
                        ? ('ethereum' as const)
                        : ('substrate' as const);

                    return {
                      address: relayerData?.beneficiary ?? '',
                      externalUrl: relayer.endpoint,
                      theme,
                    };
                  })
                  .filter((x) => x !== undefined)}
                value={
                  activeRelayer
                    ? {
                        address: activeRelayer.beneficiary ?? '',
                        externalUrl: activeRelayer.endpoint,
                        theme:
                          activeChain.chainType === ChainType.EVM
                            ? 'ethereum'
                            : 'substrate',
                      }
                    : undefined
                }
                onClose={() => setMainComponent(undefined)}
                onChange={(nextRelayer) => {
                  setRelayer(
                    relayers.find((relayer) => {
                      return relayer.endpoint === nextRelayer.externalUrl;
                    }) ?? null
                  );
                  setMainComponent(undefined);
                }}
              />
            );
          },
        }}
        recipientInputProps={{
          onChange: (recipient) => {
            setRecipient(recipient);
          },
        }}
        withdrawBtnProps={{
          isDisabled: isDisabledWithdraw,
          onClick: async () => {
            if (
              !currentTypedChainId ||
              !governedCurrency ||
              !activeApi ||
              !activeApi?.state.activeBridge ||
              !recipient
            ) {
              return;
            }

            const governedCurrencyDecimals = governedCurrency.getDecimals();

            // Find the mixerId (target) of the selected inputs
            const mixerId =
              activeApi.state.activeBridge.targets[currentTypedChainId];

            // Get the notes that will be spent for this withdraw
            const inputNotes = NoteManager.getNotesFifo(
              availableNotesFromManager ?? [],
              ethers.utils.parseUnits(
                amount.toString(),
                governedCurrencyDecimals
              )
            );

            if (!inputNotes) {
              return;
            }

            // Get the cumulative value of the notes to be spent
            const spentValue = inputNotes.reduce<ethers.BigNumber>(
              (currentValue, note) => {
                return currentValue.add(
                  ethers.BigNumber.from(note.note.amount)
                );
              },
              BigNumber.from(0)
            );

            const changeAmountBigNumber = spentValue.sub(
              ethers.utils.parseUnits(
                amount.toString(),
                governedCurrencyDecimals
              )
            );

            const parsedChangeAmount = Number(
              ethers.utils.formatUnits(
                changeAmountBigNumber,
                governedCurrencyDecimals
              )
            );

            // Generate a change note if applicable
            const changeNote = changeAmountBigNumber.gt(0)
              ? await generateNote(
                  mixerId,
                  currentTypedChainId,
                  parsedChangeAmount,
                  undefined
                ).then((note) => note.note.serialize())
              : undefined;

            setMainComponent(
              <WithdrawConfirmContainer
                changeNote={changeNote}
                changeAmount={parsedChangeAmount}
                targetChainId={currentTypedChainId}
                availableNotes={availableNotesFromManager ?? []}
                amount={amount}
                fees={0}
                governedCurrency={{
                  value: governedCurrency,
                  balance: availableAmount,
                }}
                unwrapCurrency={
                  isUnwrap && wrappableCurrency
                    ? { value: wrappableCurrency }
                    : undefined
                }
                recipient={recipient}
                setTxPayload={setTxPayload}
              />
            );
          },
        }}
        receivedAmount={infoCalculated.receivingAmount}
        receivedToken={infoCalculated.receivingTokenSymbol}
        remainderAmount={infoCalculated.remainderAmount}
        remainderToken={infoCalculated.remainderTokenSymbol}
      />
    </div>
  );
});
