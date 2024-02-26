import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import dynamic from 'next/dynamic';

import GlassCard from '../../components/GlassCard/GlassCard';
import { getProtocolEarningsChartData } from '../../data/roleEarningsChart';

const RoleEarningsChart = dynamic(
  () => import('../../components/charts/RoleEarningsChart'),
  {
    ssr: false,
  }
);

interface ProtocolEarningsCardProps {
  className?: string;
}

const ProtocolEarningsCard = async ({
  className,
}: ProtocolEarningsCardProps) => {
  const data = await getProtocolEarningsChartData();

  return (
    <GlassCard className={className}>
      <Typography variant="h5" fw="bold">
        Protocol Earnings
      </Typography>

      <div className="min-h-[200px]">
        <div className="h-full flex items-center justify-center">
          <RoleEarningsChart data={data} />
        </div>
      </div>
    </GlassCard>
  );
};

export default ProtocolEarningsCard;
