import { useMemo, type FC } from 'react';
import {
  createColumnHelper,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Avatar, Button, Text } from '../../../components/sandbox/SandboxUi';
import { TangleCloudTable } from '../../../components/tangleCloudTable/TangleCloudTable';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import { Link } from 'react-router';
import { PagePath } from '../../../types';
import useEvmOperatorInfo from '../../../hooks/useEvmOperatorInfo';
import {
  useOperatorRegistrations,
  useBlueprintsWithMetadata,
  type BlueprintWithMetadata,
} from '@tangle-network/tangle-shared-ui/data/graphql';

const EMPTY_VALUE_PLACEHOLDER = '-';

const columnHelper = createColumnHelper<BlueprintWithMetadata>();
const pluralize = (word: string, plural: boolean) =>
  plural ? `${word}s` : word;

export const RegisteredBlueprints: FC = () => {
  const { operatorAddress } = useEvmOperatorInfo();

  // Fetch all blueprints with metadata
  const {
    data: allBlueprints,
    isLoading: isLoadingBlueprints,
    error: blueprintsError,
  } = useBlueprintsWithMetadata({ activeOnly: true });

  const {
    data: operatorRegistrations,
    isLoading: isLoadingRegistrations,
    error: registrationsError,
  } = useOperatorRegistrations();

  const isLoading = isLoadingBlueprints || isLoadingRegistrations;
  const error = blueprintsError ?? registrationsError;

  // Show only active blueprints where the current operator has an ACTIVE registration.
  const data = useMemo(() => {
    if (!allBlueprints || !operatorAddress || !operatorRegistrations) return [];

    const activeRegisteredBlueprintIds = new Set(
      operatorRegistrations
        .filter((registration) => registration.active)
        .map((registration) => registration.blueprintId.toString()),
    );

    return allBlueprints.filter((blueprint) =>
      activeRegisteredBlueprintIds.has(blueprint.blueprintId.toString()),
    );
  }, [allBlueprints, operatorAddress, operatorRegistrations]);

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
                {blueprint.imageUrl ? (
                  <Avatar
                    size="lg"
                    className="min-w-12 shadow-sm"
                    src={blueprint.imageUrl}
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
                <Text
                  variant="body1"
                  fw="bold"
                  className="text-ellipsis whitespace-nowrap overflow-hidden"
                >
                  {blueprint.name}
                </Text>
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
              <Text
                variant="body1"
                fw="semibold"
                className="text-mono-100 dark:text-mono-60"
              >
                {props.row.original.serviceCount?.toLocaleString() ??
                  EMPTY_VALUE_PLACEHOLDER}
              </Text>
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('operatorCount', {
        header: () => 'Operators',
        cell: (props) => {
          return (
            <TableCellWrapper className="p-3 min-h-fit">
              <Text
                variant="body1"
                fw="semibold"
                className="text-mono-100 dark:text-mono-60"
              >
                {Number(props.row.original.operatorCount ?? 0).toLocaleString()}
              </Text>
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
