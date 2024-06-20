'use client';

import FeeDetails from '@webb-tools/webb-ui-components/components/FeeDetails';

import useRestakeConsts from '../../../data/restake/useRestakeConsts';

export default function TxDetails() {
  const { bondDuration } = useRestakeConsts();

  return (
    <FeeDetails
      isDefaultOpen
      items={[
        {
          name: 'APY',
          info: 'Restaking Rewards',
        },
        {
          name: 'Withdraw Period',
          info: 'The duration for which the deposited asset is locked.',
          value: bondDuration !== null ? `${bondDuration} eras` : bondDuration,
        },
      ]}
    />
  );
}
