import { getPolkadotApiPromise } from '../../constants';
import { MetricReturnType } from '../../types';

export const getValidatorsCount = async (): Promise<MetricReturnType> => {
  const api = await getPolkadotApiPromise();

  if (!api)
    return {
      value1: NaN,
      value2: NaN,
    };

  try {
    const activeValidators = await api.query.session.validators();
    const activeValidatorsCount = activeValidators.length;

    const overview = await api.derive.staking.overview();
    const totalValidatorsCount = overview.validatorCount;

    return {
      value1: activeValidatorsCount,
      value2: Number(totalValidatorsCount.toString()),
    };
  } catch (e: any) {
    console.error(e);

    return {
      value1: NaN,
      value2: NaN,
    };
  }
};
