import { useMemo, useState, type FC } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Avatar,
  EMPTY_VALUE_PLACEHOLDER,
  EnergyChipColors,
  EnergyChipStack,
  getRoundedAmountString,
  Typography,
} from '@tangle-network/ui-components';
import getTVLToDisplay from '@tangle-network/tangle-shared-ui/utils/getTVLToDisplay';
import { TableStatusProps } from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { TangleCloudTable } from '../../../components/tangleCloudTable/TangleCloudTable';
import { BlueprintMonitoringItem } from './type';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';

const columnHelper = createColumnHelper<BlueprintMonitoringItem>();

const MOCK_BLUEPRINTS: BlueprintMonitoringItem[] = [
  {
    id: 'bp-01',
    name: 'Ethereum Staking Pool asdga idgasi dgausidgi agiadsiuasgduaidaisydfg i',
    author: 'TangleDAO',
    imgUrl: 'https://dummyimage.com/100x100',
    description:
      'Decentralized ETH staking pool with automated rewards distribution',
    restakersCount: 156,
    operatorsCount: 12,
    tvl: '2450000',
    tvlInUsd: 24.5,
    uptime: 99.98,
    pricing: 0.05,
    pricingUnit: 'Hrs',
    instanceCount: 3,
    registrationParams: [],
    category: 'staking',
  },
  {
    id: 'bp-02',
    name: 'Validator Node',
    author: 'ValidatorTech',
    imgUrl: 'https://dummyimage.com/100x100',
    description: 'Professional grade validator node setup',
    restakersCount: 89,
    operatorsCount: 5,
    tvl: '890000',
    tvlInUsd: 8.9,
    uptime: 99.95,
    pricing: 0.02,
    pricingUnit: 'Hrs',
    instanceCount: 8,
    registrationParams: [],
    category: 'staking',
  },
];

export const RegisteredBlueprints: FC = () => {
  // TODO: Remove mock data
  const [blueprints] = useState<BlueprintMonitoringItem[]>(MOCK_BLUEPRINTS);
  const [isLoading] = useState(false);
  const [error] = useState<Error | null>(null);
  const loadingTableProps: Partial<TableStatusProps> = {};
  const emptyTableProps: Partial<TableStatusProps> = {};

  const isEmpty = blueprints.length === 0;

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: () => 'Blueprint',
        cell: (props) => {
          return (
            <TableCellWrapper>
              <div className="flex items-center gap-2 overflow-hidden">
                {props.row.original.imgUrl ? (
                  <Avatar
                    size="lg"
                    className="min-w-12"
                    src={props.row.original.imgUrl}
                    alt={props.row.original.name}
                    sourceVariant="uri"
                  />
                ) : (
                  <Avatar
                    size="lg"
                    className="min-w-12"
                    fallback={props.row.original.name.substring(0, 2)}
                    theme="substrate"
                  />
                )}
                <Typography
                  variant="body1"
                  fw="bold"
                  className="!text-blue-50 text-ellipsis whitespace-nowrap overflow-hidden"
                >
                  {props.row.original.name}
                </Typography>
              </div>
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('pricing', {
        header: () => 'Pricing',
        cell: (props) => {
          return (
            <TableCellWrapper>
              {props.row.original.pricing
                ? `$${getRoundedAmountString(props.row.original.pricing)}`
                : EMPTY_VALUE_PLACEHOLDER}
              /
              {props.row.original.pricingUnit
                ? props.row.original.pricingUnit
                : EMPTY_VALUE_PLACEHOLDER}
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('uptime', {
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
            <TableCellWrapper>
              <EnergyChipStack
                colors={colors as EnergyChipColors[]}
                label={`${props.row.original.uptime || EMPTY_VALUE_PLACEHOLDER}%`}
              />
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('instanceCount', {
        header: () => 'Instances',
        cell: (props) => {
          return (
            <TableCellWrapper>
              <Typography variant="body1" fw="normal">
                {props.row.original.instanceCount?.toLocaleString() ??
                  EMPTY_VALUE_PLACEHOLDER}
              </Typography>
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('operatorsCount', {
        header: () => 'Operators',
        cell: (props) => {
          return (
            <TableCellWrapper>
              {props.row.original.operatorsCount?.toLocaleString() ??
                EMPTY_VALUE_PLACEHOLDER}
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('tvl', {
        header: () => 'TVL',
        cell: (props) => {
          return (
            <TableCellWrapper removeRightBorder>
              {props.row.original.tvl
                ? getTVLToDisplay(props.row.original.tvlInUsd)
                : EMPTY_VALUE_PLACEHOLDER}
            </TableCellWrapper>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: blueprints,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  return (
    <TangleCloudTable<BlueprintMonitoringItem>
      title={pluralize('blueprint', !isEmpty)}
      data={blueprints}
      error={error}
      isLoading={isLoading}
      loadingTableProps={loadingTableProps}
      emptyTableProps={emptyTableProps}
      tableProps={table}
      tableConfig={{
        tableClassName: 'min-w-[1000px]',
      }}
    />
  );
};

RegisteredBlueprints.displayName = 'RegisteredBlueprints';
