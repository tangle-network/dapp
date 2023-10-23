import { getPolkadotApiPromise } from '../../constants';
import { MetricReturnType } from '../../types';

export const getWaitingCount = async (): Promise<MetricReturnType> => {
  const api = await getPolkadotApiPromise();

  if (!api)
    return {
      value1: NaN,
    };

  try {
    const waitingInfo = await api.derive.staking.waitingInfo();

    return {
      value1: waitingInfo.waiting.length,
    };
  } catch (e) {
    console.error(e);

    return {
      value1: NaN,
    };
  }
};
