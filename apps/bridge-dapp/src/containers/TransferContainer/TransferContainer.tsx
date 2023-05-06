import {
  Currency,
  utxoFromVAnchorNote,
} from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import {
  Chain,
  chainsPopulated,
  CurrencyConfig,
  getNativeCurrencyFromConfig,
} from '@webb-tools/dapp-config';
import { isValidPublicKey } from '@webb-tools/dapp-types';
import { NoteManager } from '@webb-tools/note-manager';
import {
  useBalancesFromNotes,
  useBridge,
  useNoteAccount,
  useRelayers,
  useTxQueue,
  useVAnchor,
} from '@webb-tools/react-hooks';
import {
  calculateTypedChainId,
  ChainType as ChainTypeEnum,
  Keypair,
  Note,
  ResourceId,
  Utxo,
} from '@webb-tools/sdk-core';
import {
  getRoundedAmountString,
  RelayerListCard,
  TokenListCard,
  TransferCard,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { ChainType as InputChainType } from '@webb-tools/webb-ui-components/components/BridgeInputs/types';
import {
  AssetType,
  ChainType,
  RelayerType,
} from '@webb-tools/webb-ui-components/components/ListCard/types';
import { TransferCardProps } from '@webb-tools/webb-ui-components/containers/TransferCard/types';
import { BigNumber, ethers } from 'ethers';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { ChainListCardWrapper } from '../../components';
import {
  useAddCurrency,
  useConnectWallet,
  useMaxFeeInfo,
  WalletState,
} from '../../hooks';
import { useEducationCardStep } from '../../hooks/useEducationCardStep';
import { TransferConfirmContainer } from './TransferConfirmContainer';
import {
  ChainRecord,
  CurrencyRecordWithChainsType,
  TransferContainerProps,
} from './types';

export const TransferContainer = forwardRef<
  HTMLDivElement,
  TransferContainerProps
>(
  (
    { defaultDestinationChain, defaultFungibleCurrency, onTryAnotherWallet },
    ref
  ) => {
    const { fungibleCurrency, setFungibleCurrency } = useBridge();

    const {
      activeApi,
      activeChain,
      activeWallet,
      apiConfig,
      loading,
      noteManager,
      switchChain,
    } = useWebContext();

    const { setMainComponent } = useWebbUI();

    const { allNotes, hasNoteAccount, setOpenNoteAccountModal } =
      useNoteAccount();

    const { api } = useVAnchor();

    const txQueue = useTxQueue();

    const { isWalletConnected, toggleModal, walletState } = useConnectWallet();

    // Get the current preset type chain id from the active chain
    const currentTypedChainId = useMemo(() => {
      if (!activeChain) {
        return undefined;
      }
      return calculateTypedChainId(activeChain.chainType, activeChain.chainId);
    }, [activeChain]);

    // Given the user inputs above, fetch relayers state
    const {
      relayersState: { activeRelayer, relayers },
      setRelayer,
    } = useRelayers({
      typedChainId: currentTypedChainId,
      target:
        activeApi?.state.activeBridge && currentTypedChainId
          ? activeApi.state.activeBridge.targets[currentTypedChainId]
          : undefined,
    });

    // The destination chains
    const [destChain, setDestChain] = useState<Chain | undefined>(
      defaultDestinationChain
    );

    const balancesFromNotes = useBalancesFromNotes(destChain);

    // State for amount input value
    const [amount, setAmount] = useState<number | undefined>(undefined);

    // State for error message when user input amount is invalid
    const [amountError, setAmountError] = useState<string>('');

    // State for the recipient public key
    const [recipientPubKey, setRecipientPubKey] = useState<string>('');

    const [isValidRecipient, setIsValidRecipient] = useState(false);

    const { setEducationCardStep } = useEducationCardStep();

    const addCurrency = useAddCurrency();

    const maxFeeArgs = useMemo(
      () => ({
        fungibleCurrencyId: fungibleCurrency?.id,
      }),
      [fungibleCurrency?.id]
    );

    const {
      feeInfo,
      fetchMaxFeeInfo,
      fetchMaxFeeInfoFromRelayer,
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

    // Get the available currencies from notes
    const currencyRecordFromNotes =
      useMemo<CurrencyRecordWithChainsType>(() => {
        if (!allNotes) {
          return {};
        }

        return Array.from(allNotes.values()).reduce((acc, notes) => {
          notes.forEach(({ note: { tokenSymbol, targetChainId } }) => {
            const tkSymbol = tokenSymbol;
            const currency = Object.values(apiConfig.currencies).find(
              (currency) => currency.symbol === tkSymbol
            );

            if (!currency) {
              return;
            }

            // Calculate destination chain
            const destTypedChainId = Number(targetChainId);
            const detsChain = Object.values(chainsPopulated).find(
              (chain) =>
                calculateTypedChainId(chain.chainType, chain.chainId) ===
                destTypedChainId
            );

            if (!detsChain) {
              throw new Error('Detect unsupoorted chain parsed from note');
            }

            const existedCurrency = acc[currency.id];

            if (!existedCurrency) {
              const destChainRecord: ChainRecord = {};

              if (detsChain) {
                destChainRecord[destTypedChainId] = detsChain;
              }

              acc[currency.id] = {
                currency: new Currency(currency),
                destChainRecord,
              };

              return;
            }

            const existedDestChain =
              existedCurrency.destChainRecord[destTypedChainId];
            if (!existedDestChain) {
              acc[existedCurrency.currency.id].destChainRecord[
                destTypedChainId
              ] = detsChain;
            }
          });

          return acc;
        }, {} as CurrencyRecordWithChainsType);
      }, [allNotes, apiConfig.currencies]);

    // Callback when a chain item is selected
    const handlebridgingAssetChange = useCallback(
      async (newToken: AssetType) => {
        const selecteCurrency = Object.values(currencyRecordFromNotes).find(
          ({ currency }) => currency.view.symbol === newToken.symbol
        );
        if (selecteCurrency) {
          setFungibleCurrency(selecteCurrency.currency);
        }
      },
      [currencyRecordFromNotes, setFungibleCurrency]
    );

    // The selected asset to display in the transfer card
    const selectedBridgingAsset = useMemo<AssetType | undefined>(() => {
      if (!fungibleCurrency) {
        return undefined;
      }

      const balance = balancesFromNotes[fungibleCurrency.id];

      return {
        symbol: fungibleCurrency.view.symbol,
        name: fungibleCurrency.view.name,
        balance,
        onTokenClick: () => addCurrency(fungibleCurrency),
        balanceType: 'note',
      };
    }, [addCurrency, balancesFromNotes, fungibleCurrency]);

    const selectableBridgingAssets = useMemo<AssetType[]>(() => {
      if (!activeApi) {
        return [];
      }

      const currencies = Object.values(currencyRecordFromNotes);
      const supportedCurrencyIds = Object.keys(
        activeApi.state.getBridgeOptions()
      );

      return currencies.reduce((acc, { currency }) => {
        if (!currency) {
          return acc;
        }

        if (!supportedCurrencyIds.includes(currency.id.toString())) {
          return acc;
        }

        const balance = balancesFromNotes[currency.id];

        acc.push({
          name: currency.view.name,
          symbol: currency.view.symbol,
          balance,
          onTokenClick: () => addCurrency(currency),
        });

        return acc;
      }, [] as AssetType[]);
    }, [activeApi, addCurrency, balancesFromNotes, currencyRecordFromNotes]);

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
          className="min-w-[550px] h-[710px]"
          title="Select a token to Transfer"
          popularTokens={[]}
          selectTokens={selectableBridgingAssets}
          unavailableTokens={unavailableTokens}
          onChange={(newAsset) => {
            handlebridgingAssetChange(newAsset);
            setMainComponent(undefined);
          }}
          onClose={() => setMainComponent(undefined)}
          onConnect={onTryAnotherWallet}
        />
      );
    }, [
      apiConfig,
      handlebridgingAssetChange,
      onTryAnotherWallet,
      selectableBridgingAssets,
      setMainComponent,
    ]);

    // Get all destination chains
    const allDestChains = useMemo<ChainRecord>(() => {
      return Object.values(currencyRecordFromNotes).reduce((acc, currency) => {
        return {
          ...acc,
          ...currency.destChainRecord,
        };
      }, {} as ChainRecord);
    }, [currencyRecordFromNotes]);

    // Get available destination chains from selected bridge asset
    const availableDestChains = useMemo<Chain[]>(() => {
      if (!selectedBridgingAsset) {
        return Object.values(allDestChains);
      }

      const currency = Object.values(currencyRecordFromNotes).find(
        ({ currency }) =>
          currency.view.symbol === selectedBridgingAsset.symbol &&
          currency.view.name === selectedBridgingAsset.name
      );

      return currency
        ? Object.values(currency.destChainRecord)
        : Object.values(allDestChains);
    }, [selectedBridgingAsset, currencyRecordFromNotes, allDestChains]);

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
          chains={availableDestChains.map(
            (chain) =>
              ({
                name: chain.name,
                symbol: chain.name,
                tag: chain.tag,
              } as ChainType)
          )}
          onChange={(newChain) => {
            const chain = availableDestChains.find(
              (chain) => chain.name === newChain.name
            );

            if (chain) {
              setDestChain(chain);
            }
            setMainComponent(undefined);
          }}
        />
      );
    }, [activeChain?.tag, availableDestChains, setMainComponent]);

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

        setAmount(parsedAmount);
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

          if (!relayerData?.beneficiary) {
            return undefined;
          }

          const theme: RelayerType['theme'] =
            activeChain.chainType === ChainTypeEnum.EVM
              ? ('ethereum' as const)
              : ('substrate' as const);

          const r: RelayerType = {
            address: relayerData?.beneficiary ?? '',
            externalUrl: relayer.endpoint,
            theme,
          };

          return r;
        })
        .filter((r): r is RelayerType => !!r);

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
        typeof amount === 'number' &&
        amount > 0 &&
        amount <= (selectedBridgingAsset?.balance ?? 0)
      );
    }, [amount, selectedBridgingAsset?.balance]);

    // The actual amount to be transferred
    const receivingAmount = useMemo(() => {
      // If no relayer selected, return the amount
      if (!activeRelayer) {
        return amount;
      }

      if (!feeInWei || !amount) {
        return amount;
      }

      // If relayer selected, return the amount minus the relayer fee
      const fee = Number(ethers.utils.formatEther(feeInWei));
      return amount - fee;
    }, [activeRelayer, amount, feeInWei]);

    // Boolean indicating whether inputs are valid to transfer
    const isValidToTransfer = useMemo<boolean>(() => {
      return [
        Boolean(fungibleCurrency), // No fungible currency selected
        Boolean(destChain), // No destination chain selected
        recipientError === '', // Invalid recipient public key
        isValidAmount, // Is valid amount
        Boolean(recipientPubKey), // No recipient address
        isValidRecipient, // Valid recipient address
      ].some((value) => value === false);
    }, [
      destChain,
      fungibleCurrency,
      isValidAmount,
      recipientPubKey,
      recipientError,
      isValidRecipient,
    ]);

    // All available notes
    const availableNotes = useMemo(() => {
      if (!destChain || !fungibleCurrency) {
        return [];
      }

      const typedChainId = calculateTypedChainId(
        destChain.chainType,
        destChain.chainId
      );
      const vanchorAddr = apiConfig.getAnchorAddress(
        fungibleCurrency.id,
        typedChainId
      );
      if (!vanchorAddr) {
        console.error('No anchor address found for chain', typedChainId);
        return [];
      }

      const resourceId = new ResourceId(
        vanchorAddr,
        destChain.chainType,
        destChain.chainId
      );

      return (
        allNotes
          .get(resourceId.toString())
          ?.filter(
            (note) => note.note.tokenSymbol === fungibleCurrency.view.symbol
          ) ?? []
      );
    }, [allNotes, apiConfig, destChain, fungibleCurrency]);

    // Calculate input notes for current amount
    const inputNotes = useMemo(() => {
      if (!fungibleCurrency) {
        return [];
      }

      return (
        NoteManager.getNotesFifo(
          availableNotes,
          ethers.utils.parseUnits(
            amount?.toString() ?? '0',
            fungibleCurrency.view.decimals
          )
        ) ?? []
      );
    }, [amount, availableNotes, fungibleCurrency]);

    // Calculate the info for UI display
    const infoCalculated = useMemo(() => {
      const spentValue = inputNotes.reduce<ethers.BigNumber>(
        (acc, note) => acc.add(ethers.BigNumber.from(note.note.amount)),
        ethers.BigNumber.from(0)
      );

      const changeAmountBigNumber = fungibleCurrency
        ? spentValue.sub(
            ethers.utils.parseUnits(
              amount?.toString() ?? '0',
              fungibleCurrency.view.decimals
            )
          )
        : ethers.BigNumber.from(0);

      const transferAmount = isValidAmount
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
        transferAmount,
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
      amount,
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

      return infoCalculated?.transferTokenSymbol ?? '';
    }, [
      activeRelayer,
      currentNativeCurrency?.symbol,
      infoCalculated?.transferTokenSymbol,
    ]);

    const handleSwitchChain = useCallback(
      async (destChain: Chain) => {
        if (!activeChain) {
          console.error('No active chain when handleSwitchChain called');
          return;
        }

        if (destChain.chainId === activeChain.chainId) {
          console.error('Same chain when handleSwitchChain called');
          return;
        }

        const isSupported =
          activeWallet &&
          activeWallet.supportedChainIds.includes(
            calculateTypedChainId(destChain.chainType, destChain.chainId)
          );

        try {
          if (isSupported) {
            await switchChain(destChain, activeWallet);
            return;
          }

          toggleModal(true, destChain);
        } catch (error) {
          console.error('Failed to switch chain', error);
        }
      },
      [activeChain, activeWallet, switchChain, toggleModal]
    );

    const handleResetState = useCallback(() => {
      setDestChain(undefined);
      setAmountError('');
      setRecipientPubKey('');
      setIsValidRecipient(false);
      setAmount(undefined);
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

      if (!noteManager || !activeApi?.state?.activeBridge || !api) {
        throw new Error('No note manager or active bridge');
      }

      if (!fungibleCurrency || !destChain || !amount || !currentTypedChainId) {
        throw new Error(
          "Can't transfer without a fungible currency or dest chain"
        );
      }

      if (inputNotes.length === 0) {
        throw new Error('No input notes');
      }

      if (destChain.chainId !== activeChain?.chainId) {
        await handleSwitchChain(destChain);
        return;
      }

      const changeAmount = infoCalculated.rawChangeAmount;
      const fungibleCurrencyDecimals = fungibleCurrency.getDecimals();

      const amountBigNumber = ethers.utils.parseUnits(
        amount.toString(),
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
        ? amountBigNumber.sub(fee)
        : amountBigNumber;

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
      noteManager,
      activeApi,
      api,
      fungibleCurrency,
      destChain,
      amount,
      currentTypedChainId,
      inputNotes,
      activeChain?.chainId,
      infoCalculated.rawChangeAmount,
      recipientPubKey,
      feeInWei,
      activeRelayer,
      setMainComponent,
      feeTokenSymbol,
      handleResetState,
      toggleModal,
      setOpenNoteAccountModal,
      handleSwitchChain,
    ]);

    const buttonText = useMemo(() => {
      if (!isWalletConnected) {
        return 'Connect wallet';
      }

      if (!hasNoteAccount) {
        return 'Create note account';
      }

      if (
        activeChain &&
        destChain &&
        activeChain.chainId !== destChain.chainId
      ) {
        return 'Switch chain to transfer';
      }

      return 'Transfer';
    }, [activeChain, destChain, hasNoteAccount, isWalletConnected]);

    useEffect(() => {
      const updateDefaultValues = () => {
        if (defaultDestinationChain) {
          setDestChain(defaultDestinationChain);
        }

        if (defaultFungibleCurrency) {
          setFungibleCurrency(defaultFungibleCurrency);
        }
      };

      updateDefaultValues();
    }, [defaultDestinationChain, defaultFungibleCurrency, setFungibleCurrency]);

    // Side effect to set the education card step
    useEffect(() => {
      if (!destChain) {
        setEducationCardStep(1);
        return;
      }

      if (!fungibleCurrency || !amount) {
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
      amount,
      recipientPubKey,
    ]);

    const isReady = useMemo(() => {
      if (!fungibleCurrency || !destChain || !activeChain) {
        return false;
      }

      if (!amount || !isValidAmount) {
        return false;
      }

      if (balancesFromNotes[fungibleCurrency.id] < amount) {
        return false;
      }

      const destTypedChainId = calculateTypedChainId(
        destChain.chainType,
        destChain.chainId
      );

      const currentTypedChainId = calculateTypedChainId(
        activeChain.chainType,
        activeChain.chainId
      );

      if (destTypedChainId !== currentTypedChainId) {
        return false;
      }

      if (!recipientPubKey || !isValidRecipient) {
        return false;
      }

      return true;
    }, [
      activeChain,
      amount,
      balancesFromNotes,
      destChain,
      fungibleCurrency,
      isValidAmount,
      isValidRecipient,
      recipientPubKey,
    ]);

    useEffect(() => {
      if (isReady) {
        if (activeRelayer) {
          fetchMaxFeeInfoFromRelayer(activeRelayer);
        } else {
          fetchMaxFeeInfo();
        }
      }
    }, [activeRelayer, fetchMaxFeeInfo, fetchMaxFeeInfoFromRelayer, isReady]);

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
        amount: amount ? amount.toString() : undefined,
        onAmountChange,
        errorMessage: amountError,
        isDisabled: !selectedBridgingAsset || !destChain,
        onMaxBtnClick: () => setAmount(selectedBridgingAsset?.balance ?? 0),
      };
    }, [amount, amountError, destChain, onAmountChange, selectedBridgingAsset]);

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
        info: 'Public key of the recipient',
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
      const total = availableNotes.reduce((acc, note) => {
        const formated = Number(
          ethers.utils.formatUnits(note.note.amount, note.note.denomination)
        );

        return acc + formated;
      }, 0);

      const { transferAmount, transferTokenSymbol } = infoCalculated;

      const formatedRemainingBalance = getRoundedAmountString(
        total - (amount ?? 0),
        3,
        Math.round
      );

      return [
        {
          leftTextProps: {
            title: 'Receiving',
            info: 'Receiving',
          },
          rightContent: transferAmount
            ? `${transferAmount} ${transferTokenSymbol}`
            : '--',
        },
        {
          leftTextProps: {
            title: 'Remaining balance',
            info: 'Remaining balance',
          },
          rightContent: amount
            ? `${formatedRemainingBalance} ${transferTokenSymbol}`
            : '--',
        },
        {
          leftTextProps: {
            title: 'Max fee',
          },
          rightContent: maxFeeText,
        },
      ];
    }, [amount, availableNotes, infoCalculated, maxFeeText]);

    // Transfer button props
    const buttonDesc = useMemo(() => {
      if (!feeInWei || !amount) {
        return;
      }

      const totalFee = Number(ethers.utils.formatEther(feeInWei));
      const formattedFee = getRoundedAmountString(totalFee, 3, Math.round);
      const tkSymbol = infoCalculated?.transferTokenSymbol ?? '';
      const feeText = `${formattedFee} ${tkSymbol}`.trim();

      if (amount < totalFee) {
        return `Insufficient funds. You need more than ${feeText} to cover the fee`;
      }

      return;
    }, [amount, feeInWei, infoCalculated?.transferTokenSymbol]);

    const isDisabled = useMemo(() => {
      return isWalletConnected && hasNoteAccount && isValidToTransfer;
    }, [hasNoteAccount, isValidToTransfer, isWalletConnected]);

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
        className="max-w-none"
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
