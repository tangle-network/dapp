import {
  createColumnHelper,
  getCoreRowModel,
  PaginationState,
  Table as RTTable,
  useReactTable,
} from '@tanstack/react-table';
import { Avatar, AvatarGroup, Button, KeyValueWithButton, Table } from '@webb-dapp/webb-ui-components/components';
import { Authority } from '@webb-dapp/webb-ui-components/components/KeyStatusCard/types';
import { fetchKeygenData } from '@webb-dapp/webb-ui-components/hooks';
import { KeygenType } from '@webb-dapp/webb-ui-components/types';
import { useEffect, useMemo, useState } from 'react';

const columnHelper = createColumnHelper<KeygenType>();

const columns = [
  columnHelper.accessor('height', {
    header: 'Height',
  }),
  columnHelper.accessor('session', {
    header: 'Sesssion',
  }),
  columnHelper.accessor('key', {
    header: 'Key',
    cell: (props) => <KeyValueWithButton isHiddenLabel keyValue={props.getValue<string>()} size='sm' />,
  }),
  columnHelper.accessor('keygenThreshold', {
    header: 'Keygen Threshold',
  }),
  columnHelper.accessor('signatureThreshold', {
    header: 'Signature Threshold',
  }),
  columnHelper.accessor('authorities', {
    header: 'Authority Set',
    cell: (props) => (
      <AvatarGroup total={props.row.original.totalAuthorities}>
        {Object.values<Authority>(props.getValue()).map((au) => (
          <Avatar src={au.avatarUrl} alt={au.id} key={au.id} />
        ))}
      </AvatarGroup>
    ),
  }),
  columnHelper.accessor('detailUrl', {
    header: '',
    cell: (props) => (
      <Button varirant='link' href={props.getValue<string>()} target='_blank' size='sm'>
        Details
      </Button>
    ),
  }),
];

export const KeygenTable = () => {
  // Pagination state
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const [dataQuery, setDataQuery] = useState<undefined | Awaited<ReturnType<typeof fetchKeygenData>>>();

  useEffect(() => {
    const updateData = async () => {
      const dataQuery = await fetchKeygenData({ pageIndex, pageSize });

      setDataQuery(dataQuery);
    };

    updateData();
  }, [pageIndex, pageSize]);

  const table = useReactTable({
    data: dataQuery?.rows ?? ([] as KeygenType[]),
    columns,
    pageCount: dataQuery?.pageCount ?? -1,
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    manualPagination: true,
  });

  return (
    <Table
      tableProps={table as RTTable<unknown>}
      isPaginated
      paginationProps={{
        itemsPerPage: pageSize,
        totalItems: dataQuery?.totalItems,
        page: pageIndex + 1,
        totalPages: dataQuery?.pageCount,
        canPreviousPage: table.getCanPreviousPage(),
        previousPage: table.previousPage,
        canNextPage: table.getCanNextPage(),
        nextPage: table.nextPage,
        setPageIndex: table.setPageIndex,
      }}
    />
  );
};
