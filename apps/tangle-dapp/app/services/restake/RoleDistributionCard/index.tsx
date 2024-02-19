import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import type { FC } from 'react';

import GlassCard from '../../../../components/GlassCard/GlassCard';

import dynamic from 'next/dynamic';

const IndependentChart = dynamic(
    () => import('./IndependentChart'),
    { ssr: false }
  )

const RoleDistributionCard: FC = () => {
  return (
    <GlassCard className="justify-between">
      <Typography variant="h5" fw="bold">
        Role Distribution
      </Typography>

      <IndependentChart />
    </GlassCard>
  );
};

export default RoleDistributionCard;
