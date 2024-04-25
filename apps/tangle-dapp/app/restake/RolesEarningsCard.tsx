'use client';

import { Spinner } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { FC, useMemo } from 'react';

import { RoleEarningsChart } from '../../components/charts';
import GlassCard from '../../components/GlassCard/GlassCard';
import useRestakingProfile from '../../data/restaking/useRestakingProfile';

const RolesEarningsCard: FC = () => {
  const { earningsRecord, isLoading } = useRestakingProfile();

  const data = useMemo(() => {
    if (!earningsRecord) return [];

    return Object.entries(earningsRecord).map(([era, reward]) => ({
      era: +era,
      // Recharts can only handle number, temporarily convert to number
      reward: reward.toNumber(),
    }));
  }, [earningsRecord]);

  return (
    <GlassCard className="h-[409px] overflow-hidden flex flex-col">
      <Typography variant="h5" fw="bold">
        Roles Earnings
      </Typography>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Spinner size="xl" />
        </div>
      ) : (
        <RoleEarningsChart data={data} />
      )}
    </GlassCard>
  );
};

export default RolesEarningsCard;
