import { BN } from '@polkadot/util';

import { SUBSTRATE_ROLE_TYPE_MAPPING } from '../../constants';
import { cleanAllocations } from '../../containers/ManageProfileModalContainer/IndependentAllocationStep';
import { RestakingAllocationMap } from '../../containers/ManageProfileModalContainer/types';
import useSubstrateTx from '../../hooks/useSubstrateTx';
import { ServiceType } from '../../types';

type ProfileRecord = {
  role: (typeof SUBSTRATE_ROLE_TYPE_MAPPING)[ServiceType];
  amount: BN;
};

const useUpdateRestakingProfileTx = (allocations: RestakingAllocationMap) => {
  const records: ProfileRecord[] = cleanAllocations(allocations).map(
    ([service, allocation]) => ({
      role: SUBSTRATE_ROLE_TYPE_MAPPING[service],
      amount: allocation,
    })
  );

  return useSubstrateTx(async (api) => {
    return api.tx.roles.createProfile({
      // TODO: This has type any. Investigate why type definitions seem to be missing for this.
      Independent: {
        records,
      },
    });
  });
};

export default useUpdateRestakingProfileTx;
