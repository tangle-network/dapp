import { getRoundedAmountString } from '@webb-tools/webb-ui-components/utils';

const getRoundedDownNumberWith2Decimals = (number: number | undefined) => {
  return getRoundedAmountString(number, 2, {
    roundingFunction: Math.floor,
    totalLength: 0,
  });
};

export default getRoundedDownNumberWith2Decimals;
