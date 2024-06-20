'use client';

import chainsPopulated from '@webb-tools/dapp-config/chains/chainsPopulated';
import { type PropsWithChildren, useMemo } from 'react';

import { PolkadotApiProvider } from '../../context/PolkadotApiContext';
import { RestakeContextProvider } from '../../context/RestakeContext';
import { useSourceTypedChainId } from '../../stores/deposit';

export default function Providers({ children }: PropsWithChildren) {
  const sourceTypedChainId = useSourceTypedChainId();

  const rpc = useMemo(() => {
    const chain = chainsPopulated[sourceTypedChainId];

    return chain.rpcUrls.default?.webSocket?.[0];
  }, [sourceTypedChainId]);

  return (
    <PolkadotApiProvider rpcEndpoint={rpc}>
      <RestakeContextProvider>{children}</RestakeContextProvider>
    </PolkadotApiProvider>
  );
}
