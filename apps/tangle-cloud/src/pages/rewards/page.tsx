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
  CopyWithTooltip,
  Typography,
  SkeletonLoader,
  Avatar,
} from '@tangle-network/ui-components';
import { BN } from '@polkadot/util';
import { ExternalLinkLine, TokenIcon } from '@tangle-network/icons';
import {
  AmountFormatStyle,
  formatDisplayAmount,
} from '@tangle-network/ui-components/utils/formatDisplayAmount';
import { shortenHex } from '@tangle-network/ui-components/utils/shortenHex';
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

      {/* Pending rewards by token */}
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          Pending Rewards by Asset
        </Typography>

        {isLoadingPending ? (
          <div className="space-y-2">
            <SkeletonLoader className="h-16" />
            <SkeletonLoader className="h-16" />
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
                variant={selectedTokens.length > 0 ? 'secondary' : 'primary'}
                isLoading={isBulkClaiming}
                isDisabled={isClaiming || !pendingRewards.hasRewards}
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
          <div className="text-center py-6 text-mono-100">
            <Typography variant="body1">No pending rewards.</Typography>
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
          <RewardClaimsTable
            entries={rewardHistory}
            txExplorerUrl={txExplorerUrl}
            showExplorerActions={!!txExplorerUrl}
          />
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
      <table className="w-full">
        <thead>
          <tr className="border-b border-mono-60 dark:border-mono-140">
            <th className="text-left py-3 px-4 text-mono-100 font-medium">
              Select
            </th>
            <th className="text-left py-3 px-4 text-mono-100 font-medium">
              Asset
            </th>
            <th className="text-left py-3 px-4 text-mono-100 font-medium">
              Amount
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
                  isDisabled={isClaiming}
                  spacingClassName="ml-0"
                />
              </td>
              <td className="py-3 px-4">
                <PendingAssetCell
                  token={row.token}
                  addressExplorerUrl={addressExplorerUrl}
                />
              </td>
              <td className="py-3 px-4">
                <PendingRewardAmountCell
                  token={row.token}
                  amount={row.pending}
                />
              </td>
              <td className="py-3 px-4">
                <Button
                  variant="utility"
                  size="sm"
                  onClick={() => {
                    void onClaimToken(row.token);
                  }}
                  isLoading={
                    activeClaimToken?.toLowerCase() === row.token.toLowerCase()
                  }
                  isDisabled={isClaiming || row.pending === BigInt(0)}
                >
                  Claim Asset
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

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
          <Avatar size="lg" value={token} theme="ethereum" />
        )}
      </div>

      <div className="flex flex-col min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Typography
            variant="body2"
            fw="semibold"
            className="whitespace-nowrap"
          >
            {isLoading ? 'Loading...' : symbol}
          </Typography>
          {tokenName && (
            <Typography
              variant="body3"
              className="text-mono-120 dark:text-mono-100 truncate"
            >
              {tokenName}
            </Typography>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Typography variant="body2" className="font-mono text-mono-100">
            {shortenHex(token)}
          </Typography>
          <CopyWithTooltip
            textToCopy={token}
            copyLabel="Copy asset address"
            isButton={false}
            className="inline-flex text-mono-120 dark:text-mono-100"
          />
          {showExplorerAction && (
            <a
              href={explorerAddressUrl ?? undefined}
              target="_blank"
              rel="noreferrer"
              className="text-mono-120 dark:text-mono-100"
              aria-label="View asset address on block explorer"
            >
              <ExternalLinkLine className="w-4 h-4 !fill-current" />
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
    <Typography variant="body2" fw="semibold">
      {formatDisplayAmount(
        new BN(amount.toString()),
        decimals,
        AmountFormatStyle.SHORT,
      )}
    </Typography>
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
    <Typography variant="body2" fw="semibold">
      {formatDisplayAmount(
        new BN(amount.toString()),
        decimals,
        AmountFormatStyle.SHORT,
      )}
    </Typography>
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
      <table className="w-full">
        <thead>
          <tr className="border-b border-mono-60 dark:border-mono-140">
            <th className="text-left py-3 px-4 text-mono-100 font-medium">
              Asset
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
                <PendingAssetCell
                  token={entry.token}
                  addressExplorerUrl={txExplorerUrl}
                />
              </td>
              <td className="py-3 px-4">
                <RewardAmountCell token={entry.token} amount={entry.amount} />
              </td>
              <td className="py-3 px-4">
                <Typography variant="body2">
                  {new Date(Number(entry.claimedAt) * 1000).toLocaleString()}
                </Typography>
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 text-mono-100">
                  <Typography
                    variant="body2"
                    className="font-mono text-mono-100"
                  >
                    {shortenHex(entry.txHash, 6)}
                  </Typography>
                  <CopyWithTooltip
                    textToCopy={entry.txHash}
                    copyLabel="Copy tx hash"
                    isButton={false}
                    className="inline-flex text-mono-100"
                    iconClassName="!fill-mono-100"
                  />
                  {showExplorerActions && txExplorerUrl && (
                    <a
                      href={`${txExplorerUrl}/tx/${entry.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-mono-100"
                      aria-label="View transaction on block explorer"
                    >
                      <ExternalLinkLine className="w-4 h-4 !fill-mono-100" />
                    </a>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RewardsPage;
