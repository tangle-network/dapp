import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import dynamic from 'next/dynamic';
import { twMerge } from 'tailwind-merge';

import GlassCard from '../../../components/GlassCard/GlassCard';
import { getRoleDistributionChartDataByAcc } from '../../../data/roleDistributionChart';
import { ProfileType } from '../../../types';

const IndependentRoleDistributionChart = dynamic(
  () => import('../../../components/charts/IndependentRoleDistributionChart'),
  {
    ssr: false,
  }
);

const SharedRoleDistributionChart = dynamic(
  () => import('../../../components/charts/SharedRoleDistributionChart'),
  {
    ssr: false,
  }
);

interface RoleDistributionCardProps {
  validatorAddress: string;
  className?: string;
}

const RoleDistributionCard = async ({
  validatorAddress,
  className,
}: RoleDistributionCardProps) => {
  const { profileType, distribution } = await getRoleDistributionChartDataByAcc(
    validatorAddress
  );

  return (
    <GlassCard className={twMerge('justify-between flex flex-col', className)}>
      <Typography variant="h5" fw="bold">
        Role Distribution
      </Typography>

      <div className="flex-1 flex items-center justify-center">
        <div className="min-h-[200px]">
          <div className="h-full flex items-center justify-center">
            {profileType === ProfileType.SHARED ? (
              <SharedRoleDistributionChart data={distribution} />
            ) : (
              <IndependentRoleDistributionChart data={distribution} />
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default RoleDistributionCard;
