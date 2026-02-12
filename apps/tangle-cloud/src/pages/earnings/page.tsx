/**
 * Developer earnings dashboard.
 *
 * Trust-first behavior:
 * - Never shows estimated/fabricated earnings.
 * - Uses explicit data states: available, unavailable, error.
 */

import { FC } from 'react';
import { Link } from 'react-router';
import { useAccount, useChainId } from 'wagmi';
import {
  Button,
  Card,
  CardVariant,
  Typography,
  SkeletonLoader,
} from '@tangle-network/ui-components';
import {
  useDeveloperEarnings,
  formatEarningsAmount,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { chainsConfig } from '@tangle-network/dapp-config/chains';
import ErrorMessage from '@tangle-network/tangle-shared-ui/components/ErrorMessage';
import { PagePath } from '../../types';

const EarningsPage: FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const activeChain = chainsConfig[chainId];

  const { data, isLoading, error, state, network } = useDeveloperEarnings();

  const explorerBaseUrl = activeChain?.blockExplorers?.default?.url;
  const walletActivityUrl =
    explorerBaseUrl && address ? `${explorerBaseUrl}/address/${address}` : null;

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
        <Typography variant="body2" className="text-mono-100">
          Developer payouts are transferred directly on payment distribution and
          can be routed by manager overrides.
        </Typography>
      </div>

      {isLoading ? (
        <Card variant={CardVariant.GLASS} className="p-6">
          <SkeletonLoader className="h-8 w-56 mb-4" />
          <SkeletonLoader className="h-6 w-full mb-2" />
          <SkeletonLoader className="h-6 w-5/6" />
        </Card>
      ) : null}

      {!isLoading && state === 'error' ? (
        <Card variant={CardVariant.GLASS} className="p-6">
          <Typography variant="h5" fw="bold" className="mb-3">
            Could Not Load Earnings
          </Typography>
          <ErrorMessage>
            {error instanceof Error
              ? error.message
              : 'Failed to load developer earnings state.'}
          </ErrorMessage>
          <Typography variant="body2" className="text-mono-100 mt-3">
            This is a data loading failure, not a zero-earnings result.
          </Typography>
        </Card>
      ) : null}

      {!isLoading && state !== 'error' && data?.state === 'unavailable' ? (
        <>
          <Card variant={CardVariant.GLASS} className="p-6">
            <Typography variant="h5" fw="bold" className="mb-3">
              Earnings Data Unavailable
            </Typography>
            <Typography variant="body2" className="text-mono-100">
              {data.message}
            </Typography>
            <Typography variant="body2" className="text-mono-100 mt-3">
              Active chain: {activeChain?.name ?? `Chain ${chainId}`} ({chainId})
              . Indexer network: {network}.
            </Typography>
            <Typography variant="body2" className="text-mono-100 mt-2">
              Owned blueprints detected: {data.blueprintCount}
            </Typography>
            <Typography variant="body2" className="text-mono-100 mt-2">
              Payout destination may be blueprint owner or a manager-defined
              override address.
            </Typography>

            <div className="flex flex-wrap gap-3 mt-5">
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
          </Card>

          <Card variant={CardVariant.GLASS} className="p-6">
            <Typography variant="h5" fw="bold" className="mb-3">
              Temporary Verification Path
            </Typography>
            <Typography variant="body2" className="text-mono-100">
              1. Review wallet inflows for direct payout transfers.
            </Typography>
            <Typography variant="body2" className="text-mono-100 mt-2">
              2. Confirm blueprint manager payout overrides when applicable.
            </Typography>
            <Typography variant="body2" className="text-mono-100 mt-2">
              3. Use service and reward pages for operational activity while
              earnings ledger indexing is pending.
            </Typography>
          </Card>
        </>
      ) : null}

      {!isLoading && state !== 'error' && data?.state === 'available' ? (
        <Card variant={CardVariant.GLASS} className="p-6">
          <Typography variant="h5" fw="bold" className="mb-3">
            Earnings Summary
          </Typography>
          <Typography variant="body2" className="text-mono-100">
            Total Earned: {formatEarningsAmount(data.summary.totalEarned)}
          </Typography>
          <Typography variant="body2" className="text-mono-100 mt-2">
            Pending: {formatEarningsAmount(data.summary.pendingEarnings)}
          </Typography>
          <Typography variant="body2" className="text-mono-100 mt-2">
            Claimed: {formatEarningsAmount(data.summary.claimedEarnings)}
          </Typography>
        </Card>
      ) : null}
    </div>
  );
};

export default EarningsPage;
