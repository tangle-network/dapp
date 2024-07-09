'use client';

import { BN } from '@polkadot/util';
import { HexString } from '@polkadot/util/types';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ExternalLinkLine, InformationLine } from '@webb-tools/icons';
import {
  Avatar,
  fuzzyFilter,
  shortenString,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { AnySubstrateAddress } from '../../types/utils';
import GlassCard from '../GlassCard';
import { HeaderCell } from '../tableCells';
import TokenAmountCell from '../tableCells/TokenAmountCell';
import AvatarList from './AvatarList';

type StakedAssetItem = {
  id: HexString;
  validators: AnySubstrateAddress[];
  amount: BN;
};

const columnHelper = createColumnHelper<StakedAssetItem>();

const columns = [
  columnHelper.accessor('id', {
    header: () => <HeaderCell title="Asset ID" className="justify-start" />,
    cell: (props) => {
      // TODO: Get proper href.
      const href = '#';

      return (
        <a href={href} className="flex gap-1 items-center justify-start">
          <Typography variant="body1" fw="normal" className="dark:text-mono-0">
            {shortenString(props.getValue(), 3)}
          </Typography>

          <ExternalLinkLine className="dark:fill-mono-0" />
        </a>
      );
    },
  }),
  columnHelper.accessor('validators', {
    header: () => (
      <HeaderCell title="Validator(s)" className="justify-center" />
    ),
    cell: (props) => {
      return (
        <AvatarList>
          {props.getValue().map((address, index) => (
            <Avatar key={index} value={address} />
          ))}
        </AvatarList>
      );
    },
  }),
  columnHelper.accessor('amount', {
    header: () => <HeaderCell title="Amount" className="justify-center" />,
    cell: (props) => {
      return <TokenAmountCell amount={props.getValue()} tokenSymbol="tgDOT" />;
    },
  }),
];

const StakedAssetsTable: FC = () => {
  // TODO: Mock data.
  const testAddresses = [
    '0x3a7f9e8c14b7d2f5',
    '0xd5c4a2b1f3e8c7d9',
  ] as AnySubstrateAddress[];

  const data: StakedAssetItem[] = [
    {
      id: '0x3a7f9e8c14b7d2f5',
      validators: testAddresses,
      amount: new BN(100),
    },
    {
      id: '0xd5c4a2b1f3e8c7d9',
      validators: testAddresses,
      amount: new BN(123),
    },
    {
      id: '0x9b3e47d8a5c2f1e4',
      validators: testAddresses,
      amount: new BN(321),
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
    <GlassCard className="space-y-2">
      <Typography variant="body1" fw="bold" className="dark:text-mono-0">
        Staked Assets
      </Typography>

      <div className="min-h-[300px]">
        <Table
          thClassName="!bg-inherit border-t-0 bg-mono-0 !px-3 !py-2 whitespace-nowrap"
          trClassName="!bg-inherit"
          tdClassName="!bg-inherit !px-3 !py-2 whitespace-nowrap"
          tableProps={table}
          totalRecords={data.length}
        />
      </div>

      <div className="flex items-start gap-1">
        <InformationLine className="dark:fill-mono-0" />

        <Typography variant="body3" fw="normal">
          Select the token to unstake to receive &apos;Unstake NFT&apos;
          representing your assets. Redeem after the unbonding period to claim
          funds.{' '}
          <a className="underline" href="#">
            Learn More
          </a>
        </Typography>
      </div>
    </GlassCard>
  );
};

export default StakedAssetsTable;
