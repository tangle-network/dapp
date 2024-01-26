import { Button, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import GlassCard from '../../components/GlassCard/GlassCard';

const RecentTxContainer: FC = () => {
  return (
    <GlassCard>
      <div className="flex flex-row justify-between">
        <Typography variant="h5" fw="bold" className="dark:text-mono-0">
          Recent Transactions
        </Typography>

        <Button
          size="sm"
          variant="utility"
          color="primary"
          className="uppercase"
        >
          View Explorer
        </Button>
      </div>

      <div className="flex flex-col gap-4 justify-center items-center h-full text-center ">
        <Typography variant="h4" fw="bold" className="capitalize">
          ✨ Upcoming Feature
        </Typography>

        <Typography variant="body1" className="text-center max-w-lg">
          In the future, you will be able to quickly glance over your recent
          transactions, including Transfers, Vesting, Airdrop claim, and staking
          rewards. Stay tuned!
        </Typography>

        <Button>View Network</Button>
      </div>
    </GlassCard>
  );
};

export default RecentTxContainer;
