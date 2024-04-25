'use client';

import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import IndependentRoleDistributionChart from '../../../components/charts/IndependentRoleDistributionChart';
import SharedRoleDistributionChart from '../../../components/charts/SharedRoleDistributionChart';
import GlassCard from '../../../components/GlassCard/GlassCard';
import useRestakingProfile from '../../../data/restaking/useRestakingProfile';
import { RestakingProfileType } from '../../../types';
import assertRestakingService from '../../../utils/assertRestakingService';
import getChartDataAreaColorByServiceType from '../../../utils/getChartDataAreaColorByServiceType';

interface RoleDistributionCardProps {
  validatorAddress: string;
  className?: string;
}

const RoleDistributionCard: FC<RoleDistributionCardProps> = ({
  validatorAddress,
  className,
}) => {
  const { profileTypeOpt: profileType, distribution } =
    useRestakingProfile(validatorAddress);

  const chartData = !distribution
    ? []
    : Object.entries(distribution).map(([name, value]) => {
        assertRestakingService(name);

        return {
          name,
          value,
          color: getChartDataAreaColorByServiceType(name),
        };
      });

  return (
    <GlassCard className={twMerge('justify-between flex flex-col', className)}>
      <Typography variant="h5" fw="bold">
        Role Distribution
      </Typography>

      <div className="flex-1 flex items-center justify-center">
        <div className="min-h-[200px]">
          <div className="h-full flex items-center justify-center">
            {profileType?.value === RestakingProfileType.SHARED ? (
              <SharedRoleDistributionChart data={chartData} />
            ) : (
              <IndependentRoleDistributionChart
                data={chartData}
                title={profileType ? 'Independent' : 'No data'}
              />
            )}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default RoleDistributionCard;
