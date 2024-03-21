import type BN from 'bn.js';
import { useCallback, useMemo } from 'react';
import { map } from 'rxjs';
import { formatUnits } from 'viem';

import { TANGLE_TOKEN_DECIMALS } from '../../constants';
import usePolkadotApiRx from '../../hooks/usePolkadotApiRx';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import { ServiceType } from '../../types';
import convertRecordToAllocation from '../../utils/convertRecordToAllocation';
import useRestakingProfile from './useRestakingProfile';

/**
 * Calculate the amount available for restaking which is
 *
 * 50% of the staked amount - total restaked amount
 * @param activeStaked the staked amount of the active account
 * @param totalRestaked the total restaked amount
 */
const calculateRestakingAmount = (
  activeStaked: number | null,
  totalRestaked: number | null
) => {
  if (activeStaked === null) return null;

  if (totalRestaked === null) return activeStaked / 2;

  return activeStaked / 2 - totalRestaked;
};

const useRestakingOverview = () => {
  const {
    hasExistingProfile,
    profileTypeOpt: substrateProfileTypeOpt,
    ledgerOpt,
  } = useRestakingProfile();

  const totalRestaked = useMemo(() => {
    if (ledgerOpt === null || ledgerOpt.isNone) return null;

    return ledgerOpt.unwrap().total.toNumber();
  }, [ledgerOpt]);

  const roleDistributions = useMemo(() => {
    if (ledgerOpt === null || ledgerOpt.isNone) return null;

    const profile = ledgerOpt.unwrap().profile;
    const records = profile.isIndependent
      ? profile.asIndependent.records
      : profile.asShared.records;

    return records.reduce((acc, record) => {
      const [serviceType, amount] = convertRecordToAllocation(record);
      return { ...acc, [serviceType]: amount };
    }, {} as Partial<Record<ServiceType, BN>>);
  }, [ledgerOpt]);

  const activeSubstrateAccount = useSubstrateAddress();

  const { isLoading, data: activeStaked } = usePolkadotApiRx(
    useCallback(
      (apiRx) => {
        if (!activeSubstrateAccount || !hasExistingProfile) return null;

        return apiRx.query.staking.ledger(activeSubstrateAccount).pipe(
          map((ledger) => {
            if (ledger.isNone) return null;

            return +formatUnits(
              ledger.unwrap().active.toBigInt(),
              TANGLE_TOKEN_DECIMALS
            );
          })
        );
      },
      [activeSubstrateAccount, hasExistingProfile]
    )
  );

  const availableForRestaking = useMemo(
    () =>
      !hasExistingProfile || isLoading
        ? null
        : calculateRestakingAmount(activeStaked, totalRestaked),
    [activeStaked, hasExistingProfile, isLoading, totalRestaked]
  );
};

export default useRestakingOverview;
