'use client';

import getViemClient from '@webb-tools/web3-api-provider/utils/getViemClient';
import { useMemo } from 'react';

import { useBridge } from '../../../context/BridgeContext';
import { isEVMChain } from '../../../utils/bridge';
import viemNetworkClientToEthersProvider from '../../../utils/viemNetworkClientToEthersProvider';
import useTypedChainId from './useTypedChainId';

export default function useEthersProvider() {
  const { selectedSourceChain } = useBridge();
  const { sourceTypedChainId } = useTypedChainId();

  const evmViemClient = useMemo(() => {
    if (!isEVMChain(selectedSourceChain)) return null;
    return viemNetworkClientToEthersProvider(getViemClient(sourceTypedChainId));
  }, [selectedSourceChain, sourceTypedChainId]);

  return evmViemClient;
}
