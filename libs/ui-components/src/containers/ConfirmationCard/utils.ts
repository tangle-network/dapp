import { getRoundedAmountString } from '../../utils';

export const formatTokenAmount = (amount: number | undefined) => {
  return getRoundedAmountString(amount, 5, {
    roundingFunction: Math.round,
  });
};
