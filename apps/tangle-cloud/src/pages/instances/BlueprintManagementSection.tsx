import { RegisteredBlueprintsTabs } from './RegisteredBlueprints';
import { InstancesTabs } from './Instances';
import useMonitoringBlueprints from '@tangle-network/tangle-shared-ui/data/blueprints/useMonitoringBlueprints';
import { FC, useMemo } from 'react';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import useRoleStore, { Role } from '../../stores/roleStore';

export const BlueprintManagementSection: FC = () => {
  const role = useRoleStore((store) => store.role);
  const operatorAccountAddress = useSubstrateAddress();

  const {
    isLoading,
    blueprints: registeredBlueprints,
    error,
  } = useMonitoringBlueprints(operatorAccountAddress);

  const isOperator = role === Role.OPERATOR;

  const runningInstances = useMemo(() => {
    if (registeredBlueprints.length === 0) {
      return [];
    }
    return registeredBlueprints.flatMap((blueprint) => blueprint.services);
  }, [registeredBlueprints]);

  return (
    <>
      {isOperator && (
        <RegisteredBlueprintsTabs
          blueprints={registeredBlueprints}
          isLoading={isLoading}
          error={error}
        />
      )}
      <InstancesTabs
        runningInstances={{
          data: runningInstances,
          isLoading,
          error,
        }}
        // TODO: Implement stopped instances
        stoppedInstances={{
          data: [],
          isLoading,
          error,
        }}
      />
    </>
  );
};
