import {
  ExplorerVariant,
  isPolkadotJsDashboard,
  makeExplorerUrl,
} from '@webb-tools/api-provider-environment/transaction/utils';
import { useActiveWallet } from '@webb-tools/api-provider-environment/hooks/useActiveWallet';
import { useCallback } from 'react';
import { Hash } from 'viem';

import useNetworkStore from '../context/useNetworkStore';
import { ExplorerType } from '../types';

const useSubstrateExplorerUrl = () => {
  const { network } = useNetworkStore();
  const [activeWallet] = useActiveWallet();

  const getExplorerUrl = useCallback(
    (
      txOrBlockHashOrAccountAddress: Hash | string,
      variant: ExplorerVariant,
    ): string | null => {
      if (activeWallet === undefined) {
        return null;
      }

      const explorerBaseUrl =
        network.nativeExplorerUrl ?? network.polkadotJsDashboardUrl;

      return makeExplorerUrl(
        explorerBaseUrl,
        txOrBlockHashOrAccountAddress,
        variant,
        activeWallet.platform === 'EVM'
          ? ExplorerType.EVM
          : ExplorerType.Substrate,
      );
    },
    [activeWallet, network.nativeExplorerUrl, network.polkadotJsDashboardUrl],
  );

  // Choose between TX or block hash depending on the network's
  // native explorer. If it is a PolkadotJS explorer, use the
  // block hash. Otherwise, use the transaction hash (for Statescan).
  const resolveExplorerUrl = useCallback(
    (txHash: Hash, txBlockHash: Hash): string | null => {
      // Default to the PolkadotJS explorer, which is always defined
      // for all Tangle networks.
      const explorerBaseUrl =
        network.nativeExplorerUrl ?? network.polkadotJsDashboardUrl;

      const isPolkadotJs = isPolkadotJsDashboard(explorerBaseUrl);

      return isPolkadotJs
        ? getExplorerUrl(txBlockHash, 'block')
        : getExplorerUrl(txHash, 'tx');
    },
    [getExplorerUrl, network.nativeExplorerUrl, network.polkadotJsDashboardUrl],
  );

  return { getExplorerUrl, resolveExplorerUrl };
};

export default useSubstrateExplorerUrl;
