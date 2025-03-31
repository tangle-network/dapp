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
} from '@tangle-network/ui-components';
import { FC, useEffect, useMemo, useState } from 'react';
import { DeployStep2Props, SelectOperatorsTable } from './type';
import { BLUEPRINT_DEPLOY_STEPS } from '../../../../../utils/validations/deployBlueprint';
import useRestakeOperatorMap from '@tangle-network/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import { createColumnHelper, useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, getFilteredRowModel, RowSelectionState } from '@tanstack/react-table';
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

const COLUMN_HELPER = createColumnHelper<SelectOperatorsTable>();

export const DeployStep2: FC<DeployStep2Props> = ({
  errors: globalErrors,
  setValue,
}) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { operatorMap } = useRestakeOperatorMap();
  const operatorAddresses = useMemo(
    () =>
      Object.keys(operatorMap).map((address) =>
        assertSubstrateAddress(address),
      ),
    [operatorMap],
  );

  const { result: operatorServicesMap } = useOperatorsServices(operatorAddresses);
  const { result: identities } = useIdentities(operatorAddresses);
  const { assets } = useRestakeAssets();

  const activeNetwork = useNetworkStore().network;

  const operators = useMemo<SelectOperatorsTable[]>(
    () => {
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
              const parsed = safeFormatUnits(curr.amount, asset.metadata.decimals);

              if (parsed.success === false) {
                return acc;
              }
              const currPrice = Number(parsed.value) * (asset.metadata.priceInUsd ?? 0);
              return acc + currPrice;
            }, 0),
            vaultTokens: assets === null
              ? []
              : delegationsToVaultTokens(delegations, assets),
            instanceCount: operatorServicesMap.get(address)?.length ?? 0,
            // TODO: using graphql with im online pallet to get uptime of operator
            uptime: Math.round(Math.random() * 100),
          }
        },
      );
    },
    [
      operatorServicesMap,
      operatorMap,
      identities,
      assets,
    ],
  );

  const stepKey = BLUEPRINT_DEPLOY_STEPS[1];
  const errors = globalErrors?.[stepKey];

  const columns = [
    COLUMN_HELPER.accessor('address', {
      header: () => 'Identity',
      sortingFn: sortByAddressOrIdentity<SelectOperatorsTable>(),
      cell: (props) => {
        const {
          address,
          identityName: identity,
        } = props.row.original;
  
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
  
              <div className='flex items-center'>
                <Button variant='link' href='#'>
                  {identity ? identity : shortenString(address)}
                </Button>
                <KeyValueWithButton keyValue={""} size="sm" />
                {
                  accountUrl && (
                    <ExternalLinkIcon className='ml-1' href={accountUrl} target='_blank'/>
                  )
                }
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
            <Typography variant="body1">{props.row.original.instanceCount}</Typography>
          </TableCellWrapper>
        );
      },
    }),
    COLUMN_HELPER.accessor('restakersCount', {
      header: () => 'Restakers Count',
      cell: (props) => {
        return (
          <TableCellWrapper className="pl-3 min-h-fit">
            <Typography variant="body1">{props.row.original.restakersCount}</Typography>
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
              (props.row.original.uptime * DEFAULT_STACK) /
                DEFAULT_PERCENTAGE,
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
          <TableCellWrapper removeRightBorder className='pl-3 min-h-fit'>
              {tokensList.length > 0 ? (
                <div className='flex gap-2 items-center'>
                  <Typography variant="body1">
                    {
                      props.row.original.vaultTokensInUsd ? 
                        `$${props.row.original.vaultTokensInUsd}` :
                        EMPTY_VALUE_PLACEHOLDER
                    }
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
    data: operators,
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
    },
    getRowId: (row) => row.address,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  useEffect(() => {
    setValue(`${stepKey}.operators`, Object.keys(rowSelection));
  }, [rowSelection])

  return (
    <div className="w-full">
      <Typography variant="h4">Choose Operators</Typography>

      <Typography variant="body1" fw="normal" className='mt-4 mb-6 !text-mono-100'>After submitting request, operators will need to approve it before the instance deployment begins.</Typography>

      <Table
        variant={TableVariant.GLASS_OUTER}
        isPaginated
        tableProps={table}
        trClassName={'group overflow-hidden'}
      />

      {
        errors?.operators && (
          <ErrorMessage>
            {errors.operators.message}
          </ErrorMessage>
        )
      }
    </div>
  );
};
