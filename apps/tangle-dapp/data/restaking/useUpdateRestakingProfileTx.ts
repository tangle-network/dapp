import { BN } from '@polkadot/util';
import assert from 'assert';
import { useCallback, useRef } from 'react';
import { z } from 'zod';

import { SERVICE_TYPE_TO_TANGLE_MAP } from '../../constants';
import { RestakingAllocationMap } from '../../containers/ManageProfileModalContainer/types';
import useSubstrateTx from '../../hooks/useSubstrateTx';
import { RestakingProfileType, RestakingService } from '../../types';
import useRestakingRoleLedger from './useRestakingRoleLedger';

type ProfileRecord = {
  role: (typeof SERVICE_TYPE_TO_TANGLE_MAP)[RestakingService];
  amount: BN;
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
  const sharedRestakeAmountRef = useRef<BN | null>(null);
  const { data: roleLedger } = useRestakingRoleLedger();
  const hasExistingProfile = roleLedger !== null && roleLedger.isSome;

  // TODO: Break this into two separate hooks for independent and shared profiles.
  const { execute, ...other } = useSubstrateTx<{
    allocations: RestakingAllocationMap;
    maxActiveServices?: number;
  }>(
    useCallback(
      (api, _activeSubstrateAddress, context) => {
        // Cannot update a profile that does not exist.
        if (!hasExistingProfile && !createIfMissing) {
          return null;
        }

        if (profileType === RestakingProfileType.SHARED) {
          assert(
            sharedRestakeAmountRef.current !== null,
            'Shared restake amount should be set if the profile type is shared'
          );
        }

        const records: ProfileRecord[] = Object.entries(
          context.allocations
        ).map(([serviceString, amount]) => {
          const service = z.nativeEnum(RestakingService).parse(serviceString);

          return {
            role: SERVICE_TYPE_TO_TANGLE_MAP[service],
            amount,
          };
        });

        // Sanity check to help catch possible logic bugs.
        if (profileType === RestakingProfileType.SHARED) {
          const containsRecordWithNonZeroAmount = records.some(
            (record) => !record.amount.isZero()
          );

          if (containsRecordWithNonZeroAmount) {
            console.warn(
              'Encountered a record with a non-zero amount for shared profile; note that amounts are ignored for shared profile creation/updates'
            );
          }
        }

        const profile =
          profileType === RestakingProfileType.INDEPENDENT
            ? { Independent: { records } }
            : {
                Shared: {
                  // Note that role allocation amounts are completely
                  // ignored by Tangle for shared profiles. No transformation
                  // or further processing is needed for those amounts; only
                  // the roles are relevant.
                  records,
                  amount: sharedRestakeAmountRef.current,
                },
              };

        // TODO: These functions accept profile object with type `any`. Investigate why type definitions seem to be missing for this function/transaction call.
        return hasExistingProfile
          ? api.tx.roles.updateProfile(profile)
          : api.tx.roles.createProfile(profile, null);
      },
      [createIfMissing, hasExistingProfile, profileType]
    ),
    notifyTxStatusUpdates
  );

  const executeForIndependentProfile = useCallback(
    (allocations: RestakingAllocationMap, maxActiveServices?: number) => {
      if (execute === null) {
        return;
      }

      return execute({ allocations, maxActiveServices });
    },
    [execute]
  );

  const executeForSharedProfile = useCallback(
    (allocations: RestakingAllocationMap, restakeAmount: BN) => {
      if (execute === null) {
        return;
      }

      // TODO: This method of providing information to the execute function works fine, but is a bit hacky/unclear. Consider improving this in the future.
      sharedRestakeAmountRef.current = restakeAmount;

      return execute({ allocations });
    },
    [execute]
  );

  return { executeForIndependentProfile, executeForSharedProfile, ...other };
};

export default useUpdateRestakingProfileTx;
