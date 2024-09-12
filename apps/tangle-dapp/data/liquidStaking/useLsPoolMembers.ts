import { Option } from '@polkadot/types';
import { PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import { useCallback } from 'react';
import { map } from 'rxjs';

import useApiRx from '../../hooks/useApiRx';
import { SubstrateAddress } from '../../types/utils';
import assertSubstrateAddress from '../../utils/assertSubstrateAddress';

const useLsPoolMembers = ():
  | Readonly<[number, SubstrateAddress, PalletAssetsAssetAccount]>[]
  | null => {
  const { result: accounts } = useApiRx(
    useCallback((api) => {
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
    }, []),
  );

  // TODO: Return a map instead for improved lookup efficiency: PoolId -> [MemberAddress, Account].
  return accounts;
};

export default useLsPoolMembers;
