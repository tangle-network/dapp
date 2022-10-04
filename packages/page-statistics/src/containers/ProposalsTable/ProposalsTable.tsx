import {
  ColumnDef,
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  PaginationState,
  Table as RTTable,
  useReactTable,
} from '@tanstack/react-table';
import { ProposalStatus } from '@webb-dapp/page-statistics/generated/graphql';
import { fetchProposalsData } from '@webb-dapp/page-statistics/hooks';
import { PageInfoQuery, ProposalListItem, useProposals } from '@webb-dapp/page-statistics/provider/hooks';
import { getChipColorByProposalType } from '@webb-dapp/page-statistics/utils';
import {
  Avatar,
  AvatarGroup,
  Button,
  CardTable,
  Chip,
  LabelWithValue,
  Table,
} from '@webb-dapp/webb-ui-components/components';
import { fuzzyFilter } from '@webb-dapp/webb-ui-components/components/Filter/utils';
import { ExternalLinkLine, TokenIcon } from '@webb-dapp/webb-ui-components/icons';
import { shortenHex } from '@webb-dapp/webb-ui-components/utils';
import { BigNumber } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const columnHelper = createColumnHelper<ProposalListItem>();

const columns: ColumnDef<ProposalListItem, any>[] = [
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (props) => (
      <Chip color={getChipColorByProposalType(props.getValue<ProposalStatus>())}>{props.getValue<string>()}</Chip>
    ),
  }),

  columnHelper.accessor('height', {
    header: 'Height',
    cell: (props) => props.getValue<string>(),
  }),

  columnHelper.accessor('type', {
    header: 'Type',
  }),

  columnHelper.accessor('txHash', {
    header: 'Tx Hash',
    cell: (props) => (
      <div className='flex items-center space-x-1'>
        <LabelWithValue
          labelVariant='body3'
          label='tx hash:'
          isHiddenLabel
          value={shortenHex(props.getValue<string>(), 3)}
          valueTooltip={props.getValue<string>()}
        />
        <a href='#'>
          <ExternalLinkLine />
        </a>
      </div>
    ),
  }),

  columnHelper.accessor('proposers', {
    header: 'Proposers',
    cell: (props) => {
      const proposers = props.getValue<ProposalListItem['proposers']>();
      return (
        <AvatarGroup total={proposers.count}>
          {proposers.firstElements.map((item, idx) => (
            <Avatar sourceVariant={'address'} value={item} key={`${idx}-${item}`} />
          ))}
        </AvatarGroup>
      );
    },
  }),

  columnHelper.accessor('chain', {
    header: 'Chain',
    cell: () => <TokenIcon name='eth' size='lg' />,
  }),

  columnHelper.accessor('id', {
    header: '',
    cell: (props) => (
      <Button variant='link' size='sm'>
        <Link to={`drawer/${props.getValue<string>()}`}>Details</Link>
      </Button>
    ),
  }),
];

export const ProposalsTable = () => {
  // Pagination state
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalItems, setTotalItems] = useState(0);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );
  const pageQuery: PageInfoQuery = useMemo(
    () => ({
      offset: pagination.pageIndex * pageSize,
      perPage: pagination.pageSize,
      filter: null,
    }),
    [pageSize, pagination.pageIndex, pagination.pageSize]
  );
  const pageCount = useMemo(() => Math.ceil(totalItems / pageSize), [pageSize, totalItems]);

  const proposalsStats = useProposals(pageQuery);
  const data = useMemo(() => {
    if (proposalsStats.val) {
      return proposalsStats.val.items;
    }
    return [] as ProposalListItem[];
  }, [proposalsStats]);
  useEffect(() => {
    if (proposalsStats.val) {
      setTotalItems(proposalsStats.val.pageInfo.count);
    }
  }, [proposalsStats]);

  const table = useReactTable<ProposalListItem>({
    columns,
    data: data,
    pageCount: pageCount,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    manualPagination: true,
    getPaginationRowModel: getPaginationRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
  });

  return (
    <CardTable
      titleProps={{
        title: 'All Proposals',
      }}
    >
      <Table tableProps={table as RTTable<unknown>} isPaginated totalRecords={totalItems} />
    </CardTable>
  );
};
