import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { FC } from 'react';

import GlassCard from '../../../../components/GlassCard/GlassCard';
import EarningsChart from './EarningsChart';

const RolesEarningsCard: FC = () => {
  return (
    <GlassCard className="justify-between h-[350px]">
      <Typography variant="h5" fw="bold">
        Roles Earnings
      </Typography>

      <EarningsChart />
    </GlassCard>
  );
};

export default RolesEarningsCard;
