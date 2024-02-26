import { RestakingAllocationMap } from '../../containers/ManageProfileModalContainer/types';
import useSubstrateTx from '../../hooks/useSubstrateTx';

const useUpdateRestakingProfileTx = (allocations: RestakingAllocationMap) => {
  // TODO: Investigate why the type errors are occurring here. It seems to be expecting a `Vec` type, but that should be an internal type of the Polkadot API.
  // const records: PalletRolesProfileRecord = cleanAllocations(allocations).map(
  //   ([serviceType, allocation]) => ({
  //     serviceType,
  //     allocation,
  //   })
  // );

  return useSubstrateTx(async (api) => {
    return api.tx.roles.updateProfile({
      // TODO: This has type any. Investigate why type definitions seem to be missing for this.
      Independent: {
        records: [],
      },
    });
  });
};

export default useUpdateRestakingProfileTx;
