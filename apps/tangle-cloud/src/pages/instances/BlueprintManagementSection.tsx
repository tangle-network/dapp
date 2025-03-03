import { RegisteredBlueprintsTabs } from './RegisteredBlueprints';
import { InstancesTabs } from './Instances';
import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';
// TODO
// import useOperatorBlueprints from '@tangle-network/tangle-shared-ui/data/blueprints/useOperatorBlueprints';
import useFakeMonitoringBlueprints from '@tangle-network/tangle-shared-ui/data/blueprints/useFakeMonitoringBlueprints';

export const BlueprintManagementSection = () => {
  const walletAddr = useActiveAccountAddress();
  // TODO
  // const { isLoading, blueprints, error } = useOperatorBlueprints(walletAddr?.toString());
  const { blueprints, isLoading, error } = useFakeMonitoringBlueprints(
    walletAddr?.toString(),
  );

  return (
    <>
      <RegisteredBlueprintsTabs
        blueprints={blueprints}
        isLoading={isLoading}
        error={error}
      />
      <InstancesTabs />
    </>
  );
};
