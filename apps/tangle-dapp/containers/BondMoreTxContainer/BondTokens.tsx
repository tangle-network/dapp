import {
  Button,
  CopyWithTooltip,
  InputField,
  Typography,
} from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import { BondTokensProps } from './types';

const BondTokens: FC<BondTokensProps> = ({
  nominatorAddress,
  amountToBond,
  setAmountToBond,
  amountToBondError,
  amountWalletBalance,
}) => {
  return (
    <div className="flex flex-col gap-9">
      {/* Account */}
      <InputField.Root>
        <InputField.Input
          title="Account"
          isAddressType={true}
          value={nominatorAddress}
          type="text"
          readOnly
        />

        <InputField.Slot>
          <CopyWithTooltip
            textToCopy={nominatorAddress}
            isButton={false}
            iconSize="lg"
            className="text-mono-160 dark:text-mono-80 cursor-pointer"
          />
        </InputField.Slot>
      </InputField.Root>

      {/* Amount */}
      <InputField.Root error={amountToBondError}>
        <InputField.Input
          title="Amount"
          isAddressType={false}
          value={amountToBond.toString()}
          isDisabled={amountWalletBalance > 0 ? false : true}
          placeholder="10 tTNT"
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
