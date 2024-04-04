'use client';

import { BN_ZERO } from '@polkadot/util';
import { useMemo } from 'react';

import useRestakingEarnings from '../../data/restaking/useRestakingEarnings';
import useRestakingLimits from '../../data/restaking/useRestakingLimits';
import useRestakingProfile from '../../data/restaking/useRestakingProfile';
import useRestakingTotalRewards from '../../data/restaking/useRestakingTotalRewards';
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

  const { data: rewards, isLoading: isRewardsLoading } =
    useRestakingTotalRewards();

  const { availableForRestake, totalRestaked } = useMemo(() => {
    const totalRestaked = ledgerOpt?.isSome
      ? ledgerOpt.unwrap().total.toBn()
      : null;

    if (maxRestakingAmount !== null && totalRestaked !== null) {
      const availableForRestake = maxRestakingAmount.gt(totalRestaked)
        ? maxRestakingAmount.sub(totalRestaked)
        : BN_ZERO;

      return {
        totalRestaked,
        availableForRestake,
      };
    }

    return {
      totalRestaked,
      availableForRestake: maxRestakingAmount,
    };
  }, [ledgerOpt, maxRestakingAmount]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 justify-items-stretch">
      <OverviewCard
        hasExistingProfile={hasExistingProfile}
        profileTypeOpt={substrateProfileTypeOpt}
        isLoading={isEarningsLoading || isRewardsLoading}
        totalRestaked={totalRestaked}
        availableForRestake={availableForRestake}
        rewards={rewards}
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
