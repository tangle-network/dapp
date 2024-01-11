import { Typography } from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import { BondedTokensBalanceInfo } from '../../components';
import { WithdrawUnbondedProps } from './types';

const WithdrawUnbonded: FC<WithdrawUnbondedProps> = ({
  unbondedAmount,
  unbondingAmount,
}) => {
  return (
    <div className="flex flex-col gap-6">
      <Typography variant="body1" fw="normal">
        {`Upon successful withdrawal, the funds will be moved from the 'unbonded' state to your account's available balance.`}
      </Typography>

      <div className="flex flex-col gap-2">
        <BondedTokensBalanceInfo
          type="unbonded"
          value={unbondedAmount.toString()}
        />

        <BondedTokensBalanceInfo
          type="unbonding"
          value={unbondingAmount.toString()}
        />
      </div>
    </div>
  );
};

export default WithdrawUnbonded;
