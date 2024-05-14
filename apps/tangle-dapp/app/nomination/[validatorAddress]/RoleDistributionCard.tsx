'use client';

import { Spinner } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import IndependentRoleDistributionChart from '../../../components/charts/IndependentRoleDistributionChart';
import SharedRoleDistributionChart from '../../../components/charts/SharedRoleDistributionChart';
import GlassCard from '../../../components/GlassCard/GlassCard';
import useRestakingRoleLedger from '../../../data/restaking/useRestakingRoleLedger';
import { RestakingProfileType } from '../../../types';
import assertRestakingService from '../../../utils/assertRestakingService';
import {
  getProfileTypeFromRestakeRoleLedger,
  getRoleDistributionFromRestakeRoleLedger,
} from '../../../utils/polkadot/restake';
import getChartDataAreaColorByServiceType from '../../../utils/restaking/getChartDataAreaColorByServiceType';

interface RoleDistributionCardProps {
  validatorAddress: string;
  className?: string;
}

const RoleDistributionCard: FC<RoleDistributionCardProps> = ({
  validatorAddress,
  className,
}) => {
  const { result: ledgerOpt, isLoading } =
    useRestakingRoleLedger(validatorAddress);

  const profileType = useMemo(
    () => getProfileTypeFromRestakeRoleLedger(ledgerOpt),
    [ledgerOpt]
  );

  const chartData = useMemo(() => {
    if (!ledgerOpt) return [];
    const distribution = getRoleDistributionFromRestakeRoleLedger(ledgerOpt);
    if (!distribution) return [];

    return Object.entries(distribution).map(([name, value]) => {
      assertRestakingService(name);

      return {
        name,
        value,
        color: getChartDataAreaColorByServiceType(name),
      };
    });
  }, [ledgerOpt]);

  return (
    <GlassCard className={twMerge('justify-between flex flex-col', className)}>
      <Typography variant="h5" fw="bold">
        Role Distribution
      </Typography>

      <div className="flex-1 flex items-center justify-center">
        <div className="h-[200px] flex items-center justify-center">
          {isLoading ? (
            <Spinner size="xl" />
          ) : profileType?.value === RestakingProfileType.SHARED ? (
            <SharedRoleDistributionChart data={chartData} />
          ) : (
            <IndependentRoleDistributionChart
              data={chartData}
              title={profileType ? 'Independent' : 'No data'}
            />
          )}
        </div>
      </div>
    </GlassCard>
  );
};

export default RoleDistributionCard;
