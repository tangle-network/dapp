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
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import LsTokenIcon from '../../../components/LsTokenIcon';
import TableCellWrapper from '../../../components/TableCellWrapper';
import { Asset, Vault } from '../../../types/blueprint';
import useVaults from './useVaults';

const vaultColumnHelper = createColumnHelper<Vault>();
const assetColumnHelper = createColumnHelper<Asset>();

const vaultColumns = [
  vaultColumnHelper.accessor('name', {
    header: () => 'Vault',
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
  vaultColumnHelper.accessor('apy', {
    header: () => 'APY',
    cell: (props) => (
      <TableCellWrapper>
        <Typography
          variant="body1"
          fw="bold"
          className="text-mono-200 dark:text-mono-0"
        >
          {props.getValue().toFixed(2)}%
        </Typography>
      </TableCellWrapper>
    ),
  }),
  vaultColumnHelper.accessor('tokensCount', {
    header: () => 'Tokens',
    cell: (props) => (
      <TableCellWrapper>
        <Typography
          variant="body1"
          fw="bold"
          className="text-mono-200 dark:text-mono-0"
        >
          {props.getValue()}
        </Typography>
      </TableCellWrapper>
    ),
  }),
  vaultColumnHelper.accessor('liquidity', {
    header: () => 'Liquidity',
    cell: (props) => (
      <TableCellWrapper removeBorder>
        <div>
          <Typography
            variant="body1"
            fw="bold"
            className="text-mono-200 dark:text-mono-0"
          >
            {getRoundedAmountString(props.getValue().amount)}
          </Typography>
          <Typography
            variant="body1"
            className="text-mono-120 dark:text-mono-100"
          >
            ${getRoundedAmountString(props.getValue().usdValue)}
          </Typography>
        </div>
      </TableCellWrapper>
    ),
  }),
  vaultColumnHelper.accessor('lstToken', {
    header: () => null,
    cell: ({ row }) => (
      <TableCellWrapper removeBorder>
        <div className="flex-1 flex items-center gap-2 justify-end">
          {/* TODO: add proper href */}
          <Link href="#" passHref>
            <Button
              variant="utility"
              className="body4 uppercase"
              onClick={(e) => {
                e.stopPropagation(); // prevent row click
              }}
            >
              Restake
            </Button>
          </Link>

          <Button
            variant="utility"
            isJustIcon
            isDisabled={!(row.original.tokensCount > 0)}
          >
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

const vaultAssetColumns = [
  assetColumnHelper.accessor('id', {
    header: () => 'Asset ID',
    cell: (props) => props.getValue(),
  }),
  assetColumnHelper.accessor('symbol', {
    header: () => 'Asset Symbol',
    cell: (props) => props.getValue(),
  }),
  assetColumnHelper.accessor('tvl', {
    header: () => 'TVL',
    cell: (props) => getRoundedAmountString(props.getValue()),
  }),
  assetColumnHelper.accessor('myStake', {
    header: () => 'My Stake',
    cell: (props) => getRoundedAmountString(props.getValue()),
  }),
];

const VaultsAndAssetsTable: FC = () => {
  const vaults = useVaults();

  return (
    <VaultsTable
      vaultsData={vaults}
      vaultsColumns={vaultColumns}
      assetsColumns={vaultAssetColumns}
      title="Total Value Locked"
      initialSorting={[{ id: 'apy', desc: true }]}
    />
  );
};

export default VaultsAndAssetsTable;
