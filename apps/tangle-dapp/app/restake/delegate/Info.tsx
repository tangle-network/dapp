import isDefined from '@webb-tools/dapp-types/utils/isDefined';
import FeeDetails from '@webb-tools/webb-ui-components/components/FeeDetails';
import { memo } from 'react';

import useRestakeConsts from '../../../data/restake/useRestakeConsts';

const Info = memo(() => {
  const { leaveDelegatorsDelay, delegationBondLessDelay } = useRestakeConsts();

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
        {
          name: 'Bond less delay',
          info: 'Number of rounds that delegation bond less requests must wait before being executable.',
          value: isDefined(delegationBondLessDelay)
            ? `${delegationBondLessDelay} rounds`
            : delegationBondLessDelay,
        },
      ]}
    />
  );
});

Info.displayName = 'Info';

export default Info;
