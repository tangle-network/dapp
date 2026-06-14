/**
 * Table showing job history for a service.
 */

import { type ComponentProps, type FC, useMemo, useState } from 'react';
import { Text } from '../../../components/sandbox/SandboxUi';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from '@tanstack/react-table';
import {
  Button as SandboxButton,
  EmptyState,
  SkeletonTable,
} from '@tangle-network/sandbox-ui/primitives';
import { StatusPill, statusToneFor } from '../../../components/chrome';
import type { JobCall } from '@tangle-network/tangle-shared-ui/data/graphql';
import { isOptimisticJob } from '@tangle-network/tangle-shared-ui/data/graphql/useJobs';
import type { BlueprintJobDefinition } from '@tangle-network/tangle-shared-ui/data/services';
import { JobResultsModal } from './JobResultsModal';

interface Props {
  jobs: JobCall[];
  isLoading: boolean;
  jobDefinitions?: BlueprintJobDefinition[];
}

const columnHelper = createColumnHelper<JobCall>();

type ButtonProps = Omit<
  ComponentProps<typeof SandboxButton>,
  'variant' | 'size'
> & {
  variant?: ComponentProps<typeof SandboxButton>['variant'] | 'utility';
  size?: ComponentProps<typeof SandboxButton>['size'];
  isDisabled?: boolean;
};

const Button: FC<ButtonProps> = ({
  variant,
  size,
  isDisabled,
  disabled,
  ...props
}) => (
  <SandboxButton
    variant={variant === 'utility' ? 'outline' : variant}
    size={size}
    disabled={disabled || isDisabled}
    {...props}
  />
);

const makeColumns = (jobDefinitions?: BlueprintJobDefinition[]) => [
  columnHelper.accessor('callId', {
    header: 'Call ID',
    cell: (info) => {
      const job = info.row.original;
      if (isOptimisticJob(job)) {
        return <StatusPill tone="pending">Confirming</StatusPill>;
      }
      return (
        <Text variant="body2" className="font-mono">
          #{info.getValue().toString()}
        </Text>
      );
    },
  }),
  columnHelper.accessor('jobIndex', {
    header: 'Job ID',
    cell: (info) => {
      const index = info.getValue();
      const jobName = jobDefinitions?.[index]?.name;
      return (
        <Text variant="body2">
          Job {index}
          {jobName ? `: ${jobName}` : ''}
        </Text>
      );
    },
  }),
  columnHelper.accessor('submitter', {
    header: 'Submitter',
    cell: (info) => {
      const address = info.getValue();
      return (
        <Text variant="body2" className="font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </Text>
      );
    },
  }),
  columnHelper.accessor('submittedAt', {
    header: 'Submitted At',
    cell: (info) => {
      const timestamp = info.getValue();
      return (
        <Text variant="body2">
          {new Date(Number(timestamp) * 1000).toLocaleString()}
        </Text>
      );
    },
  }),
  columnHelper.accessor('completed', {
    header: 'Status',
    cell: (info) => {
      const job = info.row.original;
      if (isOptimisticJob(job)) {
        return <StatusPill tone="pending">Confirming</StatusPill>;
      }
      const completed = info.getValue();
      const label = completed ? 'Completed' : 'Pending';
      return (
        <StatusPill tone={statusToneFor('job', label)}>{label}</StatusPill>
      );
    },
  }),
  columnHelper.accessor('resultCount', {
    header: '# Results',
    cell: (info) => <Text variant="body2">{info.getValue()}</Text>,
  }),
];

export const JobHistoryTable: FC<Props> = ({
  jobs,
  isLoading,
  jobDefinitions,
}) => {
  const [selectedJob, setSelectedJob] = useState<JobCall | null>(null);

  const columns = useMemo(() => makeColumns(jobDefinitions), [jobDefinitions]);

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
    return <SkeletonTable rows={3} />;
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No jobs submitted yet"
        description="Submit a job above to get started."
      />
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-border">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="text-left py-3 px-4 text-muted-foreground font-medium"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </th>
                ))}
                <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                  Actions
                </th>
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-border hover:bg-muted/60"
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
          <Text variant="body2" className="text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </Text>
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
          jobDefinition={jobDefinitions?.[selectedJob.jobIndex]}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </>
  );
};

export default JobHistoryTable;
