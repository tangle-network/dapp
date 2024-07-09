'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { getExplorerURI } from '@webb-tools/api-provider-environment/transaction/utils';
import {
  Avatar,
  Button,
  CopyWithTooltip,
  ExternalLinkIcon,
  fuzzyFilter,
  shortenString,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import Link from 'next/link';
import { FC, useMemo, useState } from 'react';

import { IS_PRODUCTION_ENV } from '../../constants/env';
import useNetworkStore from '../../context/useNetworkStore';
import { ExplorerType, PagePath, Validator } from '../../types';
import calculateCommission from '../../utils/calculateCommission';
import {
  sortAddressOrIdentityForNomineeOrValidator,
  sortBnValueForNomineeOrValidator,
} from '../../utils/table';
import { HeaderCell, StringCell } from '../tableCells';
import TokenAmountCell from '../tableCells/TokenAmountCell';
import { ValidatorTableProps } from './types';

const columnHelper = createColumnHelper<Validator>();

const getStaticColumns = (isWaiting?: boolean) => [
  // Hide the effective amount staked and self-staked columns on waiting validators tab
  // as they don't have values for these columns
  ...(isWaiting
    ? []
    : [
        columnHelper.accessor('totalStakeAmount', {
          header: () => (
            <HeaderCell
              title="Effective amount staked"
              className="justify-start"
            />
          ),
          cell: (props) => (
            <TokenAmountCell amount={props.getValue()} className="text-start" />
          ),
          sortingFn: sortBnValueForNomineeOrValidator,
        }),
        columnHelper.accessor('selfStakeAmount', {
          header: () => (
            <HeaderCell title="Self-staked" className="justify-start" />
          ),
          cell: (props) => (
            <TokenAmountCell amount={props.getValue()} className="text-start" />
          ),
          sortingFn: sortBnValueForNomineeOrValidator,
        }),
      ]),
  columnHelper.accessor('nominatorCount', {
    header: () => <HeaderCell title="Nominations" className="justify-start" />,
    cell: (props) => (
      <StringCell value={props.getValue().toString()} className="text-start" />
    ),
  }),
  columnHelper.accessor('commission', {
    header: () => <HeaderCell title="Commission" />,
    cell: (props) => (
      <StringCell
        value={calculateCommission(props.getValue()).toFixed(2) + '%'}
        className="text-start"
      />
    ),
    sortingFn: sortBnValueForNomineeOrValidator,
  }),
  // TODO: Hide this for live app for now
  ...(IS_PRODUCTION_ENV
    ? []
    : [
        columnHelper.accessor('address', {
          id: 'details',
          header: () => null,
          cell: (props) => (
            <div className="flex items-center justify-center">
              <Link href={`${PagePath.NOMINATION}/${props.getValue()}`}>
                <Button variant="link" size="sm">
                  DETAILS
                </Button>
              </Link>
            </div>
          ),
        }),
      ]),
];

const ValidatorTable: FC<ValidatorTableProps> = ({ data, isWaiting }) => {
  const { network } = useNetworkStore();

  const [sorting, setSorting] = useState<SortingState>([
    // Default sorting by total stake amount in descending order
    { id: 'totalStakeAmount', desc: true },
  ]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('address', {
        header: () => <HeaderCell title="Identity" className="justify-start" />,
        cell: (props) => {
          const address = props.getValue();
          const identity = props.row.original.identityName;
          const accountExplorerLink = getExplorerURI(
            network.polkadotExplorerUrl,
            address,
            'address',
            ExplorerType.Substrate,
          ).toString();

          return (
            <div className="flex items-center space-x-1">
              <Avatar
                sourceVariant="address"
                value={address}
                theme="substrate"
              />

              <Typography variant="body1" fw="normal" className="truncate">
                {identity === address
                  ? shortenString(address, 6)
                  : formatIdentity(identity)}
              </Typography>

              <CopyWithTooltip
                textToCopy={address}
                isButton={false}
                className="cursor-pointer"
                iconClassName="!fill-mono-160 dark:!fill-mono-80"
              />

              <ExternalLinkIcon
                href={accountExplorerLink}
                className="fill-mono-160 dark:fill-mono-80"
              />
            </div>
          );
        },
        sortingFn: sortAddressOrIdentityForNomineeOrValidator,
      }),
      ...getStaticColumns(isWaiting),
    ],
    [isWaiting, network.polkadotExplorerUrl],
  );

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
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    enableSortingRemoval: false,
  });

  return (
    <div className="overflow-hidden border rounded-lg bg-mono-0 dark:bg-mono-180 border-mono-40 dark:border-mono-160">
      <Table
        thClassName="border-t-0 bg-mono-0"
        trClassName={IS_PRODUCTION_ENV ? '' : 'cursor-pointer'}
        paginationClassName="bg-mono-0 dark:bg-mono-180 pl-6"
        tableProps={table}
        isPaginated
      />
    </div>
  );
};

export default ValidatorTable;

/* @internal */
function formatIdentity(inputString: string): string {
  if (inputString.length > 15) {
    return `${inputString.slice(0, 12)}...`;
  } else {
    return inputString;
  }
}
