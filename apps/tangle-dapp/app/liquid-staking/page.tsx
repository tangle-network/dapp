import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { GlassCard } from '../../components';
import LiquidStakingTokenItem from '../../components/LiquidStaking/stakeAndUnstake/LiquidStakingTokenItem';
import StatItem from '../../components/LiquidStaking/StatItem';
import { LS_PROTOCOLS } from '../../constants/liquidStaking/types';

const LiquidStakingPage: FC = () => {
  return (
    <div className="flex flex-col gap-10">
      <GlassCard className="flex flex-row items-center justify-between w-full overflow-x-auto">
        <div className="flex flex-col gap-2">
          <Typography variant="h5" fw="bold">
            Tangle Liquid Staking
          </Typography>

          <Typography variant="body1" fw="normal">
            Get Liquid Staking Tokens (LSTs) to earn & unleash restaking on
            Tangle Mainnet via delegation.
          </Typography>
        </div>

        <div className="flex gap-6 h-full">
          <StatItem title="$123.01" subtitle="My Total Staking" />
        </div>
      </GlassCard>

      <div className="flex flex-col gap-4">
        <Typography variant="h4" fw="bold">
          Liquid Staking Tokens
        </Typography>

        <GlassCard className="space-y-4">
          <div className="overflow-x-auto">
            <div className="flex flex-col gap-4 min-w-[750px]">
              {LS_PROTOCOLS.map((protocol) => {
                return (
                  <LiquidStakingTokenItem
                    key={protocol.id}
                    protocolId={protocol.id}
                    title={`Tangle ${protocol.name}`}
                    tokenSymbol={protocol.token}
                    // TODO: Can't pass non-plain objects as props to Client components from Server components (this page). For now, passing in as a string then creating BN instance inside the component.
                    totalStaked="100000000"
                    totalValueStaked={220_000_123}
                  />
                );
              })}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default LiquidStakingPage;
