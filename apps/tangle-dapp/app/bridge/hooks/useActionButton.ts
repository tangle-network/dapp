'use client';

import {
  useConnectWallet,
  useWebContext,
} from '@webb-tools/api-provider-environment';
import getChainFromConfig from '@webb-tools/dapp-config/utils/getChainFromConfig';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import { useCallback, useMemo } from 'react';

import { useBridge } from '../../../context/BridgeContext';
import { isEVMChain } from '../../../utils/bridge';
import useError from './useError';
import useIsWrongEvmNetwork from './useIsWrongEvmNetwork';

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
  const { activeAccount, activeWallet, loading, isConnecting, switchChain } =
    useWebContext();
  const { toggleModal } = useConnectWallet();
  const { amount, destinationAddress, selectedSourceChain } = useBridge();
  const error = useError();
  const isWrongEvmNetwork = useIsWrongEvmNetwork();

  const isNoActiveAccountOrWallet = useMemo(() => {
    return !activeAccount || !activeWallet;
  }, [activeAccount, activeWallet]);

  const errorMessage = useMemo<ErrorMessage | null>(() => {
    switch (error) {
      case 'evm-wrongWallet':
        return {
          text: 'Wallet and Source Chain Mismatch',
          tooltip:
            'Source Chain is EVM but the connected wallet only supports Substrate networks',
        };
      case 'substrate-wrongWallet':
        return {
          text: 'Wallet and Source Chain Mismatch',
          tooltip:
            'Source Chain is Substrate but the connected wallet only supports EVM networks',
        };
      default:
        return null;
    }
  }, [error]);

  const isWalletAndSourceChainMismatch = useMemo(
    () => error === 'evm-wrongWallet' || error === 'substrate-wrongWallet',
    [error]
  );

  const isInputInsufficient = useMemo(
    () => !amount || !destinationAddress,
    [amount, destinationAddress]
  );

  const isRequiredToConnectWallet = useMemo(
    () => isNoActiveAccountOrWallet || isWalletAndSourceChainMismatch,
    [isNoActiveAccountOrWallet, isWalletAndSourceChainMismatch]
  );

  const openWalletModal = useCallback(() => {
    toggleModal(
      true,
      isWalletAndSourceChainMismatch
        ? calculateTypedChainId(
            selectedSourceChain.chainType,
            selectedSourceChain.id
          )
        : undefined
    );
  }, [toggleModal, isWalletAndSourceChainMismatch, selectedSourceChain]);

  const switchNetwork = useCallback(() => {
    if (!activeWallet) return;
    const targetChain = getChainFromConfig(selectedSourceChain);
    switchChain(targetChain, activeWallet);
  }, [activeWallet, selectedSourceChain, switchChain]);

  const bridgeTx = useCallback(() => {
    if (isEVMChain(selectedSourceChain) && isWrongEvmNetwork) {
      switchNetwork();
    }
  }, [selectedSourceChain, isWrongEvmNetwork, switchNetwork]);

  const buttonAction = useMemo(() => {
    if (isRequiredToConnectWallet) return openWalletModal;
    return bridgeTx;
  }, [isRequiredToConnectWallet, openWalletModal, bridgeTx]);

  const buttonText = useMemo(() => {
    if (isRequiredToConnectWallet) return 'Connect';
    return 'Approve';
  }, [isRequiredToConnectWallet]);

  return {
    isLoading: loading || isConnecting,
    isDisabled:
      isRequiredToConnectWallet || isWrongEvmNetwork
        ? false
        : isInputInsufficient,
    buttonAction,
    buttonText,
    errorMessage,
  } satisfies UseActionButtonReturnType;
}
