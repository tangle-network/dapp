import { useActiveAccount } from '@tangle-network/api-provider-environment/hooks/useActiveAccount';
import { makeExplorerUrl } from '@tangle-network/api-provider-environment/transaction/utils';
import { calculateTypedChainId } from '@tangle-network/dapp-types/TypedChainId';
import { chainsConfig, chainsPopulated } from '@tangle-network/dapp-config';
import { EVMTokenEnum } from '@tangle-network/evm-contract-metadata';
import ArrowLeftRightLineIcon from '@tangle-network/icons/ArrowLeftRightLineIcon';
import { Close } from '@tangle-network/icons';
import WalletIcon from '@tangle-network/icons/WalletIcon';
import {
  AmountFormatStyle,
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
  Tooltip,
  TooltipTrigger,
  TooltipBody,
} from '@tangle-network/ui-components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { useShallow } from 'zustand/react/shallow';
import AddressInput from '../../../components/AddressInput';
import AmountInput from '../../../components/AmountInput';
import { BridgeConfirmationModal } from '../components/BridgeConfirmationModal';
import { BridgeFeeDetail } from '../components/BridgeFeeDetail';
import ErrorMessage from '../../../components/ErrorMessage';
import { AssetConfig, AssetList } from '../../../components/Lists/AssetList';
import { ChainList } from '../../../components/Lists/ChainList';
import { AddressType } from '../../../constants';
import useBridgeStore from '../context/useBridgeStore';
import useBalances from '@tangle-network/tangle-shared-ui/hooks/useBalances';
import { useEvmBalances } from '../hooks/useEvmBalances';
import { useHyperlaneQuote } from '../hooks/useHyperlaneQuote';
import useIsNativeToken from '../hooks/useIsNativeToken';
import { useWebContext } from '@tangle-network/api-provider-environment/webb-context';
import { useConnectWallet } from '@tangle-network/api-provider-environment/ConnectWallet';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import useAssets from '../hooks/useAssets';
import useTokenBalance from '../hooks/useTokenBalance';
import useHyperlaneFeeDetails from '../hooks/useHyperlaneFeeDetails';
import useHyperlaneQuoteParams from '../hooks/useHyperlaneQuoteParams';
import BridgeActionButton from '../components/BridgeActionButton';
import { get } from 'lodash';
import { PresetTypedChainId } from '@tangle-network/dapp-types/ChainId';

const BridgeContainer = () => {
  const { network } = useNetworkStore();
  const [activeAccount] = useActiveAccount();
  const { transferable: balance } = useBalances();
  const [isTxInProgress, setIsTxInProgress] = useState(false);
  const { activeChain, activeWallet, switchChain } = useWebContext();
  const { toggleModal } = useConnectWallet();

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
  const sendingAmount = useBridgeStore(
    useShallow((store) => store.sendingAmount),
  );
  const receivingAmount = useBridgeStore(
    useShallow((store) => store.receivingAmount),
  );

  const srcChains = useMemo(() => {
    return [...mainnetSourceChains, ...testnetSourceChains];
  }, [mainnetSourceChains, testnetSourceChains]);

  useEffect(() => {
    if (activeChain) {
      const activeChainConfig = calculateTypedChainId(
        activeChain.chainType,
        activeChain.id,
      );

      setSelectedSourceChain(get(chainsConfig, activeChainConfig));
    } else {
      if (network.name === 'Tangle Mainnet') {
        setSelectedSourceChain(
          get(chainsConfig, PresetTypedChainId.TangleMainnetEVM),
        );
      } else {
        setSelectedSourceChain(
          get(chainsConfig, PresetTypedChainId.TangleTestnetEVM),
        );
      }
    }
  }, [activeChain, network.name, setSelectedSourceChain]);

  const [showAddressInput, setShowAddressInput] = useState(false);

  useEffect(() => {
    if (activeAccount?.address && !showAddressInput) {
      setDestinationAddress(activeAccount.address);
    }
  }, [activeAccount, setDestinationAddress, showAddressInput]);

  const sourceTypedChainId = useMemo(() => {
    return calculateTypedChainId(
      selectedSourceChain.chainType,
      selectedSourceChain.id,
    );
  }, [selectedSourceChain]);

  const isWrongWallet = useMemo(() => {
    return activeWallet?.platform === 'Substrate';
  }, [activeWallet?.platform]);

  const handleWrongWallet = useCallback(() => {
    if (isWrongWallet) {
      toggleModal(true, sourceTypedChainId);
    }
  }, [isWrongWallet, toggleModal, sourceTypedChainId]);

  const destinationTypedChainId = useMemo(() => {
    return calculateTypedChainId(
      selectedDestinationChain.chainType,
      selectedDestinationChain.id,
    );
  }, [selectedDestinationChain]);

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

  const { balances, refresh: refreshEvmBalances } = useEvmBalances(
    sourceTypedChainId,
    destinationTypedChainId,
  );

  const isNativeToken = useIsNativeToken(
    calculateTypedChainId(
      selectedSourceChain.chainType,
      selectedSourceChain.id,
    ),
  );

  const [addressInputErrorMessage, setAddressInputErrorMessage] = useState<
    string | null
  >(null);

  const isSolanaDestination = selectedDestinationChain.name === 'Solana';

  const hyperlaneQuoteParams = useHyperlaneQuoteParams(
    activeAccount,
    sourceTypedChainId,
    destinationTypedChainId,
  );

  const {
    data: hyperlaneQuote,
    isFetching: isHyperlaneQuoteFetching,
    refetch: refetchHyperlaneQuote,
    error: hyperlaneQuoteError,
  } = useHyperlaneQuote(hyperlaneQuoteParams);

  const recipientExplorerUrl = useMemo(() => {
    if (
      destinationAddress === null ||
      !selectedDestinationChain.blockExplorers?.default.url
    ) {
      return null;
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

  const hyperlaneFeeDetails = useHyperlaneFeeDetails(
    activeAccount,
    hyperlaneQuote,
    recipientExplorerUrl,
  );

  const clearBridgeStore = useCallback(() => {
    setAmount(null);
    setDestinationAddress(null);
    setIsAmountInputError(false, null);
    setIsAddressInputError(false);
    setShowAddressInput(false);
  }, [
    setAmount,
    setDestinationAddress,
    setIsAmountInputError,
    setIsAddressInputError,
  ]);

  const onSwitchChains = useCallback(() => {
    if (isWrongWallet) {
      handleWrongWallet();
      return;
    }

    if (activeWallet) {
      const typedChainId = calculateTypedChainId(
        selectedDestinationChain.chainType,
        selectedDestinationChain.id,
      );
      const targetChain = chainsPopulated[typedChainId];
      switchChain(targetChain, activeWallet);

      setSelectedSourceChain(selectedDestinationChain);
      setSelectedDestinationChain(selectedSourceChain);
      refreshEvmBalances();
      clearBridgeStore();
    }
  }, [
    isWrongWallet,
    activeWallet,
    handleWrongWallet,
    selectedDestinationChain,
    switchChain,
    setSelectedSourceChain,
    setSelectedDestinationChain,
    selectedSourceChain,
    refreshEvmBalances,
    clearBridgeStore,
  ]);

  const assets = useAssets(sourceTypedChainId, balances);

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

  const sourceTokenBalance = useTokenBalance(sourceTypedChainId, balances);

  // Reset inputs after the active account, wallet or chain is
  // disconnected.
  useEffect(() => {
    if (!activeAccount || !activeWallet || !activeChain) {
      setAmount(null);
      setDestinationAddress(null);
      setIsAmountInputError(false, null);
      setIsAddressInputError(false);
      setShowAddressInput(false);
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

  return (
    <>
      <Typography
        variant="h4"
        fw="bold"
        className="text-mono-200 dark:text-mono-0 max-w-[540px] mx-auto w-full text-left"
      >
        Bridge
      </Typography>

      <Card
        withShadow
        className="flex flex-col gap-7 w-full max-w-[540px] mx-auto relative"
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
                onClick={() => {
                  if (isWrongWallet) {
                    handleWrongWallet();
                    return;
                  }
                  openSourceChainModal();
                }}
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
                onClick={() => {
                  if (isWrongWallet) {
                    handleWrongWallet();
                    return;
                  }
                  openDestinationChainModal();
                }}
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
                  isDisabled={isWrongWallet || isTxInProgress}
                />

                <ChainOrTokenButton
                  value={
                    selectedToken?.tokenType === ('SolvBTC.BBN' as EVMTokenEnum)
                      ? 'SolvBTC'
                      : selectedToken?.tokenType || undefined
                  }
                  iconType="token"
                  onClick={() => {
                    if (isWrongWallet) {
                      handleWrongWallet();
                      return;
                    }
                    openTokenModal();
                  }}
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
                        <WalletIcon size="md" /> Balance:{' '}
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
                    <WalletIcon size="md" /> Balance:{' '}
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

            {showAddressInput && (
              <div className="flex flex-col gap-2 duration-300 ease-out animate-in fade-in slide-in-from-top-4">
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
            )}
          </div>

          {hyperlaneQuote &&
            !isHyperlaneQuoteFetching &&
            hyperlaneFeeDetails && (
              <BridgeFeeDetail
                token={hyperlaneFeeDetails.token}
                amounts={hyperlaneFeeDetails.amounts}
                recipientExplorerUrl={recipientExplorerUrl}
              />
            )}

          <div className="flex items-center gap-2">
            <BridgeActionButton
              activeWallet={activeWallet}
              activeChain={activeChain}
              selectedSourceChain={selectedSourceChain}
              selectedDestinationChain={selectedDestinationChain}
              sourceTypedChainId={sourceTypedChainId}
              isWrongWallet={isWrongWallet}
              activeAccount={activeAccount}
              amount={amount}
              destinationAddress={destinationAddress}
              selectedToken={selectedToken}
              isAmountInputError={isAmountInputError}
              isAddressInputError={isAddressInputError}
              isHyperlaneQuote={!!hyperlaneQuote}
              hyperlaneQuote={hyperlaneQuote}
              hyperlaneQuoteError={hyperlaneQuoteError}
              isTxInProgress={isTxInProgress}
              isHyperlaneQuoteLoading={isHyperlaneQuoteFetching}
              openConfirmBridgeModal={openConfirmBridgeModal}
              refetchHyperlaneQuote={refetchHyperlaneQuote}
            />

            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="utility"
                  className="p-2 rounded-full w-fit"
                  onClick={() => {
                    if (showAddressInput) {
                      setDestinationAddress(activeAccount?.address || null);
                      setIsAddressInputError(false);
                      setAddressInputErrorMessage(null);
                      setShowAddressInput(false);
                    } else {
                      setShowAddressInput(true);
                    }
                  }}
                >
                  {showAddressInput ? (
                    <Close size="lg" />
                  ) : (
                    <WalletIcon size="lg" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipBody side="bottom">
                {!showAddressInput
                  ? 'Send to a different wallet'
                  : 'Send to your wallet'}
              </TooltipBody>
            </Tooltip>
          </div>
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
            groupByChainType
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
          feeDetails={hyperlaneFeeDetails}
          activeAccountAddress={activeAccount.address}
          destinationAddress={destinationAddress}
          sendingAmount={sendingAmount}
          receivingAmount={receivingAmount}
          isTxInProgress={isTxInProgress}
          setIsTxInProgress={setIsTxInProgress}
        />
      )}
    </>
  );
};

export default BridgeContainer;
