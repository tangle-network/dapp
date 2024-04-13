import { useMemo } from 'react';

import { RestakingProfileType } from '../../types';
import Optional from '../../utils/Optional';
import useRestakingRoleLedger from './useRestakingRoleLedger';

const useRestakingProfile = () => {
  const { result: ledgerOpt, isLoading } = useRestakingRoleLedger();

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

  return {
    hasExistingProfile,
    profileTypeOpt,
    ledgerOpt,
  };
};

export default useRestakingProfile;
