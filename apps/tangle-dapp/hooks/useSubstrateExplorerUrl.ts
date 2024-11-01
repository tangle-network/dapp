import {
  ExplorerVariant,
  getExplorerUrl,
} from '@webb-tools/api-provider-environment/transaction/utils';
import { useCallback } from 'react';

import useNetworkStore from '../context/useNetworkStore';
import { ExplorerType } from '../types';

const useSubstrateExplorerUrl = () => {
  const { network } = useNetworkStore();

  return useCallback(
    (pathOrHash: string, variant: ExplorerVariant): URL | null => {
      const explorerUrl =
        network.nativeExplorerUrl ?? network.polkadotJsDashboardUrl;

      // Was not able to determine the explorer URL, or it
      // is not defined for the current network.
      if (explorerUrl === undefined) {
        return null;
      }

      return getExplorerUrl(
        explorerUrl,
        pathOrHash,
        variant,
        ExplorerType.Substrate,
      );
    },
    [network.nativeExplorerUrl, network.polkadotJsDashboardUrl],
  );
};

export default useSubstrateExplorerUrl;
