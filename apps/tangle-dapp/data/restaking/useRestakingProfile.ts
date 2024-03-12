import { useMemo } from 'react';

import { RestakingProfileType } from '../../containers/ManageProfileModalContainer/ManageProfileModalContainer';
import Optional from '../../utils/Optional';
import useRestakingRoleLedger from './useRestakingRoleLedger';

const useRestakingProfile = () => {
  const { data: ledgerOpt, isLoading } = useRestakingRoleLedger();

  const hasExistingProfile =
    !isLoading && ledgerOpt !== null && ledgerOpt.isSome;

  const profileType: Optional<RestakingProfileType> | null = useMemo(() => {
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
    profileType,
    ledgerOpt,
  };
};

export default useRestakingProfile;
