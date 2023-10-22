import { getPolkadotApi } from '../../constants';
import { MetricReturnType } from '../../types';

export const getWaitingCount = async (): Promise<MetricReturnType> => {
  const api = await getPolkadotApi();

  if (!api)
    return {
      value1: NaN,
    };

  try {
    const waitingInfo = await api.derive.staking.waitingInfo();

    return {
      value1: Number(waitingInfo.waiting.length.toString()),
    };
  } catch (e: any) {
    console.error(e);

    return {
      value1: NaN,
    };
  }
};
