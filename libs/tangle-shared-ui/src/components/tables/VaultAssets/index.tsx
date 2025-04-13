import { BN } from '@polkadot/util';
import { makeExplorerUrl } from '@tangle-network/api-provider-environment/transaction/utils';
import { TokenIcon } from '@tangle-network/icons';
import {
  EMPTY_VALUE_PLACEHOLDER,
  ExternalLinkIcon,
  isEvmAddress,
  Typography,
} from '@tangle-network/ui-components';
import { Table } from '@tangle-network/ui-components/components/Table';
import { TableVariant } from '@tangle-network/ui-components/components/Table/types';
import calculateBnRatio from '@tangle-network/ui-components/utils/calculateBnRatio';
import {
  AmountFormatStyle,
  formatDisplayAmount,
} from '@tangle-network/ui-components/utils/formatDisplayAmount';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  type TableOptions,
  useReactTable,
} from '@tanstack/react-table';
import cx from 'classnames';
import { FC, useMemo } from 'react';
import { Pie, PieChart, ResponsiveContainer } from 'recharts';
import { twMerge } from 'tailwind-merge';
import useNetworkStore from '../../../context/useNetworkStore';
import HeaderCell from '../HeaderCell';
import type { Props, VaultAssetData } from './types';
import useIsAccountConnected from '../../../hooks/useIsAccountConnected';

const COLUMN_HELPER = createColumnHelper<VaultAssetData>();

const getColumns = (isAccountConnected: boolean, evmExplorerUrl?: string) => [
  COLUMN_HELPER.accessor('id', {
    header: () => <HeaderCell title="Asset" />,
    cell: (props) => {
      const assetId = props.row.original.id;

      // Only EVM assets have an explorer URL
      const href =
        evmExplorerUrl && isEvmAddress(assetId)
          ? makeExplorerUrl(evmExplorerUrl, assetId, 'address', 'web3')
          : null;

      return (
        <p className="flex items-center gap-2">
          <TokenIcon name={props.row.original.symbol} size="xl" />

          <Typography
            variant="body1"
            className="dark:text-mono-0"
            component="span"
          >
            {props.row.original.name}
          </Typography>

          {href && <ExternalLinkIcon href={href} />}
        </p>
      );
    },
  }),
  COLUMN_HELPER.accessor('available', {
    header: () => <HeaderCell title="Wallet Balance" />,
    cell: (props) => {
      const value = props.getValue();
      const tokenSymbol = props.row.original.symbol;

      if (BN.isBN(value)) {
        const fmtBalance = formatDisplayAmount(
          value,
          props.row.original.decimals,
          AmountFormatStyle.SHORT,
        );

        return `${fmtBalance} ${tokenSymbol}`;
      }

      return isAccountConnected ? `0 ${tokenSymbol}` : EMPTY_VALUE_PLACEHOLDER;
    },
  }),
  COLUMN_HELPER.accessor('deposited', {
    header: () => <HeaderCell title="Deposited Balance" />,
    cell: (props) => {
      const value = props.getValue();
      const tokenSymbol = props.row.original.symbol;

      if (BN.isBN(value)) {
        return formatDisplayAmount(
          value,
          props.row.original.decimals,
          AmountFormatStyle.SHORT,
        );
      }

      return isAccountConnected ? `0 ${tokenSymbol}` : EMPTY_VALUE_PLACEHOLDER;
    },
  }),
];

const VaultAssetsTable: FC<Props> = ({
  data,
  isShown,
  depositCapacity,
  tvl,
  decimals,
}) => {
  const evmExplorerUrl = useNetworkStore(
    (store) => store.network2?.evmExplorerUrl,
  );

  const isAccountConnected = useIsAccountConnected();

  const table = useReactTable(
    useMemo(
      () =>
        ({
          data,
          columns: getColumns(isAccountConnected, evmExplorerUrl),
          getCoreRowModel: getCoreRowModel(),
          getSortedRowModel: getSortedRowModel(),
          autoResetPageIndex: false,
          enableSortingRemoval: false,
        }) satisfies TableOptions<VaultAssetData>,
      [data, evmExplorerUrl, isAccountConnected],
    ),
  );

  const capacityPercentage = useMemo(() => {
    return tvl === undefined || depositCapacity === undefined
      ? null
      : calculateBnRatio(tvl, depositCapacity);
  }, [tvl, depositCapacity]);

  const chartData = useMemo(() => {
    return [
      {
        value: capacityPercentage ?? 0,
        fill: '#5953F9',
      },
      {
        value: capacityPercentage ? 1 - capacityPercentage : 1,
        fill: '#9C9FB0',
      },
    ];
  }, [capacityPercentage]);

  const fmtTvl = useMemo(() => {
    return tvl === undefined
      ? 0
      : formatDisplayAmount(tvl, decimals, AmountFormatStyle.SHORT);
  }, [tvl, decimals]);

  const fmtDepositCap = useMemo(() => {
    return depositCapacity === undefined
      ? '∞'
      : formatDisplayAmount(depositCapacity, decimals, AmountFormatStyle.SHORT);
  }, [depositCapacity, decimals]);

  return (
    <div className="px-3 pb-3 flex gap-4">
      <Table
        variant={TableVariant.GLASS_INNER}
        tableProps={table}
        title={pluralize('asset', data.length !== 1)}
        tableClassName="relative"
        thClassName={cx(
          'border-b-0 sticky top-0',
          'backdrop-blur-sm shadow-2xl',
          'first:rounded-tl-2xl last:rounded-tr-2xl',
        )}
        className={twMerge(
          isShown ? 'animate-slide-down' : 'animate-slide-up',
          'bg-mono-40/50 dark:bg-mono-200 flex-auto px-0',
          'overflow-x-hidden overflow-y-hidden',
        )}
        tableWrapperClassName={cx(
          'overflow-y-auto h-[320px] overflow-x-hidden',
        )}
      />

      <div
        className={cx(
          'flex-initial w-1/4 bg-mono-40/50 dark:bg-mono-200 p-3',
          'rounded-2xl flex flex-col',
        )}
      >
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              innerRadius={50}
              startAngle={90}
              endAngle={-270}
            />
          </PieChart>
        </ResponsiveContainer>

        <Typography
          ta="center"
          variant="body1"
          className="font-semibold text-mono-200 dark:text-mono-0"
        >
          TVL / Deposit Capacity
        </Typography>

        <Typography variant="body1" ta="center">
          {fmtTvl === null
            ? `${fmtDepositCap}`
            : `${fmtTvl} / ${fmtDepositCap}`}
        </Typography>
      </div>
    </div>
  );
};

export default VaultAssetsTable;
