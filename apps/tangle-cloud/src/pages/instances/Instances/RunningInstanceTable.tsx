import { useMemo, useState, useCallback, type FC } from 'react';
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
  Modal,
} from '@tangle-network/ui-components';
import pluralize from '@tangle-network/ui-components/utils/pluralize';
import { TangleCloudTable } from '../../../components/tangleCloudTable/TangleCloudTable';

import { ChevronRight } from '@tangle-network/icons';
import TableCellWrapper from '@tangle-network/tangle-shared-ui/components/tables/TableCellWrapper';
import { Link } from 'react-router';
import { PagePath } from '../../../types';
import { MonitoringBlueprint } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';
import useOperatorInfo from '@tangle-network/tangle-shared-ui/hooks/useOperatorInfo';
import useMonitoringBlueprints from '@tangle-network/tangle-shared-ui/data/blueprints/useMonitoringBlueprints';
import useServicesTerminateTx from '../../../data/services/useServicesTerminateTx';
import TerminateConfirmationModal from './UpdateBlueprintModel/TerminateConfirmationModal';
import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';
import useUserOwnedInstances from '../../../data/services/useUserOwnedInstances';
import { isSubstrateAddress } from '@tangle-network/ui-components';
import { encodeAddress, decodeAddress } from '@polkadot/util-crypto';

const columnHelper =
  createColumnHelper<MonitoringBlueprint['services'][number]>();

export const RunningInstanceTable: FC = () => {
  const { operatorAddress, isOperator } = useOperatorInfo();
  const currentUserAddress = useActiveAccountAddress();

  const userSubstrateAddress =
    currentUserAddress && isSubstrateAddress(currentUserAddress)
      ? currentUserAddress
      : null;

  const {
    isLoading: operatorLoading,
    result: operatorBlueprints,
    error: operatorError,
  } = useMonitoringBlueprints(isOperator ? operatorAddress : null);

  const {
    isLoading: userLoading,
    result: userOwnedBlueprints,
    error: userError,
  } = useUserOwnedInstances(userSubstrateAddress);

  const isLoading = operatorLoading || userLoading;
  const error = operatorError || userError;

  const registeredBlueprints_ = useMemo(() => {
    const combined: MonitoringBlueprint[] = [];
    const seenBlueprintIds = new Set<string>();

    if (operatorBlueprints && Array.isArray(operatorBlueprints)) {
      operatorBlueprints.forEach((blueprint: MonitoringBlueprint) => {
        const id = blueprint.blueprintId.toString();
        if (!seenBlueprintIds.has(id)) {
          combined.push(blueprint);
          seenBlueprintIds.add(id);
        }
      });
    }

    if (userOwnedBlueprints && Array.isArray(userOwnedBlueprints)) {
      userOwnedBlueprints.forEach((userBlueprint: MonitoringBlueprint) => {
        const id = userBlueprint.blueprintId.toString();
        const existingBlueprintIndex = combined.findIndex(
          (bp) => bp.blueprintId.toString() === id,
        );

        if (existingBlueprintIndex >= 0) {
          const existingBlueprint = combined[existingBlueprintIndex];
          const existingServiceIds = new Set(
            existingBlueprint.services.map((s) => s.id.toString()),
          );

          userBlueprint.services.forEach((service) => {
            if (!existingServiceIds.has(service.id.toString())) {
              existingBlueprint.services.push(service);
            }
          });
        } else {
          combined.push(userBlueprint);
        }
      });
    }

    return combined;
  }, [operatorBlueprints, userOwnedBlueprints]);

  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<
    MonitoringBlueprint['services'][number] | null
  >(null);

  const { execute: terminateServiceInstance, status: terminateStatus } =
    useServicesTerminateTx();

  const runningInstances = useMemo(() => {
    const blueprints = registeredBlueprints_ as
      | MonitoringBlueprint[]
      | undefined;

    if (!blueprints?.length) {
      return [];
    }

    return blueprints.flatMap(
      (blueprint: MonitoringBlueprint) => blueprint.services,
    );
  }, [registeredBlueprints_]);

  const isEmpty = runningInstances.length === 0;

  const handleTerminateClick = useCallback(
    (instance: MonitoringBlueprint['services'][number]) => {
      setSelectedInstance(instance);
      setIsTerminateModalOpen(true);
    },
    [],
  );

  const handleCloseTerminateModal = useCallback(() => {
    setIsTerminateModalOpen(false);
    setSelectedInstance(null);
  }, []);

  const handleConfirmTerminate = useCallback(async () => {
    if (!selectedInstance || !terminateServiceInstance) return;

    await terminateServiceInstance({
      instanceId: selectedInstance.id,
    });
  }, [selectedInstance, terminateServiceInstance]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: () => 'Blueprint > Instance',
        enableSorting: false,
        cell: (props) => {
          return (
            <TableCellWrapper className="p-0 min-h-fit">
              <div className="flex items-center gap-2 w-11/12">
                {props.row.original.blueprintData?.metadata?.logo ? (
                  <Avatar
                    size="lg"
                    className="min-w-12"
                    src={props.row.original.blueprintData.metadata?.logo}
                    alt={props.row.original.id.toString()}
                    sourceVariant="uri"
                  />
                ) : (
                  <Avatar
                    size="lg"
                    className="min-w-12"
                    value={props.row.original.id.toString()}
                    theme="substrate"
                  />
                )}
                <div className="w-4/12">
                  <Typography
                    variant="body1"
                    fw="bold"
                    className="!text-blue-50 text-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    {props.row.original.blueprintData?.metadata?.author || ''}
                  </Typography>
                  <Typography
                    variant="body2"
                    fw="normal"
                    className="!text-mono-100 text-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    {props.row.original.blueprintData?.metadata?.name || ''}
                  </Typography>
                </div>
                <div>
                  <ChevronRight className="w-6 h-6" />
                </div>
                <div className="w-4/12">
                  <Typography
                    variant="body1"
                    fw="bold"
                    className="!text-blue-50 text-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    {props.row.original.id
                      ? `Instance-${props.row.original.id}`
                      : EMPTY_VALUE_PLACEHOLDER}
                  </Typography>
                  <Typography
                    variant="body2"
                    fw="normal"
                    className="!text-mono-100 text-ellipsis whitespace-nowrap overflow-hidden"
                  >
                    {props.row.original.externalInstanceId ||
                      EMPTY_VALUE_PLACEHOLDER}
                  </Typography>
                </div>
              </div>
            </TableCellWrapper>
          );
        },
      }),
      columnHelper.accessor('id', {
        header: () => '',
        cell: (props) => {
          const serviceOwnerAddress = props.row.original.ownerAccount;

          let isOwner = false;
          try {
            const normalizedOwner = encodeAddress(
              decodeAddress(serviceOwnerAddress),
            );
            const normalizedUser = currentUserAddress
              ? encodeAddress(decodeAddress(currentUserAddress))
              : null;
            isOwner = normalizedOwner === normalizedUser;
            console.log('Terminate button check:', {
              serviceOwnerAddress,
              currentUserAddress,
              normalizedOwner,
              normalizedUser,
              isOwner,
            });
          } catch (error) {
            console.error(
              'Address normalization error in terminate button:',
              error,
            );
            isOwner = currentUserAddress === serviceOwnerAddress;
          }

          return (
            <TableCellWrapper removeRightBorder className="p-0 min-h-fit">
              <div className="flex gap-2">
                <Link
                  to={PagePath.BLUEPRINTS_DETAILS.replace(
                    ':id',
                    props.row.original.blueprint.toString(),
                  )}
                  onClick={(event) => {
                    event.stopPropagation();
                  }}
                >
                  <Button variant="utility" className="uppercase body4">
                    View
                  </Button>
                </Link>

                {isOwner && (
                  <Button
                    variant="utility"
                    className="uppercase body4 !bg-red-400 !text-white hover:!bg-red-500"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleTerminateClick(props.row.original);
                    }}
                  >
                    Terminate
                  </Button>
                )}
              </div>
            </TableCellWrapper>
          );
        },
      }),
    ],
    [handleTerminateClick, currentUserAddress],
  );

  const table = useReactTable({
    data: runningInstances,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) =>
      `RunningInstance-${row.blueprint.toString()}-${row.id.toString()}`,
    autoResetPageIndex: false,
    enableSortingRemoval: false,
  });

  return (
    <>
      <TangleCloudTable<MonitoringBlueprint['services'][number]>
        title={pluralize('Running Instance', !isEmpty)}
        data={runningInstances}
        error={error}
        isLoading={isLoading}
        tableProps={table}
        tableConfig={{
          tableClassName: 'min-w-[1000px]',
        }}
      />

      <Modal open={isTerminateModalOpen} onOpenChange={setIsTerminateModalOpen}>
        <TerminateConfirmationModal
          onClose={handleCloseTerminateModal}
          onConfirm={handleConfirmTerminate}
          selectedInstance={selectedInstance}
          status={terminateStatus}
        />
      </Modal>
    </>
  );
};

RunningInstanceTable.displayName = 'RunningInstanceTable';
