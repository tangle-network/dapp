import { Button, InputField, Typography } from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import { UnbondTokensProps } from './types';

const UnbondTokens: FC<UnbondTokensProps> = ({
  amountToUnbond,
  setAmountToUnbond,
  amountToUnbondError,
  remainingStakedBalanceToUnbond,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Amount */}
      <InputField.Root error={amountToUnbondError}>
        <InputField.Input
          title="Amount"
          isAddressType={false}
          value={amountToUnbond.toString()}
          isDisabled={remainingStakedBalanceToUnbond > 0 ? false : true}
          placeholder={remainingStakedBalanceToUnbond.toString()}
          type="number"
          onChange={(e) => setAmountToUnbond(Number(e.target.value))}
        />

        <InputField.Slot>
          <Button
            variant="utility"
            size="sm"
            isDisabled={remainingStakedBalanceToUnbond > 0 ? false : true}
            onClick={() => setAmountToUnbond(remainingStakedBalanceToUnbond)}
          >
            MAX
          </Button>
        </InputField.Slot>
      </InputField.Root>

      <Typography variant="body1" fw="normal">
        Once unbonding, you must wait certain number of eras for your funds to
        become available.
      </Typography>

      <Typography variant="body1" fw="normal">
        You can check the remaining eras for your funds to become available in
        the Unbonding tTNT tooltip.
      </Typography>
    </div>
  );
};

export default UnbondTokens;
