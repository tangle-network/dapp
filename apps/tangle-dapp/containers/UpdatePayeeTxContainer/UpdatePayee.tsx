import {
  DropdownField,
  InputField,
  Typography,
} from '@webb-tools/webb-ui-components';
import { type FC } from 'react';

import { UpdatePayeeProps } from './types';

const UpdatePayee: FC<UpdatePayeeProps> = ({
  currentPayee,
  paymentDestinationOptions,
  paymentDestination,
  setPaymentDestination,
}) => {
  return (
    <div className="grid grid-cols-3 gap-9">
      <div className="flex flex-col gap-9 col-span-2">
        {/* Current Destination */}
        <InputField.Root>
          <InputField.Input
            title="Current Destination"
            isAddressType={false}
            value={currentPayee}
            type="text"
            readOnly
          />
        </InputField.Root>

        {/* Payment Destination */}
        <DropdownField
          title="New Destination"
          items={paymentDestinationOptions}
          selectedItem={paymentDestination}
          setSelectedItem={setPaymentDestination}
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
