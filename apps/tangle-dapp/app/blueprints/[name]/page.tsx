import { FC } from 'react';

import BlueprintHeader from './BlueprintHeader';
import OperatorsTable from './OperatorsTable';
import VaultsAndAssetsTable from './VaultsAndAssetsTable';

type Props = {
  params: {
    name: string;
  };
};

const BlueprintDetailsPage: FC<Props> = ({ params: { name } }) => {
  return (
    <div className="space-y-5">
      <BlueprintHeader blueprintName={name} />
      <VaultsAndAssetsTable />
      <OperatorsTable />
    </div>
  );
};

export default BlueprintDetailsPage;
