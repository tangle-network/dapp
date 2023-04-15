import { useWebContext } from '@webb-tools/api-provider-environment';
import { getNativeCurrencyFromConfig } from '@webb-tools/dapp-config';
import { NoteManager } from '@webb-tools/note-manager';
import {
  useBalancesFromNotes,
  useBridge,
  useCurrencies,
  useCurrentResourceId,
  useNoteAccount,
  useRelayers,
  useTxQueue,
} from '@webb-tools/react-hooks';
import {
  calculateTypedChainId,
  ChainType,
  CircomUtxo,
  Note,
  toFixedHex,
} from '@webb-tools/sdk-core';
import {
  AmountInput,
  Button,
  CheckBox,
  getRoundedAmountString,
  RelayerListCard,
  TokenListCard,
  useWebbUI,
  WithdrawCard,
} from '@webb-tools/webb-ui-components';
import { AssetType } from '@webb-tools/webb-ui-components/components/ListCard/types';
import cx from 'classnames';
import { BigNumber, ethers } from 'ethers';
import {
  ComponentProps,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Currency } from '@webb-tools/abstract-api-provider';
import { CurrencyConfig } from '@webb-tools/dapp-config';
import { isValidAddress } from '@webb-tools/dapp-types';
import { ChainListCardWrapper } from '../../components';
import {
  useAddCurrency,
  useConnectWallet,
  useMaxFeeInfo,
  useShieldedAssets,
  WalletState,
} from '../../hooks';
import { useEducationCardStep } from '../../hooks/useEducationCardStep';
import { ExchangeRateInfo, TransactionFeeInfo } from './shared';
import { WithdrawContainerProps } from './types';
import { WithdrawConfirmContainer } from './WithdrawConfirmContainer';

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

  const { wrappableCurrencies } = useCurrencies();

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

  const fungibleCurrencies = useMemo(() => {
    if (!activeApi) {
      return [];
    }

    const tokenSymbolsSet = new Set<string>();

    Array.from(allNotes.values()).forEach((notes) => {
      notes.forEach((note) => {
        tokenSymbolsSet.add(note.note.tokenSymbol);
      });
    });

    const supportedCurrencyIds = Object.keys(
      activeApi.state.getBridgeOptions()
    );

    return Array.from(tokenSymbolsSet)
      .map((symbol) => {
        return apiConfig.getCurrencyBySymbol(symbol);
      })
      .filter(
        (c): c is CurrencyConfig =>
          !!c && supportedCurrencyIds.includes(c.id.toString())
      )
      .map((c) => new Currency(c));
  }, [activeApi, allNotes, apiConfig]);

  const currentResourceId = useCurrentResourceId();

  const shieldedAssets = useShieldedAssets();

  const txQueue = useTxQueue();

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
        (note) => note.note.tokenSymbol === fungibleCurrency?.view?.symbol
      );

    return notes ?? null;
  }, [allNotes, currentResourceId, fungibleCurrency?.view?.symbol]);

  const maxFeeArgs = useMemo(
    () => ({
      fungibleCurrencyId: fungibleCurrency?.id,
    }),
    [fungibleCurrency?.id]
  );

  const {
    fetchMaxFeeInfoFromRelayer: fetchRelayerFeeInfo,
    fetchMaxFeeInfo,
    isLoading: isFetchingFeeInfo,
    feeInfo: feeInfoOrBigNumber,
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

  const availableAmount: number = useMemo(() => {
    if (!availableNotesFromManager?.length) {
      return 0;
    }

    let tokenDecimals: number | undefined;
    const amountBN = availableNotesFromManager.reduce<BigNumber>(
      (accumulatedBalance, newNote) => {
        if (!tokenDecimals) {
          tokenDecimals = Number(newNote.note.denomination);
        }

        return accumulatedBalance.add(newNote.note.amount);
      },
      BigNumber.from(0)
    );

    return Number(ethers.utils.formatUnits(amountBN, tokenDecimals));
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
      balanceType: 'note',
    };
  }, [addCurrency, availableAmount, fungibleCurrency]);

  const selectedUnwrapToken = useMemo<AssetType | undefined>(() => {
    if (!wrappableCurrency) {
      return undefined;
    }
    return {
      symbol: wrappableCurrency.view.symbol,
      name: wrappableCurrency.view.name,
      onTokenClick: () => addCurrency(wrappableCurrency),
      balanceType: 'wallet',
    };
  }, [addCurrency, wrappableCurrency]);

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
    return shieldedAssets
      .filter((asset) =>
        fungibleCurrency
          ? asset.fungibleTokenSymbol === fungibleCurrency.view.symbol
          : true
      )
      .map((asset) => asset.rawChain);
  }, [availableAmount, fungibleCurrency, shieldedAssets]);

  const totalFeeInWei = useMemo(() => {
    if (!feeInfo) {
      return undefined;
    }

    let feeWei = feeInfo.estimatedFee;

    if (refundAmount && isRefund) {
      const exchangeRate = Number(
        ethers.utils.formatEther(feeInfo.refundExchangeRate)
      );
      const converted = refundAmount * exchangeRate;
      const refundAmountWei = ethers.utils.parseEther(converted.toFixed(6));

      feeWei = feeWei.add(refundAmountWei);
    }

    return feeWei;
  }, [feeInfo, isRefund, refundAmount]);

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
      amount >= totalFee,
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
    amount,
    feeInfoOrBigNumber,
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

    if (selectedUnwrapToken && isUnwrap) {
      return 'Unwrap and Withdraw';
    }

    return 'Withdraw';
  }, [
    hasNoteAccount,
    isDisabledWithdraw,
    isUnwrap,
    isWalletConnected,
    otherAvailableChains.length,
    selectedUnwrapToken,
  ]);

  const amountAfterFeeWei = useMemo(() => {
    const amountWei = ethers.utils.parseEther(amount.toString());
    if (!totalFeeInWei) {
      return amountWei;
    }

    return amountWei.sub(totalFeeInWei);
  }, [amount, totalFeeInWei]);

  // Calculate the info for UI display
  const infoCalculated = useMemo(() => {
    const amountAfterFee = Number(ethers.utils.formatEther(amountAfterFeeWei));

    const receivingAmount = isValidAmount
      ? getRoundedAmountString(amountAfterFee, 3, Math.round)
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
    amountAfterFeeWei,
    availableAmount,
    fungibleCurrency?.view.symbol,
    isUnwrap,
    isValidAmount,
    wrappableCurrency?.view.symbol,
  ]);

  const refundInfo = useMemo(
    () =>
      feeInfo ? (
        <ExchangeRateInfo
          exchangeRate={+ethers.utils.formatEther(feeInfo.refundExchangeRate)}
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
          Math.round
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
        targetChainId={currentTypedChainId}
        availableNotes={inputNotes}
        amount={amount}
        fee={fee}
        amountAfterFee={amountAfterFeeWei}
        isRefund={isRefund}
        fungibleCurrency={{
          value: fungibleCurrency,
          balance: availableAmount,
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
    activeApi?.state.activeBridge,
    amount,
    amountAfterFeeWei,
    availableAmount,
    availableNotesFromManager,
    currentNativeCurrency?.symbol,
    currentTypedChainId,
    feeInfoOrBigNumber,
    fungibleCurrency,
    handleResetState,
    handleSwitchToOtherDestChains,
    hasNoteAccount,
    isDisabledWithdraw,
    isRefund,
    isUnwrap,
    isWalletConnected,
    noteManager,
    otherAvailableChains.length,
    recipient,
    refundAmount,
    refundInfo,
    setMainComponent,
    setOpenNoteAccountModal,
    toggleModal,
    totalFeeInWei,
    transactionFeeInfo,
    txQueue.txPayloads,
    wrappableCurrency,
  ]);

  // Callback to handle the change of the inputs
  const handleTokenInputClick = useCallback(() => {
    if (!activeApi) {
      return;
    }

    const selectableTokens = Object.values(fungibleCurrencies).map(
      (currency) => {
        return {
          name: currency.view.name,
          symbol: currency.view.symbol,
          balance:
            selectedFungibleToken?.symbol === currency.view.symbol
              ? availableAmount
              : balancesFromNotes[currency.id],
          onTokenClick: () => addCurrency(currency),
        };
      }
    );

    setMainComponent(
      <TokenListCard
        className="min-w-[550px] h-[700px]"
        title={'Select a token to Withdraw'}
        popularTokens={[]}
        selectTokens={selectableTokens}
        unavailableTokens={apiConfig
          .getUnavailableCurrencies(
            fungibleCurrencies.map((c) => c.getCurrencyConfig())
          )
          .map((c) => ({ name: c.name, symbol: c.symbol } as AssetType))}
        onChange={(newAsset) => {
          handleFungibleTokenChange(newAsset);
          setMainComponent(undefined);
        }}
        onClose={() => setMainComponent(undefined)}
        onConnect={onTryAnotherWallet}
      />
    );
  }, [
    activeApi,
    addCurrency,
    apiConfig,
    availableAmount,
    balancesFromNotes,
    fungibleCurrencies,
    handleFungibleTokenChange,
    onTryAnotherWallet,
    selectedFungibleToken?.symbol,
    setMainComponent,
  ]);

  const handleUnwrapAssetInputClick = useCallback(() => {
    if (activeApi) {
      const selectTokens = wrappableCurrencies.map((currency) => {
        return {
          name: currency.view.name,
          symbol: currency.view.symbol,
          onTokenClick: () => addCurrency(currency),
        };
      });

      setMainComponent(
        <TokenListCard
          className="min-w-[550px] h-[700px]"
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
        />
      );
    }
  }, [
    activeApi,
    addCurrency,
    apiConfig,
    handleWrappableTokenChange,
    onTryAnotherWallet,
    setMainComponent,
    wrappableCurrencies,
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
        className="min-w-[550px] h-[700px]"
        relayers={relayers
          .map((relayer) => {
            const relayerData = relayer.capabilities.supportedChains[
              activeChain.chainType === ChainType.EVM ? 'evm' : 'substrate'
            ].get(
              calculateTypedChainId(activeChain.chainType, activeChain.chainId)
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
      isDisabled: !selectedFungibleToken,
    }),
    [parseUserAmount, selectedFungibleToken]
  );

  const customAmountInputProps = useMemo(
    () => ({
      onAmountChange: parseUserAmount,
      amount: amount ? amount.toString() : undefined,
      onMaxBtnClick: () => parseUserAmount(availableAmount),
      errorMessage: amountError,
      isDisabled: !selectedFungibleToken,
    }),
    [
      amount,
      amountError,
      availableAmount,
      parseUserAmount,
      selectedFungibleToken,
    ]
  );

  const unwrapSwitcherProps = useMemo<
    ComponentProps<typeof WithdrawCard>['unwrapSwitcherProps']
  >(
    () => ({
      checked: isUnwrap,
      onCheckedChange: (nextVal) => setIsUnwrap(nextVal),
    }),
    [isUnwrap]
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
      isDisabled:
        otherAvailableChains.length > 0
          ? false
          : isWalletConnected && hasNoteAccount && isDisabledWithdraw,
      isLoading:
        loading || walletState === WalletState.CONNECTING || isFetchingFeeInfo,
      className: cx('mt-4'),
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

  const buttonDesc = useMemo(() => {
    if (!totalFeeInWei) {
      return undefined;
    }

    const totalFee = Number(ethers.utils.formatEther(totalFeeInWei));
    const formattedFee = getRoundedAmountString(totalFee, 3, Math.round);
    const tkSymbol = selectedFungibleToken?.symbol ?? '';
    const feeText = `${formattedFee} ${tkSymbol}`.trim();

    if (amount < totalFee) {
      return `Insufficient funds. You need more than ${feeText} to cover the fee`;
    }
  }, [amount, selectedFungibleToken?.symbol, totalFeeInWei]);

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

    const txFeeContent = isFetchingFeeInfo
      ? 'Calculating...'
      : totalFeeInWei
      ? `${getRoundedAmountString(
          Number(ethers.utils.formatEther(totalFeeInWei)),
          3,
          Math.round
        )} ${fungiCurrencySymbol}`
      : feeInfoOrBigNumber instanceof BigNumber
      ? `${ethers.utils.formatEther(
          feeInfoOrBigNumber
        )} ${nativeCurrencySymbol}`
      : '--';

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
          title: 'Max fee',
          info: transactionFeeInfo,
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
    transactionFeeInfo,
  ]);

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

    if (activeRelayer) {
      fetchRelayerFeeInfo(activeRelayer);
    } else {
      fetchMaxFeeInfo();
    }
  }, [activeRelayer, isReady, fetchRelayerFeeInfo, fetchMaxFeeInfo]);

  // Side effect to uncheck the refund checkbox when feeInfo is not available
  useEffect(() => {
    if (!feeInfo) {
      setIsRefund(false);
      setRefundAmount(0);
      setRefundAmountError('');
    }
  }, [feeInfo]);

  return (
    <WithdrawCard
      ref={ref}
      className="max-w-none"
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
