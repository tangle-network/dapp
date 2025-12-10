import { RegisteredBlueprintsTabs } from './RegisteredBlueprints';
import { InstancesTabs } from './Instances';
import { FC, Dispatch, SetStateAction, useMemo } from 'react';
import { useAccount } from 'wagmi';
import useEvmOperatorInfo from '../../hooks/useEvmOperatorInfo';
import useOperatorStats from '../../data/operators/useOperatorStats';

interface BlueprintManagementSectionProps {
  refreshTrigger: number;
  setRefreshTrigger: Dispatch<SetStateAction<number>>;
}

export const BlueprintManagementSection: FC<
  BlueprintManagementSectionProps
> = ({ refreshTrigger, setRefreshTrigger }) => {
  const { address: accountAddress } = useAccount();
  const { isOperator, operatorAddress } = useEvmOperatorInfo();

  const { result: operatorStatsData } = useOperatorStats(
    isOperator ? operatorAddress ?? undefined : undefined,
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
