import { useCallback, useMemo } from 'react';
import useTxNotification from '../../hooks/useTxNotification';
import { Hash } from 'viem';
import getWagmiConfig from '@tangle-network/dapp-config/wagmi-config';
import { TxName } from '../../constants';
import useAgnosticAccountInfo from '@tangle-network/tangle-shared-ui/hooks/useAgnosticAccountInfo';
import useEvmTxRelayer from '@tangle-network/tangle-shared-ui/hooks/useEvmTxRelayer';
import useIsEvmTxRelayerCandidate from '@tangle-network/tangle-shared-ui/hooks/useIsEvmTxRelayerCandidate';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import RestakeEvmApi from './RestakeEvmApi';
import useEvmAddress from '@tangle-network/tangle-shared-ui/hooks/useEvmAddress';

const useRestakeApi = () => {
  const evmAddress = useEvmAddress();
  const { notifySuccess, notifyError } = useTxNotification();
  const { isEvm } = useAgnosticAccountInfo();
  const relayEvmTx = useEvmTxRelayer();
  const isEvmTxRelayerCandidate = useIsEvmTxRelayerCandidate();

  const createExplorerTxUrl = useNetworkStore(
    (store) => store.network2?.createExplorerTxUrl,
  );

  const onSuccess = useCallback(
    (txHash: Hash, blockHash: Hash, txName: TxName) => {
      const explorerUrl =
        isEvm === null || createExplorerTxUrl === undefined
          ? null
          : createExplorerTxUrl(isEvm, txHash, blockHash);

      notifySuccess(txName, explorerUrl);
    },
    [createExplorerTxUrl, isEvm, notifySuccess],
  );

  const onFailure = useCallback(
    (txName: TxName, error: Error) => {
      notifyError(txName, error);
      console.error(error);
    },
    [notifyError],
  );

  const api = useMemo(() => {
    // Not yet ready.
    if (evmAddress === null || isEvmTxRelayerCandidate === null) {
      return null;
    }

    // Wait for the relay EVM function to be ready.
    if (isEvmTxRelayerCandidate && relayEvmTx === null) {
      return null;
    }

    return new RestakeEvmApi(
      relayEvmTx,
      isEvmTxRelayerCandidate,
      evmAddress,
      evmAddress,
      getWagmiConfig(),
      onSuccess,
      onFailure,
    );
  }, [evmAddress, isEvmTxRelayerCandidate, onFailure, onSuccess, relayEvmTx]);

  return api;
};

export default useRestakeApi;
