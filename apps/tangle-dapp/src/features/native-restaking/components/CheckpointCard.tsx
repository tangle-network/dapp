import { FC, useState } from 'react';
import {
  Button,
  Card,
  CardVariant,
  Typography,
} from '@tangle-network/ui-components';
import type { Address } from 'viem';
import { usePodInfo, useStartCheckpoint } from '../hooks';
import { gweiToEth } from '../types';

interface CheckpointCardProps {
  podAddress: Address;
}

const CheckpointCard: FC<CheckpointCardProps> = ({ podAddress }) => {
  const { data: podInfo, isLoading, refetch } = usePodInfo(podAddress);
  const { startCheckpoint, isPending, isConfirming, isSuccess, error } =
    useStartCheckpoint(podAddress);
  const [revertIfNoBalance, setRevertIfNoBalance] = useState(false);

  const handleStartCheckpoint = () => {
    startCheckpoint(revertIfNoBalance);
  };

  // Refetch after successful checkpoint start
  if (isSuccess) {
    setTimeout(() => refetch(), 2000);
  }

  if (isLoading || !podInfo) {
    return (
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          Checkpoint Management
        </Typography>
        <Typography variant="body1" className="text-mono-120 dark:text-mono-80">
          Loading checkpoint information...
        </Typography>
      </Card>
    );
  }

  const canStartCheckpoint =
    !podInfo.checkpointActive && podInfo.activeValidatorCount > 0;

  return (
    <Card variant={CardVariant.GLASS} className="p-6">
      <Typography variant="h5" fw="bold" className="mb-4">
        Checkpoint Management
      </Typography>

      {podInfo.checkpointActive && podInfo.currentCheckpoint ? (
        // Active checkpoint view
        <div className="space-y-4">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg">
            <Typography
              variant="body1"
              fw="bold"
              className="text-blue-700 dark:text-blue-300 mb-2"
            >
              Checkpoint In Progress
            </Typography>
            <Typography
              variant="body2"
              className="text-blue-600 dark:text-blue-400"
            >
              Submit checkpoint proofs to finalize the checkpoint.
            </Typography>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Typography
                variant="body2"
                className="text-mono-120 dark:text-mono-80"
              >
                Proofs Remaining
              </Typography>
              <Typography variant="h5" fw="bold">
                {podInfo.currentCheckpoint.proofsRemaining} /{' '}
                {podInfo.activeValidatorCount}
              </Typography>
            </div>
            <div>
              <Typography
                variant="body2"
                className="text-mono-120 dark:text-mono-80"
              >
                Balance Delta
              </Typography>
              <Typography
                variant="h5"
                fw="bold"
                className={
                  podInfo.currentCheckpoint.balanceDeltasGwei < BigInt(0)
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
                }
              >
                {podInfo.currentCheckpoint.balanceDeltasGwei >= BigInt(0)
                  ? '+'
                  : ''}
                {gweiToEth(podInfo.currentCheckpoint.balanceDeltasGwei)} ETH
              </Typography>
            </div>
          </div>

          <div className="p-4 bg-mono-20 dark:bg-mono-160 rounded-lg space-y-2">
            <Typography variant="body2" fw="bold">
              How to submit checkpoint proofs:
            </Typography>
            <ol className="list-decimal list-inside text-sm text-mono-120 dark:text-mono-80 space-y-1">
              <li>
                Run:{' '}
                <code className="bg-mono-40 dark:bg-mono-140 px-1 rounded">
                  tanglepod-cli checkpoint --pod {podAddress.slice(0, 10)}...
                </code>
              </li>
              <li>Upload the generated JSON proof bundle</li>
              <li>Submit the proofs to complete the checkpoint</li>
            </ol>
          </div>

          {/* TODO: Add proof upload functionality */}
          <Button variant="secondary" isDisabled>
            Upload Checkpoint Proofs (Coming Soon)
          </Button>
        </div>
      ) : (
        // No active checkpoint view
        <div className="space-y-4">
          <Typography
            variant="body1"
            className="text-mono-120 dark:text-mono-80"
          >
            Start a checkpoint to update validator balances and record any
            beacon chain changes.
          </Typography>

          {podInfo.activeValidatorCount === 0 && (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg">
              <Typography
                variant="body2"
                className="text-yellow-700 dark:text-yellow-300"
              >
                You need at least one active validator to start a checkpoint.
                First verify your withdrawal credentials.
              </Typography>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="revertIfNoBalance"
              checked={revertIfNoBalance}
              onChange={(e) => setRevertIfNoBalance(e.target.checked)}
              className="rounded"
            />
            <label
              htmlFor="revertIfNoBalance"
              className="text-sm text-mono-120 dark:text-mono-80"
            >
              Revert if pod has no ETH balance
            </label>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">
              <Typography variant="body2">
                Error: {error.message || 'Failed to start checkpoint'}
              </Typography>
            </div>
          )}

          {isSuccess && (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg">
              <Typography variant="body2">
                Checkpoint started successfully!
              </Typography>
            </div>
          )}

          <Button
            isFullWidth
            onClick={handleStartCheckpoint}
            isLoading={isPending || isConfirming}
            isDisabled={!canStartCheckpoint || isPending || isConfirming}
          >
            {isPending
              ? 'Starting...'
              : isConfirming
                ? 'Confirming...'
                : 'Start Checkpoint'}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default CheckpointCard;
