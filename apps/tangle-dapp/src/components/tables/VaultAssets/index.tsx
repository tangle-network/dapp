import { BN } from '@polkadot/util';
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  type TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import { makeExplorerUrl } from '@webb-tools/api-provider-environment/transaction/utils';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import {
  ExternalLinkIcon,
  isEvmAddress,
  Typography,
} from '@webb-tools/webb-ui-components';
import { Table } from '@webb-tools/webb-ui-components/components/Table';
import { TableVariant } from '@webb-tools/webb-ui-components/components/Table/types';
import { EMPTY_VALUE_PLACEHOLDER } from '@webb-tools/webb-ui-components/constants';
import {
  AmountFormatStyle,
  formatDisplayAmount,
} from '@webb-tools/webb-ui-components/utils/formatDisplayAmount';
import pluralize from '@webb-tools/webb-ui-components/utils/pluralize';
import { FC, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import type { Props, VaultAssetData } from './types';

const COLUMN_HELPER = createColumnHelper<VaultAssetData>();

const getColumns = (evmExplorerUrl?: string) => [
  COLUMN_HELPER.accessor('id', {
    header: () => 'Asset',
    cell: (props) => {
      const assetId = props.row.original.id;

      // Only EVM assets have an explorer URL
      const href =
        evmExplorerUrl && isEvmAddress(assetId)
          ? makeExplorerUrl(evmExplorerUrl, assetId, 'address', 'web3')
          : null;

      return (
        <p className="flex items-center gap-2">
          <Typography
            variant="body2"
            className="dark:text-mono-0"
            component="span"
          >
            {props.row.original.symbol}
          </Typography>

          {href && <ExternalLinkIcon href={href} />}
        </p>
      );
    },
  }),
  COLUMN_HELPER.accessor('available', {
    header: () => 'Available',
    cell: (props) => {
      const value = props.getValue();

      if (BN.isBN(value)) {
        return formatDisplayAmount(
          value,
          props.row.original.decimals,
          AmountFormatStyle.SHORT,
        );
      }

      return EMPTY_VALUE_PLACEHOLDER;
    },
  }),
  COLUMN_HELPER.accessor('totalDeposits', {
    header: () => 'Deposits',
    cell: (props) => {
      const value = props.getValue();

      if (BN.isBN(value)) {
        return formatDisplayAmount(
          value,
          props.row.original.decimals,
          AmountFormatStyle.SHORT,
        );
      }

      return EMPTY_VALUE_PLACEHOLDER;
    },
  }),
  COLUMN_HELPER.accessor('tvl', {
    header: () => 'TVL',
    cell: (props) => {
      const value = props.getValue();

      if (BN.isBN(value)) {
        return formatDisplayAmount(
          value,
          props.row.original.decimals,
          AmountFormatStyle.SHORT,
        );
      }

      return EMPTY_VALUE_PLACEHOLDER;
    },
  }),
];

const VaultAssetsTable: FC<Props> = ({ data, isShown }) => {
  const evmExplorerUrl = useNetworkStore(
    (store) => store.network.evmExplorerUrl,
  );

  const table = useReactTable(
    useMemo(
      () =>
        ({
          data,
          columns: getColumns(evmExplorerUrl),
          getCoreRowModel: getCoreRowModel(),
          getSortedRowModel: getSortedRowModel(),
          autoResetPageIndex: false,
          enableSortingRemoval: false,
        }) satisfies TableOptions<VaultAssetData>,
      [data, evmExplorerUrl],
    ),
  );

  return (
    <Table
      variant={TableVariant.GLASS_INNER}
      tableProps={table}
      title={pluralize('asset', data.length !== 1)}
      className={twMerge(
        isShown ? 'animate-slide-down' : 'animate-slide-up',
        'bg-mono-20 dark:bg-mono-180 -mt-1',
      )}
    />
  );
};

export default VaultAssetsTable;
