import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { useConnectWallet } from '@webb-tools/api-provider-environment/ConnectWallet';
import { useActiveAccount } from '@webb-tools/api-provider-environment/hooks/useActiveAccount';
import { useActiveChain } from '@webb-tools/api-provider-environment/hooks/useActiveChain';
import { useActiveWallet } from '@webb-tools/api-provider-environment/hooks/useActiveWallet';
import { makeExplorerUrl } from '@webb-tools/api-provider-environment/transaction/utils';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import { PresetTypedChainId } from '@webb-tools/dapp-types';
import { useShallow } from 'zustand/react/shallow';
import {
  EVMTokenBridgeEnum,
  EVMTokenEnum,
} from '@webb-tools/evm-contract-metadata';
import { calculateTypedChainId } from '@webb-tools/dapp-types/TypedChainId';
import {
  AmountFormatStyle,
  assertEvmAddress,
  Button,
  Card,
  ChainOrTokenButton,
  EMPTY_VALUE_PLACEHOLDER,
  formatDisplayAmount,
  Label,
  Modal,
  ModalContent,
  Typography,
  useModal,
} from '@webb-tools/webb-ui-components';
import { Decimal } from 'decimal.js';
import { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { formatEther } from 'viem';

import AddressInput from '../../components/AddressInput';
import { AddressType } from '../../constants';
import AmountInput from '../../components/AmountInput';
import { BridgeConfirmationModal } from '../../components/bridge/BridgeConfirmationModal';
import { FeeDetail, FeeDetailProps } from '../../components/bridge/FeeDetail';
import { AssetConfig, AssetList } from '../../components/Lists/AssetList';
import { ChainList } from '../../components/Lists/ChainList';
import useBridgeStore from '../../context/bridge/useBridgeStore';
import useBalances from '../../data/balances/useBalances';
import { BridgeTokenWithBalance } from '@webb-tools/tangle-shared-ui/types';
import useRouterQuote, {
  RouterQuoteParams,
} from '../../data/bridge/useRouterQuote';
import {
  HyperlaneQuoteProps,
  useHyperlaneQuote,
} from '../../data/bridge/useHyperlaneQuote';
import { RouterTransferProps } from '../../data/bridge/useRouterTransfer';
import ErrorMessage from '../../components/ErrorMessage';
import { WalletFillIcon } from '@webb-tools/icons';
import { useBalance } from 'wagmi';
import { useBridgeEvmBalances } from '../../data/bridge/useBridgeEvmBalances';
import { ROUTER_NATIVE_TOKEN_ADDRESS } from '@webb-tools/tangle-shared-ui/constants/bridge';
import useIsBridgeNativeToken from '../../hooks/useIsBridgeNativeToken';
import { BN, BN_ZERO } from '@polkadot/util';
import convertDecimalToBN from '@webb-tools/tangle-shared-ui/utils/convertDecimalToBn';

type Props = {
  className?: string;
};

const BridgeContainer = ({ className }: Props) => {
  const { switchChain } = useWebContext();
  const [activeChain] = useActiveChain();
  const [activeAccount] = useActiveAccount();
  const { transferable: balance } = useBalances();
  const [activeWallet] = useActiveWallet();
  const { toggleModal: toggleConnectWalletModal } = useConnectWallet();
  const [isTxInProgress, setIsTxInProgress] = useState(false);

  const sourceChains = useBridgeStore(
    useShallow((store) => store.sourceChains),
  );

  const destinationChains = useBridgeStore(
    useShallow((store) => store.destinationChains),
  );

  const selectedSourceChain = useBridgeStore(
    useShallow((store) => store.selectedSourceChain),
  );

  const setSelectedSourceChain = useBridgeStore(
    (store) => store.setSelectedSourceChain,
  );

  const selectedDestinationChain = useBridgeStore(
    useShallow((store) => store.selectedDestinationChain),
  );

  const setSelectedDestinationChain = useBridgeStore(
    (store) => store.setSelectedDestinationChain,
  );

  const sourceTypedChainId = useMemo(() => {
    return calculateTypedChainId(
      selectedSourceChain.chainType,
      selectedSourceChain.id,
    );
  }, [selectedSourceChain]);

  const destinationTypedChainId = useMemo(() => {
    return calculateTypedChainId(
      selectedDestinationChain.chainType,
      selectedDestinationChain.id,
    );
  }, [selectedDestinationChain]);

  const tokens = useBridgeStore(useShallow((store) => store.tokens));

  const selectedToken = useBridgeStore(
    useShallow((store) => store.selectedToken),
  );

  const setSelectedToken = useBridgeStore((store) => store.setSelectedToken);
  const amount = useBridgeStore(useShallow((store) => store.amount));
  const setAmount = useBridgeStore(useShallow((store) => store.setAmount));

  const { data: nativeTokenBalance } = useBalance({
    address: activeAccount?.address as `0x${string}`,
    chainId: selectedSourceChain.id,
    query: {
      enabled: activeAccount !== null,
    },
  });

  const { balances, refresh: refreshEvmBalances } = useBridgeEvmBalances(
    sourceTypedChainId,
    destinationTypedChainId,
  );

  const isAmountInputError = useBridgeStore(
    (store) => store.isAmountInputError,
  );

  const setIsAmountInputError = useBridgeStore(
    (store) => store.setIsAmountInputError,
  );

  const amountInputErrorMessage = useBridgeStore(
    (store) => store.amountInputErrorMessage,
  );

  const destinationAddress = useBridgeStore(
    (store) => store.destinationAddress,
  );

  const setDestinationAddress = useBridgeStore(
    (store) => store.setDestinationAddress,
  );

  const isAddressInputError = useBridgeStore(
    (store) => store.isAddressInputError,
  );

  const setIsAddressInputError = useBridgeStore(
    (store) => store.setIsAddressInputError,
  );

  const setSendingAmount = useBridgeStore((store) => store.setSendingAmount);

  const setReceivingAmount = useBridgeStore(
    (store) => store.setReceivingAmount,
  );

  const {
    status: isSourceChainModalOpen,
    open: openSourceChainModal,
    close: closeSourceChainModal,
    update: updateSourceChainModal,
  } = useModal(false);

  const {
    status: isDestinationChainModalOpen,
    open: openDestinationChainModal,
    close: closeDestinationChainModal,
    update: updateDestinationChainModal,
  } = useModal(false);

  const {
    status: isTokenModalOpen,
    open: openTokenModal,
    close: closeTokenModal,
    update: updateTokenModal,
  } = useModal(false);

  const {
    status: isConfirmBridgeModalOpen,
    open: openConfirmBridgeModal,
    close: closeConfirmBridgeModal,
  } = useModal(false);

  const isNativeToken = useIsBridgeNativeToken(
    calculateTypedChainId(
      selectedSourceChain.chainType,
      selectedSourceChain.id,
    ),
    selectedToken,
  );

  const [addressInputErrorMessage, setAddressInputErrorMessage] = useState<
    string | null
  >(null);

  const isSolanaDestination = selectedDestinationChain.name === 'Solana';

  const routerQuoteParams: RouterQuoteParams | null = useMemo(() => {
    if (!amount) {
      return null;
    }

    const fromTokenAddress =
      sourceTypedChainId === PresetTypedChainId.TangleMainnetEVM
        ? ROUTER_NATIVE_TOKEN_ADDRESS
        : selectedToken.address;

    const toTokenAddress =
      destinationTypedChainId === PresetTypedChainId.TangleMainnetEVM
        ? ROUTER_NATIVE_TOKEN_ADDRESS
        : selectedToken.address;

    const toTokenChainId = isSolanaDestination
      ? 'solana'
      : selectedDestinationChain.id.toString();

    const routerQuoteParams = {
      fromTokenAddress,
      toTokenAddress,
      amountInWei: amount.toString(),
      fromTokenChainId: selectedSourceChain.id.toString(),
      toTokenChainId,
    };

    return routerQuoteParams;
  }, [
    amount,
    sourceTypedChainId,
    selectedToken.address,
    destinationTypedChainId,
    isSolanaDestination,
    selectedDestinationChain.id,
    selectedSourceChain.id,
  ]);

  const hyperlaneQuoteParams: HyperlaneQuoteProps | null = useMemo(() => {
    if (!activeAccount || !activeAccount.address || !destinationAddress) {
      return null;
    }

    return {
      token: selectedToken,
      amount: Number(amount?.toString() ?? '0'),
      sourceTypedChainId,
      destinationTypedChainId,
      senderAddress: activeAccount.address,
      recipientAddress: destinationAddress,
    };
  }, [
    amount,
    selectedToken,
    sourceTypedChainId,
    destinationTypedChainId,
    destinationAddress,
    activeAccount,
  ]);

  const {
    data: routerQuote,
    isLoading: isRouterQuoteLoading,
    refetch: refetchRouterQuote,
    error: routerQuoteError,
  } = useRouterQuote(routerQuoteParams);

  const {
    data: hyperlaneQuote,
    isLoading: isHyperlaneQuoteLoading,
    refetch: refetchHyperlaneQuote,
    error: hyperlaneQuoteError,
  } = useHyperlaneQuote(hyperlaneQuoteParams);

  const recipientExplorerUrl = useMemo(() => {
    if (destinationAddress === null) {
      return undefined;
    }

    return makeExplorerUrl(
      selectedDestinationChain.blockExplorers?.default.url ?? '',
      destinationAddress,
      'address',
      'web3',
    );
  }, [
    destinationAddress,
    selectedDestinationChain.blockExplorers?.default.url,
  ]);

  const routerFeeDetails: FeeDetailProps | null = useMemo(() => {
    if (!routerQuote) {
      return null;
    }

    const sendingAmount = parseFloat(
      formatEther(BigInt(amount?.toString() ?? '0')),
    );

    const formattedSendingAmount =
      sendingAmount.toString() + ' ' + routerQuote?.bridgeFee.symbol;

    const receivingAmount =
      sendingAmount -
      parseFloat(formatEther(BigInt(routerQuote?.bridgeFee.amount ?? '0')));

    const formattedReceivingAmount =
      receivingAmount.toString() + ' ' + routerQuote?.bridgeFee.symbol;

    const formattedBridgeFee =
      formatEther(BigInt(routerQuote?.bridgeFee.amount ?? '0')) +
      ' ' +
      routerQuote?.bridgeFee.symbol;

    const estimatedTime = routerQuote?.estimatedTime
      ? `${Math.ceil(Number(routerQuote.estimatedTime) / 60)} min`
      : '';

    setSendingAmount(new Decimal(sendingAmount));
    setReceivingAmount(new Decimal(receivingAmount));

    return {
      token: selectedToken,
      amounts: {
        sending: formattedSendingAmount,
        receiving: formattedReceivingAmount,
        bridgeFee: formattedBridgeFee,
      },
      estimatedTime: estimatedTime,
      bridgeFeeTokenType: routerQuote.bridgeFee.symbol,
      sendingAmount: new Decimal(sendingAmount),
      receivingAmount: new Decimal(receivingAmount),
      recipientExplorerUrl: recipientExplorerUrl,
    };
  }, [
    amount,
    routerQuote,
    selectedToken,
    setReceivingAmount,
    setSendingAmount,
    recipientExplorerUrl,
  ]);

  const hyperlaneFeeDetails: FeeDetailProps | null = useMemo(() => {
    if (!hyperlaneQuote) {
      return null;
    }

    const sendingAmount = new Decimal(amount?.toString() ?? '0')
      .div(new Decimal(10).pow(selectedToken.decimals))
      .toString();

    const formattedSendingAmount = `${sendingAmount} ${selectedToken.symbol}`;

    const formattedGasFee =
      formatEther(hyperlaneQuote.fees.local.amount) +
      ' ' +
      hyperlaneQuote.fees.local.symbol;

    const formattedBridgeFee =
      formatEther(hyperlaneQuote.fees.interchain.amount) +
      ' ' +
      hyperlaneQuote.fees.interchain.symbol;

    setSendingAmount(new Decimal(sendingAmount));
    setReceivingAmount(new Decimal(sendingAmount));

    return {
      token: selectedToken,
      amounts: {
        sending: formattedSendingAmount,
        receiving: formattedSendingAmount,
        bridgeFee: formattedBridgeFee,
        gasFee: formattedGasFee,
      },
      estimatedTime: '',
      bridgeFeeTokenType: hyperlaneQuote.fees.local.symbol,
      gasFeeTokenType: hyperlaneQuote.fees.interchain.symbol,
      sendingAmount: new Decimal(sendingAmount),
      receivingAmount: new Decimal(sendingAmount),
      recipientExplorerUrl: recipientExplorerUrl,
    };
  }, [
    amount,
    hyperlaneQuote,
    selectedToken,
    setReceivingAmount,
    setSendingAmount,
    recipientExplorerUrl,
  ]);

  const clearBridgeStore = useCallback(() => {
    setAmount(null);
    setDestinationAddress(null);
    setIsAmountInputError(false, null);
    setIsAddressInputError(false);
  }, [
    setAmount,
    setDestinationAddress,
    setIsAddressInputError,
    setIsAmountInputError,
  ]);

  const onSwitchChains = useCallback(() => {
    setSelectedSourceChain(selectedDestinationChain);
    setSelectedDestinationChain(selectedSourceChain);
    refreshEvmBalances();
    clearBridgeStore();
  }, [
    clearBridgeStore,
    selectedDestinationChain,
    selectedSourceChain,
    setSelectedDestinationChain,
    setSelectedSourceChain,
    refreshEvmBalances,
  ]);

  const assets: AssetConfig[] = useMemo(() => {
    return tokens.map((token) => {
      const balance = isNativeToken
        ? formatEther(nativeTokenBalance?.value ?? BigInt(0))
        : sourceTypedChainId === PresetTypedChainId.TangleMainnetEVM ||
            sourceTypedChainId === PresetTypedChainId.TangleTestnetEVM
          ? balances?.[sourceTypedChainId]?.find(
              (tokenBalance: BridgeTokenWithBalance) =>
                tokenBalance.address === token.address,
            )?.syntheticBalance
          : balances?.[sourceTypedChainId]?.find(
              (tokenBalance: BridgeTokenWithBalance) =>
                tokenBalance.address === token.address,
            )?.balance;

      const selectedChainExplorerUrl =
        selectedSourceChain.blockExplorers?.default;

      const tokenExplorerUrl =
        selectedChainExplorerUrl?.url &&
        makeExplorerUrl(
          selectedChainExplorerUrl.url,
          (sourceTypedChainId === PresetTypedChainId.TangleMainnetEVM ||
          sourceTypedChainId === PresetTypedChainId.TangleTestnetEVM
            ? token.hyperlaneSyntheticAddress
            : token.address) ?? '',
          'address',
          'web3',
        );

      const address =
        sourceTypedChainId === PresetTypedChainId.TangleMainnetEVM ||
        sourceTypedChainId === PresetTypedChainId.TangleTestnetEVM
          ? token.hyperlaneSyntheticAddress
          : (token.address as `0x${string}`);

      const balance_ = (() => {
        if (activeAccount === null || balance === undefined) {
          return undefined;
        }

        return new BN(
          typeof balance === 'string'
            ? balance
            : convertDecimalToBN(balance, token.decimals),
        );
      })();

      return {
        name: token.name,
        symbol: token.tokenType,
        optionalSymbol: token.symbol,
        balance: balance_,
        explorerUrl: !isNativeToken ? tokenExplorerUrl : undefined,
        address: address !== undefined ? assertEvmAddress(address) : undefined,
        decimals: token.decimals,
      } satisfies AssetConfig;
    });
  }, [
    tokens,
    isNativeToken,
    nativeTokenBalance?.value,
    sourceTypedChainId,
    balances,
    selectedSourceChain.blockExplorers?.default,
    activeAccount,
  ]);

  const onSelectToken = useCallback(
    (asset: AssetConfig) => {
      const tokenConfig = tokens.find(
        (token) => token.address === asset.address,
      );

      if (tokenConfig !== undefined) {
        setSelectedToken(tokenConfig);
      }
    },
    [setSelectedToken, tokens],
  );

  const sourceTokenBalance = useMemo(() => {
    const tokenAddress =
      sourceTypedChainId === PresetTypedChainId.TangleMainnetEVM ||
      sourceTypedChainId === PresetTypedChainId.TangleTestnetEVM
        ? selectedToken.hyperlaneSyntheticAddress
        : selectedToken.address;

    const balance = assets.find(
      (asset) => asset.address === tokenAddress,
    )?.balance;

    return balance ?? BN_ZERO;
  }, [selectedToken, assets, sourceTypedChainId]);

  const isWrongChain = useMemo(() => {
    const isEvmWallet = activeWallet?.platform === 'EVM';

    return isEvmWallet && activeChain?.id !== selectedSourceChain.id;
  }, [activeChain?.id, activeWallet?.platform, selectedSourceChain.id]);

  const isActionBtnDisabled = (() => {
    if (!activeAccount || !activeChain || !activeWallet || isWrongChain) {
      return false;
    }

    return (
      !amount ||
      !destinationAddress ||
      isAmountInputError ||
      isAddressInputError
    );
  })();

  const isActionBtnLoading =
    isRouterQuoteLoading || isHyperlaneQuoteLoading || isTxInProgress;

  const actionBtnLoadingText = (() => {
    if (isTxInProgress) {
      return 'Transaction in Progress';
    }

    return isActionBtnLoading ? 'Preview Transaction' : '';
  })();

  const actionButtonText = (() => {
    if (isTxInProgress) {
      return 'Transaction in Progress';
    } else if (!activeAccount || !activeWallet || !activeChain) {
      return 'Connect Wallet';
    } else if (
      amount &&
      destinationAddress &&
      !isAmountInputError &&
      !isAddressInputError &&
      (routerQuote || hyperlaneQuote) &&
      !routerQuoteError &&
      !hyperlaneQuoteError
    ) {
      return 'Confirm Bridge';
    }

    return 'Preview Transaction';
  })();

  const onClickActionBtn = useCallback(() => {
    if (!activeAccount || !activeWallet || !activeChain) {
      toggleConnectWalletModal(true, sourceTypedChainId);
    } else if (
      amount &&
      destinationAddress &&
      !isAmountInputError &&
      !isAddressInputError &&
      (routerQuote || hyperlaneQuote) &&
      !routerQuoteError &&
      !hyperlaneQuoteError
    ) {
      openConfirmBridgeModal();
    } else if (amount && !isAmountInputError) {
      if (selectedToken.bridgeType === EVMTokenBridgeEnum.Hyperlane) {
        refetchHyperlaneQuote();
      } else {
        refetchRouterQuote();
      }
    }
  }, [
    activeAccount,
    activeWallet,
    activeChain,
    amount,
    destinationAddress,
    isAmountInputError,
    isAddressInputError,
    routerQuote,
    routerQuoteError,
    hyperlaneQuote,
    hyperlaneQuoteError,
    toggleConnectWalletModal,
    sourceTypedChainId,
    openConfirmBridgeModal,
    selectedToken.bridgeType,
    refetchHyperlaneQuote,
    refetchRouterQuote,
  ]);

  const routerTransferData: Omit<RouterTransferProps, 'ethersSigner'> | null =
    useMemo(() => {
      if (
        !routerQuote ||
        !routerQuoteParams ||
        !activeAccount ||
        !destinationAddress
      ) {
        return null;
      }

      return {
        routerQuoteData: routerQuote,
        fromTokenAddress: routerQuoteParams.fromTokenAddress,
        toTokenAddress: routerQuoteParams.toTokenAddress,
        senderAddress: activeAccount.address,
        receiverAddress: destinationAddress,
        refundAddress: activeAccount.address,
      };
    }, [routerQuote, routerQuoteParams, activeAccount, destinationAddress]);

  // Reset inputs after the active account, wallet or chain is
  // disconnected.
  useEffect(() => {
    if (!activeAccount || !activeWallet || !activeChain) {
      setAmount(null);
      setDestinationAddress(null);
      setIsAmountInputError(false, null);
      setIsAddressInputError(false);
    }
  }, [
    activeAccount,
    activeChain,
    activeWallet,
    setAmount,
    setDestinationAddress,
    setIsAddressInputError,
    setIsAmountInputError,
  ]);

  // Re-fetch EVM balances periodically.
  useEffect(() => {
    // Re-fetch every 10 seconds.
    const interval = 10 * 1000;

    const intervalId = setInterval(() => {
      refreshEvmBalances();
    }, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [refreshEvmBalances]);

  const isSwitchingChainRef = useRef(false);

  useEffect(() => {
    if (
      isWrongChain &&
      activeWallet &&
      activeAccount &&
      !isSwitchingChainRef.current
    ) {
      isSwitchingChainRef.current = true;

      const nextChain = chainsPopulated[sourceTypedChainId];

      switchChain(nextChain, activeWallet).finally(() => {
        isSwitchingChainRef.current = false;
      });
    }
  }, [
    isWrongChain,
    activeWallet,
    activeAccount,
    sourceTypedChainId,
    switchChain,
  ]);

  return (
    <>
      <Typography
        variant="h4"
        fw="bold"
        className="text-mono-200 dark:text-mono-0 max-w-[550px] mx-auto w-full text-left"
      >
        Bridge
      </Typography>

      <Card
        withShadow
        className={twMerge(
          'flex flex-col gap-7 w-full max-w-[550px] mx-auto relative',
          className,
        )}
      >
        <div className="flex flex-col gap-7">
          {' '}
          {/* Source and Destination Chain Selector */}
          <div className="flex flex-col items-center justify-center md:flex-row md:justify-between md:items-end md:gap-2">
            {/** Source chain */}
            <div className="flex flex-col flex-1 w-full gap-2">
              <Label
                className="font-bold text-mono-120 dark:text-mono-120"
                htmlFor="bridge-source-chain-selector"
              >
                From
              </Label>

              <ChainOrTokenButton
                value={
                  selectedSourceChain.displayName ?? selectedSourceChain.name
                }
                className="w-full"
                iconType="chain"
                textClassName="whitespace-nowrap"
                onClick={openSourceChainModal}
                disabled={sourceChains.length <= 1}
              />
            </div>

            {/** Switch button */}
            <div
              className="px-1 pt-6 cursor-pointer md:pt-0 md:pb-4"
              onClick={onSwitchChains}
            >
              <ArrowsRightLeftIcon className="w-6 h-6 rotate-90 md:rotate-0" />
            </div>

            {/** Destination chain */}
            <div className="flex flex-col flex-1 w-full gap-2">
              <Label htmlFor="bridge-destination-chain-selector">To</Label>

              <ChainOrTokenButton
                value={
                  selectedDestinationChain.displayName ??
                  selectedDestinationChain.name
                }
                className="w-full"
                iconType="chain"
                onClick={openDestinationChainModal}
                disabled={destinationChains.length <= 1}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {/* Sending Amount and Token Selector */}
            <div className="flex flex-col gap-2">
              <div
                className={twMerge(
                  'w-full flex items-center gap-2 rounded-lg pr-4',
                  'bg-mono-20 dark:bg-mono-180',
                )}
              >
                <AmountInput
                  id="bridge-amount-input"
                  title="Amount"
                  amount={amount}
                  setAmount={setAmount}
                  wrapperOverrides={{ isFullWidth: true }}
                  placeholder="Enter amount to bridge"
                  wrapperClassName="dark:bg-mono-180"
                  showMaxAction
                  decimals={selectedToken.decimals}
                  showErrorMessage={false}
                  setErrorMessage={(error) => {
                    setIsAmountInputError(error ? true : false, error);
                  }}
                  max={balance === null ? null : sourceTokenBalance}
                  isDisabled={isTxInProgress}
                />

                <ChainOrTokenButton
                  value={
                    selectedToken.tokenType === ('SolvBTC.BBN' as EVMTokenEnum)
                      ? 'SolvBTC'
                      : selectedToken.tokenType
                  }
                  iconType="token"
                  onClick={openTokenModal}
                  className="py-2 w-fit"
                  status="success"
                />
              </div>

              <div className="flex flex-col gap-1 px-1">
                {isAmountInputError && amountInputErrorMessage !== null && (
                  <div className="flex flex-col gap-1 duration-300 ease-out animate-in fade-in">
                    <ErrorMessage
                      className="mt-0"
                      typographyProps={{ variant: 'body2', fw: 'normal' }}
                    >
                      {amountInputErrorMessage}
                    </ErrorMessage>

                    {activeAccount !== null && (
                      <Typography
                        variant="body1"
                        className="flex items-center gap-1"
                      >
                        <WalletFillIcon size="md" /> Balance:{' '}
                        {sourceTokenBalance !== null
                          ? `${formatDisplayAmount(sourceTokenBalance, selectedToken.decimals, AmountFormatStyle.SHORT)} ${selectedToken.tokenType}`
                          : EMPTY_VALUE_PLACEHOLDER}
                      </Typography>
                    )}
                  </div>
                )}

                {!isAmountInputError && activeAccount !== null && (
                  <Typography
                    variant="body1"
                    className="flex items-center gap-1 ml-auto transition-opacity duration-300 ease-out"
                  >
                    <WalletFillIcon size="md" /> Balance:{' '}
                    {sourceTokenBalance !== null
                      ? `${formatDisplayAmount(sourceTokenBalance, selectedToken.decimals, AmountFormatStyle.SHORT)} ${selectedToken.tokenType}`
                      : EMPTY_VALUE_PLACEHOLDER}
                  </Typography>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <AddressInput
                id="bridge-destination-address-input"
                type={
                  isSolanaDestination ? AddressType.SOLANA : AddressType.EVM
                }
                title="Recipient Address"
                wrapperOverrides={{
                  isFullWidth: true,
                  wrapperClassName: 'bg-mono-20 dark:bg-mono-180',
                }}
                showAvatar={false}
                value={destinationAddress ?? ''}
                setValue={setDestinationAddress}
                placeholder="0x..."
                showErrorMessage={false}
                setErrorMessage={(error) => {
                  setIsAddressInputError(error ? true : false);
                  setAddressInputErrorMessage(error);
                }}
                isDisabled={isTxInProgress}
              />

              {addressInputErrorMessage !== null && (
                <ErrorMessage
                  className="mt-0"
                  typographyProps={{ variant: 'body2', fw: 'normal' }}
                >
                  {addressInputErrorMessage}
                </ErrorMessage>
              )}
            </div>
          </div>
          {routerQuote && !isRouterQuoteLoading && routerFeeDetails && (
            <FeeDetail
              token={routerFeeDetails.token}
              estimatedTime={routerFeeDetails.estimatedTime}
              amounts={routerFeeDetails.amounts}
              bridgeFeeTokenType={routerFeeDetails.bridgeFeeTokenType}
              sendingAmount={routerFeeDetails.sendingAmount}
              receivingAmount={routerFeeDetails.receivingAmount}
              recipientExplorerUrl={recipientExplorerUrl}
            />
          )}
          {hyperlaneQuote &&
            !isHyperlaneQuoteLoading &&
            hyperlaneFeeDetails && (
              <FeeDetail
                token={hyperlaneFeeDetails.token}
                estimatedTime={hyperlaneFeeDetails.estimatedTime}
                amounts={hyperlaneFeeDetails.amounts}
                bridgeFeeTokenType={hyperlaneFeeDetails.bridgeFeeTokenType}
                gasFeeTokenType={hyperlaneFeeDetails.gasFeeTokenType}
                sendingAmount={hyperlaneFeeDetails.sendingAmount}
                receivingAmount={hyperlaneFeeDetails.receivingAmount}
                recipientExplorerUrl={recipientExplorerUrl}
              />
            )}
          {routerQuoteError?.error !== undefined && (
            <ErrorMessage
              className="mt-0 duration-300 ease-out animate-in fade-in"
              typographyProps={{ variant: 'body2', fw: 'normal' }}
            >
              {routerQuoteError.error}
            </ErrorMessage>
          )}
          {/* Action button */}
          <Button
            variant="primary"
            isFullWidth
            onClick={onClickActionBtn}
            isLoading={isActionBtnLoading}
            isDisabled={isActionBtnDisabled}
            loadingText={actionBtnLoadingText}
          >
            {actionButtonText}
          </Button>
        </div>
      </Card>

      <Modal
        open={isSourceChainModalOpen}
        onOpenChange={updateSourceChainModal}
      >
        {/* Source Chain Selector */}
        <ModalContent size="md">
          <ChainList
            searchInputId="bridge-source-chain-search"
            onClose={closeSourceChainModal}
            chains={sourceChains}
            onSelectChain={setSelectedSourceChain}
            chainType="source"
            showSearchInput
          />
        </ModalContent>
      </Modal>

      <Modal
        open={isDestinationChainModalOpen}
        onOpenChange={updateDestinationChainModal}
      >
        {/* Destination Chain Selector */}
        <ModalContent size="md">
          <ChainList
            searchInputId="bridge-destination-chain-search"
            onClose={closeDestinationChainModal}
            chains={destinationChains}
            onSelectChain={setSelectedDestinationChain}
            chainType="destination"
            showSearchInput
          />
        </ModalContent>
      </Modal>

      <Modal open={isTokenModalOpen} onOpenChange={updateTokenModal}>
        {/* Token Selector */}
        <ModalContent size="md">
          <AssetList
            onClose={closeTokenModal}
            assets={assets}
            onSelectAsset={onSelectToken}
          />
        </ModalContent>
      </Modal>

      <BridgeConfirmationModal
        isOpen={isConfirmBridgeModalOpen}
        handleClose={closeConfirmBridgeModal}
        clearBridgeStore={clearBridgeStore}
        sourceChain={selectedSourceChain}
        destinationChain={selectedDestinationChain}
        token={selectedToken}
        feeDetails={
          selectedToken.bridgeType === EVMTokenBridgeEnum.Router
            ? routerFeeDetails
            : hyperlaneFeeDetails
        }
        activeAccountAddress={activeAccount?.address ?? ''}
        destinationAddress={destinationAddress ?? ''}
        routerTransferData={routerTransferData}
        sendingAmount={
          selectedToken.bridgeType === EVMTokenBridgeEnum.Router
            ? (routerFeeDetails?.sendingAmount ?? null)
            : (hyperlaneFeeDetails?.sendingAmount ?? null)
        }
        receivingAmount={
          selectedToken.bridgeType === EVMTokenBridgeEnum.Router
            ? (routerFeeDetails?.receivingAmount ?? null)
            : (hyperlaneFeeDetails?.receivingAmount ?? null)
        }
        isTxInProgress={isTxInProgress}
        setIsTxInProgress={setIsTxInProgress}
      />
    </>
  );
};

export default BridgeContainer;
