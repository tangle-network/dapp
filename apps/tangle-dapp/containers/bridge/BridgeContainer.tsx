'use client';

import {
  ArrowsRightLeftIcon,
  InformationCircleIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';
import { WalletMetamask } from '@web3icons/react';
import { useConnectWallet } from '@webb-tools/api-provider-environment/ConnectWallet';
import { useActiveAccount } from '@webb-tools/api-provider-environment/hooks/useActiveAccount';
import { useActiveChain } from '@webb-tools/api-provider-environment/hooks/useActiveChain';
import { useActiveWallet } from '@webb-tools/api-provider-environment/hooks/useActiveWallet';
import { makeExplorerUrl } from '@webb-tools/api-provider-environment/transaction/utils';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import { PresetTypedChainId } from '@webb-tools/dapp-types';
import { EVMTokenBridgeEnum } from '@webb-tools/evm-contract-metadata';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
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
import cx from 'classnames';
import { Decimal } from 'decimal.js';
import { useCallback, useEffect, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { formatEther } from 'viem';

import AddressInput, { AddressType } from '../../components/AddressInput';
import AmountInput from '../../components/AmountInput';
import { BridgeConfirmationModal } from '../../components/bridge/BridgeConfirmationModal';
import { FeeDetail } from '../../components/bridge/FeeDetail';
import { AssetConfig, AssetList } from '../../components/Lists/AssetList';
import { ChainList } from '../../components/Lists/ChainList';
import { ROUTER_NATIVE_TOKEN_ADDRESS } from '../../constants/bridge/constants';
import useBridgeStore from '../../context/bridge/useBridgeStore';
import useBalances from '../../data/balances/useBalances';
import { useEVMBalances } from '../../hooks/bridge/useEVMBalances';
import { TokenBalanceType } from '../../hooks/bridge/useEVMBalances';
import {
  RouterQuoteProps,
  useRouterQuote,
} from '../../hooks/bridge/useRouterQuote';
import convertDecimalToBn from '../../utils/convertDecimalToBn';
import formatTangleBalance from '../../utils/formatTangleBalance';

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
  const { toggleModal } = useConnectWallet();

  const accountBalance = useMemo(() => {
    return balance
      ? formatTangleBalance(balance, nativeTokenSymbol).split(' ')[0]
      : '';
  }, [balance, nativeTokenSymbol]);

  const { balances, refetch: refetchEVMBalances } = useEVMBalances();

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

  const routerQuoteParams: RouterQuoteProps = useMemo(() => {
    const fromTokenAddress =
      sourceTypedChainId === PresetTypedChainId.TangleMainnetEVM
        ? ROUTER_NATIVE_TOKEN_ADDRESS
        : selectedToken.address;

    const toTokenAddress =
      destinationTypedChainId === PresetTypedChainId.TangleMainnetEVM
        ? ROUTER_NATIVE_TOKEN_ADDRESS
        : selectedToken.address;

    const routerQuoteParams = {
      fromTokenAddress,
      toTokenAddress,
      amountInWei: amount?.toString() ?? '',
      fromTokenChainId: selectedSourceChain.id.toString(),
      toTokenChainId: selectedDestinationChain.id.toString(),
    };

    return routerQuoteParams;
  }, [
    amount,
    sourceTypedChainId,
    selectedToken.address,
    destinationTypedChainId,
    selectedSourceChain.id,
    selectedDestinationChain.id,
  ]);

  const {
    data: routerQuote,
    isLoading: isRouterQuoteLoading,
    refetch: refetchRouterQuote,
    error: routerQuoteError,
  } = useRouterQuote(routerQuoteParams);

  const feeDetails = useMemo(() => {
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
      estimatedTime,
    };
  }, [
    amount,
    routerQuote,
    selectedToken,
    setReceivingAmount,
    setSendingAmount,
  ]);

  const clearBridgeStore = () => {
    setAmount(null);
    setDestinationAddress(null);
    setIsAmountInputError(false, null);
    setIsAddressInputError(false);
  };

  const onSwitchChains = () => {
    setSelectedSourceChain(selectedDestinationChain);
    setSelectedDestinationChain(selectedSourceChain);
    clearBridgeStore();
  };

  const assets: AssetConfig[] = useMemo(() => {
    const tokenConfigs = tokens.map((token) => {
      const balance =
        sourceTypedChainId === PresetTypedChainId.TangleMainnetEVM
          ? accountBalance
          : balances?.[sourceTypedChainId]?.find(
              (tokenBalance: TokenBalanceType) =>
                tokenBalance.address === token.address,
            )?.balance;

      const selectedChainExplorerUrl =
        selectedSourceChain.blockExplorers?.default;

      const tokenExplorerUrl = makeExplorerUrl(
        selectedChainExplorerUrl?.url ?? '',
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
        address: token.address,
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
    accountBalance,
    balances,
    selectedSourceChain.blockExplorers?.default,
    activeAccount,
  ]);

  const onSelectToken = (asset: AssetConfig) => {
    const tokenConfig = tokens.find((token) => token.address === asset.address);
    if (tokenConfig) {
      setSelectedToken(tokenConfig);
    }
  };

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

  const actionButtonIsDisabled = useMemo(() => {
    if (!activeAccount || !activeChain || !activeWallet) {
      return false;
    }

    if (isWrongChain) {
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

  const actionButtonIsLoading = useMemo(
    () => isRouterQuoteLoading,
    [isRouterQuoteLoading],
  );

  const actionButtonLoadingText = useMemo(
    () => (isRouterQuoteLoading ? 'Fetching bridge fee...' : ''),
    [isRouterQuoteLoading],
  );

  const actionButtonText = useMemo(() => {
    if (!activeAccount || !activeWallet || !activeChain) {
      return 'Connect wallet';
    }

    if (isWrongChain) {
      return 'Switch Network';
    }

    if (
      amount &&
      destinationAddress &&
      !isAmountInputError &&
      !isAddressInputError &&
      routerQuote &&
      !routerQuoteError
    ) {
      return 'Confirm Bridge';
    }

    return 'Get bridge fee';
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
  ]);

  const onClickActionButton = useCallback(() => {
    if (!activeAccount || !activeWallet || !activeChain) {
      toggleModal(true, sourceTypedChainId);
    } else if (isWrongChain) {
      const nextChain = chainsPopulated[sourceTypedChainId];
      switchChain(nextChain, activeWallet);
    } else if (
      amount &&
      destinationAddress &&
      !isAmountInputError &&
      !isAddressInputError &&
      routerQuote &&
      !routerQuoteError
    ) {
      openConfirmBridgeModal();
    } else if (amount && !isAmountInputError) {
      refetchRouterQuote();
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
    toggleModal,
    sourceTypedChainId,
    switchChain,
    openConfirmBridgeModal,
    refetchRouterQuote,
  ]);

  const transferData = useMemo(() => {
    return {
      routerQuoteData: routerQuote,
      fromTokenAddress: routerQuoteParams.fromTokenAddress,
      toTokenAddress: routerQuoteParams.toTokenAddress,
      senderAddress: activeAccount?.address ?? '',
      receiverAddress: destinationAddress ?? '',
      refundAddress: activeAccount?.address ?? '',
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
    const FETCH_INTERVAL = 2 * 60 * 1000;

    console.log('🔄 Starting EVM balance refresh interval');
    const intervalId = setInterval(() => {
      console.log('🔄 Refetching EVM balances');
      refetchEVMBalances();
    }, FETCH_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [refetchEVMBalances]);

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
            <div className="flex flex-col gap-2 flex-1 w-full">
              <Label
                className="text-mono-120 dark:text-mono-120 font-bold text-lg"
                htmlFor="bridge-source-chain-selector"
              >
                From
              </Label>
              <ChainOrTokenButton
                value={
                  selectedSourceChain.displayName ?? selectedSourceChain.name
                }
                className="w-full min-h-[70px] py-4"
                iconType="chain"
                onClick={openSourceChainModal}
                disabled={sourceChains.length <= 1}
                showChevron={false}
              />
            </div>
            <div
              className="flex-shrink cursor-pointer px-1 pt-4 md:pt-0 md:pb-6"
              onClick={onSwitchChains}
            >
              <ArrowsRightLeftIcon className="w-6 h-6 rotate-90 md:rotate-0" />
            </div>
            <div className="flex flex-col gap-2 flex-1 w-full">
              <Label
                className="text-mono-120 dark:text-mono-120 font-bold text-lg"
                htmlFor="bridge-destination-chain-selector"
              >
                To
              </Label>
              <ChainOrTokenButton
                value={
                  selectedDestinationChain.displayName ??
                  selectedDestinationChain.name
                }
                className="w-full min-h-[70px] py-4"
                iconType="chain"
                onClick={openDestinationChainModal}
                disabled={destinationChains.length <= 1}
                showChevron={false}
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
                  title="Send"
                  amount={amount}
                  setAmount={setAmount}
                  wrapperOverrides={{
                    isFullWidth: true,
                  }}
                  placeholder="0"
                  wrapperClassName="!pr-0 !border-0 dark:bg-mono-180 !py-4"
                  min={convertDecimalToBn(
                    new Decimal(0.1),
                    selectedToken.decimals,
                  )}
                  max={
                    balance
                      ? convertDecimalToBn(
                          new Decimal(selectedTokenBalanceOnSourceChain),
                          selectedToken.decimals,
                        )
                      : null
                  }
                  decimals={selectedToken.decimals}
                  showMaxAction={true}
                  setErrorMessage={(error) => {
                    setIsAmountInputError(error ? true : false, error);
                  }}
                  showErrorMessage={false}
                  inputClassName={cx(
                    'placeholder:text-2xl !text-2xl',
                    isAmountInputError ? 'text-red-70 dark:text-red-50' : '',
                  )}
                />
                <ChainOrTokenButton
                  value={selectedToken.tokenType}
                  iconType="token"
                  onClick={openTokenModal}
                  className="w-fit py-2"
                  status="success"
                  showChevron={false}
                />
              </div>

              <div className="flex justify-between items-center px-1">
                <div className="flex gap-1 items-center">
                  {isAmountInputError && (
                    <InformationCircleIcon className="stroke-red-70 dark:stroke-red-50 w-6 h-6" />
                  )}

                  <Typography
                    variant="body1"
                    className="text-red-70 dark:text-red-50 !text-lg"
                  >
                    {isAmountInputError ? amountInputErrorMessage : ''}
                  </Typography>
                </div>

                {activeAccount && (
                  <Typography
                    variant="h5"
                    fw="bold"
                    className="flex items-center gap-1 !text-lg"
                  >
                    {activeWallet?.id === 2 ? (
                      <WalletMetamask className="w-6 h-6" variant="branded" />
                    ) : (
                      <WalletIcon className="w-6 h-6" />
                    )}
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
                type={AddressType.EVM}
                title="Recipient"
                wrapperOverrides={{
                  isFullWidth: true,
                  wrapperClassName: 'bg-mono-20 dark:bg-mono-180 !py-4',
                }}
                value={destinationAddress ?? ''}
                setValue={setDestinationAddress}
                placeholder="0x..."
                setErrorMessage={(error) =>
                  setIsAddressInputError(error ? true : false)
                }
                showErrorMessage={false}
                inputClassName={cx(
                  'placeholder:text-2xl !text-2xl',
                  isAddressInputError ? 'text-red-70 dark:text-red-50' : '',
                )}
                showAvatar={false}
              />

              <div className="flex gap-1 items-center">
                {isAddressInputError && (
                  <InformationCircleIcon
                    className="stroke-red-70 dark:stroke-red-50 w-6 h-6"
                    width={24}
                    height={24}
                  />
                )}

                <Typography
                  variant="body1"
                  className="text-red-70 dark:text-red-50 !text-lg"
                >
                  {isAddressInputError ? 'Invalid EVM address' : ''}
                </Typography>
              </div>
            </div>
          </div>

          {routerQuote && !isRouterQuoteLoading && feeDetails && (
            <FeeDetail
              token={feeDetails.token}
              estimatedTime={feeDetails.estimatedTime}
              amounts={feeDetails.amounts}
            />
          )}

          <div
            className={cx(
              'flex gap-2 items-start w-full',
              routerQuoteError ? 'block' : 'hidden',
            )}
          >
            <InformationCircleIcon className="stroke-red-70 dark:stroke-red-50 w-6 h-6 flex-shrink-0" />

            <Typography
              variant="body1"
              className="text-red-70 dark:text-red-50 !text-lg !leading-none"
            >
              {(routerQuoteError as any)?.error ?? routerQuoteError ?? ''}
            </Typography>
          </div>

          {/* Bridge Button */}
          <Button
            variant="primary"
            isFullWidth
            onClick={onClickActionButton}
            isLoading={actionButtonIsLoading}
            isDisabled={actionButtonIsDisabled}
            loadingText={actionButtonLoadingText}
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
            showSearchInput={true}
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
            showSearchInput={true}
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
        handleClose={() => {
          closeConfirmBridgeModal();
          clearBridgeStore();
        }}
        sourceChain={selectedSourceChain}
        destinationChain={selectedDestinationChain}
        token={selectedToken}
        feeDetails={feeDetails}
        activeAccountAddress={activeAccount?.address ?? ''}
        destinationAddress={destinationAddress ?? ''}
        transferData={transferData}
      />
    </>
  );
}
