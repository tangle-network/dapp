/**
 * Table showing job history for a service.
 */

import { FC, useState } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from '@tanstack/react-table';
import {
  Typography,
  SkeletonLoader,
  Button,
} from '@tangle-network/ui-components';
import type { JobCall } from '@tangle-network/tangle-shared-ui/data/graphql';
import { isOptimisticJob } from '@tangle-network/tangle-shared-ui/data/graphql/useJobs';
import { twMerge } from 'tailwind-merge';
import { JobResultsModal } from './JobResultsModal';

interface Props {
  jobs: JobCall[];
  isLoading: boolean;
}

const columnHelper = createColumnHelper<JobCall>();

const columns = [
  columnHelper.accessor('callId', {
    header: 'Call ID',
    cell: (info) => {
      const job = info.row.original;
      if (isOptimisticJob(job)) {
        return (
          <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400 animate-pulse">
            Confirming...
          </span>
        );
      }
      return (
        <Typography variant="body2" className="font-mono">
          #{info.getValue().toString()}
        </Typography>
      );
    },
  }),
  columnHelper.accessor('jobIndex', {
    header: 'Job ID',
    cell: (info) => (
      <Typography variant="body2">Job {info.getValue()}</Typography>
    ),
  }),
  columnHelper.accessor('submitter', {
    header: 'Submitter',
    cell: (info) => {
      const address = info.getValue();
      return (
        <Typography variant="body2" className="font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </Typography>
      );
    },
  }),
  columnHelper.accessor('submittedAt', {
    header: 'Submitted At',
    cell: (info) => {
      const timestamp = info.getValue();
      return (
        <Typography variant="body2">
          {new Date(Number(timestamp) * 1000).toLocaleString()}
        </Typography>
      );
    },
  }),
  columnHelper.accessor('completed', {
    header: 'Status',
    cell: (info) => {
      const job = info.row.original;
      if (isOptimisticJob(job)) {
        return (
          <span className="px-2 py-1 rounded text-xs bg-blue-500/20 text-blue-400 animate-pulse">
            Confirming
          </span>
        );
      }
      const completed = info.getValue();
      return (
        <span
          className={twMerge(
            'px-2 py-1 rounded text-xs',
            completed
              ? 'bg-green-500/20 text-green-400'
              : 'bg-yellow-500/20 text-yellow-400',
          )}
        >
          {completed ? 'Completed' : 'Pending'}
        </span>
      );
    },
  }),
  columnHelper.accessor('resultCount', {
    header: '# Results',
    cell: (info) => <Typography variant="body2">{info.getValue()}</Typography>,
  }),
];

export const JobHistoryTable: FC<Props> = ({ jobs, isLoading }) => {
  const [selectedJob, setSelectedJob] = useState<JobCall | null>(null);

  const table = useReactTable({
    data: jobs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [{ id: 'submittedAt', desc: true }],
      pagination: { pageSize: 10 },
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        <SkeletonLoader className="h-10" />
        <SkeletonLoader className="h-10" />
        <SkeletonLoader className="h-10" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-8">
        <Typography variant="body1" className="text-mono-100">
          No jobs submitted yet. Submit a job above to get started.
        </Typography>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-mono-60 dark:border-mono-140"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left py-3 px-4 text-mono-100 font-medium"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
                <th className="text-left py-3 px-4 text-mono-100 font-medium">
                  Actions
                </th>
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-mono-40 dark:border-mono-160 hover:bg-mono-20 dark:hover:bg-mono-170"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-3 px-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                <td className="py-3 px-4">
                  <Button
                    variant="utility"
                    size="sm"
                    onClick={() => setSelectedJob(row.original)}
                  >
                    View Results
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between mt-4">
          <Typography variant="body2" className="text-mono-100">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </Typography>
          <div className="flex gap-2">
            <Button
              variant="utility"
              size="sm"
              onClick={() => table.previousPage()}
              isDisabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="utility"
              size="sm"
              onClick={() => table.nextPage()}
              isDisabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {selectedJob && (
        <JobResultsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </>
  );
};

export default JobHistoryTable;
