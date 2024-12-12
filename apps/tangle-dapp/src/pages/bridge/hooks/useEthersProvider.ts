'use client';

import getViemClient from '@webb-tools/web3-api-provider/utils/getViemClient';
import { useMemo } from 'react';

import { useBridge } from '../../../context/BridgeContext';
import { isEVMChain } from '../../../utils/bridge';
import viemNetworkClientToEthersProvider from '../../../utils/viemNetworkClientToEthersProvider';
import useTypedChainId from './useTypedChainId';

export default function useEthersProvider(chainType: 'src' | 'dest' = 'src') {
  const { selectedSourceChain, selectedDestinationChain } = useBridge();
  const { sourceTypedChainId, destinationTypedChainId } = useTypedChainId();

  const ethersProvider = useMemo(() => {
    const selectedChain =
      chainType === 'src' ? selectedSourceChain : selectedDestinationChain;
    const typedChainId =
      chainType === 'src' ? sourceTypedChainId : destinationTypedChainId;

    if (!isEVMChain(selectedChain)) return null;
    return viemNetworkClientToEthersProvider(getViemClient(typedChainId));
  }, [
    chainType,
    selectedSourceChain,
    selectedDestinationChain,
    sourceTypedChainId,
    destinationTypedChainId,
  ]);

  return ethersProvider;
}
