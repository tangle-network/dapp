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
import { sortByAddressOrIdentity } from '@webb-tools/tangle-shared-ui/components/tables/utils';
import useNetworkStore from '@webb-tools/tangle-shared-ui/context/useNetworkStore';
import { ExplorerType } from '@webb-tools/tangle-shared-ui/types';
import {
  AmountFormatStyle,
  Avatar,
  Button,
  CopyWithTooltip,
  ExternalLinkIcon,
  fuzzyFilter,
  shortenString,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import pluralize from '@webb-tools/webb-ui-components/utils/pluralize';
import { Link } from 'react-router';
import { FC, useMemo, useState } from 'react';

import { IS_PRODUCTION_ENV } from '../constants/env';
import { PagePath, Validator } from '../types';
import calculateCommission from '../utils/calculateCommission';
import { HeaderCell, StringCell } from './tableCells';
import PercentageCell from './tableCells/PercentageCell';
import TokenAmountCell from './tableCells/TokenAmountCell';
import sortByBn from '../utils/sortByBn';
import filterTableRowBy from '../utils/filterTableRowBy';

const COLUMN_HELPER = createColumnHelper<Validator>();

const getTableColumns = (isWaiting?: boolean) => [
  // Hide the effective amount staked and self-staked columns on waiting validators tab
  // as they don't have values for these columns
  ...(isWaiting
    ? []
    : [
        COLUMN_HELPER.accessor('totalStakeAmount', {
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
          sortingFn: sortByBn((row) => row.totalStakeAmount),
        }),
        COLUMN_HELPER.accessor('selfStakeAmount', {
          header: () => (
            <HeaderCell title="Self-staked" className="justify-start" />
          ),
          cell: (props) => <TokenAmountCell amount={props.getValue()} />,
          sortingFn: sortByBn((row) => row.selfStakeAmount),
        }),
      ]),
  COLUMN_HELPER.accessor('nominatorCount', {
    header: () => <HeaderCell title="Nominations" className="justify-start" />,
    cell: (props) => (
      <StringCell value={props.getValue().toString()} className="text-start" />
    ),
  }),
  COLUMN_HELPER.accessor('commission', {
    header: () => <HeaderCell title="Commission" />,
    cell: (props) => (
      <PercentageCell percentage={calculateCommission(props.getValue())} />
    ),
    sortingFn: sortByBn((row) => row.commission),
  }),
  // TODO: Hide this for live app for now
  ...(IS_PRODUCTION_ENV
    ? []
    : [
        COLUMN_HELPER.accessor('address', {
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

type Props = {
  isWaiting?: boolean;
  data: Validator[];
  searchValue?: string;
};

const ValidatorTable: FC<Props> = ({ data, isWaiting, searchValue }) => {
  const { network } = useNetworkStore();

  const [sorting, setSorting] = useState<SortingState>(() => {
    if (isWaiting) {
      return [];
    }

    return [{ id: 'totalStakeAmount', desc: true }];
  });

  const columns = useMemo(
    () => [
      COLUMN_HELPER.accessor('address', {
        header: () => <HeaderCell title="Identity" className="justify-start" />,
        sortingFn: sortByAddressOrIdentity<Validator>(),
        filterFn: filterTableRowBy((row) => [row.address, row.identityName]),
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
                {identity !== undefined
                  ? formatIdentity(identity)
                  : shortenString(address, 6)}
              </Typography>

              <CopyWithTooltip
                copyLabel="Copy Address"
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
