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
import { FC, PropsWithChildren, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import LSTToken from '../../../components/LSTToken';
import useNetworkStore from '../../../context/useNetworkStore';
import { ExplorerType } from '../../../types';
import { Operator } from '../../../types/blueprint';
import { getSortAddressOrIdentityFnc } from '../../../utils/table';
import useOperators from './useOperators';

const columnHelper = createColumnHelper<Operator>();

const staticColumns = [
  columnHelper.accessor('restakersCount', {
    header: () => 'Restakers',
    cell: (props) => (
      <CellContentWrapper>
        <Typography
          variant="body1"
          fw="bold"
          className="text-mono-200 dark:text-mono-0"
        >
          {props.getValue()}
        </Typography>
      </CellContentWrapper>
    ),
  }),
  columnHelper.accessor('concentration', {
    header: () => 'Concentration',
    cell: (props) => (
      <CellContentWrapper>
        <Typography
          variant="body1"
          fw="bold"
          className="text-mono-200 dark:text-mono-0"
        >
          {props.getValue().toFixed(2)}%
        </Typography>
      </CellContentWrapper>
    ),
  }),
  columnHelper.accessor('liquidity', {
    header: () => 'Liquidity',
    cell: (props) => (
      <CellContentWrapper>
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
      </CellContentWrapper>
    ),
  }),
  columnHelper.accessor('vaults', {
    header: () => 'Vaults',
    cell: (props) => (
      <div className="flex items-center -space-x-2">
        {props
          .getValue()
          .sort() // sort alphabetically
          .map((vault, index) => (
            <LSTToken key={index} name={vault} />
          ))}
      </div>
    ),
    enableSorting: false,
  }),
];

const OperatorsTable: FC = () => {
  const { network } = useNetworkStore();
  const operators = useOperators();

  const [sorting, setSorting] = useState<SortingState>([
    // Default sorting by total stake amount in descending order
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
            <div className="flex items-center gap-2 border-r border-mono-60 dark:border-mono-140">
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
        tbodyClassName="space-y-3 !bg-transparent"
        trClassName="bg-mono-0 dark:bg-mono-190 overflow-hidden rounded-xl"
        tdClassName="border-0 !bg-inherit first:rounded-l-xl last:rounded-r-xl pl-3 pr-0 last:pr-3"
        paginationClassName="!bg-transparent dark:!bg-transparent pl-6 border-t-0 -mt-2"
      />
    </div>
  );
};

export default OperatorsTable;

const CellContentWrapper: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex h-[51px] items-center border-r border-mono-60 dark:border-mono-140">
      {children}
    </div>
  );
};
