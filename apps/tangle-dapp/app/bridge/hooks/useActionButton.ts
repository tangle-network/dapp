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
  errorMessage: ErrorMessage | null;
};

type ErrorMessage = {
  text: string;
  tooltip?: string | null;
};

export default function useActionButton(handleOpenConfirmModal: () => void) {
  const { activeAccount, activeWallet, loading, isConnecting } =
    useWebContext();
  const { toggleModal } = useConnectWallet();
  const {
    amount,
    destinationAddress,
    selectedSourceChain,
    isAmountInputError,
    isAddressInputError,
    walletError,
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
            'Source Chain is EVM but the connected wallet only supports Substrate networks',
        };
      case BridgeWalletError.MismatchSubstrate:
        return {
          text: 'Wallet and Source Chain Mismatch',
          tooltip:
            'Source Chain is Substrate but the connected wallet only supports EVM networks',
        };
      default:
        return null;
    }
  }, [walletError]);

  const isWalletAndSourceChainMismatch = useMemo(
    () =>
      walletError === BridgeWalletError.MismatchEvm ||
      walletError === BridgeWalletError.MismatchSubstrate,
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
    return handleOpenConfirmModal;
  }, [isRequiredToConnectWallet, openWalletModal, handleOpenConfirmModal]);

  const buttonText = useMemo(() => {
    if (isWalletAndSourceChainMismatch) return 'Switch Wallet';
    if (isRequiredToConnectWallet) return 'Connect';
    return 'Transfer';
  }, [isWalletAndSourceChainMismatch, isRequiredToConnectWallet]);

  return {
    isLoading: loading || isConnecting,
    isDisabled: isRequiredToConnectWallet
      ? false
      : isInputInsufficient || isAmountInputError || isAddressInputError,
    buttonAction,
    buttonText,
    errorMessage,
  } satisfies UseActionButtonReturnType;
}
