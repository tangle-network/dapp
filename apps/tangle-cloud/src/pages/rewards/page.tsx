/**
 * Rewards page - view and claim pending rewards.
 */

import {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
} from 'react';
import { useAccount, useChainId } from 'wagmi';
import {
  Button,
  Card,
  CardContent,
  EmptyState,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tangle-network/sandbox-ui/primitives';
import {
  ExternalLinkLine,
  FileCopyLine,
  TokenIcon,
} from '@tangle-network/icons';
import {
  usePendingRewardsByToken,
  useRewardHistory,
  useClaimRewardsTx,
  type PendingRewardsByTokenEntry,
  type RewardClaimEntry,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { useTokenMetadata } from '@tangle-network/tangle-shared-ui/data/services';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';
import { getCachedTokenMetadata } from '@tangle-network/dapp-config/tokenMetadata';
import {
  getEnvioNetworkFromChainId,
  type EnvioNetwork,
} from '@tangle-network/tangle-shared-ui/utils/executeEnvioGraphQL';
import { Address, Hash, zeroAddress } from 'viem';
import pollWithBackoff from '../../utils/pollWithBackoff';
import {
  getActiveChainConfig,
  getTxExplorerUrl,
  isNonLocalEvmChain,
} from '../../utils/explorer';
import { resolveTokenIconSymbol } from '../../utils/tokenPresentation';
import RequireWallet from '../../components/RequireWallet';

const shortenHex = (value: string, chars = 6) =>
  value.length > chars * 2 + 3
    ? `${value.slice(0, chars)}...${value.slice(-chars)}`
    : value;

const formatDisplayAmount = (value: bigint, decimals: number) => {
  const raw = value.toString();
  const padded = raw.padStart(decimals + 1, '0');
  const whole = padded.slice(0, -decimals);
  const fraction = padded.slice(-decimals).replace(/0+$/, '').slice(0, 4);
  return `${Number(whole).toLocaleString()}${fraction ? `.${fraction}` : ''}`;
};

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Failed to load rewards data';
};

const inferNetworkFromEndpoint = (
  endpoint: string | undefined,
): EnvioNetwork | null => {
  if (!endpoint) {
    return null;
  }

  const normalized = endpoint.toLowerCase();
  if (
    normalized.includes('localhost') ||
    normalized.includes('127.0.0.1') ||
    normalized.includes('local')
  ) {
    return 'local';
  }
  if (
    normalized.includes('testnet') ||
    normalized.includes('sepolia') ||
    normalized.includes('staging')
  ) {
    return 'testnet';
  }
  if (
    normalized.includes('mainnet') ||
    normalized.includes('prod') ||
    normalized.includes('production')
  ) {
    return 'mainnet';
  }

  return null;
};

type ActiveClaimAction =
  | { type: 'token'; token: Address }
  | { type: 'selected' }
  | { type: 'all' }
  | null;

const RewardsPage: FC = () => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const activeChain = getActiveChainConfig(chainId);
  const resolvedNetwork = getEnvioNetworkFromChainId(chainId);
  const configuredEndpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT as
    | string
    | undefined;
  const endpointNetwork = inferNetworkFromEndpoint(configuredEndpoint);
  const hasLikelyEndpointMismatch =
    !!configuredEndpoint &&
    endpointNetwork !== null &&
    endpointNetwork !== resolvedNetwork;
  const txExplorerUrl = getTxExplorerUrl(chainId);

  const {
    data: pendingRewards,
    isLoading: isLoadingPending,
    error: pendingRewardsError,
    refetch: refetchPendingRewards,
  } = usePendingRewardsByToken();

  const {
    data: rewardHistory,
    isLoading: isLoadingHistory,
    error: rewardHistoryError,
    refetch: refetchRewardHistory,
  } = useRewardHistory({ network: resolvedNetwork });

  const {
    claimToken,
    claimBatch,
    claimAllTokens,
    status: claimStatus,
    error: claimError,
  } = useClaimRewardsTx();

  const [selectedTokenSet, setSelectedTokenSet] = useState<Set<string>>(
    new Set(),
  );
  const [successfulClaimHash, setSuccessfulClaimHash] = useState<Hash | null>(
    null,
  );
  const [activeClaimAction, setActiveClaimAction] =
    useState<ActiveClaimAction>(null);

  const isClaiming = claimStatus === 'pending';
  const activeClaimToken =
    isClaiming && activeClaimAction?.type === 'token'
      ? activeClaimAction.token
      : null;
  const isBulkClaiming =
    isClaiming &&
    (activeClaimAction?.type === 'selected' ||
      activeClaimAction?.type === 'all');
  const isClaimSuccess = claimStatus === 'success';
  const pendingRows = useMemo(
    () => pendingRewards?.rewards ?? [],
    [pendingRewards],
  );

  const selectedTokens = useMemo(
    () =>
      pendingRows.filter((row) =>
        selectedTokenSet.has(row.token.toLowerCase()),
      ),
    [pendingRows, selectedTokenSet],
  );
  useEffect(() => {
    if (pendingRows.length === 0) {
      setSelectedTokenSet(new Set());
      return;
    }

    setSelectedTokenSet((current) => {
      const activeTokens = new Set(
        pendingRows.map((row) => row.token.toLowerCase()),
      );
      const next = new Set(
        [...current].filter((token) => activeTokens.has(token)),
      );

      if (next.size === current.size) {
        return current;
      }

      return next;
    });
  }, [pendingRows]);

  const toggleTokenSelection = useCallback(
    (token: Address) => (event: ChangeEvent<HTMLInputElement>) => {
      const key = token.toLowerCase();
      setSelectedTokenSet((current) => {
        const next = new Set(current);
        if (event.target.checked) {
          next.add(key);
        } else {
          next.delete(key);
        }
        return next;
      });
    },
    [],
  );

  const executeClaimAction = useCallback(
    async (
      activeAction: Exclude<ActiveClaimAction, null>,
      claimFn: () => Promise<Hash | null>,
    ) => {
      setSuccessfulClaimHash(null);
      setActiveClaimAction(activeAction);

      try {
        const hash = await claimFn();
        if (hash) {
          setSuccessfulClaimHash(hash);
        }
      } finally {
        setActiveClaimAction(null);
      }
    },
    [],
  );

  const handleClaimToken = useCallback(
    async (token: Address) => {
      await executeClaimAction({ type: 'token', token }, () =>
        claimToken(token),
      );
    },
    [claimToken, executeClaimAction],
  );

  const handleClaimSelected = useCallback(async () => {
    const tokens = selectedTokens.map((row) => row.token);
    await executeClaimAction({ type: 'selected' }, () => claimBatch(tokens));
  }, [claimBatch, executeClaimAction, selectedTokens]);

  const handleClaimAll = useCallback(async () => {
    await executeClaimAction({ type: 'all' }, claimAllTokens);
  }, [claimAllTokens, executeClaimAction]);

  useEffect(() => {
    if (!isClaimSuccess || !successfulClaimHash) {
      return;
    }

    let isCancelled = false;
    const targetTxHash = successfulClaimHash.toLowerCase();

    const syncClaimData = async () => {
      await refetchPendingRewards();

      await pollWithBackoff(
        async () => {
          if (isCancelled) {
            return true;
          }

          const claimHistoryResult = await refetchRewardHistory();
          return (claimHistoryResult.data ?? []).some(
            (entry) => entry.txHash.toLowerCase() === targetTxHash,
          );
        },
        {
          initialDelay: 1500,
          maxDelay: 6000,
          maxTotalTime: 45000,
        },
      );

      if (!isCancelled) {
        await Promise.all([refetchPendingRewards(), refetchRewardHistory()]);
      }
    };

    void syncClaimData();

    return () => {
      isCancelled = true;
    };
  }, [
    isClaimSuccess,
    successfulClaimHash,
    refetchPendingRewards,
    refetchRewardHistory,
  ]);

  if (!isConnected) {
    return (
      <div className="space-y-6">
        <RewardsHero />

        <RequireWallet
          eyebrow="Rewards"
          title="Connect to load rewards"
          description="Load pending balances, claimable assets, and claim history for the connected account."
          checks={['Pending rewards', 'Claimable assets', 'Claim history']}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RewardsHero />

      {configuredEndpoint && (
        <Card
          variant="sandbox"
          className="border-[var(--surface-warning-border)]"
        >
          <CardContent className="p-4">
            <p className="font-semibold text-[var(--surface-warning-text)] text-sm">
              Using a static GraphQL endpoint from `VITE_GRAPHQL_ENDPOINT`.
            </p>
            <p className="mt-1 text-muted-foreground text-sm">
              Active chain: {activeChain?.name ?? `Chain ${chainId}`} ({chainId}
              ) . Expected indexer network: {resolvedNetwork}. Endpoint:{' '}
              {configuredEndpoint}
            </p>
            {hasLikelyEndpointMismatch && (
              <p className="mt-2 text-destructive text-sm">
                Endpoint appears to target `{endpointNetwork}` while wallet
                chain expects `{resolvedNetwork}`. Rewards/claims data may be
                stale or from a different chain.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pending rewards by token */}
      <Card variant="sandbox">
        <CardContent className="p-6">
          <h2 className="mb-4 font-display font-bold text-foreground text-lg">
            Pending Rewards by Asset
          </h2>

          {isLoadingPending ? (
            <div className="space-y-2">
              <Skeleton className="h-16 rounded-md" />
              <Skeleton className="h-16 rounded-md" />
            </div>
          ) : pendingRewardsError ? (
            <ErrorMessage>Could not load pending rewards.</ErrorMessage>
          ) : pendingRewards?.rewards.length ? (
            <>
              <PendingRewardsTable
                rows={pendingRewards.rewards}
                selectedTokenSet={selectedTokenSet}
                onToggleToken={toggleTokenSelection}
                onClaimToken={handleClaimToken}
                isClaiming={isClaiming}
                activeClaimToken={activeClaimToken}
                addressExplorerUrl={txExplorerUrl}
              />

              <div className="mt-4 flex items-center justify-end gap-3">
                <Button
                  onClick={
                    selectedTokens.length > 0
                      ? handleClaimSelected
                      : handleClaimAll
                  }
                  variant={selectedTokens.length > 0 ? 'outline' : 'sandbox'}
                  loading={isBulkClaiming}
                  disabled={isClaiming || !pendingRewards.hasRewards}
                >
                  {selectedTokens.length > 0
                    ? `Claim Selected Assets (${selectedTokens.length})`
                    : 'Claim All Assets'}
                </Button>
              </div>

              {claimError && (
                <div className="mt-4">
                  <ErrorMessage>{getErrorMessage(claimError)}</ErrorMessage>
                </div>
              )}
            </>
          ) : (
            <EmptyState
              title="No pending rewards"
              description="Pending balances appear here when there are claimable rewards."
            />
          )}
        </CardContent>
      </Card>

      {/* Claim history */}
      <Card variant="sandbox">
        <CardContent className="p-6">
          <h2 className="mb-4 font-display font-bold text-foreground text-lg">
            Claim History
          </h2>

          {isLoadingHistory ? (
            <div className="space-y-2">
              <Skeleton className="h-16 rounded-md" />
              <Skeleton className="h-16 rounded-md" />
              <Skeleton className="h-16 rounded-md" />
            </div>
          ) : rewardHistoryError ? (
            // Render an empty-state instead of a red error when the
            // indexer is simply absent (e.g. `testnet` env with no
            // VITE_ENVIO_TESTNET_ENDPOINT configured). The original
            // `<ErrorMessage>` here surfaced an alarming
            // "Could not load claim history" banner on every page
            // load — that's the UX equivalent of a 500, but the
            // actual cause is "no historical data source", which is
            // a legitimate empty state.
            <EmptyState
              title="Claim history unavailable on this network"
              description="The indexed history endpoint is not configured for this network. Past reward claims will appear here once the indexer is online."
            />
          ) : rewardHistory?.length ? (
            <RewardClaimsTable
              entries={rewardHistory}
              txExplorerUrl={txExplorerUrl}
              showExplorerActions={!!txExplorerUrl}
            />
          ) : (
            <EmptyState
              title="No claim history yet"
              description="Past reward claims will appear here once they are indexed."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface PendingRewardsTableProps {
  rows: PendingRewardsByTokenEntry[];
  selectedTokenSet: Set<string>;
  onToggleToken: (
    token: Address,
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  onClaimToken: (token: Address) => Promise<void>;
  isClaiming: boolean;
  activeClaimToken: Address | null;
  addressExplorerUrl?: string;
}

const PendingRewardsTable: FC<PendingRewardsTableProps> = ({
  rows,
  selectedTokenSet,
  onToggleToken,
  onClaimToken,
  isClaiming,
  activeClaimToken,
  addressExplorerUrl,
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Select</TableHead>
            <TableHead>Asset</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.token}>
              <TableCell>
                <input
                  type="checkbox"
                  id={`reward-token-${row.token}`}
                  checked={selectedTokenSet.has(row.token.toLowerCase())}
                  onChange={onToggleToken(row.token)}
                  disabled={isClaiming}
                  className="h-4 w-4 accent-[var(--brand-primary)]"
                />
              </TableCell>
              <TableCell>
                <PendingAssetCell
                  token={row.token}
                  addressExplorerUrl={addressExplorerUrl}
                />
              </TableCell>
              <TableCell>
                <PendingRewardAmountCell
                  token={row.token}
                  amount={row.pending}
                />
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    void onClaimToken(row.token);
                  }}
                  loading={
                    activeClaimToken?.toLowerCase() === row.token.toLowerCase()
                  }
                  disabled={isClaiming || row.pending === BigInt(0)}
                >
                  Claim Asset
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const RewardsHero = () => (
  <Card
    variant="sandbox"
    className="cloud-hero-card cloud-compact-header overflow-hidden"
  >
    <CardContent className="relative p-4 md:p-5">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_12%_8%,rgba(99,102,241,0.18),transparent_32%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.10),transparent_28%)]" />
      <div className="relative">
        <h1 className="font-display font-extrabold text-3xl text-foreground leading-[1.05] tracking-[-0.035em] sm:text-4xl">
          Rewards
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed">
          Pending balances come from contract state; claim history comes from
          indexed on-chain events.
        </p>
      </div>
    </CardContent>
  </Card>
);

const PendingAssetCell: FC<{ token: Address; addressExplorerUrl?: string }> = ({
  token,
  addressExplorerUrl,
}) => {
  const chainId = useChainId();
  const activeChain = getActiveChainConfig(chainId);
  const cachedMetadata = getCachedTokenMetadata(chainId, token);
  const { data: tokenMetadata, isLoading } = useTokenMetadata(token);
  const symbol =
    tokenMetadata?.symbol ??
    cachedMetadata?.symbol ??
    (token === zeroAddress
      ? (activeChain?.nativeCurrency?.symbol ?? 'NATIVE')
      : 'TOKEN');
  const tokenName =
    token === zeroAddress
      ? (activeChain?.nativeCurrency?.name ?? null)
      : cachedMetadata &&
          cachedMetadata.symbol.toLowerCase() === symbol.toLowerCase()
        ? cachedMetadata.name
        : null;
  const iconSymbol = resolveTokenIconSymbol(chainId, symbol, token);
  const explorerAddressUrl = addressExplorerUrl
    ? `${addressExplorerUrl}/address/${token}`
    : null;
  const showExplorerAction =
    isNonLocalEvmChain(chainId) && !!explorerAddressUrl;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-9 h-9">
        {iconSymbol ? (
          <TokenIcon name={iconSymbol} size="xl" />
        ) : (
          <span className="grid h-9 w-9 place-items-center rounded-md border border-border bg-muted font-mono text-foreground text-xs">
            {token.slice(2, 4).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="whitespace-nowrap font-semibold text-foreground text-sm">
            {isLoading ? 'Loading...' : symbol}
          </span>
          {tokenName && (
            <span className="truncate text-muted-foreground text-xs">
              {tokenName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-muted-foreground text-xs">
            {shortenHex(token)}
          </span>
          <CopyIconButton value={token} label="Copy asset address" />
          {showExplorerAction && (
            <a
              href={explorerAddressUrl ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground transition-colors hover:text-primary"
              aria-label="View asset address on block explorer"
            >
              <ExternalLinkLine className="h-4 w-4 fill-current" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

const PendingRewardAmountCell: FC<{ token: Address; amount: bigint }> = ({
  token,
  amount,
}) => {
  const chainId = useChainId();
  const activeChain = getActiveChainConfig(chainId);
  const cachedMetadata = getCachedTokenMetadata(chainId, token);
  const { data: tokenMetadata } = useTokenMetadata(token);
  const decimals =
    tokenMetadata?.decimals ??
    cachedMetadata?.decimals ??
    (token === zeroAddress
      ? (activeChain?.nativeCurrency?.decimals ?? 18)
      : 18);

  return (
    <span className="font-semibold text-foreground text-sm">
      {formatDisplayAmount(amount, decimals)}
    </span>
  );
};

const RewardAmountCell: FC<{ token: Address; amount: bigint }> = ({
  token,
  amount,
}) => {
  const chainId = useChainId();
  const activeChain = getActiveChainConfig(chainId);
  const cachedMetadata = getCachedTokenMetadata(chainId, token);
  const { data: tokenMetadata } = useTokenMetadata(token);
  const decimals =
    tokenMetadata?.decimals ??
    cachedMetadata?.decimals ??
    (token === zeroAddress
      ? (activeChain?.nativeCurrency?.decimals ?? 18)
      : 18);

  return (
    <span className="font-semibold text-foreground text-sm">
      {formatDisplayAmount(amount, decimals)}
    </span>
  );
};

interface RewardClaimsTableProps {
  entries: RewardClaimEntry[];
  txExplorerUrl?: string;
  showExplorerActions: boolean;
}

const RewardClaimsTable: FC<RewardClaimsTableProps> = ({
  entries,
  txExplorerUrl,
  showExplorerActions,
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Tx Hash</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell>
                <PendingAssetCell
                  token={entry.token}
                  addressExplorerUrl={txExplorerUrl}
                />
              </TableCell>
              <TableCell>
                <RewardAmountCell token={entry.token} amount={entry.amount} />
              </TableCell>
              <TableCell>
                {new Date(Number(entry.claimedAt) * 1000).toLocaleString()}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-mono text-xs">
                    {shortenHex(entry.txHash, 6)}
                  </span>
                  <CopyIconButton value={entry.txHash} label="Copy tx hash" />
                  {showExplorerActions && txExplorerUrl && (
                    <a
                      href={`${txExplorerUrl}/tx/${entry.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground transition-colors hover:text-primary"
                      aria-label="View transaction on block explorer"
                    >
                      <ExternalLinkLine className="h-4 w-4 fill-current" />
                    </a>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default RewardsPage;

const CopyIconButton: FC<{ value: string; label: string }> = ({
  value,
  label,
}) => (
  <button
    type="button"
    aria-label={label}
    className="inline-flex text-muted-foreground transition-colors hover:text-primary"
    onClick={() => void navigator.clipboard?.writeText(value)}
  >
    <FileCopyLine className="h-4 w-4 fill-current" />
  </button>
);
