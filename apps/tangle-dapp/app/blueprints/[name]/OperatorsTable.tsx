'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { getExplorerURI } from '@webb-tools/api-provider-environment/transaction/utils';
import {
  Avatar,
  ExternalLinkIcon,
  getRoundedAmountString,
  shortenString,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import LSTTokenIcon from '../../../components/LSTTokenIcon';
import { TableStatus } from '../../../components/TableStatus';
import useNetworkStore from '../../../context/useNetworkStore';
import { ExplorerType } from '../../../types';
import { Operator } from '../../../types/blueprint';
import { getSortAddressOrIdentityFnc } from '../../../utils/table';
import TableCellWrapper from './TableCellWrapper';
import useOperators from './useOperators';

const columnHelper = createColumnHelper<Operator>();

const staticColumns = [
  columnHelper.accessor('restakersCount', {
    header: () => 'Restakers',
    cell: (props) => (
      <TableCellWrapper>
        <Typography
          variant="body1"
          fw="bold"
          className="text-mono-200 dark:text-mono-0"
        >
          {props.getValue()}
        </Typography>
      </TableCellWrapper>
    ),
  }),
  columnHelper.accessor('concentration', {
    header: () => 'Concentration',
    cell: (props) => (
      <TableCellWrapper>
        <Typography
          variant="body1"
          fw="bold"
          className="text-mono-200 dark:text-mono-0"
        >
          {props.getValue().toFixed(2)}%
        </Typography>
      </TableCellWrapper>
    ),
  }),
  columnHelper.accessor('liquidity', {
    header: () => 'Liquidity',
    cell: (props) => (
      <TableCellWrapper>
        <div>
          <Typography
            variant="body1"
            fw="bold"
            className="text-mono-200 dark:text-mono-0"
          >
            {getRoundedAmountString(props.getValue().amount)}
          </Typography>
          <Typography
            variant="body1"
            className="text-mono-120 dark:text-mono-100"
          >
            ${getRoundedAmountString(props.getValue().usdValue)}
          </Typography>
        </div>
      </TableCellWrapper>
    ),
    sortingFn: (rowA, rowB) => {
      return rowA.original.liquidity.amount - rowB.original.liquidity.amount;
    },
  }),
  columnHelper.accessor('vaults', {
    header: () => 'Vaults',
    cell: (props) => (
      <TableCellWrapper removeBorder>
        <div className="flex items-center -space-x-2">
          {props
            .getValue()
            .sort() // sort alphabetically
            .map((vault, index) => (
              <LSTTokenIcon key={index} name={vault} />
            ))}
        </div>
      </TableCellWrapper>
    ),
    enableSorting: false,
  }),
];

const OperatorsTable: FC = () => {
  const { network } = useNetworkStore();
  const operators = useOperators();

  const [sorting, setSorting] = useState<SortingState>([
    { id: 'restakersCount', desc: true },
  ]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('address', {
        header: () => 'Identity',
        cell: (props) => {
          const { address, identityName: identity } = props.row.original;
          const accountExplorerLink = getExplorerURI(
            network.nativeExplorerUrl ?? network.polkadotJsDashboardUrl,
            address,
            'address',
            ExplorerType.Substrate,
          ).toString();

          return (
            <TableCellWrapper className="pl-3">
              <div className="flex-1 flex items-center gap-2">
                <Avatar
                  sourceVariant="address"
                  value={address}
                  theme="substrate"
                  size="lg"
                />

                <div>
                  <Typography variant="h5" fw="bold">
                    {identity === address ? shortenString(address) : identity}
                  </Typography>
                  <div className="flex items-center gap-1">
                    <Typography
                      variant="body2"
                      className="text-mono-100 dark:text-mono-120"
                    >
                      {shortenString(address)}
                    </Typography>
                    <ExternalLinkIcon
                      href={accountExplorerLink}
                      className="fill-mono-100 dark:fill-mono-120"
                    />
                  </div>
                </div>
              </div>
            </TableCellWrapper>
          );
        },
        sortingFn: getSortAddressOrIdentityFnc<Operator>(),
      }),
      ...staticColumns,
    ],
    [network.nativeExplorerUrl, network.polkadotJsDashboardUrl],
  );

  const table = useReactTable({
    data: operators,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    getRowId: (row) => row.address,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  return (
    <div className="space-y-5">
      {/* TODO: add name here */}
      <Typography variant="h4" fw="bold">
        Operators
      </Typography>

      {operators.length === 0 ? (
        <TableStatus
          title="No operators found"
          description="It looks like there is no operator running this Blueprint at the moment."
          icon="⚙️"
          className={twMerge(
            'relative px-6 py-10 rounded-2xl !bg-[unset] border-mono-0 dark:border-mono-160',
            'bg-[linear-gradient(180deg,rgba(255,255,255,0.20)0%,rgba(255,255,255,0.00)100%)]',
            'dark:bg-[linear-gradient(180deg,rgba(43,47,64,0.20)0%,rgba(43,47,64,0.00)100%)]',
            'before:absolute before:inset-0 before:bg-cover before:bg-no-repeat before:opacity-30 before:pointer-events-none',
            "before:bg-[url('/static/assets/blueprints/grid-bg.png')] dark:before:bg-[url('/static/assets/blueprints/grid-bg-dark.png')]",
          )}
        />
      ) : (
        <Table
          tableProps={table}
          title="Operators"
          isPaginated
          className={twMerge(
            'px-6 rounded-2xl overflow-hidden border border-mono-0 dark:border-mono-160',
            'bg-[linear-gradient(180deg,rgba(255,255,255,0.20)0%,rgba(255,255,255,0.00)100%)]',
            'dark:bg-[linear-gradient(180deg,rgba(43,47,64,0.20)0%,rgba(43,47,64,0.00)100%)]',
          )}
          tableClassName="border-separate border-spacing-y-3 pt-3"
          thClassName="py-0 border-t-0 !bg-transparent font-normal text-mono-120 dark:text-mono-100 border-b-0"
          tbodyClassName="!bg-transparent"
          trClassName="group cursor-pointer overflow-hidden rounded-xl"
          tdClassName="border-0 !p-0 first:rounded-l-xl last:rounded-r-xl overflow-hidden"
          paginationClassName="!bg-transparent dark:!bg-transparent pl-6 border-t-0 -mt-2"
        />
      )}
    </div>
  );
};

export default OperatorsTable;
