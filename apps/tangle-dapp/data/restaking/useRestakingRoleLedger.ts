import { Option } from '@polkadot/types';
import { PalletRolesRoleStakingLedger } from '@polkadot/types/lookup';
import { useCallback } from 'react';

import usePolkadotApi from '../../hooks/usePolkadotApi';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';

const useRestakingRoleLedger = () => {
  const activeSubstrateAccount = useSubstrateAddress();

  return usePolkadotApi(
    useCallback(
      async (api) => {
        const codec = await api.query.roles.ledger(activeSubstrateAccount);

        // TODO: Investigate why type definitions seem to be missing for this call. It returns `Codec` instead of `Option<PalletRolesRoleStakingLedger>`. Not ideal to use type assertions.
        const roleLedgerOpt = codec as Option<PalletRolesRoleStakingLedger>;

        return roleLedgerOpt.isNone ? null : roleLedgerOpt.unwrap();
      },
      [activeSubstrateAccount]
    )
  );
};

export default useRestakingRoleLedger;
