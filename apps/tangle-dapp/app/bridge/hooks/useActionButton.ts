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
    bridgeFee,
    isBridgeFeeLoading,
    isEstimatedGasFeeLoading,
    switchToCorrectEvmChain,
    isTransferring,
  } = useBridge();

  const isNoActiveAccountOrWallet = useMemo(() => {
    return !activeAccount || !activeWallet;
  }, [activeAccount, activeWallet]);

  const errorMessage = useMemo<ErrorMessage | null>(() => {
    switch (walletError) {
      case BridgeWalletError.MismatchEvm:
        return {
          text: 'Wallet and Source Chain Mismatch',
          tooltip:
            'Selected Source Chain is EVM but the connected wallet only supports Substrate chains',
        };
      case BridgeWalletError.MismatchSubstrate:
        return {
          text: 'Wallet and Source Chain Mismatch',
          tooltip:
            'Selected Source Chain is Substrate but the connected wallet only supports EVM chains',
        };
      case BridgeWalletError.EvmWrongChain:
        return {
          text: 'Wrong EVM Chain Connected',
          tooltip: `Selected Source Chain is ${selectedSourceChain.name} but the connected wallet is on ${activeChain?.name}`,
        };
      default:
        return null;
    }
  }, [walletError, selectedSourceChain, activeChain]);

  const isWalletAndSourceChainMismatch = useMemo(
    () =>
      walletError === BridgeWalletError.MismatchEvm ||
      walletError === BridgeWalletError.MismatchSubstrate,
    [walletError],
  );

  const isEvmWrongChain = useMemo(
    () => walletError === BridgeWalletError.EvmWrongChain,
    [walletError],
  );

  const isInputInsufficient = useMemo(
    () => !amount || !destinationAddress,
    [amount, destinationAddress],
  );

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
  }, [toggleModal, isWalletAndSourceChainMismatch, selectedSourceChain]);

  const buttonAction = useMemo(() => {
    if (isRequiredToConnectWallet) return openWalletModal;
    if (isEvmWrongChain) return switchToCorrectEvmChain;
    return handleOpenConfirmModal;
  }, [
    isRequiredToConnectWallet,
    openWalletModal,
    handleOpenConfirmModal,
    isEvmWrongChain,
    switchToCorrectEvmChain,
  ]);

  const buttonText = useMemo(() => {
    if (isWalletAndSourceChainMismatch) return 'Switch Wallet';
    if (isEvmWrongChain) return 'Switch Network';
    if (isRequiredToConnectWallet) return 'Connect';
    if (isTransferring) return 'Transferring...';
    return 'Transfer';
  }, [
    isWalletAndSourceChainMismatch,
    isRequiredToConnectWallet,
    isEvmWrongChain,
    isTransferring,
  ]);

  const buttonLoadingText = useMemo(() => {
    if (isRequiredToConnectWallet || isEvmWrongChain) return 'Connecting...';
    if (isTransferring) return 'Transferring...';
  }, [isRequiredToConnectWallet, isEvmWrongChain, isTransferring]);

  return {
    isLoading: loading || isConnecting,
    isDisabled:
      isRequiredToConnectWallet || isEvmWrongChain
        ? false
        : isInputInsufficient ||
          isAmountInputError ||
          isAddressInputError ||
          isBridgeFeeLoading ||
          isEstimatedGasFeeLoading ||
          bridgeFee === null ||
          isTransferring,
    buttonAction,
    buttonText,
    buttonLoadingText,
    errorMessage,
  } satisfies UseActionButtonReturnType;
}
