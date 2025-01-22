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

const useRestakeApi = () => {
  const { apiPromise } = usePolkadotApi();
  const { activeAccount, activeWallet } = useWebContext();
  const injector = useSubstrateInjectedExtension();
  const { notifyProcessing, notifySuccess, notifyError } = useTxNotification();

  const onSuccess = useCallback(() => {
    notifySuccess();
  }, [notifySuccess]);

  const onFailure = useCallback(
    (error: Error) => {
      notifyError(error);
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
          activeAccount,
          activeWallet,
          onSuccess,
          onFailure,
        );
      }
    }
  }, [activeAccount, activeWallet, apiPromise, injector, onFailure, onSuccess]);

  return api;
};

export default useRestakeApi;
