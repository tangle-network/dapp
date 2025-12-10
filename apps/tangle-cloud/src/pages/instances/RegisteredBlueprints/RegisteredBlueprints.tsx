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
  Typography,
} from '@tangle-network/ui-components';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { TangleCloudTable } from '../../../components/tangleCloudTable/TangleCloudTable';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import { Link } from 'react-router';
import { PagePath } from '../../../types';
import useEvmOperatorInfo from '../../../hooks/useEvmOperatorInfo';
import {
  useBlueprintsWithMetadata,
  type BlueprintWithMetadata,
} from '@tangle-network/tangle-shared-ui/data/graphql';

const columnHelper = createColumnHelper<BlueprintWithMetadata>();

export const RegisteredBlueprints: FC = () => {
  const { operatorAddress } = useEvmOperatorInfo();

  // Fetch all blueprints with metadata
  const {
    data: allBlueprints,
    isLoading,
    error,
  } = useBlueprintsWithMetadata({ activeOnly: true });

  // Filter to only show blueprints where the operator is registered
  // For now, show all active blueprints as the filtering logic will depend on indexer data
  const data = useMemo(() => {
    if (!allBlueprints || !operatorAddress) return [];
    // TODO: Filter to only show blueprints where operator is registered
    // This requires additional indexer data for operator-blueprint relationships
    return allBlueprints;
  }, [allBlueprints, operatorAddress]);

  const isEmpty = data.length === 0;

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: () => 'Blueprint',
        cell: (props) => {
          const blueprint = props.row.original;
          return (
            <TableCellWrapper className="p-3 min-h-fit">
              <div className="flex items-center gap-3 overflow-hidden">
                {blueprint.logo ? (
                  <Avatar
                    size="lg"
                    className="min-w-12 shadow-sm"
                    src={blueprint.logo}
                    alt={blueprint.name}
                    sourceVariant="uri"
                  />
                ) : (
                  <Avatar
                    size="lg"
                    className="min-w-12 shadow-sm"
                    sourceVariant="address"
                    value={blueprint.owner}
                    theme="ethereum"
                  />
                )}
                <Typography
                  variant="body1"
                  fw="bold"
                  className="text-mono-200 dark:text-mono-0 text-ellipsis whitespace-nowrap overflow-hidden"
                >
                  {blueprint.name}
                </Typography>
              </div>
            </TableCellWrapper>
          );
        },
      }),

      columnHelper.accessor('serviceCount', {
        header: () => 'Instances',
        cell: (props) => {
          return (
            <TableCellWrapper className="p-3 min-h-fit">
              <Typography
                variant="body1"
                fw="semibold"
                className="text-mono-160 dark:text-mono-60"
              >
                {props.row.original.serviceCount?.toLocaleString() ??
                  EMPTY_VALUE_PLACEHOLDER}
              </Typography>
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('operatorCount', {
        header: () => 'Operators',
        cell: (props) => {
          return (
            <TableCellWrapper className="p-3 min-h-fit">
              <Typography
                variant="body1"
                fw="semibold"
                className="text-mono-160 dark:text-mono-60"
              >
                {Number(props.row.original.operatorCount ?? 0).toLocaleString()}
              </Typography>
            </TableCellWrapper>
          );
        },
      }),

      columnHelper.accessor('blueprintId', {
        header: () => '',
        cell: (props) => {
          return (
            <TableCellWrapper removeRightBorder className="p-3 min-h-fit">
              <Link
                to={PagePath.BLUEPRINTS_DETAILS.replace(
                  ':id',
                  props.row.original.blueprintId.toString(),
                )}
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                <Button
                  variant="utility"
                  className="uppercase body4 bg-blue-10 dark:bg-blue-120 text-blue-70 dark:text-blue-40 hover:bg-blue-20 dark:hover:bg-blue-110 border border-blue-30 dark:border-blue-100 transition-all duration-200"
                >
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
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => `blueprint-${row.blueprintId.toString()}`,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  return (
    <TangleCloudTable<BlueprintWithMetadata>
      title={pluralize('blueprint', !isEmpty)}
      data={data}
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
