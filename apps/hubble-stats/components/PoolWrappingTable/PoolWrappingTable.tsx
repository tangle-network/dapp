'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { chainsConfig } from '@webb-tools/dapp-config/chains';
import { CornerDownRightLine, TokenIcon } from '@webb-tools/icons';
import {
  ChainChip,
  Table,
  Typography,
  fuzzyFilter,
} from '@webb-tools/webb-ui-components';
import cx from 'classnames';
import { FC, useMemo } from 'react';

import { getShortenChainName, getSortedTypedChainIds } from '../../utils';
import { HeaderCell, NumberCell } from '../tableCells';
import { PoolWrappingDataType, PoolWrappingTableProps } from './types';

const columnHelper = createColumnHelper<PoolWrappingDataType>();

const staticColumns = [
  columnHelper.accessor('symbol', {
    header: () => null,
    cell: (props) => {
      const isSubToken = !props.row.getCanExpand();
      return (
        <div className={cx('flex items-center gap-1', { 'pl-2': isSubToken })}>
          {isSubToken && <CornerDownRightLine />}
          {/* Token Icon */}
          <TokenIcon
            name={isSubToken ? props.row.original.symbol : 'webb'}
            size="lg"
          />

          {/* Symbol */}
          <Typography
            variant="body1"
            fw="bold"
            className="text-mono-200 dark:text-mono-0"
          >
            {props.row.original.symbol}
          </Typography>

          {/* Composition Percentage */}
          {isSubToken && props.row.original.compositionPercentage && (
            <Typography
              variant="body2"
              fw="bold"
              className="!text-[12px] text-mono-120 dark:text-mono-80 uppercase"
            >
              {props.row.original.compositionPercentage}%
            </Typography>
          )}
        </div>
      );
    },
  }),
  columnHelper.accessor('aggregate', {
    header: () => (
      <HeaderCell
        title="Aggregate"
        className="text-mono-200 dark:text-mono-0"
      />
    ),
    cell: (props) => {
      const currency = props.row.original.symbol;
      return <NumberCell value={props.getValue()} suffix={` ${currency}`} />;
    },
  }),
];

const PoolWrappingTable: FC<PoolWrappingTableProps> = ({
  typedChainIds = [],
  data = [],
  prefixUnit = '',
}) => {
  const sortedTypedChainIds = useMemo(
    () => getSortedTypedChainIds(typedChainIds),
    [typedChainIds]
  );

  const columns = useMemo(
    () => [
      ...staticColumns,
      ...sortedTypedChainIds.map((typedChainId) =>
        columnHelper.accessor('chainsData', {
          id: typedChainId.toString(),
          header: () => (
            <div className="w-full text-center">
              <ChainChip
                chainName={chainsConfig[typedChainId].name}
                chainType={chainsConfig[typedChainId].group}
                // shorten the title to last word of the chain name
                title={getShortenChainName(typedChainId)}
              />
            </div>
          ),
          cell: (props) => {
            const currency = props.row.original.symbol;

            return typeof props.row.original.chainsData[typedChainId] ===
              'number' ? (
              <NumberCell
                value={props.row.original.chainsData[typedChainId]}
                prefix={prefixUnit}
                suffix={` ${currency}`}
              />
            ) : (
              <Typography variant="body1" ta="center">
                *
              </Typography>
            );
          },
        })
      ),
    ],
    [sortedTypedChainIds, prefixUnit]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      expanded: true,
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    getSubRows: (row) => row.tokens,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  if (typedChainIds.length === 0) {
    return (
      <Typography variant="body1">No network token data available</Typography>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-lg border-mono-40 dark:border-mono-160">
      <Table
        tableClassName="lg:table-fixed block overflow-x-auto max-w-[-moz-fit-content] max-w-fit md:table md:max-w-none"
        thClassName="lg:first:w-[200px] border-t-0 bg-mono-0 border-r first:px-3 last:border-r-0 last:pr-2"
        tdClassName="border-r last:border-r-0 first:px-3 last:pr-2"
        tableProps={table}
        totalRecords={data.length}
      />
    </div>
  );
};

export default PoolWrappingTable;
