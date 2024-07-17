// This will override global types and provide type definitions for
// the `lstMinting` pallet.
import '@webb-tools/tangle-restaking-types';

import { Alert } from '@webb-tools/webb-ui-components';
import { FC } from 'react';

import { LiquidStakingCurrency } from '../../constants/liquidStaking';
import useOngoingTimeUnit from '../../data/liquidStaking/useOngoingTimeUnit';

export type OngoingTimeUnitUnstakeCheckProps = {
  currency: LiquidStakingCurrency;
};

const OngoingTimeUnitUnstakeCheck: FC<OngoingTimeUnitUnstakeCheckProps> = ({
  currency,
}) => {
  const { result: ongoingTimeUnitOpt } = useOngoingTimeUnit(currency, false);

  // Data not available yet or warning not applicable.
  if (ongoingTimeUnitOpt === null || ongoingTimeUnitOpt.isSome) {
    return null;
  }

  // In case that there is no defined ongoing time unit for the
  // given currency, return a warning message.
  return (
    <Alert
      type="warning"
      className="mt-4"
      description="There is no ongoing time unit defined for this token, and it cannot be redeemed yet. Please contact the Tangle team for more information."
    />
  );
};

export default OngoingTimeUnitUnstakeCheck;
