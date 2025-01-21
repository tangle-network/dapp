import { useMemo } from 'react';
import RestakeSubstrateApi from './RestakeSubstrateApi';
import usePolkadotApi from '@webb-tools/tangle-shared-ui/hooks/usePolkadotApi';
import { assertSubstrateAddress } from '@webb-tools/webb-ui-components';
import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import useSubstrateInjectedExtension from '@webb-tools/tangle-shared-ui/hooks/useSubstrateInjectedExtension';

const useRestakeApi = () => {
  const { apiPromise } = usePolkadotApi();
  const { activeAccount, activeWallet } = useWebContext();
  const injector = useSubstrateInjectedExtension();

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
        );
      }

      case 'EVM': {
        throw new Error('Not yet implemented');
      }
    }
  }, [activeAccount, activeWallet, apiPromise, injector]);

  return api;
};

export default useRestakeApi;
