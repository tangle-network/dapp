'use client';

import { TANGLE_TOKEN_DECIMALS } from '@webb-tools/dapp-config/constants/tangle';
import { Spinner } from '@webb-tools/icons';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { ComponentProps, FC, useMemo } from 'react';
import { formatUnits } from 'viem';

import { RoleEarningsChart } from '../../components/charts';
import GlassCard from '../../components/GlassCard/GlassCard';
import useRestakingProfile from '../../data/restaking/useRestakingProfile';
import entriesOf from '../../utils/entriesOf';

const RolesEarningsCard: FC = () => {
  const { earningsRecord, isLoading } = useRestakingProfile();

  const data = useMemo<ComponentProps<typeof RoleEarningsChart>['data']>(() => {
    if (!earningsRecord) return [];

    return entriesOf(earningsRecord).map(([era, reward]) => ({
      era,
      // Format to display already handled in the chart component
      reward: +formatUnits(reward, TANGLE_TOKEN_DECIMALS),
    }));
  }, [earningsRecord]);

  return (
    <GlassCard className="h-[409px] overflow-hidden flex flex-col">
      <Typography variant="h5" fw="bold">
        Roles Earnings
      </Typography>

      {isLoading ? (
        <div className="flex items-center justify-center flex-1">
          <Spinner size="xl" />
        </div>
      ) : (
        <RoleEarningsChart data={data} />
      )}
    </GlassCard>
  );
};

export default RolesEarningsCard;
