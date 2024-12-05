'use client';

import { ApiPromise } from '@polkadot/api';
import usePromise from '@webb-tools/tangle-shared-ui/hooks/usePromise';
import { getApiPromise } from '@webb-tools/tangle-shared-ui/utils/polkadot/api';
import { useCallback, useMemo } from 'react';

import { useBridge } from '../../../context/BridgeContext';

export default function useSubstrateApi() {
  const { selectedSourceChain } = useBridge();

  const substrateRpcEndpoint = useMemo(() => {
    return selectedSourceChain.rpcUrls.default.webSocket?.[0];
  }, [selectedSourceChain.rpcUrls.default.webSocket]);

  const { result: substrateApi } = usePromise<ApiPromise | null>(
    useCallback(async () => {
      if (!substrateRpcEndpoint) return null;
      return getApiPromise(substrateRpcEndpoint);
    }, [substrateRpcEndpoint]),
    null,
  );

  return substrateApi;
}
