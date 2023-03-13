import { useWebContext } from '@webb-tools/api-provider-environment';
import { NoteManager } from '@webb-tools/note-manager';
import {
  useBridge,
  useCurrencies,
  useCurrentResourceId,
  useNoteAccount,
  useRelayers,
  useTxQueue,
} from '@webb-tools/react-hooks';
import {
  ChainType,
  CircomUtxo,
  Note,
  calculateTypedChainId,
  toFixedHex,
} from '@webb-tools/sdk-core';
import {
  AmountInput,
  Button,
  CheckBox,
  RelayerListCard,
  TokenListCard,
  Typography,
  WithdrawCard,
  getRoundedAmountString,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { AssetType } from '@webb-tools/webb-ui-components/components/ListCard/types';

import { BigNumber, ethers } from 'ethers';
import {
  ComponentProps,
  FC,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getNativeCurrencyFromConfig } from '@webb-tools/dapp-config';
import { ChainListCardWrapper } from '../../components';
import {
  WalletState,
  useAddCurrency,
  useConnectWallet,
  useShieldedAssets,
} from '../../hooks';
import { useEducationCardStep } from '../../hooks/useEducationCardStep';
import { useWithdrawFee } from '../../hooks/useWIthdrawFee';
import { getErrorMessage } from '../../utils';
import { WithdrawConfirmContainer } from './WithdrawConfirmContainer';
import { WithdrawContainerProps } from './types';
import { ExchangeRateInfo } from './shared';

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

  const { setMainComponent, notificationApi } = useWebbUI();

  const {
    activeApi,
    activeChain,
    activeWallet,
    apiConfig,
    loading,
    noteManager,
    switchChain,
  } = useWebContext();

  const {
    fungibleCurrency,
    wrappableCurrency,
    setFungibleCurrency,
    setWrappableCurrency,
  } = useBridge();

  const { fungibleCurrencies, wrappableCurrencies } = useCurrencies();

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

  const { allNotes, hasNoteAccount, setOpenNoteAccountModal } =
    useNoteAccount();

  const currentResourceId = useCurrentResourceId();

  const shieldedAssets = useShieldedAssets();

  const txQueue = useTxQueue();

  const { isWalletConnected, toggleModal, walletState } = useConnectWallet();

  const { setEducationCardStep } = useEducationCardStep();

  const addCurrency = useAddCurrency();

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
        (note) => note.note.tokenSymbol === fungibleCurrency?.view?.symbol
      );

    return notes ?? null;
  }, [allNotes, currentResourceId, fungibleCurrency?.view?.symbol]);

  const {
    fetchFeeInfo,
    isLoading: isFetchingFeeInfo,
    error: fetchFeeInfoError,
    feeInfo,
  } = useWithdrawFee(
    availableNotesFromManager,
    amount,
    recipient,
    activeRelayer,
    currentTypedChainId && isUnwrap
      ? wrappableCurrency?.getAddress(currentTypedChainId)
      : ''
  );

  const currentNativeCurrency = useMemo(() => {
    if (!activeChain) {
      return undefined;
    }

    return apiConfig.currencies[activeChain.nativeCurrencyId];
  }, [activeChain, apiConfig.currencies]);

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

  const selectedFungibleToken = useMemo<AssetType | undefined>(() => {
    if (!fungibleCurrency) {
      return undefined;
    }
    return {
      symbol: fungibleCurrency.view.symbol,
      name: fungibleCurrency.view.name,
      balance: availableAmount,
      onTokenClick: () => addCurrency(fungibleCurrency),
    };
  }, [addCurrency, availableAmount, fungibleCurrency]);

  const fungibleTokens = useMemo((): AssetType[] => {
    return Object.values(fungibleCurrencies).map((currency) => {
      return {
        name: currency.view.name,
        symbol: currency.view.symbol,
        balance:
          selectedFungibleToken?.symbol === currency.view.symbol
            ? availableAmount
            : 0,
        onTokenClick: () => addCurrency(currency),
      };
    });
  }, [
    fungibleCurrencies,
    selectedFungibleToken?.symbol,
    availableAmount,
    addCurrency,
  ]);

  const selectedUnwrapToken = useMemo<AssetType | undefined>(() => {
    if (!wrappableCurrency) {
      return undefined;
    }
    return {
      symbol: wrappableCurrency.view.symbol,
      name: wrappableCurrency.view.name,
      onTokenClick: () => addCurrency(wrappableCurrency),
    };
  }, [addCurrency, wrappableCurrency]);

  const wrappableTokens = useMemo((): AssetType[] => {
    return wrappableCurrencies.map((currency) => {
      return {
        name: currency.view.name,
        symbol: currency.view.symbol,
        onTokenClick: () => addCurrency(currency),
      };
    });
  }, [addCurrency, wrappableCurrencies]);

  const parseUserAmount = useCallback(
    (amount: string | number): void => {
      const parsedAmount = Number(amount);
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        setAmountError('Invalid amount');
        return;
      }

      if (parsedAmount > availableAmount) {
        setAmountError('Insufficient balance, maybe incorrect chain?');
        return;
      }

      setAmount(parsedAmount);
      setAmountError('');
    },
    [availableAmount]
  );

  const handleFungibleTokenChange = useCallback(
    async (newToken: AssetType) => {
      const selectedToken = Object.values(fungibleCurrencies).find(
        (currency) => currency.view.symbol === newToken.symbol
      );
      if (selectedToken) {
        setFungibleCurrency(selectedToken);
      }
    },
    [fungibleCurrencies, setFungibleCurrency]
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

  const [isValidRecipient, setIsValidRecipient] = useState(false);

  // Calculate other destination chains from the shielded assets data
  // which suggest user to switch to if the current chain has no balance
  const otherAvailableChains = useMemo(() => {
    // If current chain has balance, then no need to show other chains
    if (availableAmount > 0) {
      return [];
    }

    // If current chain has no balance, then show other chains
    // which has balance
    return shieldedAssets.map((asset) => asset.rawChain);
  }, [availableAmount, shieldedAssets]);

  const isDisabledWithdraw = useMemo(() => {
    return [
      Boolean(fungibleCurrency), // No fungible currency selected
      isUnwrap ? Boolean(wrappableCurrency) : true, // No unwrappable currency selected when unwrapping
      Boolean(isValidAmount), // Amount is greater than available amount
      Boolean(recipient), // No recipient address
      isValidRecipient, // Invalid recipient address
    ].some((value) => value === false);
  }, [
    fungibleCurrency,
    isUnwrap,
    wrappableCurrency,
    isValidAmount,
    recipient,
    isValidRecipient,
  ]);

  const buttonText = useMemo(() => {
    if (!isWalletConnected) {
      return 'Connect wallet';
    }

    if (!hasNoteAccount) {
      return 'Create note account';
    }

    if (isDisabledWithdraw && otherAvailableChains.length > 0) {
      return 'Switch chain to withdraw';
    }

    // If user selects a relayer, require the fee info to be fetched
    if (activeRelayer && !feeInfo) {
      return 'Fetch fee info';
    }

    if (selectedUnwrapToken && isUnwrap) {
      return 'Unwrap and Withdraw';
    }

    return 'Withdraw';
  }, [
    activeRelayer,
    feeInfo,
    hasNoteAccount,
    isDisabledWithdraw,
    isUnwrap,
    isWalletConnected,
    otherAvailableChains.length,
    selectedUnwrapToken,
  ]);

  // Calculate the info for UI display
  const infoCalculated = useMemo(() => {
    const exchangeRate = feeInfo
      ? parseFloat(ethers.utils.formatEther(feeInfo.refundExchangeRate))
      : 1;
    const amountAfterRefund = amount - refundAmount / exchangeRate;

    const receivingAmount = isValidAmount
      ? getRoundedAmountString(amountAfterRefund)
      : undefined;
    const remainderAmount = isValidAmount
      ? getRoundedAmountString(availableAmount - amount)
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
    availableAmount,
    feeInfo,
    fungibleCurrency?.view.symbol,
    isUnwrap,
    isValidAmount,
    refundAmount,
    wrappableCurrency?.view.symbol,
  ]);

  const handleResetState = useCallback(() => {
    setAmountError('');
    setAmount(0);
    setRecipient('');
    setIsUnwrap(false);
    setRelayer(null);
    setRefundAmount(0);
    setRefundAmountError('');
  }, [setRelayer]);

  const handleSwitchToOtherDestChains = useCallback(async () => {
    if (otherAvailableChains.length === 0 || !activeWallet) {
      return;
    }

    if (otherAvailableChains.length === 1) {
      const chain = otherAvailableChains[0];
      await switchChain(chain, activeWallet);
      setMainComponent(undefined);
      return;
    }

    if (!activeChain) {
      return;
    }

    const activeChainType = {
      name: activeChain.name,
      tag: activeChain.tag,
      symbol:
        getNativeCurrencyFromConfig(
          apiConfig.currencies,
          calculateTypedChainId(activeChain.chainType, activeChain.chainId)
        )?.symbol ?? 'Unknown',
    };

    setMainComponent(
      <ChainListCardWrapper
        chainType="dest"
        onlyCategory={activeChain?.tag}
        chains={otherAvailableChains.map((chain) => {
          const currency = getNativeCurrencyFromConfig(
            apiConfig.currencies,
            calculateTypedChainId(chain.chainType, chain.chainId)
          );
          if (!currency) {
            console.error('No currency found for chain', chain.name);
          }

          return {
            name: chain.name,
            tag: chain.tag,
            symbol: currency?.symbol ?? 'Unknown',
          };
        })}
        value={activeChainType}
      />
    );
  }, [
    activeChain,
    activeWallet,
    apiConfig,
    otherAvailableChains,
    setMainComponent,
    switchChain,
  ]);

  const totalFee = useMemo(() => {
    if (!feeInfo) {
      return undefined;
    }

    if (refundAmount) {
      const refundAmountWei = ethers.utils.parseEther(refundAmount.toString());
      const totalFeeBigNumber = refundAmountWei.add(feeInfo.estimatedFee);
      return ethers.utils.formatEther(totalFeeBigNumber);
    }

    return ethers.utils.formatEther(feeInfo.estimatedFee);
  }, [feeInfo, refundAmount]);

  const totalFeeFormatted = useMemo(() => {
    if (!totalFee) {
      return undefined;
    }

    return getRoundedAmountString(parseFloat(totalFee));
  }, [totalFee]);

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

    if (isDisabledWithdraw && otherAvailableChains.length > 0) {
      return await handleSwitchToOtherDestChains();
    }

    if (activeRelayer && !feeInfo) {
      return await fetchFeeInfo();
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

    // Generate change utxo (or dummy utxo if the changeAmount is `0`)
    const changeUtxo = await CircomUtxo.generateUtxo({
      curve: 'Bn254',
      backend: 'Circom',
      amount: changeAmountBigNumber.toString(),
      chainId: currentTypedChainId.toString(),
      keypair,
      originChainId: currentTypedChainId.toString(),
    });

    // Generate the change note based on the change utxo
    let changeNote: Note | undefined;
    if (changeAmountBigNumber.gt(0)) {
      changeNote = await Note.generateNote({
        amount: changeUtxo.amount,
        backend: 'Circom',
        curve: 'Bn254',
        denomination: '18',
        exponentiation: '5',
        hashFunction: 'Poseidon',
        protocol: 'vanchor',
        secrets: [
          toFixedHex(currentTypedChainId, 8).substring(2),
          toFixedHex(changeUtxo.amount).substring(2),
          toFixedHex(keypair.privkey).substring(2),
          toFixedHex(`0x${changeUtxo.blinding}`).substring(2),
        ].join(':'),
        sourceChain: currentTypedChainId.toString(),
        sourceIdentifyingData: destAddress,
        targetChain: currentTypedChainId.toString(),
        targetIdentifyingData: destAddress,
        tokenSymbol: inputNotes[0].note.tokenSymbol,
        version: 'v1',
        width: '4',
      });
    }

    setMainComponent(
      <WithdrawConfirmContainer
        className="w-[550px]" // TODO: Remove hardcoded width
        changeUtxo={changeUtxo}
        changeNote={changeNote}
        changeAmount={formattedChangeAmount}
        targetChainId={currentTypedChainId}
        availableNotes={inputNotes}
        amount={amount}
        fees={totalFee ? parseFloat(totalFee) : 0}
        fungibleCurrency={{
          value: fungibleCurrency,
          balance: availableAmount,
        }}
        unwrapCurrency={
          isUnwrap && wrappableCurrency
            ? { value: wrappableCurrency }
            : undefined
        }
        refundAmount={refundAmount}
        refundToken={currentNativeCurrency?.symbol}
        refundExchangeRate={
          feeInfo
            ? +ethers.utils.formatEther(feeInfo.refundExchangeRate)
            : undefined
        }
        recipient={recipient}
        onResetState={handleResetState}
      />
    );
  }, [
    activeApi?.state.activeBridge,
    activeRelayer,
    amount,
    availableAmount,
    availableNotesFromManager,
    currentNativeCurrency?.symbol,
    currentTypedChainId,
    feeInfo,
    fetchFeeInfo,
    fungibleCurrency,
    handleResetState,
    handleSwitchToOtherDestChains,
    hasNoteAccount,
    isDisabledWithdraw,
    isUnwrap,
    isWalletConnected,
    noteManager,
    otherAvailableChains.length,
    recipient,
    refundAmount,
    setMainComponent,
    setOpenNoteAccountModal,
    toggleModal,
    totalFee,
    txQueue.txPayloads,
    wrappableCurrency,
  ]);

  const withdrawButtonProps = useMemo<ComponentProps<typeof Button>>(
    () => ({
      isDisabled:
        otherAvailableChains.length > 0
          ? false
          : isWalletConnected && hasNoteAccount && isDisabledWithdraw,
      isLoading:
        loading || walletState === WalletState.CONNECTING || isFetchingFeeInfo,
      loadingText: isFetchingFeeInfo ? 'Fetching fee info...' : 'Connecting...',
      children: buttonText,
      onClick: handleWithdrawButtonClick,
    }),
    [
      buttonText,
      handleWithdrawButtonClick,
      hasNoteAccount,
      isDisabledWithdraw,
      isFetchingFeeInfo,
      isWalletConnected,
      loading,
      otherAvailableChains.length,
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
        return;
      }

      const parsedValue = parseFloat(value);
      if (Number.isNaN(parsedValue) || parsedValue < 0) {
        setRefundAmountError('Invalid amount');
        return;
      }

      const maxRefundOnRelayer = feeInfo?.maxRefund.toNumber() ?? 0;
      const exchangeRate = feeInfo
        ? parseFloat(ethers.utils.formatEther(feeInfo.refundExchangeRate))
        : 1;
      const maxRefundOnAmount = amount / exchangeRate;
      if (parsedValue > maxRefundOnRelayer || parsedValue > maxRefundOnAmount) {
        const maxVal = Math.min(maxRefundOnRelayer, maxRefundOnAmount);
        setRefundAmountError(`Amount must be less than or equal to ${maxVal}`);
        return;
      }

      setRefundAmountError('');
      setRefundAmount(parsedValue);
    },
    [amount, feeInfo]
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

        const exchangeRate = parseFloat(
          ethers.utils.formatEther(feeInfo.refundExchangeRate)
        );
        const maxRefundOnAmount = amount / exchangeRate;
        const maxVal = Math.min(
          feeInfo.maxRefund.toNumber(),
          maxRefundOnAmount
        );
        setRefundAmount(maxVal);
      },
    }),
    [amount, feeInfo, parseRefundAmount, refundAmount, refundAmountError]
  );

  // Effect to update the fungible currency when the default fungible currency changes.
  useEffect(() => {
    if (defaultFungibleCurrency) {
      setFungibleCurrency(defaultFungibleCurrency);
    }
  }, [defaultFungibleCurrency, setFungibleCurrency]);

  // Side effect to set the education card step
  useEffect(() => {
    // If the user has no available amount,
    // show the first step to switch to other chains
    if (availableAmount === 0) {
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
    availableAmount,
    setEducationCardStep,
    isUnwrap,
    fungibleCurrency,
    wrappableCurrency,
    amount,
    activeRelayer,
  ]);

  // Side effect to show notification when fetching fee info fails
  useEffect(() => {
    if (fetchFeeInfoError) {
      const message = getErrorMessage(fetchFeeInfoError);
      notificationApi.addToQueue({
        variant: 'error',
        message,
      });
    }
  }, [fetchFeeInfoError, notificationApi]);

  // Side effect to uncheck the refund checkbox when feeInfo is not available
  useEffect(() => {
    if (!feeInfo) {
      setIsRefund(false);
    }
  }, [feeInfo]);

  return (
    <div ref={ref}>
      <WithdrawCard
        className="h-[615px] max-w-none"
        tokenInputProps={{
          onClick: () => {
            if (!activeApi) {
              return;
            }

            setMainComponent(
              <TokenListCard
                className="min-w-[550px] h-[700px]"
                title={'Select Asset to Withdraw'}
                popularTokens={[]}
                selectTokens={fungibleTokens}
                unavailableTokens={[]}
                onChange={(newAsset) => {
                  handleFungibleTokenChange(newAsset);
                  setMainComponent(undefined);
                }}
                onClose={() => setMainComponent(undefined)}
                onConnect={onTryAnotherWallet}
              />
            );
          },
          token: selectedFungibleToken,
        }}
        unwrappingAssetInputProps={{
          onClick: () => {
            if (activeApi) {
              setMainComponent(
                <TokenListCard
                  className="min-w-[550px] h-[700px]"
                  title={'Select Asset to Unwrap'}
                  popularTokens={[]}
                  selectTokens={wrappableTokens}
                  unavailableTokens={[]}
                  onChange={(newAsset) => {
                    handleWrappableTokenChange(newAsset);
                    setMainComponent(undefined);
                  }}
                  onClose={() => setMainComponent(undefined)}
                  onConnect={onTryAnotherWallet}
                />
              );
            }
          },
          token: selectedUnwrapToken,
        }}
        fixedAmountInputProps={{
          onChange: parseUserAmount,
          values: [0.1, 0.25, 0.5, 1.0],
          isDisabled: !selectedFungibleToken,
        }}
        customAmountInputProps={{
          onAmountChange: parseUserAmount,
          amount: amount ? amount.toString() : undefined,
          onMaxBtnClick: () => parseUserAmount(availableAmount),
          errorMessage: amountError,
          isDisabled: !selectedFungibleToken,
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

            if (activeRelayer) {
              setRelayer(null);
              return;
            }

            setMainComponent(
              <RelayerListCard
                className="min-w-[550px] h-[700px]"
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
          value: recipient,
          isValidSet(valid: boolean) {
            setIsValidRecipient(valid);
          },
          onChange: (recipient) => {
            setRecipient(recipient);
          },
        }}
        refundInputProps={{
          refundCheckboxProps,
          refundAmountInputProps,
        }}
        withdrawBtnProps={withdrawButtonProps}
        isFetchingFee={isFetchingFeeInfo}
        feeAmount={totalFeeFormatted}
        receivedAmount={infoCalculated.receivingAmount}
        receivedToken={infoCalculated.receivingTokenSymbol}
        receivedInfo={
          feeInfo ? (
            <ExchangeRateInfo
              exchangeRate={
                +ethers.utils.formatEther(feeInfo.refundExchangeRate)
              }
              fungibleTokenSymbol={fungibleCurrency?.view.symbol}
              nativeTokenSymbol={currentNativeCurrency?.symbol}
            />
          ) : undefined
        }
        refundAmount={refundAmount}
        refundToken={currentNativeCurrency?.symbol}
        remainderAmount={infoCalculated.remainderAmount}
        remainderToken={infoCalculated.remainderTokenSymbol}
      />
    </div>
  );
});
