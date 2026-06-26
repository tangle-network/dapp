/**
 * Read-only summary of the protocol-level slashing parameters returned by
 * `getSlashConfig`. Shipped with tnt-core v0.13.0 — exposes the fields that
 * govern dispute lifecycle (disputeBond, disputeResolutionDeadline) and the
 * caps that gate proposal flow (maxSlashBps, maxPendingSlashesPerOperator).
 *
 * Operators and slash proposers both benefit from seeing these up front so
 * they don't waste a simulation on a guaranteed revert.
 */

import { Card } from '@tangle-network/sandbox-ui/primitives';
import { formatUnits } from 'viem';
import { Text } from '../../../../components/Text';

const SECONDS_PER_HOUR = 60 * 60;
const SECONDS_PER_DAY = SECONDS_PER_HOUR * 24;

const formatDuration = (seconds: bigint): string => {
  const total = Number(seconds);
  if (!Number.isFinite(total) || total <= 0) {
    return '—';
  }

  if (total >= SECONDS_PER_DAY) {
    const days = total / SECONDS_PER_DAY;
    const rounded = Math.round(days * 10) / 10;
    return `${rounded.toLocaleString(undefined, {
      maximumFractionDigits: 1,
    })} day${rounded === 1 ? '' : 's'}`;
  }

  if (total >= SECONDS_PER_HOUR) {
    const hours = total / SECONDS_PER_HOUR;
    const rounded = Math.round(hours * 10) / 10;
    return `${rounded.toLocaleString(undefined, {
      maximumFractionDigits: 1,
    })} hour${rounded === 1 ? '' : 's'}`;
  }

  return `${total.toLocaleString()} second${total === 1 ? '' : 's'}`;
};

// Trim trailing zeros so we don't show "0.000000000000000000 ETH".
const formatEthAmount = (wei: bigint): string => {
  const formatted = formatUnits(wei, 18);
  if (!formatted.includes('.')) return formatted;
  return formatted.replace(/\.?0+$/, '');
};

const formatBps = (bps: number): string => {
  const percent = bps / 100;
  return `${bps.toLocaleString()} bps (${percent.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}%)`;
};

export interface SlashingParametersCardProps {
  /**
   * Active SlashConfig from `getSlashConfig`. Undefined while the read is in
   * flight; rendered as a skeleton in that case.
   */
  config:
    | {
        disputeWindow: bigint;
        instantSlashEnabled: boolean;
        maxSlashBps: number;
        disputeResolutionDeadline: bigint;
        disputeBond: bigint;
        maxPendingSlashesPerOperator: number;
      }
    | undefined;
  isLoading: boolean;
}

const SlashingParametersCard = ({
  config,
  isLoading,
}: SlashingParametersCardProps) => {
  if (isLoading || !config) {
    return (
      <Card className="p-4">
        <Text variant="body3" className="text-mono-100 dark:text-mono-60">
          Loading slashing parameters...
        </Text>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-3">
      <div>
        <Text variant="body2" fw="bold">
          Slashing parameters
        </Text>
        <Text variant="body3" className="text-mono-100 dark:text-mono-60">
          Protocol-wide settings from the active SlashConfig. Proposals,
          disputes, and execution all enforce these.
        </Text>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
        <div>
          <Text variant="body3" className="text-mono-100 dark:text-mono-60">
            Maximum slash per proposal
          </Text>
          <Text variant="body2" fw="semibold">
            {formatBps(config.maxSlashBps)}
          </Text>
        </div>
        <div>
          <Text variant="body3" className="text-mono-100 dark:text-mono-60">
            Dispute window
          </Text>
          <Text variant="body2" fw="semibold">
            {formatDuration(config.disputeWindow)}
          </Text>
        </div>
        <div>
          <Text variant="body3" className="text-mono-100 dark:text-mono-60">
            Dispute resolution deadline
          </Text>
          <Text variant="body2" fw="semibold">
            {formatDuration(config.disputeResolutionDeadline)}
          </Text>
        </div>
        <div>
          <Text variant="body3" className="text-mono-100 dark:text-mono-60">
            Required dispute bond
          </Text>
          <Text variant="body2" fw="semibold">
            {config.disputeBond > BigInt(0)
              ? `${formatEthAmount(config.disputeBond)} ETH`
              : 'None'}
          </Text>
        </div>
        <div>
          <Text variant="body3" className="text-mono-100 dark:text-mono-60">
            Max pending slashes per operator
          </Text>
          <Text variant="body2" fw="semibold">
            {config.maxPendingSlashesPerOperator > 0
              ? config.maxPendingSlashesPerOperator.toLocaleString()
              : 'Unlimited'}
          </Text>
        </div>
        <div>
          <Text variant="body3" className="text-mono-100 dark:text-mono-60">
            Instant slash
          </Text>
          <Text variant="body2" fw="semibold">
            {config.instantSlashEnabled ? 'Enabled' : 'Disabled'}
          </Text>
        </div>
      </div>
    </Card>
  );
};

export default SlashingParametersCard;
