import { useContext, useMemo } from 'react';

import { RestakeContext } from '../../context/RestakeContext';
import { getProfileTypeFromRestakeRoleLedger } from './../../utils/polkadot/restake';

const useRestakingProfile = () => {
  const {
    ledger: ledgerOpt,
    earningsRecord,
    isLoading,
  } = useContext(RestakeContext);

  const hasExistingProfile = useMemo(
    () => (isLoading ? null : ledgerOpt !== null && !ledgerOpt.isNone),
    [isLoading, ledgerOpt]
  );

  const profileTypeOpt = useMemo(
    () => getProfileTypeFromRestakeRoleLedger(ledgerOpt),
    [ledgerOpt]
  );

  return {
    hasExistingProfile,
    profileTypeOpt,
    ledgerOpt,
    earningsRecord,
    isLoading,
  };
};

export default useRestakingProfile;
