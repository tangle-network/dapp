import type { FC } from 'react'
import { Badge } from '@tangle-network/sandbox-ui/primitives'
import { useServiceUpgradeState } from '@tangle-network/tangle-shared-ui/data/blueprints/useBinaryVersions'

/**
 * Compact "Up to date" / "Upgrade available: vN" chip.
 *
 * Reads the same `useServiceUpgradeState` query as the full
 * `<ServiceUpgradePanel>` — the queries are shared via react-query, so
 * the chip and the panel always agree on what version is current.
 *
 * Renders nothing when:
 *   - the service has no effective version yet (blueprint hasn't published a build), or
 *   - there's no active blueprint version (genesis only).
 */

interface ServiceUpgradeBadgeProps {
  serviceId: bigint
  blueprintId: bigint
  className?: string
}

export const ServiceUpgradeBadge: FC<ServiceUpgradeBadgeProps> = ({
  serviceId,
  blueprintId,
  className,
}) => {
  const { data: state, isLoading } = useServiceUpgradeState(
    serviceId,
    blueprintId,
  )

  if (isLoading || !state || state.effectiveVersion === null) return null
  if (state.latestActiveVersionId === null) return null

  const effective = state.effectiveVersion.versionId
  const latest = state.latestActiveVersionId
  if (latest <= effective) {
    return (
      <Badge variant="outline" dot className={className}>
        Up to date · v{effective.toString()}
      </Badge>
    )
  }

  return (
    <Badge variant="success" dot className={className}>
      Upgrade available: v{latest.toString()}
    </Badge>
  )
}

export default ServiceUpgradeBadge
