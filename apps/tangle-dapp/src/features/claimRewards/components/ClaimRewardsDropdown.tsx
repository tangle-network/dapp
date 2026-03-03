'use client';

import { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import { formatUnits } from 'viem';
import { useAccount } from 'wagmi';
import { VipDiamondLine, Spinner } from '@tangle-network/icons';
import {
  Dropdown,
  DropdownBody,
  DropdownButton,
  Typography,
  Button,
} from '@tangle-network/ui-components';
import { twMerge } from 'tailwind-merge';
import usePendingRewards from '../../../data/rewards/usePendingRewards';
import useClaimRewardsTx from '../../../data/rewards/useClaimRewardsTx';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import PendingRewardsList from '../../../components/staking/PendingRewardsList';

const ClaimRewardsDropdownContent: FC = () => {
  const { isConnected } = useAccount();
  const {
    data: rewardsData,
    isLoading,
    refetch,
  } = usePendingRewards({
    enabled: isConnected,
  });
  const { execute: claimRewards, status, reset } = useClaimRewardsTx();
  const [claimingAsset, setClaimingAsset] = useState<string | null>(null);

  const hasRewards = rewardsData?.hasRewards ?? false;
  const totalPending = rewardsData?.totalPendingRewards ?? BigInt(0);
  const isClaiming = status === TxStatus.PROCESSING;

  const formattedTotal = useMemo(() => {
    if (totalPending === BigInt(0)) {
      return '0';
    }
    const formatted = formatUnits(totalPending, 18);
    const num = parseFloat(formatted);
    if (num < 0.0001 && num > 0) {
      return '< 0.0001';
    }
    return num.toFixed(4);
  }, [totalPending]);

  const handleClaimAll = useCallback(async () => {
    if (!rewardsData || !claimRewards) {
      return;
    }

    for (const vault of rewardsData.vaults) {
      if (vault.totalPending > BigInt(0)) {
        setClaimingAsset(vault.asset);
        const operators = vault.rewards.map((r) => r.operator);
        await claimRewards({
          asset: vault.asset,
          operators,
        });
      }
    }

    setClaimingAsset(null);
    reset();
    setTimeout(() => {
      refetch();
    }, 2000);
  }, [rewardsData, claimRewards, reset, refetch]);

  if (!isConnected) {
    return null;
  }

  return (
    <Dropdown>
      <DropdownButton
        icon={
          <VipDiamondLine
            size="lg"
            className={twMerge(
              'shrink-0 grow-0',
              hasRewards
                ? 'text-purple-50 dark:text-purple-50'
                : 'text-mono-100 dark:text-mono-100',
            )}
          />
        }
        className={twMerge(
          'relative justify-center',
          hasRewards && 'border-purple-50 dark:border-purple-50',
        )}
        isHideArrowIcon
      >
        {hasRewards && (
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-purple-50" />
        )}
      </DropdownButton>

      <DropdownBody className="min-w-[320px] p-4" sideOffset={8}>
        <div className="flex flex-col gap-3">
          <Typography variant="h5" className="text-mono-200 dark:text-mono-0">
            Pending Rewards
          </Typography>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Spinner size="lg" />
            </div>
          ) : !hasRewards ? (
            <Typography
              variant="body2"
              className="text-mono-100 dark:text-mono-100 py-2"
            >
              No pending rewards to claim
            </Typography>
          ) : (
            <>
              <div className="flex items-center justify-between py-2 border-b border-mono-60 dark:border-mono-140">
                <Typography
                  variant="body2"
                  className="text-mono-100 dark:text-mono-100"
                >
                  Total Pending
                </Typography>
                <Typography
                  variant="body1"
                  fw="bold"
                  className="text-mono-200 dark:text-mono-0"
                >
                  {formattedTotal} TNT
                </Typography>
              </div>

              <div className="max-h-[280px] overflow-y-auto -mx-1 px-1">
                <PendingRewardsList vaults={rewardsData?.vaults ?? []} />
              </div>

              <Button
                isFullWidth
                onClick={handleClaimAll}
                isDisabled={isClaiming || !claimRewards}
                isLoading={isClaiming}
                className="mt-2"
              >
                {isClaiming
                  ? `Claiming${claimingAsset ? '...' : ''}`
                  : 'Claim All Rewards'}
              </Button>
            </>
          )}
        </div>
      </DropdownBody>
    </Dropdown>
  );
};

const ClaimRewardsDropdown: FC = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return <ClaimRewardsDropdownContent />;
};

export default ClaimRewardsDropdown;
