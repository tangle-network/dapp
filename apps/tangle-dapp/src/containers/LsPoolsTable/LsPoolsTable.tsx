import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowRight } from '@tangle-network/icons';
import TableStatus from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import {
  AmountFormatStyle,
  Avatar,
  AvatarGroup,
  Button,
  Pagination,
  Table,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@tangle-network/ui-components';
import { TableVariant } from '@tangle-network/ui-components/components/Table/types';
import { EMPTY_VALUE_PLACEHOLDER } from '@tangle-network/ui-components/constants';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { FC, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import LstIcon from '../../components/LiquidStaking/LstIcon';
import PercentageCell from '../../components/tableCells/PercentageCell';
import TokenAmountCell from '../../components/tableCells/TokenAmountCell';
import { LsPool } from '../../constants/liquidStaking/types';
import useLsSetStakingIntent from '../../data/liquidStaking/useLsSetStakingIntent';
import { useLsStore } from '../../data/liquidStaking/useLsStore';

export type LsPoolsTableProps = {
  pools: LsPool[];
  isShown: boolean;
};

const COLUMN_HELPER = createColumnHelper<LsPool>();

const LsPoolsTable: FC<LsPoolsTableProps> = ({ pools, isShown }) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const [{ pageIndex, pageSize }, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5,
  });

  const { lsPoolId } = useLsStore();
  const setLsStakingIntent = useLsSetStakingIntent();

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  const columns = [
    COLUMN_HELPER.accessor('id', {
      header: () => 'ID',
      cell: (props) => (
        <div className="flex items-center justify-start gap-2">
          <LstIcon iconUrl={props.row.original.iconUrl} />

          <Typography
            variant="body2"
            fw="normal"
            className="text-mono-200 dark:text-mono-0"
          >
            {props.row.original.name?.toUpperCase()}{' '}
            <span className="text-mono-180 dark:text-mono-120">
              #{props.getValue()}
            </span>
          </Typography>
        </div>
      ),
    }),
    COLUMN_HELPER.accessor('ownerAddress', {
      header: () => 'Owner',
      cell: (props) => {
        const ownerAddress = props.getValue();

        if (ownerAddress === undefined) {
          return EMPTY_VALUE_PLACEHOLDER;
        }

        return (
          <Tooltip>
            <TooltipTrigger>
              <Avatar
                sourceVariant="address"
                value={props.getValue()}
                theme="substrate"
              />
            </TooltipTrigger>

            <TooltipBody className="max-w-none">{ownerAddress}</TooltipBody>
          </Tooltip>
        );
      },
    }),
    COLUMN_HELPER.accessor('validators', {
      header: () => 'Validators',
      cell: (props) =>
        props.row.original.validators.length === 0 ? (
          EMPTY_VALUE_PLACEHOLDER
        ) : (
          <AvatarGroup total={props.row.original.validators.length}>
            {props.row.original.validators.map((substrateAddress) => (
              <Tooltip key={substrateAddress}>
                <TooltipTrigger>
                  <Avatar
                    sourceVariant="address"
                    value={substrateAddress}
                    theme="substrate"
                  />
                </TooltipTrigger>

                <TooltipBody className="max-w-none">
                  {substrateAddress}
                </TooltipBody>
              </Tooltip>
            ))}
          </AvatarGroup>
        ),
    }),
    COLUMN_HELPER.accessor('totalStaked', {
      header: () => 'Total Staked (TVL)',
      cell: (props) => (
        <TokenAmountCell
          amount={props.getValue()}
          formatStyle={AmountFormatStyle.SHORT}
        />
      ),
    }),
    COLUMN_HELPER.accessor('commissionFractional', {
      header: () => 'Commission',
      cell: (props) => <PercentageCell percentage={props.getValue()} />,
    }),
    COLUMN_HELPER.accessor('apyPercentage', {
      header: () => 'APY',
      cell: (props) => <PercentageCell percentage={props.getValue()} />,
    }),
    COLUMN_HELPER.display({
      id: 'actions',
      cell: (props) => (
        <div className="flex items-center justify-end">
          <Button
            isDisabled={lsPoolId === props.row.original.id}
            onClick={() => setLsStakingIntent(props.row.original.id, true)}
            rightIcon={
              lsPoolId !== props.row.original.id ? (
                <ArrowRight className="fill-current dark:fill-current" />
              ) : undefined
            }
            variant="utility"
            size="sm"
          >
            {lsPoolId === props.row.original.id ? 'Selected' : 'Stake'}
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: pools,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      pagination,
    },
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  if (pools.length === 0) {
    return (
      <TableStatus
        title="No Pools Available"
        description="Looks like there are currently no liquid staking pools available for this protocol yet. Try creating your own pool to get started!"
        icon="🔍"
      />
    );
  }

  return (
    <div className="flex flex-col">
      <Table
        variant={TableVariant.GLASS_INNER}
        tableProps={table}
        title="Assets"
        className={twMerge(isShown ? 'animate-slide-down' : 'animate-slide-up')}
      />

      <Pagination
        itemsPerPage={pageSize}
        totalItems={pools.length}
        page={pageIndex + 1}
        totalPages={table.getPageCount()}
        canPreviousPage={table.getCanPreviousPage()}
        previousPage={table.previousPage}
        canNextPage={table.getCanNextPage()}
        nextPage={table.nextPage}
        setPageIndex={table.setPageIndex}
        title={pluralize('pool', pools.length === 0 || pools.length > 1)}
        className="border-t-0"
      />
    </div>
  );
};

export default LsPoolsTable;
