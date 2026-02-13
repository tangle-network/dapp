/**
 * Developer earnings page backed by exact payout ledger events.
 */

import { FC, useEffect, useMemo, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { Typography } from '@tangle-network/ui-components';
import { useDeveloperPayments } from '@tangle-network/tangle-shared-ui/data/graphql';
import { getTxExplorerUrl, isNonLocalEvmChain } from '../../utils/explorer';
import EarningsAssetsCard from './components/EarningsAssetsCard';
import EarningsErrorState from './components/EarningsErrorState';
import EarningsLoadingState from './components/EarningsLoadingState';
import PayoutEventsCard from './components/PayoutEventsCard';

const PAYOUT_EVENTS_PAGE_SIZE = 10;

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
  const totalEventPages = useMemo(
    () => Math.max(1, Math.ceil(events.length / PAYOUT_EVENTS_PAGE_SIZE)),
    [events.length],
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

      {isLoading ? <EarningsLoadingState /> : null}
      {!isLoading && error ? <EarningsErrorState error={error} /> : null}

      {!isLoading && !error && data ? (
        <>
          <EarningsAssetsCard
            rows={data.tokenTotals}
            addressExplorerUrl={txExplorerUrl}
          />
          <PayoutEventsCard
            events={events}
            visibleEvents={visibleEvents}
            totalEventPages={totalEventPages}
            eventsPageIndex={eventsPageIndex}
            setEventsPageIndex={setEventsPageIndex}
            txExplorerUrl={txExplorerUrl}
            showExplorerActions={showExplorerActions}
            walletActivityUrl={walletActivityUrl}
            pageSize={PAYOUT_EVENTS_PAGE_SIZE}
          />
        </>
      ) : null}
    </div>
  );
};

export default EarningsPage;
