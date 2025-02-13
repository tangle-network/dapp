import { Option } from '@polkadot/types';
import { PalletAssetsAssetAccount } from '@polkadot/types/lookup';
import useApiRx from '@tangle-network/tangle-shared-ui/hooks/useApiRx';
import { SubstrateAddress } from '@tangle-network/ui-components/types/address';
import assertSubstrateAddress from '@tangle-network/ui-components/utils/assertSubstrateAddress';
import { useCallback } from 'react';
import { map } from 'rxjs';

import useNetworkFeatures from '../../hooks/useNetworkFeatures';
import { NetworkFeature } from '../../types';

const useAssetAccounts = ():
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

        return (
          api.query.assets.account
            // TODO: For some reason, this isn't being inferred correctly. Passing the type manually might still be casting it using `as` in the `.entries()` function implementation, which isn't ideal.
            .entries<Option<PalletAssetsAssetAccount>>()
            .pipe(
              map((entries) => {
                return entries.flatMap(([key, valOpt]) => {
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
            )
        );
      },
      [isSupported],
    ),
  );

  // TODO: Add explicit error state: `| Error`. For example, in case that the active network doesn't support liquid staking pools.
  // TODO: Return a map instead for improved lookup efficiency: PoolId -> [MemberAddress, Account].
  return accounts;
};

export default useAssetAccounts;
