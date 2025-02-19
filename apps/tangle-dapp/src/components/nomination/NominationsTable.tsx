import { sortByAddressOrIdentity } from '@tangle-network/tangle-shared-ui/components/tables/utils';
import { Validator } from '@tangle-network/tangle-shared-ui/types';
import {
  AmountFormatStyle,
  Avatar,
  Chip,
  CopyWithTooltip,
  fuzzyFilter,
  shortenString,
  Table,
  Typography,
  ExternalLinkIcon,
} from '@tangle-network/ui-components';
import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { FC, useMemo, useState } from 'react';

import pluralize from '@tangle-network/ui-components/utils/pluralize';
import calculateCommission from '../../utils/calculateCommission';
import sortByBn from '../../utils/sortByBn';
import { HeaderCell, StringCell } from '../tableCells';
import PercentageCell from '../tableCells/PercentageCell';
import TokenAmountCell from '../tableCells/TokenAmountCell';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';

const COLUMN_HELPER = createColumnHelper<Validator>();

const COLUMNS = [
  COLUMN_HELPER.accessor('isActive', {
    header: () => <HeaderCell title="Status" className="justify-start" />,
    cell: (props) => {
      const isActive = props.getValue();
      return (
        <Chip color={isActive ? 'green' : 'yellow'}>
          {isActive ? 'Active' : 'Waiting'}
        </Chip>
      );
    },
    sortingFn: (rowA, _) => {
      const isActiveA = rowA.original.isActive;
      return isActiveA ? 1 : -1;
    },
  }),
  COLUMN_HELPER.accessor('selfStakeAmount', {
    header: () => <HeaderCell title="Self-staked" className="justify-center" />,
    cell: (props) => <TokenAmountCell amount={props.getValue()} />,
    sortingFn: sortByBn((row) => row.selfStakeAmount),
  }),
  COLUMN_HELPER.accessor('totalStakeAmount', {
    header: () => (
      <HeaderCell title="Effective amount staked" className="justify-center" />
    ),
    cell: (props) => (
      <TokenAmountCell
        amount={props.getValue()}
        formatStyle={AmountFormatStyle.SHORT}
      />
    ),
    sortingFn: sortByBn((row) => row.totalStakeAmount),
  }),
  COLUMN_HELPER.accessor('nominatorCount', {
    header: () => <HeaderCell title="Nominations" className="justify-center" />,
    cell: (props) => (
      <StringCell value={props.getValue().toString()} className="text-start" />
    ),
  }),
  COLUMN_HELPER.accessor('commission', {
    header: () => <HeaderCell title="Commission" className="justify-center" />,
    cell: (props) => (
      <PercentageCell percentage={calculateCommission(props.getValue())} />
    ),
    sortingFn: sortByBn((row) => row.commission),
  }),
];

export type NominationsTableProps = {
  nominees: Validator[];
  pageSize: number;
};

const NominationsTable: FC<NominationsTableProps> = ({
  nominees,
  pageSize,
}) => {
  const [sorting, setSorting] = useState<SortingState>([
    // Default sorting by total stake amount in descending order
    { id: 'totalStakeAmount' satisfies keyof Validator, desc: true },
  ]);

  const createExplorerAccountUrl = useNetworkStore(
    (store) => store.network.createExplorerAccountUrl,
  );

  const columns = useMemo(
    () => [
      COLUMN_HELPER.accessor('address', {
        header: () => (
          <HeaderCell title="Validator" className="justify-start" />
        ),
        cell: (props) => {
          const address = props.getValue();
          const identityName = props.row.original.identityName;

          const accountExplorerUrl = createExplorerAccountUrl(address);

          return (
            <div className="flex items-center space-x-2">
              <Avatar sourceVariant="address" value={address} theme="substrate">
                {address}
              </Avatar>

              <Typography variant="body1" fw="normal" className="truncate">
                {identityName === address
                  ? shortenString(address, 6)
                  : (identityName ?? shortenString(address, 6))}
              </Typography>

              <CopyWithTooltip
                copyLabel="Copy Address"
                textToCopy={address}
                isButton={false}
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
        sortingFn: sortByAddressOrIdentity(),
      }),
      ...COLUMNS,
    ],
    [createExplorerAccountUrl],
  );

  const table = useReactTable({
    data: nominees,
    columns: columns,
    initialState: {
      pagination: {
        pageSize,
      },
    },
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
        paginationClassName="bg-mono-0 dark:bg-mono-180 pl-6"
        tableProps={table}
        isPaginated
        totalRecords={nominees.length}
        title={pluralize('nomination', nominees.length !== 1)}
      />
    </div>
  );
};

export default NominationsTable;
