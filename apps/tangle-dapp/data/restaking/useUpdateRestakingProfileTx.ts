import { PalletRolesProfileRecord } from '@polkadot/types/lookup';

import { cleanAllocations } from '../../containers/ManageProfileModalContainer/IndependentAllocationStep';
import { RestakingAllocationMap } from '../../containers/ManageProfileModalContainer/types';
import useSubstrateTx from '../../hooks/useSubstrateTx';

const useUpdateRestakingProfileTx = (allocations: RestakingAllocationMap) => {
  const records: PalletRolesProfileRecord = cleanAllocations(allocations).map(
    ([serviceType, allocation]) => ({
      serviceType,
      allocation,
    })
  );

  return useSubstrateTx(async (api) => {
    return api.tx.roles.updateProfile({
      // TODO: This has type any. Investigate why type definitions seem to be missing for this.
      Independent: {
        records,
      },
    });
  });
};

export default useUpdateRestakingProfileTx;
