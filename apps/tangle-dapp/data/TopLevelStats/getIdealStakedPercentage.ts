import { getPolkadotApi } from '../../constants';
import { BN_ZERO } from '@polkadot/util';
import { calculateInflation } from '../../utils';
import { MetricReturnType } from '../../types';

export const getIdealStakedPercentage = async (): Promise<MetricReturnType> => {
  const api = await getPolkadotApi();

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
  } catch (e: any) {
    console.error(e);

    return {
      value1: NaN,
    };
  }
};
