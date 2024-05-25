'use client';

import {
  useConnectWallet,
  useWebContext,
} from '@webb-tools/api-provider-environment';
import { calculateTypedChainId } from '@webb-tools/sdk-core/typed-chain-id';
import { useCallback, useMemo } from 'react';

import { useBridge } from '../../../context/BridgeContext';
import { isEVMChain, isSubstrateChain } from '../../../utils/bridge';

type UseActionButtonReturnType = {
  isLoading: boolean;
  isDisabled: boolean;
  buttonAction: () => void;
  buttonText: string;
  errorMessage: {
    text: string;
    tooltip?: string | null;
  } | null;
};

export default function useActionButton() {
  const { activeAccount, activeWallet, loading, isConnecting } =
    useWebContext();
  const { toggleModal } = useConnectWallet();
  const { amount, destinationAddress, selectedSourceChain } = useBridge();

  const isNoActiveAccountOrWallet = useMemo(() => {
    return !activeAccount || !activeWallet;
  }, [activeAccount, activeWallet]);

  const walletAndSourceChainMismatchTooltip = useMemo(() => {
    if (
      activeWallet?.platform === 'Substrate' &&
      isEVMChain(selectedSourceChain.chainType)
    ) {
      return 'Substrate Wallet cannot perform tx on an EVM Chain';
    }

    if (
      activeWallet?.platform === 'EVM' &&
      isSubstrateChain(selectedSourceChain.chainType)
    ) {
      return 'EVM Wallet cannot perform tx on a Polkadot/Substrate Chain';
    }

    return null;
  }, [activeWallet?.platform, selectedSourceChain.chainType]);

  const isWalletAndSourceChainMismatch = useMemo(
    () => !!walletAndSourceChainMismatchTooltip,
    [walletAndSourceChainMismatchTooltip]
  );

  const isInputInsufficient = useMemo(
    () => !amount || !destinationAddress,
    [amount, destinationAddress]
  );

  const requiredToConnectWallet = useMemo(
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

  const bridgeTx = useCallback(() => {
    //
  }, []);

  return {
    isLoading: loading || isConnecting,
    isDisabled: requiredToConnectWallet ? false : isInputInsufficient,
    buttonAction: requiredToConnectWallet ? openWalletModal : bridgeTx,
    buttonText: requiredToConnectWallet ? 'Connect' : 'Approve',
    errorMessage: isWalletAndSourceChainMismatch
      ? {
          text: 'Wallet and Source Chain Mismatch',
          tooltip: walletAndSourceChainMismatchTooltip,
        }
      : null,
  } satisfies UseActionButtonReturnType;
}
