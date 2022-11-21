import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  Table as RTTable,
  useReactTable,
} from '@tanstack/react-table';
import {
  AddBoxLineIcon,
  ChainIcon,
  ExternalLinkLine,
  SendPlanLineIcon,
  WalletLineIcon,
} from '@webb-tools/icons';
import {
  Button,
  fuzzyFilter,
  Table,
  TokenPair,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { EmptyTable } from '../../components/tables';
import {
  ShieldedAssetDataType,
  ShieldedAssetsTableContainerProps,
} from './types';

const columnHelper = createColumnHelper<ShieldedAssetDataType>();

const columns: ColumnDef<ShieldedAssetDataType, any>[] = [
  columnHelper.accessor('chain', {
    header: 'Chain',
    cell: (props) => <ChainIcon size="lg" name={props.getValue<string>()} />,
  }),

  columnHelper.accessor('token1Symbol', {
    header: 'Shielded Asset',
    cell: (props) => {
      const token1Symbol = props.getValue<string>();
      const token2Symbol = props.row.original.token2Symbol;
      const tokenUrl = props.row.original.assetsUrl;

      return (
        <div className="flex items-center space-x-1.5">
          <TokenPair token1Symbol={token1Symbol} token2Symbol={token2Symbol} />

          <a href={tokenUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLinkLine />
          </a>
        </div>
      );
    },
  }),

  columnHelper.accessor('availableBalance', {
    header: 'Available Balance',
    cell: (props) => (
      <Typography variant="body1" fw="bold">
        {props.getValue()}
      </Typography>
    ),
  }),

  columnHelper.accessor('numberOfNotesFound', {
    header: 'Notes Found',
    cell: (props) => (
      <Typography
        variant="body1"
        fw="bold"
        className="text-blue-70 dark:text-blue-50"
      >
        {props.getValue()}
      </Typography>
    ),
  }),

  columnHelper.accessor('assetsUrl', {
    header: 'Action',
    cell: () => {
      return (
        <div className="flex items-center space-x-1">
          <Button variant="utility" size="sm" className="p-2">
            <AddBoxLineIcon className="!fill-current" />
          </Button>

          <Button variant="utility" size="sm" className="p-2">
            <SendPlanLineIcon className="!fill-current" />
          </Button>

          <Button variant="utility" size="sm" className="p-2">
            <WalletLineIcon className="!fill-current" />
          </Button>
        </div>
      );
    },
  }),
];

// Temporary hardcoded data for table displaying
const data: ShieldedAssetDataType[] = [
  {
    chain: 'matic',
    token1Symbol: 'WebbETH',
    token2Symbol: 'WETH',
    assetsUrl: 'https://webb.tools',
    availableBalance: 1.645,
    numberOfNotesFound: 6,
  },
  {
    chain: 'matic',
    token1Symbol: 'WebbUSDC',
    token2Symbol: 'USDT',
    assetsUrl: 'https://webb.tools',
    availableBalance: 1500.0,
    numberOfNotesFound: 3,
  },
  {
    chain: 'matic',
    token1Symbol: 'WebbUSDC',
    token2Symbol: 'DAI',
    assetsUrl: 'https://webb.tools',
    availableBalance: 1433.12,
    numberOfNotesFound: 3,
  },
  {
    chain: 'op',
    token1Symbol: 'WebbETH',
    token2Symbol: 'WETH',
    assetsUrl: 'https://webb.tools',
    availableBalance: 12.12,
    numberOfNotesFound: 2,
  },
  {
    chain: 'op',
    token1Symbol: 'WebbUSDC',
    token2Symbol: 'USDT',
    assetsUrl: 'https://webb.tools',
    availableBalance: 1234.12,
    numberOfNotesFound: 2,
  },
];

export const ShieldedAssetsTableContainer: FC<
  ShieldedAssetsTableContainerProps
> = ({ data = [], onUploadSpendNote }) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
  });

  if (!data.length) {
    return (
      <EmptyTable
        title="No assets found"
        description="Don't see your assets?"
        buttonText="Upload spend Notes"
        onClick={onUploadSpendNote}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-mono-0 dark:bg-mono-180">
      <Table
        thClassName="border-t-0 bg-mono-0 dark:bg-mono-160"
        tableProps={table as RTTable<unknown>}
        isPaginated
        totalRecords={data.length}
      />
    </div>
  );
};
