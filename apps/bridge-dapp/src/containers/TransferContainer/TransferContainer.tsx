import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import {
  Chain,
  chainsPopulated,
  getLatestAnchorAddress,
  getNativeCurrencyFromConfig,
} from '@webb-tools/dapp-config';
import { NoteManager } from '@webb-tools/note-manager';
import {
  useBalancesFromNotes,
  useBridge,
  useCurrentResourceId,
  useNoteAccount,
  useRelayers,
  useTxQueue,
  useVAnchor,
} from '@webb-tools/react-hooks';
import {
  ChainType as ChainTypeEnum,
  CircomUtxo,
  Keypair,
  Note,
  calculateTypedChainId,
  toFixedHex,
  ResourceId,
} from '@webb-tools/sdk-core';
import {
  RelayerListCard,
  TokenListCard,
  TransferCard,
  getRoundedAmountString,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import {
  AssetType,
  ChainType,
} from '@webb-tools/webb-ui-components/components/ListCard/types';
import { ChainType as InputChainType } from '@webb-tools/webb-ui-components/components/BridgeInputs/types';
import { BigNumber, ethers } from 'ethers';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { ChainListCardWrapper } from '../../components';
import {
  WalletState,
  useAddCurrency,
  useConnectWallet,
  useMaxFeeInfo,
} from '../../hooks';
import { TransferConfirmContainer } from './TransferConfirmContainer';
import {
  ChainRecord,
  CurrencyBalanceRecordType,
  CurrencyRecordWithChainsType,
  TransferContainerProps,
} from './types';
import { useEducationCardStep } from '../../hooks/useEducationCardStep';

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

    const {
      feeInfo,
      fetchMaxFeeInfo,
      isLoading: isFetchingMaxFeeInfo,
    } = useMaxFeeInfo();

    const feeValue = useMemo<string | undefined>(() => {
      if (!feeInfo) {
        return undefined;
      }

      if (!(feeInfo instanceof BigNumber)) {
        console.error('Fee info is not a BigNumber instance');
        return undefined;
      }

      return ethers.utils.formatEther(feeInfo);
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

    // Parse the available assets from currency record
    const bridgingAssets = useMemo((): AssetType[] => {
      return Object.values(currencyRecordFromNotes).reduce(
        (acc, { currency }) => {
          if (!currency) {
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
        },
        [] as AssetType[]
      );
    }, [addCurrency, balancesFromNotes, currencyRecordFromNotes]);

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

    // Callback for bridging asset input click
    const handleBridgingAssetInputClick = useCallback(() => {
      setMainComponent(
        <TokenListCard
          className="min-w-[550px] h-[700px]"
          title="Select a token to Transfer"
          popularTokens={[]}
          selectTokens={bridgingAssets}
          unavailableTokens={[]}
          onChange={(newAsset) => {
            handlebridgingAssetChange(newAsset);
            setMainComponent(undefined);
          }}
          onClose={() => setMainComponent(undefined)}
          onConnect={onTryAnotherWallet}
        />
      );
    }, [
      bridgingAssets,
      handlebridgingAssetChange,
      onTryAnotherWallet,
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
          className="min-w-[550px] h-[700px]"
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

    // Boolean state for whether the transfer button is disabled
    const isTransferButtonDisabled = useMemo<boolean>(() => {
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

    // Calculate input notes for current amount
    const inputNotes = useMemo(() => {
      if (!destChain || !fungibleCurrency || !amount) {
        return [];
      }

      const typedChainId = calculateTypedChainId(
        destChain.chainType,
        destChain.chainId
      );
      const vanchorAddr = getLatestAnchorAddress(typedChainId);
      if (!vanchorAddr) {
        console.error('No anchor address found for chain', typedChainId);
        return [];
      }
      const resourceId = new ResourceId(
        vanchorAddr,
        destChain.chainType,
        destChain.chainId
      );

      const avaiNotes =
        allNotes
          .get(resourceId.toString())
          ?.filter(
            (note) => note.note.tokenSymbol === fungibleCurrency.view.symbol
          ) ?? [];

      return (
        NoteManager.getNotesFifo(
          avaiNotes,
          ethers.utils.parseUnits(
            amount.toString(),
            fungibleCurrency.view.decimals
          )
        ) ?? []
      );
    }, [allNotes, amount, destChain, fungibleCurrency]);

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
        ? getRoundedAmountString(amount)
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
        transferTokenSymbol: selectedBridgingAsset?.symbol,
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
      selectedBridgingAsset?.symbol,
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
    }, [setRelayer]);

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

      if (
        !fungibleCurrency ||
        !destChain ||
        !api ||
        !noteManager ||
        !activeApi?.state?.activeBridge ||
        !amount ||
        !currentTypedChainId
      ) {
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

      const transferUtxo = await CircomUtxo.generateUtxo({
        curve: 'Bn254',
        backend: 'Circom',
        amount: amountBigNumber.toString(),
        chainId: destTypedChainId.toString(),
        keypair: recipientKeypair,
        originChainId: currentTypedChainId.toString(),
      });

      const changeAmountBigNumber = ethers.utils.parseUnits(
        changeAmount.toString(),
        fungibleCurrencyDecimals
      );

      const changeUtxo = await CircomUtxo.generateUtxo({
        curve: 'Bn254',
        backend: 'Circom',
        amount: changeAmountBigNumber.toString(),
        chainId: currentTypedChainId.toString(),
        keypair,
        originChainId: currentTypedChainId.toString(),
      });

      const srcAddress =
        activeApi.state.activeBridge.targets[currentTypedChainId];

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
            toFixedHex('0x' + changeUtxo.blinding).substring(2),
          ].join(':'),
          sourceChain: currentTypedChainId.toString(),
          sourceIdentifyingData: srcAddress,
          targetChain: currentTypedChainId.toString(),
          targetIdentifyingData: srcAddress,
          tokenSymbol: inputNotes[0].note.tokenSymbol,
          version: 'v1',
          width: '4',
        });
      }

      setMainComponent(
        <TransferConfirmContainer
          className="min-w-[550px]"
          inputNotes={inputNotes}
          amount={amount}
          feeAmount={feeValue}
          feeToken={currentNativeCurrency?.symbol}
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
      fungibleCurrency,
      destChain,
      api,
      noteManager,
      activeApi?.state.activeBridge,
      amount,
      currentTypedChainId,
      inputNotes,
      activeChain?.chainId,
      infoCalculated.rawChangeAmount,
      recipientPubKey,
      setMainComponent,
      feeValue,
      currentNativeCurrency?.symbol,
      activeRelayer,
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

    const isReadyToFetchMaxFee = useMemo(() => {
      if (!fungibleCurrency || !amount || !destChain || !activeChain) {
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
      isValidRecipient,
      recipientPubKey,
    ]);

    useEffect(() => {
      if (isReadyToFetchMaxFee) {
        fetchMaxFeeInfo();
      }
    }, [fetchMaxFeeInfo, isReadyToFetchMaxFee]);

    return (
      <TransferCard
        ref={ref}
        className="max-w-none h-[628px]"
        bridgeAssetInputProps={{
          token: selectedBridgingAsset,
          onClick: handleBridgingAssetInputClick,
        }}
        destChainInputProps={{
          chain: selectedDestChain,
          chainType: 'dest',
          onClick: handleDestChainClick,
          info: 'Destination chain',
        }}
        amountInputProps={{
          amount: amount ? amount.toString() : undefined,
          onAmountChange,
          errorMessage: amountError,
          isDisabled: !selectedBridgingAsset || !destChain,
          onMaxBtnClick: () => setAmount(selectedBridgingAsset?.balance ?? 0),
        }}
        relayerInputProps={{
          relayerAddress: activeRelayer?.beneficiary,
          iconTheme: activeChain
            ? activeChain.chainType === ChainTypeEnum.EVM
              ? 'ethereum'
              : 'substrate'
            : undefined,
          onClick: handleRelayerClick,
        }}
        recipientInputProps={{
          isValidSet(valid: boolean) {
            setIsValidRecipient(valid);
          },
          title: 'Recipient Public Key',
          info: 'Public key of the recipient',
          errorMessage: recipientError,
          value: recipientPubKey,
          onChange: (recipient) => {
            setRecipientPubKey(recipient);
          },
          overrideInputProps: {
            placeholder: 'Enter recipient public key',
          },
        }}
        transferBtnProps={{
          isDisabled:
            isWalletConnected && hasNoteAccount && isTransferButtonDisabled,
          isLoading:
            isFetchingMaxFeeInfo ||
            loading ||
            walletState === WalletState.CONNECTING,
          loadingText: isFetchingMaxFeeInfo
            ? 'Calculating Fee...'
            : 'Connecting...',
          children: buttonText,
          onClick: handleTransferClick,
        }}
        feeAmount={feeValue}
        feeToken={currentNativeCurrency?.symbol}
        transferAmount={infoCalculated.transferAmount}
        transferToken={infoCalculated.transferTokenSymbol}
        changeAmount={infoCalculated.changeAmount}
      />
    );
  }
);
