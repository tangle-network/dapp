import { useWebContext } from '@webb-tools/api-provider-environment/webb-context';
import { ensureHex } from '@webb-tools/dapp-config/utils';
import getWagmiConfig from '@webb-tools/dapp-config/wagmi-config';
import { WebbError, WebbErrorCodes } from '@webb-tools/dapp-types';
import { WebbPolkadot } from '@webb-tools/polkadot-api-provider';
import assert from 'assert';
import { useMemo } from 'react';
import RewardsTxBase from './RewardsTx/base';
import EVMRewardsTx from './RewardsTx/evm';
import SubstrateRewardsTx from './RewardsTx/substrate';
import assertSubstrateAddress from '@webb-tools/webb-ui-components/utils/assertSubstrateAddress';

export default function useRewardsTx(): RewardsTxBase {
  const { activeAccount, activeWallet, activeApi } = useWebContext();

  return useMemo<RewardsTxBase>(() => {
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
        return new EVMRewardsTx(hexAddress, hexAddress, getWagmiConfig());
      }

      case 'Substrate': {
        assert(activeApi instanceof WebbPolkadot, 'Invalid API');
        const substrateAddress = assertSubstrateAddress(activeAccount.address);

        return new SubstrateRewardsTx(
          substrateAddress,
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

function createDummyApi(error: string): RewardsTxBase {
  return {
    claimRewards(args, eventHandlers) {
      eventHandlers?.onTxFailed?.(error, args);
      return Promise.resolve(null);
    },
  };
}
