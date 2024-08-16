import FeeDetails from '@webb-tools/webb-ui-components/components/FeeDetails';
import type { FeeItem } from '@webb-tools/webb-ui-components/components/FeeDetails/types';
import { useMemo } from 'react';

import useRestakeConsts from '../../../data/restake/useRestakeConsts';

const TxInfo = () => {
  const { leaveDelegatorsDelay } = useRestakeConsts();

  const items = useMemo<FeeItem[]>(
    () => [
      // TODO: Add fee value
      {
        name: 'Fee',
      },
      {
        name: 'Withdraw Delay',
        value:
          typeof leaveDelegatorsDelay === 'number'
            ? `${leaveDelegatorsDelay} rounds`
            : null,
      },
    ],
    [leaveDelegatorsDelay],
  );

  return <FeeDetails isDisabledBgColor disabled isDefaultOpen items={items} />;
};

export default TxInfo;
