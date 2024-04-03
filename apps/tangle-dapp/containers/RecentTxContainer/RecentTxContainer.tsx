'use client';

import { Button, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import GlassCard from '../../components/GlassCard/GlassCard';
import useNetworkStore from '../../context/useNetworkStore';

const RecentTxContainer: FC = () => {
  const { network } = useNetworkStore();

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
          target="_blank"
          href={network.polkadotExplorer}
        >
          Open Explorer
        </Button>
      </div>

      <div className="flex flex-col gap-3 justify-center items-center h-full text-center">
        <Typography variant="body1" className="text-center max-w-lg">
          Soon, you&apos;ll be able to conveniently glance at your recent
          transactions, like transfers, vesting, airdrop claims, and staking
          rewards. Stay tuned!
        </Typography>
      </div>
    </GlassCard>
  );
};

export default RecentTxContainer;
