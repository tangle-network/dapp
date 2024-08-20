import { FC } from 'react';

import BlueprintHeader from './BlueprintHeader';
import OperatorsTable from './OperatorsTable';
import TvlTable from './TvlTable';

type Props = {
  params: {
    name: string;
  };
};

const BlueprintDetailsPage: FC<Props> = ({ params: { name } }) => {
  return (
    <div className="space-y-5">
      <BlueprintHeader blueprintName={name} />
      <TvlTable />
      <OperatorsTable />
    </div>
  );
};

export default BlueprintDetailsPage;
