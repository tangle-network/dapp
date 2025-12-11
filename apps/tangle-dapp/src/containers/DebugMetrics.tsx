import { Expand } from '@tangle-network/icons';
import { Typography } from '@tangle-network/ui-components';
import { FC, useState } from 'react';
import { useAccount, useChainId, useBlockNumber } from 'wagmi';

const DebugMetrics: FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const stats = (
    <>
      <div className="flex flex-col">
        <Typography variant="body2" className="text-mono-100">
          Chain
        </Typography>
        <Typography variant="body1" fw="semibold">
          {chainId}
        </Typography>
      </div>

      <div className="flex flex-col">
        <Typography variant="body2" className="text-mono-100">
          Block
        </Typography>
        <Typography variant="body1" fw="semibold">
          {blockNumber?.toString() ?? '...'}
        </Typography>
      </div>

      <div className="flex flex-col">
        <Typography variant="body2" className="text-mono-100">
          Status
        </Typography>
        <Typography variant="body1" fw="semibold">
          {isConnected ? 'Connected' : 'Disconnected'}
        </Typography>
      </div>

      {address && (
        <div className="flex flex-col">
          <Typography variant="body2" className="text-mono-100">
            Account
          </Typography>
          <Typography
            variant="body1"
            fw="semibold"
            className="truncate max-w-24"
          >
            {address.slice(0, 6)}...{address.slice(-4)}
          </Typography>
        </div>
      )}
    </>
  );

  return (
    <div
      className="fixed z-10 flex flex-row max-w-lg gap-4 px-4 py-2 overflow-x-auto transition-opacity border rounded-md shadow-md opacity-50 cursor-pointer left-3 bottom-3 bg-mono-20 dark:bg-mono-180 border-mono-140 hover:opacity-100"
      onClick={() => setIsCollapsed((isCollapsed) => !isCollapsed)}
    >
      {isCollapsed ? (
        <div>
          <Expand size="lg" />
        </div>
      ) : (
        stats
      )}
    </div>
  );
};

export default DebugMetrics;
