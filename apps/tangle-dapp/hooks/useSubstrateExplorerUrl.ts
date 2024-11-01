import {
  ExplorerVariant,
  makeExplorerUrl,
} from '@webb-tools/api-provider-environment/transaction/utils';
import { useCallback } from 'react';
import { Hash } from 'viem';

import useNetworkStore from '../context/useNetworkStore';
import { ExplorerType } from '../types';
import { isPolkadotJsDashboard } from '../../../libs/api-provider-environment/src/transaction/utils/makeExplorerUrl';

const useSubstrateExplorerUrl = () => {
  const { network } = useNetworkStore();

  const getExplorerUrl = useCallback(
    (
      txOrBlockHashOrAccountAddress: Hash | string,
      variant: ExplorerVariant,
    ): string => {
      const explorerBaseUrl =
        network.nativeExplorerUrl ?? network.polkadotJsDashboardUrl;

      return makeExplorerUrl(
        explorerBaseUrl,
        txOrBlockHashOrAccountAddress,
        variant,
        ExplorerType.Substrate,
      );
    },
    [network.nativeExplorerUrl, network.polkadotJsDashboardUrl],
  );

  // Choose between TX or block hash depending on the network's
  // native explorer. If it is a PolkadotJS explorer, use the
  // block hash. Otherwise, use the transaction hash (for Statescan).
  const resolveExplorerUrl = useCallback(
    (txHash: Hash, txBlockHash: Hash): string => {
      // Default to the PolkadotJS explorer, which is always defined
      // for all Tangle networks.
      const explorerBaseUrl =
        network.nativeExplorerUrl ?? network.polkadotJsDashboardUrl;

      const isPolkadotJs = isPolkadotJsDashboard(explorerBaseUrl);

      return isPolkadotJs
        ? getExplorerUrl(txBlockHash, 'block')
        : getExplorerUrl(txHash, 'tx');
    },
    [],
  );

  return { getExplorerUrl, resolveExplorerUrl };
};

export default useSubstrateExplorerUrl;
