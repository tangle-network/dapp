import { Option } from '@polkadot/types';
import { PalletRolesRoleStakingLedger } from '@polkadot/types/lookup';
import { useCallback } from 'react';
import { map } from 'rxjs';

import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';

const useRestakingRoleLedger = () => {
  const activeSubstrateAccount = useSubstrateAddress();

  return usePolkadotApiRx(
    useCallback(
      (api) => {
        const codec = api.query.roles.ledger(activeSubstrateAccount);

        // TODO: Investigate why type definitions seem to be missing for this call. It returns `Codec` instead of `Option<PalletRolesRoleStakingLedger>`. Not ideal to use type assertions.
        return codec.pipe(
          map((codec) => codec as Option<PalletRolesRoleStakingLedger>)
        );
      },
      [activeSubstrateAccount]
    )
  );
};

export default useRestakingRoleLedger;
