'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { getExplorerURI } from '@webb-tools/api-provider-environment/transaction/utils';
import {
  Avatar,
  CopyWithTooltip,
  ExternalLinkIcon,
  fuzzyFilter,
  shortenString,
  Table,
  Typography,
} from '@webb-tools/webb-ui-components';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

import { SkeletonRow } from '../../../components/skeleton';
import SocialChip from '../../../components/SocialChip';
import { HeaderCell } from '../../../components/tableCells';
import { EMPTY_VALUE_PLACEHOLDER } from '../../../constants';
import useNetworkStore from '../../../context/useNetworkStore';
import { useServiceParticipants } from '../../../data/serviceDetails';
import { ExplorerType, ServiceParticipant } from '../../../types';

interface ParticipantTableProps {
  className?: string;
}

const columnHelper = createColumnHelper<ServiceParticipant>();

const addressColumn = columnHelper.accessor('address', {
  header: () => <HeaderCell title="Socials" className="justify-start" />,
  cell: (props) => {
    const { twitter, discord, email, web } = props.row.original;
    return (
      <div className="flex gap-2 items-center">
        {twitter && <SocialChip href={twitter} type="twitter" />}
        {discord && <SocialChip href={discord} type="discord" />}
        {email && <SocialChip href={`mailto:${email}`} type="email" />}
        {web && <SocialChip href={web} type="web" />}
        {!twitter && !discord && !email && !web && (
          <Typography
            variant="body1"
            className="text-mono-200 dark:text-mono-0"
          >
            {EMPTY_VALUE_PLACEHOLDER}
          </Typography>
        )}
      </div>
    );
  },
});

const ParticipantsTable: FC<ParticipantTableProps> = ({ className }) => {
  const { network } = useNetworkStore();
  const { data, isLoading } = useServiceParticipants();

  const columns = [
    columnHelper.accessor('identity', {
      header: () => <HeaderCell title="Identity" className="justify-start" />,
      cell: (props) => {
        const address = props.row.original.address;
        const accountExplorerLink = getExplorerURI(
          network.polkadotExplorerUrl,
          address,
          'address',
          ExplorerType.Substrate,
        ).toString();
        return (
          <div className="flex items-center gap-1">
            <Avatar sourceVariant="address" value={address} theme="substrate" />
            <Typography
              variant="body1"
              className="text-mono-200 dark:text-mono-0"
            >
              {props.getValue() ?? shortenString(address)}
            </Typography>

            <CopyWithTooltip textToCopy={address} isButton={false} />

            <ExternalLinkIcon href={accountExplorerLink} />
          </div>
        );
      },
    }),
    addressColumn,
  ];

  const table = useReactTable({
    data: data,
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={twMerge('overflow-x-auto flex flex-col gap-5', className)}>
      <Typography variant="h4" fw="bold">
        Participants
      </Typography>
      <div
        className={twMerge(
          'flex-1 bg-glass dark:bg-glass_dark',
          'overflow-hidden rounded-2xl py-5 px-6',
          'border border-mono-0 dark:border-mono-160',
        )}
      >
        {!isLoading ? (
          <Table
            thClassName="!bg-inherit !px-3 border-t-0 bg-mono-0 whitespace-nowrap"
            trClassName="!bg-inherit cursor-pointer"
            tdClassName="!bg-inherit !px-3 whitespace-nowrap !border-t-0"
            tableProps={table}
            totalRecords={data.length}
            className="h-full flex flex-col"
            tableWrapperClassName="h-full overflow-y-auto"
          />
        ) : (
          <SkeletonRow />
        )}
      </div>
    </div>
  );
};

export default ParticipantsTable;
