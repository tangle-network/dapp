import { useModalQueueManager } from '@webb-tools/api-provider-environment/modal-queue-manager';
import { getExplorerURI } from '@webb-tools/api-provider-environment/transaction/utils/getExplorerURI';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { type ChainConfig } from '@webb-tools/dapp-config/chains/chain-config.interface';
import { useCallback } from 'react';
import SubmittedTxModal from '../components/SubmittedTxModal';
import { BRIDGE_TABS, WRAPPER_TABS } from '../constants';

function useEnqueueSubmittedTx() {
  const { activeApi } = useWebContext();
  const { enqueue } = useModalQueueManager();

  return useCallback(
    (
      transactionHash: string,
      chain?: ChainConfig,
      txType?: (typeof BRIDGE_TABS)[number] | (typeof WRAPPER_TABS)[number]
    ) => {
      const explorer = chain?.blockExplorers?.default?.url;

      const url =
        explorer && activeApi
          ? getExplorerURI(explorer, transactionHash, 'tx', activeApi.type)
          : undefined;

      enqueue(
        <SubmittedTxModal
          txType={txType}
          txExplorerUrl={url}
          txHash={transactionHash}
        />
      );
    },
    [activeApi, enqueue]
  );
}

export default useEnqueueSubmittedTx;
