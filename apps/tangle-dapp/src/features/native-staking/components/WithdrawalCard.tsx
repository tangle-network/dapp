import { FC, useState, useMemo } from 'react';
import {
  Button,
  Card,
  CardVariant,
  Typography,
  Input,
} from '@tangle-network/ui-components';
import type { Address } from 'viem';
import { parseEther } from 'viem';
import {
  usePodOwnerInfo,
  useQueueWithdrawal,
  useCompleteWithdrawal,
  useWithdrawalDelayBlocks,
  useWithdrawalInfo,
} from '../hooks';
import { weiToEth } from '../types';

interface WithdrawalCardProps {
  ownerAddress: Address;
}

const WithdrawalCard: FC<WithdrawalCardProps> = ({ ownerAddress }) => {
  const { data: ownerInfo, isLoading, refetch } = usePodOwnerInfo(ownerAddress);
  const { delayBlocks } = useWithdrawalDelayBlocks();
  const {
    queueWithdrawal,
    isPending: isQueuing,
    isConfirming: isConfirmingQueue,
    isSuccess: queueSuccess,
    error: queueError,
  } = useQueueWithdrawal();
  const {
    completeWithdrawal,
    isPending: isCompleting,
    isConfirming: isConfirmingComplete,
    isSuccess: completeSuccess,
    error: completeError,
  } = useCompleteWithdrawal();

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawalRoot, setWithdrawalRoot] = useState('');

  // Get withdrawal info if we have a root
  const { withdrawal: withdrawalInfo } = useWithdrawalInfo(
    withdrawalRoot.startsWith('0x')
      ? (withdrawalRoot as `0x${string}`)
      : undefined,
  );

  const parsedAmount = useMemo(() => {
    try {
      return withdrawAmount ? parseEther(withdrawAmount) : BigInt(0);
    } catch {
      return BigInt(0);
    }
  }, [withdrawAmount]);

  const canQueue = useMemo(
    () =>
      parsedAmount > BigInt(0) &&
      ownerInfo &&
      parsedAmount <= ownerInfo.availableToWithdraw,
    [parsedAmount, ownerInfo],
  );

  // Refetch after successful operations
  if (queueSuccess || completeSuccess) {
    setTimeout(() => refetch(), 2000);
  }

  const handleQueueWithdrawal = () => {
    if (!canQueue) return;
    queueWithdrawal(parsedAmount);
  };

  const handleCompleteWithdrawal = () => {
    if (!withdrawalRoot.startsWith('0x')) return;
    completeWithdrawal(withdrawalRoot as `0x${string}`);
  };

  if (isLoading || !ownerInfo) {
    return (
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          Withdrawals
        </Typography>
        <Typography variant="body1" className="text-mono-120 dark:text-mono-80">
          Loading withdrawal information...
        </Typography>
      </Card>
    );
  }

  return (
    <Card variant={CardVariant.GLASS} className="p-6">
      <Typography variant="h5" fw="bold" className="mb-4">
        Withdrawals
      </Typography>

      <div className="space-y-6">
        {/* Balance info */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-mono-20 dark:bg-mono-160 rounded-lg">
          <div>
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-80"
            >
              Available to Withdraw
            </Typography>
            <Typography variant="h5" fw="bold">
              {weiToEth(ownerInfo.availableToWithdraw)} ETH
            </Typography>
          </div>
          <div>
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-80"
            >
              Queued for Withdrawal
            </Typography>
            <Typography variant="h5" fw="bold">
              {weiToEth(ownerInfo.queuedShares)} ETH
            </Typography>
          </div>
        </div>

        {/* Withdrawal delay info */}
        {delayBlocks && (
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg">
            <Typography
              variant="body2"
              className="text-blue-700 dark:text-blue-300"
            >
              Withdrawal Delay: {delayBlocks.toString()} blocks (~
              {Math.ceil((Number(delayBlocks) * 12) / 3600)} hours)
            </Typography>
          </div>
        )}

        {/* Queue Withdrawal Section */}
        <div className="space-y-4 p-4 border border-mono-40 dark:border-mono-140 rounded-lg">
          <Typography variant="body1" fw="bold">
            Queue Withdrawal
          </Typography>

          <div className="space-y-2">
            <Typography
              variant="body2"
              className="text-mono-120 dark:text-mono-80"
            >
              Amount to Withdraw (ETH)
            </Typography>
            <Input
              id="withdrawAmount"
              type="number"
              placeholder="0.0"
              value={withdrawAmount}
              onChange={setWithdrawAmount}
              isInvalid={parsedAmount > ownerInfo.availableToWithdraw}
            />
            {parsedAmount > ownerInfo.availableToWithdraw && (
              <Typography variant="body3" className="text-red-500">
                Exceeds available balance
              </Typography>
            )}
            <Button
              variant="utility"
              size="sm"
              onClick={() =>
                setWithdrawAmount(weiToEth(ownerInfo.availableToWithdraw))
              }
            >
              Max
            </Button>
          </div>

          {queueError && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">
              <Typography variant="body2">
                Error: {queueError.message || 'Failed to queue withdrawal'}
              </Typography>
            </div>
          )}

          {queueSuccess && (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg">
              <Typography variant="body2">
                Withdrawal queued! Save the withdrawal root from the transaction
                to complete later.
              </Typography>
            </div>
          )}

          <Button
            isFullWidth
            onClick={handleQueueWithdrawal}
            isLoading={isQueuing || isConfirmingQueue}
            isDisabled={!canQueue || isQueuing || isConfirmingQueue}
          >
            {isQueuing
              ? 'Queueing...'
              : isConfirmingQueue
                ? 'Confirming...'
                : 'Queue Withdrawal'}
          </Button>
        </div>

        {/* Complete Withdrawal Section */}
        <div className="space-y-4 p-4 border border-mono-40 dark:border-mono-140 rounded-lg">
          <Typography variant="body1" fw="bold">
            Complete Withdrawal
          </Typography>

          <Typography
            variant="body2"
            className="text-mono-120 dark:text-mono-80"
          >
            Enter a withdrawal root to complete a queued withdrawal after the
            delay period.
          </Typography>

          <div className="space-y-2">
            <Typography variant="body2" fw="bold">
              Withdrawal Root
            </Typography>
            <Input
              id="withdrawalRoot"
              placeholder="0x..."
              value={withdrawalRoot}
              onChange={setWithdrawalRoot}
            />
          </div>

          {withdrawalInfo && (
            <div className="p-3 bg-mono-20 dark:bg-mono-160 rounded-lg">
              <Typography
                variant="body3"
                className="text-mono-120 dark:text-mono-80"
              >
                Status:{' '}
                {withdrawalInfo.completed
                  ? 'Already completed'
                  : withdrawalInfo.canComplete
                    ? 'Ready to complete'
                    : 'Pending (waiting for delay)'}
              </Typography>
            </div>
          )}

          {completeError && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg">
              <Typography variant="body2">
                Error:{' '}
                {completeError.message || 'Failed to complete withdrawal'}
              </Typography>
            </div>
          )}

          {completeSuccess && (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg">
              <Typography variant="body2">
                Withdrawal completed successfully!
              </Typography>
            </div>
          )}

          <Button
            isFullWidth
            variant="secondary"
            onClick={handleCompleteWithdrawal}
            isLoading={isCompleting || isConfirmingComplete}
            isDisabled={
              !withdrawalRoot.startsWith('0x') ||
              isCompleting ||
              isConfirmingComplete
            }
          >
            {isCompleting
              ? 'Completing...'
              : isConfirmingComplete
                ? 'Confirming...'
                : 'Complete Withdrawal'}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default WithdrawalCard;
