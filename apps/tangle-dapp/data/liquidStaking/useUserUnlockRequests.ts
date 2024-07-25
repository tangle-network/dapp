import { TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK } from '@webb-tools/webb-ui-components/constants/networks';
import { useCallback, useMemo } from 'react';

import {
  LIQUID_STAKING_CHAINS,
  LiquidStakingCurrencyKey,
} from '../../constants/liquidStaking';
import useApiRx from '../../hooks/useApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';

const useUserUnlockRequests = () => {
  const substrateAddress = useSubstrateAddress();

  const { result: entries } = useApiRx(
    useCallback(
      (api) => {
        if (substrateAddress === null) {
          return null;
        }

        return api.query.lstMinting.userUnlockLedger.entries(substrateAddress);
      },
      [substrateAddress],
    ),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );

  const unlockIds = useMemo(() => {
    if (entries === null) {
      return null;
    }

    return entries.flatMap(([_key, value]) => {
      // Ignore empty values. Since `flatMap` is used, returning an empty
      // array will filter out this entry.
      if (value.isNone) {
        return [];
      }

      return value.unwrap()[1].map((unlockId) => unlockId.toNumber());
    });
  }, [entries]);

  const { result: tokenUnlockLedgers } = useApiRx(
    useCallback(
      (api) => {
        if (unlockIds === null) {
          return null;
        }

        const allKeys: LiquidStakingCurrencyKey[] = LIQUID_STAKING_CHAINS.map(
          (chain) => {
            // TODO: Is it Native or lst for unlocking requests?
            return { Native: chain.currency };
          },
        );

        return api.query.lstMinting.tokenUnlockLedger.multi(allKeys);
      },
      [unlockIds],
    ),
    TANGLE_RESTAKING_PARACHAIN_LOCAL_DEV_NETWORK.wsRpcEndpoint,
  );

  console.debug('tokenUnlockLedgers', tokenUnlockLedgers);
};

export default useUserUnlockRequests;
