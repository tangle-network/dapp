import { BN_ZERO } from '@polkadot/util';
import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import { useCallback, useMemo } from 'react';

import useNetworkFeatures from '../../../hooks/useNetworkFeatures';
import { NetworkFeature } from '../../../types';
import { useLsStore } from '../useLsStore';

const useLsPoolBalance = () => {
  const substrateAddress = useSubstrateAddress();
  const networkFeatures = useNetworkFeatures();
  const isSupported = networkFeatures.includes(NetworkFeature.LsPools);
  const { lsPoolId } = useLsStore();

  const { result: tanglePoolAssetAccountOpt } = useApiRx(
    useCallback(
      (api) => {
        // The liquid staking pools functionality isn't available on the active
        // network, the user hasn't selected a pool yet, or there is no active
        // account.
        if (!isSupported || lsPoolId === null || substrateAddress === null) {
          return null;
        }

        return api.query.assets.account(lsPoolId, substrateAddress);
      },
      [isSupported, lsPoolId, substrateAddress],
    ),
  );

  const derivativeBalanceOpt = useMemo(() => {
    if (tanglePoolAssetAccountOpt === null) {
      return null;
    } else if (tanglePoolAssetAccountOpt.isNone) {
      return BN_ZERO;
    }

    return tanglePoolAssetAccountOpt.unwrap().balance.toBn();
  }, [tanglePoolAssetAccountOpt]);

  return derivativeBalanceOpt;
};

export default useLsPoolBalance;
