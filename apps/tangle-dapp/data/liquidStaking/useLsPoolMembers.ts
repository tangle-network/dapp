import { Option } from '@polkadot/types';
import { PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import { useCallback } from 'react';
import { map } from 'rxjs';

import useApiRx from '../../hooks/useApiRx';
import useNetworkFeatures from '../../hooks/useNetworkFeatures';
import { NetworkFeature } from '../../types';
import { SubstrateAddress } from '../../types/utils';
import assertSubstrateAddress from '../../utils/assertSubstrateAddress';

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

  // TODO: Add error state. For example, in case that the active network doesn't support liquid staking pools.
  // TODO: Return a map instead for improved lookup efficiency: PoolId -> [MemberAddress, Account].
  return accounts;
};

export default useLsPoolMembers;
