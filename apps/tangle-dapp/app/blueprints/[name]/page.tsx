import { FC } from 'react';

import BlueprintHeader from './BlueprintHeader';

export const dynamic = 'force-static';

type Props = {
  params: {
    name: string;
  };
};

const BlueprintDetailsPage: FC<Props> = ({ params: { name } }) => {
  return (
    <div className="space-y-5">
      <BlueprintHeader blueprintName={name} />
    </div>
  );
};

export default BlueprintDetailsPage;
