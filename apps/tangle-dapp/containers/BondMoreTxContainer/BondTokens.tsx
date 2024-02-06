import { Button, InputField, Typography } from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import { TANGLE_TOKEN_UNIT } from '../../constants';
import { BondTokensProps } from './types';

const BondTokens: FC<BondTokensProps> = ({
  amountToBond,
  setAmountToBond,
  amountToBondError,
  amountWalletBalance,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Amount */}
      <InputField.Root error={amountToBondError}>
        <InputField.Input
          title="Amount"
          isAddressType={false}
          value={amountToBond.toString()}
          isDisabled={amountWalletBalance > 0 ? false : true}
          placeholder={`10 ${TANGLE_TOKEN_UNIT}`}
          type="number"
          onChange={(e) => setAmountToBond(Number(e.target.value))}
        />

        <InputField.Slot>
          <Button
            variant="utility"
            size="sm"
            isDisabled={amountWalletBalance > 0 ? false : true}
            onClick={() => setAmountToBond(amountWalletBalance)}
          >
            MAX
          </Button>
        </InputField.Slot>
      </InputField.Root>

      <Typography variant="body1" fw="normal">
        Enter the amount you would like to add to your current stake.
      </Typography>
    </div>
  );
};

export default BondTokens;
