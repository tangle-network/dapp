import {
  Typography,
  Avatar,
  shortenString,
  KeyValueWithButton,
  Table,
  EnergyChipColors,
  EnergyChipStack,
  EMPTY_VALUE_PLACEHOLDER,
  CheckBox,
  Button,
  ExternalLinkIcon,
  assertSubstrateAddress,
  Input,
  fuzzyFilter,
} from '@tangle-network/ui-components';
import { FC, useEffect, useMemo, useState, Children } from 'react';
import { DeployStep2Props, SelectOperatorsTable } from './type';
import { BLUEPRINT_DEPLOY_STEPS } from '../../../../../utils/validations/deployBlueprint';
import useRestakeOperatorMap from '@tangle-network/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  RowSelectionState,
} from '@tanstack/react-table';
import { sortByAddressOrIdentity } from '@tangle-network/tangle-shared-ui/components/tables/utils';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import { TableVariant } from '@tangle-network/ui-components/components/Table/types';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import ErrorMessage from '../../../../../components/ErrorMessage';
import useIdentities from '@tangle-network/tangle-shared-ui/hooks/useIdentities';
import useRestakeAssets from '@tangle-network/tangle-shared-ui/data/restake/useRestakeAssets';
import safeFormatUnits from '@tangle-network/tangle-shared-ui/utils/safeFormatUnits';
import useOperatorsServices from '@tangle-network/tangle-shared-ui/data/blueprints/useOperatorsServices';
import delegationsToVaultTokens from '@tangle-network/tangle-shared-ui/utils/restake/delegationsToVaultTokens';
import VaultsDropdown from '@tangle-network/tangle-shared-ui/components/tables/Operators/VaultsDropdown';
import {
  Select,
  SelectContent,
  SelectCheckboxItem,
  SelectTrigger,
  SelectValue,
} from '@tangle-network/ui-components/components/select';
import { Search } from '@tangle-network/icons';
import LsTokenIcon from '@tangle-network/tangle-shared-ui/components/LsTokenIcon';
import { RestakeAsset } from '@tangle-network/tangle-shared-ui/types/restake';

const COLUMN_HELPER = createColumnHelper<SelectOperatorsTable>();

const MAX_ASSET_TO_SHOW = 3;

export const DeployStep2: FC<DeployStep2Props> = ({
  errors: globalErrors,
  setValue,
}) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedAssets, setSelectedAssets] = useState<RestakeAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

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
  const { assets } = useRestakeAssets();

  const activeNetwork = useNetworkStore().network;

  const operators = useMemo<SelectOperatorsTable[]>(() => {
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

  const stepKey = BLUEPRINT_DEPLOY_STEPS[1];
  const errors = globalErrors?.[stepKey];

  const columns = [
    COLUMN_HELPER.accessor('address', {
      header: () => 'Identity',
      sortingFn: sortByAddressOrIdentity<SelectOperatorsTable>(),
      cell: (props) => {
        const { address, identityName: identity } = props.row.original;

        const accountUrl = activeNetwork.createExplorerAccountUrl(address);

        return (
          <TableCellWrapper className="pl-3 min-h-fit">
            <div className="flex items-center flex-1 gap-2 pr-3">
              <CheckBox
                wrapperClassName="!block !min-h-auto cursor-pointer"
                className="cursor-pointer"
                isChecked={props.row.getIsSelected()}
                onChange={props.row.getToggleSelectedHandler()}
              />

              <Avatar
                sourceVariant="address"
                value={address}
                theme="substrate"
                size="md"
              />

              <div className="flex items-center">
                <Button variant="link" href="#">
                  {identity ? identity : shortenString(address)}
                </Button>
                <KeyValueWithButton keyValue={''} size="sm" />
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
      sortingFn: sortByAddressOrIdentity<SelectOperatorsTable>(),
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
    if (selectedAssets.length === 0) return operators;

    const selectedSymbols = new Set(
      selectedAssets.map((asset) => asset.metadata.symbol),
    );

    return operators.filter((operator) =>
      operator.vaultTokens?.some((vaultToken) =>
        selectedSymbols.has(vaultToken.symbol),
      ),
    );
  }, [selectedAssets, operators]);
  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
    onRowSelectionChange: (onChange) => {
      setRowSelection(onChange);
    },
    initialState: {
      sorting: [
        {
          id: 'vaultTokensInUsd',
          desc: true,
        },
        {
          id: 'instanceCount',
          desc: true,
        },
      ],
    },
    state: {
      rowSelection,
      columnFilters: [
        {
          id: 'address',
          value: searchQuery,
        },
      ],
    },
    filterFns: {
      fuzzy: fuzzyFilter,
    },
    globalFilterFn: fuzzyFilter,
    getRowId: (row) => row.address,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  useEffect(() => {
    setValue(`${stepKey}.operators`, Object.keys(rowSelection));
  }, [rowSelection]);

  return (
    <div className="w-full">
      <Typography variant="h4">Choose Operators</Typography>

      <Typography
        variant="body1"
        fw="normal"
        className="mt-4 mb-6 !text-mono-100"
      >
        After submitting request, operators will need to approve it before the
        instance deployment begins.
      </Typography>

      <div className="flex justify-between mb-3">
        <div className="w-1/4">
          <Select>
            <SelectTrigger>
              <SelectValue
                placeholder={
                  selectedAssets.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="flex items-center">
                        {Children.toArray(
                          selectedAssets
                            .slice(0, MAX_ASSET_TO_SHOW)
                            .map((asset) => (
                              <div>
                                <LsTokenIcon
                                  name={asset.metadata.name ?? 'TNT'}
                                  size="md"
                                />
                              </div>
                            )),
                        )}
                        {selectedAssets.length > MAX_ASSET_TO_SHOW && (
                          <Typography variant="body1" className="ml-1">
                            ..
                          </Typography>
                        )}
                      </div>
                      <Typography variant="body1">
                        {selectedAssets.length} asset(s) selected
                      </Typography>
                    </div>
                  ) : (
                    `Filter by asset(s)`
                  )
                }
              />
            </SelectTrigger>

            <SelectContent>
              {Children.toArray(
                Array.from(assets?.values() ?? []).map((asset) => (
                  <SelectCheckboxItem
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedAssets([...selectedAssets, asset]);
                      } else {
                        setSelectedAssets(
                          selectedAssets.filter(
                            (asset) => asset.id !== asset.id,
                          ),
                        );
                      }
                    }}
                    id={asset.id}
                    isChecked={selectedAssets.some(
                      (selectedAsset) => selectedAsset.id === asset.id,
                    )}
                    spacingClassName="ml-0"
                  >
                    <div className="flex items-center gap-2">
                      <LsTokenIcon
                        name={asset.metadata.name ?? 'TNT'}
                        size="md"
                      />
                      <Typography variant="body1">
                        {asset.metadata.name ?? 'TNT'}
                      </Typography>
                    </div>
                  </SelectCheckboxItem>
                )),
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="w-1/4">
          <Input
            debounceTime={300}
            isControlled
            leftIcon={<Search />}
            id="search"
            placeholder="Search operator"
            size="md"
            value={searchQuery}
            onChange={setSearchQuery}
            inputClassName="py-1"
          />
        </div>
      </div>
      <Table
        variant={TableVariant.GLASS_OUTER}
        isPaginated
        tableProps={table}
        trClassName={'group overflow-hidden'}
      />

      {errors?.operators && (
        <ErrorMessage>{errors.operators.message}</ErrorMessage>
      )}
    </div>
  );
};
