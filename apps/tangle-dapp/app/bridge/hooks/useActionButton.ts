'use client';

import {
  useConnectWallet,
  useWebContext,
} from '@webb-tools/api-provider-environment';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import { useCallback, useMemo } from 'react';

import { useBridge } from '../../../context/BridgeContext';
import { BridgeWalletError } from '../../../types/bridge';

type UseActionButtonReturnType = {
  isLoading: boolean;
  isDisabled: boolean;
  buttonAction: () => void;
  buttonText: string;
  buttonLoadingText?: string;
  errorMessage: ErrorMessage | null;
};

type ErrorMessage = {
  text: string;
  tooltip?: string | null;
};

export default function useActionButton({
  handleOpenConfirmModal,
}: {
  handleOpenConfirmModal: () => void;
}) {
  const { activeAccount, activeChain, activeWallet, loading, isConnecting } =
    useWebContext();

  const { toggleModal } = useConnectWallet();

  const {
    amount,
    destinationAddress,
    selectedSourceChain,
    isAmountInputError,
    isAddressInputError,
    walletError,
    switchToSelectedChain,
    feeItems,
    isTransferring,
    setAmount,
    setDestinationAddress,
  } = useBridge();

  const isNoActiveAccountOrWallet = useMemo(() => {
    return !activeAccount || !activeWallet;
  }, [activeAccount, activeWallet]);

  const errorMessage = useMemo<ErrorMessage | null>(() => {
    switch (walletError) {
      case BridgeWalletError.WalletMismatchEvm:
        return {
          text: 'Wallet and Source Chain Mismatch',
          tooltip:
            'Selected Source Chain is EVM but the connected wallet only supports Substrate chains',
        };
      case BridgeWalletError.WalletMismatchSubstrate:
        return {
          text: 'Wallet and Source Chain Mismatch',
          tooltip:
            'Selected Source Chain is Substrate but the connected wallet only supports EVM chains',
        };
      case BridgeWalletError.NetworkMismatchEvm:
        return {
          text: `Switch to ${selectedSourceChain.name}`,
          tooltip: `Selected Source Chain is ${selectedSourceChain.name} but the connected wallet is on ${activeChain?.name}`,
        };
      case BridgeWalletError.NetworkMismatchSubstrate:
        return {
          text: `Switch to ${selectedSourceChain.name}`,
          tooltip: `Selected Source Chain is ${selectedSourceChain.name} but the connected wallet is on ${activeChain?.name}`,
        };
      default:
        return null;
    }
  }, [walletError, selectedSourceChain, activeChain]);

  const isWalletAndSourceChainMismatch =
    walletError === BridgeWalletError.WalletMismatchEvm ||
    walletError === BridgeWalletError.WalletMismatchSubstrate;

  const isSelectedNetworkAndSourceChainMismatch =
    walletError === BridgeWalletError.NetworkMismatchEvm ||
    walletError === BridgeWalletError.NetworkMismatchSubstrate;

  const isInputInsufficient = useMemo(
    () => !amount || !destinationAddress,
    [amount, destinationAddress],
  );

  const isAmountZeroOrNegative = !amount || amount.isZero() || amount.isNeg();

  const isRequiredToConnectWallet = useMemo(
    () => isNoActiveAccountOrWallet || isWalletAndSourceChainMismatch,
    [isNoActiveAccountOrWallet, isWalletAndSourceChainMismatch],
  );

  const openWalletModal = useCallback(() => {
    toggleModal(
      true,
      isWalletAndSourceChainMismatch
        ? calculateTypedChainId(
            selectedSourceChain.chainType,
            selectedSourceChain.id,
          )
        : undefined,
    );

    setAmount(null);
    setDestinationAddress('');
  }, [
    toggleModal,
    isWalletAndSourceChainMismatch,
    selectedSourceChain.chainType,
    selectedSourceChain.id,
    setAmount,
    setDestinationAddress,
  ]);

  const switchChain = useCallback(() => {
    switchToSelectedChain();
    setAmount(null);
    setDestinationAddress('');
  }, [switchToSelectedChain, setAmount, setDestinationAddress]);

  const buttonAction = useMemo(() => {
    if (isRequiredToConnectWallet) return openWalletModal;
    if (isSelectedNetworkAndSourceChainMismatch) return switchChain;
    return handleOpenConfirmModal;
  }, [
    isRequiredToConnectWallet,
    openWalletModal,
    isSelectedNetworkAndSourceChainMismatch,
    switchChain,
    handleOpenConfirmModal,
  ]);

  const buttonText = useMemo(() => {
    if (isRequiredToConnectWallet) return 'Connect';
    if (isWalletAndSourceChainMismatch) return 'Switch Wallet';
    if (isSelectedNetworkAndSourceChainMismatch) return 'Switch Chain';
    if (isTransferring) return 'Transferring...';
    return 'Transfer';
  }, [
    isWalletAndSourceChainMismatch,
    isSelectedNetworkAndSourceChainMismatch,
    isRequiredToConnectWallet,
    isTransferring,
  ]);

  const buttonLoadingText = useMemo(() => {
    if (isRequiredToConnectWallet || isSelectedNetworkAndSourceChainMismatch)
      return 'Connecting...';
    if (isTransferring) return 'Transferring...';
  }, [
    isRequiredToConnectWallet,
    isSelectedNetworkAndSourceChainMismatch,
    isTransferring,
  ]);

  return {
    isLoading: loading || isConnecting,
    isDisabled:
      isRequiredToConnectWallet || isSelectedNetworkAndSourceChainMismatch
        ? false
        : isInputInsufficient ||
          isAmountInputError ||
          isAddressInputError ||
          !feeItems.hyperlaneInterchain ||
          feeItems.sygmaBridge?.isLoading ||
          feeItems.hyperlaneInterchain?.isLoading ||
          feeItems.gas?.isLoading ||
          feeItems.gas?.amount === null ||
          isTransferring ||
          isAmountZeroOrNegative,
    buttonAction,
    buttonText,
    buttonLoadingText,
    errorMessage,
  } satisfies UseActionButtonReturnType;
}
