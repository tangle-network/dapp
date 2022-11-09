import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  Table as RTTable,
} from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import { ChevronDown, ExternalLinkLine, TokenIcon } from '@webb-tools/icons';
import {
  Button,
  fuzzyFilter,
  KeyValueWithButton,
  TokenPair,
  Typography,
  Table,
  shortenString,
} from '@webb-tools/webb-ui-components';
import { SpendNoteDataType } from './types';
import { randRecentDate } from '@ngneat/falso';
import { useSpendNotes } from '../../hooks';
import { EmptyTable } from '../../components/tables';

const columnHelper = createColumnHelper<SpendNoteDataType>();

const columns: ColumnDef<SpendNoteDataType, any>[] = [
  columnHelper.accessor('chain', {
    header: 'Chain',
    cell: (props) => <TokenIcon size="lg" name={props.getValue<string>()} />,
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

  columnHelper.accessor('balance', {
    header: 'Available Balance',
    cell: (props) => (
      <Typography variant="body1" fw="bold">
        {props.getValue()}
      </Typography>
    ),
  }),

  columnHelper.accessor('createdTime', {
    header: 'Created',
    cell: (props) => formatDistanceToNow(props.getValue<Date>()),
  }),

  columnHelper.accessor('subsequentDeposits', {
    header: 'Subsequent deposits',
    cell: (props) => (
      <Typography ta="center" variant="body1">
        {props.getValue()}
      </Typography>
    ),
  }),

  columnHelper.accessor('note', {
    header: 'Note',
    cell: (props) => (
      <KeyValueWithButton
        shortenFn={(note: string) => shortenString(note, 4)}
        isHiddenLabel
        size="sm"
        keyValue={props.getValue()}
      />
    ),
  }),

  columnHelper.accessor('assetsUrl', {
    header: '',
    cell: () => {
      return (
        <Button variant="utility" size="sm" className="p-2">
          <ChevronDown className="!fill-current" />
        </Button>
      );
    },
  }),
];

const assetsUrl = 'https://webb.tools';

const data: SpendNoteDataType[] = [
  {
    chain: 'matic',
    token1Symbol: 'WebbETH',
    token2Symbol: 'WETH',
    assetsUrl,
    createdTime: randRecentDate(),
    subsequentDeposits: 0,
    note: 'webb://v1:vanchor/1099511628196:1099511628196/0xc3393b00a5c6a7250a5ee7ef99f0a06ff29bc18f:0xc3393b00a5c6a7250a5ee7ef99f0a06ff29bc18f/00000100000001a4:00000000000000000de0b6b3a7640000:215beaaaf3c9789e7fceda50314e2c2448c0faa12d0a0f15bf1ba20bea484cda:002b9d68d5bdddf2f16fdaa209a1947ff9430a644381576a70ffe39309f736d7/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbETH&denom=18&amount=1000000000000000000',
    balance: 0.654,
  },
  {
    chain: 'matic',
    token1Symbol: 'WebbETH',
    token2Symbol: 'WETH',
    assetsUrl,
    createdTime: randRecentDate(),
    subsequentDeposits: 8,
    note: 'webb://v1:vanchor/1099511628196:1099511628196/0xc3393b00a5c6a7250a5ee7ef99f0a06ff29bc18f:0xc3393b00a5c6a7250a5ee7ef99f0a06ff29bc18f/00000100000001a4:00000000000000000de0b6b3a7640000:215beaaaf3c9789e7fceda50314e2c2448c0faa12d0a0f15bf1ba20bea484cda:002b9d68d5bdddf2f16fdaa209a1947ff9430a644381576a70ffe39309f736d7/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbETH&denom=18&amount=1000000000000000000',
    balance: 0.22,
  },
  {
    chain: 'matic',
    token1Symbol: 'WebbUSDC',
    token2Symbol: 'USDT',
    assetsUrl,
    createdTime: randRecentDate(),
    subsequentDeposits: 88,
    note: 'webb://v1:vanchor/1099511628196:1099511628196/0xc3393b00a5c6a7250a5ee7ef99f0a06ff29bc18f:0xc3393b00a5c6a7250a5ee7ef99f0a06ff29bc18f/00000100000001a4:00000000000000000de0b6b3a7640000:215beaaaf3c9789e7fceda50314e2c2448c0faa12d0a0f15bf1ba20bea484cda:002b9d68d5bdddf2f16fdaa209a1947ff9430a644381576a70ffe39309f736d7/?curve=Bn254&width=5&exp=5&hf=Poseidon&backend=Circom&token=webbETH&denom=18&amount=1000000000000000000',
    balance: 500,
  },
];

export const SpendNotesTableContainer = () => {
  const data = useSpendNotes();

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
        title="No spend notes found"
        description="Don't see your spend note?"
        buttonText="Upload spend Notes"
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-lg bg-mono-0 dark:bg-mono-180">
      <Table
        thClassName="border-t-0 bg-mono-0 dark:bg-mono-160"
        tdClassName="min-w-max"
        tableProps={table as RTTable<unknown>}
        isPaginated
        totalRecords={data.length}
      />
    </div>
  );
};
