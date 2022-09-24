import { randBoolean, randEthereumAddress, randRecentDate } from '@ngneat/falso';
import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Table as RTTable,
  useReactTable,
} from '@tanstack/react-table';
import { VoteListItem } from '@webb-dapp/page-statistics/provider/hooks';
import { Avatar, Chip, Table } from '@webb-dapp/webb-ui-components/components';
import { fuzzyFilter } from '@webb-dapp/webb-ui-components/components/Filter/utils';
import { useSeedData } from '@webb-dapp/webb-ui-components/hooks';
import { PropsOf } from '@webb-dapp/webb-ui-components/types';
import { Typography } from '@webb-dapp/webb-ui-components/typography';
import { randAccount32, shortenString } from '@webb-dapp/webb-ui-components/utils';
import cx from 'classnames';
import { formatDistanceToNow } from 'date-fns';
import { FC, useEffect, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { VoteType } from '../ProposalDetail';

const getVoteItem: () => VoteListItem = () => {
  return {
    id: randEthereumAddress() + randEthereumAddress().substring(2),
    voterId: randAccount32(),
    timestamp: randRecentDate(),
    for: randBoolean() ? undefined : randBoolean(), // Dummy random. Please don't judge :)
  };
};

const columnHelper = createColumnHelper<VoteListItem>();

const columns: ColumnDef<VoteListItem, any>[] = [
  columnHelper.accessor('voterId', {
    header: 'Identity',
    cell: (props) => (
      <div className='flex items-center space-x-2'>
        <Avatar value={props.getValue<string>()} />

        <p>{shortenString(props.getValue<string>(), 10)}</p>
      </div>
    ),
  }),

  columnHelper.accessor('for', {
    header: 'Vote',
    cell: (props) => {
      const vote = props.getValue<boolean | undefined>();

      if (vote === undefined) {
        return (
          <Chip color='blue' className='uppercase'>
            abstain
          </Chip>
        );
      } else if (vote) {
        return (
          <Chip color='green' className='uppercase'>
            for
          </Chip>
        );
      } else {
        return (
          <Chip color='red' className='uppercase'>
            Against
          </Chip>
        );
      }
    },
  }),

  columnHelper.accessor('timestamp', {
    header: 'Vote at',
    cell: (props) => formatDistanceToNow(props.getValue<Date>(), { addSuffix: true }),
  }),
];

export const ProposersTable: FC = () => {
  const [voteType, setVoteType] = useState<'all' | VoteType>('all');

  const { fetchData } = useSeedData(getVoteItem);

  const [dataQuery, setDataQuery] = useState<Awaited<ReturnType<typeof fetchData>> | undefined>(undefined);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { abstainCount, againstCount, forCount } = useMemo(() => {
    const defaultCount = {
      forCount: 0,
      againstCount: 0,
      abstainCount: 0,
    };

    if (!dataQuery) {
      return defaultCount;
    }

    return dataQuery.rows.reduce((acc, cur) => {
      if (cur.for === undefined) {
        acc.abstainCount += 1;
      } else if (cur.for) {
        acc.forCount += 1;
      } else {
        acc.againstCount += 1;
      }

      return acc;
    }, defaultCount);
  }, [dataQuery]);

  const pageCount = useMemo(() => dataQuery?.pageCount ?? 0, [dataQuery]);
  const totalItems = useMemo(() => dataQuery?.totalItems ?? 0, [dataQuery]);
  const data = useMemo(() => dataQuery?.rows ?? ([] as VoteListItem[]), [dataQuery?.rows]);

  useEffect(() => {
    const updateData = async () => {
      const fetchedData = await fetchData({ ...pagination });
      setDataQuery(fetchedData);
    };

    updateData();
  }, [fetchData, pagination]);

  const table = useReactTable<VoteListItem>({
    data,
    columns,
    pageCount,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    manualPagination: true,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
  });

  return (
    <div>
      <Typography variant='h5' fw='bold' className='mb-3'>
        All Proposers
      </Typography>

      <div className='flex items-center space-x-2'>
        <Tab isActive={voteType === 'all'} onClick={() => setVoteType('all')}>
          All ({forCount + againstCount + abstainCount})
        </Tab>
        <Tab isActive={voteType === 'for'} onClick={() => setVoteType('for')}>
          For ({forCount})
        </Tab>
        <Tab isActive={voteType === 'against'} onClick={() => setVoteType('against')}>
          Against ({againstCount})
        </Tab>
        <Tab isActive={voteType === 'abstain'} onClick={() => setVoteType('abstain')}>
          Abstain ({abstainCount})
        </Tab>
      </div>

      <Table tableProps={table as RTTable<unknown>} isPaginated totalRecords={totalItems} className='mt-2' />
    </div>
  );
};

/***********************
 * Internal components *
 ***********************/

const Tab: FC<PropsOf<'button'> & { isActive?: boolean }> = ({ children, className, isActive, ...props }) => {
  return (
    <button
      {...props}
      disabled={isActive}
      className={twMerge(
        cx(
          'flex items-center justify-center grow shrink basis-0',
          'py-2 font-bold rounded-lg body2 group disabled:cursor-not-allowed',
          'text-mono-120 dark:text-mono-80 bg-mono-0 dark:bg-mono-180',
          'disabled:bg-blue-0 dark:disabled:bg-blue-120 disabled:text-blue-70 dark:disabled:text-blue-50'
        ),
        className
      )}
    >
      <span className='inline-block !text-inherit group-disabled:pointer-events-none'>{children}</span>
    </button>
  );
};
