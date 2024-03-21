'use client';

import { Option } from '@polkadot/types';
import type {
  PalletRolesRestakingLedger,
  PalletStakingStakingLedger,
} from '@polkadot/types/lookup';
import { useCallback, useMemo } from 'react';
import { formatUnits } from 'viem';

import { TANGLE_TOKEN_DECIMALS } from '../../constants';
import useRestakingProfile from '../../data/restaking/useRestakingProfile';
import useActiveAccountAddress from '../../hooks/useActiveAccountAddress';
import usePolkadotApi from '../../hooks/usePolkadotApi';
import JobsCard from './JobsCard';
import OverviewCard from './OverviewCard';
import RoleDistributionCard from './RoleDistributionCard';
import RolesEarningsCard from './RolesEarningsCard';

const RestakePage = () => {
  const { hasExistingProfile, profileTypeOpt: substrateProfileTypeOpt } =
    useRestakingProfile();

  const accountAddress = useActiveAccountAddress();

  const { value, isApiLoading } = usePolkadotApi(
    useCallback(
      async (api) => {
        if (!accountAddress) return [null, null] as const;

        const [stakingInfo, roleInfo] = await api.queryMulti<
          [
            Option<PalletStakingStakingLedger>,
            Option<PalletRolesRestakingLedger>
          ]
        >([
          [api.query.staking.ledger, accountAddress],
          [api.query.roles.ledger, accountAddress],
        ]);

        if (roleInfo.isNone || stakingInfo.isNone) return [null, null] as const;

        const stakingLedger = stakingInfo.unwrap();
        const roleLedger = roleInfo.unwrap();

        const totalRestaked = roleLedger.total.toNumber() ?? null;
        const activeStaked = +formatUnits(
          stakingLedger.active.toBigInt(),
          TANGLE_TOKEN_DECIMALS
        );

        return [activeStaked, totalRestaked] as const;
      },
      [accountAddress]
    )
  );

  const { value: earnings, isApiLoading: isEarningsLoading } = usePolkadotApi(
    useCallback(
      async (api) => {
        if (!accountAddress) return null;

        const accountId = api.createType('AccountId32', accountAddress);

        let totalPoints = 0;

        const entries = await api.query.roles.erasRestakeRewardPoints.entries();

        entries.forEach(([, { individual }]) => {
          const points = individual.get(accountId);

          if (points !== undefined) {
            totalPoints += points.toNumber();
          }
        });

        return totalPoints;
      },
      [accountAddress]
    )
  );

  const { availableForRestake, totalRestaked } = useMemo(() => {
    if (value === null) {
      return {
        totalRestaked: null,
        availableForRestake: null,
      };
    }

    const [activeStaked, totalRestaked] = value;

    // 50% of active staked
    const availableForRestake =
      activeStaked !== null
        ? typeof totalRestaked === 'number'
          ? activeStaked * 0.5 - totalRestaked
          : activeStaked * 0.5
        : null;

    return {
      totalRestaked,
      availableForRestake,
    };
  }, [value]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 justify-items-stretch">
      <OverviewCard
        hasExistingProfile={hasExistingProfile}
        profileTypeOpt={substrateProfileTypeOpt}
        isLoading={isApiLoading || isEarningsLoading}
        totalRestaked={totalRestaked}
        availableForRestake={availableForRestake}
        earnings={earnings}
      />

      <RoleDistributionCard />

      <RolesEarningsCard />

      <JobsCard />
    </div>
  );
};

export default RestakePage;
