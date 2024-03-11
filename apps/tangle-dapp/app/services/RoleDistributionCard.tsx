import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import dynamic from 'next/dynamic';
import { twMerge } from 'tailwind-merge';

import GlassCard from '../../components/GlassCard/GlassCard';
import { getRoleDistributionChartData } from '../../data/roleDistributionChart';

const RoleDistributionChart = dynamic(
  () => import('../../components/charts/IndependentRoleDistributionChart'),
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
            <RoleDistributionChart data={data} title="Total:" />
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default RoleDistributionCard;
