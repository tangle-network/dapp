import { FC } from 'react';

import BlueprintHeader from './BlueprintHeader';
import OperatorsTable from './OperatorsTable';

type Props = {
  params: {
    id: string;
  };
};

const BlueprintDetailsPage: FC<Props> = ({ params: { id } }) => {
  return (
    <div className="space-y-5">
      <BlueprintHeader blueprintId={id} />
      <OperatorsTable />
    </div>
  );
};

export default BlueprintDetailsPage;
