import { type FC, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  Skeleton,
} from '@tangle-network/sandbox-ui/primitives';
import {
  useBinaryVersions,
  useServiceUpgradeState,
  UpgradePolicy,
} from '@tangle-network/tangle-shared-ui/data/blueprints/useBinaryVersions';
import {
  useAckBinaryVersionTx,
  useSetServiceUpgradePolicyTx,
} from '@tangle-network/tangle-shared-ui/data/blueprints/useBinaryUpgradeTx';
import { useIsServiceOperator } from '@tangle-network/tangle-shared-ui/data/services';
import {
  computeTrustScore,
  type AttestationWithAuditor,
} from '@tangle-network/tangle-shared-ui/blueprintApps/trustScore';
import {
  useManagerLocalAuthz,
  MANAGER_URL_STORAGE_KEY,
  type AvailableVersion,
} from '@tangle-network/tangle-shared-ui/data/blueprints/useManagerLocalAuthz';
import TrustScoreGauge from './TrustScoreGauge';
import { useChainId, usePublicClient } from 'wagmi';
import { useQueries } from '@tanstack/react-query';
import {
  fetchAttestations,
  fetchAuditorOnChain,
} from '@tangle-network/tangle-shared-ui/data/blueprints/useBinaryVersions';
import { auditorFallbackRegistry } from '../../auditors';
import type { Address } from 'viem';

/**
 * Service-side upgrade control. Shown on the service detail page for any
 * service whose blueprint has at least one published binary version.
 *
 * - Reads `effectiveBinaryVersion` (what the service is on right now) and
 *   `getActiveBinaryVersionId` (what the blueprint owner has promoted).
 * - Compares the two — if the active version is newer + non-deprecated +
 *   not yet acked, an upgrade is available.
 * - Provides a policy radio (APPROVE / AUTO / MANUAL / MANUAL+assist) with
 *   explainer copy. The first three submit `setServiceUpgradePolicy` on
 *   change. MANUAL+assist is an off-chain hint that pins the on-chain
 *   policy to MANUAL while letting the operator's local blueprint-manager
 *   swap binaries based on locally-administered pin/whitelist/skip lists.
 * - "Approve & install" submits `ackBinaryVersion`. Disabled if the
 *   connected wallet isn't an active operator of the service.
 *
 * The two side-by-side trust scores are computed from the attestation
 * lists of the current effective version and the target available version
 * — so the operator can see "do I trust this upgrade more than what I'm
 * running today?" at a glance.
 */

type UiPolicy = UpgradePolicy | 'MANUAL_ASSIST';

const POLICY_OPTIONS: Array<{
  value: UiPolicy;
  label: string;
  helper: string;
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
  {
    value: 'MANUAL_ASSIST',
    label: 'Manual + assist',
    helper:
      'On-chain policy stays MANUAL. Your local blueprint-manager swaps versions you pin or whitelist via the dapp. No tx needed.',
  },
];

const MANUAL_ASSIST_LOCAL_KEY = 'tangle-cloud:manual-assist-services';

const readManualAssistSet = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(MANUAL_ASSIST_LOCAL_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === 'string'));
  } catch {
    return new Set();
  }
};

const writeManualAssistSet = (set: Set<string>): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      MANUAL_ASSIST_LOCAL_KEY,
      JSON.stringify(Array.from(set)),
    );
  } catch {
    // privacy modes — ignore
  }
};

const useAttestationsForVersion = (
  blueprintId: bigint | undefined,
  versionId: bigint | undefined,
): AttestationWithAuditor[] => {
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });
  const fallback = useMemo(() => auditorFallbackRegistry(), []);

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
            return [];
          return fetchAttestations(
            publicClient,
            chainId,
            blueprintId,
            versionId,
          );
        },
        enabled:
          blueprintId !== undefined &&
          versionId !== undefined &&
          publicClient !== undefined,
        staleTime: 30_000,
      },
    ],
  });

  const attestations = useMemo(
    () => attestationsQuery?.data ?? [],
    [attestationsQuery?.data],
  );
  const uniqueAttesters = useMemo(
    () =>
      Array.from(
        new Set(attestations.map((a) => a.attester.toLowerCase())),
      ) as Address[],
    [attestations],
  );
  const auditorQueries = useQueries({
    queries: uniqueAttesters.map((address) => ({
      queryKey: ['tangle', 'auditor', chainId, address],
      queryFn: async () => {
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
        return onChain;
      },
      enabled: publicClient !== undefined,
      staleTime: 300_000,
    })),
  });

  return attestations.map((row) => ({
    ...row,
    auditor:
      auditorQueries[
        uniqueAttesters.indexOf(row.attester.toLowerCase() as Address)
      ]?.data ?? null,
  }));
};

interface ServiceUpgradePanelProps {
  serviceId: bigint;
  blueprintId: bigint;
}

export const ServiceUpgradePanel: FC<ServiceUpgradePanelProps> = ({
  serviceId,
  blueprintId,
}) => {
  const { address } = useAccount();
  const { data: isOperator } = useIsServiceOperator(serviceId, address);
  const { data: state, isLoading: isLoadingState } = useServiceUpgradeState(
    serviceId,
    blueprintId,
  );
  const { data: versions, isLoading: isLoadingVersions } =
    useBinaryVersions(blueprintId);

  const manager = useManagerLocalAuthz(serviceId);

  // MANUAL+assist is "MANUAL on chain + flagged locally". Track the local
  // flag in localStorage keyed by serviceId. Whenever the on-chain policy
  // moves off MANUAL we drop the flag — the two can't be inconsistent.
  const [manualAssistFlag, setManualAssistFlag] = useState(() => {
    if (typeof window === 'undefined') return false;
    return readManualAssistSet().has(serviceId.toString());
  });

  const isLoading = isLoadingState || isLoadingVersions;

  const effectiveVersion = state?.effectiveVersion ?? null;
  const latestActiveVersionId = state?.latestActiveVersionId ?? null;
  const availableVersion = useMemo(() => {
    if (!versions) return null;
    if (latestActiveVersionId === null) return null;
    if (effectiveVersion === null) return null;
    if (latestActiveVersionId <= effectiveVersion.versionId) return null;
    const target = versions.find((v) => v.versionId === latestActiveVersionId);
    if (!target || target.deprecated) return null;
    return target;
  }, [versions, latestActiveVersionId, effectiveVersion]);

  const currentAttestations = useAttestationsForVersion(
    blueprintId,
    effectiveVersion?.versionId,
  );
  const targetAttestations = useAttestationsForVersion(
    blueprintId,
    availableVersion?.versionId,
  );
  const currentBreakdown = useMemo(
    () => computeTrustScore(currentAttestations),
    [currentAttestations],
  );
  const targetBreakdown = useMemo(
    () => computeTrustScore(targetAttestations),
    [targetAttestations],
  );

  const { execute: setPolicy, isPending: settingPolicy } =
    useSetServiceUpgradePolicyTx({
      onSuccess: () => {
        // Clearing the manual-assist flag on a non-MANUAL transition keeps
        // the on-chain and off-chain views consistent.
        if (manualAssistFlag) {
          const set = readManualAssistSet();
          set.delete(serviceId.toString());
          writeManualAssistSet(set);
          setManualAssistFlag(false);
        }
      },
    });
  const { execute: ack, isPending: acking } = useAckBinaryVersionTx();

  const handleSelectPolicy = (target: UiPolicy) => {
    if (!isOperator) return;

    if (target === 'MANUAL_ASSIST') {
      // First move on-chain policy to MANUAL if it isn't already; then flip
      // the local flag. If chain policy is already MANUAL, skip the tx.
      const flipLocal = () => {
        const set = readManualAssistSet();
        set.add(serviceId.toString());
        writeManualAssistSet(set);
        setManualAssistFlag(true);
      };
      if (state?.policy === UpgradePolicy.MANUAL) {
        flipLocal();
      } else if (setPolicy) {
        // Setting MANUAL on chain; the success handler clears flag, then we
        // re-flip it explicitly via the local cb chain.
        void (async () => {
          await setPolicy({ serviceId, policy: UpgradePolicy.MANUAL });
          flipLocal();
        })();
      }
      return;
    }

    // Plain on-chain transition. If the flag was on, the onSuccess in the
    // hook config clears it.
    if (!setPolicy) return;
    if (state?.policy === target && !manualAssistFlag) return;
    void setPolicy({ serviceId, policy: target });
  };

  const selectedUiPolicy: UiPolicy = manualAssistFlag
    ? 'MANUAL_ASSIST'
    : (state?.policy ?? UpgradePolicy.APPROVE);

  if (isLoading) {
    return (
      <Card variant="elevated">
        <CardContent className="p-5 md:p-6">
          <Skeleton className="h-40 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  if (!state || effectiveVersion === null) {
    return (
      <Card variant="elevated">
        <CardContent className="p-5 md:p-6">
          <h2 className="font-display font-extrabold text-mono-200 dark:text-mono-0 text-xl">
            Upgrade control
          </h2>
          <p className="mt-2 text-mono-100 dark:text-mono-80 text-sm">
            This service&apos;s blueprint has no published binary versions yet.
            The upgrade flow will activate once the blueprint owner publishes a
            build.
          </p>
        </CardContent>
      </Card>
    );
  }

  const upgradeAvailable = availableVersion !== null;

  return (
    <Card variant="elevated">
      <CardContent className="p-5 md:p-6 space-y-5">
        <header>
          <Badge variant={upgradeAvailable ? 'success' : 'outline'} dot>
            {upgradeAvailable
              ? `Upgrade available: v${availableVersion.versionId.toString()}`
              : 'Up to date'}
          </Badge>
          <h2 className="mt-2 font-display font-extrabold text-2xl text-mono-200 dark:text-mono-0 tracking-tight">
            Upgrade control
          </h2>
          <p className="mt-1 max-w-2xl text-mono-100 dark:text-mono-80 text-sm">
            Compare the binary this service is running against the
            blueprint&apos;s current active version, then choose how upgrades
            roll out.
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
            <div className="flex items-center justify-center rounded-lg border border-mono-60 dark:border-mono-170 border-dashed bg-mono-0 dark:bg-mono-180 p-6 text-center">
              <p className="text-mono-100 dark:text-mono-80 text-sm">
                No newer version is available. The service is on the latest
                non-deprecated build.
              </p>
            </div>
          )}
        </div>

        <fieldset className="space-y-2">
          <legend className="font-semibold text-[10px] text-mono-100 dark:text-mono-80 uppercase tracking-wider">
            Upgrade policy
          </legend>
          {POLICY_OPTIONS.map((option) => {
            const isAssist = option.value === 'MANUAL_ASSIST';
            const disabledForAssist = isAssist && !manager.available;
            return (
              <PolicyOption
                key={String(option.value)}
                option={option}
                selected={selectedUiPolicy === option.value}
                disabled={
                  !isOperator ||
                  settingPolicy ||
                  setPolicy === null ||
                  disabledForAssist
                }
                disabledReason={
                  disabledForAssist
                    ? 'Connect a blueprint-manager URL in Settings → Manager to enable this.'
                    : undefined
                }
                onSelect={() => handleSelectPolicy(option.value)}
              />
            );
          })}
          {!isOperator && (
            <p className="text-mono-100 dark:text-mono-80 text-xs">
              Connect a wallet that is an active operator of this service to
              change the upgrade policy.
            </p>
          )}
          {!manager.available && (
            <ManagerUrlPrompt onSaved={() => window.location.reload()} />
          )}
        </fieldset>

        {selectedUiPolicy === 'MANUAL_ASSIST' && manager.available && (
          <ManagerAssistSection
            serviceId={serviceId}
            running={effectiveVersion.versionId}
            available={manager.versions ?? []}
            pinned={manager.authz?.pinned ?? null}
            whitelisted={manager.authz?.whitelisted ?? []}
            skipped={manager.authz?.skipped ?? []}
            isMutating={manager.isMutating}
            error={manager.error}
            onPin={(v) => void manager.pin(v)}
            onWhitelistReplace={(ids) => void manager.whitelist(ids)}
            onSkip={(v) => void manager.skip(v)}
          />
        )}

        {upgradeAvailable && selectedUiPolicy !== 'MANUAL_ASSIST' && (
          <div className="flex items-center justify-between rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180 p-4">
            <div>
              <p className="font-display font-bold text-mono-200 dark:text-mono-0 text-sm">
                Approve & install v{availableVersion.versionId.toString()}
              </p>
              <p className="text-mono-100 dark:text-mono-80 text-xs">
                Submits `ackBinaryVersion` against this service. Required under
                APPROVE policy; informational under AUTO.
              </p>
            </div>
            <Button
              variant="sandbox"
              disabled={!isOperator || acking || ack === null}
              loading={acking}
              onClick={() => {
                if (!ack) return;
                void ack({
                  serviceId,
                  versionId: availableVersion.versionId,
                });
              }}
            >
              Approve & install
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ManagerUrlPrompt: FC<{ onSaved: () => void }> = ({ onSaved }) => {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  return (
    <div className="rounded-lg border border-mono-60 dark:border-mono-170 border-dashed bg-mono-0 dark:bg-mono-180 p-3">
      {!open ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-mono-100 dark:text-mono-80 text-xs">
            MANUAL+assist requires a connected blueprint-manager URL. Set it
            once and the local pin/whitelist/skip controls light up.
          </p>
          <Button variant="ghost" onClick={() => setOpen(true)}>
            Set manager URL
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            placeholder="http://localhost:8787"
            value={url}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setUrl(e.currentTarget.value)
            }
            className="font-mono"
          />
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="sandbox"
              disabled={url.trim().length === 0}
              onClick={() => {
                try {
                  window.localStorage.setItem(
                    MANAGER_URL_STORAGE_KEY,
                    url.trim(),
                  );
                  onSaved();
                } catch {
                  // privacy mode — surface to the user instead of silently failing
                  window.alert(
                    'Could not save manager URL — localStorage is unavailable.',
                  );
                }
              }}
            >
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const ManagerAssistSection: FC<{
  serviceId: bigint;
  running: bigint;
  available: AvailableVersion[];
  pinned: bigint | null;
  whitelisted: bigint[];
  skipped: bigint[];
  isMutating: boolean;
  error: Error | null;
  onPin: (versionId: bigint) => void;
  onWhitelistReplace: (versionIds: bigint[]) => void;
  onSkip: (versionId: bigint) => void;
}> = ({
  running,
  available,
  pinned,
  whitelisted,
  skipped,
  isMutating,
  error,
  onPin,
  onWhitelistReplace,
  onSkip,
}) => {
  const whitelistedSet = useMemo(
    () => new Set(whitelisted.map((v) => v.toString())),
    [whitelisted],
  );
  const skippedSet = useMemo(
    () => new Set(skipped.map((v) => v.toString())),
    [skipped],
  );

  return (
    <div className="space-y-3 rounded-lg border border-purple-40/30 bg-purple-40/5 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-display font-bold text-mono-200 dark:text-mono-0 text-sm">
            Local manager authz
          </p>
          <p className="text-mono-100 dark:text-mono-80 text-xs">
            On-chain policy stays MANUAL. Your manager swaps binaries based on
            the lists below.
          </p>
        </div>
        <Badge variant="outline">running v{running.toString()}</Badge>
      </div>

      {error && (
        <p className="text-red-500 dark:text-red-400 text-xs">
          Manager RPC error: {error.message}
        </p>
      )}

      <div className="space-y-2">
        <p className="font-semibold text-[10px] text-mono-100 dark:text-mono-80 uppercase tracking-wider">
          Available newer versions ({available.length})
        </p>
        {available.length === 0 ? (
          <p className="text-mono-100 dark:text-mono-80 text-xs">
            No newer versions are available right now.
          </p>
        ) : (
          <ul className="space-y-2">
            {available.map((v) => {
              const idStr = v.versionId.toString();
              const isPinned = pinned !== null && pinned === v.versionId;
              const isWhitelisted = whitelistedSet.has(idStr);
              const isSkipped = skippedSet.has(idStr);
              return (
                <li
                  key={idStr}
                  className="flex items-center justify-between gap-3 rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-mono-200 dark:text-mono-0 text-sm">
                        v{idStr}
                      </span>
                      <span className="text-mono-100 dark:text-mono-80 text-xs">
                        {v.attestationCount} attestation
                        {v.attestationCount === 1 ? '' : 's'} · trust{' '}
                        {v.trustScore}
                      </span>
                      {isPinned && <Badge variant="success">pinned</Badge>}
                      {isWhitelisted && !isPinned && (
                        <Badge variant="outline">whitelisted</Badge>
                      )}
                      {isSkipped && (
                        <Badge variant="destructive">skipped</Badge>
                      )}
                    </div>
                    <p className="break-all font-mono text-mono-100 dark:text-mono-80 text-xs">
                      {v.binaryUri}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant={isPinned ? 'outline' : 'sandbox'}
                      disabled={isMutating}
                      onClick={() => onPin(v.versionId)}
                    >
                      {isPinned ? 'Pinned' : 'Pin'}
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={isMutating}
                      onClick={() => {
                        const next = new Set(whitelistedSet);
                        if (isWhitelisted) next.delete(idStr);
                        else next.add(idStr);
                        onWhitelistReplace(
                          Array.from(next).map((s) => BigInt(s)),
                        );
                      }}
                    >
                      {isWhitelisted ? 'Un-whitelist' : 'Whitelist'}
                    </Button>
                    <Button
                      variant="ghost"
                      disabled={isMutating || isSkipped}
                      onClick={() => onSkip(v.versionId)}
                    >
                      {isSkipped ? 'Skipped' : 'Skip'}
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

const VersionCard: FC<{
  label: string;
  version: string;
  sha256: `0x${string}`;
  publishedAt: bigint;
  highlight?: boolean;
  children: React.ReactNode;
}> = ({ label, version, sha256, publishedAt, highlight, children }) => (
  <div
    className={
      highlight
        ? 'rounded-lg border border-success/40 bg-mono-0 dark:bg-mono-180 p-4'
        : 'rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180 p-4'
    }
  >
    <div className="flex items-baseline justify-between">
      <Badge variant={highlight ? 'success' : 'outline'}>{label}</Badge>
      <span className="font-display font-extrabold text-mono-200 dark:text-mono-0 text-2xl">
        {version}
      </span>
    </div>
    <p className="mt-2 truncate font-mono text-mono-100 dark:text-mono-80 text-xs">
      sha256 {sha256.slice(0, 14)}…{sha256.slice(-8)}
    </p>
    <p className="mt-1 text-mono-100 dark:text-mono-80 text-xs">
      published {new Date(Number(publishedAt) * 1000).toLocaleString()}
    </p>
    <div className="mt-3">{children}</div>
  </div>
);

const PolicyOption: FC<{
  option: { value: UiPolicy; label: string; helper: string };
  selected: boolean;
  disabled: boolean;
  disabledReason?: string;
  onSelect: () => void;
}> = ({ option, selected, disabled, disabledReason, onSelect }) => (
  <label
    title={disabled ? disabledReason : undefined}
    className={
      selected
        ? 'flex cursor-pointer items-start gap-3 rounded-lg border border-purple-40/50 bg-purple-40/5 p-3'
        : disabled
          ? 'flex cursor-not-allowed items-start gap-3 rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180 p-3 opacity-60'
          : 'flex cursor-pointer items-start gap-3 rounded-lg border border-mono-60 dark:border-mono-170 bg-mono-0 dark:bg-mono-180 p-3 hover:border-purple-40/30'
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
      <span className="font-display font-bold text-mono-200 dark:text-mono-0 text-sm">
        {option.label}
      </span>
      <span className="mt-0.5 block text-mono-100 dark:text-mono-80 text-xs">
        {option.helper}
      </span>
    </span>
  </label>
);

export default ServiceUpgradePanel;
