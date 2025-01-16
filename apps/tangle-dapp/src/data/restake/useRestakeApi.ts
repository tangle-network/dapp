import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import getWagmiConfig from '@webb-tools/dapp-config/wagmi-config';
import { WebbPolkadot } from '@webb-tools/polkadot-api-provider';
import assert from 'assert';
import { useMemo } from 'react';

import type { RestakeApiBase } from './RestakeApi/base';
import EvmRestakeApi from './RestakeApi/evm';
import SubstrateRestakeApi from './RestakeApi/substrate';
import { assertEvmAddress } from '@webb-tools/webb-ui-components';

const useRestakeApi = (): RestakeApiBase | null => {
  const { activeAccount, activeWallet, activeApi } = useWebContext();

  return useMemo(() => {
    if (
      activeWallet === undefined ||
      activeAccount === null ||
      activeApi === undefined
    ) {
      return null;
    }

    switch (activeWallet.platform) {
      case 'EVM': {
        const evmAddress = assertEvmAddress(activeAccount.address);

        return new EvmRestakeApi(evmAddress, evmAddress, getWagmiConfig());
      }
      case 'Substrate': {
        assert(activeApi instanceof WebbPolkadot, 'Invalid API');

        return new SubstrateRestakeApi(
          activeAccount.address,
          activeApi.injectedExtension.signer,
          activeApi.apiPromise,
        );
      }
    }
  }, [activeAccount, activeApi, activeWallet]);
};

export default useRestakeApi;
