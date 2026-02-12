/**
 * Developer earnings page backed by exact payout ledger events.
 */

import { FC } from 'react';
import { Link } from 'react-router';
import { useAccount, useChainId } from 'wagmi';
import { Address, zeroAddress } from 'viem';
import {
  Card,
  CardVariant,
  Typography,
  SkeletonLoader,
  Button,
} from '@tangle-network/ui-components';
import {
  useDeveloperPayments,
  formatEarningsAmount,
  type DeveloperTokenTotal,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { useTokenMetadata } from '@tangle-network/tangle-shared-ui/data/services';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';
import { chainsConfig } from '@tangle-network/dapp-config/chains';
import { PagePath } from '../../types';

const shortenAddress = (address: string): string =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;

const formatTimestamp = (timestamp: bigint): string =>
  new Date(Number(timestamp) * 1000).toLocaleString();

const TokenLabel: FC<{ token: Address }> = ({ token }) => {
  const { data: metadata, isLoading } = useTokenMetadata(token);
  const symbol =
    metadata?.symbol ?? (token.toLowerCase() === zeroAddress ? 'NATIVE' : 'TOKEN');

  return (
    <div className="flex items-center gap-2">
      <Typography variant="body2" fw="semibold">
        {isLoading ? 'Loading...' : symbol}
      </Typography>
      <Typography variant="body2" className="text-mono-100 font-mono">
        {shortenAddress(token)}
      </Typography>
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
    metadata?.symbol ?? (token.toLowerCase() === zeroAddress ? 'NATIVE' : 'TOKEN');

  return (
    <Typography variant="body2" className={className}>
      {formatEarningsAmount(amount, decimals)} {symbol}
    </Typography>
  );
};

const TokenTotalsStack: FC<{ rows: DeveloperTokenTotal[] }> = ({ rows }) => {
  if (rows.length === 0) {
    return (
      <Typography variant="body2" className="text-mono-100">
        No payouts recorded.
      </Typography>
    );
  }

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div
          key={row.token}
          className="flex items-center justify-between gap-3 rounded-lg border border-mono-60 dark:border-mono-140 px-3 py-2"
        >
          <TokenLabel token={row.token} />
          <TokenAmount token={row.token} amount={row.totalPaid} />
        </div>
      ))}
    </div>
  );
};

const EarningsPage: FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const activeChain = chainsConfig[chainId];
  const txExplorerUrl = activeChain?.blockExplorers?.default?.url;
  const walletActivityUrl =
    txExplorerUrl && address ? `${txExplorerUrl}/address/${address}` : null;

  const { data, isLoading, error, network } = useDeveloperPayments();

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

      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-3">
          Data Correctness
        </Typography>
        <Typography variant="body2" className="text-mono-100">
          Direct on-chain payout events.
        </Typography>
        <Typography variant="body2" className="text-mono-100 mt-2">
          Includes manager payout overrides through emitted payout recipients.
        </Typography>
        <Typography variant="body2" className="text-mono-100 mt-3">
          Active chain: {activeChain?.name ?? `Chain ${chainId}`} ({chainId}).
          Indexer network: {network}.
        </Typography>
      </Card>

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
              Earnings Summary
            </Typography>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-lg border border-mono-60 dark:border-mono-140 p-4">
                <Typography variant="body2" className="text-mono-100 mb-2">
                  Total Developer Payouts (by asset)
                </Typography>
                <TokenTotalsStack rows={data.tokenTotals} />
              </div>

              <div className="rounded-lg border border-mono-60 dark:border-mono-140 p-4">
                <Typography variant="body2" className="text-mono-100 mb-2">
                  Payout Addresses
                </Typography>
                <Typography variant="h5" fw="bold">
                  {data.payoutAddresses.length}
                </Typography>
                <div className="mt-3 space-y-2">
                  {data.payoutAddresses.length > 0 ? (
                    data.payoutAddresses.map((recipient) => (
                      <Typography
                        key={recipient}
                        variant="body2"
                        className="font-mono text-mono-100"
                      >
                        {recipient}
                      </Typography>
                    ))
                  ) : (
                    <Typography variant="body2" className="text-mono-100">
                      No payout recipients yet.
                    </Typography>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-mono-60 dark:border-mono-140 p-4">
                <Typography variant="body2" className="text-mono-100 mb-2">
                  Services Generating Payouts
                </Typography>
                <Typography variant="h5" fw="bold">
                  {data.serviceCount}
                </Typography>
                <Typography variant="body2" className="text-mono-100 mt-3">
                  Blueprints: {data.blueprintRollups.length}
                </Typography>
                <Typography variant="body2" className="text-mono-100 mt-2">
                  Total payout events: {data.events.length}
                </Typography>
                <Typography variant="body2" className="text-mono-100 mt-2">
                  Aggregate payouts are asset-aware and derived from
                  `PaymentDistributed`.
                </Typography>
              </div>
            </div>
          </Card>

          <Card variant={CardVariant.GLASS} className="p-6">
            <Typography variant="h5" fw="bold" className="mb-4">
              Developer Payout Events
            </Typography>

            {data.events.length === 0 ? (
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
                    <a href={walletActivityUrl} target="_blank" rel="noreferrer">
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
                        Blueprint
                      </th>
                      <th className="text-left py-3 px-4 text-mono-100 font-medium">
                        Service
                      </th>
                      <th className="text-left py-3 px-4 text-mono-100 font-medium">
                        Recipient
                      </th>
                      <th className="text-left py-3 px-4 text-mono-100 font-medium">
                        Asset
                      </th>
                      <th className="text-left py-3 px-4 text-mono-100 font-medium">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-mono-100 font-medium">
                        Tx Hash
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.events.map((entry) => (
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
                          <Typography variant="body2">
                            #{entry.blueprintId.toString()}
                          </Typography>
                        </td>
                        <td className="py-3 px-4">
                          <Typography variant="body2">
                            #{entry.serviceId.toString()}
                          </Typography>
                        </td>
                        <td className="py-3 px-4">
                          <Typography variant="body2" className="font-mono">
                            {entry.recipient}
                          </Typography>
                        </td>
                        <td className="py-3 px-4">
                          <TokenLabel token={entry.token} />
                        </td>
                        <td className="py-3 px-4">
                          <TokenAmount token={entry.token} amount={entry.amount} />
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
            )}
          </Card>

          <Card variant={CardVariant.GLASS} className="p-6">
            <Typography variant="h5" fw="bold" className="mb-4">
              Blueprint-Level Rollups
            </Typography>

            {data.blueprintRollups.length === 0 ? (
              <Typography variant="body1" className="text-mono-100">
                No blueprint payout rollups yet.
              </Typography>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-mono-60 dark:border-mono-140">
                      <th className="text-left py-3 px-4 text-mono-100 font-medium">
                        Blueprint
                      </th>
                      <th className="text-left py-3 px-4 text-mono-100 font-medium">
                        Services
                      </th>
                      <th className="text-left py-3 px-4 text-mono-100 font-medium">
                        Payments
                      </th>
                      <th className="text-left py-3 px-4 text-mono-100 font-medium">
                        Last Payout
                      </th>
                      <th className="text-left py-3 px-4 text-mono-100 font-medium">
                        Payout Scope
                      </th>
                      <th className="text-left py-3 px-4 text-mono-100 font-medium">
                        Asset Breakdown
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.blueprintRollups.map((rollup) => (
                      <tr
                        key={rollup.blueprintId.toString()}
                        className="border-b border-mono-40 dark:border-mono-160"
                      >
                        <td className="py-3 px-4">
                          <Typography variant="body2">
                            #{rollup.blueprintId.toString()}
                          </Typography>
                        </td>
                        <td className="py-3 px-4">
                          <Typography variant="body2">{rollup.serviceCount}</Typography>
                        </td>
                        <td className="py-3 px-4">
                          <Typography variant="body2">{rollup.paymentCount}</Typography>
                        </td>
                        <td className="py-3 px-4">
                          <Typography variant="body2">
                            {rollup.lastPaidAt
                              ? formatTimestamp(rollup.lastPaidAt)
                              : 'N/A'}
                          </Typography>
                        </td>
                        <td className="py-3 px-4">
                          <Typography variant="body2" className="text-mono-100">
                            Payout data by asset
                          </Typography>
                          <Typography variant="body2" className="text-mono-100">
                            {rollup.tokenTotals.length} asset(s)
                          </Typography>
                        </td>
                        <td className="py-3 px-4">
                          <TokenTotalsStack rows={rollup.tokenTotals} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      ) : null}
    </div>
  );
};

export default EarningsPage;
