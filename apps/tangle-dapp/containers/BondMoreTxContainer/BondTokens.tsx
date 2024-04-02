import { Button, InputField, Typography } from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import useNetworkStore from '../../context/useNetworkStore';
import { BondTokensProps } from './types';

const BondTokens: FC<BondTokensProps> = ({
  amountToBond,
  setAmountToBond,
  amountToBondError,
  amountWalletBalance,
}) => {
  const { nativeTokenSymbol } = useNetworkStore();

  return (
    <div className="flex flex-col gap-4">
      {/* Amount */}
      <InputField.Root error={amountToBondError}>
        <InputField.Input
          title="Amount"
          isAddressType={false}
          value={amountToBond.toString()}
          isDisabled={amountWalletBalance > 0 ? false : true}
          placeholder={`10 ${nativeTokenSymbol}`}
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
        Added stake will be bonded and subject to unbonding period before withdrawal is possible.
      </Typography>
    </div>
  );
};

export default BondTokens;
