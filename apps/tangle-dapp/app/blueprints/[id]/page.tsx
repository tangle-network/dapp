import { FC } from 'react';

import BlueprintHeader from './BlueprintHeader';
import OperatorsTable from './OperatorsTable';
import VaultsAndAssetsTable from './VaultsAndAssetsTable';

type Props = {
  params: {
    id: string;
  };
};

const BlueprintDetailsPage: FC<Props> = ({ params: { id } }) => {
  return (
    <div className="space-y-5">
      <BlueprintHeader blueprintId={id} />
      <VaultsAndAssetsTable />
      <OperatorsTable />
    </div>
  );
};

export default BlueprintDetailsPage;
