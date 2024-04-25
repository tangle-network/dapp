import { useMemo } from 'react';

import { DistributionDataType, RestakingProfileType } from '../../types';
import convertRecordToAllocation from '../../utils/convertRecordToAllocation';
import Optional from '../../utils/Optional';
import useRestakingRoleLedger from './useRestakingRoleLedger';

const useRestakingProfile = (address: string | null) => {
  const { data: ledgerOpt, isLoading } = useRestakingRoleLedger(address);

  const hasExistingProfile = isLoading
    ? null
    : ledgerOpt !== null && !ledgerOpt.isNone;

  const profileTypeOpt: Optional<RestakingProfileType> | null = useMemo(() => {
    if (ledgerOpt === null) {
      return null;
    } else if (ledgerOpt.isNone) {
      return new Optional();
    }

    const ledger = ledgerOpt.unwrap();

    return new Optional(
      ledger.profile.isIndependent
        ? RestakingProfileType.INDEPENDENT
        : RestakingProfileType.SHARED
    );
  }, [ledgerOpt]);

  const totalRestaked = useMemo(
    () => (ledgerOpt?.isSome ? ledgerOpt.unwrap().total.toBn() : null),
    [ledgerOpt]
  );

  const distribution = useMemo(() => {
    if (!ledgerOpt || ledgerOpt.isNone) {
      return null;
    }

    const profile = ledgerOpt.unwrap().profile;

    const records = profile.isIndependent
      ? profile.asIndependent.records
      : profile.asShared.records;

    const distribution = {} as DistributionDataType;

    for (const record of records) {
      const [service, amount] = convertRecordToAllocation(record);

      if (service) {
        distribution[service] = profile.isShared
          ? profile.asShared.amount.toBn()
          : amount;
      }
    }

    return distribution;
  }, [ledgerOpt]);

  return {
    hasExistingProfile,
    profileTypeOpt,
    ledgerOpt,
    totalRestaked,
    distribution,
  };
};

export default useRestakingProfile;
