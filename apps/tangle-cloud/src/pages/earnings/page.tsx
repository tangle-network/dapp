/**
 * Developer earnings page backed by exact payout ledger events.
 */

import { FC, useEffect, useMemo, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import {
  DeveloperPaymentsQueryError,
  useDeveloperPayments,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { getTxExplorerUrl, isNonLocalEvmChain } from '../../utils/explorer';
import EarningsAssetsCard from './components/EarningsAssetsCard';
import EarningsErrorState from './components/EarningsErrorState';
import EarningsLoadingState from './components/EarningsLoadingState';
import PayoutEventsCard from './components/PayoutEventsCard';
import RequireWallet from '../../components/RequireWallet';

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
  const isUnsupportedSchema = data?.schemaStatus === 'unsupported';
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
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-extrabold text-foreground text-3xl tracking-tight">
            Publisher earnings
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
            Track blueprint payout totals and indexed payment events for the
            connected publisher wallet.
          </p>
        </div>
        <RequireWallet
          eyebrow="Earnings"
          title="Connect to view earnings"
          description="Connect a wallet to load publisher balances and payout events."
          checks={['Token totals', 'Payout events', 'Explorer links']}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-extrabold text-foreground text-3xl tracking-tight">
          Publisher earnings
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground text-sm">
          Totals are derived from indexed on-chain payout events.
        </p>
      </div>

      {isLoading ? <EarningsLoadingState /> : null}
      {!isLoading && isUnsupportedSchema && data ? (
        <EarningsErrorState
          unsupportedSchemaMessage={
            data.unsupportedReason ??
            'DeveloperPayment entity is unavailable for this indexer schema.'
          }
          diagnostics={data.diagnostics}
        />
      ) : null}
      {!isLoading && !isUnsupportedSchema && error ? (
        <EarningsErrorState
          error={error}
          diagnostics={
            error instanceof DeveloperPaymentsQueryError
              ? error.diagnostics
              : undefined
          }
        />
      ) : null}

      {!isLoading && !isUnsupportedSchema && !error && data ? (
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
