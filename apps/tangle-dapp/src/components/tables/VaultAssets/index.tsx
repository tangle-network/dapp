import { BN } from '@polkadot/util';
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  type TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import getTVLToDisplay from '@webb-tools/tangle-shared-ui/utils/getTVLToDisplay';
import { AmountFormatStyle } from '@webb-tools/webb-ui-components';
import { Table } from '@webb-tools/webb-ui-components/components/Table';
import { TableVariant } from '@webb-tools/webb-ui-components/components/Table/types';
import pluralize from '@webb-tools/webb-ui-components/utils/pluralize';
import { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import TokenAmountCell from '../../tableCells/TokenAmountCell';
import type { Props, VaultAssetData } from './types';

const columnHelper = createColumnHelper<VaultAssetData>();

const columns = [
  columnHelper.accessor('id', {
    header: () => 'Asset ID',
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor('symbol', {
    header: () => 'Asset Symbol',
    cell: (props) => props.getValue(),
  }),
  columnHelper.accessor('tvl', {
    header: () => 'TVL',
    cell: (props) => getTVLToDisplay(props.getValue()),
  }),
  columnHelper.accessor('selfStake', {
    header: () => 'My Stake',
    cell: (props) => (
      <TokenAmountCell
        amount={new BN(props.getValue().toString())}
        decimals={props.row.original.decimals}
        formatStyle={AmountFormatStyle.SHORT}
      />
    ),
  }),
];

const VaultAssetsTable: FC<Props> = ({ data, isShown }) => {
  const table = useReactTable(
    useMemo(
      () =>
        ({
          data,
          columns,
          getCoreRowModel: getCoreRowModel(),
          getSortedRowModel: getSortedRowModel(),
          initialState: {
            sorting: [{ id: 'tvl', desc: true }],
          },
          autoResetPageIndex: false,
          enableSortingRemoval: false,
        }) satisfies TableOptions<VaultAssetData>,
      [data],
    ),
  );

  // TODO: Check styling after max depth issue is fixed.
  return (
    <Table
      variant={TableVariant.DEFAULT}
      tableProps={table}
      title={pluralize('asset', data.length !== 1)}
      className={twMerge(
        'rounded-2xl overflow-hidden bg-mono-20 dark:bg-mono-200',
        isShown ? 'animate-slide-down' : 'animate-slide-up',
      )}
      thClassName="font-normal !bg-transparent border-t-0 border-b text-mono-120 dark:text-mono-100"
      tbodyClassName="!bg-transparent"
      tdClassName="!bg-inherit border-t-0"
    />
  );
};

export default VaultAssetsTable;
