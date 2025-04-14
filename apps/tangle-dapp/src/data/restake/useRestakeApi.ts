import { useCallback, useMemo } from 'react';
import RestakeSubstrateApi from './RestakeSubstrateApi';
import {
  assertEvmAddress,
  assertSubstrateAddress,
} from '@tangle-network/ui-components';
import { useWebContext } from '@tangle-network/api-provider-environment/webb-context';
import useSubstrateInjectedExtension from '@tangle-network/tangle-shared-ui/hooks/useSubstrateInjectedExtension';
import RestakeEvmApi from './RestakeEvmApi';
import useTxNotification from '../../hooks/useTxNotification';
import { Hash } from 'viem';
import getWagmiConfig from '@tangle-network/dapp-config/wagmi-config';
import { TxName } from '../../constants';
import useAgnosticAccountInfo from '@tangle-network/tangle-shared-ui/hooks/useAgnosticAccountInfo';
import useEvmTxRelayer from '@tangle-network/tangle-shared-ui/hooks/useEvmTxRelayer';
import useIsEvmTxRelayerCandidate from '@tangle-network/tangle-shared-ui/hooks/useIsEvmTxRelayerCandidate';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { useApiPromiseQuery } from '@tangle-network/tangle-shared-ui/hooks/useApiPromiseQuery';

const useRestakeApi = () => {
  const { activeAccount, activeWallet } = useWebContext();
  const injector = useSubstrateInjectedExtension();
  const { notifySuccess, notifyError } = useTxNotification();
  const { isEvm } = useAgnosticAccountInfo();
  const relayEvmTx = useEvmTxRelayer();
  const isEvmTxRelayerCandidate = useIsEvmTxRelayerCandidate();

  const createExplorerTxUrl = useNetworkStore(
    (store) => store.network2?.createExplorerTxUrl,
  );

  const rpcEndpoint = useNetworkStore((store) => store.network2?.wsRpcEndpoint);

  const { data: apiPromise } = useApiPromiseQuery(rpcEndpoint);

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
    if (
      activeWallet === undefined ||
      activeAccount === null ||
      isEvmTxRelayerCandidate === null
    ) {
      return null;
    }

    switch (activeWallet.platform) {
      case 'Substrate': {
        if (injector === null || apiPromise === undefined) {
          return null;
        }

        const substrateAddress = assertSubstrateAddress(activeAccount.address);

        return new RestakeSubstrateApi(
          substrateAddress,
          injector.signer,
          apiPromise,
          onSuccess,
          onFailure,
        );
      }
      case 'EVM': {
        const evmAddress = assertEvmAddress(activeAccount.address);

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
      }
    }
  }, [
    activeAccount,
    activeWallet,
    apiPromise,
    injector,
    isEvmTxRelayerCandidate,
    onFailure,
    onSuccess,
    relayEvmTx,
  ]);

  return api;
};

export default useRestakeApi;
