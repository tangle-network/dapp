import { Option } from '@polkadot/types';
import { PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import useApiRx from '@webb-tools/tangle-shared-ui/hooks/useApiRx';
import { SubstrateAddress } from '@webb-tools/webb-ui-components/types/address';
import assertSubstrateAddress from '@webb-tools/webb-ui-components/utils/assertSubstrateAddress';
import { useCallback } from 'react';
import { map } from 'rxjs';

import useNetworkFeatures from '../../hooks/useNetworkFeatures';
import { NetworkFeature } from '../../types';

const useLsPoolMembers = ():
  | Readonly<[number, SubstrateAddress, PalletAssetsAssetAccount]>[]
  | null => {
  const networkFeatures = useNetworkFeatures();
  const isSupported = networkFeatures.includes(NetworkFeature.LsPools);

  const { result: accounts } = useApiRx(
    useCallback(
      (api) => {
        if (!isSupported) {
          return null;
        }

        return api.query.assets.account.entries().pipe(
          map((entries) => {
            return entries.flatMap(([key, val]) => {
              // TODO: Manually casting the type here, since the type is being inferred as `Codec` instead of `Option<PalletAssetsAssetAccount>`. This might be a problem with the TS type generation.
              const valOpt = val as Option<PalletAssetsAssetAccount>;

              // Ignore empty values.
              if (valOpt.isNone) {
                return [];
              }

              const poolId = key.args[0].toNumber();

              const accountAddress = assertSubstrateAddress(
                key.args[1].toString(),
              );

              return [[poolId, accountAddress, valOpt.unwrap()] as const];
            });
          }),
        );
      },
      [isSupported],
    ),
  );

  // TODO: Add explicit error state: `| Error`. For example, in case that the active network doesn't support liquid staking pools.
  // TODO: Return a map instead for improved lookup efficiency: PoolId -> [MemberAddress, Account].
  return accounts;
};

export default useLsPoolMembers;
