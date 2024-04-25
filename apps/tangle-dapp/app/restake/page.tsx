'use client';

import { BN_ZERO } from '@polkadot/util';
import { FC, useMemo } from 'react';

import useRestakingEarnings from '../../data/restaking/useRestakingEarnings';
import useRestakingLimits from '../../data/restaking/useRestakingLimits';
import useRestakingProfile from '../../data/restaking/useRestakingProfile';
import useSubstrateAddress from '../../hooks/useSubstrateAddress';
import JobsCard from './JobsCard';
import OverviewCard from './OverviewCard';
import RoleDistributionCard from './RoleDistributionCard';
import RolesEarningsCard from './RolesEarningsCard';

const RestakePage: FC = () => {
  const activeSubstrateAccount = useSubstrateAddress();
  const {
    hasExistingProfile,
    profileTypeOpt: substrateProfileTypeOpt,
    totalRestaked,
    distribution,
  } = useRestakingProfile(activeSubstrateAccount);

  const { maxRestakingAmount } = useRestakingLimits();

  const { data: earningsRecord, isLoading: isEarningsLoading } =
    useRestakingEarnings(activeSubstrateAccount);

  const earnings = useMemo(() => {
    if (isEarningsLoading || !earningsRecord) return null;

    return Object.values(earningsRecord).reduce(
      (total, curr) => total.add(curr),
      BN_ZERO
    );
  }, [earningsRecord, isEarningsLoading]);

  const availableForRestake = useMemo(() => {
    if (maxRestakingAmount !== null && totalRestaked !== null) {
      return maxRestakingAmount.gt(totalRestaked)
        ? maxRestakingAmount.sub(totalRestaked)
        : BN_ZERO;
    }

    return maxRestakingAmount;
  }, [maxRestakingAmount, totalRestaked]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 justify-items-stretch">
      <OverviewCard
        hasExistingProfile={hasExistingProfile}
        profileTypeOpt={substrateProfileTypeOpt}
        totalRestaked={totalRestaked}
        availableForRestake={availableForRestake}
        earnings={earnings}
        isLoading={isEarningsLoading}
      />

      <RoleDistributionCard
        profileType={substrateProfileTypeOpt?.value}
        distribution={distribution}
      />

      <RolesEarningsCard earnings={earningsRecord} />

      <JobsCard />
    </div>
  );
};

export default RestakePage;
