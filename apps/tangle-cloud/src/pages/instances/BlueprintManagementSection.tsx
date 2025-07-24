import { RegisteredBlueprintsTabs } from './RegisteredBlueprints';
import { InstancesTabs } from './Instances';
import { FC, Dispatch, SetStateAction } from 'react';
import useOperatorInfo from '@tangle-network/tangle-shared-ui/hooks/useOperatorInfo';

interface BlueprintManagementSectionProps {
  refreshTrigger: number;
  setRefreshTrigger: Dispatch<SetStateAction<number>>;
}

export const BlueprintManagementSection: FC<
  BlueprintManagementSectionProps
> = ({ refreshTrigger, setRefreshTrigger }) => {
  const { isOperator } = useOperatorInfo();

  return (
    <>
      {isOperator && <RegisteredBlueprintsTabs />}
      <InstancesTabs
        refreshTrigger={refreshTrigger}
        setRefreshTrigger={setRefreshTrigger}
      />
    </>
  );
};
