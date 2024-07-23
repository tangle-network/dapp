import FeeDetails from '@webb-tools/webb-ui-components/components/FeeDetails';
import type { FeeItem } from '@webb-tools/webb-ui-components/components/FeeDetails/types';
import { useMemo } from 'react';

import useRestakeConsts from '../../../data/restake/useRestakeConsts';

const TxInfo = () => {
  const { delegationBondLessDelay } = useRestakeConsts();

  const items = useMemo<FeeItem[]>(
    () => [
      // TOOD: Add fee value
      {
        name: 'Fee',
      },
      {
        name: 'Unstake Period',
        value:
          typeof delegationBondLessDelay === 'number'
            ? `${delegationBondLessDelay} rounds`
            : null,
      },
    ],
    [delegationBondLessDelay],
  );

  return <FeeDetails isDisabledBgColor disabled isDefaultOpen items={items} />;
};

export default TxInfo;
