import { useWebContext } from '@webb-tools/api-provider-environment';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import noop from 'lodash/noop';
import { useCallback, useMemo } from 'react';
import BaseServices, {
  RegisterArgs,
  EventHandlers,
} from '../lib/services/base';
import { EvmServices } from '../lib/services/evm';
import getWagmiConfig from '@webb-tools/dapp-config/wagmi-config';
import assert from 'assert';
import { WebbPolkadot } from '@webb-tools/polkadot-api-provider';
import { SubstrateServices } from '../lib/services/substrate';
import { ensureHex } from '@webb-tools/dapp-config';

interface RegisterServiceParams {
  blueprintId: string;
  params: Record<string, unknown>;
}

export default function useServicesTransactions() {
  const { activeAccount, activeWallet, activeApi } = useWebContext();

  const services = useMemo(() => {
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

  const registerService = useCallback(
    async ({ blueprintId, params }: RegisterServiceParams) => {
      await services.register(
        {
          blueprintIds: [blueprintId],
          registrationArgs: [params],
          preferences: [],
          amount: ['0'],
        },
        {
          onRegister: {
            onTxSending: noop,
            onTxSuccess: noop,
            onTxFailed: noop,
          },
        },
      );
    },
    [services],
  );

  return {
    registerService,
  };
}

function createDummyApi(error: string): BaseServices {
  return {
    validateRegisterArgs: noop,

    register: async (args: RegisterArgs, eventHandlers: EventHandlers) => {
      eventHandlers?.onRegister?.onTxFailed?.(error, args);
    },
  };
}
