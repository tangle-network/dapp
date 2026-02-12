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
  CardVariant,
  CheckBox,
  Typography,
  SkeletonLoader,
  EMPTY_VALUE_PLACEHOLDER,
} from '@tangle-network/ui-components';
import {
  usePendingRewardsByToken,
  useRewardHistory,
  useClaimRewardsTx,
  formatRewardAmount,
  type PendingRewardsByTokenEntry,
  type RewardClaimEntry,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { useTokenMetadata } from '@tangle-network/tangle-shared-ui/data/services';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';
import { chainsConfig } from '@tangle-network/dapp-config/chains';
import {
  getEnvioEndpoint,
  getEnvioNetworkFromChainId,
  type EnvioNetwork,
} from '@tangle-network/tangle-shared-ui/utils/executeEnvioGraphQL';
import { Address, Hash, zeroAddress } from 'viem';

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : 'Failed to load rewards data';
};

const shortenAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

interface ClaimFeedback {
  modeLabel: string;
  details: string;
  txHash: Hash;
}

const RewardsPage: FC = () => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const activeChain = chainsConfig[chainId];
  const nativeSymbol = activeChain?.nativeCurrency?.symbol ?? 'ETH';
  const resolvedNetwork = getEnvioNetworkFromChainId(chainId);
  const configuredEndpoint = import.meta.env.VITE_GRAPHQL_ENDPOINT as
    | string
    | undefined;
  const indexerEndpoint = getEnvioEndpoint(resolvedNetwork);
  const endpointNetwork = inferNetworkFromEndpoint(
    configuredEndpoint ?? indexerEndpoint,
  );
  const hasLikelyEndpointMismatch =
    !!configuredEndpoint &&
    endpointNetwork !== null &&
    endpointNetwork !== resolvedNetwork;
  const txExplorerUrl = activeChain?.blockExplorers?.default?.url;

  const {
    data: pendingRewards,
    isLoading: isLoadingPending,
    error: pendingRewardsError,
  } = usePendingRewardsByToken();

  const {
    data: rewardHistory,
    isLoading: isLoadingHistory,
    error: rewardHistoryError,
  } = useRewardHistory({ network: resolvedNetwork });

  const {
    claimNative,
    claimToken,
    claimBatch,
    claimAllTokens,
    status: claimStatus,
    error: claimError,
    reset,
  } = useClaimRewardsTx();

  const [selectedTokenSet, setSelectedTokenSet] = useState<Set<string>>(
    new Set(),
  );
  const [claimFeedback, setClaimFeedback] = useState<ClaimFeedback | null>(
    null,
  );

  const isClaiming = claimStatus === 'pending';
  const isClaimSuccess = claimStatus === 'success';
  const pendingRows = useMemo(
    () => pendingRewards?.rewards ?? [],
    [pendingRewards],
  );

  const pendingByToken = useMemo(() => {
    return new Map(
      pendingRows.map((row) => [row.token.toLowerCase(), row.pending]),
    );
  }, [pendingRows]);

  const selectedTokens = useMemo(
    () => pendingRows.filter((row) => selectedTokenSet.has(row.token.toLowerCase())),
    [pendingRows, selectedTokenSet],
  );
  const selectedTotal = useMemo(
    () => selectedTokens.reduce((total, row) => total + row.pending, BigInt(0)),
    [selectedTokens],
  );
  const nativePending = pendingByToken.get(zeroAddress) ?? BigInt(0);

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
      modeLabel: string,
      details: string,
      claimFn: () => Promise<Hash | null>,
    ) => {
      setClaimFeedback(null);
      const hash = await claimFn();
      if (hash) {
        setClaimFeedback({
          modeLabel,
          details,
          txHash: hash,
        });
      }
    },
    [],
  );

  const handleClaimNative = useCallback(async () => {
    await executeClaimAction(
      'Claim Native',
      `Claimed ${formatRewardAmount(nativePending)} ${nativeSymbol}`,
      claimNative,
    );
  }, [claimNative, executeClaimAction, nativePending, nativeSymbol]);

  const handleClaimToken = useCallback(
    async (token: Address) => {
      const pending = pendingByToken.get(token.toLowerCase()) ?? BigInt(0);
      await executeClaimAction(
        'Claim Token',
        `Claimed ${formatRewardAmount(pending)} from ${shortenAddress(token)}`,
        () => claimToken(token),
      );
    },
    [claimToken, executeClaimAction, pendingByToken],
  );

  const handleClaimSelected = useCallback(async () => {
    const tokens = selectedTokens.map((row) => row.token);
    await executeClaimAction(
      'Claim Selected',
      `Claimed ${formatRewardAmount(selectedTotal)} across ${tokens.length} selected token(s)`,
      () => claimBatch(tokens),
    );
  }, [claimBatch, executeClaimAction, selectedTokens, selectedTotal]);

  const handleClaimAll = useCallback(async () => {
    const tokenCount = pendingRows.length;
    const totalPending = pendingRewards?.totalPending ?? BigInt(0);
    await executeClaimAction(
      'Claim All Tokens',
      `Claimed ${formatRewardAmount(totalPending)} across ${tokenCount} token(s)`,
      claimAllTokens,
    );
  }, [claimAllTokens, executeClaimAction, pendingRewards, pendingRows.length]);

  const handleResetClaimState = useCallback(() => {
    setClaimFeedback(null);
    reset();
  }, [reset]);

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Typography variant="h4">Connect Wallet</Typography>
        <Typography variant="body1" className="text-mono-100 mt-2">
          Please connect your wallet to view rewards.
        </Typography>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Typography variant="h4" fw="bold">
          Rewards
        </Typography>
        <Typography variant="body2" className="text-mono-100">
          Pending rewards come directly from contract state. History below shows
          on-chain claim events indexed by Envio.
        </Typography>
      </div>

      {configuredEndpoint && (
        <Card
          variant={CardVariant.GLASS}
          className="p-4 border border-yellow-500/30"
        >
          <Typography variant="body2" className="text-yellow-300">
            Using a static GraphQL endpoint from `VITE_GRAPHQL_ENDPOINT`.
          </Typography>
          <Typography variant="body2" className="text-mono-80 mt-1">
            Active chain: {activeChain?.name ?? `Chain ${chainId}`} ({chainId})
            . Expected indexer network: {resolvedNetwork}. Endpoint:{' '}
            {configuredEndpoint}
          </Typography>
          {hasLikelyEndpointMismatch && (
            <Typography variant="body2" className="text-red-400 mt-2">
              Endpoint appears to target `{endpointNetwork}` while wallet chain
              expects `{resolvedNetwork}`. Rewards/claims data may be stale or
              from a different chain.
            </Typography>
          )}
        </Card>
      )}

      {/* Rewards overview */}
      <Card variant={CardVariant.GLASS} className="p-6">
        <div className="flex items-center justify-between mb-4">
          <Typography variant="h5" fw="bold">
            Rewards Overview
          </Typography>

          {(isClaimSuccess || claimError) && (
            <Button variant="utility" size="sm" onClick={handleResetClaimState}>
              Reset
            </Button>
          )}
        </div>

        {isLoadingPending ? (
          <SkeletonLoader className="h-24" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Typography variant="body2" className="text-mono-100 mb-1">
                Total Pending
              </Typography>
              <Typography variant="h3" fw="bold">
                {pendingRewards !== undefined
                  ? formatRewardAmount(pendingRewards.totalPending)
                  : EMPTY_VALUE_PLACEHOLDER}{' '}
                <span className="text-mono-100 text-lg">
                  across {pendingRows.length} token(s)
                </span>
              </Typography>
            </div>

            <div className="text-right">
              <Typography variant="body2" className="text-mono-100">
                Active indexer endpoint
              </Typography>
              <Typography variant="body2" className="font-mono">
                {indexerEndpoint}
              </Typography>
            </div>
          </div>
        )}

        {pendingRewardsError && (
          <div className="mt-4">
            <ErrorMessage>{getErrorMessage(pendingRewardsError)}</ErrorMessage>
          </div>
        )}
      </Card>

      {/* Pending rewards by token */}
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          Pending Rewards by Token
        </Typography>

        {isLoadingPending ? (
          <div className="space-y-2">
            <SkeletonLoader className="h-16" />
            <SkeletonLoader className="h-16" />
          </div>
        ) : pendingRewardsError ? (
          <ErrorMessage>Could not load pending rewards.</ErrorMessage>
        ) : pendingRewards?.rewards.length ? (
          <PendingRewardsTable
            rows={pendingRewards.rewards}
            selectedTokenSet={selectedTokenSet}
            onToggleToken={toggleTokenSelection}
            onClaimToken={handleClaimToken}
            isClaiming={isClaiming}
          />
        ) : (
          <div className="text-center py-6 text-mono-100">
            <Typography variant="body1">No pending rewards.</Typography>
          </div>
        )}
      </Card>

      {/* Claim actions */}
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          Claim Actions
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            variant="secondary"
            onClick={handleClaimNative}
            isLoading={isClaiming}
            isDisabled={isClaiming || nativePending === BigInt(0)}
          >
            Claim Native ({nativeSymbol})
          </Button>

          <Button
            variant="secondary"
            onClick={handleClaimSelected}
            isLoading={isClaiming}
            isDisabled={isClaiming || selectedTokens.length === 0}
          >
            Claim Selected ({selectedTokens.length})
          </Button>

          <Button
            onClick={handleClaimAll}
            isLoading={isClaiming}
            isDisabled={isClaiming || !pendingRewards?.hasRewards}
          >
            Claim All Tokens
          </Button>
        </div>

        <Typography variant="body2" className="text-mono-100 mt-3">
          Selected total:{' '}
          {selectedTokens.length > 0
            ? `${formatRewardAmount(selectedTotal)} across ${selectedTokens.length} token(s)`
            : 'No tokens selected'}
        </Typography>

        {isClaimSuccess && claimFeedback && (
          <div className="mt-4 p-3 rounded-lg bg-green-500/20 text-green-300">
            <Typography variant="body2" fw="semibold">
              {claimFeedback.modeLabel} succeeded
            </Typography>
            <Typography variant="body2">{claimFeedback.details}</Typography>
            {txExplorerUrl ? (
              <a
                href={`${txExplorerUrl}/tx/${claimFeedback.txHash}`}
                target="_blank"
                rel="noreferrer"
                className="underline text-green-200 body2"
              >
                View transaction
              </a>
            ) : (
              <Typography variant="body2" className="font-mono">
                Tx: {claimFeedback.txHash}
              </Typography>
            )}
          </div>
        )}

        {claimError && (
          <div className="mt-4">
            <ErrorMessage>{getErrorMessage(claimError)}</ErrorMessage>
          </div>
        )}
      </Card>

      {/* Claim history */}
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          Claim History
        </Typography>

        {isLoadingHistory ? (
          <div className="space-y-2">
            <SkeletonLoader className="h-16" />
            <SkeletonLoader className="h-16" />
            <SkeletonLoader className="h-16" />
          </div>
        ) : rewardHistoryError ? (
          <ErrorMessage>Could not load claim history.</ErrorMessage>
        ) : rewardHistory?.length ? (
          <RewardClaimsTable entries={rewardHistory} txExplorerUrl={txExplorerUrl} />
        ) : (
          <div className="text-center py-6 text-mono-100">
            <Typography variant="body1">No claim history yet.</Typography>
          </div>
        )}
      </Card>
    </div>
  );
};

interface PendingRewardsTableProps {
  rows: PendingRewardsByTokenEntry[];
  selectedTokenSet: Set<string>;
  onToggleToken: (token: Address) => (event: ChangeEvent<HTMLInputElement>) => void;
  onClaimToken: (token: Address) => Promise<void>;
  isClaiming: boolean;
}

const PendingRewardsTable: FC<PendingRewardsTableProps> = ({
  rows,
  selectedTokenSet,
  onToggleToken,
  onClaimToken,
  isClaiming,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-mono-60 dark:border-mono-140">
            <th className="text-left py-3 px-4 text-mono-100 font-medium">
              Select
            </th>
            <th className="text-left py-3 px-4 text-mono-100 font-medium">
              Token
            </th>
            <th className="text-left py-3 px-4 text-mono-100 font-medium">
              Address
            </th>
            <th className="text-left py-3 px-4 text-mono-100 font-medium">
              Pending
            </th>
            <th className="text-left py-3 px-4 text-mono-100 font-medium">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.token}
              className="border-b border-mono-40 dark:border-mono-160"
            >
              <td className="py-3 px-4">
                <CheckBox
                  id={`reward-token-${row.token}`}
                  isChecked={selectedTokenSet.has(row.token.toLowerCase())}
                  onChange={onToggleToken(row.token)}
                  spacingClassName="ml-0"
                />
              </td>
              <td className="py-3 px-4">
                <TokenBadge token={row.token} />
              </td>
              <td className="py-3 px-4">
                <Typography variant="body2" className="font-mono">
                  {row.token === zeroAddress
                    ? '0x0000000000000000000000000000000000000000'
                    : row.token}
                </Typography>
              </td>
              <td className="py-3 px-4">
                <Typography variant="body2" fw="semibold">
                  {formatRewardAmount(row.pending)}
                </Typography>
              </td>
              <td className="py-3 px-4">
                <Button
                  variant="utility"
                  size="sm"
                  onClick={() => {
                    void onClaimToken(row.token);
                  }}
                  isLoading={isClaiming}
                  isDisabled={isClaiming || row.pending === BigInt(0)}
                >
                  Claim Token
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface RewardClaimsTableProps {
  entries: RewardClaimEntry[];
  txExplorerUrl?: string;
}

const RewardClaimsTable: FC<RewardClaimsTableProps> = ({
  entries,
  txExplorerUrl,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-mono-60 dark:border-mono-140">
            <th className="text-left py-3 px-4 text-mono-100 font-medium">
              Token
            </th>
            <th className="text-left py-3 px-4 text-mono-100 font-medium">
              Amount
            </th>
            <th className="text-left py-3 px-4 text-mono-100 font-medium">
              Date
            </th>
            <th className="text-left py-3 px-4 text-mono-100 font-medium">
              Tx Hash
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr
              key={entry.id}
              className="border-b border-mono-40 dark:border-mono-160"
            >
              <td className="py-3 px-4">
                <TokenBadge token={entry.token} />
              </td>
              <td className="py-3 px-4">
                <Typography variant="body2" fw="semibold">
                  {formatRewardAmount(entry.amount)}
                </Typography>
              </td>
              <td className="py-3 px-4">
                <Typography variant="body2">
                  {new Date(Number(entry.claimedAt) * 1000).toLocaleString()}
                </Typography>
              </td>
              <td className="py-3 px-4">
                {txExplorerUrl ? (
                  <a
                    href={`${txExplorerUrl}/tx/${entry.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="underline body2 font-mono"
                  >
                    {`${entry.txHash.slice(0, 10)}...${entry.txHash.slice(-8)}`}
                  </a>
                ) : (
                  <Typography variant="body2" className="font-mono">
                    {`${entry.txHash.slice(0, 10)}...${entry.txHash.slice(-8)}`}
                  </Typography>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TokenBadge: FC<{ token: Address }> = ({ token }) => {
  const { data: tokenMetadata, isLoading } = useTokenMetadata(token);
  const symbol = tokenMetadata?.symbol ?? (token === zeroAddress ? 'NATIVE' : 'TOKEN');

  return (
    <div className="flex items-center gap-2">
      <Typography variant="body2" fw="semibold">
        {isLoading ? 'Loading...' : symbol}
      </Typography>
      <Typography variant="body2" className="text-mono-100">
        {token === zeroAddress ? '(native)' : '(ERC20)'}
      </Typography>
    </div>
  );
};

export default RewardsPage;
