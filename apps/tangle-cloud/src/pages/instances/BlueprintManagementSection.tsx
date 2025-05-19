import { RegisteredBlueprintsTabs } from './RegisteredBlueprints';
import { InstancesTabs } from './Instances';
import { FC } from 'react';
import useOperatorInfo from '@tangle-network/tangle-shared-ui/hooks/useOperatorInfo';

export const BlueprintManagementSection: FC = () => {
  const { isOperator } = useOperatorInfo();

  return (
    <>
      {isOperator && <RegisteredBlueprintsTabs />}
      <InstancesTabs />
    </>
  );
};
