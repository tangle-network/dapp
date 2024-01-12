import { Button, InputField, Typography } from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import { BondedTokensBalanceInfo } from '../../components';
import { RebondTokensProps } from './types';

const UnbondTokens: FC<RebondTokensProps> = ({
  amountToRebond,
  setAmountToRebond,
  amountToRebondError,
  remainingUnbondedTokensToRebond,
  unbondedAmount,
  unbondingAmount,
}) => {
  return (
    <div className="flex flex-col gap-4">
      <Typography variant="body1" fw="normal">
        Rebond to return unbonding or unbonded tokens to staking without
        withdrawing.
      </Typography>

      {/* Amount */}
      <InputField.Root error={amountToRebondError}>
        <InputField.Input
          title="Amount"
          isAddressType={false}
          value={amountToRebond.toString()}
          isDisabled={remainingUnbondedTokensToRebond > 0 ? false : true}
          placeholder={remainingUnbondedTokensToRebond.toString()}
          type="number"
          onChange={(e) => setAmountToRebond(Number(e.target.value))}
        />

        <InputField.Slot>
          <Button
            variant="utility"
            size="sm"
            isDisabled={remainingUnbondedTokensToRebond > 0 ? false : true}
            onClick={() => setAmountToRebond(remainingUnbondedTokensToRebond)}
          >
            MAX
          </Button>
        </InputField.Slot>
      </InputField.Root>

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

export default UnbondTokens;
