import { RegisteredBlueprintsTabs } from './RegisteredBlueprints';
import { InstancesTabs } from './Instances';
import { FC } from 'react';

export const BlueprintManagementSection: FC = () => {
  return (
    <>
      <RegisteredBlueprintsTabs
        blueprints={[]}
        isLoading={false}
        error={null}
      />
      <InstancesTabs />
    </>
  );
};
