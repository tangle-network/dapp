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
  const [blueprints, setBlueprints] =
    useState<BlueprintMonitoringItem[]>(MOCK_BLUEPRINTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const loadingTableProps: Partial<TableStatusProps> = {};
  const emptyTableProps: Partial<TableStatusProps> = {};

  const isEmpty = blueprints.length === 0;

  /**
   * `h-12` is followed the `lg` size of `Avatar` component
   * to make the table cells have the same height
   */
  const commonCellClassName = 'h-12 flex items-center';
  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: () => 'Blueprint',
        cell: (props) => {
          return (
            <div className="flex items-center gap-2">
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
          );
        },
      }),
      columnHelper.accessor('pricing', {
        header: () => 'Pricing',
        cell: (props) => {
          return (
            <div className={commonCellClassName}>
              {props.row.original.pricing
                ? `$${getRoundedAmountString(props.row.original.pricing)}`
                : EMPTY_VALUE_PLACEHOLDER}
              /
              {props.row.original.pricingUnit
                ? props.row.original.pricingUnit
                : EMPTY_VALUE_PLACEHOLDER}
            </div>
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
            <EnergyChipStack
              className={commonCellClassName}
              colors={colors as EnergyChipColors[]}
              label={`${props.row.original.uptime || EMPTY_VALUE_PLACEHOLDER}%`}
            />
          );
        },
      }),
      columnHelper.accessor('instanceCount', {
        header: () => 'Instances',
        cell: (props) => {
          return (
            <Typography
              variant="body1"
              fw="normal"
              className={commonCellClassName}
            >
              {props.row.original.instanceCount?.toLocaleString() ??
                EMPTY_VALUE_PLACEHOLDER}
            </Typography>
          );
        },
      }),
      columnHelper.accessor('operatorsCount', {
        header: () => 'Operators',
        cell: (props) => {
          return (
            <div className={commonCellClassName}>
              {props.row.original.operatorsCount?.toLocaleString() ??
                EMPTY_VALUE_PLACEHOLDER}
            </div>
          );
        },
      }),
      columnHelper.accessor('tvl', {
        header: () => 'TVL',
        cell: (props) => {
          return (
            <div className={commonCellClassName}>
              {props.row.original.tvl
                ? getTVLToDisplay(props.row.original.tvlInUsd)
                : EMPTY_VALUE_PLACEHOLDER}
            </div>
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
