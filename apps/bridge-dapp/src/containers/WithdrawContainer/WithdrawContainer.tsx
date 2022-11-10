import { useWebContext } from '@webb-tools/api-provider-environment';
import { NoteManager } from '@webb-tools/note-manager';
import { useBridge, useBridgeDeposit, useCurrencies, useCurrencyBalance, useRelayers } from '@webb-tools/react-hooks';
import { calculateTypedChainId, ChainType, Note } from '@webb-tools/sdk-core';
import { RelayerListCard, TokenListCard, useWebbUI, WithdrawCard } from '@webb-tools/webb-ui-components';
import { AssetType, RelayerType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import { BigNumber, ethers } from 'ethers';
import { forwardRef, useCallback, useMemo, useState } from 'react';
import { WithdrawContainerProps } from './types';
import { WithdrawConfirmContainer } from './WithdrawConfirmContainer';

export const WithdrawContainer = forwardRef<
  HTMLDivElement,
  WithdrawContainerProps
>(({ setTxPayload }, ref) => {
  const [noteStrings, setNoteStrings] = useState<string[]>(['']);
  const [recipient, setRecipient] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [customUserAmount, setCustomUserAmount] = useState<string>('0');
  const [amount, setAmount] = useState<number>(0);

  const { setMainComponent } = useWebbUI();
  const parseAndSetAmount = (amount: string | number): void => {
    const parsedAmount = Number(amount);
    if (!isNaN(parsedAmount)) {
      setAmount(parsedAmount);
    }
  };
  const { activeApi, activeChain, noteManager } =
    useWebContext();
  const { setGovernedCurrency, setWrappableCurrency } = useBridge();
  const { generateNote } = useBridgeDeposit();

  const { governedCurrencies, governedCurrency, wrappableCurrencies, wrappableCurrency } = useCurrencies();
  const governedCurrencyBalance = useCurrencyBalance(governedCurrency);
  const wrappableCurrencyBalance = useCurrencyBalance(wrappableCurrency);

  const currentTypedChainId = useMemo(() => {
    if (!activeChain) {
      return null;
    }
    return calculateTypedChainId(activeChain.chainType, activeChain.chainId);
  }, [activeChain])

  // Retrieve the notes from the note manager for the currently selected chain.
  const availableNotesFromManager = useMemo<Note[] | null>(() => {
    if (!noteManager || !activeChain || !activeApi) {
      return null;
    }
    const notes =
      noteManager
        .getAllNotes()
        .get(
          calculateTypedChainId(
            activeChain.chainType,
            activeChain.chainId
          ).toString()
        )
        ?.filter(
          (note) =>
            note.note.tokenSymbol ===
            activeApi.state.activeBridge?.currency.view.symbol
        ) ?? null;

    return notes;
  }, [noteManager, activeChain, activeApi]);

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

  // Given the user inputs above, fetch relayers state
  const {
    relayersState,
    setRelayer
  } = useRelayers({
    typedChainId: currentTypedChainId ?? undefined,
    target: (activeApi?.state.activeBridge && currentTypedChainId) ? activeApi.state.activeBridge.targets[currentTypedChainId] : undefined
  });

  // Functions for UI state management
  function isButtonDisabled() {
    if (amount > availableAmount || !amount || !!formError) {
      return true;
    }

    if (availableNotesFromManager?.length) {
      return false;
    }

    if (availableNotesFromManager?.length && recipient) {
      return false;
    }

    return true;
  }

  const parseUserAmount = (amount: string): void => {
    setCustomUserAmount(amount);
    const parsedAmount = Number(amount);
    if (!isNaN(parsedAmount)) {
      setAmount(parsedAmount);
    }
  };

  const governedTokens = useMemo((): AssetType[] => {
    return Object.values(governedCurrencies).map((currency) => {
      return {
        name: currency.view.name,
        symbol: currency.view.symbol,
      };
    });
  }, [governedCurrencies]);

  const wrappableTokens = useMemo((): AssetType[] => {
    return Object.values(wrappableCurrencies).map((currency) => {
      return {
        name: currency.view.name,
        symbol: currency.view.symbol,
      };
    });
  }, [wrappableCurrencies])

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
  return (
    <div>
      <WithdrawCard
        tokenInputProps={{
          onClick: () => {
            if (activeApi) {
              setMainComponent(
                <TokenListCard
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
          token: {
            symbol: governedCurrency?.view.symbol ?? 'default',
            balance: governedCurrencyBalance ?? '-'
          }
        }}
        unwrappingAssetInputProps={{
          onClick: () => {
            if (activeApi) {
              setMainComponent(
                <TokenListCard
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
              )
            }
          },
          token: {
            symbol: wrappableCurrency?.view.symbol ?? 'Select Token',
            balance: wrappableCurrencyBalance ?? '-'
          }
        }}
        fixedAmountInputProps={{
          onChange: (amount) => {
            setAmount(amount);
          },
          values: [0.10, 0.25, 0.50, 1.00]
        }}
        recipientInputProps={{
          onChange: (recipient) => {
            setRecipient(recipient)
          }
        }}
        relayerInputProps={{
          relayerAddress: relayersState.activeRelayer?.beneficiary,
          externalLink: relayersState?.activeRelayer?.endpoint,
          onClick: () => {
            let x: RelayerType;
            if (activeApi && activeChain) {
              setMainComponent(
                <RelayerListCard
                  relayers={relayersState.relayers.map((relayer) => {
                    const relayerData = relayer.capabilities.supportedChains[
                      activeChain.chainType === ChainType.EVM ? 'evm' : 'substrate'
                    ].get(calculateTypedChainId(activeChain.chainType, activeChain.chainId));

                    return {
                      address: relayerData?.beneficiary ?? '',
                      externalUrl: relayer.endpoint,
                    }
                  }).filter((x) => x !== undefined)}
                  value={relayersState.activeRelayer ? {
                    address: relayersState.activeRelayer.beneficiary ?? '',
                    externalUrl: relayersState.activeRelayer.endpoint,
                  } : undefined}
                  onClose={() => setMainComponent(undefined)}
                  onChange={(nextRelayer) => {
                    setRelayer(relayersState.relayers.find((relayer) => {
                      return relayer.endpoint === nextRelayer.externalUrl
                    }) ?? null);
                    setMainComponent(undefined);
                  }}
                />
              )
            }
          }
        }}
        withdrawBtnProps={{
          onClick: async () => {
            if (activeChain && activeApi && activeApi.state.activeBridge && noteManager && recipient && amount !== 0) {
              const withdrawChainId = calculateTypedChainId(activeChain?.chainType, activeChain?.chainId)

              // Find the mixerId (target) of the selected inputs
              const mixerId = activeApi.state.activeBridge.targets[withdrawChainId];

              // Get the notes that will be spent for this withdraw
              const inputNotes = NoteManager.getNotesFifo(
                availableNotesFromManager ?? [],
                ethers.utils.parseUnits(amount.toString(), activeApi.state.activeBridge.currency.getDecimals())
              );

              if (inputNotes) {

                // Get the cumulative value of the notes to be spent
                const spentValue = inputNotes.reduce<ethers.BigNumber>((currentValue, note) => {
                  return currentValue.add(ethers.BigNumber.from(note.note.amount));
                }, BigNumber.from(0));

                const spentAmount = Number(ethers.utils.formatUnits(spentValue, activeApi.state.activeBridge.currency.getDecimals()));

                // Generate a change note if applicable
                const changeNote = spentAmount - amount > 0
                  ? await generateNote(
                    mixerId,
                    withdrawChainId,
                    spentAmount - amount,
                    undefined
                  ).then((note) => note.note.serialize()) 
                  : undefined;

                setMainComponent(
                  <WithdrawConfirmContainer
                    changeNote={changeNote}
                    changeAmount={spentAmount - amount}
                    availableNotes={availableNotesFromManager ?? []}
                    amount={amount}
                    fees={0}
                    webbToken={{
                      symbol: activeApi.state.activeBridge.currency.view.symbol,
                      balance: governedCurrencyBalance ?? 0
                    }}
                    recipient={recipient}
                    setTxPayload={setTxPayload}
                  />
                )
              }
            }
          }
        }}
      />
    </div>
  );
});
