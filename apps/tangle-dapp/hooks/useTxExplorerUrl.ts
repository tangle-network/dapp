import { getExplorerURI } from '@webb-tools/api-provider-environment/transaction/utils';
import { useCallback } from 'react';

import useNetworkStore from '../context/useNetworkStore';
import { ExplorerType } from '../types';

// TODO: This won't work for all cases: Consider the case of the `Success` Airdrop claim page; it will provide a blockHash, not a txHash. When the explorer URL is opened, it shows an empty page! Fix it up.
const useTxExplorerUrl = () => {
  const { network } = useNetworkStore();

  return useCallback(
    (txHash: string, type: ExplorerType): URL | null => {
      const explorerUrl =
        type === ExplorerType.Substrate
          ? network.polkadotExplorerUrl
          : network.evmExplorerUrl;

      if (explorerUrl === undefined) {
        return null;
      }

      return getExplorerURI(explorerUrl, txHash, 'tx', type);
    },
    [network.evmExplorerUrl, network.polkadotExplorerUrl]
  );
};

export default useTxExplorerUrl;
