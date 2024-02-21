'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Avatar,
  CopyWithTooltip,
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
import { useServiceParticipants } from '../../../data/ServiceDetails';
import type { ServiceParticipant } from '../../../types';

interface ParticipantTableProps {
  serviceId: string;
  className?: string;
}

const columnHelper = createColumnHelper<ServiceParticipant>();

const columns = [
  columnHelper.accessor('identity', {
    header: () => <HeaderCell title="Identity" className="justify-start" />,
    cell: (props) => {
      const address = props.row.original.address;
      return (
        <div className="flex items-center gap-1">
          <Avatar sourceVariant="address" value={address} theme="substrate" />
          <Typography
            variant="body2"
            className="text-mono-200 dark:text-mono-0"
          >
            {props.getValue() ?? shortenString(address)}
          </Typography>
          <CopyWithTooltip textToCopy={address} isButton={false} />
        </div>
      );
    },
  }),
  columnHelper.accessor('address', {
    header: () => <HeaderCell title="Social" className="justify-start" />,
    cell: (props) => {
      const { twitter, discord, email, web } = props.row.original;
      return (
        <div className="flex gap-2 items-center">
          {twitter && <SocialChip href={twitter} type="twitter" />}
          {discord && <SocialChip href={discord} type="discord" />}
          {email && <SocialChip href={`mailto:${email}`} type="email" />}
          {web && <SocialChip href={web} type="web" />}
        </div>
      );
    },
  }),
];

const ParticipantsTable: FC<ParticipantTableProps> = ({
  serviceId,
  className,
}) => {
  const { data, isLoading, error } = useServiceParticipants(serviceId);

  const table = useReactTable({
    data: data ?? [],
    columns,
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={twMerge('flex flex-col gap-5', className)}>
      <Typography variant="h4" fw="bold">
        Participants
      </Typography>
      <div
        className={twMerge(
          'flex-1 bg-[linear-gradient(180deg,#FFF_0%,rgba(255,255,255,0.00)_100%)]',
          'dark:bg-[linear-gradient(180deg,#2B2F40_0%,rgba(43,47,64,0.00)_100%)]',
          'overflow-hidden rounded-2xl py-5 px-6',
          'border border-mono-0 dark:border-mono-160'
        )}
      >
        {/* Successfully get data */}
        {data && !isLoading && !error && (
          <Table
            thClassName="!bg-inherit !px-3 border-t-0 bg-mono-0 whitespace-nowrap"
            trClassName="!bg-inherit cursor-pointer"
            tdClassName="!bg-inherit !px-3 whitespace-nowrap !border-t-0"
            tableProps={table}
            totalRecords={data.length}
            className="h-full flex flex-col"
            tableWrapperClassName="h-full overflow-y-auto"
          />
        )}

        {/* Loading */}
        {isLoading && <SkeletonRow />}

        {/* Error */}
        {!isLoading && !data && error && (
          <Typography variant="body1">Error</Typography>
        )}
      </div>
    </div>
  );
};

export default ParticipantsTable;
