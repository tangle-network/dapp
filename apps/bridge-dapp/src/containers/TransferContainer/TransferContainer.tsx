import { Currency } from '@webb-tools/abstract-api-provider';
import { useWebContext } from '@webb-tools/api-provider-environment';
import {
  Chain,
  chainsPopulated,
  currenciesConfig,
} from '@webb-tools/dapp-config';
import { NoteManager } from '@webb-tools/note-manager';
import {
  useBridge,
  useVAnchor,
  useNoteAccount,
  useRelayers,
} from '@webb-tools/react-hooks';
import {
  calculateTypedChainId,
  ChainType as ChainTypeEnum,
} from '@webb-tools/sdk-core';
import {
  ChainListCard,
  getRoundedAmountString,
  RelayerListCard,
  TokenListCard,
  TransferCard,
  useWebbUI,
} from '@webb-tools/webb-ui-components';
import { ChainType } from '@webb-tools/webb-ui-components/components/BridgeInputs/types';
import {
  AssetType,
  RelayerType,
} from '@webb-tools/webb-ui-components/components/ListCard/types';
import { ethers } from 'ethers';
import { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { TransferConfirmContainer } from './TransferConfirmContainer';
import {
  ChainRecord,
  CurrencyBalanceRecordType,
  CurrencyRecordWithChainsType,
  TransferContainerProps,
} from './types';
import { WalletModal } from '../../components';

export const TransferContainer = forwardRef<
  HTMLDivElement,
  TransferContainerProps
>(
  (
    { defaultDestinationChain, defaultFungibleCurrency, onTryAnotherWallet },
    ref
  ) => {
    const { fungibleCurrency, setFungibleCurrency } = useBridge();

    const { activeChain, activeApi, activeWallet, noteManager, switchChain } =
      useWebContext();

    const { setMainComponent } = useWebbUI();

    const { allNotes } = useNoteAccount();

    const { api } = useVAnchor();

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

    // State for amount input value
    const [amount, setAmount] = useState<number | undefined>(undefined);

    // State for error message when user input amount is invalid
    const [amountError, setAmountError] = useState<string>('');

    // State for the recipient address
    const [recipient, setRecipient] = useState<string>('');

    const [isValidRecipient, setIsValidRecipient] = useState(false);

    // Calculate recipient error message
    const recipientError = useMemo(() => {
      if (!recipient) {
        return '';
      }

      return recipient.length === 130 && recipient.startsWith('0x')
        ? ''
        : 'The public key must be 130 characters long and start with 0x';
    }, [recipient]);

    // Get the available currencies from notes
    const currenciyRecordFromNotes =
      useMemo<CurrencyRecordWithChainsType>(() => {
        if (!allNotes) {
          return {};
        }

        return Array.from(allNotes.values()).reduce((acc, notes) => {
          notes.forEach(({ note: { tokenSymbol, targetChainId } }) => {
            const tkSymbol = tokenSymbol;
            const currency = Object.values(currenciesConfig).find(
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
      }, [allNotes]);

    // Get balance record from notes
    const balanceRecordFromNotes = useMemo<CurrencyBalanceRecordType>(() => {
      if (!allNotes) {
        return {};
      }

      return Array.from(allNotes.values()).reduce((acc, notes) => {
        notes.forEach(
          ({ note: { tokenSymbol, targetChainId, amount, denomination } }) => {
            const tkSymbol = tokenSymbol;
            const currency = Object.values(currenciesConfig).find(
              (currency) => currency.symbol === tkSymbol
            );

            const destTypedChainId = Number(targetChainId);
            const chain = Object.values(chainsPopulated).find(
              (chain) =>
                calculateTypedChainId(chain.chainType, chain.chainId) ===
                destTypedChainId
            );

            if (!currency || !chain) {
              throw new Error(
                'Detect unsupoorted chain or currency parsed from note'
              );
            }

            if (!acc[currency.id]) {
              acc[currency.id] = {};

              acc[currency.id][destTypedChainId] = Number(
                ethers.utils.formatUnits(amount, denomination)
              );
              return;
            }

            const existedBalance = acc[currency.id][destTypedChainId];
            if (existedBalance) {
              acc[currency.id][destTypedChainId] =
                existedBalance +
                Number(ethers.utils.formatUnits(amount, denomination));
            } else {
              acc[currency.id][destTypedChainId] = Number(
                ethers.utils.formatUnits(amount, denomination)
              );
            }
          }
        );

        return acc;
      }, {} as CurrencyBalanceRecordType);
    }, [allNotes]);

    // Parse the available assets from currency record
    const bridgingAssets = useMemo((): AssetType[] => {
      return Object.values(currenciyRecordFromNotes).reduce(
        (acc, { currency }) => {
          if (!currency) {
            return acc;
          }

          let balance = undefined;

          if (destChain) {
            const destTypedChainId = calculateTypedChainId(
              destChain.chainType,
              destChain.chainId
            );
            balance = balanceRecordFromNotes[currency.id]?.[destTypedChainId];
          }

          acc.push({
            name: currency.view.name,
            symbol: currency.view.symbol,
            balance,
          });

          return acc;
        },
        [] as AssetType[]
      );
    }, [balanceRecordFromNotes, currenciyRecordFromNotes, destChain]);

    // Callback when a chain item is selected
    const handlebridgingAssetChange = useCallback(
      async (newToken: AssetType) => {
        const selecteCurrency = Object.values(currenciyRecordFromNotes).find(
          ({ currency }) => currency.view.symbol === newToken.symbol
        );
        if (selecteCurrency) {
          setFungibleCurrency(selecteCurrency.currency);
        }
      },
      [currenciyRecordFromNotes, setFungibleCurrency]
    );

    // The selected asset to display in the transfer card
    const selectedBridgingAsset = useMemo<AssetType | undefined>(() => {
      if (!fungibleCurrency) {
        return undefined;
      }

      let balance = undefined;
      if (destChain) {
        const destTypedChainId = calculateTypedChainId(
          destChain.chainType,
          destChain.chainId
        );
        balance =
          balanceRecordFromNotes[fungibleCurrency.id]?.[destTypedChainId];
      }

      return {
        symbol: fungibleCurrency.view.symbol,
        name: fungibleCurrency.view.name,
        balance,
      };
    }, [balanceRecordFromNotes, destChain, fungibleCurrency]);

    // Callback for bridging asset input click
    const handleBridgingAssetInputClick = useCallback(() => {
      setMainComponent(
        <TokenListCard
          className="w-[550px] h-[700px]"
          title="Select Asset to Transfer"
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
      return Object.values(currenciyRecordFromNotes).reduce((acc, currency) => {
        return {
          ...acc,
          ...currency.destChainRecord,
        };
      }, {} as ChainRecord);
    }, [currenciyRecordFromNotes]);

    // Get available destination chains from selected bridge asset
    const availableDestChains = useMemo<Chain[]>(() => {
      if (!selectedBridgingAsset) {
        return Object.values(allDestChains);
      }

      const currency = Object.values(currenciyRecordFromNotes).find(
        ({ currency }) =>
          currency.view.symbol === selectedBridgingAsset.symbol &&
          currency.view.name === selectedBridgingAsset.name
      );

      return currency
        ? Object.values(currency.destChainRecord)
        : Object.values(allDestChains);
    }, [selectedBridgingAsset, currenciyRecordFromNotes, allDestChains]);

    // Selected destination chain
    const selectedDestChain = useMemo<ChainType | undefined>(() => {
      if (!destChain) {
        return undefined;
      }

      return {
        name: destChain.name,
      } as ChainType;
    }, [destChain]);

    // Callback for destination chain input clicked
    const handleDestChainClick = useCallback(() => {
      setMainComponent(
        <ChainListCard
          className="w-[550px] h-[700px]"
          chainType={'dest'}
          chains={availableDestChains.map(
            (chain) =>
              ({
                name: chain.name,
              } as ChainType)
          )}
          value={selectedDestChain}
          onClose={() => setMainComponent(undefined)}
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
    }, [availableDestChains, selectedDestChain, setMainComponent]);

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

      const relayerValue = activeRelayer
        ? ({
            address: activeRelayer.beneficiary ?? '',
            externalUrl: activeRelayer.endpoint,
            theme:
              activeChain.chainType === ChainTypeEnum.EVM
                ? 'ethereum'
                : 'substrate',
          } as RelayerType)
        : undefined;

      setMainComponent(
        <RelayerListCard
          relayers={relayerList}
          value={relayerValue}
          className="w-[550px] h-[700px]"
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
        Boolean(recipient), // No recipient address
        isValidRecipient, // Valid recipient address
      ].some((value) => value === false);
    }, [
      destChain,
      fungibleCurrency,
      isValidAmount,
      recipient,
      recipientError,
      isValidRecipient,
    ]);

    // Calculate input notes for current amount
    const inputNotes = useMemo(() => {
      if (!destChain || !fungibleCurrency || !amount) {
        return [];
      }

      const destTypedChainId = calculateTypedChainId(
        destChain.chainType,
        destChain.chainId
      );

      const avaiNotes =
        allNotes
          .get(destTypedChainId.toString())
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

          setMainComponent(<WalletModal chain={destChain} sourceChains={[]} />);
        } catch (error) {
          console.error('Failed to switch chain', error);
        }
      },
      [activeChain, activeWallet, setMainComponent, switchChain]
    );

    // Callback for transfer button clicked
    const handleTransferClick = useCallback(async () => {
      if (
        !fungibleCurrency ||
        !destChain ||
        !api ||
        !noteManager ||
        !fungibleCurrency ||
        !activeApi?.state?.activeBridge ||
        !amount
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

      const sourceTypecChainId = inputNotes[0].note.sourceChainId;
      const destTypedChainId = calculateTypedChainId(
        destChain.chainType,
        destChain.chainId
      );

      const changeAmount = infoCalculated.rawChangeAmount;

      // Calculate the chain note if the change amount is greater than 0
      const changeNote =
        changeAmount > 0
          ? await noteManager
              .generateNote(
                +sourceTypecChainId,
                destTypedChainId,
                fungibleCurrency.view.symbol,
                fungibleCurrency.getDecimals(),
                changeAmount
              )
              .then((note) => note.note.serialize())
          : undefined;

      setMainComponent(
        <TransferConfirmContainer
          className="w-[550px]"
          inputNotes={inputNotes}
          amount={amount}
          changeAmount={changeAmount}
          currency={fungibleCurrency}
          destChain={destChain}
          recipient={recipient}
          relayer={activeRelayer}
          note={changeNote}
        />
      );
    }, [
      fungibleCurrency,
      destChain,
      api,
      noteManager,
      activeApi?.state?.activeBridge,
      amount,
      inputNotes,
      activeChain?.chainId,
      infoCalculated.rawChangeAmount,
      setMainComponent,
      recipient,
      activeRelayer,
      handleSwitchChain,
    ]);

    const buttonText = useMemo(() => {
      if (
        activeChain &&
        destChain &&
        activeChain.chainId !== destChain.chainId
      ) {
        return 'Switch chain to transfer';
      }

      return 'Transfer';
    }, [activeChain, destChain]);

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

    return (
      <TransferCard
        ref={ref}
        className="h-[615px]"
        bridgeAssetInputProps={{
          token: selectedBridgingAsset,
          onClick: handleBridgingAssetInputClick,
        }}
        destChainInputProps={{
          chain: selectedDestChain,
          chainType: 'dest',
          onClick: handleDestChainClick,
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
          errorMessage: recipientError,
          onChange: (recipient) => {
            setRecipient(recipient);
          },
          overrideInputProps: {
            placeholder: 'Enter recipient public key',
          },
        }}
        transferBtnProps={{
          isDisabled: isTransferButtonDisabled,
          children: buttonText,
          onClick: handleTransferClick,
        }}
        transferAmount={infoCalculated.transferAmount}
        transferToken={infoCalculated.transferTokenSymbol}
        changeAmount={infoCalculated.changeAmount}
      />
    );
  }
);
