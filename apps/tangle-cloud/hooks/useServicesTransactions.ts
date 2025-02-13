import { useWebContext } from '@tangle-network/api-provider-environment';
import { WebbError, WebbErrorCodes } from '@tangle-network/dapp-types';
import noop from 'lodash/noop';
import { useMemo } from 'react';
import BaseServices from '../lib/services/base';
import { EvmServices } from '../lib/services/evm';
import getWagmiConfig from '@tangle-network/dapp-config/wagmi-config';
import assert from 'assert';
import { WebbPolkadot } from '@tangle-network/polkadot-api-provider';
import { SubstrateServices } from '../lib/services/substrate';
import { ensureHex } from '@tangle-network/dapp-config';

export default function useServicesTransactions() {
  const { activeAccount, activeWallet, activeApi } = useWebContext();

  return useMemo(() => {
    if (
      activeWallet === undefined ||
      activeAccount === null ||
      activeApi === undefined
    ) {
      return createDummyApi(WebbError.from(WebbErrorCodes.ApiNotReady).message);
    }

    switch (activeWallet.platform) {
      case 'EVM': {
        const evmAddress = ensureHex(activeAccount.address);

        return new EvmServices(evmAddress, evmAddress, getWagmiConfig());
      }

      case 'Substrate': {
        assert(activeApi instanceof WebbPolkadot, 'Invalid API');
        return new SubstrateServices(
          activeAccount.address,
          activeApi.injectedExtension.signer,
          activeApi.apiPromise,
        );
      }

      default: {
        return createDummyApi(
          WebbError.from(WebbErrorCodes.UnsupportedWallet).message,
        );
      }
    }
  }, [activeAccount, activeApi, activeWallet]);
}

function createDummyApi(error: string): BaseServices {
  return {
    validateRegisterArgs: noop,

    register: async (args, eventHandlers) => {
      eventHandlers?.onRegister?.onTxFailed?.(error, args);
    },
  };
}
