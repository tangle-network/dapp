import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useActiveChain } from '@webb-tools/api-provider-environment/WebbProvider/subjects';
import { DEFAULT_DECIMALS } from '@webb-tools/dapp-config';
import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import { getFlexBasic } from '@webb-tools/icons/utils';
import { Avatar } from '@webb-tools/webb-ui-components/components/Avatar';
import { Chip } from '@webb-tools/webb-ui-components/components/Chip';
import { fuzzyFilter } from '@webb-tools/webb-ui-components/components/Filter/utils';
import { ListCardWrapper } from '@webb-tools/webb-ui-components/components/ListCard/ListCardWrapper';
import {
  RadioGroup,
  RadioItem,
} from '@webb-tools/webb-ui-components/components/Radio';
import {
  Tooltip,
  TooltipBody,
  TooltipTrigger,
} from '@webb-tools/webb-ui-components/components/Tooltip';
import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import { shortenString } from '@webb-tools/webb-ui-components/utils/shortenString';
import {
  type ComponentProps,
  forwardRef,
  PropsWithChildren,
  useMemo,
  useState,
} from 'react';
import { formatUnits } from 'viem';

import useNetworkStore from '../../../context/useNetworkStore';
import type { OperatorMap, OperatorMetadata } from '../../../types/restake';

type Props = Partial<ComponentProps<typeof ListCardWrapper>> & {
  operatorMap: OperatorMap;
};

const OperatorList = forwardRef<HTMLDivElement, Props>(
  ({ onClose, overrideTitleProps, operatorMap, ...props }, ref) => {
    const isEmpty = Object.keys(operatorMap).length === 0;
    const size = Object.keys(operatorMap).length;

    const { nativeTokenSymbol } = useNetworkStore();
    const [activeChain] = useActiveChain();

    const nativeDecimals = useMemo(
      () =>
        isDefined(activeChain)
          ? activeChain.nativeCurrency.decimals
          : DEFAULT_DECIMALS,
      [activeChain],
    );

    const data = useMemo<(OperatorMetadata & { accountId: string })[]>(
      () =>
        Object.entries(operatorMap).map(([accountId, metadata]) => ({
          ...metadata,
          accountId,
        })),
      [operatorMap],
    );

    const columns = useMemo<
      ColumnDef<OperatorMetadata & { accountId: string }>[]
    >(
      () => [
        {
          id: 'select-row',
          header: () => <Header>Operator</Header>,
          cell: ({
            row: {
              original: { accountId },
            },
          }) => (
            <RadioItem
              id={accountId}
              value={accountId}
              className="w-full overflow-hidden"
            >
              <label
                className="flex items-center justify-between grow"
                htmlFor={accountId}
              >
                <div className="flex items-center max-w-xs space-x-2 grow">
                  <Avatar
                    // TODO: Determine the theme instead of hardcoding it
                    theme="substrate"
                    value={accountId}
                    className={`${getFlexBasic()} shrink-0`}
                  />

                  <Typography variant="h5" fw="bold" className="truncate">
                    {shortenString(accountId)}
                  </Typography>
                </div>
              </label>
            </RadioItem>
          ),
        },
        {
          accessorKey: 'bond',
          header: () => <Header>Total Staked</Header>,
          cell: (info) => (
            <ChipCell>
              {formatUnits(info.getValue<bigint>(), nativeDecimals)}{' '}
              {nativeTokenSymbol}
            </ChipCell>
          ),
        },
        {
          accessorKey: 'delegationCount',
          header: () => <Header>Delegations</Header>,
          cell: (info) => <ChipCell>{info.getValue<number>()}</ChipCell>,
        },
        {
          accessorKey: 'status',
          header: () => <Header>Status</Header>,
          cell: (info) => (
            <StatusCell status={info.getValue<OperatorMetadata['status']>()} />
          ),
        },
      ],
      [nativeDecimals, nativeTokenSymbol],
    );

    const [rowSelection, setRowSelection] = useState({});

    const table = useReactTable({
      data,
      columns,
      state: {
        rowSelection,
      },
      enableRowSelection: (row) => row.original.status !== 'Inactive',
      onRowSelectionChange: setRowSelection,
      getCoreRowModel: getCoreRowModel(),
      filterFns: {
        fuzzy: fuzzyFilter,
      },
    });

    return (
      <ListCardWrapper
        {...props}
        title="Select a Relayer"
        onClose={onClose}
        ref={ref}
      >
        {!isEmpty && (
          <div className="flex flex-col p-2 space-y-2 grow">
            <Typography
              variant="body4"
              className="uppercase text-mono-200 dark:text-mono-0"
              fw="bold"
            >
              Available Operators ({size})
            </Typography>

            <RadioGroup>
              <table>
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <th key={header.id} colSpan={header.colSpan}>
                            {header.isPlaceholder ? null : (
                              <>
                                {flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                              </>
                            )}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => {
                    return (
                      <tr key={row.id}>
                        {row.getVisibleCells().map((cell) => {
                          return (
                            <td key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </RadioGroup>
          </div>
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

const Header = ({ children }: PropsWithChildren) => (
  <Typography variant="body3" fw="semibold">
    {children}
  </Typography>
);

const ChipCell = ({ children }: PropsWithChildren) => (
  <Chip color="grey">{children}</Chip>
);

const StatusCell = ({ status }: { status: OperatorMetadata['status'] }) =>
  status === 'Active' ? (
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
  );
