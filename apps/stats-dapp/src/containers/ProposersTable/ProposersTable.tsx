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
import { VoteStatus } from '../../generated/graphql';
import { useVotes, VoteListItem, VotesQuery } from '../../provider/hooks';
import { Avatar, Chip, Table, Tabs } from '@nepoche/webb-ui-components/components';
import { fuzzyFilter } from '@nepoche/webb-ui-components/components/Filter/utils';
import { Typography } from '@nepoche/webb-ui-components/typography';
import { shortenString } from '@nepoche/webb-ui-components/utils';
import { formatDistanceToNow } from 'date-fns';
import { FC, useCallback, useMemo, useState } from 'react';

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

  columnHelper.accessor('status', {
    header: 'Vote',
    cell: (props) => {
      const vote = props.getValue<VoteStatus | undefined>();
      switch (vote) {
        case VoteStatus.Abstain:
          return <Chip color='blue'>Abstain</Chip>;
        case VoteStatus.Against:
          return <Chip color='red'>Against</Chip>;
        case VoteStatus.For:
          return <Chip color='green'>For</Chip>;
        default:
          return '-';
      }
    },
  }),

  columnHelper.accessor('timestamp', {
    header: 'Vote at',
    cell: (props) => formatDistanceToNow(props.getValue<Date>(), { addSuffix: true }),
  }),
];

type ProposersTableProps = {
  counters: {
    for: number;
    against: number;
    all: number;
    abstain: number;
  };
  proposalId: string;
};

export const ProposersTable: FC<ProposersTableProps> = ({ counters, proposalId }) => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [voteStatus, setVoteStatus] = useState<VoteStatus | undefined>(undefined);
  const query = useMemo<VotesQuery>(() => {
    return {
      filter: {
        proposalId,
        status: voteStatus,
      },
      offset: pagination.pageSize * pagination.pageIndex,
      perPage: pagination.pageSize,
    };
  }, [pagination, proposalId, voteStatus]);
  const votes = useVotes(query);

  const tabsValue = useMemo<Array<[VoteStatus | undefined, string]>>(() => {
    return [
      [undefined, `All (${counters.all})`],
      [VoteStatus.For, `For (${counters.for})`],
      [VoteStatus.Against, `Against (${counters.against})`],
      [VoteStatus.Abstain, `Abstain (${counters.abstain})`],
    ];
  }, [counters]);

  const tabsLabels = useMemo(() => tabsValue.map((i) => i[1]), [tabsValue]);
  const totalItems = useMemo(() => votes.val?.pageInfo.count ?? 0, [votes]);
  const pageCount = useMemo(() => Math.ceil(totalItems / pagination.pageSize), [pagination, totalItems]);

  const data = useMemo(() => votes.val?.items ?? [], [votes]);

  const onChange = useCallback(
    (tab: string) => {
      const selectedTab = tabsValue.find((item) => item[1] === tab);
      setVoteStatus(selectedTab?.[0] ?? undefined);
    },
    [tabsValue]
  );

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

      <Tabs onChange={onChange} value={tabsLabels} />

      <Table tableProps={table as RTTable<unknown>} isPaginated totalRecords={totalItems} className='mt-2' />
    </div>
  );
};
