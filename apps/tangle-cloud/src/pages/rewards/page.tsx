/**
 * Rewards page - view and claim pending rewards.
 */

import { FC, useMemo } from 'react';
import { useAccount } from 'wagmi';
import {
  Button,
  Card,
  CardVariant,
  Typography,
  SkeletonLoader,
  EMPTY_VALUE_PLACEHOLDER,
} from '@tangle-network/ui-components';
import {
  usePendingRewards,
  useRewardHistory,
  useClaimRewardsTx,
  formatRewardAmount,
  type RewardEntry,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { twMerge } from 'tailwind-merge';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';

const RewardsPage: FC = () => {
  const { address: _address, isConnected } = useAccount();

  const { data: pendingRewards, isLoading: isLoadingPending } =
    usePendingRewards();

  const { data: rewardHistory, isLoading: isLoadingHistory } =
    useRewardHistory();

  const {
    claimRewards,
    status: claimStatus,
    error: claimError,
    reset,
  } = useClaimRewardsTx();

  const isClaiming = claimStatus === 'pending';
  const isClaimSuccess = claimStatus === 'success';

  // Group history by claimed status
  const { pendingEntries, claimedEntries } = useMemo(() => {
    if (!rewardHistory) return { pendingEntries: [], claimedEntries: [] };

    const pending = rewardHistory.filter((r) => !r.claimed);
    const claimed = rewardHistory.filter((r) => r.claimed);

    return { pendingEntries: pending, claimedEntries: claimed };
  }, [rewardHistory]);

  const handleClaimAll = async () => {
    await claimRewards();
  };

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Typography variant="h4">Connect Wallet</Typography>
        <Typography variant="body1" className="text-mono-100 mt-2">
          Please connect your wallet to view rewards.
        </Typography>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Typography variant="h4" fw="bold">
          Rewards
        </Typography>
        <Typography variant="body2" className="text-mono-100">
          View and claim your earned rewards from operating and delegating.
        </Typography>
      </div>

      {/* Pending Rewards Card */}
      <Card variant={CardVariant.GLASS} className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h5" fw="bold">
            Pending Rewards
          </Typography>

          {(isClaimSuccess || claimError) && (
            <Button variant="utility" size="sm" onClick={reset}>
              Reset
            </Button>
          )}
        </div>

        {isLoadingPending ? (
          <SkeletonLoader className="h-24" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Typography variant="body2" className="text-mono-100 mb-1">
                Total Pending
              </Typography>
              <Typography variant="h3" fw="bold">
                {pendingRewards !== undefined
                  ? formatRewardAmount(pendingRewards)
                  : EMPTY_VALUE_PLACEHOLDER}{' '}
                <span className="text-mono-100 text-lg">TNT</span>
              </Typography>
            </div>

            <div className="flex items-center justify-end">
              <Button
                onClick={handleClaimAll}
                isLoading={isClaiming}
                isDisabled={
                  isClaiming || !pendingRewards || pendingRewards === BigInt(0)
                }
              >
                {isClaiming ? 'Claiming...' : 'Claim All Rewards'}
              </Button>
            </div>
          </div>
        )}

        {isClaimSuccess && (
          <div className="mt-4 p-3 rounded-lg bg-green-500/20 text-green-400">
            <Typography variant="body2">
              Rewards claimed successfully!
            </Typography>
          </div>
        )}

        {claimError && (
          <div className="mt-4">
            <ErrorMessage>{claimError.message}</ErrorMessage>
          </div>
        )}
      </Card>

      {/* Pending Entries */}
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          Pending Reward Details
        </Typography>

        {isLoadingHistory ? (
          <div className="space-y-2">
            <SkeletonLoader className="h-16" />
            <SkeletonLoader className="h-16" />
          </div>
        ) : pendingEntries.length > 0 ? (
          <RewardTable entries={pendingEntries} />
        ) : (
          <div className="text-center py-6 text-mono-100">
            <Typography variant="body1">
              No pending rewards. Rewards are earned by operating services or
              delegating to operators.
            </Typography>
          </div>
        )}
      </Card>

      {/* Reward History */}
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          Reward History
        </Typography>

        {isLoadingHistory ? (
          <div className="space-y-2">
            <SkeletonLoader className="h-16" />
            <SkeletonLoader className="h-16" />
            <SkeletonLoader className="h-16" />
          </div>
        ) : claimedEntries.length > 0 ? (
          <RewardTable entries={claimedEntries} showClaimed />
        ) : (
          <div className="text-center py-6 text-mono-100">
            <Typography variant="body1">No reward history yet.</Typography>
          </div>
        )}
      </Card>
    </div>
  );
};

interface RewardTableProps {
  entries: RewardEntry[];
  showClaimed?: boolean;
}

const RewardTable: FC<RewardTableProps> = ({
  entries,
  showClaimed = false,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-mono-60 dark:border-mono-140">
            <th className="text-left py-3 px-4 text-mono-100 font-medium">
              Service
            </th>
            <th className="text-left py-3 px-4 text-mono-100 font-medium">
              Blueprint
            </th>
            <th className="text-left py-3 px-4 text-mono-100 font-medium">
              Amount
            </th>
            <th className="text-left py-3 px-4 text-mono-100 font-medium">
              Date
            </th>
            {showClaimed && (
              <th className="text-left py-3 px-4 text-mono-100 font-medium">
                Status
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className="border-b border-mono-40 dark:border-mono-160"
            >
              <td className="py-3 px-4">
                <Typography variant="body2">
                  Service #{entry.serviceId.toString()}
                </Typography>
              </td>
              <td className="py-3 px-4">
                <Typography variant="body2">
                  Blueprint #{entry.blueprintId.toString()}
                </Typography>
              </td>
              <td className="py-3 px-4">
                <Typography variant="body2" fw="semibold">
                  {formatRewardAmount(entry.amount)} TNT
                </Typography>
              </td>
              <td className="py-3 px-4">
                <Typography variant="body2">
                  {new Date(
                    Number(entry.timestamp) * 1000,
                  ).toLocaleDateString()}
                </Typography>
              </td>
              {showClaimed && (
                <td className="py-3 px-4">
                  <span
                    className={twMerge(
                      'px-2 py-1 rounded text-xs',
                      entry.claimed
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400',
                    )}
                  >
                    {entry.claimed ? 'Claimed' : 'Pending'}
                  </span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RewardsPage;
