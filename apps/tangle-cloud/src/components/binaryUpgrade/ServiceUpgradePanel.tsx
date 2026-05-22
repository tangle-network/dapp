import { type FC, useMemo, useState } from 'react'
import { useAccount } from 'wagmi'
import {
  Badge,
  Button,
  Card,
  CardContent,
  Skeleton,
} from '@tangle-network/sandbox-ui/primitives'
import {
  useBinaryVersions,
  useServiceUpgradeState,
  UpgradePolicy,
} from '@tangle-network/tangle-shared-ui/data/blueprints/useBinaryVersions'
import {
  useAckBinaryVersionTx,
  useSetServiceUpgradePolicyTx,
} from '@tangle-network/tangle-shared-ui/data/blueprints/useBinaryUpgradeTx'
import { useIsServiceOperator } from '@tangle-network/tangle-shared-ui/data/services'
import {
  computeTrustScore,
  type AttestationWithAuditor,
} from '@tangle-network/tangle-shared-ui/blueprintApps/trustScore'
import TrustScoreGauge from './TrustScoreGauge'
import { useChainId, usePublicClient } from 'wagmi'
import { useQueries } from '@tanstack/react-query'
import {
  fetchAttestations,
  fetchAuditorOnChain,
} from '@tangle-network/tangle-shared-ui/data/blueprints/useBinaryVersions'
import { auditorFallbackRegistry } from '../../auditors'
import type { Address } from 'viem'

/**
 * Service-side upgrade control. Shown on the service detail page for any
 * service whose blueprint has at least one published binary version.
 *
 * - Reads `effectiveBinaryVersion` (what the service is on right now) and
 *   `getActiveBinaryVersionId` (what the blueprint owner has promoted).
 * - Compares the two — if the active version is newer + non-deprecated +
 *   not yet acked, an upgrade is available.
 * - Provides a policy radio (APPROVE / AUTO / MANUAL) with explainer copy.
 *   Anything other than current policy submits a `setServiceUpgradePolicy`.
 * - "Approve & install" submits `ackBinaryVersion`. Disabled if the
 *   connected wallet isn't an active operator of the service.
 *
 * The two side-by-side trust scores are computed from the attestation
 * lists of the current effective version and the target available version
 * — so the operator can see "do I trust this upgrade more than what I'm
 * running today?" at a glance.
 */

const POLICY_OPTIONS: Array<{
  value: UpgradePolicy
  label: string
  helper: string
}> = [
  {
    value: UpgradePolicy.APPROVE,
    label: 'Approve',
    helper:
      'The operator explicitly acknowledges each new version. Service stays on the last acked version until they sign.',
  },
  {
    value: UpgradePolicy.AUTO,
    label: 'Auto',
    helper:
      'The service tracks whatever the blueprint owner has set as active. Upgrades roll out without operator action.',
  },
  {
    value: UpgradePolicy.MANUAL,
    label: 'Manual',
    helper:
      'The service is pinned to the genesis version. New publishes do not take effect until the policy changes.',
  },
]

const useAttestationsForVersion = (
  blueprintId: bigint | undefined,
  versionId: bigint | undefined,
): AttestationWithAuditor[] => {
  const chainId = useChainId()
  const publicClient = usePublicClient({ chainId })
  const fallback = useMemo(() => auditorFallbackRegistry(), [])

  const [attestationsQuery] = useQueries({
    queries: [
      {
        queryKey: [
          'tangle',
          'attestations',
          chainId,
          blueprintId?.toString() ?? null,
          versionId?.toString() ?? null,
        ],
        queryFn: async () => {
          if (
            !publicClient ||
            blueprintId === undefined ||
            versionId === undefined
          )
            return []
          return fetchAttestations(publicClient, chainId, blueprintId, versionId)
        },
        enabled:
          blueprintId !== undefined &&
          versionId !== undefined &&
          publicClient !== undefined,
        staleTime: 30_000,
      },
    ],
  })

  const attestations = attestationsQuery?.data ?? []
  const uniqueAttesters = useMemo(
    () =>
      Array.from(
        new Set(attestations.map((a) => a.attester.toLowerCase())),
      ) as Address[],
    [attestations],
  )
  const auditorQueries = useQueries({
    queries: uniqueAttesters.map((address) => ({
      queryKey: ['tangle', 'auditor', chainId, address],
      queryFn: async () => {
        if (!publicClient) return null
        const onChain = await fetchAuditorOnChain(publicClient, chainId, address)
        if (onChain !== null && onChain.active) return onChain
        const entry = fallback[address]
        if (entry) {
          return {
            name: entry.name,
            metadataUri: entry.metadataUri,
            weight: entry.weight,
            tier: entry.tier,
            active: entry.active,
            admittedAt: 0n,
          }
        }
        return onChain
      },
      enabled: publicClient !== undefined,
      staleTime: 300_000,
    })),
  })

  return attestations.map((row, idx) => ({
    ...row,
    auditor:
      auditorQueries[uniqueAttesters.indexOf(row.attester.toLowerCase() as Address)]
        ?.data ?? null,
  }))
}

interface ServiceUpgradePanelProps {
  serviceId: bigint
  blueprintId: bigint
}

export const ServiceUpgradePanel: FC<ServiceUpgradePanelProps> = ({
  serviceId,
  blueprintId,
}) => {
  const { address } = useAccount()
  const { data: isOperator } = useIsServiceOperator(serviceId, address)
  const { data: state, isLoading: isLoadingState } = useServiceUpgradeState(
    serviceId,
    blueprintId,
  )
  const { data: versions, isLoading: isLoadingVersions } = useBinaryVersions(
    blueprintId,
  )

  const isLoading = isLoadingState || isLoadingVersions

  const effectiveVersion = state?.effectiveVersion ?? null
  const latestActiveVersionId = state?.latestActiveVersionId ?? null
  const availableVersion = useMemo(() => {
    if (!versions) return null
    if (latestActiveVersionId === null) return null
    if (effectiveVersion === null) return null
    if (latestActiveVersionId <= effectiveVersion.versionId) return null
    const target = versions.find(
      (v) => v.versionId === latestActiveVersionId,
    )
    if (!target || target.deprecated) return null
    return target
  }, [versions, latestActiveVersionId, effectiveVersion])

  const currentAttestations = useAttestationsForVersion(
    blueprintId,
    effectiveVersion?.versionId,
  )
  const targetAttestations = useAttestationsForVersion(
    blueprintId,
    availableVersion?.versionId,
  )
  const currentBreakdown = useMemo(
    () => computeTrustScore(currentAttestations),
    [currentAttestations],
  )
  const targetBreakdown = useMemo(
    () => computeTrustScore(targetAttestations),
    [targetAttestations],
  )

  const { execute: setPolicy, isPending: settingPolicy } =
    useSetServiceUpgradePolicyTx()
  const { execute: ack, isPending: acking } = useAckBinaryVersionTx()

  if (isLoading) {
    return (
      <Card variant="elevated">
        <CardContent className="p-5 md:p-6">
          <Skeleton className="h-40 w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (!state || effectiveVersion === null) {
    return (
      <Card variant="elevated">
        <CardContent className="p-5 md:p-6">
          <h2 className="font-display font-extrabold text-foreground text-xl">
            Upgrade control
          </h2>
          <p className="mt-2 text-muted-foreground text-sm">
            This service&apos;s blueprint has no published binary versions
            yet. The upgrade flow will activate once the blueprint owner
            publishes a build.
          </p>
        </CardContent>
      </Card>
    )
  }

  const policy = state.policy
  const upgradeAvailable = availableVersion !== null

  return (
    <Card variant="elevated">
      <CardContent className="p-5 md:p-6 space-y-5">
        <header>
          <Badge variant={upgradeAvailable ? 'success' : 'outline'} dot>
            {upgradeAvailable
              ? `Upgrade available: v${availableVersion.versionId.toString()}`
              : 'Up to date'}
          </Badge>
          <h2 className="mt-2 font-display font-extrabold text-2xl text-foreground tracking-tight">
            Upgrade control
          </h2>
          <p className="mt-1 max-w-2xl text-muted-foreground text-sm">
            Compare the binary this service is running against the
            blueprint&apos;s current active version, then choose how
            upgrades roll out.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <VersionCard
            label="Current"
            version={`v${effectiveVersion.versionId.toString()}`}
            sha256={effectiveVersion.sha256Hash}
            publishedAt={effectiveVersion.publishedAt}
          >
            <TrustScoreGauge breakdown={currentBreakdown} />
          </VersionCard>

          {availableVersion ? (
            <VersionCard
              label="Available"
              version={`v${availableVersion.versionId.toString()}`}
              sha256={availableVersion.sha256Hash}
              publishedAt={availableVersion.publishedAt}
              highlight
            >
              <TrustScoreGauge breakdown={targetBreakdown} />
            </VersionCard>
          ) : (
            <div className="flex items-center justify-center rounded-lg border border-border border-dashed bg-card p-6 text-center">
              <p className="text-muted-foreground text-sm">
                No newer version is available. The service is on the
                latest non-deprecated build.
              </p>
            </div>
          )}
        </div>

        <fieldset className="space-y-2">
          <legend className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
            Upgrade policy
          </legend>
          {POLICY_OPTIONS.map((option) => (
            <PolicyOption
              key={option.value}
              option={option}
              selected={policy === option.value}
              disabled={
                !isOperator ||
                settingPolicy ||
                setPolicy === null
              }
              onSelect={() => {
                if (!setPolicy) return
                if (policy === option.value) return
                void setPolicy({
                  serviceId,
                  policy: option.value,
                })
              }}
            />
          ))}
          {!isOperator && (
            <p className="text-muted-foreground text-xs">
              Connect a wallet that is an active operator of this service
              to change the upgrade policy.
            </p>
          )}
        </fieldset>

        {upgradeAvailable && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
            <div>
              <p className="font-display font-bold text-foreground text-sm">
                Approve & install v
                {availableVersion.versionId.toString()}
              </p>
              <p className="text-muted-foreground text-xs">
                Submits `ackBinaryVersion` against this service. Required
                under APPROVE policy; informational under AUTO.
              </p>
            </div>
            <Button
              variant="sandbox"
              disabled={!isOperator || acking || ack === null}
              loading={acking}
              onClick={() => {
                if (!ack) return
                void ack({
                  serviceId,
                  versionId: availableVersion.versionId,
                })
              }}
            >
              Approve & install
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const VersionCard: FC<{
  label: string
  version: string
  sha256: `0x${string}`
  publishedAt: bigint
  highlight?: boolean
  children: React.ReactNode
}> = ({ label, version, sha256, publishedAt, highlight, children }) => (
  <div
    className={
      highlight
        ? 'rounded-lg border border-success/40 bg-card p-4'
        : 'rounded-lg border border-border bg-card p-4'
    }
  >
    <div className="flex items-baseline justify-between">
      <Badge variant={highlight ? 'success' : 'outline'}>{label}</Badge>
      <span className="font-display font-extrabold text-foreground text-2xl">
        {version}
      </span>
    </div>
    <p className="mt-2 truncate font-mono text-muted-foreground text-xs">
      sha256 {sha256.slice(0, 14)}…{sha256.slice(-8)}
    </p>
    <p className="mt-1 text-muted-foreground text-xs">
      published{' '}
      {new Date(Number(publishedAt) * 1000).toLocaleString()}
    </p>
    <div className="mt-3">{children}</div>
  </div>
)

const PolicyOption: FC<{
  option: { value: UpgradePolicy; label: string; helper: string }
  selected: boolean
  disabled: boolean
  onSelect: () => void
}> = ({ option, selected, disabled, onSelect }) => (
  <label
    className={
      selected
        ? 'flex cursor-pointer items-start gap-3 rounded-lg border border-primary/50 bg-primary/5 p-3'
        : 'flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary/30'
    }
  >
    <input
      type="radio"
      checked={selected}
      disabled={disabled}
      onChange={onSelect}
      className="mt-1"
    />
    <span>
      <span className="font-display font-bold text-foreground text-sm">
        {option.label}
      </span>
      <span className="mt-0.5 block text-muted-foreground text-xs">
        {option.helper}
      </span>
    </span>
  </label>
)

export default ServiceUpgradePanel
