import { BN_ZERO } from '@polkadot/util';

import { getPolkadotApiPromise } from '../../constants';
import { MetricReturnType } from '../../types';
import { calculateInflation } from '../../utils';

export const getIdealStakedPercentage = async (): Promise<MetricReturnType> => {
  const api = await getPolkadotApiPromise();

  if (!api)
    return {
      value1: NaN,
    };

  try {
    const inflation = calculateInflation(api, BN_ZERO, BN_ZERO, BN_ZERO);

    const idealStakePercentage = inflation.idealStake * 100;

    return {
      value1: idealStakePercentage,
    };
  } catch (e) {
    console.error(e);

    return {
      value1: NaN,
    };
  }
};
