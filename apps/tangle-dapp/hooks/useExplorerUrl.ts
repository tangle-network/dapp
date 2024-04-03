import { getExplorerURI } from '@webb-tools/api-provider-environment/transaction/utils';
import { useCallback } from 'react';

import useNetworkStore from '../context/useNetworkStore';

export enum ExplorerType {
  Substrate = 'polkadot',
  EVM = 'web3',
}

const useExplorerUrl = () => {
  const { network } = useNetworkStore();

  return useCallback(
    (transactionOrBlockHash: string, type: ExplorerType): URL | null => {
      const explorerUrl =
        type === ExplorerType.Substrate
          ? network.polkadotExplorer
          : network.evmExplorer;

      if (explorerUrl === undefined) {
        return null;
      }

      return getExplorerURI(explorerUrl, transactionOrBlockHash, 'tx', type);
    },
    [network.evmExplorer, network.polkadotExplorer]
  );
};

export default useExplorerUrl;
