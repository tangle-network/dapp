import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { twMerge } from 'tailwind-merge';

import { ProportionPieChart } from '../../components/charts';
import GlassCard from '../../components/GlassCard/GlassCard';
import { TANGLE_TOKEN_UNIT } from '../../constants';
import { getRoleDistributionChartData } from '../../data/roleDistributionChart';

interface RoleDistributionCardProps {
  className?: string;
}

const RoleDistributionCard = async ({
  className,
}: RoleDistributionCardProps) => {
  const data = await getRoleDistributionChartData();

  return (
    <GlassCard className={twMerge('justify-between', className)}>
      <Typography variant="h5" fw="bold">
        Role Distribution
      </Typography>

      <div className="flex items-center justify-center">
        <ProportionPieChart
          data={data}
          title="Total:"
          showTotal
          unit={TANGLE_TOKEN_UNIT}
        />
      </div>
    </GlassCard>
  );
};

export default RoleDistributionCard;
