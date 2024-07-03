'use client';

import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { ensureHex } from '@webb-tools/dapp-config/utils';
import getWagmiConfig from '@webb-tools/dapp-config/wagmi-config';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import { WebbPolkadot } from '@webb-tools/polkadot-api-provider';
import assert from 'assert';
import { useMemo } from 'react';

import EVMRestakeTx from './RestakeTx/evm';
import SubstrateRestakeTx from './RestakeTx/substrate';

export default function useRestakeTx() {
  const { activeAccount, activeWallet, activeApi } = useWebContext();

  return useMemo(() => {
    if (
      activeWallet === undefined ||
      activeAccount === null ||
      activeApi === undefined
    ) {
      return {
        deposit: () => {
          throw WebbError.from(WebbErrorCodes.ApiNotReady);
        },
      };
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
        return {
          deposit: () => {
            throw WebbError.from(WebbErrorCodes.UnsupportedWallet);
          },
        };
      }
    }
  }, [activeAccount, activeApi, activeWallet]);
}
