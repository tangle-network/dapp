import { useCallback, useMemo } from 'react';
import RestakeSubstrateApi from './RestakeSubstrateApi';
import usePolkadotApi from '@webb-tools/tangle-shared-ui/hooks/usePolkadotApi';
import {
  assertEvmAddress,
  assertSubstrateAddress,
} from '@webb-tools/webb-ui-components';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import useSubstrateInjectedExtension from '@webb-tools/tangle-shared-ui/hooks/useSubstrateInjectedExtension';
import RestakeEvmApi from './RestakeEvmApi';
import useTxNotification from '../../hooks/useTxNotification';
import useSubstrateExplorerUrl from '@webb-tools/tangle-shared-ui/hooks/useSubstrateExplorerUrl';
import { Hash } from 'viem';
import getWagmiConfig from '@webb-tools/dapp-config/wagmi-config';
import { TxName } from '../../constants';
import useAgnosticAccountInfo from '@webb-tools/tangle-shared-ui/hooks/useAgnosticAccountInfo';

const useRestakeApi = () => {
  const { apiPromise } = usePolkadotApi();
  const { activeAccount, activeWallet } = useWebContext();
  const injector = useSubstrateInjectedExtension();
  const { resolveExplorerUrl } = useSubstrateExplorerUrl();
  const { notifySuccess, notifyError } = useTxNotification();
  const { isEvm } = useAgnosticAccountInfo();

  const onSuccess = useCallback(
    (txHash: Hash, blockHash: Hash, txName: TxName) => {
      // TODO: A well-defined explorer is not yet available for EVM. For example, explorer.tangle.tools won't work for local dev network.
      const explorerUrl = isEvm ? null : resolveExplorerUrl(txHash, blockHash);

      notifySuccess(txName, explorerUrl);
    },
    [isEvm, notifySuccess, resolveExplorerUrl],
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
    if (activeWallet === undefined || activeAccount === null) {
      return null;
    }

    switch (activeWallet.platform) {
      case 'Substrate': {
        if (injector === null) {
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

        return new RestakeEvmApi(
          evmAddress,
          evmAddress,
          getWagmiConfig(),
          onSuccess,
          onFailure,
        );
      }
    }
  }, [activeAccount, activeWallet, apiPromise, injector, onFailure, onSuccess]);

  return api;
};

export default useRestakeApi;
