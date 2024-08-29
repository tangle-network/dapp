'use client';

import { createColumnHelper } from '@tanstack/react-table';
import { ChevronUp } from '@webb-tools/icons';
import {
  Button,
  getRoundedAmountString,
  Typography,
  VaultsTable,
} from '@webb-tools/webb-ui-components';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

import useVaults from '../../app/liquid-staking/useVaults';
import StatItem from '../../components/StatItem';
import TableCellWrapper from '../../components/tables/TableCellWrapper';
import { Asset, Vault } from '../../types/liquidStaking';
import LsTokenIcon from '../LsTokenIcon';

const vaultColumnHelper = createColumnHelper<Vault>();
const assetsColumnHelper = createColumnHelper<Asset>();

const vaultColumns = [
  vaultColumnHelper.accessor('name', {
    header: () => 'Token',
    cell: (props) => (
      <TableCellWrapper className="pl-3">
        <div className="flex items-center gap-2">
          <LsTokenIcon name={props.row.original.lstToken} size="lg" />
          <Typography variant="h5" className="whitespace-nowrap">
            {props.getValue()}
          </Typography>
        </div>
      </TableCellWrapper>
    ),
    sortingFn: (rowA, rowB) => {
      // NOTE: the sorting is reversed by default
      return rowB.original.name.localeCompare(rowA.original.name);
    },
    sortDescFirst: true,
  }),
  vaultColumnHelper.accessor('tvl', {
    header: () => 'TVL',
    cell: (props) => (
      <TableCellWrapper>
        <StatItem
          title={`${getRoundedAmountString(props.getValue().value)}`}
          subtitle={`${props.getValue().valueInUSD}`}
          removeBorder
        />
      </TableCellWrapper>
    ),
  }),
  vaultColumnHelper.accessor('derivativeTokens', {
    header: () => 'Derivative Tokens',
    cell: (props) => (
      <TableCellWrapper>
        <StatItem
          title={`${props.getValue()}`}
          subtitle="Tokens"
          removeBorder
        />
      </TableCellWrapper>
    ),
  }),
  vaultColumnHelper.accessor('myStake', {
    header: () => 'My Stake',
    cell: (props) => (
      <TableCellWrapper removeBorder>
        <StatItem
          title={`${getRoundedAmountString(props.getValue().value)}`}
          subtitle={`${props.getValue().valueInUSD}`}
          removeBorder
        />
      </TableCellWrapper>
    ),
  }),
  vaultColumnHelper.accessor('assets', {
    header: () => null,
    cell: ({ row }) => (
      <TableCellWrapper removeBorder>
        <div className="flex items-center justify-end flex-1 gap-2">
          {/* TODO: add proper href */}
          <Link href="#" passHref>
            <Button
              variant="utility"
              className="uppercase body4"
              onClick={(e) => {
                e.stopPropagation(); // prevent row click
              }}
            >
              Stake
            </Button>
          </Link>

          <Button variant="utility" isJustIcon>
            <div
              className={twMerge(
                '!text-current transition-transform duration-300 ease-in-out',
                row.getIsExpanded() ? 'rotate-180' : '',
              )}
            >
              <ChevronUp className={twMerge('!fill-current')} />
            </div>
          </Button>
        </div>
      </TableCellWrapper>
    ),
    enableSorting: false,
  }),
];

const assetsColumns = [
  assetsColumnHelper.accessor('id', {
    header: () => 'Asset ID',
    cell: (props) => (
      <Typography
        variant="body2"
        fw="normal"
        className="text-mono-200 dark:text-mono-0"
      >
        {props.getValue()}
      </Typography>
    ),
  }),
  assetsColumnHelper.accessor('token', {
    header: () => 'Token',
    cell: (props) => (
      <Typography
        variant="body2"
        fw="normal"
        className="text-mono-200 dark:text-mono-0"
      >
        {props.getValue()}
      </Typography>
    ),
  }),
  assetsColumnHelper.accessor('tvl', {
    header: () => 'TVL',
    cell: (props) => (
      <Typography
        variant="body2"
        fw="normal"
        className="text-mono-200 dark:text-mono-0"
      >
        {getRoundedAmountString(props.getValue())}
      </Typography>
    ),
  }),
  assetsColumnHelper.accessor('apy', {
    header: () => 'APY',
    cell: (props) => (
      <Typography
        variant="body2"
        fw="normal"
        className="text-mono-200 dark:text-mono-0"
      >
        {getRoundedAmountString(props.getValue()) + '%'}
      </Typography>
    ),
  }),
  assetsColumnHelper.accessor('myStake', {
    header: () => 'My Stake',
    cell: (props) => (
      <Typography
        variant="body2"
        fw="normal"
        className="text-mono-200 dark:text-mono-0"
      >
        {getRoundedAmountString(props.getValue())}
      </Typography>
    ),
  }),
];

const VaultsAndAssetsTable = () => {
  const vaults = useVaults();

  return (
    <VaultsTable
      vaultsData={vaults}
      vaultsColumns={vaultColumns}
      assetsColumns={assetsColumns}
      title="Liquid Staking Vaults"
      initialSorting={[{ id: 'apy', desc: true }]}
    />
  );
};

export default VaultsAndAssetsTable;
