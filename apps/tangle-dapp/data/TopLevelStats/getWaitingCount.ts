import { getPolkadotApi } from '../../constants';

export const getWaitingCount = async (): Promise<number> => {
  const api = await getPolkadotApi();

  if (!api) return NaN;

  try {
    const waitingInfo = await api.derive.staking.waitingInfo();

    return Number(waitingInfo.waiting.length.toString());
  } catch (e: any) {
    console.error(e);

    return NaN;
  }
};
