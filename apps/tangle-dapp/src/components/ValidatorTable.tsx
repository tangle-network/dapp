import { sortByAddressOrIdentity } from '@tangle-network/tangle-shared-ui/components/tables/utils';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { Validator } from '@tangle-network/tangle-shared-ui/types';
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
} from '@tangle-network/ui-components';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import sortByComparable from '@tangle-network/ui-components/utils/sortByComparable';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { IS_PRODUCTION_ENV } from '../constants/env';
import { PagePath } from '../types';
import calculateCommission from '../utils/calculateCommission';
import filterTableRowBy from '../utils/filterTableRowBy';
import { HeaderCell, StringCell } from './tableCells';
import PercentageCell from './tableCells/PercentageCell';
import TokenAmountCell from './tableCells/TokenAmountCell';

const COLUMN_HELPER = createColumnHelper<Validator>();

const getAdditionalColumns = (isWaiting?: boolean) => [
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
          sortingFn: sortByComparable((row) => row.totalStakeAmount),
        }),
        COLUMN_HELPER.accessor('selfStakeAmount', {
          header: () => (
            <HeaderCell title="Self-staked" className="justify-start" />
          ),
          cell: (props) => <TokenAmountCell amount={props.getValue()} />,
          sortingFn: sortByComparable((row) => row.selfStakeAmount),
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
    sortingFn: sortByComparable((row) => row.commission),
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

const ValidatorTable = ({ data, isWaiting, searchValue }: Props) => {
  const createExplorerAccountUrl = useNetworkStore(
    (store) => store.network.createExplorerAccountUrl,
  );

  const [sorting, setSorting] = useState<SortingState>(() => {
    if (isWaiting) {
      return [];
    }

    return [{ id: 'totalStakeAmount' satisfies keyof Validator, desc: true }];
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
          const accountExplorerUrl = createExplorerAccountUrl(address);

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

              {accountExplorerUrl !== null && (
                <ExternalLinkIcon
                  href={accountExplorerUrl}
                  className="fill-mono-160 dark:fill-mono-80"
                />
              )}
            </div>
          );
        },
      }),
      ...getAdditionalColumns(isWaiting),
    ],
    [createExplorerAccountUrl, isWaiting],
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
