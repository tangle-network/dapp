import { ComponentProps, useMemo, useState, type FC } from 'react';
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
  Table,
  Typography,
} from '@tangle-network/ui-components';
import getTVLToDisplay from '@tangle-network/tangle-shared-ui/utils/getTVLToDisplay';
import { TableStatusProps } from '@tangle-network/tangle-shared-ui/components/tables/TableStatus';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { TangleCloudTable } from '@tangle-network/tangle-shared-ui/components/tables/TangleCloudTable';

export type BlueprintMonitoringItem = {
  id: string;
  name: string;
  author: string;
  imgUrl: string | null;
  description: string | null;
  restakersCount: number | null;
  operatorsCount: number | null;
  tvl: number | null;
  uptime: number | null;
  pricing: number | null;
  pricingUnit: string | null;
  instanceCount: number | null;
};

export type BlueprintMonitoringTableProps = {
  blueprints: BlueprintMonitoringItem[];
  isLoading: boolean;
  error: Error | null;
  loadingTableProps?: Partial<TableStatusProps>;
  emptyTableProps?: Partial<TableStatusProps>;
  tableConfig?: Partial<ComponentProps<typeof Table<BlueprintMonitoringItem>>>;
};

const columnHelper = createColumnHelper<BlueprintMonitoringItem>();

const MOCK_BLUEPRINTS = [
  {
    id: 'bp-01',
    name: 'Ethereum Staking Pool asdga idgasi dgausidgi agiadsiuasgduaidaisydfg i',
    author: 'TangleDAO',
    imgUrl: 'https://dummyimage.com/100x100',
    description:
      'Decentralized ETH staking pool with automated rewards distribution',
    restakersCount: 156,
    operatorsCount: 12,
    tvl: 2450000,
    uptime: 99.98,
    pricing: 0.05,
    pricingUnit: 'Hrs',
    instanceCount: 3,
  },
  {
    id: 'bp-02',
    name: 'Validator Node',
    author: 'ValidatorTech',
    imgUrl: 'https://dummyimage.com/100x100',
    description: 'Professional grade validator node setup',
    restakersCount: 89,
    operatorsCount: 5,
    tvl: 890000,
    uptime: 99.95,
    pricing: 0.02,
    pricingUnit: 'Hrs',
    instanceCount: 8,
  },
  {
    id: 'bp-03',
    name: 'Liquid Staking Protocol',
    author: 'StakeWise',
    imgUrl: 'https://dummyimage.com/100x100',
    description: null,
    restakersCount: 234,
    operatorsCount: 15,
    tvl: 5600000,
    uptime: 99.99,
    pricing: 0.08,
    pricingUnit: 'Hrs',
    instanceCount: 2,
  },
  {
    id: 'bp-04',
    name: 'Solo Staking Setup',
    author: 'StakeHub',
    imgUrl: 'https://dummyimage.com/100x100',
    description: 'Individual staking node configuration',
    restakersCount: null,
    operatorsCount: 1,
    tvl: 32000,
    uptime: 99.9,
    pricing: null,
    pricingUnit: null,
    instanceCount: 12,
  },
  {
    id: 'bp-05',
    name: 'Multi-Chain Validator',
    author: 'ChainOps',
    imgUrl: 'https://dummyimage.com/100x100',
    description: 'Cross-chain validation infrastructure',
    restakersCount: 45,
    operatorsCount: 8,
    tvl: null,
    uptime: 99.95,
    pricing: 0.1,
    pricingUnit: 'Hrs',
    instanceCount: 5,
  },
  {
    id: 'bp-06',
    name: 'Staking Dashboard',
    author: 'MetricsLab',
    imgUrl: 'https://dummyimage.com/100x100',
    description: 'Comprehensive staking metrics and monitoring',
    restakersCount: 78,
    operatorsCount: null,
    tvl: 150000,
    uptime: null,
    pricing: 0.015,
    pricingUnit: 'Hrs',
    instanceCount: 15,
  },
  {
    id: 'bp-07',
    name: 'Automated Restaking',
    author: 'AutoStake',
    imgUrl: 'https://dummyimage.com/100x100',
    description: 'Automated restaking mechanism',
    restakersCount: 312,
    operatorsCount: 4,
    tvl: 780000,
    uptime: 99.97,
    pricing: 0.03,
    pricingUnit: 'Hrs',
    instanceCount: 6,
  },
  {
    id: 'bp-08',
    name: 'Security Module',
    author: 'SecureStake',
    imgUrl: 'https://dummyimage.com/100x100',
    description: null,
    restakersCount: 67,
    operatorsCount: 3,
    tvl: 230000,
    uptime: 99.99,
    pricing: 0.025,
    pricingUnit: 'Hrs',
    instanceCount: 9,
  },
  {
    id: 'bp-09',
    name: 'MEV Boost Relay',
    author: 'MEVTech',
    imgUrl: null,
    description: 'MEV-Boost relay implementation',
    restakersCount: 145,
    operatorsCount: 6,
    tvl: 1200000,
    uptime: 99.96,
    pricing: 0.04,
    pricingUnit: 'Hrs',
    instanceCount: 4,
  },
  {
    id: 'bp-10',
    name: 'Analytics Suite',
    author: 'DataStake',
    imgUrl: 'https://dummyimage.com/100x100',
    description: 'Advanced staking analytics and reporting',
    restakersCount: null,
    operatorsCount: 2,
    tvl: 45000,
    uptime: 99.93,
    pricing: 0.01,
    pricingUnit: 'Hrs',
    instanceCount: 18,
  },
];

export const RegisteredBlueprints: FC = () => {
  const [blueprints, setBlueprints] =
    useState<BlueprintMonitoringItem[]>(MOCK_BLUEPRINTS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [loadingTableProps, setLoadingTableProps] = useState<
    Partial<TableStatusProps>
  >({});
  const [emptyTableProps, setEmptyTableProps] = useState<
    Partial<TableStatusProps>
  >({});

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
                ? getTVLToDisplay(props.row.original.tvl)
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
