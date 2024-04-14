import {
  DropdownField,
  InputField,
  Typography,
} from '@webb-tools/webb-ui-components';
import { type FC, useCallback } from 'react';
import { z } from 'zod';

import {
  STAKING_PAYEE_TEXT_TO_VALUE_MAP,
  STAKING_PAYEE_VALUE_TO_TEXT_MAP,
} from '../../constants';
import { StakingRewardsDestinationDisplayText } from '../../types';
import { UpdatePayeeProps } from './types';

const UpdatePayee: FC<UpdatePayeeProps> = ({
  currentPayee,
  payeeOptions,
  selectedPayee: payee,
  setSelectedPayee: setPayee,
}) => {
  const handleSetPayee = useCallback(
    (newPayeeString: string) => {
      const payeeDisplayText = z
        .nativeEnum(StakingRewardsDestinationDisplayText)
        .parse(newPayeeString);

      setPayee(STAKING_PAYEE_TEXT_TO_VALUE_MAP[payeeDisplayText]);
    },
    [setPayee]
  );

  const currentPayeeDisplayText: string = (() => {
    if (currentPayee === null) {
      return 'Loading...';
    } else if (currentPayee.value !== null) {
      return STAKING_PAYEE_VALUE_TO_TEXT_MAP[currentPayee.value];
    } else {
      return 'None';
    }
  })();

  return (
    <div className="grid grid-cols-3 gap-9">
      <div className="flex flex-col gap-9 col-span-2">
        {/* Current Destination */}
        <InputField.Root>
          <InputField.Input
            title="Current Destination"
            isAddressType={false}
            value={currentPayeeDisplayText}
            type="text"
            readOnly
          />
        </InputField.Root>

        {/* Payment Destination */}
        <DropdownField
          title="New Destination"
          items={payeeOptions}
          selectedItem={STAKING_PAYEE_VALUE_TO_TEXT_MAP[payee]}
          setSelectedItem={handleSetPayee}
        />
      </div>

      <div className="flex flex-col gap-5 col-span-1">
        <Typography variant="body1" fw="normal">
          Considering redirecting your staking rewards? Use this feature to
          specify a different destination to receive your payouts.
          <br />
          <br />
          Staked - Increases the amount at stake (Auto-compounding)
          <br />
          <br />
          Stash - Does not increase the amount at stake (No Auto-compounding)
        </Typography>
      </div>
    </div>
  );
};

export default UpdatePayee;
