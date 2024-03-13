import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import dynamic from 'next/dynamic';
import { FC } from 'react';

import GlassCard from '../../../components/GlassCard/GlassCard';

const EarningsChart = dynamic(() => import('./EarningsChart'), { ssr: false });

const RolesEarningsCard: FC = () => {
  return (
    <GlassCard className="h-[409px] overflow-hidden">
      <Typography variant="h5" fw="bold">
        Roles Earnings
      </Typography>

      <EarningsChart />
    </GlassCard>
  );
};

export default RolesEarningsCard;
