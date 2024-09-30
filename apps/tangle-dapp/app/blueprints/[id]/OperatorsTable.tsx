import { Typography } from '@webb-tools/webb-ui-components/typography/Typography';
import type { FC } from 'react';

import OperatorsTableUI from '../../../components/tables/Operators';
import type { Operator } from '../../../types/blueprint';

type Props = {
  blueprintName: string;
  operators: Operator[];
};

const OperatorsTable: FC<Props> = ({ blueprintName, operators }) => {
  return (
    <div className="space-y-5">
      <Typography variant="h4" fw="bold">
        Operators running {blueprintName}
      </Typography>

      <OperatorsTableUI data={operators} />
    </div>
  );
};

export default OperatorsTable;
