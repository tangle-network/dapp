import { RegisteredBlueprintsTabs } from './RegisteredBlueprints';
import { InstancesTabs } from './Instances';
import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';
import useMonitoringBlueprints from '@tangle-network/tangle-shared-ui/data/blueprints/useMonitoringBlueprints';
import { FC, useMemo } from 'react';
import useIdentities from '@tangle-network/tangle-shared-ui/hooks/useIdentities';
import useSubstrateAddress from '@tangle-network/tangle-shared-ui/hooks/useSubstrateAddress';
import usePendingServiceRequest from '@tangle-network/tangle-shared-ui/data/blueprints/usePendingServiceRequest';

type BlueprintManagementSectionProps = {
  isOperator: boolean;
};
export const BlueprintManagementSection: FC<
  BlueprintManagementSectionProps
> = ({ isOperator }) => {
  const operatorAccountAddress = useSubstrateAddress();

  const {
    isLoading,
    blueprints: registeredBlueprints,
    error,
  } = useMonitoringBlueprints(operatorAccountAddress);

  const runningInstances = useMemo(() => {
    if (registeredBlueprints.length === 0) {
      return [];
    }
    return registeredBlueprints.flatMap((blueprint) => blueprint.services);
  }, [registeredBlueprints]);

  const { blueprints: pendingBlueprints } = usePendingServiceRequest(
    operatorAccountAddress,
  );

  const { result: operatorIdentityMap } = useIdentities(
    useMemo(() => {
      const operatorMap = pendingBlueprints.flatMap((blueprint) => {
        const approvedOperators = blueprint.approvedOperators ?? [];
        const pendingOperators = blueprint.pendingOperators ?? [];
        return [...approvedOperators, ...pendingOperators];
      });
      const operatorSet = new Set(operatorMap);
      return Array.from(operatorSet);
    }, [pendingBlueprints]),
  );

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
        pendingInstances={{
          data: pendingBlueprints,
          isLoading,
          error,
          isOperator,
          operatorIdentityMap,
        }}
        stoppedInstances={{
          data: [],
          isLoading,
          error,
        }}
      />
    </>
  );
};
