import { FC, useMemo } from 'react';
import {
  Card,
  CardVariant,
  Typography,
  CopyWithTooltip,
} from '@tangle-network/ui-components';
import type { Address } from 'viem';
import { usePodInfo, usePodOwnerInfo } from '../hooks';
import {
  gweiToEth,
  weiToEth,
  isSlashingFactorDegraded,
  getSlashingPercentage,
} from '../types';

interface PodOverviewCardProps {
  podAddress: Address;
  ownerAddress: Address;
}

const StatItem: FC<{
  label: string;
  value: string;
  subValue?: string;
  warning?: boolean;
}> = ({ label, value, subValue, warning }) => (
  <div className="flex flex-col">
    <Typography variant="body2" className="text-mono-120 dark:text-mono-80">
      {label}
    </Typography>
    <Typography
      variant="h5"
      fw="bold"
      className={warning ? 'text-yellow-600 dark:text-yellow-400' : ''}
    >
      {value}
    </Typography>
    {subValue && (
      <Typography variant="body3" className="text-mono-100 dark:text-mono-100">
        {subValue}
      </Typography>
    )}
  </div>
);

const PodOverviewCard: FC<PodOverviewCardProps> = ({
  podAddress,
  ownerAddress,
}) => {
  const { data: podInfo, isLoading: loadingPod } = usePodInfo(podAddress);
  const { data: ownerInfo, isLoading: loadingOwner } =
    usePodOwnerInfo(ownerAddress);

  const slashingStatus = useMemo(() => {
    if (!podInfo) return { isDegraded: false, percentage: 0 };
    const isDegraded = isSlashingFactorDegraded(
      podInfo.beaconChainSlashingFactor,
    );
    const percentage = getSlashingPercentage(podInfo.beaconChainSlashingFactor);
    return { isDegraded, percentage };
  }, [podInfo]);

  if (loadingPod || loadingOwner) {
    return (
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          Pod Overview
        </Typography>
        <Typography variant="body1" className="text-mono-120 dark:text-mono-80">
          Loading pod information...
        </Typography>
      </Card>
    );
  }

  if (!podInfo || !ownerInfo) {
    return (
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          Pod Overview
        </Typography>
        <Typography variant="body1" className="text-mono-120 dark:text-mono-80">
          Unable to load pod information.
        </Typography>
      </Card>
    );
  }

  return (
    <Card variant={CardVariant.GLASS} className="p-6">
      <div className="flex items-center justify-between mb-6">
        <Typography variant="h5" fw="bold">
          Pod Overview
        </Typography>
        <div className="flex items-center gap-2">
          <Typography variant="body3" className="text-mono-100">
            Pod Address:
          </Typography>
          <CopyWithTooltip textToCopy={podAddress} isButton={false}>
            <Typography variant="body3" className="font-mono">
              {podAddress.slice(0, 6)}...{podAddress.slice(-4)}
            </Typography>
          </CopyWithTooltip>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex gap-2 mb-6">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            podInfo.isStaked
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
          }`}
        >
          {podInfo.isStaked ? 'Staked' : 'Not Staked'}
        </span>
        {podInfo.checkpointActive && (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
            Checkpoint Active
          </span>
        )}
        {slashingStatus.isDegraded && (
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
            Slashing Detected
          </span>
        )}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatItem
          label="Total Staked"
          value={`${gweiToEth(podInfo.totalStakedBalanceGwei)} ETH`}
          subValue={`${podInfo.activeValidatorCount} active validator${podInfo.activeValidatorCount !== 1 ? 's' : ''}`}
        />

        <StatItem
          label="Your Shares"
          value={`${weiToEth(ownerInfo.shares)} ETH`}
          subValue={
            ownerInfo.shares < BigInt(0)
              ? '(Negative due to slashing)'
              : undefined
          }
          warning={ownerInfo.shares < BigInt(0)}
        />

        <StatItem
          label="Delegated"
          value={`${weiToEth(ownerInfo.totalDelegated)} ETH`}
          subValue={`${weiToEth(ownerInfo.availableToWithdraw)} ETH available`}
        />

        <StatItem
          label="Slashing Factor"
          value={
            slashingStatus.isDegraded
              ? `${(100 - slashingStatus.percentage).toFixed(2)}%`
              : '100%'
          }
          subValue={
            slashingStatus.isDegraded
              ? `${slashingStatus.percentage.toFixed(2)}% slashed`
              : 'No slashing'
          }
          warning={slashingStatus.isDegraded}
        />
      </div>

      {/* Withdrawal Credentials */}
      <div className="mt-6 p-4 bg-mono-20 dark:bg-mono-160 rounded-lg">
        <Typography variant="body2" fw="bold" className="mb-2">
          Withdrawal Credentials
        </Typography>
        <div className="flex items-center gap-2">
          <CopyWithTooltip
            textToCopy={podInfo.withdrawalCredentials}
            isButton={false}
          >
            <code className="text-xs font-mono break-all">
              {podInfo.withdrawalCredentials}
            </code>
          </CopyWithTooltip>
        </div>
        <Typography variant="body3" className="text-mono-100 mt-2">
          Point your validator withdrawal credentials to this value
        </Typography>
      </div>

      {/* Proof Submitter Info */}
      {podInfo.proofSubmitter && (
        <div className="mt-4 p-4 bg-mono-20 dark:bg-mono-160 rounded-lg">
          <Typography variant="body2" fw="bold" className="mb-2">
            Authorized Proof Submitter
          </Typography>
          <CopyWithTooltip textToCopy={podInfo.proofSubmitter} isButton={false}>
            <code className="text-xs font-mono">{podInfo.proofSubmitter}</code>
          </CopyWithTooltip>
        </div>
      )}

      {/* Last Checkpoint */}
      {podInfo.lastCompletedCheckpointTimestamp > BigInt(0) && (
        <div className="mt-4">
          <Typography variant="body3" className="text-mono-100">
            Last checkpoint:{' '}
            {new Date(
              Number(podInfo.lastCompletedCheckpointTimestamp) * 1000,
            ).toLocaleString()}
          </Typography>
        </div>
      )}
    </Card>
  );
};

export default PodOverviewCard;
