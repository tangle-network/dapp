'use client';

import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { ensureHex } from '@webb-tools/dapp-config/utils';
import getWagmiConfig from '@webb-tools/dapp-config/wagmi-config';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import { WebbPolkadot } from '@webb-tools/polkadot-api-provider';
import assert from 'assert';
import { useMemo } from 'react';

import type { RestakeTxBase } from './RestakeTx/base';
import EVMRestakeTx from './RestakeTx/evm';
import SubstrateRestakeTx from './RestakeTx/substrate';

export default function useRestakeTx(): RestakeTxBase {
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
        const hexAddress = ensureHex(activeAccount.address);
        return new EVMRestakeTx(hexAddress, hexAddress, getWagmiConfig());
      }

      case 'Substrate': {
        assert(activeApi instanceof WebbPolkadot, 'Invalid API');
        return new SubstrateRestakeTx(
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

function createDummyApi(error: string): RestakeTxBase {
  return {
    delegate(_operator, _asset, _amount, eventHandlers) {
      eventHandlers?.onTxFailed?.(error);
      return Promise.resolve(null);
    },
    deposit(_asset, _amount, eventHandlers) {
      eventHandlers?.onTxFailed?.(error);
      return Promise.resolve(null);
    },
  };
}
