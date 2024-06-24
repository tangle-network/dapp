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
      isPolkadotPortal?: boolean,
    ): URL | null => {
      // Explorer type will be default to the current network if not provided
      const explorerType =
        type ?? (isEvm ? ExplorerType.EVM : ExplorerType.Substrate);

      const explorerUrl =
        typeof explorerUrl_ === 'string'
          ? explorerUrl_
          : isEvm
            ? network.evmExplorerUrl
            : network.polkadotExplorerUrl;

      if (explorerUrl === undefined) {
        return null;
      }

      return getExplorerURI(
        explorerUrl,
        hash,
        variant,
        explorerType,
        isPolkadotPortal,
      );
    },
    [network.evmExplorerUrl, network.polkadotExplorerUrl, isEvm],
  );
};

export default useExplorerUrl;
