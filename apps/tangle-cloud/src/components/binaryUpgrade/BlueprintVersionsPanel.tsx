import { type FC, useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Skeleton,
} from '@tangle-network/sandbox-ui/primitives';
import { useAccount } from 'wagmi';
import {
  useBinaryVersions,
  type BinaryVersion,
} from '@tangle-network/tangle-shared-ui/data/blueprints/useBinaryVersions';
import { useChainId, usePublicClient } from 'wagmi';
import { useQueries } from '@tanstack/react-query';
import {
  fetchAttestations,
  fetchAuditorOnChain,
} from '@tangle-network/tangle-shared-ui/data/blueprints/useBinaryVersions';
import {
  computeTrustScore,
  type Attestation,
  type AttestationWithAuditor,
  type Auditor,
} from '@tangle-network/tangle-shared-ui/blueprintApps/trustScore';
import { getContractsByChainId } from '@tangle-network/dapp-config/contracts';
import type { Address } from 'viem';
import TangleABI from '@tangle-network/tangle-shared-ui/abi/tangle';

import TrustScoreGauge from './TrustScoreGauge';
import AttestationBadge from './AttestationBadge';
import { auditorFallbackRegistry } from '../../auditors';
import {
  useSetActiveBinaryVersionTx,
  useDeprecateBinaryVersionTx,
  useRevokeAttestationTx,
} from '@tangle-network/tangle-shared-ui/data/blueprints/useBinaryUpgradeTx';
import { addressesEqual } from '@tangle-network/tangle-shared-ui/utils/safeParseAddress';
import { useQuery } from '@tanstack/react-query';
import BinaryUpgradeABI from '@tangle-network/tangle-shared-ui/abi/tangleBinaryUpgrade';
import { AttestForm } from './AttestForm';
import { PublishVersionDialog } from './PublishVersionDialog';

/**
 * Version-list timeline for a blueprint.
 *
 * Reads `getBinaryVersionCount` + `getActiveBinaryVersionId` and renders
 * a row per version sorted newest-first. Each row carries:
 *   - `vN` label + relative published time + truncated sha256
 *   - status pill: Active / Deprecated / Available / Genesis
 *   - compact trust-score chip (full gauge in the expanded view)
 *   - expandable section with the full binary URI, attestation list,
 *     and (for the blueprint owner) the "set active" / "deprecate"
 *     actions plus (for any wallet) the "Attest" form.
 */

const shortenHex = (hex: string, head = 6, tail = 4): string => {
  if (hex.length <= head + tail + 2) return hex;
  return `${hex.slice(0, head + 2)}…${hex.slice(-tail)}`;
};

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  const years = Math.floor(days / 365);
  return `${years}y`;
};

const formatRelativePast = (timestampSeconds: bigint, now: Date): string => {
  const ts = Number(timestampSeconds);
  const diff = Math.max(0, Math.floor(now.getTime() / 1000) - ts);
  return `${formatDuration(diff)} ago`;
};

const useBlueprintOwner = (blueprintId: bigint | undefined) => {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });
  return useQuery({
    queryKey: [
      'tangle',
      'blueprint-owner',
      chainId,
      blueprintId?.toString() ?? null,
    ],
    queryFn: async (): Promise<Address | null> => {
      if (!publicClient || blueprintId === undefined) return null;
      try {
        const contracts = getContractsByChainId(chainId);
        const tangle = contracts.tangle as Address;
        const result = (await publicClient.readContract({
          address: tangle,
          abi: TangleABI,
          functionName: 'getBlueprint',
          args: [blueprintId],
        })) as { owner: Address };
        return result.owner;
      } catch {
        return null;
      }
    },
    enabled: blueprintId !== undefined && publicClient !== undefined,
    staleTime: 60_000,
  });
};

const useActiveVersionId = (blueprintId: bigint | undefined) => {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });
  return useQuery({
    queryKey: [
      'tangle',
      'binary-active-version-id',
      chainId,
      blueprintId?.toString() ?? null,
    ],
    queryFn: async (): Promise<bigint> => {
      if (!publicClient || blueprintId === undefined) return 0n;
      const contracts = getContractsByChainId(chainId);
      const tangle = contracts.tangle as Address;
      const id = (await publicClient.readContract({
        address: tangle,
        abi: BinaryUpgradeABI,
        functionName: 'getActiveBinaryVersionId',
        args: [blueprintId],
      })) as bigint;
      return BigInt(id);
    },
    enabled: blueprintId !== undefined && publicClient !== undefined,
    staleTime: 30_000,
  });
};

/**
 * Aggregates attestation lists for every version on the blueprint, joining
 * each row's `attester` with its auditor identity. The result feeds the
 * trust-score chip on each version row plus the expanded attestation list.
 */
const useAttestationsByVersion = (
  blueprintId: bigint | undefined,
  versionIds: bigint[],
) => {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });

  const attestationQueries = useQueries({
    queries: versionIds.map((versionId) => ({
      queryKey: [
        'tangle',
        'attestations',
        chainId,
        blueprintId?.toString() ?? null,
        versionId.toString(),
      ],
      queryFn: async (): Promise<Attestation[]> => {
        if (!publicClient || blueprintId === undefined) return [];
        return fetchAttestations(publicClient, chainId, blueprintId, versionId);
      },
      enabled: blueprintId !== undefined && publicClient !== undefined,
      staleTime: 30_000,
    })),
  });

  const fallback = useMemo(() => auditorFallbackRegistry(), []);
  // Collect all unique attester addresses across all versions and resolve
  // each one once. A single auditor that attests across many versions only
  // pays one chain read.
  const uniqueAttesters = useMemo(() => {
    const set = new Set<string>();
    attestationQueries.forEach((q) => {
      (q.data ?? []).forEach((a) => set.add(a.attester.toLowerCase()));
    });
    return Array.from(set) as Address[];
  }, [attestationQueries]);

  const auditorQueries = useQueries({
    queries: uniqueAttesters.map((address) => ({
      queryKey: ['tangle', 'auditor', chainId, address],
      queryFn: async (): Promise<Auditor | null> => {
        if (!publicClient) return null;
        const onChain = await fetchAuditorOnChain(
          publicClient,
          chainId,
          address,
        );
        if (onChain !== null && onChain.active) return onChain;
        const entry = fallback[address];
        if (entry) {
          return {
            name: entry.name,
            metadataUri: entry.metadataUri,
            weight: entry.weight,
            tier: entry.tier,
            active: entry.active,
            admittedAt: 0n,
          };
        }
        if (onChain !== null) return onChain;
        return null;
      },
      enabled: publicClient !== undefined,
      staleTime: 300_000,
    })),
  });

  const auditorMap = new Map<string, Auditor | null>();
  uniqueAttesters.forEach((address, idx) => {
    auditorMap.set(address, auditorQueries[idx]?.data ?? null);
  });

  return versionIds.map((_versionId, idx) => {
    const rows = attestationQueries[idx]?.data ?? [];
    return rows.map(
      (row): AttestationWithAuditor => ({
        ...row,
        auditor: auditorMap.get(row.attester.toLowerCase()) ?? null,
      }),
    );
  });
};

interface BlueprintVersionsPanelProps {
  blueprintId: bigint;
  blueprintName?: string;
}

export const BlueprintVersionsPanel: FC<BlueprintVersionsPanelProps> = ({
  blueprintId,
  blueprintName,
}) => {
  const { address } = useAccount();
  const {
    data: versions,
    isLoading: isLoadingVersions,
    refetch: refetchVersions,
  } = useBinaryVersions(blueprintId);
  const { data: activeVersionId } = useActiveVersionId(blueprintId);
  const { data: ownerAddress } = useBlueprintOwner(blueprintId);
  const [publishOpen, setPublishOpen] = useState(false);

  const isOwner =
    address !== undefined &&
    ownerAddress !== null &&
    ownerAddress !== undefined &&
    addressesEqual(ownerAddress, address);

  // Newest first so a fresh publish lands at the top.
  const sortedVersions = useMemo(
    () =>
      (versions ?? [])
        .slice()
        .sort((a, b) => Number(b.versionId) - Number(a.versionId)),
    [versions],
  );

  const versionIds = sortedVersions.map((v) => v.versionId);
  const attestationsByIdx = useAttestationsByVersion(blueprintId, versionIds);

  return (
    <Card variant="elevated">
      <CardContent className="p-5 md:p-6">
        <header className="flex flex-col gap-3 border-mono-60 dark:border-mono-170 border-b pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Badge variant="outline">
              {sortedVersions.length} version
              {sortedVersions.length === 1 ? '' : 's'}
            </Badge>
            <h2 className="mt-2 font-display font-extrabold text-2xl text-mono-200 dark:text-mono-0 tracking-tight">
              Binary versions
            </h2>
            <p className="mt-1 max-w-2xl text-mono-100 dark:text-mono-60 text-sm">
              Append-only timeline of binary builds for this blueprint. Each
              version carries a sha256 digest, a binary URI, and any auditor
              attestations published against it.
            </p>
          </div>
          {isOwner && (
            <Button variant="sandbox" onClick={() => setPublishOpen(true)}>
              Publish new version
            </Button>
          )}
        </header>

        {isLoadingVersions ? (
          <div className="mt-5 space-y-3">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        ) : sortedVersions.length === 0 ? (
          <div className="mt-5 flex min-h-32 items-center justify-center rounded-lg border border-mono-60 dark:border-mono-170 border-dashed bg-mono-0 dark:bg-mono-180 p-6 text-center">
            <p className="max-w-md text-mono-100 dark:text-mono-60 text-sm">
              No binary versions have been published for this blueprint yet. The
              blueprint owner can publish the first build above.
            </p>
          </div>
        ) : (
          <ol className="mt-5 space-y-3">
            {sortedVersions.map((version, idx) => (
              <VersionRow
                key={version.versionId.toString()}
                version={version}
                attestations={attestationsByIdx[idx] ?? []}
                activeVersionId={activeVersionId ?? null}
                blueprintId={blueprintId}
                isOwner={isOwner}
                connectedAddress={address ? address.toLowerCase() : null}
                refetchVersions={refetchVersions}
              />
            ))}
          </ol>
        )}
      </CardContent>

      {publishOpen && isOwner && (
        <PublishVersionDialog
          blueprintId={blueprintId}
          blueprintName={blueprintName}
          onClose={() => {
            setPublishOpen(false);
            void refetchVersions();
          }}
        />
      )}
    </Card>
  );
};

interface VersionRowProps {
  version: BinaryVersion;
  attestations: AttestationWithAuditor[];
  activeVersionId: bigint | null;
  blueprintId: bigint;
  isOwner: boolean;
  connectedAddress: string | null;
  refetchVersions: () => void;
}

const statusLabel = (
  version: BinaryVersion,
  activeVersionId: bigint | null,
): { label: string; tone: 'success' | 'destructive' | 'outline' | 'info' } => {
  if (version.deprecated) return { label: 'Deprecated', tone: 'destructive' };
  if (activeVersionId !== null && version.versionId === activeVersionId) {
    return { label: 'Active', tone: 'success' };
  }
  if (version.versionId === 0n) return { label: 'Genesis', tone: 'info' };
  return { label: 'Available', tone: 'outline' };
};

const VersionRow: FC<VersionRowProps> = ({
  version,
  attestations,
  activeVersionId,
  blueprintId,
  isOwner,
  connectedAddress,
  refetchVersions,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [attesting, setAttesting] = useState(false);
  const breakdown = useMemo(
    () => computeTrustScore(attestations),
    [attestations],
  );
  const { label, tone } = statusLabel(version, activeVersionId);
  const { execute: setActive, isPending: settingActive } =
    useSetActiveBinaryVersionTx({ onSuccess: refetchVersions });
  const { execute: deprecate, isPending: deprecating } =
    useDeprecateBinaryVersionTx({ onSuccess: refetchVersions });
  const { execute: revokeAttestation, isPending: revoking } =
    useRevokeAttestationTx({ onSuccess: refetchVersions });

  const handleRevoke = async (att: Attestation) => {
    if (!revokeAttestation) return;
    const reasonUri =
      window.prompt(
        'Revocation reason URI (optional, e.g. ipfs://… or https://…):',
        '',
      ) ?? '';
    // Find the row by comparing attester + attestedAt + reportHash — that
    // triple uniquely identifies an on-chain attestation. We can't use
    // referential equality because the parent passes a joined object.
    const idx = attestations.findIndex(
      (row) =>
        row.attester === att.attester &&
        row.attestedAt === att.attestedAt &&
        row.reportHash === att.reportHash,
    );
    if (idx < 0) return;
    await revokeAttestation({
      blueprintId,
      versionId: version.versionId,
      attestationId: BigInt(idx),
      reasonUri,
    });
  };

  return (
    <li
      className={
        version.deprecated
          ? 'overflow-hidden rounded-lg border border-destructive/40 bg-mono-0 dark:bg-mono-180 opacity-90'
          : 'overflow-hidden rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180'
      }
    >
      <button
        type="button"
        className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 p-4 text-left transition-colors hover:bg-mono-20/50 dark:bg-mono-190/50"
        onClick={() => setExpanded((prev) => !prev)}
      >
        <div className="font-display font-extrabold text-mono-200 dark:text-mono-0 text-lg">
          v{version.versionId.toString()}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant={tone === 'info' ? 'outline' : tone} dot>
              {label}
            </Badge>
            <span className="text-mono-100 dark:text-mono-60 text-xs">
              published {formatRelativePast(version.publishedAt, new Date())}
            </span>
          </div>
          <p className="mt-1 truncate font-mono text-mono-100 dark:text-mono-60 text-xs">
            sha256 {shortenHex(version.sha256Hash, 6, 6)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TrustScoreGauge breakdown={breakdown} variant="compact" />
          <span className="text-mono-100 dark:text-mono-60 text-xs">
            {expanded ? '−' : '+'}
          </span>
        </div>
      </button>

      {expanded && (
        <div className="border-mono-60 dark:border-mono-170 border-t bg-mono-20 dark:bg-mono-190/10 p-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <div className="space-y-2">
              <KeyValue label="sha256" value={version.sha256Hash} />
              <KeyValue
                label="Binary URI"
                value={
                  version.binaryUri ? (
                    <a
                      href={resolveBinaryHref(version.binaryUri)}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-purple-40 underline-offset-2 hover:underline"
                    >
                      {version.binaryUri}
                    </a>
                  ) : (
                    '—'
                  )
                }
              />
              <KeyValue
                label="Attestation bundle hash"
                value={
                  version.attestationHash &&
                  version.attestationHash !==
                    '0x0000000000000000000000000000000000000000000000000000000000000000'
                    ? version.attestationHash
                    : '—'
                }
              />
              <KeyValue
                label="Published at"
                value={new Date(
                  Number(version.publishedAt) * 1000,
                ).toLocaleString()}
              />
            </div>
            <TrustScoreGauge breakdown={breakdown} />
          </div>

          {isOwner && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="sandbox"
                size="sm"
                disabled={
                  settingActive ||
                  setActive === null ||
                  (activeVersionId !== null &&
                    version.versionId === activeVersionId)
                }
                loading={settingActive}
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  if (!setActive) return;
                  void setActive({
                    blueprintId,
                    versionId: version.versionId,
                  });
                }}
              >
                Promote to active
              </Button>
              {!version.deprecated && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={deprecating || deprecate === null}
                  loading={deprecating}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    if (!deprecate) return;
                    void deprecate({
                      blueprintId,
                      versionId: version.versionId,
                    });
                  }}
                >
                  Deprecate
                </Button>
              )}
            </div>
          )}

          <div className="space-y-2">
            <header className="flex items-center justify-between">
              <h3 className="font-display font-bold text-base text-mono-200 dark:text-mono-0">
                Attestations ({attestations.length})
              </h3>
              {!attesting && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAttesting(true)}
                >
                  Attest v{version.versionId.toString()}
                </Button>
              )}
            </header>
            {attestations.length === 0 ? (
              <p className="rounded-lg border border-mono-60 dark:border-mono-170 border-dashed bg-mono-0 dark:bg-mono-180 p-3 text-mono-100 dark:text-mono-60 text-xs">
                No attestations have been submitted for this version yet. Any
                wallet may submit one — auditors registered in the on-chain
                auditor registry contribute weighted signal toward the trust
                score.
              </p>
            ) : (
              <div className="space-y-2">
                {attestations.map((row, attIdx) => (
                  <AttestationBadge
                    key={`${row.attester}-${attIdx}`}
                    attestation={row}
                    auditor={row.auditor}
                    connectedAddress={connectedAddress}
                    onRevoke={revoking ? undefined : handleRevoke}
                  />
                ))}
              </div>
            )}
            {attesting && (
              <AttestForm
                blueprintId={blueprintId}
                versionId={version.versionId}
                onClose={() => {
                  setAttesting(false);
                  refetchVersions();
                }}
              />
            )}
          </div>
        </div>
      )}
    </li>
  );
};

const KeyValue: FC<{ label: string; value: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="rounded-md border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180/60 p-2.5">
    <p className="font-semibold text-[10px] text-mono-100 dark:text-mono-60 uppercase tracking-wider">
      {label}
    </p>
    <p className="mt-1 break-all font-mono text-mono-200 dark:text-mono-0 text-xs">
      {value}
    </p>
  </div>
);

/**
 * Map `ipfs://` URIs to a gateway so the link is clickable from the dapp.
 * Any other scheme (https / http / ar) passes through unchanged.
 */
const resolveBinaryHref = (uri: string): string => {
  if (uri.startsWith('ipfs://')) {
    const path = uri.slice('ipfs://'.length);
    return `https://ipfs.io/ipfs/${path}`;
  }
  return uri;
};

export default BlueprintVersionsPanel;
