import { BN } from '@polkadot/util';
import assert from 'assert';
import { useCallback, useRef } from 'react';
import { z } from 'zod';

import { SUBSTRATE_ROLE_TYPE_MAPPING } from '../../constants';
import { RestakingProfileType } from '../../containers/ManageProfileModalContainer/ManageProfileModalContainer';
import { RestakingAllocationMap } from '../../containers/ManageProfileModalContainer/types';
import useSubstrateTx from '../../hooks/useSubstrateTx';
import { ServiceType } from '../../types';
import useRestakingRoleLedger from './useRestakingRoleLedger';

type ProfileRecord = {
  role: (typeof SUBSTRATE_ROLE_TYPE_MAPPING)[ServiceType];
  amount: BN | null;
};

/**
 * Allows the execution of the `updateProfile` or `createProfile`
 * transaction for the roles pallet.
 *
 * Also provides the ability to create a profile if it does not exist.
 *
 * @param profileType The type of profile to update.
 * @param createIfMissing Whether to create a profile if it does not exist.
 * @param notifyTxStatusUpdates Whether to notify the user of transaction
 * status updates.
 */
const useUpdateRestakingProfileTx = (
  profileType: RestakingProfileType,
  createIfMissing = false,
  notifyTxStatusUpdates?: boolean
) => {
  // A ref must be used here instead of state, because the execute
  // function needs the records to be available when it is called, and
  // since `useState` is asynchronous, the records would not be available
  // in the same render cycle.
  const allocationsRef = useRef<RestakingAllocationMap | null>(null);

  const sharedRestakeAmountRef = useRef<BN | null>(null);
  const { data: roleLedger } = useRestakingRoleLedger();
  const hasExistingProfile = roleLedger !== null && roleLedger.isSome;

  const { execute, ...other } = useSubstrateTx(
    useCallback(
      async (api) => {
        // Cannot update a profile that does not exist.
        if (!hasExistingProfile && !createIfMissing) {
          return null;
        }

        assert(
          allocationsRef.current !== null,
          'Records should be set before calling execute'
        );

        const callee = hasExistingProfile
          ? api.tx.roles.updateProfile
          : api.tx.roles.createProfile;

        if (profileType === RestakingProfileType.SHARED) {
          assert(
            sharedRestakeAmountRef.current !== null,
            'Shared restake amount should be set if the profile type is shared'
          );
        }

        const records: ProfileRecord[] = Object.entries(
          allocationsRef.current
        ).map(([serviceString, amount]) => {
          const service = z.nativeEnum(ServiceType).parse(serviceString);

          return {
            role: SUBSTRATE_ROLE_TYPE_MAPPING[service],
            amount,
          };
        });

        // TODO: These objects have type `any`. Investigate why type definitions seem to be missing for this function/transaction call.
        return callee(
          profileType === RestakingProfileType.INDEPENDENT
            ? { Independent: { records } }
            : {
                Shared: {
                  records,
                  amount: sharedRestakeAmountRef.current,
                },
              }
        );
      },
      [createIfMissing, hasExistingProfile, profileType]
    ),
    notifyTxStatusUpdates
  );

  const executeForIndependentProfile = useCallback(
    (allocations: RestakingAllocationMap) => {
      if (execute === null) {
        return;
      }

      allocationsRef.current = allocations;

      return execute();
    },
    [execute]
  );

  const executeForSharedProfile = useCallback(
    (allocations: RestakingAllocationMap, restakeAmount: BN) => {
      if (execute === null) {
        return;
      }

      sharedRestakeAmountRef.current = restakeAmount;
      allocationsRef.current = allocations;

      return execute();
    },
    [execute]
  );

  return { executeForIndependentProfile, executeForSharedProfile, ...other };
};

export default useUpdateRestakingProfileTx;
