import { useCallback, useMemo } from 'react';
import ServiceSubstrateApi from './ServiceSubstrateApi';
import usePolkadotApi from '@tangle-network/tangle-shared-ui/hooks/usePolkadotApi';
import {
  assertSubstrateAddress,
} from '@tangle-network/ui-components';
import { useWebContext } from '@tangle-network/api-provider-environment/webb-context';
import useSubstrateInjectedExtension from '@tangle-network/tangle-shared-ui/hooks/useSubstrateInjectedExtension';
import useTxNotification from '../../hooks/useTxNotification';
import { Hash } from 'viem';
import { TxName } from '../../constants';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';

const useBlueprintServiceApi = () => {
  const { apiPromise } = usePolkadotApi();
  const { activeAccount } = useWebContext();
  const injector = useSubstrateInjectedExtension();
  const { notifySuccess, notifyError } = useTxNotification();
  // @dev: Service actions prefer on Substrate API.
  const isEVM = false;

  const createExplorerTxUrl = useNetworkStore(
    (store) => store.network.createExplorerTxUrl,
  );

  const onSuccess = useCallback(
    (txHash: Hash, blockHash: Hash, txName: TxName) => {
      const explorerUrl = createExplorerTxUrl(isEVM, txHash, blockHash);

      notifySuccess(txName, explorerUrl);
    },
    [createExplorerTxUrl, notifySuccess],
  );

  const onFailure = useCallback(
    (txName: TxName, error: Error) => {
      notifyError(txName, error);
      console.error(error);
    },
    [notifyError],
  );

  const api = useMemo(() => {
    if (
      activeAccount === null
    ) {
      return null;
    }

    if (injector === null) {
      return null;
    }

    const substrateAddress = assertSubstrateAddress(activeAccount.address);

    return new ServiceSubstrateApi(
      substrateAddress,
      injector.signer,
      apiPromise,
      onSuccess,
      onFailure,
    );
  }, [
    activeAccount,
    apiPromise,
    injector,
    onFailure,
    onSuccess,
  ]);

  return api;
};

export default useBlueprintServiceApi;
