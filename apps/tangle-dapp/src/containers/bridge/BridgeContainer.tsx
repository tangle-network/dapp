import { useActiveAccount } from '@tangle-network/api-provider-environment/hooks/useActiveAccount';
import { makeExplorerUrl } from '@tangle-network/api-provider-environment/transaction/utils';
import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import { chainsPopulated } from '@tangle-network/dapp-config';
import {
  EVMTokenBridgeEnum,
  EVMTokenEnum,
} from '@tangle-network/evm-contract-metadata';
import ArrowLeftRightLineIcon from '@tangle-network/icons/ArrowLeftRightLineIcon';
import WalletFillIcon from '@tangle-network/icons/WalletFillIcon';
import {
  AmountFormatStyle,
  Card,
  ChainOrTokenButton,
  EMPTY_VALUE_PLACEHOLDER,
  formatDisplayAmount,
  Label,
  Modal,
  ModalContent,
  Typography,
  useModal,
} from '@tangle-network/ui-components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useShallow } from 'zustand/react/shallow';
import AddressInput from '../../components/AddressInput';
import AmountInput from '../../components/AmountInput';
import { BridgeConfirmationModal } from '../../components/bridge/BridgeConfirmationModal';
import { FeeDetail } from '../../components/bridge/FeeDetail';
import ErrorMessage from '../../components/ErrorMessage';
import { AssetConfig, AssetList } from '../../components/Lists/AssetList';
import { ChainList } from '../../components/Lists/ChainList';
import { AddressType } from '../../constants';
import useBridgeStore from '../../context/bridge/useBridgeStore';
import useBalances from '../../data/balances/useBalances';
import { useBridgeEvmBalances } from '../../data/bridge/useBridgeEvmBalances';
import { useHyperlaneQuote } from '../../data/bridge/useHyperlaneQuote';
import useRouterQuote from '../../data/bridge/useRouterQuote';
import useIsBridgeNativeToken from '../../hooks/useIsBridgeNativeToken';
import { useWebContext } from '@tangle-network/api-provider-environment/webb-context';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import useBridgeAssets from '../../hooks/bridge/useBridgeAssets';
import useBridgeTokenBalance from '../../hooks/bridge/useBridgeTokenBalance';
import useHyperlaneFeeDetails from '../../hooks/bridge/useHyperlaneFeeDetails';
import useRouterFeeDetails from '../../hooks/bridge/useRouterFeeDetails';
import useRouterQuoteParams from '../../hooks/bridge/useRouterQuoteParams';
import useHyperlaneQuoteParams from '../../hooks/bridge/useHyperlaneQuoteParams';
import BridgeActionButton from '../../components/bridge/BridgeActionButton';
import useRouterTransferData from '../../hooks/bridge/useRouterTransferData';

const BridgeContainer = () => {
  const { network } = useNetworkStore();
  const [activeAccount] = useActiveAccount();
  const { transferable: balance } = useBalances();
  const [isTxInProgress, setIsTxInProgress] = useState(false);
  const { activeChain, activeWallet, switchChain } = useWebContext();

  const destinationChains = useBridgeStore(
    useShallow((store) => store.destinationChains),
  );
  const selectedSourceChain = useBridgeStore(
    useShallow((store) => store.selectedSourceChain),
  );
  const setSelectedSourceChain = useBridgeStore(
    useShallow((store) => store.setSelectedSourceChain),
  );
  const selectedDestinationChain = useBridgeStore(
    useShallow((store) => store.selectedDestinationChain),
  );
  const setSelectedDestinationChain = useBridgeStore(
    (store) => store.setSelectedDestinationChain,
  );
  const mainnetSourceChains = useBridgeStore(
    useShallow((store) => store.mainnetSourceChains),
  );
  const testnetSourceChains = useBridgeStore(
    useShallow((store) => store.testnetSourceChains),
  );
  const isAmountInputError = useBridgeStore(
    useShallow((store) => store.isAmountInputError),
  );
  const setIsAmountInputError = useBridgeStore(
    useShallow((store) => store.setIsAmountInputError),
  );
  const amountInputErrorMessage = useBridgeStore(
    useShallow((store) => store.amountInputErrorMessage),
  );
  const destinationAddress = useBridgeStore(
    useShallow((store) => store.destinationAddress),
  );
  const setDestinationAddress = useBridgeStore(
    useShallow((store) => store.setDestinationAddress),
  );
  const isAddressInputError = useBridgeStore(
    useShallow((store) => store.isAddressInputError),
  );
  const setIsAddressInputError = useBridgeStore(
    useShallow((store) => store.setIsAddressInputError),
  );
  const tokens = useBridgeStore(useShallow((store) => store.tokens));
  const selectedToken = useBridgeStore(
    useShallow((store) => store.selectedToken),
  );
  const setSelectedToken = useBridgeStore(
    useShallow((store) => store.setSelectedToken),
  );
  const amount = useBridgeStore(useShallow((store) => store.amount));
  const setAmount = useBridgeStore(useShallow((store) => store.setAmount));

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

  const srcChains = useMemo(() => {
    if (network.name === 'Tangle Mainnet') {
      return mainnetSourceChains;
    }
    return testnetSourceChains;
  }, [mainnetSourceChains, network.name, testnetSourceChains]);
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

  const { balances, refresh: refreshEvmBalances } = useBridgeEvmBalances(
    sourceTypedChainId,
    destinationTypedChainId,
  );

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

  const routerQuoteParams = useRouterQuoteParams(
    amount,
    selectedToken,
    selectedSourceChain,
    selectedDestinationChain,
    sourceTypedChainId,
    destinationTypedChainId,
    isSolanaDestination,
  );

  const hyperlaneQuoteParams = useHyperlaneQuoteParams(
    amount,
    selectedToken,
    activeAccount,
    destinationAddress,
    sourceTypedChainId,
    destinationTypedChainId,
  );

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
    if (
      destinationAddress === null ||
      !selectedDestinationChain.blockExplorers?.default.url
    ) {
      return undefined;
    }

    return makeExplorerUrl(
      selectedDestinationChain.blockExplorers.default.url,
      destinationAddress,
      'address',
      'web3',
    );
  }, [
    destinationAddress,
    selectedDestinationChain.blockExplorers?.default.url,
  ]);

  const routerFeeDetails = useRouterFeeDetails(
    selectedToken,
    amount,
    routerQuote,
    recipientExplorerUrl,
  );

  const hyperlaneFeeDetails = useHyperlaneFeeDetails(
    activeAccount,
    selectedToken,
    destinationAddress,
    amount,
    hyperlaneQuote,
    recipientExplorerUrl,
  );

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

  const assets = useBridgeAssets(
    selectedToken,
    selectedSourceChain,
    sourceTypedChainId,
    balances,
  );

  const onSelectToken = useCallback(
    (asset: AssetConfig) => {
      const tokenConfig = tokens.find((token) => {
        if (asset.id) {
          return token.tokenType === asset.id;
        } else if (isNativeToken) {
          return token.tokenType === asset.symbol;
        } else {
          return token.address === asset.address;
        }
      });

      if (tokenConfig !== undefined) {
        setSelectedToken(tokenConfig);
      }
    },
    [setSelectedToken, tokens, isNativeToken],
  );

  const sourceTokenBalance = useBridgeTokenBalance(
    selectedToken,
    selectedSourceChain,
    sourceTypedChainId,
    balances,
  );

  const routerTransferData = useRouterTransferData(
    routerQuote,
    routerQuoteParams,
    activeAccount,
    destinationAddress,
  );

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
    // Skip fetching if user is not active or connected
    if (!activeAccount || !activeWallet) return;

    // Initial fetch when dependencies change
    refreshEvmBalances();

    // Re-fetch every 30 seconds
    const interval = 30 * 1000;

    const intervalId = setInterval(() => {
      // Only refresh if the component is visible in the viewport
      if (document.visibilityState === 'visible') {
        refreshEvmBalances();
      }
    }, interval);

    return () => {
      clearInterval(intervalId);
    };
  }, [
    refreshEvmBalances,
    activeAccount,
    activeWallet,
    sourceTypedChainId,
    destinationTypedChainId,
  ]);

  // Set the selected source chain when the network type changes.
  useEffect(() => {
    if (network.name === 'Tangle Mainnet') {
      setSelectedSourceChain(mainnetSourceChains[0]);
    } else {
      setSelectedSourceChain(testnetSourceChains[0]);
    }
  }, [
    mainnetSourceChains,
    network.name,
    setSelectedSourceChain,
    testnetSourceChains,
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
        className="flex flex-col gap-7 w-full max-w-[550px] mx-auto relative"
      >
        <div className="flex flex-col gap-7">
          <div className="flex flex-col items-center justify-center md:flex-row md:justify-between md:items-end md:gap-2">
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
                disabled={srcChains.length <= 1}
              />
            </div>

            <div
              className="px-1 pt-6 cursor-pointer md:pt-0 md:pb-4"
              onClick={onSwitchChains}
            >
              <ArrowLeftRightLineIcon className="w-6 h-6 rotate-90 md:rotate-0" />
            </div>

            <div className="flex flex-col flex-1 w-full gap-2">
              <Label htmlFor="bridge-destination-chain-selector">To</Label>

              <ChainOrTokenButton
                value={
                  selectedDestinationChain.displayName ??
                  selectedDestinationChain.name
                }
                className="w-full"
                iconType="chain"
                textClassName="whitespace-nowrap"
                onClick={openDestinationChainModal}
                disabled={destinationChains.length <= 1}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
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
                  decimals={selectedToken?.decimals}
                  showErrorMessage={false}
                  setErrorMessage={(error) => {
                    setIsAmountInputError(error ? true : false, error);
                  }}
                  max={balance === null ? null : sourceTokenBalance}
                  isDisabled={isTxInProgress}
                />

                <ChainOrTokenButton
                  value={
                    selectedToken?.tokenType === ('SolvBTC.BBN' as EVMTokenEnum)
                      ? 'SolvBTC'
                      : selectedToken?.tokenType || undefined
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
                        {sourceTokenBalance !== null &&
                        selectedToken?.decimals &&
                        selectedToken?.tokenType
                          ? `${formatDisplayAmount(
                              sourceTokenBalance,
                              selectedToken.decimals,
                              AmountFormatStyle.SHORT,
                            )} ${selectedToken.tokenType}`
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
                    {sourceTokenBalance !== null &&
                    selectedToken?.decimals &&
                    selectedToken?.tokenType
                      ? `${formatDisplayAmount(
                          sourceTokenBalance,
                          selectedToken.decimals,
                          AmountFormatStyle.SHORT,
                        )} ${selectedToken.tokenType}`
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
                // NOTE: destinationAddress can be passed as an empty string since the address will always be empty until the user inputs a value
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

          <BridgeActionButton
            activeWallet={activeWallet}
            activeChain={activeChain}
            selectedSourceChain={selectedSourceChain}
            selectedDestinationChain={selectedDestinationChain}
            activeAccount={activeAccount}
            amount={amount}
            destinationAddress={destinationAddress}
            selectedToken={selectedToken}
            isAmountInputError={isAmountInputError}
            isAddressInputError={isAddressInputError}
            isRouterQuote={!!routerQuote}
            isHyperlaneQuote={!!hyperlaneQuote}
            routerQuote={routerQuote}
            hyperlaneQuote={hyperlaneQuote}
            routerQuoteError={routerQuoteError}
            hyperlaneQuoteError={hyperlaneQuoteError}
            isTxInProgress={isTxInProgress}
            isRouterQuoteLoading={isRouterQuoteLoading}
            isHyperlaneQuoteLoading={isHyperlaneQuoteLoading}
            openConfirmBridgeModal={openConfirmBridgeModal}
            refetchRouterQuote={refetchRouterQuote}
            refetchHyperlaneQuote={refetchHyperlaneQuote}
          />
        </div>
      </Card>

      <Modal
        open={isSourceChainModalOpen}
        onOpenChange={updateSourceChainModal}
      >
        <ModalContent size="md">
          <ChainList
            searchInputId="bridge-source-chain-search"
            onClose={closeSourceChainModal}
            chains={srcChains}
            onSelectChain={(chain) => {
              const typedChainId = calculateTypedChainId(
                chain.chainType,
                chain.id,
              );
              setSelectedSourceChain(chain);
              const targetChain = chainsPopulated[typedChainId];
              if (activeWallet) {
                switchChain(targetChain, activeWallet);
              }
            }}
            chainType="source"
            showSearchInput
          />
        </ModalContent>
      </Modal>

      <Modal
        open={isDestinationChainModalOpen}
        onOpenChange={updateDestinationChainModal}
      >
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
        <ModalContent size="md">
          <AssetList
            onClose={closeTokenModal}
            assets={assets}
            onSelectAsset={onSelectToken}
          />
        </ModalContent>
      </Modal>

      {activeAccount?.address && destinationAddress && (
        <BridgeConfirmationModal
          isOpen={isConfirmBridgeModalOpen}
          handleClose={closeConfirmBridgeModal}
          clearBridgeStore={clearBridgeStore}
          sourceChain={selectedSourceChain}
          destinationChain={selectedDestinationChain}
          token={selectedToken}
          feeDetails={
            selectedToken?.bridgeType === EVMTokenBridgeEnum.Router
              ? routerFeeDetails
              : hyperlaneFeeDetails
          }
          activeAccountAddress={activeAccount.address}
          destinationAddress={destinationAddress}
          routerTransferData={routerTransferData}
          sendingAmount={
            selectedToken?.bridgeType === EVMTokenBridgeEnum.Router
              ? (routerFeeDetails?.sendingAmount ?? null)
              : (hyperlaneFeeDetails?.sendingAmount ?? null)
          }
          receivingAmount={
            selectedToken?.bridgeType === EVMTokenBridgeEnum.Router
              ? (routerFeeDetails?.receivingAmount ?? null)
              : (hyperlaneFeeDetails?.receivingAmount ?? null)
          }
          isTxInProgress={isTxInProgress}
          setIsTxInProgress={setIsTxInProgress}
        />
      )}
    </>
  );
};

export default BridgeContainer;
