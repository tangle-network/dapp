/**
 * Developer earnings page backed by exact payout ledger events.
 */

import { FC, useEffect, useMemo, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { Card, CardContent } from '@tangle-network/sandbox-ui/primitives';
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
        <Card
          variant="sandbox"
          className="cloud-hero-card cloud-compact-header overflow-hidden border-border bg-card shadow-[var(--shadow-card)]"
        >
          <CardContent className="relative p-4 md:p-5">
            <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_12%_8%,rgba(99,102,241,0.18),transparent_32%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.10),transparent_28%)]" />
            <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
              <div>
                <h1 className="font-display font-extrabold text-3xl text-foreground leading-[1.05] tracking-[-0.035em] sm:text-4xl">
                  Publisher earnings
                </h1>
                <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed">
                  Track blueprint payout totals and indexed payment events for
                  the connected publisher wallet.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <HeroMetric label="Assets" value="Grouped" />
                <HeroMetric label="Events" value="Indexed" />
                <HeroMetric label="Explorer" value="Linked" />
              </div>
            </div>
          </CardContent>
        </Card>

        <RequireWallet
          eyebrow="Earnings"
          title="Connect to load earnings"
          description="Load publisher balances, payout totals, and indexed payment events for the connected wallet."
          checks={['Token totals', 'Payout events', 'Explorer links']}
        />
        <EarningsPreviewPanel />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card
        variant="sandbox"
        className="cloud-hero-card cloud-compact-header overflow-hidden border-border bg-card shadow-[var(--shadow-card)]"
      >
        <CardContent className="relative p-4 md:p-5">
          <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(circle_at_12%_8%,rgba(99,102,241,0.18),transparent_32%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.10),transparent_28%)]" />
          <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px] xl:items-center">
            <div>
              <h1 className="font-display font-extrabold text-3xl text-foreground leading-[1.05] tracking-[-0.035em] sm:text-4xl">
                Publisher earnings
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground text-sm leading-relaxed">
                Totals are derived from indexed on-chain payout events.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <HeroMetric label="Assets" value="Live" />
              <HeroMetric label="Events" value="Exact" />
              <HeroMetric label="Explorer" value="Linked" />
            </div>
          </div>
        </CardContent>
      </Card>

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

const EarningsPreviewPanel = () => (
  <Card variant="sandbox" className="border-border bg-card">
    <CardContent className="space-y-5 p-5">
      <div className="grid gap-4 md:grid-cols-3">
        <PreviewItem
          label="Balances"
          title="Token totals"
          description="Publisher payouts grouped by asset from indexed payment events."
        />
        <PreviewItem
          label="Ledger"
          title="Payout events"
          description="Exact transaction records with service, asset, and explorer context."
        />
        <PreviewItem
          label="Operations"
          title="Withdrawal planning"
          description="Use the ledger to reconcile revenue from deployed blueprint services."
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-background/40">
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr] border-border border-b px-4 py-3 font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">
          <span>Asset</span>
          <span>Earned</span>
          <span>Last payout</span>
          <span>Status</span>
        </div>
        {[
          ['TNT', 'Connect wallet', 'Indexed event', 'Locked'],
          ['USDC', 'Connect wallet', 'Service payout', 'Locked'],
          ['ETH', 'Connect wallet', 'Explorer link', 'Locked'],
        ].map(([asset, earned, payout, status]) => (
          <div
            key={asset}
            className="grid grid-cols-[1fr_1fr_1fr_1fr] border-border border-b px-4 py-3 text-sm last:border-b-0"
          >
            <span className="font-semibold text-foreground">{asset}</span>
            <span className="text-muted-foreground">{earned}</span>
            <span className="text-muted-foreground">{payout}</span>
            <span className="font-semibold text-muted-foreground">
              {status}
            </span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

const PreviewItem = ({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description: string;
}) => (
  <div className="rounded-xl border border-border bg-muted/30 p-4">
    <p className="font-semibold text-muted-foreground text-[10px] uppercase tracking-wider">
      {label}
    </p>
    <div className="mt-2 font-display font-bold text-foreground text-base">
      {title}
    </div>
    <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
      {description}
    </p>
  </div>
);

const HeroMetric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-md border border-border bg-card/70 p-2.5">
    <p className="font-medium text-muted-foreground text-[10px] uppercase tracking-wider">
      {label}
    </p>
    <p className="mt-0.5 font-display font-bold text-foreground text-base">
      {value}
    </p>
  </div>
);
