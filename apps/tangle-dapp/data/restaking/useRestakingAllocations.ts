import { useMemo } from 'react';

import { RestakingAllocationMap } from '../../containers/ManageProfileModalContainer/types';
import { RestakingProfileType } from '../../types';
import convertRecordToAllocation from '../../utils/convertRecordToAllocation';
import Optional from '../../utils/Optional';
import useRestakingProfile from './useRestakingProfile';
import useRestakingRoleLedger from './useRestakingRoleLedger';

/**
 * Obtain the roles and their allocation amounts of the
 * active account from chain, for either independent or
 * shared profile.
 *
 * These roles help identify what kind of jobs the active
 * account performs. The amounts corresponding to each job
 * represent their staked amount for that role ('restaking'
 * amount). Higher amounts provide higher crypto economic security
 * because that means higher amounts can be slashed.
 *
 * If the active account does not have a profile setup,
 * `null` will be returned for the value.
 */
const useRestakingAllocations = () => {
  const ledgerResult = useRestakingRoleLedger();
  const { hasExistingProfile, profileTypeOpt, ledgerOpt } =
    useRestakingProfile();
  const isLedgerAvailable = ledgerOpt !== null && ledgerOpt.isSome;

  const allocations: Optional<RestakingAllocationMap> | null = useMemo(() => {
    if (hasExistingProfile === false) {
      return new Optional();
    } else if (
      !isLedgerAvailable ||
      profileTypeOpt === null ||
      profileTypeOpt.value === null
    ) {
      return null;
    }

    const ledger = ledgerOpt.unwrap();

    const profile =
      profileTypeOpt.value === RestakingProfileType.INDEPENDENT
        ? ledger.profile.asIndependent
        : ledger.profile.asShared;

    const newAllocations: RestakingAllocationMap = {};

    if (profile !== null) {
      for (const record of profile.records) {
        const [service, amount] = convertRecordToAllocation(record);

        newAllocations[service] = amount;
      }
    }

    return new Optional(newAllocations);
  }, [hasExistingProfile, isLedgerAvailable, ledgerOpt, profileTypeOpt]);

  return {
    ...ledgerResult,
    value: isLedgerAvailable ? allocations : null,
  };
};

export default useRestakingAllocations;
