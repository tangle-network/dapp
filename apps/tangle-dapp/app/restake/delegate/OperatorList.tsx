import {
  type Column,
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  type Updater,
  useReactTable,
} from '@tanstack/react-table';
import { useActiveChain } from '@webb-tools/api-provider-environment/WebbProvider/subjects';
import { DEFAULT_DECIMALS } from '@webb-tools/dapp-config';
import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import { ArrowDropDownFill } from '@webb-tools/icons/ArrowDropDownFill';
import { ArrowDropUpFill } from '@webb-tools/icons/ArrowDropUpFill';
import { Chip } from '@webb-tools/webb-ui-components/components/Chip';
import { fuzzyFilter } from '@webb-tools/webb-ui-components/components/Filter/utils';
import { ListCardWrapper } from '@webb-tools/webb-ui-components/components/ListCard/ListCardWrapper';
import {
  RadioGroup,
  RadioItem,
} from '@webb-tools/webb-ui-components/components/Radio';
import { Table } from '@webb-tools/webb-ui-components/components/Table';
import {
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@webb-tools/webb-ui-components/components/Tooltip';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import cx from 'classnames';
import {
  type ComponentProps,
  forwardRef,
  PropsWithChildren,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { twMerge } from 'tailwind-merge';
import { formatUnits } from 'viem';

import useNetworkStore from '../../../context/useNetworkStore';
import type {
  OperatorMap,
  OperatorMetadata,
  OperatorStatus,
} from '../../../types/restake';
import AvatarWithText from '../AvatarWithText';

type TableData = OperatorMetadata & { accountId: string };

type Props = Partial<ComponentProps<typeof ListCardWrapper>> & {
  operatorMap: OperatorMap;
  selectedOperatorAccountId: string;
  onOperatorAccountIdChange?: (accountId: string) => void;
};

const defaultSorting: SortingState = [{ id: 'status', desc: false }];

function getStatusIndex(status: OperatorStatus) {
  if (status === 'Active') {
    return 0;
  }

  if (typeof status === 'object') {
    return 1;
  }

  return 2;
}

function sortStatus(rowA: Row<TableData>, rowB: Row<TableData>) {
  const statusA = rowA.original.status;
  const statusB = rowB.original.status;
  return getStatusIndex(statusA) - getStatusIndex(statusB);
}

const OperatorList = forwardRef<HTMLDivElement, Props>(
  (
    {
      onClose,
      overrideTitleProps,
      operatorMap,
      selectedOperatorAccountId,
      onOperatorAccountIdChange,
      ...props
    },
    ref,
  ) => {
    const isEmpty = Object.keys(operatorMap).length === 0;

    const { nativeTokenSymbol } = useNetworkStore();
    const [activeChain] = useActiveChain();

    const nativeDecimals = useMemo(
      () =>
        isDefined(activeChain)
          ? activeChain.nativeCurrency.decimals
          : DEFAULT_DECIMALS,
      [activeChain],
    );

    const data = useMemo<TableData[]>(
      () =>
        Object.entries(operatorMap).map(([accountId, metadata]) => ({
          ...metadata,
          accountId,
        })),
      [operatorMap],
    );

    const columns = useMemo<ColumnDef<TableData>[]>(
      () => [
        {
          id: 'select-row',
          enableSorting: false,
          header: () => <Header>Operator</Header>,
          cell: ({
            row: {
              original: { accountId, status },
            },
          }) => (
            <RadioItem
              id={accountId}
              value={accountId}
              className="w-full overflow-hidden px-0.5"
              {...(status === 'Inactive'
                ? {
                    overrideRadixRadioItemProps: { disabled: true },
                  }
                : {})}
            >
              <label
                className="flex items-center justify-between grow"
                htmlFor={accountId}
              >
                <AvatarWithText accountAddress={accountId} />
              </label>
            </RadioItem>
          ),
        },
        {
          accessorKey: 'bond',
          enableSorting: true,
          enableMultiSort: true,
          header: ({ column }) => (
            <Header isCenter column={column}>
              Total Staked
            </Header>
          ),
          cell: ({
            getValue,
            row: {
              original: { status },
            },
          }) => (
            <ChipCell isCenter isDisabled={status === 'Inactive'}>
              {formatUnits(getValue<bigint>(), nativeDecimals)}{' '}
              {nativeTokenSymbol}
            </ChipCell>
          ),
        },
        {
          accessorKey: 'delegationCount',
          enableSorting: true,
          enableMultiSort: true,
          header: ({ column }) => (
            <Header isCenter column={column}>
              Delegations
            </Header>
          ),
          cell: ({
            getValue,
            row: {
              original: { status },
            },
          }) => (
            <ChipCell isCenter isDisabled={status === 'Inactive'}>
              {getValue<number>()}
            </ChipCell>
          ),
        },
        {
          accessorKey: 'status',
          enableSorting: true,
          enableMultiSort: true,
          header: () => <Header isCenter>Status</Header>,
          cell: (info) => (
            <StatusCell status={info.getValue<OperatorStatus>()} />
          ),
          sortingFn: sortStatus,
        },
      ],
      [nativeDecimals, nativeTokenSymbol],
    );

    const [sorting, setSorting] = useState<SortingState>(defaultSorting);

    const handleSortingChange = useCallback(
      (updaterOrValue: Updater<SortingState>) => {
        if (typeof updaterOrValue === 'function') {
          setSorting((prev) => {
            console.log('prev', prev);
            const next = updaterOrValue(prev);
            console.log('next', next);
            return next.length === 0
              ? defaultSorting
              : defaultSorting.concat(next);
          });
        } else {
          if (updaterOrValue.length === 0) {
            setSorting(defaultSorting);
          } else {
            setSorting(defaultSorting.concat(updaterOrValue));
          }
        }
      },
      [],
    );

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      filterFns: {
        fuzzy: fuzzyFilter,
      },
      state: {
        sorting,
      },
      onSortingChange: handleSortingChange,
    });

    return (
      <ListCardWrapper
        {...props}
        title="Select Operator"
        onClose={onClose}
        ref={ref}
      >
        {!isEmpty && (
          <RadioGroup
            defaultValue={selectedOperatorAccountId}
            onValueChange={onOperatorAccountIdChange}
          >
            <Table
              className="pt-4"
              tableProps={table}
              thClassName={cx(
                'bg-transparent dark:bg-transparent border-t-0 px-3 py-2',
              )}
              tdClassName={cx(
                'bg-transparent dark:bg-transparent px-4 py-2.5 border-none',
              )}
              isDisabledRowHoverStyle
            />
          </RadioGroup>
        )}

        {isEmpty && (
          <div className="flex flex-col items-center justify-center space-y-4 grow">
            <Typography variant="h5" fw="bold" ta="center">
              No Operator Found.
            </Typography>

            <Typography
              variant="body1"
              fw="semibold"
              className="max-w-xs mt-1 text-mono-100 dark:text-mono-80"
              ta="center"
            >
              You can comeback later or add apply to become a operator.
            </Typography>
          </div>
        )}
      </ListCardWrapper>
    );
  },
);

OperatorList.displayName = 'OperatorList';

export default OperatorList;

const Header = <TData,>({
  children,
  isCenter,
  column,
}: PropsWithChildren<{ isCenter?: boolean; column?: Column<TData> }>) =>
  isDefined(column) ? (
    <div
      className={twMerge(
        'flex items-center',
        column.getCanSort() && 'cursor-pointer select-none',
      )}
      onClick={column.getToggleSortingHandler()}
      title={
        column.getCanSort()
          ? column.getNextSortingOrder() === 'asc'
            ? 'Sort ascending'
            : column.getNextSortingOrder() === 'desc'
              ? 'Sort descending'
              : 'Clear sort'
          : undefined
      }
    >
      <Typography
        variant="body3"
        fw="semibold"
        ta={isCenter ? 'center' : 'left'}
      >
        {children}
      </Typography>

      {{
        asc: <ArrowDropDownFill />,
        desc: <ArrowDropUpFill />,
      }[column.getIsSorted() as string] ?? null}
    </div>
  ) : (
    <Typography variant="body3" fw="semibold" ta={isCenter ? 'center' : 'left'}>
      {children}
    </Typography>
  );

type CellProps = {
  isCenter?: boolean;
  isDisabled?: boolean;
};

const ChipCell = ({
  children,
  isCenter,
  isDisabled,
}: PropsWithChildren<CellProps>) => (
  <div
    className={cx(
      isCenter && 'flex justify-center',
      isDisabled && 'opacity-50',
    )}
  >
    <Chip color="dark-grey">{children}</Chip>
  </div>
);

const StatusCell = ({
  status,
  isDisabled,
  isCenter,
}: CellProps & { status: OperatorStatus }) => (
  <div
    className={cx(
      isCenter && 'flex justify-center',
      isDisabled && 'opacity-50',
    )}
  >
    {status === 'Active' ? (
      <Chip color="green">Active</Chip>
    ) : status === 'Inactive' ? (
      <Chip color="red">Inactive</Chip>
    ) : (
      <Tooltip>
        <TooltipTrigger>
          <Chip color="yellow">Leaving</Chip>
        </TooltipTrigger>
        <TooltipBody className="max-w-[185px] w-auto">
          <span>Operator will leaving at {status.Leaving} round.</span>
        </TooltipBody>
      </Tooltip>
    )}
  </div>
);
