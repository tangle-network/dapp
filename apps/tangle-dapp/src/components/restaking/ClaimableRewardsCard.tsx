/**
 * Card displaying user's claimable rewards and staking activity.
 * Follows EigenLayer-style dashboard design.
 */

import { FC, useCallback, useMemo, useState } from 'react';
import { Cross1Icon } from '@radix-ui/react-icons';
import {
  Card,
  CardVariant,
  IconButton,
  Typography,
  Button,
  SkeletonLoader,
  EMPTY_VALUE_PLACEHOLDER,
  Tooltip,
  TooltipTrigger,
  TooltipBody,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionContent,
} from '@tangle-network/ui-components';
import { InformationLine } from '@tangle-network/icons';
import { twMerge } from 'tailwind-merge';
import useUserRestakingStats from '../../data/restaking/useUserRestakingStats';
import {
  usePendingRewards,
  useClaimRewardsTx,
  useExpectedRewards,
} from '../../data/rewards';
import { TxStatus } from '@tangle-network/tangle-shared-ui/hooks/useContractWrite';
import { ExpandTableButton } from '../../pages/restake/ExpandTableButton';
import { AnimatedTable } from '../../pages/restake/AnimatedTable';
import RestakeDetailCard from '../RestakeDetailCard';
import PendingRewardsList from './PendingRewardsList';

interface StatRowProps {
  label: string;
  value: string;
  symbol?: string;
  isLoading?: boolean;
  tooltip?: string;
}

const StatRow: FC<StatRowProps> = ({
  label,
  value,
  symbol = 'TNT',
  isLoading,
  tooltip,
}) => (
  <div className="flex items-center justify-between py-2">
    <div className="flex items-center gap-1">
      <Typography variant="body2" className="text-mono-100 dark:text-mono-100">
        {label}
      </Typography>

      {tooltip && (
        <Tooltip>
          <TooltipTrigger className="cursor-help">
            <InformationLine className="fill-mono-120 dark:fill-mono-100" />
          </TooltipTrigger>
          <TooltipBody className="max-w-[280px]">{tooltip}</TooltipBody>
        </Tooltip>
      )}
    </div>

    {isLoading ? (
      <SkeletonLoader className="h-5 w-20" />
    ) : (
      <Typography
        variant="body2"
        fw="medium"
        className="text-mono-200 dark:text-mono-0"
      >
        {value} {symbol}
      </Typography>
    )}
  </div>
);

const ClaimableRewardsCard: FC = () => {
  const { data: stats, isLoading, refetch } = useUserRestakingStats();
  const {
    data: pendingRewardsData,
    isLoading: isPendingRewardsLoading,
    refetch: refetchPendingRewards,
  } = usePendingRewards();
  const {
    data: expectedRewards,
    isLoading: isExpectedRewardsLoading,
    refetch: refetchExpectedRewards,
  } = useExpectedRewards();
  const { execute: claimRewards, status, reset } = useClaimRewardsTx();
  const [isClaiming, setIsClaiming] = useState(false);
  const [isRewardsListOpen, setIsRewardsListOpen] = useState(false);

  const hasRewards = stats && stats.pendingRewards > BigInt(0);
  const isClaimingTx = status === TxStatus.PROCESSING;

  const claimableVaults = useMemo(() => {
    if (!pendingRewardsData?.vaults || pendingRewardsData.vaults.length === 0) {
      return [];
    }
    return pendingRewardsData.vaults;
  }, [pendingRewardsData]);

  const handleClaimRewards = useCallback(async () => {
    if (!claimRewards || !hasRewards || claimableVaults.length === 0) {
      return;
    }

    setIsClaiming(true);
    try {
      for (const vault of claimableVaults) {
        const operators = vault.rewards.map((r) => r.operator);
        await claimRewards({
          asset: vault.asset,
          operators,
        });
      }
      setTimeout(() => {
        refetch();
        refetchPendingRewards();
        refetchExpectedRewards();
        reset();
      }, 2000);
    } finally {
      setIsClaiming(false);
    }
  }, [
    claimRewards,
    hasRewards,
    claimableVaults,
    refetch,
    refetchPendingRewards,
    refetchExpectedRewards,
    reset,
  ]);

  const apyDisplay = useMemo(() => {
    if (isExpectedRewardsLoading) {
      return null;
    }
    if (!expectedRewards) {
      return EMPTY_VALUE_PLACEHOLDER;
    }
    if (expectedRewards.hasNoStake) {
      return '--';
    }
    if (expectedRewards.isPoolDepleted) {
      return '0%';
    }
    return expectedRewards.formattedApyRange;
  }, [expectedRewards, isExpectedRewardsLoading]);

  const upcomingRewardsDisplay = useMemo(() => {
    if (isExpectedRewardsLoading) {
      return null;
    }
    if (!expectedRewards) {
      return EMPTY_VALUE_PLACEHOLDER;
    }
    if (expectedRewards.hasNoStake) {
      return '--';
    }
    if (expectedRewards.isPoolDepleted) {
      return '0';
    }
    return expectedRewards.formattedProjectedNextEpoch;
  }, [expectedRewards, isExpectedRewardsLoading]);

  return (
    <div className="grid items-start gap-4 max-md:grid-cols-1 md:auto-cols-auto md:grid-flow-col">
      <div className="w-full md:min-w-[512px]">
        <Card
          variant={CardVariant.GLASS}
          className={twMerge(
            'relative p-6 flex flex-col gap-4',
            'border border-mono-60 dark:border-mono-160',
          )}
        >
          {!isRewardsListOpen && claimableVaults.length > 0 && (
            <ExpandTableButton
              className="absolute top-3 -right-10 max-md:hidden"
              tooltipContent="View rewards by vault"
              requestCount={claimableVaults.length}
              onClick={() => setIsRewardsListOpen(true)}
            />
          )}

          <div className="flex items-start justify-between">
            <div>
              <Typography
                variant="body2"
                className="text-mono-100 dark:text-mono-100 mb-1"
              >
                Claimable Reward Value
              </Typography>

              {isLoading || isPendingRewardsLoading ? (
                <SkeletonLoader className="h-10 w-32" />
              ) : (
                <Typography
                  variant="h3"
                  fw="bold"
                  className={twMerge(
                    '!leading-tight',
                    hasRewards && 'text-green-50 dark:text-green-50',
                  )}
                >
                  {stats?.formatted.pendingRewards ?? EMPTY_VALUE_PLACEHOLDER}{' '}
                  TNT
                </Typography>
              )}
            </div>

            <div className="text-right">
              <Typography
                variant="body3"
                className="text-mono-100 dark:text-mono-100"
              >
                Est. APY
              </Typography>

              {isExpectedRewardsLoading ? (
                <SkeletonLoader className="h-5 w-20 ml-auto" />
              ) : (
                <Typography
                  variant="body2"
                  fw="medium"
                  className={twMerge(
                    'text-mono-120 dark:text-mono-80',
                    apyDisplay !== '--' &&
                      apyDisplay !== EMPTY_VALUE_PLACEHOLDER &&
                      apyDisplay !== '0%' &&
                      'text-green-50 dark:text-green-50',
                  )}
                >
                  {apyDisplay}
                </Typography>
              )}
            </div>
          </div>

          <div className="border-t border-mono-60 dark:border-mono-160 pt-3">
            <StatRow
              label="Active balance"
              value={stats?.formatted.activeBalance ?? '0'}
              isLoading={isLoading}
            />

            <StatRow
              label="Upcoming rewards"
              value={upcomingRewardsDisplay ?? ''}
              symbol={upcomingRewardsDisplay === '--' ? '' : 'TNT'}
              isLoading={isExpectedRewardsLoading}
              tooltip="Estimated TNT rewards you'll receive in the next epoch (1 hour). Based on your current share of the staking pool."
            />
          </div>

          <Button
            isFullWidth
            onClick={handleClaimRewards}
            isDisabled={
              isLoading ||
              isPendingRewardsLoading ||
              !hasRewards ||
              isClaimingTx ||
              !claimRewards ||
              claimableVaults.length === 0
            }
            isLoading={isClaiming || isClaimingTx}
            className="mt-2"
          >
            {isClaimingTx ? 'Claiming...' : 'Claim All Rewards'}
          </Button>
        </Card>

        <Card
          variant={CardVariant.GLASS}
          className="mt-4 p-0 border border-mono-60 dark:border-mono-160"
        >
          <Accordion type="single" collapsible>
            <AccordionItem value="apy-explanation" className="border-none">
              <AccordionButton className="px-4 py-1.5">
                How is APY calculated?
              </AccordionButton>
              <AccordionContent className="px-4 pb-3">
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-mono-200 dark:text-mono-0">
                      Formula:
                    </span>
                    <div className="mt-1 font-mono text-xs bg-mono-40 dark:bg-mono-170 rounded px-3 py-2">
                      APY = (Your Share × Annual Rewards) ÷ Your Stake
                    </div>
                  </div>

                  <div>
                    <span className="font-medium text-mono-200 dark:text-mono-0">
                      APY Range:
                    </span>
                    <ul className="mt-1 list-disc list-inside space-y-1 text-mono-120 dark:text-mono-100">
                      <li>Lower value: No lock bonus (1.0x)</li>
                      <li>Upper value: 6-month lock (1.6x boost)</li>
                    </ul>
                  </div>

                  <div>
                    <span className="font-medium text-mono-200 dark:text-mono-0">
                      Lock Multipliers:
                    </span>
                    <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-mono-120 dark:text-mono-100">
                      <span>No lock:</span>
                      <span>1.0x</span>
                      <span>1 month:</span>
                      <span>1.1x</span>
                      <span>3 months:</span>
                      <span>1.4x</span>
                      <span>6 months:</span>
                      <span>1.6x</span>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </Card>
      </div>

      <AnimatedTable
        isTableOpen={isRewardsListOpen}
        className="hidden md:block"
      >
        <RestakeDetailCard.Root className="!min-w-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <RestakeDetailCard.Header
              title={
                claimableVaults.length > 0
                  ? 'Rewards by Vault'
                  : 'No Pending Rewards'
              }
            />

            <IconButton onClick={() => setIsRewardsListOpen(false)}>
              <Cross1Icon />
            </IconButton>
          </div>

          {claimableVaults.length > 0 ? (
            <PendingRewardsList vaults={claimableVaults} />
          ) : (
            <Typography
              variant="body1"
              className="text-mono-120 dark:text-mono-100"
            >
              You don't have any pending rewards to claim.
            </Typography>
          )}
        </RestakeDetailCard.Root>
      </AnimatedTable>
    </div>
  );
};

export default ClaimableRewardsCard;
