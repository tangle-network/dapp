'use client';

import { BN } from '@polkadot/util';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Avatar,
  AvatarGroup,
  fuzzyFilter,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { AnySubstrateAddress } from '../../types/utils';
import { HeaderCell } from '../tableCells';

type Asset = {
  id: string;
  token: string;
  pool: string[];
  tvl: BN;
  stakeAPY: number;
  myStake: BN;
};

const columnHelper = createColumnHelper<Asset>();

const columns = [
  columnHelper.accessor('id', {
    header: () => (
      <HeaderCell
        title="Asset ID"
        className="justify-start text-mono-120 dark:text-mono-100"
        titleVariant="body2"
      />
    ),
    cell: (props) => {
      return (
        <Typography variant="body2" className="text-mono-200 dark:text-mono-0">
          {props.getValue()}
        </Typography>
      );
    },
  }),
  columnHelper.accessor('token', {
    header: () => (
      <HeaderCell
        title="Token"
        className="justify-center text-mono-120 dark:text-mono-100"
        titleVariant="body2"
        tooltip="Token"
      />
    ),
    cell: (props) => {
      return (
        <Typography variant="body2" className="text-mono-200 dark:text-mono-0">
          {props.getValue()}
        </Typography>
      );
    },
  }),
  columnHelper.accessor('pool', {
    header: () => (
      <HeaderCell
        title="Pool"
        className="justify-center text-mono-120 dark:text-mono-100"
        titleVariant="body2"
        tooltip="Pool(s)"
      />
    ),
    cell: (props) => {
      return (
        <AvatarGroup>
          {props.getValue().map((address, index) => (
            <Avatar key={index} value={address} />
          ))}
        </AvatarGroup>
      );
    },
  }),
  columnHelper.accessor('tvl', {
    header: () => (
      <HeaderCell
        title="TVL"
        className="justify-center text-mono-120 dark:text-mono-100"
        titleVariant="body2"
        tooltip="TVL"
      />
    ),
    cell: (props) => {
      return (
        // TODO: Should be a TokenAmountCell.
        <Typography variant="body2" className="text-mono-200 dark:text-mono-0">
          {props.getValue().toString()}
        </Typography>
      );
    },
  }),
  columnHelper.accessor('stakeAPY', {
    header: () => (
      <HeaderCell
        title="Stake APY"
        className="justify-center text-mono-120 dark:text-mono-100"
        titleVariant="body2"
        tooltip="APY %"
      />
    ),
    cell: (props) => {
      return (
        <Typography variant="body2" className="text-mono-200 dark:text-mono-0">
          {props.getValue() + ' %'}
        </Typography>
      );
    },
  }),
  columnHelper.accessor('myStake', {
    header: () => (
      <HeaderCell
        title="My Stake"
        className="justify-center text-mono-120 dark:text-mono-100"
        titleVariant="body2"
        tooltip="My stake"
      />
    ),
    cell: (props) => {
      return (
        // TODO: Should be a TokenAmountCell.
        <Typography variant="body2" className="text-mono-200 dark:text-mono-0">
          {props.getValue().toString()}
        </Typography>
      );
    },
  }),
];

const AssetTable: FC = () => {
  // TODO: Mock data.
  const pools = [
    '0x3a7f9e8c14b7d2f5',
    '0xd5c4a2b1f3e8c7d9',
  ] as AnySubstrateAddress[];

  const data: Asset[] = [
    {
      id: '31234',
      token: 'tgDOT_A',
      pool: pools,
      tvl: new BN(100),
      stakeAPY: 0.1,
      myStake: new BN(100),
    },
    {
      id: '31235',
      token: 'tgDOT_B',
      pool: pools,
      tvl: new BN(123),
      stakeAPY: 0.2,
      myStake: new BN(123),
    },
    {
      id: '31236',
      token: 'tgDOT_C',
      pool: pools,
      tvl: new BN(321),
      stakeAPY: 0.3,
      myStake: new BN(321),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="h-fit bg-mono-20 dark:bg-mono-200 rounded-2xl py-3 px-2">
      <Table
        thClassName="!bg-inherit border-t-0 bg-mono-0 !px-3 !py-2 whitespace-nowrap"
        trClassName="!bg-inherit"
        tdClassName="!bg-inherit border-none !px-3 !py-3 whitespace-nowrap"
        tableProps={table}
        totalRecords={data.length}
      />
    </div>
  );
};

export default AssetTable;
