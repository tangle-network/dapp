'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import getChainFromConfig from '@webb-tools/dapp-config/utils/getChainFromConfig';
import { useCallback } from 'react';

import { useBridge } from '../../../context/BridgeContext';
import { isEVMChain } from '../../../utils/bridge';

export default function useEvmWrongChain() {
  const { activeChain, activeWallet, switchChain } = useWebContext();
  const { selectedSourceChain } = useBridge();

  const switchToCorrectEvmChain = useCallback(() => {
    if (!activeWallet) return;
    const correctChain = getChainFromConfig(selectedSourceChain);
    switchChain(correctChain, activeWallet);
  }, [activeWallet, selectedSourceChain, switchChain]);

  return {
    isEvmWrongChain:
      isEVMChain(selectedSourceChain) &&
      activeChain?.id !== selectedSourceChain.id,
    switchToCorrectEvmChain,
  };
}
