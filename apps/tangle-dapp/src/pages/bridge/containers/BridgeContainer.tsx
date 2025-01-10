import { ArrowsRightLeftIcon } from '@heroicons/react/24/outline';
import { useConnectWallet } from '@webb-tools/api-provider-environment/ConnectWallet';
import { useActiveAccount } from '@webb-tools/api-provider-environment/hooks/useActiveAccount';
import { useActiveChain } from '@webb-tools/api-provider-environment/hooks/useActiveChain';
import { useActiveWallet } from '@webb-tools/api-provider-environment/hooks/useActiveWallet';
import { makeExplorerUrl } from '@webb-tools/api-provider-environment/transaction/utils';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import { PresetTypedChainId } from '@webb-tools/dapp-types';
import { EVMTokenBridgeEnum } from '@webb-tools/evm-contract-metadata';
import { calculateTypedChainId } from '@webb-tools/dapp-types/TypedChainId';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import {
  Button,
  Card,
  ChainOrTokenButton,
  EMPTY_VALUE_PLACEHOLDER,
  Label,
  Modal,
  ModalContent,
  Typography,
  useModal,
} from '@webb-tools/webb-ui-components';
import { Decimal } from 'decimal.js';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { formatEther } from 'viem';

import AddressInput, { AddressType } from '../../../components/AddressInput';
import AmountInput from '../../../components/AmountInput';
import { BridgeConfirmationModal } from '../components/BridgeConfirmationModal';
import { FeeDetail, FeeDetailProps } from '../components/FeeDetail';
import { AssetConfig, AssetList } from '../../../components/Lists/AssetList';
import { ChainList } from '../../../components/Lists/ChainList';
import { ROUTER_NATIVE_TOKEN_ADDRESS } from '../constants';
import useBridgeStore from '../context/useBridgeStore';
import useBalances from '../../../data/balances/useBalances';
import { useBridgeEvmBalances } from '../hooks/useBridgeEvmBalances';
import { BridgeTokenWithBalance } from '@webb-tools/tangle-shared-ui/types';
import useBridgeRouterQuote, {
  RouterQuoteParams,
} from '../hooks/useBridgeRouterQuote';
import convertDecimalToBn from '../../../utils/convertDecimalToBn';
import formatTangleBalance from '../../../utils/formatTangleBalance';
import {
  HyperlaneQuoteProps,
  useHyperlaneQuote,
} from '../hooks/useHyperlaneQuote';
import { RouterTransferProps } from '../hooks/useRouterTransfer';
import ErrorMessage from '../../../components/ErrorMessage';
import { WalletFillIcon } from '@webb-tools/icons';

interface BridgeContainerProps {
  className?: string;
}

export default function BridgeContainer({ className }: BridgeContainerProps) {
  const { switchChain } = useWebContext();
  const [activeChain] = useActiveChain();
  const [activeAccount] = useActiveAccount();
  const { transferable: balance } = useBalances();
  const { nativeTokenSymbol } = useNetworkStore();
  const [activeWallet] = useActiveWallet();
  const { toggleModal: toggleConnectWalletModal } = useConnectWallet();

  const fmtAccountBalance = useMemo(() => {
    return balance
      ? formatTangleBalance(balance, nativeTokenSymbol).split(' ')[0]
      : '';
  }, [balance, nativeTokenSymbol]);

  const { balances, refresh: refreshEvmBalances } = useBridgeEvmBalances();
  const sourceChains = useBridgeStore((state) => state.sourceChains);
  const destinationChains = useBridgeStore((state) => state.destinationChains);

  const selectedSourceChain = useBridgeStore(
    (state) => state.selectedSourceChain,
  );

  const setSelectedSourceChain = useBridgeStore(
    (state) => state.setSelectedSourceChain,
  );

  const selectedDestinationChain = useBridgeStore(
    (state) => state.selectedDestinationChain,
  );

  const setSelectedDestinationChain = useBridgeStore(
    (state) => state.setSelectedDestinationChain,
  );

  const tokens = useBridgeStore((state) => state.tokens);
  const selectedToken = useBridgeStore((state) => state.selectedToken);
  const setSelectedToken = useBridgeStore((state) => state.setSelectedToken);
  const amount = useBridgeStore((state) => state.amount);
  const setAmount = useBridgeStore((state) => state.setAmount);

  const isAmountInputError = useBridgeStore(
    (state) => state.isAmountInputError,
  );

  const setIsAmountInputError = useBridgeStore(
    (state) => state.setIsAmountInputError,
  );

  const amountInputErrorMessage = useBridgeStore(
    (state) => state.amountInputErrorMessage,
  );

  const destinationAddress = useBridgeStore(
    (state) => state.destinationAddress,
  );

  const setDestinationAddress = useBridgeStore(
    (state) => state.setDestinationAddress,
  );

  const isAddressInputError = useBridgeStore(
    (state) => state.isAddressInputError,
  );

  const setIsAddressInputError = useBridgeStore(
    (state) => state.setIsAddressInputError,
  );

  const setSendingAmount = useBridgeStore((state) => state.setSendingAmount);

  const setReceivingAmount = useBridgeStore(
    (state) => state.setReceivingAmount,
  );

  const {
    status: isSourceChainModalOpen,
    open: openSourceChainModal,
    close: closeSourceChainModal,
  } = useModal(false);

  const {
    status: isDestinationChainModalOpen,
    open: openDestinationChainModal,
    close: closeDestinationChainModal,
  } = useModal(false);

  const {
    status: isTokenModalOpen,
    open: openTokenModal,
    close: closeTokenModal,
  } = useModal(false);

  const {
    status: isConfirmBridgeModalOpen,
    open: openConfirmBridgeModal,
    close: closeConfirmBridgeModal,
  } = useModal(false);

  const [addressInputErrorMessage, setAddressInputErrorMessage] = useState<
    string | null
  >(null);

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
  } = useBridgeRouterQuote(routerQuoteParams);

  const {
    data: hyperlaneQuote,
    isLoading: isHyperlaneQuoteLoading,
    refetch: refetchHyperlaneQuote,
    error: hyperlaneQuoteError,
  } = useHyperlaneQuote(hyperlaneQuoteParams);

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
    };
  }, [
    amount,
    routerQuote,
    selectedToken,
    setReceivingAmount,
    setSendingAmount,
  ]);

  const hyperlaneFeeDetails: FeeDetailProps | null = useMemo(() => {
    if (!hyperlaneQuote) {
      return null;
    }

    const sendingAmount = parseFloat(
      formatEther(BigInt(amount?.toString() ?? '0')),
    );

    const formattedSendingAmount =
      sendingAmount.toString() + ' ' + selectedToken.tokenSymbol;

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
    };
  }, [
    amount,
    hyperlaneQuote,
    selectedToken,
    setReceivingAmount,
    setSendingAmount,
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
    clearBridgeStore();
  }, [
    clearBridgeStore,
    selectedDestinationChain,
    selectedSourceChain,
    setSelectedDestinationChain,
    setSelectedSourceChain,
  ]);

  const assets: AssetConfig[] = useMemo(() => {
    const tokenConfigs = tokens.map((token) => {
      const balance =
        sourceTypedChainId === PresetTypedChainId.TangleMainnetEVM
          ? fmtAccountBalance
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
          token.address,
          'address',
          'web3',
        );

      return {
        symbol: token.tokenType,
        optionalSymbol: token.tokenSymbol,
        balance:
          activeAccount && balance
            ? parseFloat(balance.toString()).toFixed(3)
            : '',
        explorerUrl:
          sourceTypedChainId !== PresetTypedChainId.TangleMainnetEVM
            ? tokenExplorerUrl
            : undefined,
        address: token.address as `0x${string}`,
        assetBridgeType:
          sourceTypedChainId === PresetTypedChainId.TangleMainnetEVM
            ? EVMTokenBridgeEnum.None
            : token.bridgeType === EVMTokenBridgeEnum.Router
              ? EVMTokenBridgeEnum.Router
              : EVMTokenBridgeEnum.Hyperlane,
      };
    });

    return tokenConfigs;
  }, [
    tokens,
    sourceTypedChainId,
    fmtAccountBalance,
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

  const selectedTokenBalanceOnSourceChain = useMemo(() => {
    const balance = assets.find(
      (asset) => asset.address === selectedToken.address,
    )?.balance;

    return balance ? parseFloat(balance) : 0;
  }, [selectedToken, assets]);

  const isWrongChain = useMemo(() => {
    const isEvmWallet = activeWallet?.platform === 'EVM';

    return isEvmWallet && activeChain?.id !== selectedSourceChain.id;
  }, [activeChain?.id, activeWallet?.platform, selectedSourceChain.id]);

  const isActionBtnDisabled = useMemo(() => {
    if (!activeAccount || !activeChain || !activeWallet || isWrongChain) {
      return false;
    }

    return (
      !amount ||
      !destinationAddress ||
      isAmountInputError ||
      isAddressInputError
    );
  }, [
    activeAccount,
    activeChain,
    activeWallet,
    isWrongChain,
    amount,
    destinationAddress,
    isAmountInputError,
    isAddressInputError,
  ]);

  const isActionBtnLoading = isRouterQuoteLoading || isHyperlaneQuoteLoading;

  const actionBtnLoadingText = isRouterQuoteLoading
    ? 'Fetching Router quote'
    : isHyperlaneQuoteLoading
      ? 'Fetching Hyperlane bridge fee'
      : '';

  const actionButtonText = useMemo(() => {
    if (!activeAccount || !activeWallet || !activeChain) {
      return 'Connect Wallet';
    } else if (isWrongChain) {
      return 'Switch Network';
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

    return 'Fetch Quote & Fees';
  }, [
    activeAccount,
    activeWallet,
    activeChain,
    isWrongChain,
    amount,
    destinationAddress,
    isAmountInputError,
    isAddressInputError,
    routerQuote,
    routerQuoteError,
    hyperlaneQuote,
    hyperlaneQuoteError,
  ]);

  const onClickActionBtn = useCallback(() => {
    if (!activeAccount || !activeWallet || !activeChain) {
      toggleConnectWalletModal(true, sourceTypedChainId);
    } else if (isWrongChain) {
      const nextChain = chainsPopulated[sourceTypedChainId];

      switchChain(nextChain, activeWallet);
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
    isWrongChain,
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
    switchChain,
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

  useEffect(() => {
    // Re-fetch every 30 seconds.
    const interval = 30 * 1000;

    const intervalId = setInterval(() => {
      refreshEvmBalances();
    }, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [refreshEvmBalances]);

  return (
    <>
      <Card
        withShadow
        className={twMerge(
          'flex flex-col gap-7 w-full max-w-[550px] mx-auto',
          className,
        )}
      >
        <div className="flex flex-col gap-7">
          {/* Source and Destination Chain Selector */}
          <div className="flex flex-col md:flex-row justify-center md:justify-between items-center md:items-end md:gap-2">
            {/** Source chain */}
            <div className="flex flex-col gap-2 flex-1 w-full">
              <Label
                className="text-mono-120 dark:text-mono-120 font-bold"
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
                onClick={openSourceChainModal}
                disabled={sourceChains.length <= 1}
              />
            </div>

            {/** Switch button */}
            <div
              className="cursor-pointer px-1 pt-6 md:pt-0 md:pb-4"
              onClick={onSwitchChains}
            >
              <ArrowsRightLeftIcon className="w-6 h-6 rotate-90 md:rotate-0" />
            </div>

            {/** Destination chain */}
            <div className="flex flex-col gap-2 flex-1 w-full">
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

          <div className="flex flex-col gap-2">
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
                  max={
                    balance === null
                      ? null
                      : convertDecimalToBn(
                          new Decimal(selectedTokenBalanceOnSourceChain),
                          selectedToken.decimals,
                        )
                  }
                />

                <ChainOrTokenButton
                  value={selectedToken.tokenType}
                  iconType="token"
                  onClick={openTokenModal}
                  className="w-fit py-2"
                  status="success"
                />
              </div>

              <div className="flex items-center justify-between px-1">
                {isAmountInputError && amountInputErrorMessage !== null && (
                  <ErrorMessage className="mt-0">
                    {amountInputErrorMessage}
                  </ErrorMessage>
                )}

                {/** Balance */}
                {activeAccount !== null && (
                  <Typography
                    variant="body1"
                    className="flex items-center gap-1 ml-auto"
                  >
                    <WalletFillIcon size="md" /> Balance:{' '}
                    {selectedTokenBalanceOnSourceChain !== null
                      ? `${Number(selectedTokenBalanceOnSourceChain).toFixed(3)} ${selectedToken.tokenType}`
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
                showAvatar={!isSolanaDestination}
                value={destinationAddress ?? ''}
                setValue={setDestinationAddress}
                placeholder="0x..."
                showErrorMessage={false}
                setErrorMessage={(error) => {
                  setIsAddressInputError(error ? true : false);
                  setAddressInputErrorMessage(error);
                }}
              />

              {addressInputErrorMessage !== null && (
                <ErrorMessage className="mt-0">
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
              />
            )}

          {routerQuoteError?.error !== undefined && (
            <ErrorMessage>{routerQuoteError.error}</ErrorMessage>
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

      <Modal>
        {/* Source Chain Selector */}
        <ModalContent
          isOpen={isSourceChainModalOpen}
          onInteractOutside={closeSourceChainModal}
          size="md"
        >
          <ChainList
            searchInputId="bridge-source-chain-search"
            onClose={closeSourceChainModal}
            chains={sourceChains}
            onSelectChain={setSelectedSourceChain}
            chainType="source"
            showSearchInput
          />
        </ModalContent>

        {/* Destination Chain Selector */}
        <ModalContent
          isOpen={isDestinationChainModalOpen}
          onInteractOutside={closeDestinationChainModal}
          size="md"
        >
          <ChainList
            searchInputId="bridge-destination-chain-search"
            onClose={closeDestinationChainModal}
            chains={destinationChains}
            onSelectChain={setSelectedDestinationChain}
            chainType="destination"
            showSearchInput
          />
        </ModalContent>

        {/* Token Selector */}
        <ModalContent
          isOpen={isTokenModalOpen}
          onInteractOutside={closeTokenModal}
          size="md"
        >
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
      />
    </>
  );
}
