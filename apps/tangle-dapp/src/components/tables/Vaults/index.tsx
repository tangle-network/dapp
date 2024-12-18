import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronUp } from '@webb-tools/icons/ChevronUp';
import LsTokenIcon from '@webb-tools/tangle-shared-ui/components/LsTokenIcon';
import TableCellWrapper from '@webb-tools/tangle-shared-ui/components/tables/TableCellWrapper';
import TableStatus from '@webb-tools/tangle-shared-ui/components/tables/TableStatus';
import getTVLToDisplay from '@webb-tools/tangle-shared-ui/utils/getTVLToDisplay';
import Button from '@webb-tools/webb-ui-components/components/buttons/Button';
import { Table } from '@webb-tools/webb-ui-components/components/Table';
import { TableVariant } from '@webb-tools/webb-ui-components/components/Table/types';
import { EMPTY_VALUE_PLACEHOLDER } from '@webb-tools/webb-ui-components/constants';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import formatFractional from '@webb-tools/webb-ui-components/utils/formatFractional';
import { Link } from 'react-router';
import { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { PagePath, QueryParamKey } from '../../../types';
import type { Props, VaultData } from './types';
import sortByLocaleCompare from '../../../utils/sortByLocaleCompare';
import pluralize from '@webb-tools/webb-ui-components/utils/pluralize';

const columnHelper = createColumnHelper<VaultData>();

const columns = [
  columnHelper.accessor('name', {
    header: () => 'Vault',
    cell: (props) => (
      <TableCellWrapper className="pl-3">
        <div className="flex items-center gap-2">
          <LsTokenIcon name={props.row.original.representToken} size="lg" />
          <Typography variant="h5" className="whitespace-nowrap">
            {props.getValue()}
          </Typography>
        </div>
      </TableCellWrapper>
    ),
    sortingFn: sortByLocaleCompare((row) => row.name),
    sortDescFirst: true,
  }),
  columnHelper.accessor('apyPercentage', {
    header: () => 'APY',
    cell: (props) => {
      const value = props.getValue();

      return (
        <TableCellWrapper>
          <Typography
            variant="body1"
            fw="bold"
            className="text-mono-200 dark:text-mono-0"
          >
            {typeof value !== 'number'
              ? EMPTY_VALUE_PLACEHOLDER
              : formatFractional(value)}
          </Typography>
        </TableCellWrapper>
      );
    },
  }),
  columnHelper.accessor('tokensCount', {
    header: () => 'Tokens',
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
  columnHelper.accessor('tvlInUsd', {
    header: () => 'TVL',
    cell: (props) => (
      <TableCellWrapper removeRightBorder>
        <Typography
          variant="body1"
          className="text-mono-120 dark:text-mono-100"
        >
          {getTVLToDisplay(props.getValue())}
        </Typography>
      </TableCellWrapper>
    ),
  }),
  columnHelper.display({
    id: 'actions',
    header: () => null,
    cell: ({ row }) => (
      <TableCellWrapper removeRightBorder>
        <div className="flex items-center justify-end flex-1 gap-2">
          <Link
            to={`${PagePath.RESTAKE_DEPOSIT}?${QueryParamKey.RESTAKE_VAULT}=${row.original.id}`}
          >
            <Button variant="utility" className="uppercase body4">
              Restake
            </Button>
          </Link>

          <Button variant="utility" isJustIcon isDisabled={!row.getCanExpand()}>
            <div
              className={twMerge(
                '!text-current transition-transform duration-300 ease-in-out',
                row.getIsExpanded() ? 'rotate-180' : '',
              )}
            >
              <ChevronUp className="!fill-current" />
            </div>
          </Button>
        </div>
      </TableCellWrapper>
    ),
    enableSorting: false,
  }),
];

const VaultsTable: FC<Props> = ({
  data = [],
  isLoading,
  emptyTableProps,
  loadingTableProps,
  tableProps,
}) => {
  const table = useReactTable(
    useMemo(
      () =>
        ({
          data,
          columns,
          initialState: {
            sorting: [
              {
                id: 'apyPercentage',
                desc: true,
              },
            ],
          },
          getCoreRowModel: getCoreRowModel(),
          getExpandedRowModel: getExpandedRowModel(),
          getSortedRowModel: getSortedRowModel(),
          getPaginationRowModel: getPaginationRowModel(),
          getRowCanExpand: (row) => row.original.tokensCount > 0,
          autoResetPageIndex: false,
          enableSortingRemoval: false,
        }) satisfies TableOptions<VaultData>,
      [data],
    ),
  );

  if (isLoading) {
    return (
      <TableStatus
        title="Loading Vaults"
        description="Please wait while we load the vaults."
        icon="🔄"
        {...loadingTableProps}
        className={loadingTableProps?.className}
      />
    );
  } else if (data.length === 0) {
    return (
      <TableStatus
        title="No Vaults Found"
        description="It looks like there are no vaults at the moment."
        {...emptyTableProps}
        className={emptyTableProps?.className}
      />
    );
  }

  return (
    <Table
      variant={TableVariant.GLASS_OUTER}
      title={pluralize('vault', data.length !== 1)}
      isPaginated
      {...tableProps}
      tableProps={table}
      className={tableProps?.className}
      tableClassName={tableProps?.tableClassName}
      thClassName={tableProps?.thClassName}
      tbodyClassName={tableProps?.tbodyClassName}
      trClassName={tableProps?.trClassName}
      tdClassName={tableProps?.tdClassName}
      paginationClassName={tableProps?.paginationClassName}
    />
  );
};

export default VaultsTable;
