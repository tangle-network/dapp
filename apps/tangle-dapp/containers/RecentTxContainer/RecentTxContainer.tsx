'use client';

import { Button, Typography } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import GlassCard from '../../components/GlassCard/GlassCard';
import useNetworkStore from '../../context/useNetworkStore';
import useAgnosticAccountInfo from '../../hooks/useAgnosticAccountInfo';

const RecentTxContainer: FC = () => {
  const { network } = useNetworkStore();
  const { isEvm } = useAgnosticAccountInfo();

  return (
    <GlassCard className="space-y-4">
      <div className="flex justify-end p-4">
        <Button
          size="sm"
          variant="utility"
          color="primary"
          className="uppercase"
          target="_blank"
          href={isEvm ? network.evmExplorerUrl : network.polkadotExplorerUrl}
        >
          Open Explorer
        </Button>
      </div>

      <div className="flex flex-col gap-3 justify-center items-center h-full text-center">
        <Typography variant="body1" className="text-center max-w-lg">
          Welcome to Tangle dApp – Your portal to managing Tangle Network assets
          and upcoming Multi-Party Computation (MPC) services.
        </Typography>
      </div>
    </GlassCard>
  );
};

export default RecentTxContainer;
