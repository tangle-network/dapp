import {
  Avatar,
  CheckBox,
  EMPTY_VALUE_PLACEHOLDER,
  fuzzyFilter,
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
  SortingFn,
} from '@tanstack/react-table';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import VaultsDropdown from '@tangle-network/tangle-shared-ui/components/tables/Operators/VaultsDropdown';
import { TableVariant } from '@tangle-network/ui-components/components/Table/types';
import { formatUnits } from 'viem';
import { TANGLE_TOKEN_DECIMALS } from '@tangle-network/dapp-config';

// Local sort function for EVM address-based operator table
const sortByAddressOrIdentity: SortingFn<OperatorSelectionTable> = (
  rowA,
  rowB,
) => {
  const { address: addressA, identityName: identityNameA } = rowA.original;
  const { address: addressB, identityName: identityNameB } = rowB.original;

  if (identityNameA && identityNameB) {
    return identityNameA.localeCompare(identityNameB);
  } else if (identityNameA) {
    return -1;
  } else if (identityNameB) {
    return 1;
  } else {
    return addressA.localeCompare(addressB);
  }
};

const COLUMN_HELPER = createColumnHelper<OperatorSelectionTable>();

type Props = Omit<
  TableOptions<OperatorSelectionTable>,
  'data' | 'columns' | 'getCoreRowModel'
> & {
  tableData: OperatorSelectionTable[];
};

export const OperatorTable: FC<Props> = ({ tableData, ...tableProps }) => {
  const columns = [
    COLUMN_HELPER.accessor('address', {
      header: () => 'Identity',
      sortingFn: sortByAddressOrIdentity,
      cell: (props) => {
        const { address, identityName: identity } = props.row.original;

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
                theme="ethereum"
                size="md"
              />

              <div className="flex items-center">
                <KeyValueWithButton
                  keyValue={identity ? identity : address}
                  size="sm"
                />
              </div>
            </div>
          </TableCellWrapper>
        );
      },
    }),
    COLUMN_HELPER.accessor('selfBondedAmount', {
      header: () => 'Self-Bonded',
      cell: (props) => {
        const value = props.row.original.selfBondedAmount;
        const formatted = formatUnits(value, TANGLE_TOKEN_DECIMALS);
        const displayValue = Number(formatted).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        });
        return (
          <TableCellWrapper className="pl-3 min-h-fit">
            <Typography variant="body1">{displayValue} TNT</Typography>
          </TableCellWrapper>
        );
      },
      sortingFn: (rowA, rowB) => {
        const a = rowA.original.selfBondedAmount ?? BigInt(0);
        const b = rowB.original.selfBondedAmount ?? BigInt(0);
        return Number(a - b);
      },
    }),
    COLUMN_HELPER.accessor('instanceCount', {
      header: () => 'Instances',
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
