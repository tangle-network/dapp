'use client';

import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import RoleDistributionChart from '../../components/charts/IndependentRoleDistributionChart';
import GlassCard from '../../components/GlassCard/GlassCard';
import useRoleDistribution from './hooks/useRoleDistribution';

interface RoleDistributionCardProps {
  className?: string;
}

const RoleDistributionCard: FC<RoleDistributionCardProps> = ({ className }) => {
  const data = useRoleDistribution();

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
