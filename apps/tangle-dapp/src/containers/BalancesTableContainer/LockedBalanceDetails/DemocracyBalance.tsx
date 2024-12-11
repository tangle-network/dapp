import { FC } from 'react';

import useDemocracy from '../../../data/democracy/useDemocracy';
import BalanceCell from '../BalanceCell';

const DemocracyBalance: FC = () => {
  const { lockedBalance: lockedDemocracyBalance, isInDemocracy } =
    useDemocracy();

  if (!isInDemocracy || lockedDemocracyBalance === null) {
    return;
  }

  return <BalanceCell amount={lockedDemocracyBalance} />;
};

export default DemocracyBalance;
