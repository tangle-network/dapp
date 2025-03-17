import { RegisteredBlueprintsTabs } from './RegisteredBlueprints';
import { InstancesTabs } from './Instances';
import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';
import useMonitoringBlueprints from '@tangle-network/tangle-shared-ui/data/blueprints/useMonitoringBlueprints';
import { FC, useMemo } from 'react';
import useIdentities from '@tangle-network/tangle-shared-ui/hooks/useIdentities';

type BlueprintManagementSectionProps = {
  isOperator: boolean;
};
export const BlueprintManagementSection: FC<
  BlueprintManagementSectionProps
> = ({ isOperator }) => {
  const walletAddr = useActiveAccountAddress();

  const { isLoading, blueprints, error } = useMonitoringBlueprints(
    walletAddr?.toString(),
  );

  const runningInstances = useMemo(() => {
    if (blueprints.length === 0) {
      return [];
    }
    return blueprints.flatMap((blueprint) => blueprint.services);
  }, [blueprints]);

  const { result: operatorIdentityMap } = useIdentities(
    useMemo(() => {
      const operatorMap = runningInstances.flatMap((instance) => {
        const approvedOperators = instance.approvedOperators ?? [];
        const pendingOperators = instance.pendingOperators ?? [];
        return [...approvedOperators, ...pendingOperators];
      });
      const operatorSet = new Set(operatorMap);
      return Array.from(operatorSet);
    }, [runningInstances]),
  );

  return (
    <>
      {isOperator && (
        <RegisteredBlueprintsTabs
          blueprints={blueprints}
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
          data: [],
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
