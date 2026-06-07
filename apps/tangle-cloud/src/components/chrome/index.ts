/**
 * Chrome system — page composition primitives for tangle-cloud.
 *
 * Compose every cloud-app page from these six (plus the small helpers).
 * Anything else — bespoke hero cards, gradient backdrops, custom filter
 * cards — is the bug, not the rule.
 *
 * Mental model:
 *   <PageLayout>
 *     <PageHeader title="…" action={…} />
 *     <MetricStrip metrics={…} />            // opt-in only
 *     <PageToolbar search={…} trailing={…} /> // catalog pages only
 *     {hasResults ? (
 *       view === 'grid'
 *         ? <ResultGrid items={…} renderItem={…} />
 *         : <ResultList items={…} columns={…} rowKey={…} />
 *     ) : (
 *       <EmptyState kind={…} primary={…} />
 *     )}
 *   </PageLayout>
 */

export { default as CopyableId } from './CopyableId';

export { default as DataTable } from './DataTable';
export type { DataColumn } from './DataTable';

export { default as EmptyState } from './EmptyState';
export type { EmptyKind } from './EmptyState';

export { default as FilterTray } from './FilterTray';

export { default as MetricStrip } from './MetricStrip';
export type { Metric, MetricTone } from './MetricStrip';

export { default as Money } from './Money';

export { default as PageHeader } from './PageHeader';

export { default as PageToolbar } from './PageToolbar';

export { default as ResultGrid } from './ResultGrid';

export { default as ResultList } from './ResultList';
export type { ResultColumn } from './ResultList';

export { default as StatusPill } from './StatusPill';

export { default as ViewToggle } from './ViewToggle';
export type { ResultView } from './ViewToggle';

// Design-system contracts (tokens + helpers) — re-exported so surfaces have a
// single import path for the whole chrome system. The status tone mapping and
// the money formatter are the two canonical contracts every surface shares.
export {
  formatMoney,
  statusDot,
  statusPill,
  statusToneFor,
  typeRole,
} from '../../styles/chrome';
export type {
  FormatMoneyOptions,
  MoneyView,
  StatusDomain,
  StatusTone,
} from '../../styles/chrome';
