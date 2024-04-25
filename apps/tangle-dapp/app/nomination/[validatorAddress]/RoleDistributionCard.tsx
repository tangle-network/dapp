'use client';

import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import IndependentRoleDistributionChart from '../../../components/charts/IndependentRoleDistributionChart';
import SharedRoleDistributionChart from '../../../components/charts/SharedRoleDistributionChart';
import GlassCard from '../../../components/GlassCard/GlassCard';
import { RestakingProfileType } from '../../../types';
import useRoleDistributionByValidator from './hooks/useRoleDistributionByValidator';

interface RoleDistributionCardProps {
  validatorAddress: string;
  className?: string;
}

const RoleDistributionCard: FC<RoleDistributionCardProps> = ({
  validatorAddress,
  className,
}) => {
  const { profileType, distribution } =
  useRoleDistributionByValidator(validatorAddress);

  return (
    <GlassCard className={twMerge('justify-between flex flex-col', className)}>
      <Typography variant="h5" fw="bold">
        Role Distribution
      </Typography>

      <div className="flex-1 flex items-center justify-center">
        <div className="min-h-[200px]">
          <div className="h-full flex items-center justify-center">
            {profileType === RestakingProfileType.SHARED ? (
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
