'use client';

import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowRight } from '@webb-tools/icons';
import {
  Avatar,
  AvatarGroup,
  Button,
  Pagination,
  Table,
  Tooltip,
  TooltipBody,
  TooltipTrigger,
  Typography,
} from '@webb-tools/webb-ui-components';
import { TableVariant } from '@webb-tools/webb-ui-components/components/Table/types';
import { EMPTY_VALUE_PLACEHOLDER } from '@webb-tools/webb-ui-components/constants';
import { FC, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { TableStatus } from '../../components';
import LstIcon from '../../components/LiquidStaking/LstIcon';
import PercentageCell from '../../components/tableCells/PercentageCell';
import TokenAmountCell from '../../components/tableCells/TokenAmountCell';
import { LsPool } from '../../constants/liquidStaking/types';
import useLsSetStakingIntent from '../../data/liquidStaking/useLsSetStakingIntent';
import { useLsStore } from '../../data/liquidStaking/useLsStore';
import { AmountFormatStyle } from '../../utils/formatDisplayAmount';
import getLsProtocolDef from '../../utils/liquidStaking/getLsProtocolDef';
import tryEncodeAddressWithPrefix from '../../utils/liquidStaking/tryEncodeAddressWithPrefix';
import pluralize from '../../utils/pluralize';

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
        <div className="flex gap-2 items-center justify-start">
          <LstIcon
            lsProtocolId={props.row.original.protocolId}
            iconUrl={props.row.original.iconUrl}
          />

          <Typography
            variant="body2"
            fw="normal"
            className="text-mono-200 dark:text-mono-0"
          >
            {props.row.original.name?.toUpperCase()}
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

            <TooltipBody className="max-w-none">
              {tryEncodeAddressWithPrefix(
                ownerAddress,
                props.row.original.protocolId,
              )}
            </TooltipBody>
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
                  {tryEncodeAddressWithPrefix(
                    substrateAddress,
                    props.row.original.protocolId,
                  )}
                </TooltipBody>
              </Tooltip>
            ))}
          </AvatarGroup>
        ),
    }),
    COLUMN_HELPER.accessor('totalStaked', {
      header: () => 'Total Staked (TVL)',
      cell: (props) => {
        const lsProtocol = getLsProtocolDef(props.row.original.protocolId);

        return (
          <TokenAmountCell
            amount={props.getValue()}
            decimals={lsProtocol.decimals}
            formatStyle={AmountFormatStyle.SHORT}
          />
        );
      },
    }),
    COLUMN_HELPER.accessor('commissionFractional', {
      header: () => 'Commission',
      cell: (props) => <PercentageCell fractional={props.getValue()} />,
    }),
    COLUMN_HELPER.accessor('apyPercentage', {
      header: () => 'APY',
      cell: (props) => <PercentageCell fractional={props.getValue()} />,
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
            {lsPoolId === props.row.original.id ? 'Selected' : 'Mint'}
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
