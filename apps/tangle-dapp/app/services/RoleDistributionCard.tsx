import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import dynamic from 'next/dynamic';
import { twMerge } from 'tailwind-merge';

import GlassCard from '../../components/GlassCard/GlassCard';
import { TANGLE_TOKEN_UNIT } from '../../constants';
import { getRoleDistributionChartData } from '../../data/roleDistributionChart';

const ProportionPieChart = dynamic(
  () => import('../../components/charts/ProportionPieChart'),
  {
    ssr: false,
  }
);

interface RoleDistributionCardProps {
  className?: string;
}

const RoleDistributionCard = async ({
  className,
}: RoleDistributionCardProps) => {
  const data = await getRoleDistributionChartData();

  return (
    <GlassCard className={twMerge('justify-between flex flex-col', className)}>
      <Typography variant="h5" fw="bold">
        Role Distribution
      </Typography>

      <div className="flex-1 flex items-center justify-center">
        <div className="min-h-[200px]">
          <div className="h-full flex items-center justify-center">
            <ProportionPieChart
              data={data}
              title="Total:"
              showTotal
              unit={TANGLE_TOKEN_UNIT}
            />
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default RoleDistributionCard;
