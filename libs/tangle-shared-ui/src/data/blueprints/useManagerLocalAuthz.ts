/**
 * Local blueprint-manager RPC client for the MANUAL+assist policy.
 *
 * The on-chain `UpgradePolicy.MANUAL` value means "the protocol never auto-swaps
 * binaries". Operators who want zero on-chain ack but still want their local
 * blueprint-manager to swap versions on their behalf can layer this off-chain
 * "manager authz" on top: the operator's manager exposes a tiny REST surface
 * that accepts pins, whitelists, and skip-lists, and the dapp drives it.
 *
 * No secrets are sent across the wire — the manager treats the request origin
 * as authoritative (it's bound to localhost / a private network the operator
 * controls). The dapp persists the manager URL in `localStorage` under the
 * key in `MANAGER_URL_STORAGE_KEY`, falling back to `VITE_MANAGER_URL`.
 *
 * RPC contract (parallel agent owns the manager-side impl):
 *   GET  {base}/upgrades/{serviceId}/available  -> AvailableVersion[]
 *   GET  {base}/upgrades/{serviceId}/authz      -> AuthzState
 *   POST {base}/upgrades/{serviceId}/pin        -> { versionId }
 *   POST {base}/upgrades/{serviceId}/whitelist  -> { versionIds: [] }
 *   POST {base}/upgrades/{serviceId}/skip       -> { versionId }
 *
 * All version IDs are sent as decimal strings (JSON has no bigint) and parsed
 * back via `BigInt(s)` here.
 */

import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const MANAGER_URL_STORAGE_KEY = 'tangle-cloud:manager-url';

const envManagerUrl = (): string | null => {
  // Vite injects VITE_* envs at build time. Guard for non-Vite consumers.
  try {
    const v = (import.meta as { env?: Record<string, string | undefined> }).env
      ?.VITE_MANAGER_URL;
    if (typeof v === 'string' && v.trim().length > 0) return v.trim();
  } catch {
    // ignore — non-Vite env (e.g. node test)
  }
  return null;
};

const readManagerUrl = (): string | null => {
  if (typeof window === 'undefined') return envManagerUrl();
  try {
    const stored = window.localStorage.getItem(MANAGER_URL_STORAGE_KEY);
    if (stored && stored.trim().length > 0) return stored.trim();
  } catch {
    // localStorage may throw in privacy modes — fall through to env
  }
  return envManagerUrl();
};

export interface AvailableVersion {
  versionId: bigint;
  sha256Hash: `0x${string}`;
  binaryUri: string;
  attestationCount: number;
  trustScore: number;
  publishedAt: bigint;
}

export interface ManagerAuthzState {
  policyOnChain: 'APPROVE' | 'AUTO' | 'MANUAL';
  running: bigint | null;
  pinned: bigint | null;
  whitelisted: bigint[];
  skipped: bigint[];
}

interface RawAvailableVersion {
  versionId: string | number;
  sha256Hash: `0x${string}`;
  binaryUri: string;
  attestationCount: number;
  trustScore: number;
  publishedAt: string | number;
}

interface RawAuthzState {
  policyOnChain: 'APPROVE' | 'AUTO' | 'MANUAL';
  running: string | number | null;
  pinned: string | number | null;
  whitelisted: Array<string | number>;
  skipped: Array<string | number>;
}

const toBigInt = (v: string | number): bigint => BigInt(v);
const toBigIntOrNull = (v: string | number | null): bigint | null =>
  v === null || v === undefined ? null : BigInt(v);

const normalizeAvailable = (r: RawAvailableVersion): AvailableVersion => ({
  versionId: toBigInt(r.versionId),
  sha256Hash: r.sha256Hash,
  binaryUri: r.binaryUri,
  attestationCount: r.attestationCount,
  trustScore: r.trustScore,
  publishedAt: toBigInt(r.publishedAt),
});

const normalizeAuthz = (r: RawAuthzState): ManagerAuthzState => ({
  policyOnChain: r.policyOnChain,
  running: toBigIntOrNull(r.running),
  pinned: toBigIntOrNull(r.pinned),
  whitelisted: r.whitelisted.map(toBigInt),
  skipped: r.skipped.map(toBigInt),
});

const buildBase = (managerUrl: string): string => {
  // Tolerate trailing slash and inadvertent path suffixes.
  const trimmed = managerUrl.replace(/\/+$/, '');
  return trimmed;
};

const json = async <T>(
  managerUrl: string,
  path: string,
  init?: RequestInit,
): Promise<T> => {
  const res = await fetch(`${buildBase(managerUrl)}${path}`, {
    headers: { 'content-type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(
      `manager RPC ${path} failed: ${res.status} ${res.statusText}${body ? ` — ${body}` : ''}`,
    );
  }
  return (await res.json()) as T;
};

interface UseManagerLocalAuthzResult {
  /** True when a manager URL is configured (env or localStorage). */
  available: boolean;
  /** Manager URL the hook is talking to, for surfacing in UI. */
  managerUrl: string | null;
  /** Versions newer than what the service is running, as reported by manager. */
  versions: AvailableVersion[] | undefined;
  /** Current local authz snapshot. */
  authz: ManagerAuthzState | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  /** Atomically pin a single version. Replaces any prior pin. */
  pin: (versionId: bigint) => Promise<void>;
  /** Replace the whitelist atomically. */
  whitelist: (versionIds: bigint[]) => Promise<void>;
  /** Append a version to the skip list. Idempotent. */
  skip: (versionId: bigint) => Promise<void>;
  /** Force a refetch of /available + /authz. */
  refetch: () => Promise<void>;
  isMutating: boolean;
}

export const useManagerLocalAuthz = (
  serviceId: bigint | undefined,
): UseManagerLocalAuthzResult => {
  const queryClient = useQueryClient();
  const managerUrl = useMemo(() => readManagerUrl(), []);
  const available = managerUrl !== null && serviceId !== undefined;

  const baseKey = useMemo(
    () => [
      'tangle',
      'manager-authz',
      managerUrl,
      serviceId?.toString() ?? null,
    ],
    [managerUrl, serviceId],
  );

  const versionsQuery = useQuery({
    queryKey: [...baseKey, 'available'],
    queryFn: async (): Promise<AvailableVersion[]> => {
      if (!managerUrl || serviceId === undefined) return [];
      const raw = await json<{ versions: RawAvailableVersion[] }>(
        managerUrl,
        `/upgrades/${serviceId.toString()}/available`,
      );
      return (raw.versions ?? []).map(normalizeAvailable);
    },
    enabled: available,
    staleTime: 15_000,
    retry: 1,
  });

  const authzQuery = useQuery({
    queryKey: [...baseKey, 'authz'],
    queryFn: async (): Promise<ManagerAuthzState | null> => {
      if (!managerUrl || serviceId === undefined) return null;
      const raw = await json<RawAuthzState>(
        managerUrl,
        `/upgrades/${serviceId.toString()}/authz`,
      );
      return normalizeAuthz(raw);
    },
    enabled: available,
    staleTime: 10_000,
    retry: 1,
  });

  const invalidate = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: [...baseKey, 'available'] }),
      queryClient.invalidateQueries({ queryKey: [...baseKey, 'authz'] }),
    ]);
  }, [queryClient, baseKey]);

  const pinMutation = useMutation({
    mutationFn: async (versionId: bigint) => {
      if (!managerUrl || serviceId === undefined) {
        throw new Error('Manager URL not configured');
      }
      await json<unknown>(managerUrl, `/upgrades/${serviceId.toString()}/pin`, {
        method: 'POST',
        body: JSON.stringify({ versionId: versionId.toString() }),
      });
    },
    onSettled: invalidate,
  });

  const whitelistMutation = useMutation({
    mutationFn: async (versionIds: bigint[]) => {
      if (!managerUrl || serviceId === undefined) {
        throw new Error('Manager URL not configured');
      }
      await json<unknown>(
        managerUrl,
        `/upgrades/${serviceId.toString()}/whitelist`,
        {
          method: 'POST',
          body: JSON.stringify({
            versionIds: versionIds.map((v) => v.toString()),
          }),
        },
      );
    },
    onSettled: invalidate,
  });

  const skipMutation = useMutation({
    mutationFn: async (versionId: bigint) => {
      if (!managerUrl || serviceId === undefined) {
        throw new Error('Manager URL not configured');
      }
      await json<unknown>(
        managerUrl,
        `/upgrades/${serviceId.toString()}/skip`,
        {
          method: 'POST',
          body: JSON.stringify({ versionId: versionId.toString() }),
        },
      );
    },
    onSettled: invalidate,
  });

  return {
    available,
    managerUrl,
    versions: versionsQuery.data,
    authz: authzQuery.data ?? undefined,
    isLoading: versionsQuery.isLoading || authzQuery.isLoading,
    isError: versionsQuery.isError || authzQuery.isError,
    error:
      (versionsQuery.error as Error | null) ??
      (authzQuery.error as Error | null) ??
      null,
    pin: useCallback(
      async (versionId: bigint) => {
        await pinMutation.mutateAsync(versionId);
      },
      [pinMutation],
    ),
    whitelist: useCallback(
      async (versionIds: bigint[]) => {
        await whitelistMutation.mutateAsync(versionIds);
      },
      [whitelistMutation],
    ),
    skip: useCallback(
      async (versionId: bigint) => {
        await skipMutation.mutateAsync(versionId);
      },
      [skipMutation],
    ),
    refetch: invalidate,
    isMutating:
      pinMutation.isPending ||
      whitelistMutation.isPending ||
      skipMutation.isPending,
  };
};

/**
 * Lightweight read-only check for places (e.g. compact badges) that just want
 * to know "is a local manager configured at all?". Skips network entirely.
 */
export const useManagerUrl = (): string | null => readManagerUrl();
