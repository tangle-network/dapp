import { FC, useMemo } from 'react';
import {
  createColumnHelper,
  useReactTable,
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
import { TokenIcon } from '@webb-tools/icons';
import { chainsConfig, ChainBase } from '@webb-tools/dapp-config/chains';

import { TokenCompositionType, NetworkTableProps } from './types';
import { HeaderCell, NumberCell } from '../table';
import { convertChainChipTitle } from '../../utils';

const NetworkTable: FC<NetworkTableProps> = ({ chains, data }) => {
  const columnHelper = useMemo(
    () => createColumnHelper<TokenCompositionType>(),
    []
  );

  const columns = useMemo<ColumnDef<TokenCompositionType, any>[]>(
    () => [
      columnHelper.accessor('tokenName', {
        header: () => null,
        cell: (props) => (
          <div className="flex items-center gap-1">
            <TokenIcon name={props.row.original.tokenName} size="lg" />
            <Typography variant="body1" fw="black" className="uppercase">
              {props.row.original.tokenSymbol}
            </Typography>
            <Typography
              variant="body2"
              fw="bold"
              className="text-mono-120 dark:text-mono-80"
            >
              {props.row.original.tokenComposition}%
            </Typography>
          </div>
        ),
      }),
      columnHelper.accessor('tokenAggregate', {
        header: () => <HeaderCell title="Aggregate" />,
        cell: (props) => <NumberCell value={props.getValue()} prefix="$" />,
      }),
      ...chains.map((chainId) =>
        columnHelper.accessor('chainsData', {
          id: chainId.toString(),
          header: () => (
            <div className="w-full text-center">
              <ChainChip
                chainName={chainsConfig[chainId].name}
                chainType={chainsConfig[chainId].base as ChainBase}
                title={convertChainChipTitle(chainsConfig[chainId].name)}
              />
            </div>
          ),
          cell: (props) =>
            props.row.original.chainsData[chainId] ? (
              <NumberCell
                value={props.row.original.chainsData[chainId]}
                prefix="$"
              />
            ) : (
              <Typography variant="body1" ta="center">
                *
              </Typography>
            ),
        })
      ),
    ],
    [chains, columnHelper]
  );

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
  });

  if (chains.length === 0) {
    return <Typography variant="body1">No network data available</Typography>;
  }

  return (
    <div className="overflow-hidden rounded-lg border border-mono-40 dark:border-mono-160">
      <Table
        thClassName="border-t-0 bg-mono-0 border-r last:border-r-0 first:pl-4 last:pr-2"
        tdClassName="border-r last:border-r-0 first:pl-4 last:pr-2"
        tableProps={table as RTTable<unknown>}
        totalRecords={data.length}
      />
    </div>
  );
};

export default NetworkTable;
