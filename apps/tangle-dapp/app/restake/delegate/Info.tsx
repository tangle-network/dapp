import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import FeeDetails from '@webb-tools/webb-ui-components/components/FeeDetails';
import { memo } from 'react';

import useRestakeConsts from '../../../data/restake/useRestakeConsts';

const Info = memo(() => {
  const { leaveDelegatorsDelay } = useRestakeConsts();

  return (
    <FeeDetails
      disabled
      isDefaultOpen
      items={[
        {
          name: 'Unstake period',
          info: 'Number of rounds that delegators remain bonded before the exit request is executable.',
          value: isDefined(leaveDelegatorsDelay)
            ? `${leaveDelegatorsDelay} rounds`
            : leaveDelegatorsDelay,
        },
      ]}
    />
  );
});

Info.displayName = 'Info';

export default Info;
