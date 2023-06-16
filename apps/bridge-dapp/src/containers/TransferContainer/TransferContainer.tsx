import { utxoFromVAnchorNote } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import {
  Chain,
  CurrencyConfig,
  getNativeCurrencyFromConfig,
} from '@webb-tools/dapp-config';
import { isValidPublicKey } from '@webb-tools/dapp-types';
import { NoteManager } from '@webb-tools/note-manager';
import {
  useBalancesFromNotes,
  useCurrentResourceId,
  useCurrentTypedChainId,
  useNoteAccount,
  useRelayers,
  useVAnchor,
} from '@webb-tools/react-hooks';
import {
  ChainType as ChainTypeEnum,
  Keypair,
  Note,
  calculateTypedChainId,
} from '@webb-tools/sdk-core';
import {
  RelayerListCard,
  TokenListCard,
  TransferCard,
  getRoundedAmountString,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { ChainType as InputChainType } from '@webb-tools/webb-ui-components/components/BridgeInputs/types';
import {
  AssetType,
  ChainType,
} from '@webb-tools/webb-ui-components/components/ListCard/types';
import { TransferCardProps } from '@webb-tools/webb-ui-components/containers/TransferCard/types';
import { BigNumber, ethers } from 'ethers';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { ChainListCardWrapper } from '../../components';
import {
  WalletState,
  useAddCurrency,
  useConnectWallet,
  useMaxFeeInfo,
} from '../../hooks';
import { useEducationCardStep } from '../../hooks/useEducationCardStep';
import useStatesFromNotes from '../../hooks/useStatesFromNotes';
import { TransferConfirmContainer } from './TransferConfirmContainer';
import { RecipientPublicKeyTooltipContent } from './shared';
import { TransferContainerProps } from './types';
import { isTokenAddedToMetamask } from '../../hooks/useAddCurrency';

export const TransferContainer = forwardRef<
  HTMLDivElement,
  TransferContainerProps
>(
  (
    { defaultDestinationChain, defaultFungibleCurrency, onTryAnotherWallet },
    ref
  ) => {
    const {
      activeApi,
      activeChain,
      apiConfig,
      activeAccount,
      chains,
      loading,
      noteManager,
      txQueue,
    } = useWebContext();

    const { setMainComponent } = useWebbUI();

    const { hasNoteAccount, setOpenNoteAccountModal } = useNoteAccount();

    const { api } = useVAnchor();

    const { isWalletConnected, toggleModal, walletState } = useConnectWallet();

    const currentTypedChainId = useCurrentTypedChainId();

    const useRelayerArgs = useMemo(
      () => ({
        typedChainId: currentTypedChainId,
        target:
          activeApi?.state.activeBridge && currentTypedChainId
            ? activeApi.state.activeBridge.targets[currentTypedChainId]
            : undefined,
      }),
      [activeApi?.state.activeBridge, currentTypedChainId]
    );

    // Given the user inputs above, fetch relayers state
    const {
      relayersState: { activeRelayer, relayers },
      setRelayer,
    } = useRelayers(useRelayerArgs);

    // The destination chains
    const [destChain, setDestChain] = useState<Chain | undefined>(
      defaultDestinationChain
    );

    const {
      availableAmountFromNotes,
      availableNotes,
      fungibleCurrency,
      fungiblesFromNotes,
      handleSwitchToOtherChains,
      needSwitchChain,
      setFungibleCurrency,
    } = useStatesFromNotes();

    const balancesFromNotes = useBalancesFromNotes();

    // State for amount input value
    const [transferAmount, setTransferAmount] = useState<number | undefined>(
      undefined
    );

    // State for error message when user input amount is invalid
    const [amountError, setAmountError] = useState<string>('');

    // State for the recipient public key
    const [recipientPubKey, setRecipientPubKey] = useState<string>('');

    const [isValidRecipient, setIsValidRecipient] = useState(false);

    const { setEducationCardStep } = useEducationCardStep();

    const addCurrency = useAddCurrency();

    const currentResourceId = useCurrentResourceId();

    const maxFeeArgs = useMemo(
      () => ({
        fungibleCurrencyId: fungibleCurrency?.id,
      }),
      [fungibleCurrency?.id]
    );

    const {
      feeInfo,
      fetchFeeInfo,
      isLoading: isFetchingMaxFeeInfo,
      resetMaxFeeInfo,
    } = useMaxFeeInfo(maxFeeArgs);

    const feeInWei = useMemo(() => {
      if (!feeInfo || feeInfo instanceof BigNumber) {
        return feeInfo;
      }

      return feeInfo.estimatedFee;
    }, [feeInfo]);

    const currentNativeCurrency = useMemo(() => {
      if (!currentTypedChainId) {
        return undefined;
      }

      return getNativeCurrencyFromConfig(
        apiConfig.currencies,
        currentTypedChainId
      );
    }, [apiConfig.currencies, currentTypedChainId]);

    // Calculate recipient error message
    const recipientError = useMemo(() => {
      if (!recipientPubKey) {
        return '';
      }

      return recipientPubKey.length === 130 && recipientPubKey.startsWith('0x')
        ? ''
        : 'The public key must be 130 characters long and start with 0x';
    }, [recipientPubKey]);

    // The selected asset to display in the transfer card
    const selectedBridgingAsset = useMemo<AssetType | undefined>(() => {
      if (!fungibleCurrency) {
        return undefined;
      }

      let balance: number | undefined;
      const balancesRecord = balancesFromNotes[fungibleCurrency.id];

      if (balancesRecord) {
        balance = currentTypedChainId && balancesRecord[currentTypedChainId];

        if (typeof balance === 'undefined') {
          balance = Object.values(balancesRecord)[0];
        }
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
      fungibleCurrency,
      balancesFromNotes,
      activeChain,
      activeAccount?.address,
      currentResourceId,
      currentTypedChainId,
      addCurrency,
    ]);

    const selectableBridgingAssets = useMemo<AssetType[]>(() => {
      return fungiblesFromNotes.reduce((acc, currency) => {
        if (!currency) {
          return acc;
        }

        let balance: number | undefined;
        if (
          currentTypedChainId &&
          balancesFromNotes[currency.id]?.[currentTypedChainId]
        ) {
          balance = balancesFromNotes[currency.id][currentTypedChainId];
        } else {
          balance = balancesFromNotes[currency.id]
            ? Object.values(balancesFromNotes[currency.id])?.[0]
            : undefined;
        }

        acc.push({
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
        });

        return acc;
      }, [] as AssetType[]);
    }, [
      fungiblesFromNotes,
      currentTypedChainId,
      balancesFromNotes,
      activeChain,
      activeAccount?.address,
      currentResourceId,
      addCurrency,
    ]);

    // Callback when a chain item is selected
    const handleBridgingAssetChange = useCallback(
      async (newToken: AssetType) => {
        const selectedCurrency = fungiblesFromNotes.find(
          (currency) => currency.view.symbol === newToken.symbol
        );
        if (selectedCurrency) {
          setFungibleCurrency(selectedCurrency);

          // Reset the amount
          setTransferAmount(undefined);

          // Reset the destination chain if needed
          if (destChain) {
            const typedChainId = calculateTypedChainId(
              destChain.chainType,
              destChain.chainId
            );

            // If the selected currency does not support the selected chain, reset the selected chain
            if (!selectedCurrency.hasChain(typedChainId)) {
              setDestChain(undefined);
            }
          }

          // Reset fee info
          resetMaxFeeInfo();
        }
      },
      [destChain, fungiblesFromNotes, resetMaxFeeInfo, setFungibleCurrency]
    );

    // Callback for bridging asset input click
    const handleBridgingAssetInputClick = useCallback(() => {
      const currencies = selectableBridgingAssets
        .map(({ symbol }) => apiConfig.getCurrencyBySymbol(symbol))
        .filter((c): c is CurrencyConfig => !!c);

      const unavailableTokens = apiConfig
        .getUnavailableCurrencies(currencies)
        .map((c) => ({ name: c.name, symbol: c.symbol } as AssetType));

      setMainComponent(
        <TokenListCard
          className="h-[710px]"
          title="Select a token to Transfer"
          popularTokens={[]}
          selectTokens={selectableBridgingAssets}
          unavailableTokens={unavailableTokens}
          onChange={(newAsset) => {
            handleBridgingAssetChange(newAsset);
            setMainComponent(undefined);
          }}
          onClose={() => setMainComponent(undefined)}
          onConnect={onTryAnotherWallet}
          txnType="transfer"
        />
      );
    }, [
      apiConfig,
      handleBridgingAssetChange,
      onTryAnotherWallet,
      selectableBridgingAssets,
      setMainComponent,
    ]);

    const selectableDestChains = useMemo<Chain[]>(() => {
      if (
        !fungibleCurrency ||
        !apiConfig.bridgeByAsset[fungibleCurrency.id]?.anchors
      ) {
        return [];
      }

      return Object.keys(apiConfig.bridgeByAsset[fungibleCurrency.id].anchors)
        .map((val) => {
          return chains[Number(val)];
        })
        .filter((chain): chain is Chain => !!chain);
    }, [apiConfig.bridgeByAsset, chains, fungibleCurrency]);

    // Selected destination chain
    const selectedDestChain = useMemo<InputChainType | undefined>(() => {
      if (!destChain) {
        return undefined;
      }

      return {
        name: destChain.name,
        symbol: destChain.name,
      } as InputChainType;
    }, [destChain]);

    // Callback for destination chain input clicked
    const handleDestChainClick = useCallback(() => {
      setMainComponent(
        <ChainListCardWrapper
          chainType="dest"
          onlyCategory={activeChain?.tag}
          chains={selectableDestChains.map(
            (chain) =>
              ({
                name: chain.name,
                symbol: chain.name,
                tag: chain.tag,
              } as ChainType)
          )}
          onChange={(newChain) => {
            const chain = selectableDestChains.find(
              (chain) => chain.name === newChain.name
            );

            if (chain) {
              setDestChain(chain);
            }
            setMainComponent(undefined);
          }}
        />
      );
    }, [activeChain?.tag, selectableDestChains, setMainComponent]);

    // Callback for amount input changed
    const onAmountChange = useCallback(
      (amount: string): void => {
        const parsedAmount = Number(amount);
        const availableAmount = selectedBridgingAsset?.balance ?? 0;

        if (isNaN(parsedAmount) || parsedAmount < 0) {
          setAmountError('Invalid amount');
          return;
        }

        if (parsedAmount > availableAmount) {
          setAmountError('Insufficient balance');
          return;
        }

        setTransferAmount(parsedAmount);
        setAmountError('');
      },
      [selectedBridgingAsset?.balance]
    );

    // Callback for relayer input clicked
    const handleRelayerClick = useCallback(() => {
      if (!activeApi || !activeChain) {
        return;
      }

      if (activeRelayer) {
        setRelayer(null);
        return;
      }

      const relayerList = relayers
        .map((relayer) => {
          const relayerData = relayer.capabilities.supportedChains[
            activeChain.chainType === ChainTypeEnum.EVM ? 'evm' : 'substrate'
          ].get(
            calculateTypedChainId(activeChain.chainType, activeChain.chainId)
          );

          const theme =
            activeChain.chainType === ChainTypeEnum.EVM
              ? ('ethereum' as const)
              : ('substrate' as const);

          return {
            address: relayerData?.beneficiary ?? '',
            externalUrl: relayer.endpoint,
            theme,
          };
        })
        .filter((x) => !!x);

      setMainComponent(
        <RelayerListCard
          relayers={relayerList}
          className="min-w-[550px] h-[710px]"
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

    // Boolean indicating whether the amount value is valid or not
    const isValidAmount = useMemo(() => {
      return (
        typeof transferAmount === 'number' &&
        transferAmount > 0 &&
        transferAmount <= (selectedBridgingAsset?.balance ?? 0)
      );
    }, [transferAmount, selectedBridgingAsset?.balance]);

    // The actual amount to be transferred
    const receivingAmount = useMemo(() => {
      // If no relayer selected, return the amount
      if (!activeRelayer) {
        return transferAmount;
      }

      if (!feeInWei || !transferAmount) {
        return transferAmount;
      }

      // If relayer selected, return the amount minus the relayer fee
      const fee = Number(ethers.utils.formatEther(feeInWei));
      return transferAmount - fee;
    }, [activeRelayer, transferAmount, feeInWei]);

    // Boolean indicating whether inputs are valid to transfer
    const isValidToTransfer = useMemo<boolean>(() => {
      const totalFee = Number(
        ethers.utils.formatEther(feeInWei ?? ethers.constants.Zero)
      );

      const amountOrZero = transferAmount ?? 0;

      return [
        Boolean(fungibleCurrency), // No fungible currency selected
        Boolean(destChain), // No destination chain selected
        recipientError === '', // Invalid recipient public key
        isValidAmount, // Is valid amount
        Boolean(recipientPubKey), // No recipient address
        isValidRecipient, // Valid recipient address
        activeRelayer ? amountOrZero >= totalFee : true, // Insufficient balance
      ].some((value) => value === false);
    }, [
      feeInWei,
      fungibleCurrency,
      destChain,
      recipientError,
      isValidAmount,
      recipientPubKey,
      isValidRecipient,
      activeRelayer,
      transferAmount,
    ]);

    // Calculate input notes for current amount
    const inputNotes = useMemo(() => {
      if (!fungibleCurrency) {
        return [];
      }

      return (
        NoteManager.getNotesFifo(
          availableNotes,
          ethers.utils.parseUnits(
            transferAmount?.toString() ?? '0',
            fungibleCurrency.view.decimals
          )
        ) ?? []
      );
    }, [transferAmount, availableNotes, fungibleCurrency]);

    // Calculate the info for UI display
    const infoFormatted = useMemo(() => {
      const spentValue = inputNotes.reduce<ethers.BigNumber>(
        (acc, note) => acc.add(ethers.BigNumber.from(note.note.amount)),
        ethers.BigNumber.from(0)
      );

      const changeAmountBigNumber = fungibleCurrency
        ? spentValue.sub(
            ethers.utils.parseUnits(
              transferAmount?.toString() ?? '0',
              fungibleCurrency.view.decimals
            )
          )
        : ethers.BigNumber.from(0);

      const formattedTransferAmount = isValidAmount
        ? getRoundedAmountString(receivingAmount)
        : undefined;

      const changeAmount =
        isValidAmount && fungibleCurrency
          ? getRoundedAmountString(
              Number(
                ethers.utils.formatUnits(
                  changeAmountBigNumber,
                  fungibleCurrency.view.decimals
                )
              )
            )
          : undefined;

      return {
        transferAmount: formattedTransferAmount,
        changeAmount,
        transferTokenSymbol: selectedBridgingAsset?.symbol ?? '',
        rawChangeAmount: fungibleCurrency
          ? +ethers.utils.formatUnits(
              changeAmountBigNumber,
              fungibleCurrency.getDecimals()
            )
          : 0,
      };
    }, [
      transferAmount,
      fungibleCurrency,
      inputNotes,
      isValidAmount,
      receivingAmount,
      selectedBridgingAsset?.symbol,
    ]);

    // If no relayer is selected, the fee token symbol should be native
    // otherwise, it should be the transfer token symbol
    const feeTokenSymbol = useMemo(() => {
      if (!activeRelayer) {
        return currentNativeCurrency?.symbol ?? '';
      }

      return infoFormatted?.transferTokenSymbol ?? '';
    }, [
      activeRelayer,
      currentNativeCurrency?.symbol,
      infoFormatted?.transferTokenSymbol,
    ]);

    const handleResetState = useCallback(() => {
      setDestChain(undefined);
      setAmountError('');
      setRecipientPubKey('');
      setIsValidRecipient(false);
      setTransferAmount(undefined);
      setRelayer(null);
      resetMaxFeeInfo();
    }, [resetMaxFeeInfo, setRelayer]);

    // Callback for transfer button clicked
    const handleTransferClick = useCallback(async () => {
      // Dismiss all the completed and failed txns in the queue before starting a new txn
      txQueue.txPayloads
        .filter(
          (tx) =>
            tx.txStatus.status === 'warning' ||
            tx.txStatus.status === 'completed'
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

      if (needSwitchChain) {
        await handleSwitchToOtherChains();
        return;
      }

      if (!noteManager || !activeApi?.state?.activeBridge || !api) {
        console.error('No note manager or active bridge');
        return;
      }

      if (
        !fungibleCurrency ||
        !destChain ||
        !transferAmount ||
        !currentTypedChainId
      ) {
        console.error(
          "Can't transfer without a fungible currency or dest chain"
        );
        return;
      }

      if (inputNotes.length === 0) {
        console.error('No input notes');
        return;
      }

      const changeAmount = infoFormatted.rawChangeAmount;
      const fungibleCurrencyDecimals = fungibleCurrency.getDecimals();

      const transferAmountBN = ethers.utils.parseUnits(
        transferAmount.toString(),
        fungibleCurrencyDecimals
      );

      const destTypedChainId = calculateTypedChainId(
        destChain.chainType,
        destChain.chainId
      );

      // Current user keypair
      const keypair = noteManager.getKeypair();
      if (!keypair.privkey) {
        console.error('No private key for current user');
        return;
      }

      // Setup the recipient's keypair.
      const recipientKeypair = Keypair.fromString(recipientPubKey);

      const fee = feeInWei ?? BigNumber.from(0);

      const utxoAmount = activeRelayer
        ? transferAmountBN.sub(fee)
        : transferAmountBN;

      const transferUtxo = await activeApi.generateUtxo({
        curve: noteManager.defaultNoteGenInput.curve,
        backend: activeApi.backend,
        amount: utxoAmount.toString(),
        chainId: destTypedChainId.toString(),
        keypair: recipientKeypair,
        originChainId: currentTypedChainId.toString(),
        index: activeApi.state.defaultUtxoIndex.toString(),
      });

      const changeAmountBigNumber = ethers.utils.parseUnits(
        changeAmount.toString(),
        fungibleCurrencyDecimals
      );

      const srcAddress =
        activeApi.state.activeBridge.targets[currentTypedChainId];

      let changeNote: Note | undefined;
      if (changeAmountBigNumber.gt(0)) {
        changeNote = await noteManager.generateNote(
          activeApi.backend,
          currentTypedChainId,
          srcAddress,
          currentTypedChainId,
          srcAddress,
          fungibleCurrency.view.symbol,
          fungibleCurrency.getDecimals(),
          changeAmount
        );
      }

      const changeUtxo = changeNote
        ? await utxoFromVAnchorNote(
            changeNote.note,
            changeNote.note.index ? +changeNote.note.index : undefined
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

      setMainComponent(
        <TransferConfirmContainer
          className="min-w-[550px]"
          inputNotes={inputNotes}
          amount={Number(
            ethers.utils.formatUnits(utxoAmount, fungibleCurrencyDecimals)
          )}
          feeInWei={feeInWei}
          feeToken={feeTokenSymbol}
          changeAmount={changeAmount}
          currency={fungibleCurrency}
          destChain={destChain}
          recipient={recipientPubKey}
          relayer={activeRelayer}
          note={changeNote}
          changeUtxo={changeUtxo}
          transferUtxo={transferUtxo}
          onResetState={handleResetState}
        />
      );
    }, [
      txQueue.txPayloads,
      isWalletConnected,
      hasNoteAccount,
      needSwitchChain,
      noteManager,
      activeApi,
      api,
      fungibleCurrency,
      destChain,
      transferAmount,
      currentTypedChainId,
      inputNotes,
      infoFormatted.rawChangeAmount,
      recipientPubKey,
      feeInWei,
      activeRelayer,
      setMainComponent,
      feeTokenSymbol,
      handleResetState,
      toggleModal,
      setOpenNoteAccountModal,
      handleSwitchToOtherChains,
    ]);

    const buttonText = useMemo(() => {
      if (!isWalletConnected) {
        return 'Connect wallet';
      }

      if (!hasNoteAccount) {
        return 'Create note account';
      }

      if (needSwitchChain) {
        return 'Switch chain to transfer';
      }

      return 'Transfer';
    }, [needSwitchChain, hasNoteAccount, isWalletConnected]);

    useEffect(() => {
      const updateDefaultValues = () => {
        if (defaultDestinationChain) {
          setDestChain(defaultDestinationChain);
        }

        if (defaultFungibleCurrency) {
          setFungibleCurrency(defaultFungibleCurrency);

          // Reset the amount
          setTransferAmount(undefined);

          // Reset the dest chain if needed
          if (destChain) {
            const typedChainId = calculateTypedChainId(
              destChain.chainType,
              destChain.chainId
            );

            // If the default fungible currency doesn't have the chain, reset the dest chain
            if (!defaultFungibleCurrency.hasChain(typedChainId)) {
              setDestChain(undefined);
            }
          }

          // Reset fee info
          resetMaxFeeInfo();
        }
      };

      updateDefaultValues();
    }, [
      defaultDestinationChain,
      defaultFungibleCurrency,
      destChain,
      resetMaxFeeInfo,
      setFungibleCurrency,
    ]);

    // Side effect to set the education card step
    useEffect(() => {
      if (!destChain) {
        setEducationCardStep(1);
        return;
      }

      if (!fungibleCurrency || !transferAmount) {
        setEducationCardStep(2);
        return;
      }

      if (!recipientPubKey) {
        setEducationCardStep(3);
        return;
      }

      setEducationCardStep(4);
    }, [
      destChain,
      setEducationCardStep,
      fungibleCurrency,
      transferAmount,
      recipientPubKey,
    ]);

    const isReady = useMemo(() => {
      if (!fungibleCurrency || !destChain || !activeChain) {
        return false;
      }

      if (!transferAmount || !isValidAmount) {
        return false;
      }

      if (availableAmountFromNotes < transferAmount) {
        return false;
      }

      if (!recipientPubKey || !isValidRecipient) {
        return false;
      }

      return true;
    }, [
      fungibleCurrency,
      destChain,
      activeChain,
      transferAmount,
      isValidAmount,
      availableAmountFromNotes,
      recipientPubKey,
      isValidRecipient,
    ]);

    useEffect(() => {
      if (isReady) {
        fetchFeeInfo(activeRelayer);
      }
    }, [activeRelayer, fetchFeeInfo, isReady]);

    // Transfer card props
    const bridgeAssetInputProps = useMemo(() => {
      return {
        token: selectedBridgingAsset,
        onClick: handleBridgingAssetInputClick,
      };
    }, [handleBridgingAssetInputClick, selectedBridgingAsset]);

    const destChainInputProps = useMemo(() => {
      return {
        chain: selectedDestChain,
        chainType: 'dest' as const,
        onClick: handleDestChainClick,
        info: 'Destination chain',
      };
    }, [handleDestChainClick, selectedDestChain]);

    const amountInputProps = useMemo(() => {
      return {
        amount: transferAmount ? transferAmount.toString() : undefined,
        onAmountChange,
        errorMessage: amountError,
        isDisabled: !selectedBridgingAsset || needSwitchChain,
        onMaxBtnClick: () =>
          setTransferAmount(selectedBridgingAsset?.balance ?? 0),
      };
    }, [
      transferAmount,
      onAmountChange,
      amountError,
      selectedBridgingAsset,
      needSwitchChain,
    ]);

    const relayerInputProps = useMemo(() => {
      return {
        relayerAddress: activeRelayer?.beneficiary,
        iconTheme: activeChain
          ? activeChain.chainType === ChainTypeEnum.EVM
            ? ('ethereum' as const)
            : ('substrate' as const)
          : undefined,
        onClick: handleRelayerClick,
      };
    }, [activeChain, activeRelayer?.beneficiary, handleRelayerClick]);

    const recipientInputProps = useMemo<
      TransferCardProps['recipientInputProps']
    >(() => {
      return {
        isValidSet(valid: boolean) {
          setIsValidRecipient(valid);
        },
        title: 'Recipient Public Key',
        info: <RecipientPublicKeyTooltipContent />,
        errorMessage: recipientError,
        value: recipientPubKey,
        validate: (value) => isValidPublicKey(value),
        onChange: (recipient) => {
          setRecipientPubKey(recipient);
        },
        overrideInputProps: {
          placeholder: 'Enter recipient public key',
        },
      };
    }, [recipientError, recipientPubKey]);

    const maxFeeText = useMemo(() => {
      if (isFetchingMaxFeeInfo) {
        return 'Calculating...';
      }

      if (!feeInWei) {
        return '--';
      }

      return `${getRoundedAmountString(
        Number(ethers.utils.formatEther(feeInWei)),
        3,
        Math.round
      )} ${feeTokenSymbol}`;
    }, [feeInWei, feeTokenSymbol, isFetchingMaxFeeInfo]);

    const infoItemProps = useMemo<TransferCardProps['infoItemProps']>(() => {
      const { transferTokenSymbol } = infoFormatted;

      const formatedRemainingBalance = getRoundedAmountString(
        availableAmountFromNotes - (transferAmount ?? 0),
        3,
        Math.round
      );

      return [
        {
          leftTextProps: {
            title: 'Receiving',
            info: 'Receiving',
          },
          rightContent: infoFormatted.transferAmount
            ? `${infoFormatted.transferAmount} ${transferTokenSymbol}`
            : '--',
        },
        {
          leftTextProps: {
            title: 'Remaining balance',
            info: 'Remaining balance',
          },
          rightContent: transferAmount
            ? `${formatedRemainingBalance} ${transferTokenSymbol}`
            : '--',
        },
        {
          leftTextProps: {
            title: 'Est. transaction fee',
            info: 'When your transaction gets included in the block, any difference between your max base fee and the actual base fee will be refunded. Total amount is calculated as max base fee (in GWEI) * gas limit.',
          },
          rightContent: maxFeeText,
        },
      ];
    }, [transferAmount, availableAmountFromNotes, infoFormatted, maxFeeText]);

    // Transfer button props
    const buttonDesc = useMemo(() => {
      if (!feeInWei || !transferAmount) {
        return;
      }

      const totalFee = Number(ethers.utils.formatEther(feeInWei));
      const formattedFee = getRoundedAmountString(totalFee, 3, Math.round);
      const tkSymbol = infoFormatted?.transferTokenSymbol ?? '';
      const feeText = `${formattedFee} ${tkSymbol}`.trim();

      if (activeRelayer && transferAmount < totalFee) {
        return `Insufficient funds. You need more than ${feeText} to cover the fee`;
      }

      return;
    }, [
      activeRelayer,
      transferAmount,
      feeInWei,
      infoFormatted?.transferTokenSymbol,
    ]);

    const isDisabled = useMemo(() => {
      return (
        isWalletConnected &&
        hasNoteAccount &&
        !needSwitchChain &&
        isValidToTransfer
      );
    }, [hasNoteAccount, isValidToTransfer, isWalletConnected, needSwitchChain]);

    const isLoading = useMemo(() => {
      return (
        isFetchingMaxFeeInfo ||
        loading ||
        walletState === WalletState.CONNECTING
      );
    }, [isFetchingMaxFeeInfo, loading, walletState]);

    const loadingText = useMemo(() => {
      return isFetchingMaxFeeInfo ? 'Calculating Fee...' : 'Connecting...';
    }, [isFetchingMaxFeeInfo]);

    const transferBtnProps = useMemo(() => {
      return {
        isDisabled: isDisabled,
        isLoading: isLoading,
        loadingText: loadingText,
        children: buttonText,
        onClick: handleTransferClick,
      };
    }, [buttonText, handleTransferClick, isDisabled, isLoading, loadingText]);

    return (
      <TransferCard
        ref={ref}
        className="max-w-none flex-[1]"
        bridgeAssetInputProps={bridgeAssetInputProps}
        destChainInputProps={destChainInputProps}
        amountInputProps={amountInputProps}
        relayerInputProps={relayerInputProps}
        recipientInputProps={recipientInputProps}
        transferBtnProps={transferBtnProps}
        infoItemProps={infoItemProps}
        buttonDesc={buttonDesc}
        buttonDescVariant="error"
      />
    );
  }
);
