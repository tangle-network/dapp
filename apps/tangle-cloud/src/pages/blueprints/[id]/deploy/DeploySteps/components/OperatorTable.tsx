import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import {
  Avatar,
  CheckBox,
  EMPTY_VALUE_PLACEHOLDER,
  EnergyChipColors,
  EnergyChipStack,
  ExternalLinkIcon,
  fuzzyFilter,
  getRoundedAmountString,
  KeyValueWithButton,
  Table,
  Typography,
} from '@tangle-network/ui-components';
import { FC } from 'react';
import { OperatorSelectionTable } from '../type';
import {
  createColumnHelper,
  getFilteredRowModel,
  getSortedRowModel,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  TableOptions,
} from '@tanstack/react-table';
import { sortByAddressOrIdentity } from '@tangle-network/tangle-shared-ui/components/tables/utils';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import VaultsDropdown from '@tangle-network/tangle-shared-ui/components/tables/Operators/VaultsDropdown';
import { TableVariant } from '@tangle-network/ui-components/components/Table/types';

const COLUMN_HELPER = createColumnHelper<OperatorSelectionTable>();

type Props = Omit<
  TableOptions<OperatorSelectionTable>,
  'data' | 'columns' | 'getCoreRowModel'
> & {
  tableData: OperatorSelectionTable[];
};

export const OperatorTable: FC<Props> = ({ tableData, ...tableProps }) => {
  const activeNetwork = useNetworkStore().network;

  const columns = [
    COLUMN_HELPER.accessor('address', {
      header: () => 'Identity',
      sortingFn: sortByAddressOrIdentity<OperatorSelectionTable>(),
      cell: (props) => {
        const { address, identityName: identity } = props.row.original;

        const accountUrl = activeNetwork.createExplorerAccountUrl(address);

        return (
          <TableCellWrapper className="pl-3 min-h-fit">
            <div className="flex items-center flex-1 gap-2 pr-3">
              {tableProps.enableRowSelection && (
                <CheckBox
                  wrapperClassName="!block !min-h-auto cursor-pointer"
                  className="cursor-pointer"
                  isChecked={props.row.getIsSelected()}
                  onChange={props.row.getToggleSelectedHandler()}
                />
              )}

              <Avatar
                sourceVariant="address"
                value={address}
                theme="substrate"
                size="md"
              />

              <div className="flex items-center">
                <KeyValueWithButton
                  keyValue={identity ? identity : address}
                  size="sm"
                />
                {accountUrl && (
                  <ExternalLinkIcon
                    className="ml-1"
                    href={accountUrl}
                    target="_blank"
                  />
                )}
              </div>
            </div>
          </TableCellWrapper>
        );
      },
    }),
    COLUMN_HELPER.accessor('pricing', {
      header: () => 'Pricing',
      cell: (props) => {
        return (
          <TableCellWrapper className="pl-3 min-h-fit">
            <Typography variant="body1">
              {`$${getRoundedAmountString(props.row.original.pricing)}`}
            </Typography>
          </TableCellWrapper>
        );
      },
    }),
    COLUMN_HELPER.accessor('instanceCount', {
      header: () => 'Instances',
      sortingFn: sortByAddressOrIdentity<OperatorSelectionTable>(),
      cell: (props) => {
        return (
          <TableCellWrapper className="pl-3 min-h-fit">
            <Typography variant="body1">
              {props.row.original.instanceCount}
            </Typography>
          </TableCellWrapper>
        );
      },
    }),
    COLUMN_HELPER.accessor('restakersCount', {
      header: () => 'Restakers',
      cell: (props) => {
        return (
          <TableCellWrapper className="pl-3 min-h-fit">
            <Typography variant="body1">
              {props.row.original.restakersCount}
            </Typography>
          </TableCellWrapper>
        );
      },
    }),
    COLUMN_HELPER.accessor('uptime', {
      header: () => 'Uptime',
      cell: (props) => {
        const DEFAULT_STACK = 10;
        const DEFAULT_PERCENTAGE = 100;
        const numberOfActiveChips = !props.row.original.uptime
          ? 0
          : Math.round(
              (props.row.original.uptime * DEFAULT_STACK) / DEFAULT_PERCENTAGE,
            );

        const activeColors = Array<EnergyChipColors>(numberOfActiveChips).fill(
          EnergyChipColors.GREEN,
        );
        const inactiveColors = Array<EnergyChipColors>(
          DEFAULT_STACK - numberOfActiveChips,
        ).fill(EnergyChipColors.GREY);
        const colors = [...activeColors, ...inactiveColors];

        return (
          <TableCellWrapper className="pl-3 min-h-fit">
            <EnergyChipStack
              colors={colors}
              label={`${props.row.original.uptime || EMPTY_VALUE_PLACEHOLDER}%`}
            />
          </TableCellWrapper>
        );
      },
    }),
    COLUMN_HELPER.accessor('vaultTokensInUsd', {
      header: () => 'Delegated Assets',
      cell: (props) => {
        const tokensList = props.row.original.vaultTokens ?? [];
        return (
          <TableCellWrapper removeRightBorder className="pl-3 min-h-fit">
            {tokensList.length > 0 ? (
              <div className="flex gap-2 items-center">
                <Typography variant="body1">
                  {`$${
                    props.row.original.vaultTokensInUsd
                      ? props.row.original.vaultTokensInUsd.toLocaleString()
                      : EMPTY_VALUE_PLACEHOLDER
                  }`}
                </Typography>
                <VaultsDropdown vaultTokens={tokensList} />
              </div>
            ) : (
              <Typography variant="body1">No vaults</Typography>
            )}
          </TableCellWrapper>
        );
      },
      sortingFn: (rowA, rowB) => {
        const aVaultTokens = rowA.original.vaultTokensInUsd ?? 0;
        const bVaultTokens = rowB.original.vaultTokensInUsd ?? 0;

        return aVaultTokens - bVaultTokens;
      },
    }),
  ];

  const table = useReactTable({
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    getRowId: (row) => row.address,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
    ...tableProps,
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table
      variant={TableVariant.GLASS_OUTER}
      isPaginated
      tableProps={table}
      trClassName="group overflow-hidden"
    />
  );
};
