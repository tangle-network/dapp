import {
  type ColumnDef,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useActiveChain } from '@webb-tools/api-provider-environment/WebbProvider/subjects';
import { DEFAULT_DECIMALS } from '@webb-tools/dapp-config';
import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import { Chip } from '@webb-tools/webb-ui-components/components/Chip';
import { fuzzyFilter } from '@webb-tools/webb-ui-components/components/Filter/utils';
import { ListCardWrapper } from '@webb-tools/webb-ui-components/components/ListCard/ListCardWrapper';
import {
  RadioGroup,
  RadioItem,
} from '@webb-tools/webb-ui-components/components/Radio';
import { Table } from '@webb-tools/webb-ui-components/components/Table';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import cx from 'classnames';
import {
  type ComponentProps,
  forwardRef,
  PropsWithChildren,
  useMemo,
} from 'react';
import { formatUnits } from 'viem';

import useNetworkStore from '../../context/useNetworkStore';
import type { OperatorMap, OperatorMetadata } from '../../types/restake';
import AvatarWithText from './AvatarWithText';

type TableData = OperatorMetadata & { accountId: string };

type Props = Partial<ComponentProps<typeof ListCardWrapper>> & {
  operatorMap: OperatorMap;
  selectedOperatorAccountId: string;
  onOperatorAccountIdChange?: (accountId: string) => void;
};

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
          header: () => <Header ta="right">Total Staked</Header>,
          cell: ({
            getValue,
            row: {
              original: { status },
            },
          }) => (
            <ChipCell isRight isDisabled={status === 'Inactive'}>
              {formatUnits(getValue<bigint>(), nativeDecimals)}{' '}
              {nativeTokenSymbol}
            </ChipCell>
          ),
        },
      ],
      [nativeDecimals, nativeTokenSymbol],
    );

    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getSortedRowModel: getSortedRowModel(),
      filterFns: {
        fuzzy: fuzzyFilter,
      },
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

const Header = ({
  children,
  ta = 'left',
}: PropsWithChildren<{
  ta?: 'left' | 'right' | 'center';
}>) => (
  <Typography className="w-full" variant="body3" fw="semibold" ta={ta}>
    {children}
  </Typography>
);

type CellProps = {
  isRight?: boolean;
  isDisabled?: boolean;
};

const ChipCell = ({
  children,
  isRight,
  isDisabled,
}: PropsWithChildren<CellProps>) => (
  <div
    className={cx(
      isRight && 'flex justify-end ml-auto',
      isDisabled && 'opacity-50',
    )}
  >
    <Chip color="dark-grey">{children}</Chip>
  </div>
);
