'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
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
import { FC, useMemo } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import { ExplorerType, PagePath, Validator } from '../../types';
import { HeaderCell, StringCell } from '../tableCells';
import { ValidatorTableProps } from './types';

const columnHelper = createColumnHelper<Validator>();

const staticColumns = [
  // TODO: active Services column
  columnHelper.accessor('restaked', {
    header: () => <HeaderCell title="Restaked" />,
    cell: (props) => <StringCell value={props.getValue()} />,
  }),
  columnHelper.accessor('effectiveAmountStaked', {
    header: () => <HeaderCell title="Effective amount staked" />,
    cell: (props) => <StringCell value={props.getValue()} />,
  }),
  columnHelper.accessor('selfStaked', {
    header: () => <HeaderCell title="Self-staked" />,
    cell: (props) => <StringCell value={props.getValue()} />,
  }),
  columnHelper.accessor('delegations', {
    header: () => <HeaderCell title="Nominations" />,
    cell: (props) => <StringCell value={props.getValue()} />,
  }),
  columnHelper.accessor('commission', {
    header: () => <HeaderCell title="Commission" />,
    cell: (props) => (
      <StringCell value={Number(props.getValue()).toFixed(2) + '%'} />
    ),
  }),
  columnHelper.accessor('address', {
    id: 'details',
    header: () => null,
    cell: (props) => (
      <div className="flex justify-center items-center">
        <Link href={`${PagePath.NOMINATION}/${props.getValue()}`}>
          <Button variant="link" size="sm">
            DETAILS
          </Button>
        </Link>
      </div>
    ),
  }),
];

const ValidatorTable: FC<ValidatorTableProps> = ({ data }) => {
  const { network } = useNetworkStore();

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
            ExplorerType.Substrate
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
      }),
      ...staticColumns,
    ],
    [network.polkadotExplorerUrl]
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
  });

  return (
    <div className="overflow-hidden border rounded-lg bg-mono-0 dark:bg-mono-180 border-mono-40 dark:border-mono-160">
      <Table
        thClassName="border-t-0 bg-mono-0"
        trClassName={
          process.env.NODE_ENV === 'production' ? '' : 'cursor-pointer'
        }
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
