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
import { makeExplorerUrl } from '@webb-tools/api-provider-environment/transaction/utils';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import { ExplorerType } from '@webb-tools/tangle-shared-ui/types';
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
import { TableVariant } from '@webb-tools/webb-ui-components/components/Table/types';
import { Link } from 'react-router';
import { FC, useMemo, useState } from 'react';

import { IS_PRODUCTION_ENV } from '../../constants/env';
import { PagePath, Validator } from '../../types';
import calculateCommission from '../../utils/calculateCommission';
import { AmountFormatStyle } from '../../utils/formatDisplayAmount';
import pluralize from '../../utils/pluralize';
import {
  getSortAddressOrIdentityFnc,
  sortBnValueForNomineeOrValidator,
} from '../../utils/table';
import { HeaderCell, StringCell } from '../tableCells';
import PercentageCell from '../tableCells/PercentageCell';
import TokenAmountCell from '../tableCells/TokenAmountCell';
import { ValidatorTableProps } from './types';

const columnHelper = createColumnHelper<Validator>();

const getTableColumns = (isWaiting?: boolean) => [
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
            <TokenAmountCell
              amount={props.getValue()}
              formatStyle={AmountFormatStyle.SHORT}
            />
          ),
          sortingFn: sortBnValueForNomineeOrValidator,
        }),
        columnHelper.accessor('selfStakeAmount', {
          header: () => (
            <HeaderCell title="Self-staked" className="justify-start" />
          ),
          cell: (props) => <TokenAmountCell amount={props.getValue()} />,
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
      <PercentageCell fractional={calculateCommission(props.getValue())} />
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
              <Link to={`${PagePath.NOMINATION}/${props.getValue()}`}>
                <Button variant="link" size="sm">
                  DETAILS
                </Button>
              </Link>
            </div>
          ),
        }),
      ]),
];

const ValidatorTable: FC<ValidatorTableProps> = ({
  data,
  isWaiting,
  searchValue,
}) => {
  const { network } = useNetworkStore();

  const [sorting, setSorting] = useState<SortingState>(() => {
    if (isWaiting) {
      return [];
    }

    return [{ id: 'totalStakeAmount', desc: true }];
  });

  const columns = useMemo(
    () => [
      columnHelper.accessor('address', {
        header: () => <HeaderCell title="Identity" className="justify-start" />,
        cell: (props) => {
          const address = props.getValue();
          const identity = props.row.original.identityName;
          const accountExplorerLink = makeExplorerUrl(
            network.nativeExplorerUrl ?? network.polkadotJsDashboardUrl,
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
                iconClassName="!fill-mono-160 dark:!fill-mono-80"
              />

              <ExternalLinkIcon
                href={accountExplorerLink}
                className="fill-mono-160 dark:fill-mono-80"
              />
            </div>
          );
        },
        sortingFn: getSortAddressOrIdentityFnc<Validator>(),
        filterFn: (row, _, filterValue) => {
          const { address, identityName } = row.original;
          return (
            address.toLowerCase().includes(filterValue.toLowerCase()) ||
            identityName.toLowerCase().includes(filterValue.toLowerCase())
          );
        },
      }),
      ...getTableColumns(isWaiting),
    ],
    [isWaiting, network.nativeExplorerUrl, network.polkadotJsDashboardUrl],
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
      columnFilters: searchValue
        ? [
            {
              id: 'address',
              value: searchValue,
            },
          ]
        : [],
    },
    getRowId: (row) => row.address,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  return (
    <Table
      variant={TableVariant.DEFAULT}
      trClassName={IS_PRODUCTION_ENV ? '' : 'cursor-pointer'}
      tableProps={table}
      isPaginated
      title={pluralize('validator', data.length !== 1)}
    />
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
