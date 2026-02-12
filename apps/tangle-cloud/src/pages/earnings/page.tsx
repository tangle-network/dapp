/**
 * Developer earnings page backed by exact payout ledger events.
 */

import { FC, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useAccount, useChainId } from 'wagmi';
import { Address, zeroAddress } from 'viem';
import {
  Avatar,
  Card,
  CardVariant,
  Button,
  CopyWithTooltip,
  Pagination,
  SkeletonLoader,
  Typography,
} from '@tangle-network/ui-components';
import { ExternalLinkLine, TokenIcon } from '@tangle-network/icons';
import {
  useDeveloperPayments,
  formatEarningsAmount,
  type DeveloperTokenTotal,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { useTokenMetadata } from '@tangle-network/tangle-shared-ui/data/services';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';
import { getCachedTokenMetadata } from '@tangle-network/dapp-config/tokenMetadata';
import { PagePath } from '../../types';
import {
  getActiveChainConfig,
  getTxExplorerUrl,
  isNonLocalEvmChain,
} from '../../utils/explorer';

const shortenAddress = (address: string): string =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

const shortenTxHash = (txHash: string): string =>
  `${txHash.slice(0, 8)}...${txHash.slice(-4)}`;

const formatTimestamp = (timestamp: bigint): string =>
  new Date(Number(timestamp) * 1000).toLocaleString();

const PAYOUT_EVENTS_PAGE_SIZE = 10;

const isFallbackSymbol = (symbol: string): boolean =>
  symbol.startsWith('0x') || symbol.includes('...');

const resolveTokenIconSymbol = (
  chainId: number,
  symbol: string,
  address: Address,
): string | null => {
  const cached = getCachedTokenMetadata(chainId, address);
  const candidate = isFallbackSymbol(symbol)
    ? (cached?.symbol ?? symbol)
    : symbol;
  return isFallbackSymbol(candidate) ? null : candidate;
};

const EarningsAssetCell: FC<{
  token: Address;
  addressExplorerUrl?: string;
}> = ({ token, addressExplorerUrl }) => {
  const chainId = useChainId();
  const activeChain = getActiveChainConfig(chainId);
  const cachedMetadata = getCachedTokenMetadata(chainId, token);
  const { data: metadata, isLoading } = useTokenMetadata(token);
  const symbol =
    metadata?.symbol ??
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
            {shortenAddress(token)}
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

const TokenAmount: FC<{
  token: Address;
  amount: bigint;
  className?: string;
}> = ({ token, amount, className }) => {
  const { data: metadata } = useTokenMetadata(token);
  const decimals = metadata?.decimals ?? 18;
  const symbol =
    metadata?.symbol ??
    (token.toLowerCase() === zeroAddress ? 'NATIVE' : 'TOKEN');
  const formattedAmount = formatEarningsAmount(amount, decimals);

  return (
    <Typography variant="body2" className={className}>
      {formattedAmount} {symbol}
    </Typography>
  );
};

const PayoutEventAmountCell: FC<{ token: Address; amount: bigint }> = ({
  token,
  amount,
}) => {
  const chainId = useChainId();
  const activeChain = getActiveChainConfig(chainId);
  const cachedMetadata = getCachedTokenMetadata(chainId, token);
  const { data: metadata } = useTokenMetadata(token);
  const decimals =
    metadata?.decimals ??
    cachedMetadata?.decimals ??
    (token === zeroAddress
      ? (activeChain?.nativeCurrency?.decimals ?? 18)
      : 18);
  const symbol =
    metadata?.symbol ??
    cachedMetadata?.symbol ??
    (token === zeroAddress
      ? (activeChain?.nativeCurrency?.symbol ?? 'NATIVE')
      : 'TOKEN');
  const iconSymbol = resolveTokenIconSymbol(chainId, symbol, token);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-5 h-5">
        {iconSymbol ? (
          <TokenIcon name={iconSymbol} size="lg" />
        ) : (
          <Avatar size="sm" value={token} theme="ethereum" />
        )}
      </div>
      <Typography variant="body2">
        {formatEarningsAmount(amount, decimals)} {symbol}
      </Typography>
    </div>
  );
};

const EarningsByAssetsTable: FC<{
  rows: DeveloperTokenTotal[];
  addressExplorerUrl?: string;
}> = ({ rows, addressExplorerUrl }) => {
  if (rows.length === 0) {
    return (
      <Typography variant="body2" className="text-mono-100">
        No payouts recorded.
      </Typography>
    );
  }

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
              Payout Events
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
                <EarningsAssetCell
                  token={row.token}
                  addressExplorerUrl={addressExplorerUrl}
                />
              </td>
              <td className="py-3 px-4">
                <TokenAmount token={row.token} amount={row.totalPaid} />
              </td>
              <td className="py-3 px-4">
                <Typography variant="body2">{row.paymentCount}</Typography>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const EarningsPage: FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const txExplorerUrl = getTxExplorerUrl(chainId);
  const showExplorerActions = isNonLocalEvmChain(chainId);
  const [eventsPageIndex, setEventsPageIndex] = useState(0);
  const walletActivityUrl =
    txExplorerUrl && address ? `${txExplorerUrl}/address/${address}` : null;

  const { data, isLoading, error } = useDeveloperPayments();
  const events = useMemo(() => data?.events ?? [], [data?.events]);
  const totalEventPages = Math.max(
    1,
    Math.ceil(events.length / PAYOUT_EVENTS_PAGE_SIZE),
  );

  useEffect(() => {
    setEventsPageIndex((current) => Math.min(current, totalEventPages - 1));
  }, [totalEventPages]);

  const visibleEvents = useMemo(() => {
    const start = eventsPageIndex * PAYOUT_EVENTS_PAGE_SIZE;
    return events.slice(start, start + PAYOUT_EVENTS_PAGE_SIZE);
  }, [events, eventsPageIndex]);

  if (!isConnected) {
    return (
      <div className="text-center py-12">
        <Typography variant="h4">Connect Wallet</Typography>
        <Typography variant="body1" className="text-mono-100 mt-2">
          Please connect your wallet to view earnings.
        </Typography>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="h4" fw="bold">
          Developer Earnings
        </Typography>
        <Typography variant="body2" className="text-mono-100 mt-1">
          Earnings are derived from direct on-chain payout events indexed from
          payment distribution.
        </Typography>
      </div>

      {isLoading ? (
        <Card variant={CardVariant.GLASS} className="p-6">
          <SkeletonLoader className="h-10 w-64 mb-4" />
          <SkeletonLoader className="h-8 w-full mb-2" />
          <SkeletonLoader className="h-8 w-11/12 mb-2" />
          <SkeletonLoader className="h-8 w-10/12" />
        </Card>
      ) : null}

      {!isLoading && error ? (
        <Card variant={CardVariant.GLASS} className="p-6">
          <Typography variant="h5" fw="bold" className="mb-3">
            Could Not Load Earnings
          </Typography>
          <ErrorMessage>
            {error instanceof Error
              ? error.message
              : 'Failed to load developer payouts.'}
          </ErrorMessage>
        </Card>
      ) : null}

      {!isLoading && !error && data ? (
        <>
          <Card variant={CardVariant.GLASS} className="p-6">
            <Typography variant="h5" fw="bold" className="mb-4">
              Earnings by Assets
            </Typography>
            <EarningsByAssetsTable
              rows={data.tokenTotals}
              addressExplorerUrl={txExplorerUrl}
            />
          </Card>

          <Card variant={CardVariant.GLASS} className="p-6">
            <Typography variant="h5" fw="bold" className="mb-4">
              Developer Payout Events
            </Typography>

            {events.length === 0 ? (
              <div className="text-center py-6">
                <Typography variant="body1" className="text-mono-100">
                  No developer payout events found for this wallet context.
                </Typography>
                <div className="flex flex-wrap gap-3 justify-center mt-4">
                  <Link to={PagePath.BLUEPRINTS}>
                    <Button variant="secondary" size="sm">
                      View Blueprints
                    </Button>
                  </Link>
                  {walletActivityUrl && (
                    <a
                      href={walletActivityUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button size="sm">View Wallet Activity</Button>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-mono-60 dark:border-mono-140">
                      <th className="text-left py-3 px-4 text-mono-100 font-medium">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-mono-100 font-medium">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-mono-100 font-medium">
                        Blueprint
                      </th>
                      <th className="text-left py-3 px-4 text-mono-100 font-medium">
                        Service
                      </th>
                      <th className="text-left py-3 px-4 text-mono-100 font-medium">
                        Tx Hash
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleEvents.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-mono-40 dark:border-mono-160"
                      >
                        <td className="py-3 px-4">
                          <Typography variant="body2">
                            {formatTimestamp(entry.paidAt)}
                          </Typography>
                        </td>
                        <td className="py-3 px-4">
                          <PayoutEventAmountCell
                            token={entry.token}
                            amount={entry.amount}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            to={PagePath.BLUEPRINTS_DETAILS.replace(
                              ':id',
                              entry.blueprintId.toString(),
                            )}
                            className="underline body2"
                          >
                            #{entry.blueprintId.toString()}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <Link
                            to={PagePath.SERVICE_DETAILS.replace(
                              ':id',
                              entry.serviceId.toString(),
                            )}
                            className="underline body2"
                          >
                            #{entry.serviceId.toString()}
                          </Link>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2 text-mono-100">
                            <Typography
                              variant="body2"
                              className="font-mono text-mono-100"
                            >
                              {shortenTxHash(entry.txHash)}
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

                {totalEventPages > 1 && (
                  <Pagination
                    className="mt-2"
                    title="events"
                    itemsPerPage={PAYOUT_EVENTS_PAGE_SIZE}
                    totalItems={events.length}
                    totalPages={totalEventPages}
                    page={eventsPageIndex + 1}
                    canPreviousPage={eventsPageIndex > 0}
                    previousPage={() => {
                      setEventsPageIndex((current) => Math.max(current - 1, 0));
                    }}
                    canNextPage={eventsPageIndex < totalEventPages - 1}
                    nextPage={() => {
                      setEventsPageIndex((current) =>
                        Math.min(current + 1, totalEventPages - 1),
                      );
                    }}
                    setPageIndex={(updater) => {
                      setEventsPageIndex((current) => {
                        const next =
                          typeof updater === 'function'
                            ? updater(current)
                            : updater;
                        return Math.min(Math.max(next, 0), totalEventPages - 1);
                      });
                    }}
                  />
                )}
              </div>
            )}
          </Card>
        </>
      ) : null}
    </div>
  );
};

export default EarningsPage;
