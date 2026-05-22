import type { FC } from 'react';
import { Badge } from '@tangle-network/sandbox-ui/primitives';
import { useServiceUpgradeState } from '@tangle-network/tangle-shared-ui/data/blueprints/useBinaryVersions';
import { useManagerLocalAuthz } from '@tangle-network/tangle-shared-ui/data/blueprints/useManagerLocalAuthz';

/**
 * Compact "Up to date" / "Upgrade available: vN" chip.
 *
 * Reads the same `useServiceUpgradeState` query as the full
 * `<ServiceUpgradePanel>` — the queries are shared via react-query, so
 * the chip and the panel always agree on what version is current.
 *
 * If a local blueprint-manager is configured and reports authz state for
 * this service, the chip grows a second line with the local pin/whitelist
 * summary — e.g. "MANUAL+assist · 1 pinned · 2 whitelisted". This is the
 * only place outside the upgrade panel that surfaces the assist subtitle.
 *
 * Renders nothing when:
 *   - the service has no effective version yet (blueprint hasn't published a build), or
 *   - there's no active blueprint version (genesis only).
 */

interface ServiceUpgradeBadgeProps {
  serviceId: bigint;
  blueprintId: bigint;
  className?: string;
}

export const ServiceUpgradeBadge: FC<ServiceUpgradeBadgeProps> = ({
  serviceId,
  blueprintId,
  className,
}) => {
  const { data: state, isLoading } = useServiceUpgradeState(
    serviceId,
    blueprintId,
  );
  const manager = useManagerLocalAuthz(serviceId);

  if (isLoading || !state || state.effectiveVersion === null) return null;
  if (state.latestActiveVersionId === null) return null;

  const effective = state.effectiveVersion.versionId;
  const latest = state.latestActiveVersionId;

  const subtitle =
    manager.available && manager.authz
      ? formatAssistSubtitle(
          manager.authz.pinned,
          manager.authz.whitelisted.length,
          manager.authz.skipped.length,
        )
      : null;

  const primary =
    latest <= effective ? (
      <Badge variant="outline" dot className={className}>
        Up to date · v{effective.toString()}
      </Badge>
    ) : (
      <Badge variant="success" dot className={className}>
        Upgrade available: v{latest.toString()}
      </Badge>
    );

  if (!subtitle) return primary;

  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      {primary}
      <span className="font-mono text-[10px] text-muted-foreground">
        {subtitle}
      </span>
    </span>
  );
};

const formatAssistSubtitle = (
  pinned: bigint | null,
  whitelistedCount: number,
  skippedCount: number,
): string | null => {
  const parts: string[] = [];
  if (pinned !== null) parts.push(`v${pinned.toString()} pinned`);
  if (whitelistedCount > 0) parts.push(`${whitelistedCount} whitelisted`);
  if (skippedCount > 0) parts.push(`${skippedCount} skipped`);
  if (parts.length === 0) return null;
  return `MANUAL+assist · ${parts.join(' · ')}`;
};

export default ServiceUpgradeBadge;
