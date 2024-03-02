import { BN } from '@polkadot/util';
import assert from 'assert';
import { useCallback, useRef } from 'react';

import { SUBSTRATE_ROLE_TYPE_MAPPING } from '../../constants';
import { cleanAllocations } from '../../containers/ManageProfileModalContainer/IndependentAllocationStep';
import { RestakingProfileType } from '../../containers/ManageProfileModalContainer/ManageProfileModalContainer';
import { RestakingAllocationMap } from '../../containers/ManageProfileModalContainer/types';
import useSubstrateTx from '../../hooks/useSubstrateTx';
import { ServiceType } from '../../types';

type ProfileRecord = {
  role: (typeof SUBSTRATE_ROLE_TYPE_MAPPING)[ServiceType];
  amount: BN;
};

const useUpdateRestakingProfileTx = (
  profileType: RestakingProfileType,
  notifyTxStatusUpdates?: boolean
) => {
  // A ref must be used here instead of state, because the execute
  // function needs the records to be available when it is called, and
  // since `useState` is asynchronous, the records would not be available
  // in the same render cycle.
  const recordsRef = useRef<ProfileRecord[] | null>(null);

  const { execute, ...other } = useSubstrateTx(
    useCallback(
      async (api) => {
        assert(
          recordsRef.current !== null,
          'Records should be set before calling execute'
        );

        console.debug('Sending records', recordsRef.current);

        // TODO: This has type any. Investigate why type definitions seem to be missing for this function/transaction call.
        return api.tx.roles.updateProfile(
          profileType === RestakingProfileType.Independent
            ? { Independent: { records: recordsRef.current } }
            : { Shared: { records: recordsRef.current } }
        );
      },
      [profileType]
    ),
    notifyTxStatusUpdates
  );

  const executeOverride = useCallback(
    (allocations: RestakingAllocationMap) => {
      if (execute === null) {
        return;
      }

      recordsRef.current = cleanAllocations(allocations).map(
        ([service, allocation]) => ({
          role: SUBSTRATE_ROLE_TYPE_MAPPING[service],
          amount: allocation,
        })
      );

      return execute();
    },
    [execute]
  );

  return { execute: executeOverride, ...other };
};

export default useUpdateRestakingProfileTx;
