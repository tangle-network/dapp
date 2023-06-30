import { useWebContext } from '@webb-tools/api-provider-environment';
import { getNativeCurrencyFromConfig } from '@webb-tools/dapp-config';
import { NoteManager } from '@webb-tools/note-manager';
import {
  useBalancesFromNotes,
  useBridge,
  useCurrencies,
  useCurrencyBalance,
  useCurrentResourceId,
  useCurrentTypedChainId,
  useNoteAccount,
  useRelayers,
} from '@webb-tools/react-hooks';
import { ChainType, Note, calculateTypedChainId } from '@webb-tools/sdk-core';
import {
  AmountInput,
  Button,
  CheckBox,
  RelayerListCard,
  TokenListCard,
  WithdrawCard,
  getRoundedAmountString,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import {
  AssetType,
  RelayerType,
} from '@webb-tools/webb-ui-components/components/ListCard/types';
import { BigNumber, ethers } from 'ethers';
import {
  ComponentProps,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { utxoFromVAnchorNote } from '@webb-tools/abstract-api-provider';
import { isValidAddress } from '@webb-tools/dapp-types';
import {
  WalletState,
  useAddCurrency,
  useConnectWallet,
  useMaxFeeInfo,
} from '../../hooks';
import { useEducationCardStep } from '../../hooks/useEducationCardStep';
import useStatesFromNotes from '../../hooks/useStatesFromNotes';
import { ExchangeRateInfo, TransactionFeeInfo } from './shared';
import { WithdrawContainerProps } from './types';
import { WithdrawConfirmContainer } from './WithdrawConfirmContainer';
import { isTokenAddedToMetamask } from '../../hooks/useAddCurrency';

const DEFAULT_FIXED_AMOUNTS = [0.1, 0.25, 0.5, 1.0];

export const WithdrawContainer = forwardRef<
  HTMLDivElement,
  WithdrawContainerProps
>(({ defaultFungibleCurrency, onTryAnotherWallet }, ref) => {
  // State for unwrap checkbox
  const [isUnwrap, setIsUnwrap] = useState(false);

  // State for refund checkbox
  const [isRefund, setIsRefund] = useState(false);

  const [recipient, setRecipient] = useState<string>('');

  const [amount, setAmount] = useState<number>(0);

  // State for error message when user input amount is invalid
  const [amountError, setAmountError] = useState<string>('');

  // State for refund amount
  const [refundAmount, setRefundAmount] = useState<number>(0);

  // State for error message when the refund amount is invalid
  const [refundAmountError, setRefundAmountError] = useState<string>('');

  const { setMainComponent } = useWebbUI();

  const {
    activeApi,
    activeChain,
    apiConfig,
    activeAccount,
    loading,
    noteManager,
    txQueue,
  } = useWebContext();

  const { wrappableCurrency, setWrappableCurrency } = useBridge();

  const { wrappableCurrencies } = useCurrencies();

  const currentResourceId = useCurrentResourceId();

  const currentTypedChainId = useCurrentTypedChainId();

  const {
    availableAmountFromNotes,
    fungibleCurrency,
    fungiblesFromNotes,
    handleSwitchToOtherChains,
    needSwitchChain,
    setFungibleCurrency,
  } = useStatesFromNotes();

  const useRelayersArgs = useMemo(
    () => ({
      typedChainId: currentTypedChainId ?? undefined,
      target:
        activeApi?.state.activeBridge && currentTypedChainId
          ? activeApi.state.activeBridge.targets[currentTypedChainId]
          : undefined,
    }),
    [activeApi, currentTypedChainId]
  );

  // Given the user inputs above, fetch relayers state
  const {
    relayersState: { activeRelayer, relayers },
    setRelayer,
  } = useRelayers(useRelayersArgs);

  const { allNotes, hasNoteAccount, setOpenNoteAccountModal } =
    useNoteAccount();

  // Current liquidity
  const fungibleAddress = useMemo(() => {
    if (!currentTypedChainId) {
      return;
    }

    return fungibleCurrency?.getAddress(currentTypedChainId);
  }, [currentTypedChainId, fungibleCurrency]);

  const unwrap = useMemo(() => {
    if (!isUnwrap) {
      return null;
    }

    return wrappableCurrency;
  }, [isUnwrap, wrappableCurrency]);

  const liquidity = useCurrencyBalance(unwrap, fungibleAddress);

  const { isWalletConnected, toggleModal, walletState } = useConnectWallet();

  const { setEducationCardStep } = useEducationCardStep();

  const addCurrency = useAddCurrency();

  const balancesFromNotes = useBalancesFromNotes();

  // Retrieve the notes from the note manager for the currently selected chain.
  // and filter out the notes that are not for the currently selected fungible currency.
  const availableNotesFromManager = useMemo<Note[] | null>(() => {
    if (!currentResourceId) {
      return null;
    }

    // Get the notes of the currently selected chain.
    const notes = allNotes
      .get(currentResourceId.toString())
      ?.filter(
        (note) =>
          note.note.tokenSymbol === fungibleCurrency?.view?.symbol &&
          fungibleCurrency?.hasChain(+note.note.targetChainId)
      );

    return notes ?? null;
  }, [allNotes, currentResourceId, fungibleCurrency]);

  const maxFeeArgs = useMemo(
    () => ({
      fungibleCurrencyId: fungibleCurrency?.id,
    }),
    [fungibleCurrency?.id]
  );

  const {
    isLoading: isFetchingFeeInfo,
    feeInfo: feeInfoOrBigNumber,
    fetchFeeInfo,
    resetMaxFeeInfo,
  } = useMaxFeeInfo(maxFeeArgs);

  const feeInfo = useMemo(() => {
    if (!(feeInfoOrBigNumber instanceof BigNumber)) {
      return feeInfoOrBigNumber;
    }

    return null;
  }, [feeInfoOrBigNumber]);

  const currentNativeCurrency = useMemo(() => {
    if (!currentTypedChainId) {
      return undefined;
    }

    return getNativeCurrencyFromConfig(
      apiConfig.currencies,
      currentTypedChainId
    );
  }, [apiConfig.currencies, currentTypedChainId]);

  const selectedFungibleToken = useMemo<AssetType | undefined>(() => {
    if (!fungibleCurrency) {
      return undefined;
    }

    let balance: number | undefined;
    const balancesRecord = balancesFromNotes[fungibleCurrency.id];
    if (balancesRecord && currentTypedChainId) {
      balance = balancesRecord?.[currentTypedChainId];
    }

    if (balancesRecord && !balance) {
      balance = Object.values(balancesRecord)[0];
    }

    return {
      symbol: fungibleCurrency.view.symbol,
      name: fungibleCurrency.view.name,
      balance,
      onTokenClick: () => addCurrency(fungibleCurrency),
      balanceType: 'note',
      isTokenAddedToMetamask: isTokenAddedToMetamask(
        fungibleCurrency,
        activeChain,
        activeAccount?.address,
        currentResourceId
      ),
    };
  }, [
    addCurrency,
    balancesFromNotes,
    currentTypedChainId,
    fungibleCurrency,
    activeChain,
    activeAccount,
    currentResourceId,
  ]);

  const selectedUnwrapToken = useMemo<AssetType | undefined>(() => {
    if (!wrappableCurrency) {
      return undefined;
    }
    return {
      symbol: wrappableCurrency.view.symbol,
      name: wrappableCurrency.view.name,
      onTokenClick: () => addCurrency(wrappableCurrency),
      balanceType: 'wallet',
      isTokenAddedToMetamask: isTokenAddedToMetamask(
        wrappableCurrency,
        activeChain,
        activeAccount?.address,
        currentResourceId
      ),
    };
  }, [
    addCurrency,
    wrappableCurrency,
    activeChain,
    activeAccount,
    currentResourceId,
  ]);

  const parseUserAmount = useCallback(
    (amount: string | number): void => {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        setAmountError('Invalid amount');
        return;
      }

      if (parsedAmount > availableAmountFromNotes) {
        setAmountError('Insufficient balance, maybe incorrect chain?');
        return;
      }

      setAmount(parsedAmount);
      setAmountError('');
    },
    [availableAmountFromNotes]
  );

  const handleFungibleTokenChange = useCallback(
    async (newToken: AssetType) => {
      const selectedToken = Object.values(fungiblesFromNotes).find(
        (currency) => currency.view.symbol === newToken.symbol
      );
      if (!selectedToken) {
        return;
      }

      setFungibleCurrency(selectedToken);

      // Reset the amount
      setAmount(0);

      // Reset the unwrap switcher
      setIsUnwrap(false);

      // Reset fee info
      resetMaxFeeInfo();
    },
    [fungiblesFromNotes, resetMaxFeeInfo, setFungibleCurrency]
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
    return amount > 0 && amount <= availableAmountFromNotes;
  }, [amount, availableAmountFromNotes]);

  const [isValidRecipient, setIsValidRecipient] = useState(false);

  const totalFeeInWei = useMemo(() => {
    if (!feeInfoOrBigNumber || feeInfoOrBigNumber instanceof BigNumber) {
      return feeInfoOrBigNumber;
    }

    let feeWei = feeInfoOrBigNumber.estimatedFee;

    if (refundAmount && isRefund) {
      const exchangeRate = Number(
        ethers.utils.formatEther(feeInfoOrBigNumber.refundExchangeRate)
      );
      const converted = refundAmount * exchangeRate;
      const refundAmountWei = ethers.utils.parseEther(converted.toFixed(6));

      feeWei = feeWei.add(refundAmountWei);
    }

    return feeWei;
  }, [feeInfoOrBigNumber, isRefund, refundAmount]);

  const isDisabledWithdraw = useMemo(() => {
    const totalFee = Number(
      ethers.utils.formatEther(totalFeeInWei ?? ethers.constants.Zero)
    );

    return [
      Boolean(fungibleCurrency), // No fungible currency selected
      isUnwrap ? Boolean(wrappableCurrency) : true, // No unwrappable currency selected when unwrapping
      Boolean(isValidAmount), // Amount is greater than available amount
      Boolean(recipient), // No recipient address
      isValidRecipient, // Invalid recipient address
      typeof liquidity === 'number' ? liquidity >= amount : true, // Insufficient liquidity
      activeRelayer ? amount >= totalFee : true, // When relayer is selected, amount should be greater than fee
      Boolean(feeInfoOrBigNumber),
    ].some((value) => value === false);
  }, [
    totalFeeInWei,
    fungibleCurrency,
    isUnwrap,
    wrappableCurrency,
    isValidAmount,
    recipient,
    isValidRecipient,
    liquidity,
    amount,
    activeRelayer,
    feeInfoOrBigNumber,
  ]);

  const buttonText = useMemo(() => {
    if (!isWalletConnected) {
      return 'Connect wallet';
    }

    if (!hasNoteAccount) {
      return 'Create note account';
    }

    if (isDisabledWithdraw && needSwitchChain) {
      return 'Switch chain to withdraw';
    }

    if (selectedUnwrapToken && isUnwrap) {
      return 'Unwrap and Withdraw';
    }

    return 'Withdraw';
  }, [
    needSwitchChain,
    hasNoteAccount,
    isDisabledWithdraw,
    isUnwrap,
    isWalletConnected,
    selectedUnwrapToken,
  ]);

  const amountAfterFeeWei = useMemo(() => {
    const amountWei = ethers.utils.parseEther(amount.toString());
    // If no fee or no active relayer, then return the original amount
    // as the fee is not deducted from the amount
    if (!totalFeeInWei || !activeRelayer) {
      return amountWei;
    }

    return amountWei.sub(totalFeeInWei);
  }, [activeRelayer, amount, totalFeeInWei]);

  // Calculate the info for UI display
  const infoCalculated = useMemo(() => {
    const amountAfterFee = Number(ethers.utils.formatEther(amountAfterFeeWei));

    const receivingAmount = isValidAmount
      ? getRoundedAmountString(amountAfterFee, 3, {
          roundingFunction: Math.round,
        })
      : undefined;

    const remainderAmount = isValidAmount
      ? getRoundedAmountString(availableAmountFromNotes - amount)
      : undefined;

    const receivingTokenSymbol = isUnwrap
      ? wrappableCurrency?.view.symbol ?? ''
      : fungibleCurrency?.view.symbol ?? '';

    const remainderTokenSymbol = fungibleCurrency?.view.symbol;

    return {
      receivingAmount,
      remainderAmount,
      receivingTokenSymbol,
      remainderTokenSymbol,
    };
  }, [
    amount,
    amountAfterFeeWei,
    availableAmountFromNotes,
    fungibleCurrency?.view.symbol,
    isUnwrap,
    isValidAmount,
    wrappableCurrency?.view.symbol,
  ]);

  const refundInfo = useMemo(
    () =>
      feeInfo ? (
        <ExchangeRateInfo
          exchangeRate={getRoundedAmountString(
            +ethers.utils.formatEther(feeInfo.refundExchangeRate),
            6,
            { roundingFunction: Math.round }
          )}
          fungibleTokenSymbol={fungibleCurrency?.view.symbol}
          nativeTokenSymbol={currentNativeCurrency?.symbol}
        />
      ) : undefined,
    [currentNativeCurrency?.symbol, feeInfo, fungibleCurrency?.view.symbol]
  );

  const transactionFeeInfo = useMemo(() => {
    const estimatedFee = feeInfo
      ? getRoundedAmountString(
          Number(ethers.utils.formatEther(feeInfo.estimatedFee)),
          3,
          { roundingFunction: Math.round }
        )
      : undefined;

    const refundFee =
      feeInfo && refundAmount && isRefund
        ? getRoundedAmountString(
            refundAmount *
              Number(ethers.utils.formatEther(feeInfo.refundExchangeRate))
          )
        : undefined;

    const transactionFeeInfo = estimatedFee ? (
      <TransactionFeeInfo
        estimatedFee={estimatedFee}
        refundFee={refundFee}
        fungibleTokenSymbol={fungibleCurrency?.view.symbol}
      />
    ) : undefined;

    return transactionFeeInfo;
  }, [feeInfo, fungibleCurrency?.view.symbol, isRefund, refundAmount]);

  const handleResetState = useCallback(() => {
    setAmountError('');
    setAmount(0);
    setRecipient('');
    setIsUnwrap(false);
    setRelayer(null);
    setRefundAmount(0);
    setRefundAmountError('');
    resetMaxFeeInfo();
  }, [resetMaxFeeInfo, setRelayer]);

  const handleWithdrawButtonClick = useCallback(async () => {
    // Dismiss all the completed and failed txns in the queue before starting a new txn
    txQueue.txPayloads
      .filter(
        (tx) =>
          tx.txStatus.status === 'warning' || tx.txStatus.status === 'completed'
      )
      .map((tx) => tx.onDismiss());

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

    if (isDisabledWithdraw && needSwitchChain) {
      return await handleSwitchToOtherChains();
    }

    if (
      !currentTypedChainId ||
      !fungibleCurrency ||
      !noteManager ||
      !activeApi?.state.activeBridge ||
      !recipient
    ) {
      console.error('Api is not ready to withdraw');
      return;
    }

    const activeBridge = activeApi.state.activeBridge;
    const destAddress = activeBridge.targets[currentTypedChainId];

    const fungibleDecimals = fungibleCurrency.getDecimals();

    // Get the notes that will be spent for this withdraw
    const inputNotes = NoteManager.getNotesFifo(
      availableNotesFromManager ?? [],
      ethers.utils.parseUnits(amount.toString(), fungibleDecimals)
    );

    if (!inputNotes) {
      return;
    }

    // Get the cumulative value of the notes to be spent
    const sumInputNotes = inputNotes.reduce<ethers.BigNumber>(
      (currentValue, note) => {
        return currentValue.add(ethers.BigNumber.from(note.note.amount));
      },
      BigNumber.from(0)
    );

    const changeAmountBigNumber = sumInputNotes.sub(
      ethers.utils.parseUnits(amount.toString(), fungibleDecimals)
    );

    const keypair = noteManager.getKeypair();
    if (!keypair.privkey) {
      console.error('The provided keypair does not contain the private key');
      return;
    }

    // Formatted the change amount for UI displaying
    const formattedChangeAmount = Number(
      ethers.utils.formatUnits(changeAmountBigNumber, fungibleDecimals)
    );

    // Generate the change note based on the change utxo
    let changeNote: Note | undefined;
    if (changeAmountBigNumber.gt(0)) {
      changeNote = await noteManager.generateNote(
        activeApi.backend,
        currentTypedChainId,
        destAddress,
        currentTypedChainId,
        destAddress,
        fungibleCurrency.view.symbol,
        fungibleDecimals,
        formattedChangeAmount
      );
    }

    // Generate change utxo (or dummy utxo if the changeAmount is `0`)
    const changeUtxo = changeNote
      ? await utxoFromVAnchorNote(
          changeNote.note,
          changeNote.note.index ? +changeNote.note.index : 0
        )
      : await activeApi.generateUtxo({
          curve: noteManager.defaultNoteGenInput.curve,
          backend: activeApi.backend,
          amount: changeAmountBigNumber.toString(),
          chainId: currentTypedChainId.toString(),
          keypair,
          originChainId: currentTypedChainId.toString(),
          index: activeApi.state.defaultUtxoIndex.toString(),
        });

    // Default source chain is the first source chain in the input notes
    const sourceTypedChainId = Number(inputNotes[0].note.sourceChainId);

    const fee =
      feeInfoOrBigNumber instanceof BigNumber
        ? feeInfoOrBigNumber
        : totalFeeInWei ?? BigNumber.from(0);

    setMainComponent(
      <WithdrawConfirmContainer
        className="w-[550px]" // TODO: Remove hardcoded width
        changeUtxo={changeUtxo}
        changeNote={changeNote}
        changeAmount={formattedChangeAmount}
        sourceTypedChainId={sourceTypedChainId}
        targetTypedChainId={currentTypedChainId}
        availableNotes={inputNotes}
        amount={amount}
        fee={fee}
        amountAfterFee={amountAfterFeeWei}
        isRefund={isRefund}
        fungibleCurrency={{
          value: fungibleCurrency,
          balance: availableAmountFromNotes,
        }}
        unwrapCurrency={
          isUnwrap && wrappableCurrency
            ? { value: wrappableCurrency }
            : undefined
        }
        feeInfo={transactionFeeInfo}
        receivingInfo={refundInfo}
        refundAmount={ethers.utils.parseEther(refundAmount.toString())}
        refundToken={currentNativeCurrency?.symbol}
        recipient={recipient}
        onResetState={handleResetState}
      />
    );
  }, [
    txQueue.txPayloads,
    isWalletConnected,
    hasNoteAccount,
    isDisabledWithdraw,
    needSwitchChain,
    currentTypedChainId,
    fungibleCurrency,
    noteManager,
    activeApi,
    recipient,
    availableNotesFromManager,
    amount,
    feeInfoOrBigNumber,
    totalFeeInWei,
    setMainComponent,
    amountAfterFeeWei,
    isRefund,
    availableAmountFromNotes,
    isUnwrap,
    wrappableCurrency,
    transactionFeeInfo,
    refundInfo,
    refundAmount,
    currentNativeCurrency?.symbol,
    handleResetState,
    toggleModal,
    setOpenNoteAccountModal,
    handleSwitchToOtherChains,
  ]);

  // Callback to handle the change of the inputs
  const handleTokenInputClick = useCallback(() => {
    if (!activeApi) {
      return;
    }

    const selectableTokens = Object.values(fungiblesFromNotes).map(
      (currency) => {
        let balance: number | undefined;

        const balancesRecord = balancesFromNotes[currency.id];

        if (balancesRecord && currentTypedChainId) {
          balance = balancesRecord[currentTypedChainId];
        }

        if (balancesRecord && !balance) {
          balance = Object.values(balancesRecord)[0];
        }

        return {
          name: currency.view.name,
          symbol: currency.view.symbol,
          balance,
          onTokenClick: () => addCurrency(currency),
          isTokenAddedToMetamask: isTokenAddedToMetamask(
            currency,
            activeChain,
            activeAccount?.address,
            currentResourceId
          ),
        };
      }
    );

    setMainComponent(
      <TokenListCard
        className="min-w-[550px] h-[710px]"
        title={'Select a token to Withdraw'}
        popularTokens={[]}
        selectTokens={selectableTokens}
        unavailableTokens={apiConfig
          .getUnavailableCurrencies(
            fungiblesFromNotes.map((c) => c.getCurrencyConfig())
          )
          .map((c) => ({ name: c.name, symbol: c.symbol } as AssetType))}
        onChange={(newAsset) => {
          handleFungibleTokenChange(newAsset);
          setMainComponent(undefined);
        }}
        onClose={() => setMainComponent(undefined)}
        onConnect={onTryAnotherWallet}
        txnType="withdraw"
      />
    );
  }, [
    activeApi,
    fungiblesFromNotes,
    setMainComponent,
    apiConfig,
    onTryAnotherWallet,
    balancesFromNotes,
    currentTypedChainId,
    activeChain,
    activeAccount?.address,
    currentResourceId,
    addCurrency,
    handleFungibleTokenChange,
  ]);

  const handleUnwrapAssetInputClick = useCallback(() => {
    if (activeApi) {
      const selectTokens = wrappableCurrencies.map((currency) => {
        return {
          name: currency.view.name,
          symbol: currency.view.symbol,
          onTokenClick: () => addCurrency(currency),
          isTokenAddedToMetamask: isTokenAddedToMetamask(
            currency,
            activeChain,
            activeAccount?.address,
            currentResourceId
          ),
        };
      });

      setMainComponent(
        <TokenListCard
          className="min-w-[550px] h-[710px]"
          title={'Select a token to Unwrap'}
          popularTokens={[]}
          selectTokens={selectTokens}
          unavailableTokens={apiConfig
            .getUnavailableCurrencies(
              wrappableCurrencies.map((c) => c.getCurrencyConfig())
            )
            .map((c) => ({ name: c.name, symbol: c.symbol } as AssetType))}
          onChange={(newAsset) => {
            handleWrappableTokenChange(newAsset);
            setMainComponent(undefined);
          }}
          onClose={() => setMainComponent(undefined)}
          onConnect={onTryAnotherWallet}
          txnType="withdraw"
        />
      );
    }
  }, [
    activeApi,
    wrappableCurrencies,
    setMainComponent,
    apiConfig,
    onTryAnotherWallet,
    activeChain,
    activeAccount?.address,
    currentResourceId,
    addCurrency,
    handleWrappableTokenChange,
  ]);

  const handleRelayerInputClick = useCallback(() => {
    if (!activeApi || !activeChain) {
      return;
    }

    if (activeRelayer) {
      setRelayer(null);
      return;
    }

    setMainComponent(
      <RelayerListCard
        className="min-w-[550px] h-[710px]"
        relayers={relayers
          .map((relayer) => {
            const relayerData = relayer.capabilities.supportedChains[
              activeChain.chainType === ChainType.EVM ? 'evm' : 'substrate'
            ].get(
              calculateTypedChainId(activeChain.chainType, activeChain.chainId)
            );

            if (!relayerData?.beneficiary) {
              return undefined;
            }

            const theme: RelayerType['theme'] =
              activeChain.chainType === ChainType.EVM
                ? 'ethereum'
                : 'substrate';

            const r: RelayerType = {
              address: relayerData.beneficiary,
              externalUrl: relayer.infoUri,
              theme,
            };

            return r;
          })
          .filter((r): r is RelayerType => r !== undefined)}
        onClose={() => setMainComponent(undefined)}
        onChange={(nextRelayer) => {
          setRelayer(
            relayers.find((relayer) => {
              return relayer.infoUri === nextRelayer.externalUrl;
            }) ?? null
          );
          setMainComponent(undefined);
        }}
      />
    );
  }, [
    activeApi,
    activeChain,
    activeRelayer,
    relayers,
    setMainComponent,
    setRelayer,
  ]);

  // WithdrawCard props
  const tokenInputProps = useMemo(
    () => ({
      onClick: handleTokenInputClick,
      token: selectedFungibleToken,
    }),
    [handleTokenInputClick, selectedFungibleToken]
  );

  const unwrappingAssetInputProps = useMemo(
    () => ({
      onClick: handleUnwrapAssetInputClick,
      token: selectedUnwrapToken,
    }),
    [handleUnwrapAssetInputClick, selectedUnwrapToken]
  );

  const fixedAmountInputProps = useMemo(
    () => ({
      onChange: parseUserAmount,
      values: DEFAULT_FIXED_AMOUNTS,
      isDisabled: !selectedFungibleToken || needSwitchChain,
    }),
    [needSwitchChain, parseUserAmount, selectedFungibleToken]
  );

  const customAmountInputProps = useMemo(
    () => ({
      onAmountChange: parseUserAmount,
      amount: amount ? amount.toString() : undefined,
      onMaxBtnClick: () => parseUserAmount(availableAmountFromNotes),
      errorMessage: amountError,
      isDisabled: !selectedFungibleToken || needSwitchChain,
    }),
    [
      amount,
      amountError,
      availableAmountFromNotes,
      needSwitchChain,
      parseUserAmount,
      selectedFungibleToken,
    ]
  );

  const unwrapSwitcherProps = useMemo<
    ComponentProps<typeof WithdrawCard>['unwrapSwitcherProps']
  >(
    () => ({
      checked: isUnwrap,
      disabled: needSwitchChain,
      onCheckedChange: (nextVal) => setIsUnwrap(nextVal),
    }),
    [needSwitchChain, isUnwrap]
  );

  const relayerInputProps = useMemo<
    ComponentProps<typeof WithdrawCard>['relayerInputProps']
  >(
    () => ({
      title: 'Relayer',
      relayerAddress: activeRelayer?.beneficiary,
      iconTheme: activeChain
        ? activeChain.chainType === ChainType.EVM
          ? 'ethereum'
          : 'substrate'
        : undefined,
      onClick: handleRelayerInputClick,
    }),
    [activeChain, activeRelayer?.beneficiary, handleRelayerInputClick]
  );

  const recipientInputProps = useMemo<
    ComponentProps<typeof WithdrawCard>['recipientInputProps']
  >(
    () => ({
      title: 'Recipient Address',
      info: "The recipient's wallet address",
      value: recipient,
      isValidSet(valid: boolean) {
        setIsValidRecipient(valid);
      },
      validate: (value) => isValidAddress(value),
      onChange: (recipient) => {
        setRecipient(recipient);
      },
    }),
    [recipient]
  );

  const withdrawButtonProps = useMemo<ComponentProps<typeof Button>>(
    () => ({
      isDisabled: needSwitchChain
        ? false // Not disabled because we want to switch chain
        : isWalletConnected && hasNoteAccount && isDisabledWithdraw,
      isLoading:
        loading || walletState === WalletState.CONNECTING || isFetchingFeeInfo,
      loadingText: isFetchingFeeInfo ? 'Fetching fee info...' : 'Connecting...',
      children: buttonText,
      onClick: handleWithdrawButtonClick,
    }),
    [
      buttonText,
      needSwitchChain,
      handleWithdrawButtonClick,
      hasNoteAccount,
      isDisabledWithdraw,
      isFetchingFeeInfo,
      isWalletConnected,
      loading,
      walletState,
    ]
  );

  const refundCheckboxProps = useMemo<ComponentProps<typeof CheckBox>>(
    () => ({
      isDisabled: !activeRelayer || !feeInfo,
      isChecked: isRefund,
      onChange: () => setIsRefund((prev) => !prev),
    }),
    [activeRelayer, feeInfo, isRefund]
  );

  const parseRefundAmount = useCallback(
    (value: string) => {
      if (!value) {
        setRefundAmount(0);
        return;
      }

      const parsedValue = parseFloat(value);
      if (Number.isNaN(parsedValue) || parsedValue < 0) {
        setRefundAmountError('Invalid amount');
        return;
      }

      const relayerMaxRefund = parseFloat(
        ethers.utils.formatEther(feeInfo?.maxRefund ?? '0')
      );
      if (Number.isNaN(relayerMaxRefund) || parsedValue > relayerMaxRefund) {
        setRefundAmountError(
          `Amount must be less than or equal to ${relayerMaxRefund}`
        );
        return;
      }

      setRefundAmountError('');
      setRefundAmount(parsedValue);
    },
    [feeInfo]
  );

  const refundAmountInputProps = useMemo<ComponentProps<typeof AmountInput>>(
    () => ({
      amount: refundAmount ? refundAmount.toString() : undefined,
      errorMessage: refundAmountError,
      isDisabled: !feeInfo,
      onAmountChange: parseRefundAmount,
      onMaxBtnClick: () => {
        if (!feeInfo) {
          return;
        }
        parseRefundAmount(ethers.utils.formatEther(feeInfo.maxRefund));
      },
    }),
    [feeInfo, parseRefundAmount, refundAmount, refundAmountError]
  );

  const liquidityDesc = useMemo(() => {
    if (typeof liquidity !== 'number' || !isUnwrap) {
      return undefined;
    }

    const receivingAmount = +ethers.utils.formatEther(amountAfterFeeWei);
    if (Number.isNaN(receivingAmount)) {
      console.error('Invalid receiving amount');
      return undefined;
    }

    const unwrapTkSym = selectedUnwrapToken?.symbol ?? '';

    if (receivingAmount > liquidity) {
      return `Insufficient liquidity. Available liquidity is ${liquidity} ${unwrapTkSym}`;
    }
  }, [amountAfterFeeWei, isUnwrap, liquidity, selectedUnwrapToken?.symbol]);

  const buttonDesc = useMemo(() => {
    if (!totalFeeInWei) {
      return liquidityDesc;
    }

    const totalFee = Number(ethers.utils.formatEther(totalFeeInWei));
    const formattedFee = getRoundedAmountString(totalFee, 3, {
      roundingFunction: Math.round,
    });
    const tkSymbol = selectedFungibleToken?.symbol ?? '';
    const feeText = `${formattedFee} ${tkSymbol}`.trim();

    if (activeRelayer && amount < totalFee) {
      return `Insufficient funds. You need more than ${feeText} to cover the fee`;
    }

    return liquidityDesc;
  }, [
    activeRelayer,
    amount,
    liquidityDesc,
    selectedFungibleToken?.symbol,
    totalFeeInWei,
  ]);

  const infoItemProps = useMemo<
    ComponentProps<typeof WithdrawCard>['infoItemProps']
  >(() => {
    const nativeCurrencySymbol = currentNativeCurrency?.symbol ?? '';
    const fungiCurrencySymbol = selectedFungibleToken?.symbol ?? '';

    const {
      receivingAmount,
      receivingTokenSymbol,
      remainderAmount,
      remainderTokenSymbol,
    } = infoCalculated;

    const formattedRefundAmount = getRoundedAmountString(refundAmount);
    const refundAmountContent =
      refundAmount && isRefund
        ? `${formattedRefundAmount} ${nativeCurrencySymbol}`
        : '--';

    const feeBN = totalFeeInWei
      ? totalFeeInWei
      : feeInfoOrBigNumber instanceof BigNumber
      ? feeInfoOrBigNumber
      : undefined;

    let feeText = '--';
    if (feeBN) {
      const fee = Number(ethers.utils.formatEther(feeBN));

      // If feeInfo is instance of BigNumber, it means that the fee is in native currency
      // otherwise it's in fungible token
      const tokenSymbol =
        feeInfoOrBigNumber instanceof BigNumber
          ? nativeCurrencySymbol
          : fungiCurrencySymbol;

      feeText = `${getRoundedAmountString(fee, 3, {
        roundingFunction: Math.round,
      })} ${tokenSymbol}`;
    }

    const txFeeContent = isFetchingFeeInfo ? 'Calculating...' : feeText;

    return [
      {
        leftTextProps: {
          title: 'Receiving',
          info: 'Receiving',
        },
        rightContent: receivingAmount
          ? `${receivingAmount} ${receivingTokenSymbol}`
          : '--',
      },
      isRefund
        ? {
            leftTextProps: {
              title: 'Refund Amount',
              info: refundInfo ?? 'Refund Amount',
            },
            rightContent: refundAmountContent,
          }
        : undefined,
      {
        leftTextProps: {
          title: 'Remaining balance',
          info: 'Remaining balance',
        },
        rightContent: remainderAmount
          ? `${remainderAmount} ${remainderTokenSymbol}`
          : '--',
      },
      {
        leftTextProps: {
          title: 'Est. transaction fee',
          info: 'When your transaction gets included in the block, any difference between your max base fee and the actual base fee will be refunded. Total amount is calculated as max base fee (in GWEI) * gas limit.',
        },
        rightContent: txFeeContent,
      },
    ].filter((item) => item) as ComponentProps<
      typeof WithdrawCard
    >['infoItemProps'];
  }, [
    currentNativeCurrency?.symbol,
    feeInfoOrBigNumber,
    infoCalculated,
    isFetchingFeeInfo,
    isRefund,
    refundAmount,
    refundInfo,
    selectedFungibleToken?.symbol,
    totalFeeInWei,
  ]);

  // Effect to update the fungible currency when the default fungible currency changes.
  useEffect(() => {
    if (defaultFungibleCurrency) {
      setFungibleCurrency(defaultFungibleCurrency);

      // Reset the amount
      setAmount(0);

      // Reset the unwrap switcher
      setIsUnwrap(false);

      // Reset max fee info
      resetMaxFeeInfo();
    }
  }, [defaultFungibleCurrency, resetMaxFeeInfo, setFungibleCurrency]);

  // Side effect to set the education card step
  useEffect(() => {
    // If the user has no available amount,
    // show the first step to switch to other chains
    if (availableAmountFromNotes === 0) {
      setEducationCardStep(1);
      return;
    }

    const isValidCurrency =
      (!isUnwrap && fungibleCurrency) ||
      (isUnwrap && wrappableCurrency && fungibleCurrency);

    if (!isValidCurrency || !amount) {
      setEducationCardStep(2);
      return;
    }

    if (!activeRelayer) {
      setEducationCardStep(3);
      return;
    }

    setEducationCardStep(4);
  }, [
    availableAmountFromNotes,
    setEducationCardStep,
    isUnwrap,
    fungibleCurrency,
    wrappableCurrency,
    amount,
    activeRelayer,
  ]);

  const isReady = useMemo(() => {
    if (!fungibleCurrency || !amount || !recipient) {
      return false;
    }

    if (isUnwrap && !wrappableCurrency) {
      return false;
    }

    return true;
  }, [fungibleCurrency, amount, recipient, isUnwrap, wrappableCurrency]);

  // Side effect to fetch fee info when all the inputs are valid
  useEffect(() => {
    if (!isReady) {
      return;
    }

    fetchFeeInfo(activeRelayer);
  }, [activeRelayer, isReady, fetchFeeInfo]);

  // Side effect to uncheck the refund checkbox when feeInfo is not available
  useEffect(() => {
    if (!feeInfo) {
      setIsRefund(false);
      setRefundAmount(0);
      setRefundAmountError('');
    }
  }, [feeInfo]);

  const isProcessingTxn = useMemo(
    () => txQueue.txPayloads.length > 0,
    [txQueue]
  );

  useEffect(() => {
    if (!isProcessingTxn) {
      setMainComponent(undefined);
    }
  }, [isProcessingTxn, setMainComponent]);

  return (
    <WithdrawCard
      ref={ref}
      className="max-w-none flex-[1]"
      tokenInputProps={tokenInputProps}
      unwrappingAssetInputProps={unwrappingAssetInputProps}
      fixedAmountInputProps={fixedAmountInputProps}
      customAmountInputProps={customAmountInputProps}
      unwrapSwitcherProps={unwrapSwitcherProps}
      relayerInputProps={relayerInputProps}
      recipientInputProps={recipientInputProps}
      refundInputProps={{
        refundCheckboxProps,
        refundAmountInputProps,
      }}
      withdrawBtnProps={withdrawButtonProps}
      infoItemProps={infoItemProps}
      buttonDesc={buttonDesc}
      buttonDescVariant="error"
    />
  );
});
