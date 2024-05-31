import { DropdownField, Typography } from '@webb-tools/webb-ui-components';
import { type FC, useCallback } from 'react';
import { z } from 'zod';

import {
  STAKING_PAYEE_TEXT_TO_VALUE_MAP,
  STAKING_PAYEE_VALUE_TO_TEXT_MAP,
} from '../../constants';
import { StakingRewardsDestinationDisplayText } from '../../types';
import { UpdatePayeeProps } from './types';

const UpdatePayee: FC<UpdatePayeeProps> = ({
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

  return (
    <div className="flex flex-col gap-4">
      <DropdownField
        title="Payout Destination"
        items={payeeOptions}
        selectedItem={STAKING_PAYEE_VALUE_TO_TEXT_MAP[payee]}
        setSelectedItem={handleSetPayee}
        dropdownBodyClassName="max-w-[344px]"
      />

      <Typography
        variant="body1"
        fw="normal"
        className="!leading-[27px] !tracking-[1%]"
      >
        Your rewards will be automatically reinvested to maximize compounding.
      </Typography>
    </div>
  );
};

export default UpdatePayee;
