import { Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import LiquidStakingTokenItem from '../../components/LiquidStaking/stakeAndUnstake/LiquidStakingTokenItem';
import StatItem from '../../components/LiquidStaking/StatItem';
import { LIQUID_STAKING_CHAINS } from '../../constants/liquidStaking';

const LiquidStakingPage: FC = () => {
  return (
    <div className="flex flex-col gap-10">
      <div className="p-6 space-y-0 rounded-2xl flex flex-row items-center justify-between w-full overflow-x-auto bg-liquid_staking_banner dark:bg-liquid_staking_banner_dark">
        <div className="flex flex-col gap-2">
          <Typography variant="h5" fw="bold">
            Tangle Liquid Staking
          </Typography>

          <Typography
            variant="body1"
            fw="normal"
            className="text-mono-120 dark:text-mono-100"
          >
            Get Liquid Staking Tokens (LSTs) to earn & unleash restaking on
            Tangle Mainnet via delegation.
          </Typography>
        </div>

        <div className="flex gap-6 h-full">
          <StatItem title="$123.01" subtitle="My Total Staking" largeSubtitle />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Typography variant="h4" fw="bold">
          Liquid Staking Tokens
        </Typography>

        <div className="flex flex-col gap-3 min-w-[750px] py-5 px-6 border border-mono-0 dark:border-mono-160 rounded-2xl bg-liquid_staking_tokens_table dark:bg-liquid_staking_tokens_table_dark overflow-x-auto">
          {LIQUID_STAKING_CHAINS.map((chain) => {
            return (
              <LiquidStakingTokenItem
                key={chain.id}
                chainId={chain.id}
                title={`Tangle ${chain.name}`}
                tokenSymbol={chain.token}
                // TODO: Can't pass non-plain objects as props to Client components from Server components (this page). For now, passing in as a string then creating BN instance inside the component.
                apy={0.1}
                derivativeTokens="5"
                myStake={{
                  value: 30,
                  valueInUSD: 1200,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LiquidStakingPage;
