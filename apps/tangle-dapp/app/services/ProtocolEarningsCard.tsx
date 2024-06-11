import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import dynamic from 'next/dynamic';
import { twMerge } from 'tailwind-merge';

import GlassCard from '../../components/GlassCard/GlassCard';
import { getProtocolEarningsChartData } from '../../data/roleEarningsChart';

const RoleEarningsChart = dynamic(
  () => import('../../components/charts/RoleEarningsChart'),
  {
    ssr: false,
  },
);

interface ProtocolEarningsCardProps {
  className?: string;
}

export default async function ProtocolEarningsCard({
  className,
}: ProtocolEarningsCardProps) {
  const data = await getProtocolEarningsChartData();

  return (
    <GlassCard className={twMerge('flex flex-col', className)}>
      <Typography variant="h5" fw="bold">
        Protocol Earnings
      </Typography>

      <div className="flex-1 flex items-center justify-center">
        <div className="w-full min-h-[200px]">
          <RoleEarningsChart data={data} />
        </div>
      </div>
    </GlassCard>
  );
}
