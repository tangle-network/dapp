import { useMemo } from 'react';
import { formatUnits } from 'viem';

import { TANGLE_TOKEN_DECIMALS } from '../../constants';
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
    () =>
      ledgerOpt?.isSome
        ? // Dummy check to whether format the total restaked amount
          // or not, as the local testnet is in wei but the live one is in unit
          ledgerOpt.unwrap().total.toString().length > 10
          ? +formatUnits(
              ledgerOpt.unwrap().total.toBigInt(),
              TANGLE_TOKEN_DECIMALS
            )
          : ledgerOpt.unwrap().total.toNumber()
        : null,
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
