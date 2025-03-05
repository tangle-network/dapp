import { RegisteredBlueprintsTabs } from './RegisteredBlueprints';
import { InstancesTabs } from './Instances';
import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';
// TODO
// import useOperatorBlueprints from '@tangle-network/tangle-shared-ui/data/blueprints/useOperatorBlueprints';
import useFakeMonitoringBlueprints from '@tangle-network/tangle-shared-ui/data/blueprints/useFakeMonitoringBlueprints';
import { InstanceStatus } from '@tangle-network/tangle-shared-ui/data/blueprints/utils/type';
import { useMemo } from 'react';

export const BlueprintManagementSection = () => {
  const walletAddr = useActiveAccountAddress();
  // TODO
  // const { isLoading, blueprints, error } = useOperatorBlueprints(walletAddr?.toString());
  const { blueprints, isLoading, error } = useFakeMonitoringBlueprints(
    walletAddr?.toString(),
  );
  const services = useMemo(
    () => blueprints.flatMap((blueprint) => blueprint.services),
    [blueprints],
  );

  return (
    <>
      <RegisteredBlueprintsTabs
        blueprints={blueprints}
        isLoading={isLoading}
        error={error}
      />
      <InstancesTabs
        runningInstances={{
          data: services.filter(
            (service) => service.status === InstanceStatus.RUNNING,
          ),
          isLoading,
          error,
        }}
        pendingInstances={{
          data: services.filter(
            (service) => service.status === InstanceStatus.PENDING,
          ),
          isLoading,
          error,
        }}
        stoppedInstances={{
          data: services.filter(
            (service) => service.status === InstanceStatus.STOPPED,
          ),
          isLoading,
          error,
        }}
      />
    </>
  );
};
