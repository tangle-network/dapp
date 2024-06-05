'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { useMemo } from 'react';

import { useBridge } from '../../../context/BridgeContext';
import { isEVMChain, isSubstrateChain } from '../../../utils/bridge';

export default function useError() {
  const { activeWallet } = useWebContext();
  const { selectedSourceChain } = useBridge();

  const walletAndSourceChainMismatch = useMemo(() => {
    if (
      activeWallet?.platform === 'Substrate' &&
      isEVMChain(selectedSourceChain)
    ) {
      return 'evm-wrongWallet';
    }

    if (
      activeWallet?.platform === 'EVM' &&
      isSubstrateChain(selectedSourceChain)
    ) {
      return 'substrate-wrongWallet';
    }

    return null;
  }, [activeWallet?.platform, selectedSourceChain]);

  return walletAndSourceChainMismatch;
}
