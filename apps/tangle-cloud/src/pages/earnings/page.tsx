/**
 * Developer earnings dashboard - view earnings from blueprints.
 */

import { FC, useMemo } from 'react';
import { Link } from 'react-router';
import { useAccount } from 'wagmi';
import {
  Button,
  Card,
  CardVariant,
  Typography,
  SkeletonLoader,
} from '@tangle-network/ui-components';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  flexRender,
} from '@tanstack/react-table';
import {
  CoinsLineIcon,
  LineChartIcon,
  WalletLineIcon,
} from '@tangle-network/icons';
import {
  useDeveloperEarnings,
  formatEarningsAmount,
  type BlueprintEarnings,
} from '@tangle-network/tangle-shared-ui/data/graphql';
import { PagePath } from '../../types';
import ErrorMessage from '../../components/ErrorMessage';

const columnHelper = createColumnHelper<BlueprintEarnings>();

const EarningsPage: FC = () => {
  const { isConnected } = useAccount();
  const { data, isLoading, error } = useDeveloperEarnings();

  const columns = useMemo(
    () => [
      columnHelper.accessor('blueprintName', {
        header: 'Blueprint',
        cell: (info) => (
          <div>
            <Typography variant="body1" fw="semibold">
              {info.getValue()}
            </Typography>
            <Typography variant="body3" className="text-mono-100">
              ID: {info.row.original.blueprintId.toString()}
            </Typography>
          </div>
        ),
      }),
      columnHelper.accessor('totalEarned', {
        header: 'Total Earned',
        cell: (info) => (
          <Typography variant="body1" fw="semibold">
            {formatEarningsAmount(info.getValue())} TNT
          </Typography>
        ),
      }),
      columnHelper.accessor('serviceCount', {
        header: 'Services',
        cell: (info) => (
          <Typography variant="body2">{info.getValue()}</Typography>
        ),
      }),
      columnHelper.accessor('jobCount', {
        header: 'Jobs Completed',
        cell: (info) => (
          <Typography variant="body2">{info.getValue()}</Typography>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: (info) => {
          const blueprint = info.row.original;
          return (
            <Link
              to={PagePath.BLUEPRINTS_DETAILS.replace(
                ':id',
                blueprint.blueprintId.toString(),
              )}
            >
              <Button variant="utility" size="sm">
                View Blueprint
              </Button>
            </Link>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: data?.blueprints ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Typography variant="h4" fw="bold">
            Developer Earnings
          </Typography>
          <Typography variant="body2" className="text-mono-100">
            View earnings from your blueprints and services.
          </Typography>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant={CardVariant.GLASS} className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-500/20">
              <CoinsLineIcon className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <Typography variant="body2" className="text-mono-100">
                Total Earned
              </Typography>
              {isLoading ? (
                <SkeletonLoader className="h-8 w-24" />
              ) : (
                <Typography variant="h4" fw="bold">
                  {data?.summary
                    ? formatEarningsAmount(data.summary.totalEarned)
                    : '0'}{' '}
                  TNT
                </Typography>
              )}
            </div>
          </div>
        </Card>

        <Card variant={CardVariant.GLASS} className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/20">
              <WalletLineIcon className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <Typography variant="body2" className="text-mono-100">
                Active Blueprints
              </Typography>
              {isLoading ? (
                <SkeletonLoader className="h-8 w-16" />
              ) : (
                <Typography variant="h4" fw="bold">
                  {data?.summary?.blueprintCount ?? 0}
                </Typography>
              )}
            </div>
          </div>
        </Card>

        <Card variant={CardVariant.GLASS} className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/20">
              <LineChartIcon className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <Typography variant="body2" className="text-mono-100">
                Total Services
              </Typography>
              {isLoading ? (
                <SkeletonLoader className="h-8 w-16" />
              ) : (
                <Typography variant="h4" fw="bold">
                  {data?.summary?.totalServiceCount ?? 0}
                </Typography>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Earnings by Blueprint */}
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          Earnings by Blueprint
        </Typography>

        {isLoading ? (
          <div className="space-y-2">
            <SkeletonLoader className="h-12" />
            <SkeletonLoader className="h-12" />
            <SkeletonLoader className="h-12" />
          </div>
        ) : error ? (
          <ErrorMessage>{error.message}</ErrorMessage>
        ) : data?.blueprints && data.blueprints.length > 0 ? (
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
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
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
          </>
        ) : (
          <div className="text-center py-12">
            <CoinsLineIcon className="w-12 h-12 text-mono-100 mx-auto mb-4" />
            <Typography variant="h5" fw="semibold">
              No Earnings Yet
            </Typography>
            <Typography variant="body1" className="text-mono-100 mt-2">
              Create a blueprint using the CLI and operators will earn rewards
              from their services. You'll earn a share of all service fees.
            </Typography>
          </div>
        )}
      </Card>

      {/* How Earnings Work */}
      <Card variant={CardVariant.GLASS} className="p-6">
        <Typography variant="h5" fw="bold" className="mb-4">
          How Developer Earnings Work
        </Typography>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Typography variant="body1" fw="semibold" className="mb-2">
              1. Create Blueprints
            </Typography>
            <Typography variant="body2" className="text-mono-100">
              Define service blueprints that operators can register with. Set
              pricing models and job definitions.
            </Typography>
          </div>
          <div>
            <Typography variant="body1" fw="semibold" className="mb-2">
              2. Operators Register
            </Typography>
            <Typography variant="body2" className="text-mono-100">
              Operators register with your blueprint and stake collateral.
              Customers deploy services using your blueprint.
            </Typography>
          </div>
          <div>
            <Typography variant="body1" fw="semibold" className="mb-2">
              3. Earn Fees
            </Typography>
            <Typography variant="body2" className="text-mono-100">
              You earn a percentage of all service fees and job payments made to
              services using your blueprint.
            </Typography>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EarningsPage;
