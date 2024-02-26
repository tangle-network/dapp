import { Option } from '@polkadot/types';
import { PalletRolesRoleStakingLedger } from '@polkadot/types/lookup';
import { map } from 'rxjs';

import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';

const useRestakingRoleLedger = () => {
  const activeSubstrateAccount = useSubstrateAddress();

  return usePolkadotApiRx((api) =>
    api.query.roles.ledger(activeSubstrateAccount).pipe(
      map((codec) => {
        // TODO: Investigate why type definitions seem to be missing for this call. It returns `Codec` instead of `Option<PalletRolesRoleStakingLedger>`. Not ideal to use type assertions.
        const roleLedgerOpt = codec as Option<PalletRolesRoleStakingLedger>;

        return roleLedgerOpt.isNone ? null : roleLedgerOpt.unwrap();
      })
    )
  );
};

export default useRestakingRoleLedger;
