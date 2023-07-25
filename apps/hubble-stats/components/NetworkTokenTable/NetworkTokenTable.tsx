import { FC, useMemo } from 'react';
import cx from 'classnames';
import {
  useReactTable,
  createColumnHelper,
  getExpandedRowModel,
  getCoreRowModel,
  ColumnDef,
  Table as RTTable,
} from '@tanstack/react-table';
import {
  ChainChip,
  Table,
  fuzzyFilter,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TokenIcon, CornerDownRightLine } from '@webb-tools/icons';
import { chainsConfig, ChainGroup } from '@webb-tools/dapp-config/chains';

import { NetworkTokenType, NetworkTokenTableProps } from './types';
import { HeaderCell, NumberCell } from '../table';
import { getSortedChains } from '../../utils';

const NetworkTokenTable: FC<NetworkTokenTableProps> = ({
  chains,
  data,
  prefixUnit = '$',
}) => {
  const sortedChains = useMemo(() => getSortedChains(chains), [chains]);

  const columnHelper = useMemo(
    () => createColumnHelper<NetworkTokenType>(),
    []
  );

  const columns = useMemo<ColumnDef<NetworkTokenType, any>[]>(
    () => [
      columnHelper.accessor('symbol', {
        header: () => null,
        cell: (props) => {
          const isSubToken = !props.row.getCanExpand();
          return (
            <div
              className={cx('flex items-center gap-1', { 'pl-2': isSubToken })}
            >
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
                className={cx('text-mono-200 dark:text-mono-0', {
                  uppercase: isSubToken,
                })}
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
        cell: (props) => <NumberCell value={props.getValue()} prefix="$" />,
      }),
      ...sortedChains.map((chainId) =>
        columnHelper.accessor('chainsData', {
          id: chainId.toString(),
          header: () => (
            <div className="w-full text-center">
              <ChainChip
                chainName={chainsConfig[chainId].name}
                chainType={chainsConfig[chainId].group as ChainGroup}
                // shorten the title to last word of the chain name
                title={chainsConfig[chainId].name.split(' ').pop()}
              />
            </div>
          ),
          cell: (props) =>
            props.row.original.chainsData[chainId] ? (
              <NumberCell
                value={props.row.original.chainsData[chainId]}
                prefix={prefixUnit}
              />
            ) : (
              <Typography variant="body1" ta="center">
                *
              </Typography>
            ),
        })
      ),
    ],
    [sortedChains, columnHelper, prefixUnit]
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

  if (chains.length === 0) {
    return (
      <Typography variant="body1">No network token data available</Typography>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-mono-40 dark:border-mono-160">
      <Table
        thClassName="border-t-0 bg-mono-0 border-r first:px-3 last:border-r-0 last:pr-2"
        tdClassName="border-r last:border-r-0 first:px-3 last:pr-2"
        tableProps={table as RTTable<unknown>}
        totalRecords={data.length}
      />
    </div>
  );
};

export default NetworkTokenTable;
