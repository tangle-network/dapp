import {
  Button,
  CopyWithTooltip,
  InputField,
  Typography,
} from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import { RebondTokensProps } from './types';

const UnbondTokens: FC<RebondTokensProps> = ({
  nominatorAddress,
  amountToRebond,
  setAmountToRebond,
  amountToRebondError,
  remainingUnbondedTokensToRebond,
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

      <Typography variant="body1" fw="normal">
        Rebonding allows you to re-stake your tokens that are currently in the
        unbonding process.
      </Typography>
    </div>
  );
};

export default UnbondTokens;
