import { RegisteredBlueprintsTabs } from './RegisteredBlueprints';
import { InstancesTabs } from './Instances';
import { FC, Dispatch, SetStateAction, useMemo } from 'react';
import useOperatorInfo from '@tangle-network/tangle-shared-ui/hooks/useOperatorInfo';
import { useOperatorStatsData } from '../../data/operators/useOperatorStatsData';
import useActiveAccountAddress from '@tangle-network/tangle-shared-ui/hooks/useActiveAccountAddress';
import { isSubstrateAddress } from '@tangle-network/ui-components';

interface BlueprintManagementSectionProps {
  refreshTrigger: number;
  setRefreshTrigger: Dispatch<SetStateAction<number>>;
}

export const BlueprintManagementSection: FC<
  BlueprintManagementSectionProps
> = ({ refreshTrigger, setRefreshTrigger }) => {
  const { isOperator } = useOperatorInfo();
  const accountAddress = useActiveAccountAddress();

  const { result: operatorStatsData } = useOperatorStatsData(
    useMemo(() => {
      if (
        !accountAddress ||
        !isOperator ||
        !isSubstrateAddress(accountAddress)
      ) {
        return null;
      }

      return accountAddress;
    }, [accountAddress, isOperator]),
    refreshTrigger,
  );

  const hasRegisteredBlueprints = useMemo(() => {
    return operatorStatsData && operatorStatsData.registeredBlueprints > 0;
  }, [operatorStatsData]);

  const shouldShowRegisteredBlueprints = isOperator && hasRegisteredBlueprints;

  return (
    <>
      {shouldShowRegisteredBlueprints && <RegisteredBlueprintsTabs />}
      <InstancesTabs
        refreshTrigger={refreshTrigger}
        setRefreshTrigger={setRefreshTrigger}
      />
    </>
  );
};
