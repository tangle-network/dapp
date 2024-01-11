import {
  Button,
  CopyWithTooltip,
  InputField,
  Typography,
} from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import { UnbondTokensProps } from './types';

const UnbondTokens: FC<UnbondTokensProps> = ({
  nominatorAddress,
  amountToUnbond,
  setAmountToUnbond,
  amountToUnbondError,
  remainingStakedBalanceToUnbond,
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
        become available. You can check the remaining eras for your funds to
        become available in the Unbonding tTNT tooltip.
      </Typography>
    </div>
  );
};

export default UnbondTokens;
