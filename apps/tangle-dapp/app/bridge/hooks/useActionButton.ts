'use client';

import {
  useConnectWallet,
  useWebContext,
} from '@webb-tools/api-provider-environment';
import getChainFromConfig from '@webb-tools/dapp-config/utils/getChainFromConfig';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import { useCallback, useMemo } from 'react';

import { useBridge } from '../../../context/BridgeContext';
import { BridgeWalletError } from '../../../types/bridge';
import { isEVMChain } from '../../../utils/bridge';
import useTypedChainId from './useTypedChainId';

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

export default function useActionButton() {
  const {
    activeAccount,
    activeWallet,
    loading,
    isConnecting,
    switchChain,
    activeChain,
  } = useWebContext();
  const { toggleModal } = useConnectWallet();
  const {
    amount,
    destinationAddress,
    selectedSourceChain,
    isAmountInputError,
    isAddressInputError,
    walletError,
  } = useBridge();
  const { sourceTypedChainId } = useTypedChainId();

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

  const isEvmWrongNetwork = useMemo(() => {
    if (activeWallet?.platform === 'EVM' && activeChain) {
      if (
        sourceTypedChainId !==
        calculateTypedChainId(activeChain.chainType, activeChain.id)
      ) {
        return true;
      }
    }
    return false;
  }, [activeChain, activeWallet, sourceTypedChainId]);

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

  const switchNetwork = useCallback(() => {
    if (!activeWallet) return;
    const targetChain = getChainFromConfig(selectedSourceChain);
    switchChain(targetChain, activeWallet);
  }, [activeWallet, selectedSourceChain, switchChain]);

  const bridgeTx = useCallback(() => {
    if (isEVMChain(selectedSourceChain) && isEvmWrongNetwork) {
      switchNetwork();
    }

    // TODO: Implement bridge tx
    // TODO: use parseUnits to pass to SygmaSDK tx
    // TODO: handle calculate real amount to bridge when user choose max amount
  }, [selectedSourceChain, isEvmWrongNetwork, switchNetwork]);

  const buttonAction = useMemo(() => {
    if (isRequiredToConnectWallet) return openWalletModal;
    return bridgeTx;
  }, [isRequiredToConnectWallet, openWalletModal, bridgeTx]);

  const buttonText = useMemo(() => {
    if (isWalletAndSourceChainMismatch) return 'Switch Wallet';
    if (isRequiredToConnectWallet) return 'Connect';
    return 'Approve';
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
