'use client';

import { useMemo } from 'react';
import { formatUnits } from 'viem';

import { TANGLE_TOKEN_DECIMALS } from '../../constants';
import useRestakingEarnings from '../../data/restaking/useRestakingEarnings';
import useRestakingLimits from '../../data/restaking/useRestakingLimits';
import useRestakingProfile from '../../data/restaking/useRestakingProfile';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import JobsCard from './JobsCard';
import OverviewCard from './OverviewCard';
import RoleDistributionCard from './RoleDistributionCard';
import RolesEarningsCard from './RolesEarningsCard';

const RestakePage = () => {
  const {
    hasExistingProfile,
    profileTypeOpt: substrateProfileTypeOpt,
    ledgerOpt,
  } = useRestakingProfile();

  const { maxRestakingAmount } = useRestakingLimits();

  const accountAddress = useActiveAccountAddress();

  const { data: earningsRecord, isLoading: isEarningsLoading } =
    useRestakingEarnings(accountAddress);

  const earnings = useMemo(() => {
    if (isEarningsLoading || !earningsRecord) return null;

    return Object.values(earningsRecord).reduce((prev, curr) => prev + curr, 0);
  }, [earningsRecord, isEarningsLoading]);

  const { availableForRestake, totalRestaked } = useMemo(() => {
    const totalRestaked = ledgerOpt?.isSome
      ? // Dummy check to whether format the total restaked amount
        // or not, as the local testnet is in wei but the live one is in unit
        ledgerOpt.unwrap().total.toString().length > 10
        ? +formatUnits(
            ledgerOpt.unwrap().total.toBigInt(),
            TANGLE_TOKEN_DECIMALS
          )
        : ledgerOpt.unwrap().total.toNumber()
      : null;

    const fmtMaxRestakingAmount =
      maxRestakingAmount !== null
        ? +formatUnits(
            BigInt(maxRestakingAmount.toString()),
            TANGLE_TOKEN_DECIMALS
          )
        : null;

    if (fmtMaxRestakingAmount !== null && totalRestaked !== null) {
      const availableForRestake =
        fmtMaxRestakingAmount > totalRestaked
          ? fmtMaxRestakingAmount - totalRestaked
          : 0;

      return {
        totalRestaked,
        availableForRestake,
      };
    }

    return {
      totalRestaked,
      availableForRestake: fmtMaxRestakingAmount,
    };
  }, [ledgerOpt, maxRestakingAmount]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 justify-items-stretch">
      <OverviewCard
        hasExistingProfile={hasExistingProfile}
        profileTypeOpt={substrateProfileTypeOpt}
        isLoading={isEarningsLoading}
        totalRestaked={totalRestaked}
        availableForRestake={availableForRestake}
        earnings={earnings}
      />

      <RoleDistributionCard
        profileType={substrateProfileTypeOpt?.value}
        ledger={ledgerOpt}
      />

      <RolesEarningsCard earnings={earningsRecord} />

      <JobsCard />
    </div>
  );
};

export default RestakePage;
