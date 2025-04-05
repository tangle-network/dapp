import useNetworkStore from "@tangle-network/tangle-shared-ui/context/useNetworkStore";
import useOperatorsServices from "@tangle-network/tangle-shared-ui/data/blueprints/useOperatorsServices";
import useRestakeOperatorMap from "@tangle-network/tangle-shared-ui/data/restake/useRestakeOperatorMap";
import useIdentities from "@tangle-network/tangle-shared-ui/hooks/useIdentities";
import { assertSubstrateAddress, Avatar, CheckBox, EMPTY_VALUE_PLACEHOLDER, EnergyChipColors, EnergyChipStack, ExternalLinkIcon, fuzzyFilter, KeyValueWithButton, Table, Typography } from "@tangle-network/ui-components";
import { FC, useMemo } from "react";
import { OperatorSelectionTable } from "../type";
import safeFormatUnits from "@tangle-network/tangle-shared-ui/utils/safeFormatUnits";
import useRestakeAssets from "@tangle-network/tangle-shared-ui/data/restake/useRestakeAssets";
import delegationsToVaultTokens from "@tangle-network/tangle-shared-ui/utils/restake/delegationsToVaultTokens";
import { createColumnHelper, getFilteredRowModel, getSortedRowModel, getCoreRowModel, useReactTable, getPaginationRowModel, TableOptions } from "@tanstack/react-table";
import { sortByAddressOrIdentity } from "@tangle-network/tangle-shared-ui/components/tables/utils";
import TableCellWrapper from "@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper";
import VaultsDropdown from "@tangle-network/tangle-shared-ui/components/tables/Operators/VaultsDropdown";
import { TableVariant } from "@tangle-network/ui-components/components/Table/types";

const COLUMN_HELPER = createColumnHelper<OperatorSelectionTable>();

type Props = Omit<TableOptions<OperatorSelectionTable>, 'data' | 'columns' | 'getCoreRowModel'> & {
  advanceFilter?: (row: OperatorSelectionTable) => boolean;
};

export const OperatorTable: FC<Props> = ({
  advanceFilter,
  ...tableProps
}) => {
  const { assets } = useRestakeAssets();
  const { operatorMap } = useRestakeOperatorMap();
  const operatorAddresses = useMemo(
    () =>
      Object.keys(operatorMap).map((address) =>
        assertSubstrateAddress(address),
      ),
    [operatorMap],
  );

  const { result: operatorServicesMap } =
    useOperatorsServices(operatorAddresses);
  const { result: identities } = useIdentities(operatorAddresses);

  const activeNetwork = useNetworkStore().network;

  // TODO: fetch and combine with registered operators
  const operators = useMemo<OperatorSelectionTable[]>(() => {
    return Object.entries(operatorMap).map(
      ([addressString, { delegations, restakersCount }]) => {
        const address = assertSubstrateAddress(addressString);

        return {
          address,
          identityName: identities.get(address)?.name ?? undefined,
          restakersCount,
          vaultTokensInUsd: delegations.reduce((acc, curr) => {
            const asset = assets?.get(curr.assetId);
            if (!asset) {
              return acc;
            }
            const parsed = safeFormatUnits(
              curr.amount,
              asset.metadata.decimals,
            );

            if (parsed.success === false) {
              return acc;
            }
            const currPrice =
              Number(parsed.value) * (asset.metadata.priceInUsd ?? 0);
            return acc + currPrice;
          }, 0),
          vaultTokens:
            assets === null
              ? []
              : delegationsToVaultTokens(delegations, assets),
          instanceCount: operatorServicesMap.get(address)?.length ?? 0,
          // TODO: using graphql with im online pallet to get uptime of operator
          uptime: Math.round(Math.random() * 100),
        };
      },
    );
  }, [operatorServicesMap, operatorMap, identities, assets]);

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
              {
                tableProps.enableRowSelection && (
                  <CheckBox
                    wrapperClassName="!block !min-h-auto cursor-pointer"
                    className="cursor-pointer"
                    isChecked={props.row.getIsSelected()}
                    onChange={props.row.getToggleSelectedHandler()}
                  />
                )
              }

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
    COLUMN_HELPER.accessor('instanceCount', {
      header: () => 'Instance Count',
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
      header: () => 'Restakers Count',
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

        const activeColors = Array.from({ length: numberOfActiveChips }).fill(
          EnergyChipColors.GREEN,
        );
        const inactiveColors = Array.from({
          length: DEFAULT_STACK - numberOfActiveChips,
        }).fill(EnergyChipColors.GREY);
        const colors = [...activeColors, ...inactiveColors];

        return (
          <TableCellWrapper className="pl-3 min-h-fit">
            <EnergyChipStack
              colors={colors as EnergyChipColors[]}
              label={`${props.row.original.uptime || EMPTY_VALUE_PLACEHOLDER}%`}
            />
          </TableCellWrapper>
        );
      },
    }),
    COLUMN_HELPER.accessor('vaultTokensInUsd', {
      header: () => 'Vault TVL',
      cell: (props) => {
        const tokensList = props.row.original.vaultTokens ?? [];
        return (
          <TableCellWrapper removeRightBorder className="pl-3 min-h-fit">
            {tokensList.length > 0 ? (
              <div className="flex gap-2 items-center">
                <Typography variant="body1">
                  {props.row.original.vaultTokensInUsd
                    ? `$${props.row.original.vaultTokensInUsd}`
                    : EMPTY_VALUE_PLACEHOLDER}
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

  const tableData = useMemo(() => {
    if (advanceFilter) {
      return operators.filter(advanceFilter);
    }
    return operators;
  }, [operators, advanceFilter]);

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
  )
}
