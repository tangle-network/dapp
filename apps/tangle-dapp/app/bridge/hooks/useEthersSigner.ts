'use client';

import { useWebContext } from '@webb-tools/api-provider-environment';
import { WebbWeb3Provider } from '@webb-tools/web3-api-provider';
import { useMemo } from 'react';

import viemConnectorClientToEthersSigner from '../../../utils/viemConnectorClientToEthersSigner';

export default function useEthersSigner() {
  const { activeApi } = useWebContext();

  const ethersSigner = useMemo(() => {
    if (!activeApi || !(activeApi instanceof WebbWeb3Provider)) return null;
    const walletClient = activeApi.walletClient;
    const ethersSigner = viemConnectorClientToEthersSigner(walletClient);
    return ethersSigner;
  }, [activeApi]);

  return ethersSigner;
}
