import {
  ExplorerVariant,
  getExplorerURI,
} from '@webb-tools/api-provider-environment/transaction/utils';
import { useCallback } from 'react';

import useNetworkStore from '../context/useNetworkStore';
import { ExplorerType } from '../types';
import useAgnosticAccountInfo from './useAgnosticAccountInfo';

const useExplorerUrl = () => {
  const { network } = useNetworkStore();
  const { isEvm } = useAgnosticAccountInfo();

  return useCallback(
    (
      hash: string,
      variant: ExplorerVariant,
      type?: (typeof ExplorerType)[keyof typeof ExplorerType],
      explorerUrl_?: string, // Specify the explorer URL case
      isPolkadotJsDashboard?: boolean,
    ): URL | null => {
      // Explorer type will be default to the current network if not provided
      const explorerType =
        type ?? (isEvm ? ExplorerType.EVM : ExplorerType.Substrate);

      const explorerUrl =
        typeof explorerUrl_ === 'string'
          ? explorerUrl_
          : isEvm
            ? network.evmExplorerUrl
            : network.nativeExplorerUrl ?? network.polkadotJsDashboardUrl;

      if (explorerUrl === undefined) {
        return null;
      }

      return getExplorerURI(
        explorerUrl,
        hash,
        variant,
        explorerType,
        isPolkadotJsDashboard,
      );
    },
    [
      network.evmExplorerUrl,
      network.nativeExplorerUrl,
      network.polkadotJsDashboardUrl,
      isEvm,
    ],
  );
};

export default useExplorerUrl;
