import { Button, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import GlassCard from '../../components/GlassCard/GlassCard';
import { TANGLE_TESTNET_EXPLORER_URL } from '../../../../libs/webb-ui-components/src/constants/index';

const RecentTxContainer: FC = () => {
  return (
    <GlassCard className="space-y-4">
      <div className="flex flex-row justify-between">
        <Typography variant="h5" fw="bold" className="dark:text-mono-0">
          Recent Transactions
        </Typography>

        <Button
          size="sm"
          variant="utility"
          color="primary"
          className="uppercase"
          href={TANGLE_TESTNET_EXPLORER_URL}
        >
          View Explorer
        </Button>
      </div>

      <div className="flex flex-col gap-3 justify-center items-center h-full text-center">
        <Typography variant="h4" fw="bold" className="capitalize">
          ✨ Upcoming Feature
        </Typography>

        <Typography variant="body1" className="text-center max-w-lg">
          Soon, you&apos;ll be able to conveniently glance at your recent
          transactions, like Transfers, Vesting, Airdrop claims, and Staking
          Rewards. Stay tuned!
        </Typography>

        <Button>View Network</Button>
      </div>
    </GlassCard>
  );
};

export default RecentTxContainer;
