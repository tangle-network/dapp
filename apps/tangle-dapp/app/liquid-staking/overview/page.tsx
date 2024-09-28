import { LsProtocolsTable, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import StatItem from '../../../components/StatItem';

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

      <LsProtocolsTable />
    </div>
  );
};

export default LiquidStakingPage;
