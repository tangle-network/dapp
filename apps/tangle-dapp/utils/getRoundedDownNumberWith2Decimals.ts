import { getRoundedAmountString } from '@webb-tools/webb-ui-components/utils';

export const getRoundedDownNumberWith2Decimals: (
  number: number | undefined
) => string = (number: number | undefined) => {
  return getRoundedAmountString(number, 2, {
    roundingFunction: Math.floor,
    totalLength: 0,
  });
};
