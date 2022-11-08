import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  Table as RTTable,
  useReactTable,
} from '@tanstack/react-table';
import {
  AddBoxLineIcon,
  ExternalLinkLine,
  SendPlanLineIcon,
  TokenIcon,
  WalletLineIcon,
} from '@webb-tools/icons';
import {
  Button,
  fuzzyFilter,
  Table,
  TokenPair,
  Typography,
} from '@webb-tools/webb-ui-components';
import { ShieldAssetType, ShieldedAssetDataType } from './types';

const columnHelper = createColumnHelper<ShieldedAssetDataType>();

const columns: ColumnDef<ShieldedAssetDataType, any>[] = [
  columnHelper.accessor('chain', {
    header: 'Chain',
    cell: (props) => <TokenIcon size="lg" name={props.getValue<string>()} />,
  }),

  columnHelper.accessor('assets', {
    header: 'Shielded Asset',
    cell: (props) => {
      const tokensPair = props.getValue<[ShieldAssetType, ShieldAssetType]>();
      const tokenUrl = props.row.original.assetsUrl;

      return (
        <p className="flex items-center space-x-1.5">
          <TokenPair
            token1Symbol={tokensPair[0].symbol}
            token2Symbol={tokensPair[1].symbol}
          />

          <a href={tokenUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLinkLine />
          </a>
        </p>
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
    assets: [
      {
        symbol: 'eth',
        name: 'WebbETH',
      },
      {
        symbol: 'weth',
        name: 'WETH',
      },
    ],
    assetsUrl: 'https://webb.tools',
    availableBalance: 1.645,
    numberOfNotesFound: 6,
  },
  {
    chain: 'matic',
    assets: [
      {
        symbol: 'usdc',
        name: 'WebbUSDC',
      },
      {
        symbol: 'usdt',
        name: 'USDT',
      },
    ],
    assetsUrl: 'https://webb.tools',
    availableBalance: 1500.0,
    numberOfNotesFound: 3,
  },
  {
    chain: 'matic',
    assets: [
      {
        symbol: 'usdc',
        name: 'WebbUSDC',
      },
      {
        symbol: 'dai',
        name: 'DAI',
      },
    ],
    assetsUrl: 'https://webb.tools',
    availableBalance: 1433.12,
    numberOfNotesFound: 3,
  },
  {
    chain: 'op',
    assets: [
      {
        symbol: 'eth',
        name: 'WebbETH',
      },
      {
        symbol: 'weth',
        name: 'WETH',
      },
    ],
    assetsUrl: 'https://webb.tools',
    availableBalance: 12.12,
    numberOfNotesFound: 2,
  },
  {
    chain: 'op',
    assets: [
      {
        symbol: 'usdc',
        name: 'WebbUSDC',
      },
      {
        symbol: 'usdt',
        name: 'USDT',
      },
    ],
    assetsUrl: 'https://webb.tools',
    availableBalance: 1234.12,
    numberOfNotesFound: 2,
  },
];

export const ShieldedAssetsTableContainer = () => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
  });

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
