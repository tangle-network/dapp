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
} from '@tangle-network/ui-components';
import { FC, useState } from 'react';
import { DeployStep2Props, SelectOperatorsTable } from './type';
import { BLUEPRINT_DEPLOY_STEPS } from '../../../../../utils/validations/deployBlueprint';
import useRestakeDelegatorInfo from '@tangle-network/tangle-shared-ui/data/restake/useRestakeDelegatorInfo';
import useRestakeOperatorMap from '@tangle-network/tangle-shared-ui/data/restake/useRestakeOperatorMap';
import useRestakeTVL from '@tangle-network/tangle-shared-ui/data/restake/useRestakeTVL';
import { createColumnHelper, ColumnDef, useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, getFilteredRowModel, RowSelectionState } from '@tanstack/react-table';
import { sortByAddressOrIdentity } from '@tangle-network/tangle-shared-ui/components/tables/utils';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import { TableVariant } from '@tangle-network/ui-components/components/Table/types';
import useNetworkStore from '@tangle-network/tangle-shared-ui/context/useNetworkStore';
import { Network } from '@tangle-network/ui-components/constants/networks';

const COLUMN_HELPER = createColumnHelper<SelectOperatorsTable>();

const getStaticColumns = (createExplorerAccountUrl: Network['createExplorerAccountUrl']): ColumnDef<SelectOperatorsTable, any>[] => [
  COLUMN_HELPER.accessor('address', {
    header: () => 'Identity',
    sortingFn: sortByAddressOrIdentity<SelectOperatorsTable>(),
    cell: (props) => {
      const {
        address,
        identityName: identity,
      } = props.row.original;

      const accountUrl = createExplorerAccountUrl(address);

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
      return (
        <TableCellWrapper removeRightBorder className='pl-3 min-h-fit'>
            <Typography variant="body1">100$</Typography>
        </TableCellWrapper>
      );
    },
    sortingFn: (rowA, rowB) => {
      const aVaultTokens = rowA.original.vaultTokensInUsd;
      const bVaultTokens = rowB.original.vaultTokensInUsd;

      return aVaultTokens - bVaultTokens;
    },
  }),
];

export const DeployStep2: FC<DeployStep2Props> = ({
  errors: globalErrors,
  setValue,
  watch,
  blueprint,
}) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { delegatorInfo } = useRestakeDelegatorInfo();
  const { operatorMap } = useRestakeOperatorMap();
  const { operatorConcentration, operatorTVL } = useRestakeTVL(
    operatorMap,
    delegatorInfo,
  );
  const activeNetwork = useNetworkStore().network;

  const stepKey = BLUEPRINT_DEPLOY_STEPS[1];
  const values = watch(stepKey);

  const errors = globalErrors?.[stepKey];

  const columns = getStaticColumns(activeNetwork.createExplorerAccountUrl);

  const table = useReactTable({
    data: [],
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
    </div>
  );
};
