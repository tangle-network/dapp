import { RegisteredBlueprintsTabs } from './RegisteredBlueprints';
import { InstancesTabs } from './Instances';
import { FC } from 'react';
import useOperatorInfo from '../../hooks/useOperatorInfo';

export const BlueprintManagementSection: FC = () => {
  const { isOperator } = useOperatorInfo();

  return (
    <>
      {isOperator && <RegisteredBlueprintsTabs />}
      <InstancesTabs />
    </>
  );
};
