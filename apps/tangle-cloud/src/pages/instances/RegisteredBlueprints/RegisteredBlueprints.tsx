import { useMemo, type FC } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Avatar,
  Button,
  EMPTY_VALUE_PLACEHOLDER,
  EnergyChipColors,
  EnergyChipStack,
  Typography,
} from '@tangle-network/ui-components';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { TangleCloudTable } from '../../../components/tangleCloudTable/TangleCloudTable';
import { MonitoringBlueprint } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import { Link } from 'react-router';
import { PagePath } from '../../../types';
import getTVLToDisplay from '@tangle-network/tangle-shared-ui/utils/getTVLToDisplay';

export type RegisteredBlueprintsTableProps = {
  blueprints: MonitoringBlueprint[];
  isLoading: boolean;
  error: Error | null;
};
const columnHelper = createColumnHelper<MonitoringBlueprint>();

export const RegisteredBlueprints: FC<RegisteredBlueprintsTableProps> = ({
  blueprints,
  isLoading,
  error,
}) => {
  const isEmpty = blueprints.length === 0;

  const columns = useMemo(
    () => [
      columnHelper.accessor('blueprint.metadata.name', {
        header: () => 'Blueprint',
        cell: (props) => {
          return (
            <TableCellWrapper className="p-0 min-h-fit">
              <div className="flex items-center gap-2 overflow-hidden">
                {props.row.original.blueprint.metadata.logo ? (
                  <Avatar
                    size="lg"
                    className="min-w-12"
                    src={props.row.original.blueprint.metadata.logo}
                    alt={props.row.original.blueprint.metadata.name}
                    sourceVariant="uri"
                  />
                ) : (
                  <Avatar
                    size="lg"
                    className="min-w-12"
                    value={props.row.original.blueprint.metadata.name.substring(
                      0,
                      2,
                    )}
                    theme="substrate"
                  />
                )}
                <Typography
                  variant="body1"
                  fw="bold"
                  className="!text-blue-50 text-ellipsis whitespace-nowrap overflow-hidden"
                >
                  {props.row.original.blueprint.metadata.name}
                </Typography>
              </div>
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('blueprint.uptime', {
        header: () => 'Uptime',
        cell: (props) => {
          const DEFAULT_STACK = 10;
          const DEFAULT_PERCENTAGE = 100;

          const numberOfActiveChips = !props.row.original.blueprint.uptime
            ? 0
            : Math.round(
                (props.row.original.blueprint.uptime * DEFAULT_STACK) /
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
            <TableCellWrapper className="p-0 min-h-fit">
              <EnergyChipStack
                colors={colors as EnergyChipColors[]}
                label={`${props.row.original.blueprint.uptime || EMPTY_VALUE_PLACEHOLDER}%`}
              />
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('blueprint.instanceCount', {
        header: () => 'Instances',
        cell: (props) => {
          return (
            <TableCellWrapper className="p-0 min-h-fit">
              <Typography variant="body1" fw="normal">
                {props.row.original.blueprint.instanceCount?.toLocaleString() ??
                  EMPTY_VALUE_PLACEHOLDER}
              </Typography>
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('blueprint.operatorsCount', {
        header: () => 'Operators',
        cell: (props) => {
          return (
            <TableCellWrapper className="p-0 min-h-fit">
              {props.row.original.blueprint.operatorsCount?.toLocaleString() ??
                EMPTY_VALUE_PLACEHOLDER}
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('blueprint.tvl', {
        header: () => 'TVL',
        cell: (props) => {
          return (
            <TableCellWrapper className="p-0 min-h-fit">
              {props.row.original.blueprint.tvl
                ? getTVLToDisplay(props.row.original.blueprint.tvl)
                : EMPTY_VALUE_PLACEHOLDER}
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('blueprintId', {
        header: () => '',
        cell: (props) => {
          return (
            <TableCellWrapper removeRightBorder className="p-0 min-h-fit">
              <Link
                to={PagePath.BLUEPRINTS_DETAILS.replace(
                  ':id',
                  props.row.original.blueprintId.toString(),
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                <Button variant="utility" className="uppercase body4">
                  View
                </Button>
              </Link>
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
    getRowId: (row) => `blueprint-${row.blueprintId.toString()}`,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  return (
    <TangleCloudTable<MonitoringBlueprint>
      title={pluralize('blueprint', !isEmpty)}
      data={blueprints}
      error={error}
      isLoading={isLoading}
      tableProps={table}
      tableConfig={{
        tableClassName: 'min-w-[1000px]',
      }}
    />
  );
};

RegisteredBlueprints.displayName = 'RegisteredBlueprints';
