'use client';

import chainsPopulated from '@tangle-network/dapp-config/chains/chainsPopulated';
import isDefined from '@tangle-network/dapp-types/utils/isDefined';
import { useContext, useEffect } from 'react';

import { PolkadotApiContext } from '../context/PolkadotApiContext';

export default function usePolkadotApi() {
  const ctx = useContext(PolkadotApiContext);
  if (ctx === undefined) {
    throw new Error('usePolkadotApi must be used within a PolkadotApiProvider');
  }
  return ctx;
}

export function useRpcSubscription(typedChainId?: number | null) {
  const { setCustomRpc } = usePolkadotApi();

  // Subscribe to sourceTypedChainId and update customRpc
  useEffect(() => {
    if (!isDefined(typedChainId)) return;

    const chain = chainsPopulated[typedChainId];
    setCustomRpc(chain?.rpcUrls.default.webSocket?.[0]);
  }, [setCustomRpc, typedChainId]);
}
