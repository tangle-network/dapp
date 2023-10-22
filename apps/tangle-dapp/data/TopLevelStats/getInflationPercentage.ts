import { BN_ZERO } from '@polkadot/util';

import { getPolkadotApiPromise } from '../../constants';
import { MetricReturnType } from '../../types';
import { calculateInflation } from '../../utils';

export const getInflationPercentage = async (): Promise<MetricReturnType> => {
  const api = await getPolkadotApiPromise();

  if (!api)
    return {
      value1: NaN,
    };

  try {
    const inflation = calculateInflation(api, BN_ZERO, BN_ZERO, BN_ZERO);

    const inflationPercentage = inflation.inflation;

    return {
      value1: inflationPercentage,
    };
  } catch (e: any) {
    console.error(e);

    return {
      value1: NaN,
    };
  }
};
