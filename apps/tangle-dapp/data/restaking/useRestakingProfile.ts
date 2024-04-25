import { useMemo } from 'react';

import { RestakingProfileType } from '../../types';
import Optional from '../../utils/Optional';
import useRestakingRoleLedger from './useRestakingRoleLedger';

const useRestakingProfile = (address?: string) => {
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

  return {
    hasExistingProfile,
    profileTypeOpt,
    ledgerOpt,
    totalRestaked,
  };
};

export default useRestakingProfile;
