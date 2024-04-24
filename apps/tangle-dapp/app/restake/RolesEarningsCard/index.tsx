'use client';

import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { FC, useMemo } from 'react';

import { RoleEarningsChart } from '../../../components/charts';
import GlassCard from '../../../components/GlassCard/GlassCard';
import type { EarningRecord } from '../../../data/restaking/types';

type RolesEarningsCardProps = {
  earnings?: EarningRecord | null;
};

const RolesEarningsCard: FC<RolesEarningsCardProps> = ({ earnings }) => {
  const data = useMemo(() => {
    if (!earnings) return [];

    return Object.entries(earnings).map(([era, reward]) => ({
      era: +era,
      // Recharts can only handle number, temporarily convert to number
      reward: reward,
    }));
  }, [earnings]);

  return (
    <GlassCard className="h-[409px] overflow-hidden">
      <Typography variant="h5" fw="bold">
        Roles Earnings
      </Typography>

      <RoleEarningsChart data={data} />
    </GlassCard>
  );
};

export default RolesEarningsCard;
