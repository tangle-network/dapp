import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@tangle-network/sandbox-ui/primitives';
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { focus, typeRole } from '../../styles/chrome';

export type DataColumn<T> = {
  /** Column header. */
  header: ReactNode;
  /** Cell renderer for a row. */
  render: (item: T, index: number) => ReactNode;
  /**
   * Alignment. Use `right` for amounts/numerics so columns line up on the
   * decimal — the senior move for a ledger.
   */
  align?: 'left' | 'right' | 'center';
  /** Render this column's cells as mono tabular numerics (IDs, hashes, amounts). */
  mono?: boolean;
  /** Width / sizing class for the `<th>`/`<td>` (e.g. `w-24`, `w-[1%]`). */
  className?: string;
  /** Header-cell class override. */
  headerClassName?: string;
  /** Fold this column on narrow viewports. */
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl';
};

type Props<T> = {
  items: T[];
  columns: DataColumn<T>[];
  rowKey: (item: T, index: number) => string;
  /** Make rows clickable (entire row is the target). */
  onRowClick?: (item: T, index: number) => void;
  /** Caption for screen readers. */
  caption?: string;
  /** Empty slot — pass an <EmptyState/> for the zero-row case. */
  empty?: ReactNode;
  className?: string;
};

const HIDE_CLASS: Record<
  NonNullable<DataColumn<unknown>['hideBelow']>,
  string
> = {
  sm: 'hidden sm:table-cell',
  md: 'hidden md:table-cell',
  lg: 'hidden lg:table-cell',
  xl: 'hidden xl:table-cell',
};

const ALIGN_CLASS: Record<NonNullable<DataColumn<unknown>['align']>, string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
};

/**
 * Dense console table — the design-system instrument for in-page ledgers,
 * job history, payout events, and any N-row homogeneous data inside a detail
 * surface. Wraps the design-system `Table` family with the console defaults the
 * brief mandates: mono tabular numerics, right-aligned amounts, copyable IDs
 * (via the `mono` + `<CopyableId>` helpers), thin borders, row-as-target.
 *
 * Use this — NOT a hand-rolled `<table>` (the F4-svc bug) — whenever the data
 * is tabular and lives inside a page. For top-level catalog/directory pages
 * that need search + view-toggle, use `ResultList` instead.
 *
 *   <DataTable
 *     items={jobs}
 *     rowKey={(j) => j.id}
 *     columns={[
 *       { header: 'Job', render: (j) => <CopyableId value={j.id} />, mono: true },
 *       { header: 'Amount', align: 'right', mono: true,
 *         render: (j) => <Money value={j.amount} options={{ decimals, symbol }} /> },
 *       { header: 'Status', render: (j) =>
 *         <StatusPill tone={statusToneFor('job', j.status)}>{j.status}</StatusPill> },
 *     ]}
 *   />
 */
function DataTable<T>({
  items,
  columns,
  rowKey,
  onRowClick,
  caption,
  empty,
  className,
}: Props<T>) {
  if (items.length === 0 && empty !== undefined) {
    return empty;
  }

  return (
    <div
      className={twMerge(
        'overflow-x-auto rounded-lg border border-mono-60 dark:border-mono-170',
        className,
      )}
    >
      <Table>
        {caption && <caption className="sr-only">{caption}</caption>}
        <TableHeader>
          <TableRow className="border-b border-mono-60 dark:border-mono-170 hover:bg-transparent">
            {columns.map((col, i) => (
              <TableHead
                key={i}
                className={twMerge(
                  typeRole.label,
                  'h-9 whitespace-nowrap px-4 align-middle',
                  col.align && ALIGN_CLASS[col.align],
                  col.hideBelow && HIDE_CLASS[col.hideBelow],
                  col.headerClassName ?? col.className,
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => {
            const interactive = onRowClick !== undefined;
            return (
              <TableRow
                key={rowKey(item, index)}
                tabIndex={interactive ? 0 : undefined}
                onClick={
                  interactive ? () => onRowClick(item, index) : undefined
                }
                onKeyDown={
                  interactive
                    ? (e: ReactKeyboardEvent) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onRowClick(item, index);
                        }
                      }
                    : undefined
                }
                className={twMerge(
                  'border-b border-mono-60 dark:border-mono-170/60 last:border-b-0',
                  interactive &&
                    twMerge(
                      'cursor-pointer transition-colors hover:bg-[color:var(--bg-hover)]/60',
                      focus.ring,
                    ),
                )}
              >
                {columns.map((col, i) => (
                  <TableCell
                    key={i}
                    className={twMerge(
                      'px-4 py-2.5 align-middle text-base',
                      col.align && ALIGN_CLASS[col.align],
                      col.mono && 'font-mono text-sm tabular-nums',
                      col.hideBelow && HIDE_CLASS[col.hideBelow],
                      col.className,
                    )}
                  >
                    {col.render(item, index)}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default DataTable;
